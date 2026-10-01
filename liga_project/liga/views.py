import io
import mimetypes
import os

from django.conf import settings
from django.contrib.staticfiles import finders
from django.db.models import Q
from django.db.models.deletion import ProtectedError
from django.http import FileResponse, HttpResponse
from django.template.loader import render_to_string
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from xhtml2pdf import pisa

from .apps import registrar_heartbeat
from .models import ArchivoJugador, Categoria, Equipo, Jugador, Listado, ListadoJugador
from .serializers import (
    ArchivoJugadorSerializer,
    CategoriaSerializer,
    EquipoSerializer,
    JugadorSerializer,
    ListadoSerializer,
    ListadoDetalleSerializer,
)

FRONTEND_DIST = settings.BASE_DIR / "frontend_dist"


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": "No se puede eliminar: hay equipos o jugadores asociados a esta categoría."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.select_related("categoria").all()
    serializer_class = EquipoSerializer
    filterset_fields = ["categoria"]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": "No se puede eliminar: hay jugadores asociados a este equipo."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class JugadorViewSet(viewsets.ModelViewSet):
    queryset = Jugador.objects.select_related("categoria", "equipo").all()
    serializer_class = JugadorSerializer
    filterset_fields = ["categoria", "equipo", "activo"]

    def get_queryset(self):
        queryset = super().get_queryset()

        busqueda = self.request.query_params.get("search", "").strip()

        if busqueda:
            queryset = queryset.filter(
                Q(nombre_completo__icontains=busqueda)
                | Q(id_escolar__icontains=busqueda)
            )

        return queryset


class ArchivoJugadorViewSet(viewsets.ModelViewSet):
    queryset = ArchivoJugador.objects.select_related("jugador").all()
    serializer_class = ArchivoJugadorSerializer
    filterset_fields = ["jugador"]


