from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.medicamento import MedicationCreate, MedicationUpdate, MedicationResponse
from app.crud import medicamento as crud_medication

# Equivalente a @RestController + @RequestMapping("/medications") en Spring
router = APIRouter(
    prefix="/medications",
    tags=["Medications"],
    responses={404: {"description": "Medicamento no encontrado"}},
)


@router.post("/", response_model=MedicationResponse, status_code=201)
def create_medication(medication: MedicationCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo medicamento.
    Equivalente a @PostMapping en Spring.
    """
    return crud_medication.create_medication(db, medication)


@router.get("/", response_model=List[MedicationResponse])
def list_medications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene todos los medicamentos con paginación.
    Equivalente a @GetMapping en Spring.
    """
    return crud_medication.get_medications(db, skip=skip, limit=limit)


@router.get("/{medication_id}", response_model=MedicationResponse)
def get_medication(medication_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un medicamento por su ID.
    Equivalente a @GetMapping("/{id}") en Spring.
    """
    db_medication = crud_medication.get_medication(db, medication_id)
    if not db_medication:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return db_medication


@router.put("/{medication_id}", response_model=MedicationResponse)
def update_medication(medication_id: int, medication: MedicationUpdate, db: Session = Depends(get_db)):
    """
    Actualiza un medicamento existente.
    Equivalente a @PutMapping("/{id}") en Spring.
    """
    db_medication = crud_medication.update_medication(db, medication_id, medication)
    if not db_medication:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return db_medication


@router.delete("/{medication_id}", status_code=204)
def delete_medication(medication_id: int, db: Session = Depends(get_db)):
    """
    Elimina un medicamento por su ID.
    Equivalente a @DeleteMapping("/{id}") en Spring.
    """
    db_medication = crud_medication.delete_medication(db, medication_id)
    if not db_medication:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return None
