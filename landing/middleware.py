# -*- coding: utf-8 -*-
"""
Resolves the active site language.

Priority:
  1. `?lang=ru|kg` in the query string  (also persisted in session + cookie)
  2. `landing_lang` session value
  2. `landing_lang` cookie value
  3. Default ('ru')

Exposes `request.LANG` for views, context processors, and templates.
"""
from __future__ import annotations

from . import translations as tr

LANG_SESSION_KEY = "landing_lang"
LANG_COOKIE_NAME = "landing_lang"
LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365  # 1 year


class LanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1) query string wins; persist it for next visit
        q_lang = request.GET.get("lang")
        if q_lang:
            lang = tr.normalize_lang(q_lang)
            request.session[LANG_SESSION_KEY] = lang
            request._set_lang_cookie = lang
        else:
            # 2) session
            lang = tr.normalize_lang(request.session.get(LANG_SESSION_KEY))
            # 3) cookie
            if lang == tr.DEFAULT_LANG:
                lang = tr.normalize_lang(request.COOKIES.get(LANG_COOKIE_NAME))

        request.LANG = lang

        response = self.get_response(request)

        if getattr(request, "_set_lang_cookie", None):
            response.set_cookie(
                LANG_COOKIE_NAME,
                request._set_lang_cookie,
                max_age=LANG_COOKIE_MAX_AGE,
                samesite="Lax",
            )

        return response
