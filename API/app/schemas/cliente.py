from pydantic import BaseModel
from typing import Optional


class ClientBase(BaseModel):
    """Campos comunes de Client."""
    id_number: str
    first_names: str
    last_names: str
    address: Optional[str] = None
    phone: Optional[str] = None


class ClientCreate(ClientBase):
    """Schema para crear un cliente (equivalente a DTO de entrada)."""
    pass


class ClientUpdate(BaseModel):
    """Schema para actualizar un cliente (todos los campos opcionales)."""
    id_number: Optional[str] = None
    first_names: Optional[str] = None
    last_names: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class ClientResponse(ClientBase):
    """Schema de respuesta de Client (equivalente a DTO de salida)."""
    id: int

    class Config:
        from_attributes = True
