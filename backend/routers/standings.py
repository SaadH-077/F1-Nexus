from fastapi import APIRouter
from typing import Dict, Any
from services.jolpica_client import jolpica_client

router = APIRouter(
    prefix="/standings",
    tags=["Standings"],
)

@router.get("/drivers")
async def get_driver_standings(year: str = "current") -> Dict[str, Any]:
    """Get driver standings for a specific year or current year."""
    try:
        data = await jolpica_client.get_driver_standings(year)
        standings = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
        if not standings:
            return {"standings": []}
            
        result = []
        for driver in standings[0].get("DriverStandings", []):
            result.append({
                "position": driver.get("position"),
                "points": driver.get("points"),
                "wins": driver.get("wins"),
                "driver": {
                    "id": driver.get("Driver", {}).get("driverId"),
                    "code": driver.get("Driver", {}).get("code"),
                    "name": f"{driver.get('Driver', {}).get('givenName')} {driver.get('Driver', {}).get('familyName')}"
                },
                "constructor": driver.get("Constructors", [{}])[0].get("name")
            })
        return {"year": year, "standings": result}
    except Exception as e:
        return {"error": str(e)}

@router.get("/constructors")
async def get_constructor_standings(year: str = "current") -> Dict[str, Any]:
    """Get constructor standings for a specific year or current year."""
    try:
        data = await jolpica_client.get_constructor_standings(year)
        standings = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
        if not standings:
            return {"standings": []}
            
        result = []
        for constructor in standings[0].get("ConstructorStandings", []):
            result.append({
                "position": constructor.get("position"),
                "points": constructor.get("points"),
                "wins": constructor.get("wins"),
                "constructor": {
                    "id": constructor.get("Constructor", {}).get("constructorId"),
                    "name": constructor.get("Constructor", {}).get("name")
                }
            })
        return {"year": year, "standings": result}
    except Exception as e:
        return {"error": str(e)}
