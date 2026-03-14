from fastapi import APIRouter
from typing import Dict, Any
from services.prediction_model import prediction_model

router = APIRouter(
    prefix="/predictor",
    tags=["Predictor"],
)

@router.get("/{year}/{race}")
async def get_predictions(year: int, race: str) -> Dict[str, Any]:
    """
    Get ML predictions for a specific race.
    """
    try:
        data = prediction_model.predict_race_outcome(year, race)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}
