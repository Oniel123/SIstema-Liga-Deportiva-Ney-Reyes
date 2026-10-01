import os
import sys
import threading
import time

from django.apps import AppConfig

# Estado compartido del heartbeat. Vive en memoria del proceso: es
# suficiente para un servidor local de un solo usuario.
_ultimo_heartbeat = {"tiempo": None}

HEARTBEAT_TIMEOUT_SEGUNDOS = 20  # sin señal del navegador por este tiempo -> se apaga
GRACIA_INICIAL_SEGUNDOS = 40     # tiempo que espera el primer heartbeat antes de exigirlo


def registrar_heartbeat():
    _ultimo_heartbeat["tiempo"] = time.monotonic()


def _vigilante():
    inicio = time.monotonic()
    while True:
        time.sleep(5)
        ultimo = _ultimo_heartbeat["tiempo"]
        ahora = time.monotonic()

        if ultimo is None:
            # Todavía no ha llegado ningún heartbeat (el navegador puede
            # tardar unos segundos en abrir y cargar la app).
            if ahora - inicio > GRACIA_INICIAL_SEGUNDOS:
                os._exit(0)
            continue

        if ahora - ultimo > HEARTBEAT_TIMEOUT_SEGUNDOS:
            # Nadie tiene el navegador abierto: apaga el servidor.
            os._exit(0)


class LigaConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "liga"
    verbose_name = "Liga Deportiva"

    def ready(self):
        # El autoreloader de Django (DEBUG=True) lanza un proceso
        # "supervisor" además del proceso real del servidor. RUN_MAIN
        # solo está en 'true' en el proceso real, así evitamos dos
        # hilos vigilantes compitiendo entre sí.
        if os.environ.get("RUN_MAIN") != "true":
            return
        if "runserver" not in sys.argv:
            return

        hilo = threading.Thread(target=_vigilante, daemon=True)
        hilo.start()
