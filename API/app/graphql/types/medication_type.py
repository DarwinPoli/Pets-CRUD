import strawberry
from typing import Optional


@strawberry.type(description="Representa un medicamento disponible en el centro veterinario.")
class MedicationType:
    """Tipo GraphQL para la entidad Medication."""
    id: int
    name: str
    description: Optional[str] = None
    dosage: Optional[str] = None


@strawberry.input(description="Datos requeridos para crear un nuevo medicamento.")
class MedicationInput:
    """Input para la mutation de crear medicamento."""
    name: str
    description: Optional[str] = None
    dosage: Optional[str] = None


@strawberry.input(description="Datos opcionales para actualizar un medicamento existente.")
class MedicationUpdateInput:
    """Input para la mutation de actualizar medicamento. Todos los campos son opcionales."""
    name: Optional[str] = None
    description: Optional[str] = None
    dosage: Optional[str] = None
