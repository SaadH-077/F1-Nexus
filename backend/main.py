import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from routers import standings, races, telemetry, strategy, predictor, analyst, news, subscribers


# ─── Scheduler ────────────────────────────────────────────────────────────────

async def _reminder_scheduler():
    """Background loop: check for upcoming sessions every 60 seconds."""
    while True:
        try:
            await subscribers.check_and_send_reminders()
        except Exception as e:
            print(f"[Scheduler] Error: {e}")
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    task = asyncio.create_task(_reminder_scheduler())
    yield
    task.cancel()


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(standings.router, prefix=settings.API_V1_STR)
app.include_router(races.router, prefix=settings.API_V1_STR)
app.include_router(telemetry.router, prefix=settings.API_V1_STR)
app.include_router(strategy.router, prefix=settings.API_V1_STR)
app.include_router(predictor.router, prefix=settings.API_V1_STR)
app.include_router(analyst.router, prefix=settings.API_V1_STR)
app.include_router(news.router, prefix=settings.API_V1_STR)
app.include_router(subscribers.router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {"message": "Welcome to F1 Nexus API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
