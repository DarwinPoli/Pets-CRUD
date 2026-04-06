import strawberry
from typing import Optional, List

from app.graphql.types.medication_type import MedicationType
from app.graphql.resolvers.medication_resolver import resolve_medications, resolve_medication


@strawberry.type
class MedicationQuery:
    """Queries de lectura para la entidad Medication."""

    @strawberry.field(description="Obtener todos los medicamentos con paginación.")
    def medications(self, skip: int = 0, limit: int = 100) -> List[MedicationType]:
        return resolve_medications(skip, limit)

    @strawberry.field(description="Obtener un medicamento específico por su ID.")
    def medication(self, medication_id: int) -> Optional[MedicationType]:
        return resolve_medication(medication_id)
