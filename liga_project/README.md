# Liga Deportiva Ney Reyes — Proyecto Django

Proyecto Django completo y listo para correr: incluye el proyecto
base (`config/`) y la app `liga/` con modelos, admin, API REST y
generación de PDF con edad calculada en tiempo real.

## Estructura

```
liga_project/
├── manage.py
├── requirements.txt
├── db.sqlite3          (se crea al migrar)
├── config/              ← el proyecto (settings, urls raíz)
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── liga/                ← la app (modelos, admin, API, PDF)
    ├── models.py
    ├── admin.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    ├── static/liga/      ← coloca aquí tu logo.png
    └── templates/liga/pdf_roster.html
```

## 1. Crear entorno virtual e instalar dependencias

```bash
cd liga_project
python -m venv venv
venv\Scripts\Activate.ps1      # Windows (PowerShell)
pip install -r requirements.txt
```

## 2. Colocar el logo

Copia el logo de la liga a:
`liga/static/liga/logo.png`

## 3. Migrar la base de datos

Por defecto usa SQLite para que puedas arrancar sin instalar
PostgreSQL. Cuando quieras pasar a PostgreSQL, descomenta el bloque
correspondiente en `config/settings.py` e instala `psycopg2-binary`.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 4. Levantar el servidor

```bash
python manage.py runserver
```

- **Panel admin**: http://localhost:8000/admin/
  → Carga categorías, equipos y jugadores (con fecha de nacimiento).
- **API**: http://localhost:8000/api/jugadores/
  → Cada jugador trae el campo `edad` ya calculado al momento del request.
- **PDF**: http://localhost:8000/pdf/roster/
  → Genera el PDF completo agrupado por categoría.

## Cómo funciona el cálculo de edad

`Jugador.fecha_nacimiento` es el único dato que se guarda. La edad
vive como una **propiedad** (`Jugador.edad`, en `liga/models.py`) que
resta la fecha de hoy menos la fecha de nacimiento cada vez que se
consulta — nunca se guarda un número de edad "congelado". Por eso el
mismo PDF, generado hoy o dentro de un año, siempre muestra la edad
correcta sin que nadie tenga que actualizar nada a mano.

## Notas importantes antes de producción

- Cambia `SECRET_KEY` en `config/settings.py` y muévela a una
  variable de entorno.
- Pon `DEBUG = False` y define `ALLOWED_HOSTS` con tu dominio real.
- Cambia `CORS_ALLOWED_ORIGINS` para permitir solo el dominio de tu
  app Ionic en producción (ahora mismo, en desarrollo, permite todo).
- Pasa de SQLite a PostgreSQL antes de manejar datos reales de la liga.

## Próximos pasos sugeridos

1. Cargar datos de prueba desde el admin (categorías 12-13 y 14-15,
   unos cuantos jugadores con su fecha de nacimiento real).
2. Verificar que el PDF sale igual al que ya diseñamos antes, y que
   la edad se ve correcta.
3. Conectar la app Ionic al endpoint `/api/jugadores/` para el CRUD,
   y a `/pdf/roster/` para el botón de "Descargar roster".
4. Cuando esto esté sólido, seguimos con los modelos `Partido` y
   `Alineacion` para las convocatorias y formaciones de cada juego.
