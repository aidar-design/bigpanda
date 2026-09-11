"""WSGI config for bigpanda project."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bigpanda.settings')

application = get_wsgi_application()