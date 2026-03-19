from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base

# Tabla intermedia para la relación muchos a muchos (equivalente a @JoinTable en JPA)
from app.models.pet_medication import pet_medications


class Medication(Base):
    """
    Entidad Medication (equivalente a @Entity en JPA).
    Representa los medicamentos disponibles en el centro veterinario.
    Mapea a la tabla 'medications' en la base de datos.
    """
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    dosage = Column(String(100), nullable=True)

    # Relación muchos a muchos con Pet (equivalente a @ManyToMany(mappedBy) en JPA)
    pets = relationship(
        "Pet",
        secondary=pet_medications,
        back_populates="medications"
    )
