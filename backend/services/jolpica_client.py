import httpx
from typing import Dict, Any, Optional
from config import settings

class JolpicaClient:
    """Client for the Jolpica F1 API (Ergast replacement)"""
    
    def __init__(self):
        self.base_url = settings.JOLPICA_F1_API
        
    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(f"{self.base_url}/{endpoint}.json", params=params, timeout=10.0)
            response.raise_for_status()
            return response.json()
            
    async def get_driver_standings(self, year: str = "current") -> Dict[str, Any]:
        """Fetch driver standings"""
        return await self._get(f"{year}/driverStandings")
        
    async def get_constructor_standings(self, year: str = "current") -> Dict[str, Any]:
        """Fetch constructor standings"""
        return await self._get(f"{year}/constructorStandings")
        
    async def get_race_results(self, year: str = "current", round_no: str = "last") -> Dict[str, Any]:
        """Fetch race results for a specific round or 'last'"""
        return await self._get(f"{year}/{round_no}/results")
        
    async def get_schedule(self, year: str = "current") -> Dict[str, Any]:
        """Fetch race schedule for a year"""
        return await self._get(f"{year}")
        
    async def get_next_race(self) -> Dict[str, Any]:
        """Fetch next upcoming race"""
        return await self._get("current/next")

jolpica_client = JolpicaClient()
