"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getNextRace, type NextRace } from "@/lib/api";

// ─── OpenF1 Types ──────────────────────────────────────────────────────────────

interface OFSession {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  meeting_name: string;
  year: number;
}

interface OFDriver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url: string | null;
  session_key: number;
}

interface OFInterval {
  driver_number: number;
  date: string;
  gap_to_leader: string | null;
  interval: string | null;
  session_key: number;
}

interface OFPosition {
  driver_number: number;
  date: string;
  position: number;
  session_key: number;
}

interface OFLocation {
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}

interface OFStint {
  driver_number: number;
  stint_number: number;
  compound: string;
  lap_start: number;
  lap_end: number | null;
  tyre_age_at_start: number | null;
}

interface OFLap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  date_start: string;
  is_pit_out_lap: boolean;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
}

interface OFRaceControl {
  date: string;
  category: string;
  flag: string | null;
  message: string;
  scope: string | null;
  driver_number: number | null;
  lap_number: number | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const OPENF1 = "https://api.openf1.org/v1";

const TYRE_COLORS: Record<string, string> = {
  SOFT: "#E8002D",
  MEDIUM: "#FFF200",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#39B54A",
  WET: "#0067FF",
  HYPERSOFT: "#FF87BC",
  ULTRASOFT: "#8B0FBA",
  SUPERSOFT: "#FF7700",
  UNKNOWN: "#6b7280",
};

function tyreColor(compound: string): string {
  return TYRE_COLORS[compound?.toUpperCase() ?? "UNKNOWN"] ?? "#6b7280";
}

function tyreLetter(compound: string): string {
  const c = compound?.toUpperCase() ?? "";
  if (c === "SOFT") return "S";
  if (c === "MEDIUM") return "M";
  if (c === "HARD") return "H";
  if (c === "INTERMEDIATE") return "I";
  if (c === "WET") return "W";
  return c.charAt(0) || "?";
}

function formatLapTime(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "–";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  const secsFormatted = parseFloat(secs).toFixed(3).padStart(6, "0");
  return mins > 0 ? `${mins}:${secsFormatted}` : `${secsFormatted}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "–";
  return seconds.toFixed(3) + "s";
}

function isSessionLive(session: OFSession): boolean {
  const now = new Date().getTime();
  const start = new Date(session.date_start).getTime();
  // Consider live if started within last 4 hours and end hasn't passed by more than 30 minutes
  const endWithBuffer = new Date(session.date_end).getTime() + 30 * 60 * 1000;
  return now >= start && now <= endWithBuffer;
}

const RC_FLAG_COLORS: Record<string, string> = {
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  DOUBLE_YELLOW: "#eab308",
  RED: "#ef4444",
  CHEQUERED: "#ffffff",
  SAFETY_CAR: "#f97316",
  VIRTUAL_SAFETY_CAR: "#f97316",
  BLUE: "#60a5fa",
  BLACK_AND_WHITE: "#94a3b8",
  BLACK: "#0f0f0f",
};

function rcColor(msg: OFRaceControl): string {
  if (msg.flag) return RC_FLAG_COLORS[msg.flag.toUpperCase()] ?? "#94a3b8";
  const m = msg.message.toUpperCase();
  if (m.includes("SAFETY CAR")) return "#f97316";
  if (m.includes("VIRTUAL SAFETY CAR") || m.includes("VSC")) return "#f97316";
  if (m.includes("RED FLAG")) return "#ef4444";
  if (m.includes("GREEN")) return "#22c55e";
  return "#94a3b8";
}

function rcIcon(msg: OFRaceControl): string {
  const m = msg.message.toUpperCase();
  if (m.includes("SAFETY CAR") || m.includes("VSC")) return "car_crash";
  if (m.includes("DRS")) return "air";
  if (m.includes("PENALTY") || m.includes("INVESTIGATION")) return "gavel";
  if (m.includes("PIT ENTRY") || m.includes("PIT EXIT")) return "garage";
  return "flag";
}

async function fetchOF<T>(path: string): Promise<T[]> {
  const res = await fetch(`${OPENF1}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`OpenF1 ${res.status}`);
  return res.json() as Promise<T[]>;
}

