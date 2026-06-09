from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# Use DATABASE_URL (PostgreSQL) if set, otherwise fall back to local SQLite.
# Render/Heroku sometimes hand out the legacy "postgres://" scheme, which
# SQLAlchemy 2.0 no longer accepts — normalise it to "postgresql://".
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if database_url.startswith("postgresql"):
    # pool_pre_ping recycles connections dropped by the DB (free tiers idle out)
    engine = create_engine(database_url, pool_pre_ping=True)
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
