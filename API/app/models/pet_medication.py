from sqlalchemy import Table, Column, Integer, ForeignKey

from app.database import Base

# Tabla intermedia para relación muchos a muchos entre Pet y Medication
# Equivalente a @JoinTable en JPA
pet_medications = Table(
    "pet_medications",
    Base.metadata,
    Column("pet_id", Integer, ForeignKey("pets.id", ondelete="CASCADE"), primary_key=True),
    Column("medication_id", Integer, ForeignKey("medications.id", ondelete="CASCADE"), primary_key=True),
)
