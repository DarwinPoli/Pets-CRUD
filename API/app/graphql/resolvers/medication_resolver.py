from typing import Optional, List

from app.database import SessionLocal
from app.crud import medicamento as crud_medication
from app.schemas.medicamento import MedicationCreate, MedicationUpdate
from app.graphql.types.medication_type import MedicationType, MedicationInput, MedicationUpdateInput


def _to_medication_type(medication) -> MedicationType:
    """Convierte un modelo SQLAlchemy Medication a un tipo GraphQL MedicationType."""
    return MedicationType(
        id=medication.id,
        name=medication.name,
        description=medication.description,
        dosage=medication.dosage,
    )


# ─── Queries ─────────────────────────────────────────────────────────────────


def resolve_medications(skip: int = 0, limit: int = 100) -> List[MedicationType]:
    """Obtiene todos los medicamentos. Reutiliza crud_medication.get_medications()."""
    db = SessionLocal()
    try:
        medications = crud_medication.get_medications(db, skip=skip, limit=limit)
        return [_to_medication_type(m) for m in medications]
    finally:
        db.close()


def resolve_medication(medication_id: int) -> Optional[MedicationType]:
    """Obtiene un medicamento por ID. Reutiliza crud_medication.get_medication()."""
    db = SessionLocal()
    try:
        medication = crud_medication.get_medication(db, medication_id)
        if not medication:
            return None
        return _to_medication_type(medication)
    finally:
        db.close()


# ─── Mutations ───────────────────────────────────────────────────────────────


def resolve_create_medication(input: MedicationInput) -> MedicationType:
    """Crea un nuevo medicamento. Reutiliza crud_medication.create_medication()."""
    db = SessionLocal()
    try:
        medication_data = MedicationCreate(
            name=input.name,
            description=input.description,
            dosage=input.dosage,
        )
        medication = crud_medication.create_medication(db, medication_data)
        return _to_medication_type(medication)
    finally:
        db.close()


def resolve_update_medication(medication_id: int, input: MedicationUpdateInput) -> MedicationType:
    """Actualiza un medicamento existente. Reutiliza crud_medication.update_medication()."""
    db = SessionLocal()
    try:
        update_data = MedicationUpdate(
            name=input.name,
            description=input.description,
            dosage=input.dosage,
        )
        medication = crud_medication.update_medication(db, medication_id, update_data)
        if not medication:
            raise ValueError(f"Medicamento con id {medication_id} no encontrado")
        return _to_medication_type(medication)
    finally:
        db.close()


def resolve_delete_medication(medication_id: int) -> bool:
    """Elimina un medicamento. Reutiliza crud_medication.delete_medication()."""
    db = SessionLocal()
    try:
        medication = crud_medication.delete_medication(db, medication_id)
        if not medication:
            raise ValueError(f"Medicamento con id {medication_id} no encontrado")
        return True
    finally:
        db.close()
