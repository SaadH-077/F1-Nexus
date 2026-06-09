from fastapi import APIRouter
from typing import Dict, Any, Optional
from pydantic import BaseModel
from services.strategy_engine import strategy_engine
from services.jolpica_client import jolpica_client

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


async def _driver_rank(driver_code: str) -> Optional[int]:
    """Look up a driver's current championship position by their code (e.g. VER)."""
    try:
        data = await jolpica_client.get_driver_standings("current")
        lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
        if not lists:
            return None
        for r in lists[0].get("DriverStandings", []):
            if r.get("Driver", {}).get("code", "").upper() == driver_code.upper():
                return int(r.get("position"))
    except Exception:
        pass
    return None


@router.post("/simulate")
async def simulate_strategy(req: StrategyRequest) -> Dict[str, Any]:
    """
    Run a Monte Carlo strategy simulation for the given parameters.
    """
    try:
        rank = await _driver_rank(req.driver)
        result = strategy_engine.simulate_strategy(
            driver=req.driver,
            track=req.track,
            starting_compound=req.starting_compound,
            target_stops=req.stops,
            total_laps=req.total_laps,
            driver_rank=rank,
        )
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
