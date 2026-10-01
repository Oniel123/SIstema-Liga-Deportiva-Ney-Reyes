# Liga Deportiva Ney Reyes — Frontend (Ionic + Angular)

Dashboard web que consume la API de Django ya armada. Pantalla de
Jugadores con filtro por categoría, estadísticas y la edad calculada
en vivo (viene directo del backend, nunca se calcula aquí).

## 1. Instalar Node.js

Si no lo tienes, descárgalo de https://nodejs.org (versión LTS).
Verifica con:

```bash
node --version
npm --version
```

## 2. Instalar dependencias

```bash
cd liga_frontend
npm install
npm install -g @ionic/cli
```

## 3. Levantar el backend Django primero

Este frontend espera la API en `http://localhost:8000` (ver
`src/environments/environment.ts`). Antes de correr el frontend,
levanta el proyecto Django:

```bash
python manage.py runserver
```

Recuerda: en `config/settings.py` del backend ya dejamos
`CORS_ALLOW_ALL_ORIGINS = DEBUG`, así que en desarrollo no hace falta
tocar nada más para que este frontend pueda llamar a la API.

## 4. Levantar el frontend

```bash
ionic serve
```

Se abre en `http://localhost:8100`. Deberías ver el dashboard con la
lista de jugadores que hayas cargado desde el admin de Django.

## Estructura

```
src/app/
├── models/jugador.model.ts       ← tipos que reflejan los serializers de Django
├── services/jugador.service.ts   ← llamadas HTTP a la API
├── pages/jugadores/              ← pantalla principal (dashboard)
└── app.routes.ts
```

## Si algo no carga

- Pantalla en blanco o error de red: confirma que Django esté
  corriendo en el puerto 8000 y que puedas abrir
  `http://localhost:8000/api/jugadores/` directo en el navegador.
- Error de CORS en la consola: revisa que `corsheaders` esté en
  `INSTALLED_APPS` y `MIDDLEWARE` del backend (ya viene así en el
  proyecto que armamos).

## Próximos pasos

1. Página de alta/edición de jugador (formulario con fecha de nacimiento).
2. Página de Equipos y Categorías (mismo patrón que Jugadores).
3. Módulo de Alineaciones una vez el backend tenga los modelos
   `Partido` y `Alineacion`.
