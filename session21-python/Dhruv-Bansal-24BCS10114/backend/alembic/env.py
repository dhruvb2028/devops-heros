import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app import models  # noqa: F401
from app.db import Base


config = context.config
if config.config_file_name and config.get_section("loggers") is not None:
    fileConfig(config.config_file_name)

database_url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
config.set_main_option("sqlalchemy.url", database_url)
target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(url=database_url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    engine = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with engine.connect() as connection:
        postgres = connection.dialect.name == "postgresql"
        if postgres:
            # Both backend replicas start together; only one should migrate at a time.
            connection.exec_driver_sql("SELECT pg_advisory_lock(210114)")
            connection.commit()
        try:
            context.configure(connection=connection, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()
        finally:
            if postgres:
                connection.exec_driver_sql("SELECT pg_advisory_unlock(210114)")


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
