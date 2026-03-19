from pydantic import BaseModel
from typing import Optional


class MedicationBase(BaseModel):
    """Campos comunes de Medication."""
    name: str
    description: Optional[str] = None
    dosage: Optional[str] = None


class MedicationCreate(MedicationBase):
    """Schema para crear un medicamento."""
    pass


class MedicationUpdate(BaseModel):
    """Schema para actualizar un medicamento (todos los campos opcionales)."""
    name: Optional[str] = None
    description: Optional[str] = None
    dosage: Optional[str] = None


class MedicationResponse(MedicationBase):
    """Schema de respuesta de Medication."""
    id: int

    class Config:
        from_attributes = True
