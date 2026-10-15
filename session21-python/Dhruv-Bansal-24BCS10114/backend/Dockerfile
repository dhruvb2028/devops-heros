FROM python:3.12-alpine3.24

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN apk upgrade --no-cache && pip install --no-cache-dir -r requirements.txt && adduser -D -u 10001 appuser
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser alembic ./alembic
COPY --chown=appuser:appuser alembic.ini ./alembic.ini
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "python -m alembic upgrade head && exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"]
