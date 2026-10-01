from datetime import date

from django.db import models


class Categoria(models.Model):
    """Categoría por rango de edad, ej: '12-13', '14-15'."""
    nombre = models.CharField(max_length=50, unique=True)
    edad_min = models.PositiveSmallIntegerField()
    edad_max = models.PositiveSmallIntegerField()
    color_principal = models.CharField(
        max_length=7, default="#1F3864",
        help_text="Color hex usado en el encabezado del PDF, ej: #1F3864"
    )
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["orden", "edad_min"]
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.nombre


class Equipo(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT, related_name="equipos"
    )
    entrenador = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Equipo"
        verbose_name_plural = "Equipos"

    def __str__(self):
        return f"{self.nombre} ({self.categoria})"


class Jugador(models.Model):
    """
    La edad NUNCA se guarda en la base de datos: se calcula al vuelo
    a partir de fecha_nacimiento. Así cualquier PDF o vista siempre
    muestra la edad correcta en el momento en que se genera.
    """
    nombre_completo = models.CharField(max_length=150)
    id_escolar = models.CharField(
        max_length=50, unique=True, null=True, blank=True,
        verbose_name="ID escolar",
    )
    fecha_nacimiento = models.DateField()
    numero_camiseta = models.PositiveSmallIntegerField(blank=True, null=True)
    equipo = models.ForeignKey(
        Equipo, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="jugadores"
    )
    categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT, related_name="jugadores"
    )
    foto = models.ImageField(upload_to="jugadores/", blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nombre_completo"]
        verbose_name = "Jugador"
        verbose_name_plural = "Jugadores"

    def __str__(self):
        return self.nombre_completo

    @property
    def edad(self):
        """Edad actual calculada al momento de acceder a este campo."""
        hoy = date.today()
        años = hoy.year - self.fecha_nacimiento.year
        # Resta 1 si todavía no ha cumplido años este año
        cumplio_este_año = (hoy.month, hoy.day) >= (
            self.fecha_nacimiento.month, self.fecha_nacimiento.day
        )
        if not cumplio_este_año:
            años -= 1
        return años

    @property
    def año_nacimiento(self):
        return self.fecha_nacimiento.year

    def categoria_sugerida(self):
        """
        Devuelve la categoría cuyo rango de edad coincide con la edad
        actual del jugador. Útil para detectar si un jugador quedó
        en la categoría equivocada tras cumplir años.
        """
        edad_actual = self.edad
        return Categoria.objects.filter(
            edad_min__lte=edad_actual, edad_max__gte=edad_actual
        ).first()


class Listado(models.Model):
    """Listado personalizado para un torneo o competencia."""
    nombre = models.CharField(max_length=150)
    categoria_principal = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="listados",
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    jugadores = models.ManyToManyField(
        "Jugador", through="ListadoJugador", related_name="listados"
    )

    class Meta:
        ordering = ["-actualizado_en", "-id"]
        verbose_name = "Listado"
        verbose_name_plural = "Listados"

    def __str__(self):
        return self.nombre


class ListadoJugador(models.Model):
    """Jugador incluido en un listado, conservando el orden de impresión."""
    listado = models.ForeignKey(Listado, on_delete=models.CASCADE, related_name="items")
    jugador = models.ForeignKey(Jugador, on_delete=models.CASCADE, related_name="items_listado")
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden", "jugador__nombre_completo"]
        constraints = [
            models.UniqueConstraint(
                fields=["listado", "jugador"],
                name="unique_jugador_por_listado",
            )
        ]


class ArchivoJugador(models.Model):
    """Documento o archivo asociado a un jugador (certificado, foto, etc.)."""
    jugador = models.ForeignKey(
        Jugador, on_delete=models.CASCADE, related_name="archivos"
    )
    archivo = models.FileField(upload_to="jugadores_archivos/")
    nombre = models.CharField(
        max_length=150, blank=True,
        help_text="Nombre para mostrar. Si se deja vacío, se usa el nombre del archivo."
    )
    subido_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-subido_en"]
        verbose_name = "Archivo de jugador"
        verbose_name_plural = "Archivos de jugadores"

    def __str__(self):
        return self.nombre or self.archivo.name
