import strawberry

from app.graphql.types.client_type import ClientType, ClientInput, ClientUpdateInput
from app.graphql.resolvers.client_resolver import (
    resolve_create_client,
    resolve_update_client,
    resolve_delete_client,
)


@strawberry.type
class ClientMutation:
    """Mutations de escritura para la entidad Client (crear, actualizar, eliminar)."""

    @strawberry.mutation(description="Crear un nuevo cliente. Falla si la cédula ya está registrada.")
    def create_client(self, input: ClientInput) -> ClientType:
        return resolve_create_client(input)

    @strawberry.mutation(description="Actualizar un cliente existente. Solo se modifican los campos enviados.")
    def update_client(self, client_id: int, input: ClientUpdateInput) -> ClientType:
        return resolve_update_client(client_id, input)

    @strawberry.mutation(description="Eliminar un cliente permanentemente. Elimina sus mascotas en cascada.")
    def delete_client(self, client_id: int) -> bool:
        return resolve_delete_client(client_id)
