from fastapi import APIRouter
from typing import Dict, Any
from services.ai_analyst import ai_analyst

router = APIRouter(
    prefix="/analyst",
    tags=["Analyst"],
)

@router.get("/{year}/{race}")
async def get_race_analysis(year: int, race: str) -> Dict[str, Any]:
    """
    Get AI-generated race analysis.
    """
    try:
        data = await ai_analyst.analyze_race(year, race)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}
