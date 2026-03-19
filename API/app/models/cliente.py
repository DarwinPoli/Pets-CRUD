from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Client(Base):
    """
    Entidad Client (equivalente a @Entity en JPA).
    Representa a los dueños de mascotas del centro veterinario.
    Mapea a la tabla 'clients' en la base de datos.
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_number = Column(String(20), unique=True, nullable=False)
    first_names = Column(String(100), nullable=False)
    last_names = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)

    # Relación 1 a muchos con Pet (equivalente a @OneToMany en JPA)
    pets = relationship("Pet", back_populates="client", cascade="all, delete-orphan")
