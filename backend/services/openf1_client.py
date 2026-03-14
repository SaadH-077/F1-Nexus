import httpx
from typing import List, Dict, Any, Optional
from config import settings

class OpenF1Client:
    """Client for the OpenF1 API (historical from 2023, car telemetry)"""
    
    def __init__(self):
        self.base_url = settings.OPENF1_API
        
    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/{endpoint}", params=params, timeout=15.0)
            response.raise_for_status()
            return response.json()
            
    async def get_sessions(self, year: Optional[int] = None, country_name: Optional[str] = None) -> List[Dict[str, Any]]:
        params = {}
        if year: params["year"] = year
        if country_name: params["country_name"] = country_name
        return await self._get("sessions", params)
        
    async def get_car_data(self, session_key: int, driver_number: int) -> List[Dict[str, Any]]:
        """Fetch raw car telemetry (speed, rpm, gear, throttle, brake)"""
        return await self._get("car_data", {"session_key": session_key, "driver_number": driver_number})
        
    async def get_position(self, session_key: int, driver_number: int) -> List[Dict[str, Any]]:
        """Fetch track position data (x, y, z)"""
        return await self._get("position", {"session_key": session_key, "driver_number": driver_number})
        
    async def get_pit_stops(self, session_key: int) -> List[Dict[str, Any]]:
        """Fetch pit stop data for a session"""
        return await self._get("pit", {"session_key": session_key})
        
    async def get_laps(self, session_key: int, driver_number: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch lap times and sector times"""
        params = {"session_key": session_key}
        if driver_number: params["driver_number"] = driver_number
        return await self._get("laps", params)

openf1_client = OpenF1Client()
