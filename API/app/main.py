from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import cliente, medicamento, mascota, reportes

# Importar modelos para que SQLAlchemy los registre en metadata
import app.models  # noqa: F401

# Crear todas las tablas en la base de datos (equivalente a hibernate.hbm2ddl.auto=update)
Base.metadata.create_all(bind=engine)

# Crear instancia de FastAPI (equivalente a SpringApplication)
app = FastAPI(
    title="PETS S.A. - API",
    description="API REST para el centro veterinario PETS S.A. de Cartagena. "
                "Gestión de clientes, mascotas, medicamentos y reportes.",
    version="1.0.0",
    contact={
        "name": "PETS S.A.",
        "email": "admin@petssa.com",
    },
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers (equivalente a @ComponentScan en Spring)
app.include_router(cliente.router)
app.include_router(medicamento.router)
app.include_router(mascota.router)
app.include_router(reportes.router)


@app.get("/", tags=["Root"])
def root():
    """Endpoint raíz de la API."""
    return {
        "mensaje": "Bienvenido a la API de PETS S.A.",
        "documentacion": "/docs",
        "version": "1.0.0"
    }
