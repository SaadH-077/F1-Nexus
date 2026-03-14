from fastapi import APIRouter
from typing import Dict, Any
from services.jolpica_client import jolpica_client

router = APIRouter(
    prefix="/races",
    tags=["Races"],
)

@router.get("/schedule")
async def get_schedule(year: str = "current") -> Dict[str, Any]:
    """Get the full race schedule for a specific year."""
    try:
        data = await jolpica_client.get_schedule(year)
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        result = []
        for r in races:
            result.append({
                "round": r.get("round"),
                "raceName": r.get("raceName"),
                "circuit": r.get("Circuit", {}).get("circuitName"),
                "date": f"{r.get('date')} {r.get('time', '')}".strip()
            })
        return {"year": year, "schedule": result}
    except Exception as e:
        return {"error": str(e)}

@router.get("/next")
async def get_next_race() -> Dict[str, Any]:
    """Get the next upcoming race on the calendar."""
    try:
        data = await jolpica_client.get_next_race()
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            return {"race": None}
        r = races[0]

        # Build session schedule from Jolpica fields
        session_fields = [
            ("FirstPractice", "FP1"),
            ("SecondPractice", "FP2"),
            ("Sprint", "Sprint"),
            ("SprintQualifying", "Sprint Qualifying"),
            ("ThirdPractice", "FP3"),
            ("Qualifying", "Qualifying"),
        ]
        sessions = []
        for field, label in session_fields:
            s = r.get(field)
            if s:
                date = s.get("date", "")
                time = s.get("time", "")
                if date:
                    iso = f"{date}T{time}" if time else f"{date}T00:00:00Z"
                    sessions.append({"label": label, "date": iso})
        # Sort by date
        sessions.sort(key=lambda x: x["date"])

        circuit = r.get("Circuit", {})
        return {
            "race": {
                "round": r.get("round"),
                "raceName": r.get("raceName"),
                "circuit": circuit.get("circuitName"),
                "locality": circuit.get("Location", {}).get("locality"),
                "country": circuit.get("Location", {}).get("country"),
                "date": f"{r.get('date')}T{r.get('time', '00:00:00Z')}".rstrip(),
                "circuitWikiUrl": circuit.get("url", ""),
                "sessions": sessions,
            }
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/last/results")
async def get_last_race_results() -> Dict[str, Any]:
    """Shortcut to get results for the most recent completed race."""
    try:
        data = await jolpica_client.get_race_results("current", "last")
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            return {"race": None, "results": []}
        race_info = races[0]
        results = []
        for r in race_info.get("Results", []):
            results.append({
                "position": r.get("position"),
                "driver": r.get("Driver", {}).get("code"),
                "driverName": f"{r.get('Driver', {}).get('givenName')} {r.get('Driver', {}).get('familyName')}",
                "constructor": r.get("Constructor", {}).get("name"),
                "points": r.get("points"),
                "grid": r.get("grid"),
                "status": r.get("status"),
                "time": r.get("Time", {}).get("time", r.get("status")),
            })
        return {
            "race": {
                "name": race_info.get("raceName"),
                "circuit": race_info.get("Circuit", {}).get("circuitName"),
                "date": race_info.get("date"),
            },
            "results": results,
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/{year}/{round_no}/results")
async def get_race_results(year: str = "current", round_no: str = "last") -> Dict[str, Any]:
    """Get the race results for a specific year and round."""
    try:
        data = await jolpica_client.get_race_results(year, round_no)
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            return {"race": None, "results": []}
            
        race_info = races[0]
        results = []
        for r in race_info.get("Results", []):
            results.append({
                "position": r.get("position"),
                "driver": r.get("Driver", {}).get("code"),
                "driverName": f"{r.get('Driver', {}).get('givenName')} {r.get('Driver', {}).get('familyName')}",
                "constructor": r.get("Constructor", {}).get("name"),
                "points": r.get("points"),
                "grid": r.get("grid"),
                "status": r.get("status"),
                "time": r.get("Time", {}).get("time", r.get("status")) # Time string e.g. "+0.725s" or status "DNF"
            })
            
        return {
            "race": {
                "name": race_info.get("raceName"),
                "circuit": race_info.get("Circuit", {}).get("circuitName"),
                "date": race_info.get("date")
            },
            "results": results
        }
    except Exception as e:
        return {"error": str(e)}
