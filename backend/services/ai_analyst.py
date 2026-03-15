import httpx
from typing import Dict, Any
from config import settings
from .jolpica_client import jolpica_client

# Known race results — used as fallback when Jolpica has no data yet.
# Key: (year_str, race_name_lower)
_KNOWN_RESULTS: Dict[tuple, Dict[str, Any]] = {
    ("2026", "chinese grand prix"): {
        "winner": "Kimi Antonelli",
        "constructor": "Mercedes",
        "top3": [
            {"position": "1", "driver": "ANT", "driverName": "Kimi Antonelli",
             "constructor": "Mercedes", "teamClass": "mercedes", "gap": "Leader"},
            {"position": "2", "driver": "RUS", "driverName": "George Russell",
             "constructor": "Mercedes", "teamClass": "mercedes", "gap": "+5.515s"},
            {"position": "3", "driver": "HAM", "driverName": "Lewis Hamilton",
             "constructor": "Ferrari", "teamClass": "ferrari", "gap": "+25.267s"},
        ],
        "pit_stops": [
            {"driver": "ANT", "team": "mercedes", "time": 2.3, "isBest": True},
            {"driver": "RUS", "team": "mercedes", "time": 2.5, "isBest": False},
            {"driver": "HAM", "team": "ferrari",  "time": 2.8, "isBest": False},
        ],
    },
    ("2026", "australian grand prix"): {
        "winner": "George Russell",
        "constructor": "Mercedes",
        "top3": [
            {"position": "1", "driver": "RUS", "driverName": "George Russell",
             "constructor": "Mercedes", "teamClass": "mercedes", "gap": "Leader"},
            {"position": "2", "driver": "ANT", "driverName": "Kimi Antonelli",
             "constructor": "Mercedes", "teamClass": "mercedes", "gap": "+2.974s"},
            {"position": "3", "driver": "LEC", "driverName": "Charles Leclerc",
             "constructor": "Ferrari", "teamClass": "ferrari", "gap": "+12.441s"},
        ],
        "pit_stops": [
            {"driver": "RUS", "team": "mercedes", "time": 2.4, "isBest": True},
            {"driver": "ANT", "team": "mercedes", "time": 2.6, "isBest": False},
            {"driver": "LEC", "team": "ferrari",  "time": 3.1, "isBest": False},
        ],
    },
}


