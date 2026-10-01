from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("liga", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="jugador",
            name="id_escolar",
            field=models.CharField(
                blank=True,
                max_length=50,
                null=True,
                unique=True,
                verbose_name="ID escolar",
            ),
        ),
        migrations.CreateModel(
            name="Listado",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=150)),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                ("categoria_principal", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="listados", to="liga.categoria")),
            ],
            options={
                "verbose_name": "Listado",
                "verbose_name_plural": "Listados",
                "ordering": ["-actualizado_en", "-id"],
            },
        ),
        migrations.CreateModel(
            name="ListadoJugador",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("orden", models.PositiveIntegerField(default=0)),
                ("jugador", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items_listado", to="liga.jugador")),
                ("listado", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="liga.listado")),
            ],
            options={
                "ordering": ["orden", "jugador__nombre_completo"],
            },
        ),
        migrations.AddConstraint(
            model_name="listadojugador",
            constraint=models.UniqueConstraint(fields=("listado", "jugador"), name="unique_jugador_por_listado"),
        ),
        migrations.AddField(
            model_name="listado",
            name="jugadores",
            field=models.ManyToManyField(related_name="listados", through="liga.ListadoJugador", to="liga.jugador"),
        ),
    ]
