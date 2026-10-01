# Cómo dejar el sistema listo para usar con doble clic (silencioso)

## 1. Estructura de carpetas esperada

Estos archivos deben quedar en la misma carpeta donde ya tienes
`liga_project` y `liga_frontend` (un nivel arriba de ambos):

```
Sistema Liga deportiva Ney Reyes/
├── liga_project/
├── liga_frontend/
├── Liga Ney Reyes.vbs      (el que usarás a diario — doble clic)
└── iniciar_liga.bat        (usado internamente por el .vbs, no lo borres)
```

## 2. Compilar el frontend (una sola vez, o cuando cambie el diseño)

Doble clic en `construir_frontend.bat` (dentro de la carpeta del
proyecto, o donde lo hayas dejado). Tarda uno o dos minutos.

## 3. Uso diario: doble clic en "Liga Ney Reyes.vbs"

Este es el archivo que vas a usar de ahora en adelante. Al hacer
doble clic:

1. Arranca el servidor **sin mostrar ninguna ventana negra**.
2. Espera unos segundos y abre tu navegador solo en
   `http://127.0.0.1:8000/`.

Puedes crear un acceso directo de este `.vbs` en tu escritorio,
renombrarlo y cambiarle el ícono, igual que hicimos antes.

## 4. Cómo se apaga

**Ya no necesitas cerrar nada a mano.** Mientras tengas la página
abierta en el navegador, el sistema le manda una señal al servidor
cada 5 segundos para decirle "sigo aquí". En cuanto cierras la
pestaña (o el navegador completo) y esas señales dejan de llegar, el
servidor se apaga solo unos 15-20 segundos después.

- Refrescar la página (F5) no lo apaga — el corte es demasiado corto.
- Si tienes varias pestañas del sistema abiertas, con que una quede
  abierta el servidor se mantiene encendido.

## 5. Si algo no arranca (diagnóstico)

Como el `.vbs` oculta todo, si algún día algo no funciona y necesitas
ver el error real, corre `iniciar_liga.bat` directamente (doble clic
en ese archivo, no en el `.vbs`) — ese sí muestra la ventana con
cualquier mensaje de error.

Si necesitas apagar el sistema a la fuerza sin esperar el apagado
automático: abre el Administrador de tareas (Ctrl+Shift+Esc), busca
"python.exe" en la lista, y termina la tarea.

## 6. Si haces cambios al código más adelante

- **Cambios en el backend**: no hace falta recompilar nada, solo
  vuelve a abrir el sistema.
- **Cambios en el frontend**: corre `construir_frontend.bat` de nuevo
  antes de la próxima vez que abras el sistema.
