from sqlalchemy.orm import Session, joinedload

from app.models.mascota import Pet
from app.models.medicamento import Medication
from app.schemas.mascota import PetCreate, PetUpdate


def get_pet(db: Session, pet_id: int):
    """
    Busca una mascota por su ID, incluyendo sus medicamentos.
    Equivalente a entityManager.find() con FETCH JOIN en JPA.
    """
    return (
        db.query(Pet)
        .options(joinedload(Pet.medications))
        .filter(Pet.id == pet_id)
        .first()
    )


def get_pet_by_identification(db: Session, identification: str):
    """
    Busca una mascota por su identificación única.
    """
    return db.query(Pet).filter(Pet.identification == identification).first()


def get_pets(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene todas las mascotas con paginación, incluyendo sus medicamentos.
    """
    return (
        db.query(Pet)
        .options(joinedload(Pet.medications))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_pet(db: Session, pet: PetCreate):
    """
    Crea una nueva mascota y le asigna medicamentos si se proporcionan.
    Equivalente a entityManager.persist() en JPA.
    """
    db_pet = Pet(
        identification=pet.identification,
        name=pet.name,
        breed=pet.breed,
        age=pet.age,
        weight=pet.weight,
        client_id=pet.client_id,
    )

    # Asignar medicamentos (relación muchos a muchos)
    if pet.medication_ids:
        medications = (
            db.query(Medication)
            .filter(Medication.id.in_(pet.medication_ids))
            .all()
        )
        db_pet.medications = medications

    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet


def update_pet(db: Session, pet_id: int, pet: PetUpdate):
    """
    Actualiza una mascota existente.
    Equivalente a entityManager.merge() en JPA.
    Solo actualiza los campos que fueron enviados (no None).
    """
    db_pet = (
        db.query(Pet)
        .options(joinedload(Pet.medications))
        .filter(Pet.id == pet_id)
        .first()
    )
    if not db_pet:
        return None

    update_data = pet.model_dump(exclude_unset=True)

    # Manejar la actualización de medicamentos por separado
    if "medication_ids" in update_data:
        medication_ids = update_data.pop("medication_ids")
        if medication_ids is not None:
            medications = (
                db.query(Medication)
                .filter(Medication.id.in_(medication_ids))
                .all()
            )
            db_pet.medications = medications

    # Actualizar los demás campos
    for field, value in update_data.items():
        setattr(db_pet, field, value)

    db.commit()
    db.refresh(db_pet)
    return db_pet


def delete_pet(db: Session, pet_id: int):
    """
    Elimina una mascota por su ID.
    Equivalente a entityManager.remove() en JPA.
    """
    db_pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not db_pet:
        return None

    db.delete(db_pet)
    db.commit()
    return db_pet
