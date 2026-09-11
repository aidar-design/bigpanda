from django.shortcuts import render
from news.models import News


def index(request):
    lang = getattr(request, 'LANG', 'ru')
    latest_news = News.objects.filter(is_published=True)[:6]

    # Pre-resolve the localized fields so the template stays simple.
    news_view = [
        {
            'obj': n,
            'title': n.title_i18n(lang),
            'preview_text': n.preview_text_i18n(lang),
            'content': n.content_i18n(lang),
            'date': n.created_at,
            'image_url': n.image.url if n.image else '',
        }
        for n in latest_news
    ]

    return render(request, 'landing/index.html', {
        'news_items': news_view,
    })
