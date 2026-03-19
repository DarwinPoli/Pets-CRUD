import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Cargar variables de entorno desde .env
load_dotenv()

# Conexión a la base de datos PostgreSQL en Supabase
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada. Revisa tu archivo .env")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependencia de FastAPI para obtener una sesión de base de datos.
    Se usa con Depends(get_db) en cada ruta.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
