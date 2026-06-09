import asyncio
import gc
import fastf1
import pandas as pd
from typing import Dict, Any, Optional, List
from config import settings
import logging
import threading

# Configure FastF1 caching — fail silently if directory isn't writable (e.g. Railway)
try:
    import os
    os.makedirs(settings.CACHE_DIR, exist_ok=True)
    fastf1.Cache.enable_cache(settings.CACHE_DIR)
except Exception as _cache_err:
    print(f"[FastF1] Cache disabled: {_cache_err}")
logging.getLogger("fastf1").setLevel(logging.WARNING)

# Global single-flight lock. FastF1 loading a full race session peaks at
# several hundred MB; on a small instance (e.g. Render free = 512 MB) two
# concurrent loads will blow the memory limit and trigger an OOM restart.
# Serialising loads keeps peak memory to a single session at a time.
_LOAD_LOCK = threading.Lock()

# Cap how many telemetry points we return. Full race laps can have thousands
# of samples — downsampling keeps the JSON small (faster frontend, less memory)
# while preserving the shape of every trace.
_MAX_POINTS = 600

# How many extracted (small) telemetry results to keep in memory.
_RESULT_CACHE_MAX = 32


def _downsample(values: List[Any], n: int = _MAX_POINTS) -> List[Any]:
    """Evenly stride a list down to at most n points (keeps first & last)."""
    if len(values) <= n:
        return values
    step = len(values) / n
    return [values[min(int(i * step), len(values) - 1)] for i in range(n)]


