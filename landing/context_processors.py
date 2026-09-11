# -*- coding: utf-8 -*-
"""Injects the current language + translations into every template context."""
from __future__ import annotations

from . import translations as tr


def _build_tree(lang: str):
    """
    Build a nested dict from TRANSLATIONS so templates can use
    `{{ t.nav.about }}` to access `TRANSLATIONS['nav.about'][lang]`.

    Leaves are plain strings. Missing keys resolve to '' (silent fallback
    in templates) instead of raising.
    """
    def make_node():
        # Use a dict with a defaulting __getattr__ via a small helper class.
        return _DotDict()

    root = make_node()
    for flat_key, row in tr.TRANSLATIONS.items():
        node = root
        parts = flat_key.split(".")
        for p in parts[:-1]:
            node = node.setdefault(p, make_node())
        node[parts[-1]] = row.get(lang, row.get(tr.DEFAULT_LANG, ""))
    return root


class _DotDict(dict):
    """dict that allows attribute-style access: d.foo == d['foo'].

    Returns '' for missing keys instead of raising, so template rendering
    of an unknown `t.something.missing` becomes an empty string rather
    than blowing up the whole page.
    """
    __getattr__ = dict.__getitem__

    def __getitem__(self, key):
        try:
            return super().__getitem__(key)
        except KeyError:
            return ""


def landing_i18n(request):
    """
    Exposes:
      LANG       — current language code ('ru' | 'kg')
      LANGS      — list of (code, label) tuples for the switcher
      t          — nested dict: t.nav.about -> str
    """
    lang = getattr(request, "LANG", tr.DEFAULT_LANG)
    return {
        "LANG": lang,
        "LANGS": tr.LANGS,
        "t": _build_tree(lang),
    }
