from django.db import models
from django.utils import timezone


class News(models.Model):
    title = models.CharField('Заголовок (RU)', max_length=200)
    title_kg = models.CharField(
        'Заголовок (KG)', max_length=200, blank=True,
        help_text='Кыргызча которуу. Бош болсо, RU версиясы көрсөтүлөт.',
    )
    preview_text = models.TextField('Краткое описание (RU)', max_length=300)
    preview_text_kg = models.TextField(
        'Краткое описание (KG)', max_length=300, blank=True,
        help_text='Кыргызча кыскача сүрөттөмө. Бош болсо — RU көрсөтүлөт.',
    )
    content = models.TextField('Полный текст (RU)')
    content_kg = models.TextField(
        'Полный текст (KG)', blank=True,
        help_text='Кыргызча толук текст. Бош болсо — RU көрсөтүлөт.',
    )
    image = models.ImageField('Изображение', upload_to='news/', blank=True, null=True)

    created_at = models.DateTimeField('Дата публикации', default=timezone.now)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    is_published = models.BooleanField('Опубликовано', default=True)

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    # ---- localization helpers --------------------------------------------
    def title_i18n(self, lang: str) -> str:
        if lang == 'kg' and self.title_kg:
            return self.title_kg
        return self.title

    def preview_text_i18n(self, lang: str) -> str:
        if lang == 'kg' and self.preview_text_kg:
            return self.preview_text_kg
        return self.preview_text

    def content_i18n(self, lang: str) -> str:
        if lang == 'kg' and self.content_kg:
            return self.content_kg
        return self.content
