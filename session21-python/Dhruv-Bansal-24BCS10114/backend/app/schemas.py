from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class EquipmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=1, max_length=80)


class EquipmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    location: str | None = Field(default=None, min_length=1, max_length=80)
    status: Literal["available", "maintenance"] | None = None


class CheckoutRequest(BaseModel):
    borrower: str = Field(min_length=1, max_length=120)
    due_date: date


class EquipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    location: str
    status: str
    borrower: str | None
    due_date: date | None
