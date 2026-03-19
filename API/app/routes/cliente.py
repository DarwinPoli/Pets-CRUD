from fastapi import APIRouter, Depends, HTTPException, Path, Query, Body
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.cliente import ClientCreate, ClientUpdate, ClientResponse
from app.crud import cliente as crud_client

# Equivalente a @RestController + @RequestMapping("/clients") en Spring
router = APIRouter(
    prefix="/clients",
    tags=["Clients"],
    responses={404: {"description": "Cliente no encontrado"}},
)


@router.post(
    "/",
    response_model=ClientResponse,
    status_code=201,
    summary="Crear un nuevo cliente",
    description="Registra un nuevo cliente en el sistema. Falla si la cédula (id_number) ya está registrada."
)
def create_client(
    client: ClientCreate = Body(
        ..., 
        description="Datos requeridos para crear un cliente, incluyendo cédula única (id_number), nombres y apellidos."
    ),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo cliente en la base de datos. Validará preventivamente la cédula de identidad.
    """
    # Verificar si ya existe un cliente con el mismo id_number
    existing = crud_client.get_client_by_id_number(db, client.id_number)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un cliente con id_number '{client.id_number}'"
        )
    return crud_client.create_client(db, client)


@router.get(
    "/",
    response_model=List[ClientResponse],
    summary="Listar clientes",
    description="Obtiene una lista paginada de todos los clientes registrados en el sistema."
)
def list_clients(
    skip: int = Query(0, description="Número de registros inicial a omitir (para paginación).", ge=0),
    limit: int = Query(100, description="Cantidad máxima de registros a devolver por página.", ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los clientes con soporte para paginación mediante `skip` y `limit`.
    """
    return crud_client.get_clients(db, skip=skip, limit=limit)


@router.get(
    "/{client_id}",
    response_model=ClientResponse,
    summary="Obtener un cliente por ID",
    description="Devuelve la información detallada de un cliente específico según su ID interno de base de datos."
)
def get_client(
    client_id: int = Path(..., description="El ID numérico interno y único del cliente a buscar (Autogenerado, no es la cédula).", gt=0),
    db: Session = Depends(get_db)
):
    """
    Busca un cliente usando su clave primaria `id`. 
    """
    db_client = crud_client.get_client(db, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_client


@router.put(
    "/{client_id}",
    response_model=ClientResponse,
    summary="Actualizar un cliente",
    description="Actualiza la información de un cliente existente. Se le debe pasar un cuerpo JSON; los campos omitidos mantendrán su valor actual."
)
def update_client(
    client_id: int = Path(..., description="El ID numérico interno del cliente a actualizar.", gt=0),
    client: ClientUpdate = Body(
        ..., 
        description="Objeto con los campos a modificar. Todos los atributos son completamente opcionales."
    ),
    db: Session = Depends(get_db)
):
    """
    Realiza una actualización parcial (patch/put) a los datos del cliente especificado.
    """
    db_client = crud_client.update_client(db, client_id, client)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_client


@router.delete(
    "/{client_id}",
    status_code=204,
    summary="Eliminar un cliente",
    description="Elimina de forma permanente a un cliente del sistema basándose en su ID interno. Su eliminación está configurada en cascada, por lo que borrará indirectamente las mascotas relacionadas."
)
def delete_client(
    client_id: int = Path(..., description="El ID numérico interno del cliente que expidió su eliminación.", gt=0),
    db: Session = Depends(get_db)
):
    """
    Remueve un cliente permanentemente de la persistencia de datos y de relaciones mediante borrado en cascada CASCADE.
    """
    db_client = crud_client.delete_client(db, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return None
