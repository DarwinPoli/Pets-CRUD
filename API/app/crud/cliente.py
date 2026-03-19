from sqlalchemy.orm import Session

from app.models.cliente import Client
from app.schemas.cliente import ClientCreate, ClientUpdate


def get_client(db: Session, client_id: int):
    """
    Busca un cliente por su ID.
    Equivalente a entityManager.find() en JPA.
    """
    return db.query(Client).filter(Client.id == client_id).first()


def get_client_by_id_number(db: Session, id_number: str):
    """
    Busca un cliente por su número de identificación (cédula).
    """
    return db.query(Client).filter(Client.id_number == id_number).first()


def get_clients(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene todos los clientes con paginación.
    Equivalente a una query SELECT * con LIMIT/OFFSET.
    """
    return db.query(Client).offset(skip).limit(limit).all()


def create_client(db: Session, client: ClientCreate):
    """
    Crea un nuevo cliente.
    Equivalente a entityManager.persist() en JPA.
    """
    db_client = Client(
        id_number=client.id_number,
        first_names=client.first_names,
        last_names=client.last_names,
        address=client.address,
        phone=client.phone,
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


def update_client(db: Session, client_id: int, client: ClientUpdate):
    """
    Actualiza un cliente existente.
    Equivalente a entityManager.merge() en JPA.
    Solo actualiza los campos que fueron enviados (no None).
    """
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        return None

    update_data = client.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)

    db.commit()
    db.refresh(db_client)
    return db_client


def delete_client(db: Session, client_id: int):
    """
    Elimina un cliente por su ID.
    Equivalente a entityManager.remove() en JPA.
    """
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        return None

    db.delete(db_client)
    db.commit()
    return db_client
