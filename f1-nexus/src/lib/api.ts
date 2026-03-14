const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API = `${API_BASE}/api/v1`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  driver: { id: string; code: string; name: string };
  constructor: string;
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  constructor: { id: string; name: string };
}

export interface RaceResult {
  position: string;
  driver: string;
  driverName: string;
  constructor: string;
  points: string;
  grid: string;
  status: string;
  time: string;
}

export interface RaceInfo {
  name: string;
  circuit: string;
  date: string;
}

export interface SessionInfo {
  label: string; // "FP1" | "FP2" | "FP3" | "Qualifying" | "Sprint" | "Sprint Qualifying"
  date: string;  // ISO datetime
}

export interface NextRace {
  round: string;
  raceName: string;
  circuit: string;
  locality: string;
  country: string;
  date: string;
  circuitWikiUrl: string;
  sessions: SessionInfo[];
}

export interface ScheduleRace {
  round: string;
  raceName: string;
  circuit: string;
  date: string;
}

export interface WinProbability {
  driver: string;
  name: string;
  teamClass: string;
  probability: number;
}

export interface PodiumProbability {
  driver: string;
  name: string;
  teamClass: string;
  probability: number;
}

export interface PredictorData {
  race: string;
  year: number;
  win_probabilities: WinProbability[];
  podium_probabilities: PodiumProbability[];
  distribution_target: string;
  distribution: { pos: string | number; prob: number }[];
  model_type: string;
  simulations: number;
}

export interface Stint {
  compound: string;
  startLap: number;
  endLap: number;
  color: string;
}

export interface StrategyData {
  driver: string;
  track: string;
  stints: Stint[];
  predicted_finish: number;
  total_time_seconds: number;
  total_time_formatted: string;
  chart_data: { lap: number; delta: number }[];
  simulations_run: number;
  confidence: string;
}

export interface AnalystMetrics {
  pit_stops: { driver: string; team: string; time: number; isBest: boolean }[];
  top3: { position: string; driver: string; driverName: string; constructor: string; teamClass: string; gap: string }[];
  sector_deltas: { sector: string; delta: number }[];
}

export interface AnalystData {
  race: string;
  year: number;
  title: string;
  headline: string;
  winner?: string;
  constructor?: string;
  analysis: string;
  model_used: string;
  metrics: AnalystMetrics;
}

