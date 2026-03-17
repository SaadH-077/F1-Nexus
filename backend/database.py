from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# Use DATABASE_URL (PostgreSQL) if set, otherwise fall back to local SQLite
if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgresql"):
    engine = create_engine(settings.DATABASE_URL)
else:
    engine = create_engine(
        settings.SQLITE_URL, connect_args={"check_same_thread": False}
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
