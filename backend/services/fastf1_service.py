import asyncio
import fastf1
import pandas as pd
from typing import Dict, Any, Optional
from config import settings
import logging
import threading
from functools import lru_cache

# Configure FastF1 caching — fail silently if directory isn't writable (e.g. Railway)
try:
    import os
    os.makedirs(settings.CACHE_DIR, exist_ok=True)
    fastf1.Cache.enable_cache(settings.CACHE_DIR)
except Exception as _cache_err:
    print(f"[FastF1] Cache disabled: {_cache_err}")
logging.getLogger("fastf1").setLevel(logging.WARNING)

class FastF1Service:
    """Service for obtaining telemetry data via FastF1."""
    
    def __init__(self):
        self._session_cache = {}
        self._session_lock = threading.Lock()
        self._telemetry_cache: Dict[str, Any] = {}
        self._telemetry_lock = threading.Lock()
        
    def _get_loaded_session(self, year: int, race: str, session_type: str):
        key = f"{year}_{race}_{session_type}"
        with self._session_lock:
            if key not in self._session_cache:
                logging.info(f"Loading session into memory cache: {key}")
                session = fastf1.get_session(year, race, session_type)
                session.load(telemetry=True, weather=False, messages=False)
                self._session_cache[key] = session
        return self._session_cache[key]

    def _get_session_telemetry_sync(self, year: int, race: str, session_type: str, driver: str, lap: Optional[str] = None) -> Dict[str, Any]:
        """
        Synchronous implementation — must run in a thread pool via get_session_telemetry().
        FastF1 uses blocking I/O and must never run directly on the async event loop.
        """
        cache_key = f"{year}_{race}_{session_type}_{driver}_{lap}"
        with self._telemetry_lock:
            if cache_key in self._telemetry_cache:
                 return self._telemetry_cache[cache_key]

        try:
            session = self._get_loaded_session(year, race, session_type)

            result_data = None
            if not session.results.empty:
                driver_res = session.results.loc[session.results['Abbreviation'] == driver]
                if not driver_res.empty:
                    res_dict = driver_res.to_dict(orient='records')[0]
                    result_data = {
                        "Position": None if pd.isna(res_dict.get('Position')) else int(res_dict.get('Position')),
                        "GridPosition": None if pd.isna(res_dict.get('GridPosition')) else int(res_dict.get('GridPosition')),
                        "Q1": None if pd.isna(res_dict.get('Q1')) else str(res_dict.get('Q1')).split()[-1] if not pd.isna(res_dict.get('Q1')) and str(res_dict.get('Q1')) != 'NaT' else None,
                        "Q2": None if pd.isna(res_dict.get('Q2')) else str(res_dict.get('Q2')).split()[-1] if not pd.isna(res_dict.get('Q2')) and str(res_dict.get('Q2')) != 'NaT' else None,
                        "Q3": None if pd.isna(res_dict.get('Q3')) else str(res_dict.get('Q3')).split()[-1] if not pd.isna(res_dict.get('Q3')) and str(res_dict.get('Q3')) != 'NaT' else None,
                        "Status": str(res_dict.get('Status', '')),
                        "Points": None if pd.isna(res_dict.get('Points')) else float(res_dict.get('Points'))
                    }

            laps = session.laps.pick_driver(driver)
            if laps.empty:
                return {"error": f"No laps found for driver {driver}", "driver_results": result_data}

            available_laps = laps['LapNumber'].dropna().astype(int).tolist()

            target_lap = None
            if lap and lap.isdigit() and int(lap) in available_laps:
                target_lap_df = laps[laps['LapNumber'] == int(lap)]
                if not target_lap_df.empty:
                    target_lap = target_lap_df.iloc[0]
            
            if target_lap is None:
                target_lap = laps.pick_fastest()

            if target_lap is None or pd.isna(target_lap["LapTime"]):
                return {"error": f"No valid requested lap or fastest lap for driver {driver}", "driver_results": result_data, "available_laps": available_laps}

            telemetry = target_lap.get_telemetry()

            data: Dict[str, Any] = {
                "Distance": telemetry["Distance"].tolist(),
                "Speed": telemetry["Speed"].tolist(),
                "Throttle": telemetry["Throttle"].tolist(),
                "Brake": telemetry["Brake"].tolist(),
                "nGear": telemetry["nGear"].tolist(),
                "RPM": telemetry["RPM"].tolist(),
                # For track map
                "X": telemetry["X"].tolist(),
                "Y": telemetry["Y"].tolist(),
                "Z": telemetry["Z"].tolist(),
                "lap_time": str(target_lap["LapTime"]),
                "sector_1": str(target_lap["Sector1Time"]),
                "sector_2": str(target_lap["Sector2Time"]),
                "sector_3": str(target_lap["Sector3Time"]),
                "lap_number": int(target_lap["LapNumber"])
            }

            # Replace NaNs with None for JSON serialisation
            for key, value in data.items():
                if isinstance(value, list):
                    data[key] = [None if pd.isna(x) else x for x in value]

            final_result = {
                "data": data,
                "driver_results": result_data,
                "available_laps": available_laps
            }
            
            with self._telemetry_lock:
                 self._telemetry_cache[cache_key] = final_result
            return final_result

        except Exception as e:
            err = {"error": str(e)}
            with self._telemetry_lock:
                 self._telemetry_cache[cache_key] = err
            return err

    async def get_session_telemetry(self, year: int, race: str, session_type: str, driver: str, lap: Optional[str] = None) -> Dict[str, Any]:
        """
        Async entry point: offloads the blocking FastF1 call to a thread pool
        so the event loop stays responsive while telemetry data is being fetched.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._get_session_telemetry_sync,
            year,
            race,
            session_type,
            driver,
            lap
        )

fastf1_service = FastF1Service()
