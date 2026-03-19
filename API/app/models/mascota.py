from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.pet_medication import pet_medications


class Pet(Base):
    """
    Entidad Pet (equivalente a @Entity en JPA).
    Representa a las mascotas registradas en el centro veterinario.
    Mapea a la tabla 'pets' en la base de datos.
    """
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    identification = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    breed = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    weight = Column(DECIMAL(5, 2), nullable=True)

    # Clave foránea (equivalente a @ManyToOne + @JoinColumn en JPA)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)

    # Relación muchos a uno con Client
    client = relationship("Client", back_populates="pets")

    # Relación muchos a muchos con Medication
    medications = relationship(
        "Medication",
        secondary=pet_medications,
        back_populates="pets"
    )
