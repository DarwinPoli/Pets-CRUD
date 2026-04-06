import strawberry
from typing import Optional, List

from app.graphql.types.pet_type import PetType
from app.graphql.resolvers.pet_resolver import resolve_pets, resolve_pet


@strawberry.type
class PetQuery:
    """Queries de lectura para la entidad Pet."""

    @strawberry.field(description="Obtener todas las mascotas con paginación. Incluye sus medicamentos.")
    def pets(self, skip: int = 0, limit: int = 100) -> List[PetType]:
        return resolve_pets(skip, limit)

    @strawberry.field(description="Obtener una mascota específica por su ID. Incluye sus medicamentos.")
    def pet(self, pet_id: int) -> Optional[PetType]:
        return resolve_pet(pet_id)