class FastF1Service:
    """Service for obtaining telemetry data via FastF1."""

    def __init__(self):
        self._telemetry_cache: "dict[str, Any]" = {}
        self._telemetry_lock = threading.Lock()
        # At most ONE fully-loaded session is held in memory at a time. Multiple
        # drivers from the same session reuse it (fast); requesting a different
        # session evicts the previous one first (memory never accumulates).
        self._session_key: Optional[str] = None
        self._session = None

    def _get_session(self, year: int, race: str, session_type: str):
        """Return a loaded session, reusing the cached one or evicting+loading.
        Caller must hold _LOAD_LOCK."""
        key = f"{year}_{race}_{session_type}"
        if self._session_key == key and self._session is not None:
            return self._session
        # Evict the previous session before loading a new one to free memory.
        self._session = None
        self._session_key = None
        gc.collect()
        session = fastf1.get_session(year, race, session_type)
        session.load(telemetry=True, weather=False, messages=False)
        self._session = session
        self._session_key = key
        return session

    def _cache_get(self, key: str) -> Optional[Dict[str, Any]]:
        with self._telemetry_lock:
            return self._telemetry_cache.get(key)

    def _cache_put(self, key: str, value: Dict[str, Any]) -> None:
        with self._telemetry_lock:
            # Simple FIFO eviction to bound memory.
            if len(self._telemetry_cache) >= _RESULT_CACHE_MAX:
                self._telemetry_cache.pop(next(iter(self._telemetry_cache)))
            self._telemetry_cache[key] = value

    def _pick_lap(self, laps, lap: Optional[str], available_laps: List[int]):
        """
        Choose a lap to show telemetry for:
        1. the explicitly requested lap (if valid),
        2. otherwise the fastest lap,
        3. otherwise — for drivers who retired / set no timed lap — the most
           recent lap that still has telemetry, so we degrade gracefully
           instead of erroring out.
        """
        if lap and lap.isdigit() and int(lap) in available_laps:
            df = laps[laps["LapNumber"] == int(lap)]
            if not df.empty:
                return df.iloc[0]

        fastest = laps.pick_fastest()
        if fastest is not None and not pd.isna(fastest.get("LapTime")):
            return fastest

        # Fallback: walk laps newest→oldest and return the first with telemetry.
        for ln in reversed(available_laps):
            df = laps[laps["LapNumber"] == ln]
            if df.empty:
                continue
            candidate = df.iloc[0]
            try:
                if not candidate.get_telemetry().empty:
                    return candidate
            except Exception:
                continue
        return None

    def _get_session_telemetry_sync(self, year: int, race: str, session_type: str, driver: str, lap: Optional[str] = None) -> Dict[str, Any]:
        """
        Synchronous implementation — must run in a thread pool via
        get_session_telemetry(). FastF1 uses blocking I/O and is memory-heavy,
        so the whole load+extract is guarded by a process-wide lock, and only a
        single session is ever held in memory (see _get_session).
        """
        cache_key = f"{year}_{race}_{session_type}_{driver}_{lap}"
        cached = self._cache_get(cache_key)
        if cached is not None:
            return cached

        with _LOAD_LOCK:
            try:
                session = self._get_session(year, race, session_type)

                result_data = None
                if not session.results.empty:
                    driver_res = session.results.loc[session.results["Abbreviation"] == driver]
                    if not driver_res.empty:
                        res_dict = driver_res.to_dict(orient="records")[0]
                        result_data = {
                            "Position": None if pd.isna(res_dict.get("Position")) else int(res_dict.get("Position")),
                            "GridPosition": None if pd.isna(res_dict.get("GridPosition")) else int(res_dict.get("GridPosition")),
                            "Q1": None if pd.isna(res_dict.get("Q1")) else str(res_dict.get("Q1")).split()[-1] if not pd.isna(res_dict.get("Q1")) and str(res_dict.get("Q1")) != "NaT" else None,
                            "Q2": None if pd.isna(res_dict.get("Q2")) else str(res_dict.get("Q2")).split()[-1] if not pd.isna(res_dict.get("Q2")) and str(res_dict.get("Q2")) != "NaT" else None,
                            "Q3": None if pd.isna(res_dict.get("Q3")) else str(res_dict.get("Q3")).split()[-1] if not pd.isna(res_dict.get("Q3")) and str(res_dict.get("Q3")) != "NaT" else None,
                            "Status": str(res_dict.get("Status", "")),
                            "Points": None if pd.isna(res_dict.get("Points")) else float(res_dict.get("Points")),
                        }

                laps = session.laps.pick_driver(driver)
                if laps.empty:
                    result = {"error": f"No lap data found for {driver} in this session.", "driver_results": result_data}
                    self._cache_put(cache_key, result)
                    return result

                available_laps = laps["LapNumber"].dropna().astype(int).tolist()
                target_lap = self._pick_lap(laps, lap, available_laps)

                if target_lap is None:
                    result = {
                        "error": f"{driver} set no lap with available telemetry in this session (did they retire early?).",
                        "driver_results": result_data,
                        "available_laps": available_laps,
                    }
                    self._cache_put(cache_key, result)
                    return result

                telemetry = target_lap.get_telemetry()
                if telemetry.empty:
                    result = {
                        "error": f"No telemetry recorded for {driver}'s lap in this session.",
                        "driver_results": result_data,
                        "available_laps": available_laps,
                    }
                    self._cache_put(cache_key, result)
                    return result

                def col(name: str) -> List[Any]:
                    return _downsample(telemetry[name].tolist())

                data: Dict[str, Any] = {
                    "Distance": col("Distance"),
                    "Speed": col("Speed"),
                    "Throttle": col("Throttle"),
                    "Brake": col("Brake"),
                    "nGear": col("nGear"),
                    "RPM": col("RPM"),
                    "X": col("X"),
                    "Y": col("Y"),
                    "Z": col("Z"),
                    "lap_time": str(target_lap["LapTime"]),
                    "sector_1": str(target_lap["Sector1Time"]),
                    "sector_2": str(target_lap["Sector2Time"]),
                    "sector_3": str(target_lap["Sector3Time"]),
                    "lap_number": int(target_lap["LapNumber"]),
                }

                # Replace NaNs with None for JSON serialisation
                for key, value in data.items():
                    if isinstance(value, list):
                        data[key] = [None if pd.isna(x) else x for x in value]

                final_result = {
                    "data": data,
                    "driver_results": result_data,
                    "available_laps": available_laps,
                }
                self._cache_put(cache_key, final_result)
                return final_result

            except Exception as e:
                err = {"error": str(e)}
                self._cache_put(cache_key, err)
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
            lap,
        )


fastf1_service = FastF1Service()