// ─── Track Map Component ───────────────────────────────────────────────────────

interface TrackMapProps {
  positions: Map<number, OFLocation>;
  drivers: OFDriver[];
  racePositions: Map<number, number>; // driver_number → race position
}

function TrackMap({ positions, drivers, racePositions }: TrackMapProps) {
  const W = 380;
  const H = 280;
  const PAD = 24;

  // Collect all known x,y for normalization
  const pts = Array.from(positions.values());
  if (pts.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl h-full"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl text-slate-700 block mb-2">location_off</span>
          <p className="text-[10px] text-slate-600 font-bold uppercase">No Position Data</p>
        </div>
      </div>
    );
  }

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  function toSvg(x: number, y: number): [number, number] {
    return [
      PAD + ((x - minX) / rangeX) * (W - PAD * 2),
      PAD + ((y - minY) / rangeY) * (H - PAD * 2),
    ];
  }

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full rounded-xl"
      style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Car dots */}
      {Array.from(positions.entries()).map(([num, loc]) => {
        const driver = driverMap.get(num);
        const color = driver?.team_colour ? `#${driver.team_colour}` : "#6b7280";
        const [sx, sy] = toSvg(loc.x, loc.y);
        const pos = racePositions.get(num);
        return (
          <g key={num}>
            {/* Glow */}
            <circle cx={sx} cy={sy} r={8} fill={color} opacity={0.15} />
            {/* Dot */}
            <circle cx={sx} cy={sy} r={5} fill={color} stroke="#0a0a0a" strokeWidth={1.5} />
            {/* Driver code */}
            <text
              x={sx}
              y={sy - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="6"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {driver?.name_acronym ?? String(num)}
            </text>
            {pos && (
              <text
                x={sx + 7}
                y={sy + 3}
                textAnchor="start"
                fill={color}
                fontSize="5"
                fontWeight="bold"
              >
                P{pos}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Countdown (reused from app) ───────────────────────────────────────────────

function useCountdown(targetDate: string | null) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setDiff(new Date(targetDate).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));
  return { days, hours, mins, secs, isPast: diff <= 0 };
}

// ─── No Session State ─────────────────────────────────────────────────────────

function NoSessionState({ session, nextRace }: { session: OFSession | null; nextRace: NextRace | null }) {
  const nextSessionDate = nextRace?.sessions?.[0]?.date ?? nextRace?.date ?? null;
  const { days, hours, mins, secs } = useCountdown(nextSessionDate);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "rgba(224,7,0,0.12)", border: "1px solid rgba(224,7,0,0.25)" }}>
        <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          timer
        </span>
      </div>
      <h2 className="text-2xl font-black italic uppercase mb-2">No Live Session</h2>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        Live timing, track map, and real-time telemetry will appear here during an active F1 session.
      </p>

      {/* Last session info */}
      {session && (
        <div className="mb-6 text-center">
          <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest mb-1">Last Session</p>
          <p className="text-sm font-black text-white">{session.meeting_name} · {session.session_name}</p>
          <p className="text-[10px] text-slate-500">{session.circuit_short_name}, {session.country_name}</p>
        </div>
      )}

      {/* Next race countdown */}
      {nextRace && (
        <div className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: "rgba(224,7,0,0.06)", border: "1px solid rgba(224,7,0,0.2)" }}>
          <div className="h-1" style={{ background: "linear-gradient(to right, #e00700, transparent)" }} />
          <div className="p-5">
            <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-3">Next Event</p>
            <p className="text-lg font-black italic uppercase text-white mb-1">{nextRace.raceName}</p>
            <p className="text-[10px] text-slate-500 mb-4">{nextRace.circuit} · {nextRace.country}</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: days,  l: "Days" },
                { v: hours, l: "Hours" },
                { v: mins,  l: "Mins" },
                { v: secs,  l: "Secs" },
              ].map(({ v, l }) => (
                <div key={l} className="text-center rounded-xl py-3"
                  style={{ background: "rgba(224,7,0,0.08)", border: "1px solid rgba(224,7,0,0.15)" }}>
                  <p className="text-xl font-black text-primary leading-none">{String(v).padStart(2, "0")}</p>
                  <p className="text-[7px] text-slate-600 uppercase font-bold mt-1">{l}</p>
                </div>
              ))}
            </div>
            {nextRace.sessions && nextRace.sessions.length > 0 && (
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(224,7,0,0.15)" }}>
                <p className="text-[7px] text-slate-600 uppercase font-bold mb-2">Weekend Schedule</p>
                <div className="space-y-1">
                  {nextRace.sessions.map((s) => (
                    <div key={s.label} className="flex justify-between text-[9px]">
                      <span className="text-slate-400 font-bold">{s.label}</span>
                      <span className="text-slate-600">
                        {new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}
                        {new Date(s.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature preview */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {[
          { icon: "format_list_numbered", label: "Live Timing Tower", desc: "Real-time positions, gaps, sector times" },
          { icon: "map", label: "Track Map", desc: "Live car positions on circuit layout" },
          { icon: "sensors", label: "Race Control", desc: "Flags, safety car, penalties live" },
        ].map((f) => (
          <div key={f.label} className="rounded-xl p-3 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="material-symbols-outlined text-2xl text-slate-600 block mb-2"
              style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
            <p className="text-[9px] font-black text-white mb-1">{f.label}</p>
            <p className="text-[8px] text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LivePage() {
  const [session, setSession] = useState<OFSession | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [drivers, setDrivers] = useState<OFDriver[]>([]);
  const [intervals, setIntervals] = useState<Map<number, OFInterval>>(new Map());
  const [racePositions, setRacePositions] = useState<Map<number, number>>(new Map());
  const [locations, setLocations] = useState<Map<number, OFLocation>>(new Map());
  const [stints, setStints] = useState<Map<number, OFStint>>(new Map()); // driver → latest stint
  const [laps, setLaps] = useState<Map<number, OFLap>>(new Map()); // driver → latest lap
  const [raceControl, setRaceControl] = useState<OFRaceControl[]>([]);
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentLap, setCurrentLap] = useState(0);
  const [pollError, setPollError] = useState(false);

  // Accumulate all location points for track outline normalization
  const allLocationsRef = useRef<Map<number, OFLocation>>(new Map());

  // Fetch static session data (once per session)
  const fetchSessionData = useCallback(async (sessionKey: number) => {
    try {
      const [driverData, stintData, rcData] = await Promise.all([
        fetchOF<OFDriver>(`/drivers?session_key=${sessionKey}`),
        fetchOF<OFStint>(`/stints?session_key=${sessionKey}`),
        fetchOF<OFRaceControl>(`/race_control?session_key=${sessionKey}`),
      ]);
      setDrivers(driverData);
      // Build latest stint per driver
      const stintMap = new Map<number, OFStint>();
      for (const s of stintData) {
        const existing = stintMap.get(s.driver_number);
        if (!existing || s.stint_number > existing.stint_number) {
          stintMap.set(s.driver_number, s);
        }
      }
      setStints(stintMap);
      // Sort RC messages newest first
      const sortedRC = [...rcData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRaceControl(sortedRC.slice(0, 20));
    } catch { /* non-critical */ }
  }, []);

  // Poll live data
  const pollLiveData = useCallback(async (sessionKey: number) => {
    try {
      const twoSecsAgo = new Date(Date.now() - 4000).toISOString();

      const [intervalData, posData, locData, lapData, rcData, stintData] = await Promise.allSettled([
        fetchOF<OFInterval>(`/intervals?session_key=${sessionKey}`),
        fetchOF<OFPosition>(`/position?session_key=${sessionKey}`),
        fetchOF<OFLocation>(`/location?session_key=${sessionKey}&date>${twoSecsAgo}`),
        fetchOF<OFLap>(`/laps?session_key=${sessionKey}`),
        fetchOF<OFRaceControl>(`/race_control?session_key=${sessionKey}`),
        fetchOF<OFStint>(`/stints?session_key=${sessionKey}`),
      ]);

      // Intervals → latest per driver
      if (intervalData.status === "fulfilled") {
        const intervalMap = new Map<number, OFInterval>();
        for (const iv of intervalData.value) {
          const existing = intervalMap.get(iv.driver_number);
          if (!existing || new Date(iv.date) > new Date(existing.date)) {
            intervalMap.set(iv.driver_number, iv);
          }
        }
        setIntervals(intervalMap);
      }

      // Race positions → latest per driver
      if (posData.status === "fulfilled") {
        const posMap = new Map<number, number>();
        const latestPos = new Map<number, OFPosition>();
        for (const p of posData.value) {
          const existing = latestPos.get(p.driver_number);
          if (!existing || new Date(p.date) > new Date(existing.date)) {
            latestPos.set(p.driver_number, p);
          }
        }
        latestPos.forEach((p) => posMap.set(p.driver_number, p.position));
        setRacePositions(posMap);
      }

      // Locations → latest per driver (accumulate for track map)
      if (locData.status === "fulfilled" && locData.value.length > 0) {
        const newLocs = new Map<number, OFLocation>(allLocationsRef.current);
        for (const loc of locData.value) {
          const existing = newLocs.get(loc.driver_number);
          if (!existing || new Date(loc.date) > new Date(existing.date)) {
            newLocs.set(loc.driver_number, loc);
          }
        }
        allLocationsRef.current = newLocs;
        setLocations(new Map(newLocs));
      }

      // Laps → latest per driver
      if (lapData.status === "fulfilled") {
        const lapMap = new Map<number, OFLap>();
        let maxLap = 0;
        for (const lap of lapData.value) {
          if (lap.lap_number > maxLap) maxLap = lap.lap_number;
          const existing = lapMap.get(lap.driver_number);
          if (!existing || lap.lap_number > existing.lap_number) {
            lapMap.set(lap.driver_number, lap);
          }
        }
        setLaps(lapMap);
        setCurrentLap(maxLap);
      }

      // Race control messages
      if (rcData.status === "fulfilled") {
        const sorted = [...rcData.value].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRaceControl(sorted.slice(0, 25));
      }

      // Stints (update tyre info)
      if (stintData.status === "fulfilled") {
        const stintMap = new Map<number, OFStint>();
        for (const s of stintData.value) {
          const existing = stintMap.get(s.driver_number);
          if (!existing || s.stint_number > existing.stint_number) {
            stintMap.set(s.driver_number, s);
          }
        }
        setStints(stintMap);
      }

      setPollError(false);
      setLastUpdate(new Date());
    } catch {
      setPollError(true);
    }
  }, []);

  // Initial load: check latest session
  useEffect(() => {
    async function init() {
      try {
        const [sessions, nr] = await Promise.allSettled([
          fetchOF<OFSession>("/sessions?session_key=latest"),
          getNextRace(),
        ]);

        if (nr.status === "fulfilled") setNextRace(nr.value);

        if (sessions.status === "fulfilled" && sessions.value.length > 0) {
          const latest = sessions.value[sessions.value.length - 1];
          setSession(latest);
          const live = isSessionLive(latest);
          setIsLive(live);

          if (live) {
            await fetchSessionData(latest.session_key);
            await pollLiveData(latest.session_key);
          }
        }
      } catch { /* handled gracefully */ }
      finally { setLoading(false); }
    }
    init();
  }, [fetchSessionData, pollLiveData]);

  // Polling interval (only when live)
  useEffect(() => {
    if (!isLive || !session) return;
    const id = setInterval(() => pollLiveData(session.session_key), 3000);
    return () => clearInterval(id);
  }, [isLive, session, pollLiveData]);

  // Build sorted timing tower
  const timingTower = (() => {
    if (drivers.length === 0) return [];
    const driversMap = new Map(drivers.map((d) => [d.driver_number, d]));
    const entries = drivers.map((d) => {
      const interval = intervals.get(d.driver_number);
      const pos = racePositions.get(d.driver_number) ?? 99;
      const lap = laps.get(d.driver_number);
      const stint = stints.get(d.driver_number);
      return {
        driverNumber: d.driver_number,
        position: pos,
        acronym: d.name_acronym,
        fullName: d.full_name,
        team: d.team_name,
        teamColor: d.team_colour ? `#${d.team_colour}` : "#6b7280",
        gapToLeader: interval?.gap_to_leader ?? null,
        interval: interval?.interval ?? null,
        lastLap: lap ? formatLapTime(lap.lap_duration) : "–",
        s1: lap ? formatDuration(lap.duration_sector_1) : "–",
        s2: lap ? formatDuration(lap.duration_sector_2) : "–",
        s3: lap ? formatDuration(lap.duration_sector_3) : "–",
        compound: stint?.compound ?? "UNKNOWN",
        lapCount: lap?.lap_number ?? 0,
        isPitOut: lap?.is_pit_out_lap ?? false,
      };
    });
    return entries.sort((a, b) => a.position - b.position);
  })();

  // Deduplicate drivers for map (use latest known location)
  const mapPositions = locations;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-24 px-4">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-4" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Connecting to Live Data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(224,7,0,0.1) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
        <div className="px-4 pt-8 pb-5">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">F1 Nexus · Live Data</p>
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase"
                style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase"
                style={{ background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
                Offline
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-none">
            Live <span className="text-primary">Timing</span>
          </h1>
          {session && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <span className="text-[9px] font-bold text-slate-500">{session.meeting_name}</span>
              <span className="text-[9px] text-slate-700">·</span>
              <span className="text-[9px] font-bold text-slate-400">{session.session_name}</span>
              <span className="text-[9px] text-slate-700">·</span>
              <span className="text-[9px] font-bold text-slate-500">{session.circuit_short_name}, {session.country_name}</span>
              {currentLap > 0 && (
                <>
                  <span className="text-[9px] text-slate-700">·</span>
                  <span className="text-[9px] font-black text-primary">Lap {currentLap}</span>
                </>
              )}
              {lastUpdate && isLive && (
                <>
                  <span className="text-[9px] text-slate-700">·</span>
                  <span className="text-[9px] text-slate-600 font-mono">
                    Updated {lastUpdate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </>
              )}
              {pollError && (
                <span className="text-[9px] text-amber-500 font-bold">⚠ Connection issue</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {!isLive ? (
        <div className="px-4">
          <NoSessionState session={session} nextRace={nextRace} />
        </div>
      ) : (
        <div className="px-4 space-y-4">

          {/* ── Main Grid: Timing Tower + Track Map ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Timing Tower */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>format_list_numbered</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Timing Tower</span>
                </div>
                <span className="text-[8px] text-slate-600 font-mono">{session?.session_type ?? "–"}</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[28px_44px_1fr_72px_80px_36px] gap-1 px-3 py-1.5 text-[7px] font-black uppercase text-slate-700 tracking-wider"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span>P</span>
                <span></span>
                <span>Driver</span>
                <span className="text-right">Gap</span>
                <span className="text-right">Last Lap</span>
                <span className="text-center">Tyre</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/[0.03]">
                {timingTower.length > 0 ? timingTower.map((entry) => (
                  <div
                    key={entry.driverNumber}
                    className="grid grid-cols-[28px_44px_1fr_72px_80px_36px] gap-1 px-3 py-2 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Position */}
                    <span
                      className="text-xs font-black leading-none"
                      style={{ color: entry.position <= 3 ? "#e00700" : "#94a3b8" }}
                    >
                      {entry.position <= 20 ? `P${entry.position}` : "–"}
                    </span>

                    {/* Driver code chip */}
                    <div
                      className="text-[8px] font-black px-1.5 py-0.5 rounded text-center leading-none"
                      style={{ background: `${entry.teamColor}25`, color: entry.teamColor, border: `1px solid ${entry.teamColor}40` }}
                    >
                      {entry.acronym}
                    </div>

                    {/* Driver name + team */}
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-white truncate leading-none">{entry.fullName}</p>
                      <p className="text-[7px] text-slate-600 truncate mt-0.5">{entry.team}</p>
                    </div>

                    {/* Gap */}
                    <div className="text-right">
                      <p className="text-[9px] font-black font-mono leading-none"
                        style={{ color: entry.position === 1 ? "#e00700" : "#94a3b8" }}>
                        {entry.position === 1 ? "LEADER" : (entry.gapToLeader ?? "–")}
                      </p>
                      {entry.interval && entry.position > 1 && (
                        <p className="text-[7px] text-slate-600 font-mono mt-0.5">{entry.interval}</p>
                      )}
                    </div>

                    {/* Last lap */}
                    <div className="text-right">
                      <p className="text-[9px] font-black font-mono text-white leading-none">
                        {entry.lastLap}
                      </p>
                      {entry.isPitOut && (
                        <p className="text-[7px] text-yellow-500 font-bold mt-0.5">PIT OUT</p>
                      )}
                    </div>

                    {/* Tyre */}
                    <div className="flex items-center justify-center">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black border-2"
                        style={{
                          borderColor: tyreColor(entry.compound),
                          color: entry.compound === "HARD" ? "#000" : "#000",
                          background: tyreColor(entry.compound),
                        }}
                        title={entry.compound}
                      >
                        {tyreLetter(entry.compound)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
                      <p className="text-[9px] text-slate-600 font-bold uppercase">Fetching Timing Data…</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Track Map + Race Control */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Track Map */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Track Map</span>
                  </div>
                  <span className="text-[8px] text-slate-600">{mapPositions.size} cars tracked</span>
                </div>
                <div className="p-2" style={{ aspectRatio: "4/3" }}>
                  <TrackMap
                    positions={mapPositions}
                    drivers={drivers}
                    racePositions={racePositions}
                  />
                </div>
              </div>

              {/* Sector times mini-grid (per driver, last 3 sectors) */}
              {timingTower.length > 0 && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Sector Times</span>
                  </div>
                  <div className="divide-y divide-white/[0.03]">
                    {timingTower.slice(0, 10).map((entry) => (
                      <div key={entry.driverNumber} className="grid grid-cols-[44px_1fr_52px_52px_52px] gap-1 px-3 py-1.5 items-center">
                        <span className="text-[7px] font-black" style={{ color: entry.teamColor }}>{entry.acronym}</span>
                        <span className="text-[7px] text-slate-600 truncate">{entry.team}</span>
                        <span className="text-[7px] font-mono text-center text-slate-400">{entry.s1}</span>
                        <span className="text-[7px] font-mono text-center text-slate-400">{entry.s2}</span>
                        <span className="text-[7px] font-mono text-center text-slate-400">{entry.s3}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Race Control Messages ── */}
          {raceControl.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Race Control</span>
                <span className="text-[8px] text-slate-600 ml-auto">Live Messages</span>
              </div>
              <div className="divide-y divide-white/[0.03] max-h-48 overflow-y-auto">
                {raceControl.map((msg, i) => {
                  const color = rcColor(msg);
                  const icon = rcIcon(msg);
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02]">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
                        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                        <span className="material-symbols-outlined text-sm" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white leading-snug">{msg.message}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[7px] text-slate-600 font-mono">
                            {new Date(msg.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                          {msg.lap_number && (
                            <span className="text-[7px] text-slate-600">Lap {msg.lap_number}</span>
                          )}
                          {msg.flag && (
                            <span className="text-[7px] font-black px-1.5 py-0.5 rounded"
                              style={{ background: `${color}20`, color }}>
                              {msg.flag.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Driver Quick Stats ── */}
          {drivers.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Driver Overview</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-3">
                {timingTower.map((entry) => (
                  <div
                    key={entry.driverNumber}
                    className="rounded-xl p-2 text-center"
                    style={{ background: `${entry.teamColor}10`, border: `1px solid ${entry.teamColor}25` }}
                  >
                    <p className="text-[8px] font-black" style={{ color: entry.teamColor }}>{entry.acronym}</p>
                    <p className="text-[7px] text-slate-500 truncate">{entry.team.split(" ")[0]}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border text-[5px] font-black flex items-center justify-center"
                        style={{ borderColor: tyreColor(entry.compound), color: "#000", background: tyreColor(entry.compound) }}
                      >
                        {tyreLetter(entry.compound)}
                      </div>
                      <span className="text-[7px] font-black" style={{ color: entry.position <= 3 ? "#e00700" : "#64748b" }}>
                        P{entry.position}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attribution */}
          <p className="text-center text-[8px] text-slate-700 font-mono">
            Live data provided by <span className="text-slate-500">OpenF1 API</span> · Refreshes every 3 seconds
          </p>
        </div>
      )}
    </div>
  );
}