export interface TelemetryData {
  data: {
    Distance: number[];
    Speed: number[];
    Throttle: number[];
    Brake: (boolean | number)[];
    nGear: number[];
    RPM: number[];
    X: number[];
    Y: number[];
    Z: number[];
    lap_time: string;
    sector_1: string;
    sector_2: string;
    sector_3: string;
    lap_number: number;
  };
  driver_results?: {
    Position: number | null;
    GridPosition: number | null;
    Q1: string | null;
    Q2: string | null;
    Q3: string | null;
    Status: string;
    Points: number | null;
  };
  available_laps?: number[];
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...options });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export async function getCircuitImage(wikiUrl: string, circuitName?: string): Promise<string | null> {
  try {
    if (circuitName) {
      const cleanCircuit = circuitName.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/ /g, "_");
      return `/tracks/${cleanCircuit}.png`;
    }

    if (!wikiUrl) return null;
    const article = wikiUrl.split("/wiki/")[1];
    if (!article) return null;
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { thumbnail?: { source: string } };
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

// ─── Standings ────────────────────────────────────────────────────────────────

export async function getDriverStandings(year = "current"): Promise<DriverStanding[]> {
  try {
    const data = await fetchJSON<{ standings: DriverStanding[] }>(
      `${API}/standings/drivers?year=${year}`
    );
    return data.standings ?? [];
  } catch {
    return [];
  }
}

export async function getConstructorStandings(year = "current"): Promise<ConstructorStanding[]> {
  try {
    const data = await fetchJSON<{ standings: ConstructorStanding[] }>(
      `${API}/standings/constructors?year=${year}`
    );
    return data.standings ?? [];
  } catch {
    return [];
  }
}

// ─── Races ────────────────────────────────────────────────────────────────────

export async function getNextRace(): Promise<NextRace | null> {
  try {
    const data = await fetchJSON<{ race: NextRace | null }>(`${API}/races/next`);
    return data.race ?? null;
  } catch {
    return null;
  }
}

export async function getLastRaceResults(): Promise<{ race: RaceInfo | null; results: RaceResult[] }> {
  try {
    return await fetchJSON(`${API}/races/last/results`);
  } catch {
    return { race: null, results: [] };
  }
}

export async function getSchedule(year = "current"): Promise<ScheduleRace[]> {
  try {
    const data = await fetchJSON<{ schedule: ScheduleRace[] }>(
      `${API}/races/schedule?year=${year}`
    );
    return data.schedule ?? [];
  } catch {
    return [];
  }
}

export async function getRaceResults(year: string, round: string): Promise<{ race: RaceInfo | null; results: RaceResult[] }> {
  try {
    return await fetchJSON(`${API}/races/${year}/${round}/results`);
  } catch {
    return { race: null, results: [] };
  }
}

// ─── Predictor ────────────────────────────────────────────────────────────────

export async function getPredictions(year: number, race: string): Promise<PredictorData | null> {
  try {
    const data = await fetchJSON<{ status: string; data: PredictorData }>(
      `${API}/predictor/${year}/${encodeURIComponent(race)}`
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ─── Strategy ─────────────────────────────────────────────────────────────────

export async function simulateStrategy(params: {
  driver: string;
  track: string;
  starting_compound: string;
  stops: number;
  total_laps: number;
}): Promise<StrategyData | null> {
  try {
    const data = await fetch(`${API}/strategy/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await data.json() as { status: string; data: StrategyData };
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Analyst ──────────────────────────────────────────────────────────────────

export async function getAnalysis(year: number, race: string): Promise<AnalystData | null> {
  try {
    const data = await fetchJSON<{ status: string; data: AnalystData }>(
      `${API}/analyst/${year}/${encodeURIComponent(race)}`,
      { next: { revalidate: 3600 } }
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ─── Telemetry ────────────────────────────────────────────────────────────────

export async function getDriverTelemetry(
  year: number,
  race: string,
  sessionType: string,
  driver: string,
  lap?: string
): Promise<TelemetryData | null> {
  try {
    const query = lap ? `?lap=${lap}` : '';
    return await fetchJSON<TelemetryData>(
      `${API}/telemetry/session/${year}/${encodeURIComponent(race)}/${sessionType}/driver/${driver}${query}`,
      { cache: "no-store" }
    );
  } catch {
    return null;
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  image: string | null;
  source: string;
}

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const data = await fetchJSON<{ articles: NewsArticle[] }>(`${API}/news`);
    return data.articles ?? [];
  } catch {
    return [];
  }
}

export async function subscribeEmail(name: string, email: string): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    return res.json() as Promise<{ status: string; message: string }>;
  } catch {
    return { status: "error", message: "Could not connect to server" };
  }
}

// ─── Local Assets ─────────────────────────────────────────────────────────────

const LOCALITY_TO_CIRCUIT_KEY: Record<string, string> = {
  "Melbourne": "australia",
  "Shanghai": "china",
  "Suzuka": "japan",
  "Sakhir": "bahrain",
  "Jeddah": "saudi_arabia",
  "Miami": "miami",
  "Imola": "emilia_romagna",
  "Monte Carlo": "monaco",
  "Monaco": "monaco",
  "Barcelona": "spain",
  "Montreal": "canada",
  "Spielberg": "austria",
  "Silverstone": "great_britain",
  "Spa": "belgium",
  "Budapest": "hungary",
  "Zandvoort": "netherlands",
  "Monza": "italy",
  "Baku": "azerbaijan",
  "Singapore": "singapore",
  "Austin": "united_states",
  "Mexico City": "mexico",
  "São Paulo": "brazil",
  "Las Vegas": "las_vegas",
  "Lusail": "qatar",
  "Abu Dhabi": "abu_dhabi",
};

export function localCircuitImage(locality: string, country?: string): string | null {
  const key = LOCALITY_TO_CIRCUIT_KEY[locality] ?? (country ? LOCALITY_TO_CIRCUIT_KEY[country] : null);
  return key ? `/circuits/${key}.webp` : null;
}

export function driverPhotoUrl(code: string): string {
  return `/drivers/${(code ?? "").toUpperCase()}.webp`;
}

// Map from constructor API name → logo file key
const CONSTRUCTOR_LOGO_KEY: Record<string, string> = {
  mercedes: "mercedes",
  ferrari: "ferrari",
  mclaren: "mclaren",
  red_bull: "redbull",
  redbull: "redbull",
  redbullracing: "redbull",
  aston_martin: "astonmartin",
  astonmartin: "astonmartin",
  alpine: "alpine",
  alpine_f1_team: "alpine",
  williams: "williams",
  rb: "rb",
  rb_f1_team: "rb",
  racingbulls: "rb",
  sauber: "sauber",
  kick_sauber: "sauber",
  audi: "sauber",
  haas: "haas",
  haas_f1_team: "haas",
  haasf1team: "haas",
  cadillac: "cadillac",
  cadillac_f1_team: "cadillac",
  cadillacf1team: "cadillac",
};

export function teamLogoUrl(constructorId: string): string | null {
  const key = constructorId.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  const logoKey = CONSTRUCTOR_LOGO_KEY[key];
  return logoKey ? `/logos/${logoKey}.webp` : null;
}

// ─── Team Colors ──────────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27F4D2",
  ferrari: "#E80020",
  mclaren: "#FF8000",
  red_bull: "#3671C6",
  redbull: "#3671C6",
  alpine: "#0093CC",
  alpine_f1_team: "#0093CC",
  williams: "#64C4FF",
  aston_martin: "#229971",
  astonmartin: "#229971",
  haas: "#B6BABD",
  haas_f1_team: "#B6BABD",
  rb: "#6692FF",
  rb_f1_team: "#6692FF",
  sauber: "#00E701",
  kick_sauber: "#00E701",
  audi: "#F60000",
  cadillac: "#FFB000",
  cadillac_f1_team: "#FFB000",
};

export function teamColor(constructorId: string, fallback = "#6b7280"): string {
  const key = constructorId.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  return TEAM_COLORS[key] ?? fallback;
}

export function constructorIdFromName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

export async function getLastSprintResults(): Promise<{ race: RaceInfo | null; results: RaceResult[] }> {
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/current/last/sprint.json", {
      next: { revalidate: 120 },
    });
    if (!res.ok) return { race: null, results: [] };
    const data = await res.json() as {
      MRData?: {
        RaceTable?: {
          Races?: Array<{
            raceName: string;
            date: string;
            Circuit?: { circuitName: string };
            SprintResults?: Array<{
              position: string;
              Driver?: { code?: string; driverId: string; givenName: string; familyName: string };
              Constructor?: { name: string };
              points: string;
              grid?: string;
              Time?: { time: string };
              status: string;
            }>;
          }>;
        };
      };
    };
    const races = data?.MRData?.RaceTable?.Races ?? [];
    if (!races.length || !races[0].SprintResults?.length) return { race: null, results: [] };
    const r = races[0];
    return {
      race: { name: `${r.raceName} · Sprint`, circuit: r.Circuit?.circuitName ?? "", date: r.date },
      results: r.SprintResults!.map((s) => ({
        position: s.position,
        driver: s.Driver?.code ?? s.Driver?.driverId ?? "",
        driverName: `${s.Driver?.givenName ?? ""} ${s.Driver?.familyName ?? ""}`.trim(),
        constructor: s.Constructor?.name ?? "",
        points: s.points,
        grid: s.grid ?? "",
        status: s.status,
        time: s.Time?.time ?? s.status ?? "",
      })),
    };
  } catch {
    return { race: null, results: [] };
  }
}
