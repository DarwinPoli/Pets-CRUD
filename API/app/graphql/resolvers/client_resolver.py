from typing import Optional, List

from app.database import SessionLocal
from app.crud import cliente as crud_client
from app.schemas.cliente import ClientCreate, ClientUpdate
from app.graphql.types.client_type import ClientType, ClientInput, ClientUpdateInput


def _to_client_type(client) -> ClientType:
    """Convierte un modelo SQLAlchemy Client a un tipo GraphQL ClientType."""
    return ClientType(
        id=client.id,
        id_number=client.id_number,
        first_names=client.first_names,
        last_names=client.last_names,
        address=client.address,
        phone=client.phone,
    )


# ─── Queries ─────────────────────────────────────────────────────────────────


def resolve_clients(skip: int = 0, limit: int = 100) -> List[ClientType]:
    """Obtiene todos los clientes. Reutiliza crud_client.get_clients()."""
    db = SessionLocal()
    try:
        clients = crud_client.get_clients(db, skip=skip, limit=limit)
        return [_to_client_type(c) for c in clients]
    finally:
        db.close()


def resolve_client(client_id: int) -> Optional[ClientType]:
    """Obtiene un cliente por ID. Reutiliza crud_client.get_client()."""
    db = SessionLocal()
    try:
        client = crud_client.get_client(db, client_id)
        if not client:
            return None
        return _to_client_type(client)
    finally:
        db.close()

def resolve_client_by_id_number(id_number: str) -> Optional[ClientType]:
    """Obtiene un cliente por número de identificación. Reutiliza crud_client.get_client_by_id_number()."""
    db = SessionLocal()
    try:
        client = crud_client.get_client_by_id_number(db, id_number)
        if not client:
            return None
        return _to_client_type(client)
    finally:
        db.close()

# ─── Mutations ───────────────────────────────────────────────────────────────


def resolve_create_client(input: ClientInput) -> ClientType:
    """Crea un nuevo cliente. Reutiliza crud_client.create_client()."""
    db = SessionLocal()
    try:
        # Verificar si ya existe un cliente con el mismo id_number
        existing = crud_client.get_client_by_id_number(db, input.id_number)
        if existing:
            raise ValueError(f"Ya existe un cliente con id_number '{input.id_number}'")

        # Convertir el input de GraphQL al schema de Pydantic que espera el CRUD
        client_data = ClientCreate(
            id_number=input.id_number,
            first_names=input.first_names,
            last_names=input.last_names,
            address=input.address,
            phone=input.phone,
        )
        client = crud_client.create_client(db, client_data)
        return _to_client_type(client)
    finally:
        db.close()


def resolve_update_client(client_id: int, input: ClientUpdateInput) -> ClientType:
    """Actualiza un cliente existente. Reutiliza crud_client.update_client()."""
    db = SessionLocal()
    try:
        # Convertir el input de GraphQL al schema de Pydantic que espera el CRUD
        update_data = ClientUpdate(
            id_number=input.id_number,
            first_names=input.first_names,
            last_names=input.last_names,
            address=input.address,
            phone=input.phone,
        )
        client = crud_client.update_client(db, client_id, update_data)
        if not client:
            raise ValueError(f"Cliente con id {client_id} no encontrado")
        return _to_client_type(client)
    finally:
        db.close()


def resolve_delete_client(client_id: int) -> bool:
    """Elimina un cliente. Reutiliza crud_client.delete_client()."""
    db = SessionLocal()
    try:
        client = crud_client.delete_client(db, client_id)
        if not client:
            raise ValueError(f"Cliente con id {client_id} no encontrado")
        return True
    finally:
        db.close()
