from typing import Optional, List
from decimal import Decimal

from app.database import SessionLocal
from app.crud import mascota as crud_pet
from app.crud import cliente as crud_client
from app.schemas.mascota import PetCreate, PetUpdate
from app.graphql.types.pet_type import PetType, PetInput, PetUpdateInput
from app.graphql.types.medication_type import MedicationType


def _to_pet_type(pet) -> PetType:
    """Convierte un modelo SQLAlchemy Pet a un tipo GraphQL PetType.
    Incluye la conversión de la relación muchos-a-muchos con medicamentos."""
    return PetType(
        id=pet.id,
        identification=pet.identification,
        name=pet.name,
        breed=pet.breed,
        age=pet.age,
        # Convertir Decimal a float para compatibilidad con GraphQL
        weight=float(pet.weight) if pet.weight is not None else None,
        client_id=pet.client_id,
        medications=[
            MedicationType(
                id=med.id,
                name=med.name,
                description=med.description,
                dosage=med.dosage,
            )
            for med in pet.medications
        ],
    )


# ─── Queries ─────────────────────────────────────────────────────────────────


def resolve_pets(skip: int = 0, limit: int = 100) -> List[PetType]:
    """Obtiene todas las mascotas con sus medicamentos. Reutiliza crud_pet.get_pets()."""
    db = SessionLocal()
    try:
        pets = crud_pet.get_pets(db, skip=skip, limit=limit)
        return [_to_pet_type(p) for p in pets]
    finally:
        db.close()


def resolve_pet(pet_id: int) -> Optional[PetType]:
    """Obtiene una mascota por ID con sus medicamentos. Reutiliza crud_pet.get_pet()."""
    db = SessionLocal()
    try:
        pet = crud_pet.get_pet(db, pet_id)
        if not pet:
            return None
        return _to_pet_type(pet)
    finally:
        db.close()


# ─── Mutations ───────────────────────────────────────────────────────────────


def resolve_create_pet(input: PetInput) -> PetType:
    """Crea una nueva mascota. Reutiliza crud_pet.create_pet().
    Valida que el cliente exista y que la identificación no esté duplicada."""
    db = SessionLocal()
    try:
        # Verificar que el cliente exista (misma validación que en la ruta REST)
        db_client = crud_client.get_client(db, input.client_id)
        if not db_client:
            raise ValueError(f"No existe un cliente con id {input.client_id}")

        # Verificar identificación duplicada
        existing = crud_pet.get_pet_by_identification(db, input.identification)
        if existing:
            raise ValueError(f"Ya existe una mascota con identification '{input.identification}'")

        pet_data = PetCreate(
            identification=input.identification,
            name=input.name,
            breed=input.breed,
            age=input.age,
            weight=input.weight,
            client_id=input.client_id,
            medication_ids=input.medication_ids or [],
        )
        pet = crud_pet.create_pet(db, pet_data)
        return _to_pet_type(pet)
    finally:
        db.close()


def resolve_update_pet(pet_id: int, input: PetUpdateInput) -> PetType:
    """Actualiza una mascota existente. Reutiliza crud_pet.update_pet().
    Valida que el nuevo cliente exista si se está cambiando."""
    db = SessionLocal()
    try:
        # Si se está actualizando el client_id, verificar que exista
        if input.client_id is not None:
            db_client = crud_client.get_client(db, input.client_id)
            if not db_client:
                raise ValueError(f"No existe un cliente con id {input.client_id}")

        update_data = PetUpdate(
            identification=input.identification,
            name=input.name,
            breed=input.breed,
            age=input.age,
            weight=input.weight,
            client_id=input.client_id,
            medication_ids=input.medication_ids,
        )
        pet = crud_pet.update_pet(db, pet_id, update_data)
        if not pet:
            raise ValueError(f"Mascota con id {pet_id} no encontrada")
        return _to_pet_type(pet)
    finally:
        db.close()


def resolve_delete_pet(pet_id: int) -> bool:
    """Elimina una mascota. Reutiliza crud_pet.delete_pet()."""
    db = SessionLocal()
    try:
        pet = crud_pet.delete_pet(db, pet_id)
        if not pet:
            raise ValueError(f"Mascota con id {pet_id} no encontrada")
        return True
    finally:
        db.close()
