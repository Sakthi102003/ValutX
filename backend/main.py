from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, vault, audit
from app.db.session import engine, Base
from app.models import user, item, audit as audit_model
from app.core.config import settings

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ValutX API",
    description="Zero-Knowledge Password Manager Backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(vault.router, prefix="/vault", tags=["Vault"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "ValutX Secure Backend is Running"}
