from django.contrib import admin
from django.utils.html import format_html
from .models import News


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'kg_status', 'created_at', 'is_published')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'title_kg', 'content', 'content_kg')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        ('Основная информация (RU)', {
            'fields': ('title', 'preview_text'),
            'description': 'Русская версия — основная. Поля ниже — кыргызча которуу (не обязательны).',
        }),
        ('Кыргызча которуу (KG)', {
            'fields': ('title_kg', 'preview_text_kg', 'content_kg'),
            'classes': ('collapse',),
        }),
        ('Содержание', {
            'fields': ('content', 'image'),
        }),
        ('Публикация', {
            'fields': ('is_published', 'created_at'),
        }),
    )

    @admin.display(boolean=True, description='KG перевод')
    def kg_status(self, obj: News) -> bool:
        return bool(obj.title_kg and obj.preview_text_kg and obj.content_kg)
