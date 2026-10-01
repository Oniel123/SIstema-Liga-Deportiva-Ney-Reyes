import os

from rest_framework import serializers

from .models import ArchivoJugador, Categoria, Equipo, Jugador, Listado, ListadoJugador


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre", "edad_min", "edad_max", "color_principal", "orden"]


class EquipoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)

    class Meta:
        model = Equipo
        fields = ["id", "nombre", "categoria", "categoria_nombre", "entrenador"]


class JugadorSerializer(serializers.ModelSerializer):
    # Estos dos campos no existen como columnas en la base de datos:
    # se calculan en cada request a partir de fecha_nacimiento.
    edad = serializers.ReadOnlyField()
    año_nacimiento = serializers.ReadOnlyField()
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    equipo_nombre = serializers.CharField(source="equipo.nombre", read_only=True)

    class Meta:
        model = Jugador
        fields = [
            "id", "id_escolar", "nombre_completo", "fecha_nacimiento", "edad", "año_nacimiento",
            "numero_camiseta", "equipo", "equipo_nombre",
            "categoria", "categoria_nombre", "foto", "activo",
        ]


class ArchivoJugadorSerializer(serializers.ModelSerializer):
    nombre_archivo = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = ArchivoJugador
        fields = ["id", "jugador", "archivo", "nombre", "nombre_archivo", "url", "subido_en"]
        read_only_fields = ["subido_en"]
        extra_kwargs = {"archivo": {"write_only": True}}

    def get_nombre_archivo(self, obj):
        return os.path.basename(obj.archivo.name)

    def get_url(self, obj):
        request = self.context.get("request")
        url = obj.archivo.url
        return request.build_absolute_uri(url) if request else url


class ListadoJugadorSerializer(serializers.ModelSerializer):
    jugador = JugadorSerializer(read_only=True)

    class Meta:
        model = ListadoJugador
        fields = ["id", "jugador", "orden"]


class ListadoSerializer(serializers.ModelSerializer):
    categoria_principal_nombre = serializers.CharField(
        source="categoria_principal.nombre", read_only=True
    )
    jugadores_count = serializers.SerializerMethodField()

    def get_jugadores_count(self, obj):
        return obj.jugadores.count()

    class Meta:
        model = Listado
        fields = [
            "id", "nombre", "categoria_principal", "categoria_principal_nombre",
            "jugadores_count", "creado_en", "actualizado_en",
        ]


class ListadoDetalleSerializer(ListadoSerializer):
    items = ListadoJugadorSerializer(many=True, read_only=True)

    class Meta(ListadoSerializer.Meta):
        fields = ListadoSerializer.Meta.fields + ["items"]
