from pydantic import BaseModel
from typing import Optional, List

from app.schemas.medicamento import MedicationResponse


class PetBase(BaseModel):
    """Campos comunes de Pet."""
    identification: str
    name: str
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    client_id: int


class PetCreate(PetBase):
    """Schema para crear una mascota."""
    medication_ids: Optional[List[int]] = []


class PetUpdate(BaseModel):
    """Schema para actualizar una mascota (todos los campos opcionales)."""
    identification: Optional[str] = None
    name: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    client_id: Optional[int] = None
    medication_ids: Optional[List[int]] = None


class PetResponse(PetBase):
    """Schema de respuesta de Pet."""
    id: int
    medications: List[MedicationResponse] = []

    class Config:
        from_attributes = True