class ListadoViewSet(viewsets.ModelViewSet):
    queryset = Listado.objects.select_related("categoria_principal").prefetch_related(
        "items__jugador__categoria", "items__jugador__equipo"
    )
    serializer_class = ListadoSerializer

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ListadoDetalleSerializer
        return ListadoSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        listado = serializer.save()
        return Response(
            ListadoDetalleSerializer(listado, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def _siguiente_orden(listado):
        ultimo = listado.items.order_by("-orden").first()
        return (ultimo.orden + 1) if ultimo else 1

    @staticmethod
    def _agregar_jugadores(listado, jugadores):
        existentes = set(
            listado.items.values_list("jugador_id", flat=True)
        )
        orden = ListadoViewSet._siguiente_orden(listado)
        agregados = 0

        for jugador in jugadores:
            if jugador.id in existentes:
                continue
            ListadoJugador.objects.create(
                listado=listado,
                jugador=jugador,
                orden=orden,
            )
            existentes.add(jugador.id)
            orden += 1
            agregados += 1

        return agregados

    @staticmethod
    def _detalle(listado, request):
        listado.refresh_from_db()
        return ListadoDetalleSerializer(
            listado, context={"request": request}
        ).data

    @action(detail=True, methods=["post"], url_path="agregar-jugadores")
    def agregar_jugadores(self, request, pk=None):
        listado = self.get_object()
        ids = request.data.get("jugadores", [])

        if not isinstance(ids, list):
            return Response(
                {"detail": "El campo jugadores debe ser una lista de IDs."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        jugadores = list(
            Jugador.objects.filter(id__in=ids).select_related("categoria", "equipo")
        )
        encontrados = {j.id for j in jugadores}
        faltantes = [str(jid) for jid in ids if jid not in encontrados]

        agregados = self._agregar_jugadores(listado, jugadores)

        return Response({
            "agregados": agregados,
            "faltantes": faltantes,
            "listado": self._detalle(listado, request),
        })

    @action(detail=True, methods=["post"], url_path="agregar-categoria")
    def agregar_categoria(self, request, pk=None):
        listado = self.get_object()
        categoria_id = request.data.get("categoria")

        try:
            categoria = Categoria.objects.get(pk=categoria_id)
        except (Categoria.DoesNotExist, TypeError, ValueError):
            return Response(
                {"detail": "La categoría indicada no existe."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        jugadores = Jugador.objects.filter(
            categoria=categoria, activo=True
        ).select_related("categoria", "equipo")

        agregados = self._agregar_jugadores(listado, jugadores)

        return Response({
            "agregados": agregados,
            "categoria": categoria.nombre,
            "listado": self._detalle(listado, request),
        })

    @action(detail=True, methods=["delete"], url_path=r"jugadores/(?P<jugador_id>\d+)")
    def eliminar_jugador(self, request, pk=None, jugador_id=None):
        listado = self.get_object()
        eliminado, _ = ListadoJugador.objects.filter(
            listado=listado, jugador_id=jugador_id
        ).delete()

        if not eliminado:
            return Response(
                {"detail": "El jugador no pertenece a este listado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(self._detalle(listado, request))

    @action(detail=True, methods=["delete"], url_path="vaciar")
    def vaciar(self, request, pk=None):
        listado = self.get_object()
        listado.items.all().delete()
        return Response(self._detalle(listado, request))


def heartbeat(request):
    """
    El frontend llama a esto cada pocos segundos mientras está abierto.
    Si estas señales dejan de llegar (se cerró el navegador), el hilo
    vigilante de liga/apps.py apaga el servidor solo.
    """
    registrar_heartbeat()
    return HttpResponse("ok")


def _resolver_recursos(uri, rel):
    """
    xhtml2pdf no entiende las URLs de Django (/static/, /media/) por sí solo:
    hay que traducirlas a una ruta real del disco duro.
    """
    if uri.startswith(settings.STATIC_URL):
        ruta = finders.find(
            uri.replace(settings.STATIC_URL, "")
        )
    elif uri.startswith(settings.MEDIA_URL):
        ruta = os.path.join(
            settings.MEDIA_ROOT,
            uri.replace(settings.MEDIA_URL, "")
        )
    else:
        return uri

    if not ruta:
        raise Exception(f"No se pudo resolver el recurso: {uri}")

    return ruta


def generar_pdf_roster(request):
    """
    Genera el PDF del listado de jugadores agrupados por categoría.
    La edad se calcula en el momento del render (ver Jugador.edad),
    así que el mismo botón siempre produce un PDF con la edad actual,
    sin importar cuándo se imprima.

    Acepta un parámetro opcional ?categoria=<id> para generar el PDF
    de una sola categoría en vez de todas.
    """
    categorias = (
        Categoria.objects
        .prefetch_related("jugadores")
        .all()
        .order_by("orden")
    )

    categoria_id = request.GET.get("categoria")

    if categoria_id:
        categorias = categorias.filter(id=categoria_id)

    html_string = render_to_string(
        "liga/pdf_roster.html",
        {
            "categorias": categorias,
        }
    )

    buffer = io.BytesIO()

    resultado = pisa.CreatePDF(
        html_string,
        dest=buffer,
        link_callback=_resolver_recursos,
    )

    if resultado.err:
        return HttpResponse(
            "Ocurrió un error generando el PDF.",
            status=500,
        )

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/pdf",
    )

    response["Content-Disposition"] = (
        'inline; filename="liga_ney_reyes.pdf"'
    )

    return response


def generar_pdf_listado(request, listado_id):
    try:
        listado = (
            Listado.objects
            .select_related("categoria_principal")
            .prefetch_related("items__jugador__categoria", "items__jugador__equipo")
            .get(pk=listado_id)
        )
    except Listado.DoesNotExist:
        return HttpResponse("El listado no existe.", status=404)

    html_string = render_to_string(
        "liga/pdf_listado.html",
        {"listado": listado},
    )

    buffer = io.BytesIO()
    resultado = pisa.CreatePDF(
        html_string,
        dest=buffer,
        link_callback=_resolver_recursos,
    )

    if resultado.err:
        return HttpResponse(
            "Ocurrió un error generando el PDF.",
            status=500,
        )

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/pdf",
    )
    response["Content-Disposition"] = (
        f'inline; filename="listado_{listado.id}.pdf"'
    )
    return response


def frontend_catch_all(request, path=""):
    """
    Sirve el frontend de Ionic ya compilado (carpeta frontend_dist/,
    generada con `npm run build` en liga_frontend y copiada aquí).

    - Si la ruta pedida coincide con un archivo real (main.js, styles.css,
      assets/logo.png, etc.), lo sirve directo.
    - Si no coincide con ningún archivo (ej: /jugadores, /equipos), sirve
      index.html y deja que el router de Angular decida qué mostrar.
    - Si frontend_dist todavía no existe, avisa cómo generarlo.
    """
    candidato = FRONTEND_DIST / path

    if path and candidato.is_file():
        content_type, _ = mimetypes.guess_type(str(candidato))

        return FileResponse(
            open(candidato, "rb"),
            content_type=content_type,
        )

    index_path = FRONTEND_DIST / "index.html"

    if index_path.exists():
        return FileResponse(
            open(index_path, "rb"),
            content_type="text/html",
        )

    return HttpResponse(
        "El frontend todavía no se ha compilado. Corre construir_frontend.bat "
        "primero (ver INSTRUCCIONES.md).",
        status=501,
    )