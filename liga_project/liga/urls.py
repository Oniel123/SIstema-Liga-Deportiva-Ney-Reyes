from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categorias", views.CategoriaViewSet)
router.register("equipos", views.EquipoViewSet)
router.register("jugadores", views.JugadorViewSet)
router.register("archivos-jugador", views.ArchivoJugadorViewSet)
router.register("listados", views.ListadoViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/heartbeat/", views.heartbeat, name="heartbeat"),
    path("pdf/roster/", views.generar_pdf_roster, name="pdf-roster"),
    path("pdf/listado/<int:listado_id>/", views.generar_pdf_listado, name="pdf-listado"),
]
