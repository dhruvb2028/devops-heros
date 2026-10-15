from fastapi import Depends, FastAPI, HTTPException, status
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from . import models  # Register database tables for migrations and test setup.
from .db import get_db
from .schemas import CheckoutRequest, EquipmentCreate, EquipmentOut, EquipmentUpdate

app = FastAPI(title="LabGear")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ready"}


@app.post("/api/equipment", response_model=EquipmentOut, status_code=status.HTTP_201_CREATED)
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db)):
    item = models.Equipment(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/equipment", response_model=list[EquipmentOut])
def list_equipment(db: Session = Depends(get_db)):
    return db.scalars(select(models.Equipment).order_by(models.Equipment.id)).all()


@app.get("/api/equipment/stats")
def equipment_stats(db: Session = Depends(get_db)):
    counts = dict(
        db.execute(
            select(models.Equipment.status, func.count()).group_by(models.Equipment.status)
        ).all()
    )
    return {
        "total": sum(counts.values()),
        "available": counts.get("available", 0),
        "checked_out": counts.get("checked_out", 0),
        "maintenance": counts.get("maintenance", 0),
    }


def find_equipment(db: Session, equipment_id: int) -> models.Equipment:
    item = db.get(models.Equipment, equipment_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return item


@app.get("/api/equipment/{equipment_id}", response_model=EquipmentOut)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    return find_equipment(db, equipment_id)


@app.put("/api/equipment/{equipment_id}", response_model=EquipmentOut)
def update_equipment(equipment_id: int, payload: EquipmentUpdate, db: Session = Depends(get_db)):
    item = find_equipment(db, equipment_id)
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if item.status == "checked_out" and "status" in changes:
        raise HTTPException(status_code=409, detail="Return equipment before changing its status")
    for field, value in changes.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/equipment/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    item = find_equipment(db, equipment_id)
    if item.status == "checked_out":
        raise HTTPException(status_code=409, detail="Return equipment before deleting it")
    db.delete(item)
    db.commit()


@app.post("/api/equipment/{equipment_id}/checkout", response_model=EquipmentOut)
def checkout_equipment(
    equipment_id: int, payload: CheckoutRequest, db: Session = Depends(get_db)
):
    item = find_equipment(db, equipment_id)
    if item.status != "available":
        raise HTTPException(status_code=409, detail="Equipment is not available")
    item.status = "checked_out"
    item.borrower = payload.borrower
    item.due_date = payload.due_date
    db.commit()
    db.refresh(item)
    return item


@app.post("/api/equipment/{equipment_id}/return", response_model=EquipmentOut)
def return_equipment(equipment_id: int, db: Session = Depends(get_db)):
    item = find_equipment(db, equipment_id)
    if item.status != "checked_out":
        raise HTTPException(status_code=409, detail="Equipment is not checked out")
    item.status = "available"
    item.borrower = None
    item.due_date = None
    db.commit()
    db.refresh(item)
    return item


Instrumentator().instrument(app).expose(app)
