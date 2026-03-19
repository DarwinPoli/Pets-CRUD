from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.mascota import PetCreate, PetUpdate, PetResponse
from app.crud import mascota as crud_pet
from app.crud import cliente as crud_client

# Equivalente a @RestController + @RequestMapping("/pets") en Spring
router = APIRouter(
    prefix="/pets",
    tags=["Pets"],
    responses={404: {"description": "Mascota no encontrada"}},
)


@router.post("/", response_model=PetResponse, status_code=201)
def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva mascota.
    Equivalente a @PostMapping en Spring.
    Valida que el client_id exista antes de crear.
    """
    # Verificar que el cliente exista
    db_client = crud_client.get_client(db, pet.client_id)
    if not db_client:
        raise HTTPException(
            status_code=400,
            detail=f"No existe un cliente con id {pet.client_id}"
        )

    # Verificar si ya existe una mascota con la misma identification
    existing = crud_pet.get_pet_by_identification(db, pet.identification)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe una mascota con identification '{pet.identification}'"
        )

    return crud_pet.create_pet(db, pet)


@router.get("/", response_model=List[PetResponse])
def list_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene todas las mascotas con paginación.
    Equivalente a @GetMapping en Spring.
    """
    return crud_pet.get_pets(db, skip=skip, limit=limit)


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una mascota por su ID.
    Equivalente a @GetMapping("/{id}") en Spring.
    """
    db_pet = crud_pet.get_pet(db, pet_id)
    if not db_pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return db_pet


@router.put("/{pet_id}", response_model=PetResponse)
def update_pet(pet_id: int, pet: PetUpdate, db: Session = Depends(get_db)):
    """
    Actualiza una mascota existente.
    Equivalente a @PutMapping("/{id}") en Spring.
    """
    # Si se está actualizando el client_id, verificar que exista
    if pet.client_id is not None:
        db_client = crud_client.get_client(db, pet.client_id)
        if not db_client:
            raise HTTPException(
                status_code=400,
                detail=f"No existe un cliente con id {pet.client_id}"
            )

    db_pet = crud_pet.update_pet(db, pet_id, pet)
    if not db_pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return db_pet


@router.delete("/{pet_id}", status_code=204)
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    """
    Elimina una mascota por su ID.
    Equivalente a @DeleteMapping("/{id}") en Spring.
    """
    db_pet = crud_pet.delete_pet(db, pet_id)
    if not db_pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return None
