import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "F1 Nexus API"
    API_V1_STR: str = "/api/v1"
    
    # SQLite Database
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

    # SMTP — set these in a .env file or deployment environment variables
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""          # your Gmail / SMTP address
    SMTP_PASS: str = ""          # Gmail App Password (not your login password)
    SMTP_FROM_NAME: str = "F1 Nexus"

    # Public URL shown in reminder emails (override in production)
    APP_URL: str = "http://localhost:3000"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Ensure cache directory exists
os.makedirs(settings.CACHE_DIR, exist_ok=True)
