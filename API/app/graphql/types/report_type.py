import strawberry
from typing import Optional, List


@strawberry.type(description="Medicamento con el total de mascotas que lo usan.")
class MedicationReportType:
    """Tipo para el reporte de medicamentos."""
    medication_id: int
    name: str
    description: Optional[str] = None
    dosage: Optional[str] = None
    total_pets: int


@strawberry.type(description="Información resumida de una mascota dentro de un reporte.")
class PetSummaryType:
    """Resumen de mascota para reportes (nombre, raza y sus medicamentos)."""
    name: str
    breed: Optional[str] = None
    medications: List[str] = strawberry.field(
        default_factory=list,
        description="Nombres de los medicamentos asignados."
    )


@strawberry.type(description="Cliente con resumen de sus mascotas y medicamentos asociados.")
class ClientReportType:
    """Tipo para el reporte de clientes."""
    client_id: int
    id_number: str
    first_names: str
    last_names: str
    phone: Optional[str] = None
    total_pets: int
    pets: List[PetSummaryType] = strawberry.field(default_factory=list)


@strawberry.type(description="Medicamento con su dosis, usado en el reporte por cliente.")
class MedicationSummaryType:
    """Resumen de medicamento para el reporte por cliente."""
    name: str
    dosage: Optional[str] = None


@strawberry.type(description="Mascota con sus medicamentos detallados, para reporte por cliente.")
class PetMedicationDetailType:
    """Detalle de mascota con medicamentos para reporte por cliente específico."""
    pet_name: str
    medications: List[MedicationSummaryType] = strawberry.field(default_factory=list)


@strawberry.type(description="Reporte completo de medicamentos por un cliente específico.")
class ClientMedicationReportType:
    """Tipo para el reporte de medicamentos filtrado por cliente."""
    client: str
    client_id: int
    id_number: str
    pets: List[PetMedicationDetailType] = strawberry.field(default_factory=list)
