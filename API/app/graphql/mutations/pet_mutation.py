import strawberry

from app.graphql.types.pet_type import PetType, PetInput, PetUpdateInput
from app.graphql.resolvers.pet_resolver import (
    resolve_create_pet,
    resolve_update_pet,
    resolve_delete_pet,
)


@strawberry.type
class PetMutation:
    """Mutations de escritura para la entidad Pet (crear, actualizar, eliminar)."""

    @strawberry.mutation(description="Crear una nueva mascota. Valida que el cliente exista y la identificación sea única.")
    def create_pet(self, input: PetInput) -> PetType:
        return resolve_create_pet(input)

    @strawberry.mutation(description="Actualizar una mascota existente. Solo se modifican los campos enviados.")
    def update_pet(self, pet_id: int, input: PetUpdateInput) -> PetType:
        return resolve_update_pet(pet_id, input)

    @strawberry.mutation(description="Eliminar una mascota permanentemente.")
    def delete_pet(self, pet_id: int) -> bool:
        return resolve_delete_pet(pet_id)
