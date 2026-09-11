# Деплой BigPanda на PaaS

Готовые конфиги рассчитаны на Railway / Render / Heroku (везде Procfile-стиль).
Ниже — пошагово для Railway (бесплатный trial, кнопочный интерфейс). На Render шаги те же,
только UI другой.

## 0. Один раз: положить проект в git

Сейчас репозитория в проекте нет. Прежде чем пушить:

```bash
cd C:\Users\again\Desktop\work\ворки\IlBirs\site\bigpanda_site
git init
git add .
git commit -m "Initial BigPanda deploy"
# Создай репо на github.com и:
git remote add origin https://github.com/<твой-юзер>/bigpanda-site.git
git branch -M main
git push -u origin main
```

> `media/news/*` сейчас НЕ в `.gitignore` — четыре картинки уедут в репо и подтянутся
> на PaaS. Это удобно для демо. В реальном проде подключай S3 и удаляй `media/` из репо.

## 1. Railway

1. Зайди на <https://railway.app>, «New Project → Deploy from GitHub repo».
2. Выбери репозиторий `bigpanda-site`. Railway сам подхватит `requirements.txt`,
   `Procfile`, `runtime.txt` и начнёт билдить.
3. **PostgreSQL**: в проекте «+ New → Database → PostgreSQL». Скопируй `DATABASE_URL`
   из вкладки Variables.
4. **Variables** у веб-сервиса (не у БД):

   | Key | Value |
   |---|---|
   | `SECRET_KEY` | длинная случайная строка (сгенерируй: `python -c "import secrets; print(secrets.token_urlsafe(50))"`) |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `<имя-проекта>.up.railway.app` |
   | `DATABASE_URL` | вставь из шага 3 |

5. **Settings → Build Command** (если Railway сам не подхватил):
   `pip install -r requirements.txt && python manage.py collectstatic --noinput`
6. **Settings → Start Command**: оставь пустым — Procfile отдаст `web: gunicorn …`.
7. Deploy. Railway по `release: python manage.py migrate` сам накатит миграции.
8. Открой выданный `*.up.railway.app` — должен открыться сайт.

## 2. Создать суперюзера (админка)

`release` в Procfile миграции катит, но суперюзера — нет. Один раз:

- Railway: «… веб-сервис → Settings → Deploy → впиши one-off команду»
  `python manage.py createsuperuser --noinput --username admin --email admin@example.com`
  и временно задай переменные `DJANGO_SUPERUSER_PASSWORD=…`. Запустится и сразу завершится.
- Альтернатива (без one-off): зайти на PaaS-консоль (Shell) и выполнить ту же команду
  руками.

## 3. Перенести текущие 2 новости в Postgres

Дамп с локальной SQLite:

```bash
# На твоей Windows-машине, в .venv:
python manage.py dumpdata --exclude contenttypes --exclude auth --indent 2 > news_seed.json
# Закоммить news_seed.json в репо (или загрузи вручную через шелл PaaS).
```

На PaaS-шелле (или в one-off команде):

```bash
python manage.py loaddata news_seed.json
```

Медиа (`media/news/*.png`) уже уехали в репо на шаге 0, ничего дополнительно делать не надо.

## 4. Render

Повторить то же самое, но:
- «New → Web Service → из GitHub».
- Environment: `Python 3`.
- Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`.
- Start Command: оставь пустым (Procfile).
- Variables — те же четыре ключа + `DATABASE_URL` из «New → PostgreSQL».
- Создай суперюзера так же, через Shell.

## 5. Что выставлено в коде

- `bigpanda/settings.py` — все секреты/хосты/БД читаются из env.
  `STATIC_ROOT` + WhiteNoise, `MEDIA_URL` отдаётся Django, защищённые куки в проде,
  HSTS, `SECURE_SSL_REDIRECT=True` когда `DEBUG=False`.
- `Procfile` — `release: migrate`, `web: gunicorn bigpanda.wsgi`.
- `runtime.txt` — `python-3.11.0`.
- `requirements.txt` — Django + Pillow + gunicorn + psycopg2-binary + dj-database-url
  + whitenoise.
- `bigpanda/urls.py` — `/media/` отдаётся в любом режиме (TODO: S3 для прода).
- `landing/middleware.py` — язык читается из `?lang=`, сессии и куки.

## 6. Smoke-check после деплоя

- Главная открывается, шапка переключается RU ⇄ KG.
- `/admin/` пускает под суперюзером, обе новости на месте, KG-перевод у news#3 сохранён.
- `/media/news/новость1.png` отдаётся (картинка в карточке новости видна).
- `/static/css/style.css` отдаётся.
