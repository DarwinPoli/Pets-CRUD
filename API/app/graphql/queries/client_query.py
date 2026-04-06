import strawberry
from typing import Optional, List

from app.graphql.types.client_type import ClientType
from app.graphql.resolvers.client_resolver import resolve_clients, resolve_client


@strawberry.type
class ClientQuery:
    """Queries de lectura para la entidad Client."""

    @strawberry.field(description="Obtener todos los clientes con paginación.")
    def clients(self, skip: int = 0, limit: int = 100) -> List[ClientType]:
        return resolve_clients(skip, limit)

    @strawberry.field(description="Obtener un cliente específico por su ID.")
    def client(self, client_id: int) -> Optional[ClientType]:
        return resolve_client(client_id)
