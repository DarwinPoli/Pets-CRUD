from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Any

from app.database import get_db
from app.models.cliente import Client
from app.models.mascota import Pet
from app.models.medicamento import Medication
from app.models.pet_medication import pet_medications

# Equivalente a un Controller dedicado a reportes
router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/medications", response_model=List[Any])
def report_medications(db: Session = Depends(get_db)):
    """
    Reporte de medicamentos.
    Muestra todos los medicamentos con la cantidad de mascotas que lo usan.
    """
    results = (
        db.query(
            Medication.id.label("medication_id"),
            Medication.name,
            Medication.description,
            Medication.dosage,
            func.count(pet_medications.c.pet_id).label("total_pets"),
        )
        .outerjoin(pet_medications, Medication.id == pet_medications.c.medication_id)
        .group_by(Medication.id, Medication.name, Medication.description, Medication.dosage)
        .all()
    )

    return [
        {
            "medication_id": r.medication_id,
            "name": r.name,
            "description": r.description,
            "dosage": r.dosage,
            "total_pets": r.total_pets,
        }
        for r in results
    ]


@router.get("/clients", response_model=List[Any])
def report_clients(db: Session = Depends(get_db)):
    """
    Reporte de clientes.
    Muestra todos los clientes con la cantidad de mascotas registradas
    y los medicamentos que usan sus mascotas.
    """
    clients = (
        db.query(Client)
        .options(joinedload(Client.pets).joinedload(Pet.medications))
        .all()
    )

    return [
        {
            "client_id": client.id,
            "id_number": client.id_number,
            "first_names": client.first_names,
            "last_names": client.last_names,
            "phone": client.phone,
            "total_pets": len(client.pets),
            "pets": [
                {
                    "name": pet.name,
                    "breed": pet.breed,
                    "medications": [med.name for med in pet.medications],
                }
                for pet in client.pets
            ],
        }
        for client in clients
    ]


@router.get("/medications-by-client/{client_id}", response_model=Any)
def report_medications_by_client(client_id: int, db: Session = Depends(get_db)):
    """
    Reporte de medicamentos por cliente específico.
    Muestra todos los medicamentos asignados a las mascotas de un cliente.
    }
    """
    client = (
        db.query(Client)
        .options(joinedload(Client.pets).joinedload(Pet.medications))
        .filter(Client.id == client_id)
        .first()
    )

    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    return {
        "client": f"{client.first_names} {client.last_names}",
        "client_id": client.id,
        "id_number": client.id_number,
        "pets": [
            {
                "pet_name": pet.name,
                "medications": [
                    {
                        "name": med.name,
                        "dosage": med.dosage,
                    }
                    for med in pet.medications
                ],
            }
            for pet in client.pets
        ],
    }