class AIAnalyst:
    """
    AI Race Analyst using local Ollama (Llama 3.2) or a rule-based fallback
    if Ollama is not available or disabled.
    """

    def __init__(self):
        self.use_ollama = settings.USE_OLLAMA
        # OLLAMA_HOST is set via env var in Docker: http://ollama:11434
        self.ollama_url = f"{settings.OLLAMA_HOST}/api/generate"
        self.model = settings.OLLAMA_MODEL

    async def analyze_race(self, year: int, race: str) -> Dict[str, Any]:
        """
        Generate insights for a race. Fetches real results from Jolpica to
        build context for the LLM prompt and populate the metrics payload.
        """
        race_data = await self._fetch_race_data(year, str(race))
        winner = race_data.get("winner", "the race winner")
        constructor = race_data.get("constructor", "")
        pit_stops = race_data.get("pit_stops", [
            {"driver": "VER", "team": "red_bull", "time": 2.1, "isBest": True},
            {"driver": "LEC", "team": "ferrari", "time": 2.4, "isBest": False},
            {"driver": "SAI", "team": "ferrari", "time": 3.2, "isBest": False},
        ])
        top3 = race_data.get("top3", [])

        # Build full podium context string for the prompt
        if len(top3) >= 3:
            podium_line = (
                f"The final podium was: 1st {top3[0].get('driverName', winner)} ({top3[0].get('constructor', constructor)}), "
                f"2nd {top3[1].get('driverName', '?')} ({top3[1].get('constructor', '?')}), "
                f"3rd {top3[2].get('driverName', '?')} ({top3[2].get('constructor', '?')})."
            )
        elif len(top3) >= 1:
            podium_line = f"{winner} won for {constructor}."
        else:
            podium_line = f"{winner} won for {constructor}."

        prompt = (
            f"Act as an expert Formula 1 race journalist writing a post-race analysis article. "
            f"Write exactly two punchy paragraphs about the {year} {race}. "
            f"{podium_line} "
            f"In the first paragraph, describe the race narrative from lights-out to the chequered flag: "
            f"who led from pole, any early drama or safety car periods, key battles in the midfield, and how the top 3 positions were decided. "
            f"Name each podium finisher and their constructor. "
            f"In the second paragraph, analyse the single most decisive tactical or technical factor that sealed {winner}'s victory for {constructor} — "
            f"whether tyre strategy, pit stop timing, ERS deployment, a key overtake, or superior race pace. "
            f"Give {constructor}'s performance context relative to their rivals. "
            f"Write in a punchy, authoritative editorial style — like a premium motorsport magazine. "
            f"No asterisks, no markdown, no bullet points, no headings, no labels."
        )

        insight = ""
        if self.use_ollama:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.ollama_url,
                        json={"model": self.model, "prompt": prompt, "stream": False},
                        timeout=httpx.Timeout(connect=2.0, read=30.0, write=5.0, pool=2.0),
                    )
                    if response.status_code == 200:
                        insight = response.json().get("response", "").strip()
            except Exception as e:
                print(f"Ollama error: {e}. Using fallback.")

        # Extract first/last name safely — guard against placeholder strings
        fallback_winner = winner in ("the race winner", "", None)
        first_name = winner.split()[0] if not fallback_winner else "THE WINNER"
        last_name  = winner.split()[-1].upper() if not fallback_winner else "THE WINNER"
        team_short = constructor.split()[0].upper() if constructor else "THE TEAM"

        # Map adjective race names to proper location nouns for headlines
        _LOCATION_MAP = {
            "australian": "Australia", "bahrain": "Bahrain", "saudi arabian": "Saudi Arabia",
            "japanese": "Japan", "chinese": "China", "miami": "Miami",
            "emilia romagna": "Imola", "monaco": "Monaco", "spanish": "Spain",
            "canadian": "Canada", "austrian": "Austria", "british": "Silverstone",
            "belgian": "Belgium", "hungarian": "Hungary", "dutch": "Zandvoort",
            "italian": "Monza", "azerbaijan": "Baku", "singapore": "Singapore",
            "united states": "Austin", "mexico city": "Mexico", "são paulo": "Brazil",
            "las vegas": "Las Vegas", "qatar": "Qatar", "abu dhabi": "Abu Dhabi",
        }
        race_key = race.replace("Grand Prix", "").strip().lower()
        location = _LOCATION_MAP.get(race_key, race.replace("Grand Prix", "").strip()).upper()

        if not insight:
            # Build podium sentence for fallback
            if len(top3) >= 3:
                p2_name = top3[1].get("driverName", "the second-placed driver")
                p3_name = top3[2].get("driverName", "the third-placed driver")
                p2_team = top3[1].get("constructor", "")
                p3_team = top3[2].get("constructor", "")
                podium_sentence = (
                    f"{p2_name} ({p2_team}) claimed second place and "
                    f"{p3_name} ({p3_team}) completed the podium in third."
                )
            else:
                podium_sentence = ""

            if fallback_winner:
                insight = (
                    f"A masterclass of racecraft defined the {year} {race}, as the eventual winner "
                    f"converted pole position into a dominant victory with clinical tyre management and "
                    f"superior ERS deployment through the high-speed sector. A 2.1-second pit stop built "
                    f"a net four-second cushion over the chasing pack, making the result inevitable from lap 20 onwards. "
                    f"{podium_sentence}"
                )
            else:
                insight = (
                    f"{winner} delivered a commanding performance at the {year} {race}, leading {constructor} "
                    f"to a front-to-back victory from pole position. {podium_sentence} "
                    f"The margin of victory was forged in the pit stops — {constructor}'s 2.1-second turnaround "
                    f"was the fastest in the field, and the undercut gave {winner} the clean air needed to build "
                    f"an unassailable gap. Superior ERS deployment through Sector 2 provided a consistent "
                    f"0.3-second-per-lap advantage that made the result inevitable from lap 20 onwards. "
                    f"It was a performance that underscored {constructor}'s technical edge in the 2026 regulations."
                )

        # Generate a compelling, specific headline
        headline_templates = [
            f"{last_name} AND {team_short}: A RACE WITHOUT COMPROMISE",
            f"HOW {first_name} TURNED PACE INTO DOMINANCE AT {location}",
            f"{last_name}'S PERFECT RACE — AND THE STRATEGY THAT SEALED IT",
            f"NO CONTEST: {last_name} DELIVERS {team_short}'S FINEST HOUR",
        ]
        import hashlib
        idx = int(hashlib.md5(f"{year}{race}".encode()).hexdigest(), 16) % len(headline_templates)
        headline = headline_templates[idx]

        return {
            "race": race,
            "year": year,
            "title": f"{race.upper()} — {year} RACE ANALYSIS",
            "headline": headline,
            "winner": winner,
            "constructor": constructor,
            "analysis": insight,
            "model_used": self.model if (self.use_ollama and insight) else "Rule-based Fallback",
            "metrics": {
                "pit_stops": pit_stops,
                "top3": top3,
                # Sector deltas remain illustrative — FastF1 data needed for real values
                "sector_deltas": [
                    {"sector": "S1", "delta": -0.04},
                    {"sector": "S2", "delta": -0.22},
                    {"sector": "S3", "delta": -0.11},
                ],
            },
        }

    async def _fetch_race_data(self, year: int, race: str) -> Dict[str, Any]:
        """
        Fetch real race results from Jolpica to enrich the analysis.
        Falls back to _KNOWN_RESULTS, then returns empty dict on failure.
        """
        try:
            data = await jolpica_client.get_race_results(str(year), race)
            races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            if not races:
                return _KNOWN_RESULTS.get((str(year), race.lower()), {})

            results = races[0].get("Results", [])
            if not results:
                return _KNOWN_RESULTS.get((str(year), race.lower()), {})

            winner_data = results[0]
            winner_name = (
                f"{winner_data.get('Driver', {}).get('givenName', '')} "
                f"{winner_data.get('Driver', {}).get('familyName', '')}"
            ).strip()
            constructor_name = winner_data.get("Constructor", {}).get("name", "")

            top3 = []
            for r in results[:3]:
                team_id = r.get("Constructor", {}).get("constructorId", "").replace("-", "_")
                gap = r.get("Time", {}).get("time") or r.get("status", "")
                top3.append({
                    "position": r.get("position"),
                    "driver": r.get("Driver", {}).get("code", "???"),
                    "driverName": (
                        f"{r.get('Driver', {}).get('givenName', '')} "
                        f"{r.get('Driver', {}).get('familyName', '')}"
                    ).strip(),
                    "constructor": r.get("Constructor", {}).get("name", ""),
                    "teamClass": team_id,
                    "gap": gap,
                })

            # Pit stop display uses estimated times — real times require OpenF1 session_key
            pit_estimates = [2.1, 2.4, 2.8]
            pit_stops = []
            for i, r in enumerate(results[:3]):
                team_id = r.get("Constructor", {}).get("constructorId", "").replace("-", "_")
                pit_stops.append({
                    "driver": r.get("Driver", {}).get("code", "???"),
                    "team": team_id,
                    "time": pit_estimates[i],
                    "isBest": i == 0,
                })

            return {
                "winner": winner_name,
                "constructor": constructor_name,
                "top3": top3,
                "pit_stops": pit_stops,
            }
        except Exception as e:
            print(f"Could not fetch race data for analyst: {e}")
            return _KNOWN_RESULTS.get((str(year), race.lower()), {})


ai_analyst = AIAnalyst()
