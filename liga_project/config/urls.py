from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from liga.views import frontend_catch_all

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("liga.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# Sirve el frontend de Ionic ya compilado (carpeta frontend_dist). Va al
# final para no interceptar /admin/, /api/, /pdf/, /static/ ni /media/,
# que ya fueron reclamados por los patrones de arriba.
urlpatterns += [
    re_path(r"^(?P<path>.*)$", frontend_catch_all),
]
