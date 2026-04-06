import strawberry
from typing import Optional, List

from app.graphql.types.medication_type import MedicationType


@strawberry.type(description="Representa una mascota registrada en el centro veterinario.")
class PetType:
    """Tipo GraphQL para la entidad Pet. Incluye relación con medicamentos."""
    id: int
    identification: str
    name: str
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    client_id: int
    medications: List[MedicationType] = strawberry.field(
        default_factory=list,
        description="Lista de medicamentos asignados a esta mascota (relación muchos a muchos)."
    )


@strawberry.input(description="Datos requeridos para registrar una nueva mascota.")
class PetInput:
    """Input para la mutation de crear mascota."""
    identification: str
    name: str
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    client_id: int
    medication_ids: Optional[List[int]] = strawberry.field(
        default_factory=list,
        description="IDs de los medicamentos a asignar a la mascota."
    )


@strawberry.input(description="Datos opcionales para actualizar una mascota existente.")
class PetUpdateInput:
    """Input para la mutation de actualizar mascota. Todos los campos son opcionales."""
    identification: Optional[str] = None
    name: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    client_id: Optional[int] = None
    medication_ids: Optional[List[int]] = None
