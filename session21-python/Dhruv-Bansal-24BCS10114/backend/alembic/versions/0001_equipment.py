"""Create the equipment catalog.

Revision ID: 0001_equipment
Revises:
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_equipment"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "equipment",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("location", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="available"),
        sa.Column("borrower", sa.String(length=120), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.CheckConstraint(
            "status IN ('available', 'checked_out', 'maintenance')",
            name="ck_equipment_status",
        ),
    )


def downgrade():
    op.drop_table("equipment")
