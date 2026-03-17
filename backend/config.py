import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "F1 Nexus API"
    API_V1_STR: str = "/api/v1"
    
    # Database — set DATABASE_URL for PostgreSQL (Supabase), falls back to local SQLite
    DATABASE_URL: str = ""
    SQLITE_URL: str = "sqlite:///./f1nexus.db"
    
    # External API URLs
    JOLPICA_F1_API: str = "https://api.jolpi.ca/ergast/f1"
    OPENF1_API: str = "https://api.openf1.org/v1"
    
    # Cache settings
    CACHE_DIR: str = os.path.join(os.path.dirname(__file__), "data", "cache")
    CACHE_TTL_SECONDS: int = 3600
    
    # AI Settings — OLLAMA_HOST is overridden by Docker env var (http://ollama:11434)
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    USE_OLLAMA: bool = True

    # Resend — set RESEND_API_KEY in deployment environment variables
    # RESEND_FROM_EMAIL must use a verified domain (or onboarding@resend.dev for dev/testing)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "F1 Nexus <onboarding@resend.dev>"

    # Public URL shown in reminder emails (override in production)
    APP_URL: str = "http://localhost:3000"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Ensure cache directory exists
os.makedirs(settings.CACHE_DIR, exist_ok=True)
