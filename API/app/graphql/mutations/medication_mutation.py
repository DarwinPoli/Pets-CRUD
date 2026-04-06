import strawberry

from app.graphql.types.medication_type import MedicationType, MedicationInput, MedicationUpdateInput
from app.graphql.resolvers.medication_resolver import (
    resolve_create_medication,
    resolve_update_medication,
    resolve_delete_medication,
)


@strawberry.type
class MedicationMutation:
    """Mutations de escritura para la entidad Medication (crear, actualizar, eliminar)."""

    @strawberry.mutation(description="Crear un nuevo medicamento.")
    def create_medication(self, input: MedicationInput) -> MedicationType:
        return resolve_create_medication(input)

    @strawberry.mutation(description="Actualizar un medicamento existente. Solo se modifican los campos enviados.")
    def update_medication(self, medication_id: int, input: MedicationUpdateInput) -> MedicationType:
        return resolve_update_medication(medication_id, input)

    @strawberry.mutation(description="Eliminar un medicamento permanentemente.")
    def delete_medication(self, medication_id: int) -> bool:
        return resolve_delete_medication(medication_id)
