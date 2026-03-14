from fastapi import APIRouter
from typing import Dict, Any
from pydantic import BaseModel
from services.strategy_engine import strategy_engine

router = APIRouter(
    prefix="/strategy",
    tags=["Strategy"],
)

class StrategyRequest(BaseModel):
    driver: str
    track: str
    starting_compound: str
    stops: int
    total_laps: int = 60

@router.post("/simulate")
async def simulate_strategy(req: StrategyRequest) -> Dict[str, Any]:
    """
    Run a Monte Carlo strategy simulation for the given parameters.
    """
    try:
        result = strategy_engine.simulate_strategy(
            driver=req.driver,
            track=req.track,
            starting_compound=req.starting_compound,
            target_stops=req.stops,
            total_laps=req.total_laps
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
