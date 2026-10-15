from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def test_first_migration_creates_equipment_table(tmp_path, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    db_url = f"sqlite:///{tmp_path / 'migration.db'}"
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", db_url)

    command.upgrade(config, "head")

    engine = create_engine(db_url)
    columns = {column["name"] for column in inspect(engine).get_columns("equipment")}
    assert {"id", "name", "category", "location", "status", "borrower", "due_date"} <= columns
