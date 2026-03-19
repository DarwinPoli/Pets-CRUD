from sqlalchemy.orm import Session

from app.models.medicamento import Medication
from app.schemas.medicamento import MedicationCreate, MedicationUpdate


def get_medication(db: Session, medication_id: int):
    """
    Busca un medicamento por su ID.
    Equivalente a entityManager.find() en JPA.
    """
    return db.query(Medication).filter(Medication.id == medication_id).first()


def get_medications(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene todos los medicamentos con paginación.
    """
    return db.query(Medication).offset(skip).limit(limit).all()


def create_medication(db: Session, medication: MedicationCreate):
    """
    Crea un nuevo medicamento.
    Equivalente a entityManager.persist() en JPA.
    """
    db_medication = Medication(
        name=medication.name,
        description=medication.description,
        dosage=medication.dosage,
    )
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication


def update_medication(db: Session, medication_id: int, medication: MedicationUpdate):
    """
    Actualiza un medicamento existente.
    Equivalente a entityManager.merge() en JPA.
    Solo actualiza los campos que fueron enviados (no None).
    """
    db_medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not db_medication:
        return None

    update_data = medication.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_medication, field, value)

    db.commit()
    db.refresh(db_medication)
    return db_medication


def delete_medication(db: Session, medication_id: int):
    """
    Elimina un medicamento por su ID.
    Equivalente a entityManager.remove() en JPA.
    """
    db_medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not db_medication:
        return None

    db.delete(db_medication)
    db.commit()
    return db_medication
