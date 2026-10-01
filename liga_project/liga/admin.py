from django.contrib import admin

from .models import ArchivoJugador, Categoria, Equipo, Jugador, Listado, ListadoJugador


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "edad_min", "edad_max", "color_principal", "orden")
    ordering = ("orden",)


@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria", "entrenador")
    list_filter = ("categoria",)
    search_fields = ("nombre", "entrenador")


@admin.register(Jugador)
class JugadorAdmin(admin.ModelAdmin):
    list_display = (
        "id_escolar", "nombre_completo", "categoria", "equipo",
        "fecha_nacimiento", "edad_actual", "activo",
    )
    list_filter = ("categoria", "equipo", "activo")
    search_fields = ("nombre_completo", "id_escolar")
    autocomplete_fields = ("equipo",)

    @admin.display(description="Edad actual")
    def edad_actual(self, obj):
        return obj.edad


@admin.register(ArchivoJugador)
class ArchivoJugadorAdmin(admin.ModelAdmin):
    list_display = ("jugador", "nombre", "subido_en")
    list_filter = ("jugador",)


@admin.register(Listado)
class ListadoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria_principal", "creado_en", "actualizado_en")
    list_filter = ("categoria_principal",)
    search_fields = ("nombre",)


@admin.register(ListadoJugador)
class ListadoJugadorAdmin(admin.ModelAdmin):
    list_display = ("listado", "jugador", "orden")
    list_filter = ("listado",)
    search_fields = ("listado__nombre", "jugador__nombre_completo", "jugador__id_escolar")
