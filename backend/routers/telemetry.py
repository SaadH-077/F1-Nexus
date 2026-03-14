from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from services.fastf1_service import fastf1_service
from services.openf1_client import openf1_client

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"],
)

@router.get("/session/{year}/{race}/{session_type}/driver/{driver}")
async def get_driver_telemetry(year: int, race: str, session_type: str, driver: str, lap: Optional[str] = Query(None, description="Lap number. If not provided, fastest lap is used.")) -> Dict[str, Any]:
    """
    Get detailed telemetry for a driver's lap in a session via FastF1.
    Example: year=2023, race=Monaco, session_type=Q, driver=VER
    """
    return await fastf1_service.get_session_telemetry(year, race, session_type, driver, lap)


@router.get("/openf1/car_data")
async def get_live_car_data(session_key: int, driver_number: int) -> Dict[str, Any]:
    """Get raw car telemetry from OpenF1 API"""
    try:
        data = await openf1_client.get_car_data(session_key, driver_number)
        return {"data": data}
    except Exception as e:
        return {"error": str(e)}

@router.get("/openf1/pit_stops")
async def get_pit_stops(session_key: int) -> Dict[str, Any]:
    """Get pit stops for a session from OpenF1 API"""
    try:
        data = await openf1_client.get_pit_stops(session_key)
        return {"data": data}
    except Exception as e:
        return {"error": str(e)}
