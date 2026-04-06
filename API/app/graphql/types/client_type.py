import strawberry
from typing import Optional


@strawberry.type(description="Representa a un cliente (dueño de mascotas) del centro veterinario.")
class ClientType:
    """Tipo GraphQL para la entidad Client."""
    id: int
    id_number: str
    first_names: str
    last_names: str
    address: Optional[str] = None
    phone: Optional[str] = None


@strawberry.input(description="Datos requeridos para crear un nuevo cliente.")
class ClientInput:
    """Input para la mutation de crear cliente."""
    id_number: str
    first_names: str
    last_names: str
    address: Optional[str] = None
    phone: Optional[str] = None


@strawberry.input(description="Datos opcionales para actualizar un cliente existente.")
class ClientUpdateInput:
    """Input para la mutation de actualizar cliente. Todos los campos son opcionales."""
    id_number: Optional[str] = None
    first_names: Optional[str] = None
    last_names: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
