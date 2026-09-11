"""bigpanda URL Configuration"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('landing.urls')),
]

# In dev, Django dev server also serves /media/.
# In production we serve media through Django + gunicorn too.
# TODO: replace with S3 / Cloudinary when uploads start mattering.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
