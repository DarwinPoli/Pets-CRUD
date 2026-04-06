from typing import List

from sqlalchemy.orm import joinedload
from sqlalchemy import func

from app.database import SessionLocal
from app.models.cliente import Client
from app.models.mascota import Pet
from app.models.medicamento import Medication
from app.models.pet_medication import pet_medications
from app.graphql.types.report_type import (
    MedicationReportType,
    ClientReportType,
    PetSummaryType,
    ClientMedicationReportType,
    PetMedicationDetailType,
    MedicationSummaryType,
)


def resolve_report_medications() -> List[MedicationReportType]:
    """Reporte de medicamentos con total de mascotas que los usan.
    Reutiliza la misma lógica de la ruta /reports/medications."""
    db = SessionLocal()
    try:
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
            MedicationReportType(
                medication_id=r.medication_id,
                name=r.name,
                description=r.description,
                dosage=r.dosage,
                total_pets=r.total_pets,
            )
            for r in results
        ]
    finally:
        db.close()


def resolve_report_clients() -> List[ClientReportType]:
    """Reporte de clientes con resumen de mascotas y medicamentos.
    Reutiliza la misma lógica de la ruta /reports/clients."""
    db = SessionLocal()
    try:
        clients = (
            db.query(Client)
            .options(joinedload(Client.pets).joinedload(Pet.medications))
            .all()
        )

        return [
            ClientReportType(
                client_id=client.id,
                id_number=client.id_number,
                first_names=client.first_names,
                last_names=client.last_names,
                phone=client.phone,
                total_pets=len(client.pets),
                pets=[
                    PetSummaryType(
                        name=pet.name,
                        breed=pet.breed,
                        medications=[med.name for med in pet.medications],
                    )
                    for pet in client.pets
                ],
            )
            for client in clients
        ]
    finally:
        db.close()


def resolve_report_medications_by_client(client_id: int) -> ClientMedicationReportType:
    """Reporte de medicamentos de un cliente específico.
    Reutiliza la misma lógica de la ruta /reports/medications-by-client/{client_id}."""
    db = SessionLocal()
    try:
        client = (
            db.query(Client)
            .options(joinedload(Client.pets).joinedload(Pet.medications))
            .filter(Client.id == client_id)
            .first()
        )

        if not client:
            raise ValueError(f"Cliente con id {client_id} no encontrado")

        return ClientMedicationReportType(
            client=f"{client.first_names} {client.last_names}",
            client_id=client.id,
            id_number=client.id_number,
            pets=[
                PetMedicationDetailType(
                    pet_name=pet.name,
                    medications=[
                        MedicationSummaryType(
                            name=med.name,
                            dosage=med.dosage,
                        )
                        for med in pet.medications
                    ],
                )
                for pet in client.pets
            ],
        )
    finally:
        db.close()
