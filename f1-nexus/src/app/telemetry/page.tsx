"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getSchedule,
  getDriverTelemetry,
  getDriverStandings,
  getRaceResults,
  getSprintResultsForRound,
  getQualifyingResultsForRound,
  getSprintQualifyingResultsForRound,
  type ScheduleRace,
  type TelemetryData,
  type DriverStanding,
  type QualifyingResult,
  teamColor,
  constructorIdFromName,
  driverPhotoUrl,
  teamLogoUrl,
} from "@/lib/api";

// ─── Session config ────────────────────────────────────────────────────────────

const ALL_SESSIONS = [
  { val: "R", label: "Race", icon: "flag", color: "#e00700" },
  { val: "Q", label: "Qualifying", icon: "speed", color: "#60a5fa" },
  { val: "S", label: "Sprint", icon: "flash_on", color: "#fb923c" },
  { val: "SQ", label: "Sprint Qualifying", icon: "speed", color: "#fb923c" },
  { val: "FP1", label: "Free Practice 1", icon: "timer", color: "#94a3b8" },
  { val: "FP2", label: "Free Practice 2", icon: "timer", color: "#94a3b8" },
  { val: "FP3", label: "Free Practice 3", icon: "timer", color: "#94a3b8" },
];

// ─── Chart helpers ─────────────────────────────────────────────────────────────

function buildPath(
  xs: number[], ys: number[],
  w: number, h: number,
  minX: number, maxX: number,
  minY: number, maxY: number
): string {
  if (!xs?.length || xs.length !== ys?.length) return "";
  const sx = maxX === minX ? 1 : w / (maxX - minX);
  const sy = maxY === minY ? 1 : h / (maxY - minY);
  const pts: string[] = [];
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] == null || ys[i] == null) continue;
    const px = (xs[i] - minX) * sx;
    const py = h - (ys[i] - minY) * sy;
    if (!isNaN(px) && !isNaN(py)) pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.length > 0 ? `M ${pts.join(" L ")}` : "";
}

function parseSectorTime(t: string | undefined): number {
  if (!t || t.includes("NaT") || t === "-") return Infinity;
  const m = t.match(/(?:0 days )?00:(\d+):(\d+\.\d+)/);
  return m ? parseInt(m[1]) * 60 + parseFloat(m[2]) : Infinity;
}

type ProcessedTelemetry = {
  driver: string;
  color: string;
  tel: TelemetryData;
  isMissing: boolean;
  isSecondDriver?: boolean;
};

// ─── Reusable chart card ───────────────────────────────────────────────────────

function ChartCard({
  title, unit, icon, iconColor, children,
  drivers, yLabels,
}: {
  title: string; unit: string; icon: string; iconColor: string;
  children: React.ReactNode;
  drivers: ProcessedTelemetry[];
  yLabels: string[];
}) {
  return (
    <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base" style={{ color: iconColor }}>{icon}</span>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">{title}</h3>
          <span className="text-[9px] text-slate-600 font-mono">{unit}</span>
        </div>
        <div className="flex items-center gap-4">
          {drivers.map((t) => (
            <div key={t.driver} className="flex items-center gap-1.5">
              <div
                className="w-6 h-0.5 rounded-full"
                style={{
                  background: t.color,
                  borderTop: t.isSecondDriver ? `2px dashed ${t.color}` : undefined,
                  height: t.isSecondDriver ? 0 : undefined,
                }}
              />
              <span className="text-[10px] font-bold text-slate-400">{t.driver}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 md:px-10 pt-4 pb-6 relative overflow-x-auto">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 bottom-6 flex flex-col justify-between text-[9px] font-mono font-bold text-slate-600 text-right">
          {yLabels.map((l) => <span key={l}>{l}</span>)}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TelemetryPage() {
  const [schedule, setSchedule] = useState<ScheduleRace[]>([]);
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [raceIdx, setRaceIdx] = useState(0);
  const [session, setSession] = useState("R");
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(["VER", "LEC"]);
  const [targetLap, setTargetLap] = useState<string>("");
  const [availableLaps, setAvailableLaps] = useState<number[]>([]);
  const [telemetries, setTelemetries] = useState<ProcessedTelemetry[]>([]);
  const [sessionResults, setSessionResults] = useState<{ position: string; driver: string; driverName: string; constructor: string; time: string }[]>([]);
  const [qualifyingResults, setQualifyingResults] = useState<QualifyingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSchedule("current").then((s) => {
      const now = new Date();
      const past = s.filter((r) => new Date(new Date(r.date).getTime() - 2 * 24 * 60 * 60 * 1000) < now);
      const list = past.length > 0 ? past : s;
      setSchedule(list);
      setRaceIdx(Math.max(0, list.length - 1));
    });
    getDriverStandings("current").then(setDrivers);
  }, []);

  // Auto-load when race/session changes
  useEffect(() => {
    if (schedule.length > 0 && selectedDrivers.length > 0) {
      loadTelemetry();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceIdx, session, targetLap]);

  async function loadTelemetry(lap?: string) {
    if (!schedule[raceIdx] || selectedDrivers.length === 0) return;
    setLoading(true);
    setError(null);

    const lapToUse = lap ?? targetLap;
    const raceName = schedule[raceIdx].raceName;
    const year = new Date(schedule[raceIdx].date).getFullYear();

    // Fetch session-specific results for position context
    try {
      if (session === "S") {
        const { results } = await getSprintResultsForRound(String(year), schedule[raceIdx].round);
        setSessionResults(results ?? []);
        setQualifyingResults([]);
      } else if (session === "Q" || session === "SQ") {
        const fn = session === "SQ" ? getSprintQualifyingResultsForRound : getQualifyingResultsForRound;
        const { results } = await fn(String(year), schedule[raceIdx].round);
        setQualifyingResults(results ?? []);
        setSessionResults([]);
      } else {
        const raceData = await getRaceResults(String(year), schedule[raceIdx].round);
        setSessionResults(raceData.results ?? []);
        setQualifyingResults([]);
      }
    } catch {
      setSessionResults([]);
      setQualifyingResults([]);
    }

    const promises = selectedDrivers.map(async (code) => {
      const dStand = drivers.find((d) => d.driver.code === code);
      const color = teamColor(constructorIdFromName(dStand?.constructor ?? ""), "#888");
      try {
        const res = await getDriverTelemetry(year, raceName, session, code, lapToUse);
        return {
          driver: code,
          color,
          tel: res as TelemetryData,
          isMissing: !res || !!res.error || !res.data,
        };
      } catch {
        return { driver: code, color, tel: null as unknown as TelemetryData, isMissing: true };
      }
    });

    const results = await Promise.all(promises);
    const valid = results.filter((r) => !r.isMissing);

    if (valid.length > 0) {
      setAvailableLaps(valid[0].tel.available_laps ?? []);
    } else {
      setAvailableLaps([]);
      setError(`No telemetry data for ${selectedDrivers.join(", ")} in ${session}.`);
    }

    setTelemetries(results);
    setLoading(false);
  }

  function toggleDriver(code: string) {
    setSelectedDrivers((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    );
  }

  const validTels = telemetries.filter((t) => !t.isMissing);

  const teamCounts: Record<string, number> = {};
  const displayTels: ProcessedTelemetry[] = validTels.map((t) => {
    const n = teamCounts[t.color] ?? 0;
    teamCounts[t.color] = n + 1;
    return { ...t, isSecondDriver: n > 0 };
  });

  const allDist = validTels.flatMap((t) => t.tel.data.Distance ?? []);
  const minX = allDist.length ? Math.min(...allDist) : 0;
  const maxX = allDist.length ? Math.max(...allDist) : 1000;
  const W = 1200;

  // Track map: pick driver with most GPS points
  let bestTrack = validTels[0];
  validTels.forEach((t) => {
    if ((t.tel.data.X?.length ?? 0) > (bestTrack?.tel.data.X?.length ?? 0)) bestTrack = t;
  });

  const parsedTels = useMemo(() =>
    displayTels.map((t) => ({
      ...t,
      s1: parseSectorTime(t.tel.data.sector_1),
      s2: parseSectorTime(t.tel.data.sector_2),
      s3: parseSectorTime(t.tel.data.sector_3),
    })),
    [displayTels] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { fastestS1, fastestS2, fastestS3 } = useMemo(() => {
    if (!parsedTels.length) return { fastestS1: null, fastestS2: null, fastestS3: null };
    let f1 = parsedTels[0], f2 = parsedTels[0], f3 = parsedTels[0];
    parsedTels.forEach((t) => {
      if (t.s1 < f1.s1) f1 = t;
      if (t.s2 < f2.s2) f2 = t;
      if (t.s3 < f3.s3) f3 = t;
    });
    return { fastestS1: f1, fastestS2: f2, fastestS3: f3 };
  }, [parsedTels]);

  const trackSectors = useMemo(() => {
    if (!bestTrack?.tel.data.X?.length) return [];
    const { X: xs, Y: ys } = bestTrack.tel.data;
    const tMinX = Math.min(...xs), tMaxX = Math.max(...xs);
    const tMinY = Math.min(...ys), tMaxY = Math.max(...ys);
    const s1e = Math.floor(xs.length * 0.33);
    const s2e = Math.floor(xs.length * 0.66);
    return [
      { path: buildPath(xs.slice(0, s1e + 1), ys.slice(0, s1e + 1), 360, 260, tMinX, tMaxX, tMinY, tMaxY), color: fastestS1?.s1 !== Infinity ? fastestS1?.color : "#475569", label: "S1", driver: fastestS1?.driver },
      { path: buildPath(xs.slice(s1e, s2e + 1), ys.slice(s1e, s2e + 1), 360, 260, tMinX, tMaxX, tMinY, tMaxY), color: fastestS2?.s2 !== Infinity ? fastestS2?.color : "#475569", label: "S2", driver: fastestS2?.driver },
      { path: buildPath(xs.slice(s2e), ys.slice(s2e), 360, 260, tMinX, tMaxX, tMinY, tMaxY), color: fastestS3?.s3 !== Infinity ? fastestS3?.color : "#475569", label: "S3", driver: fastestS3?.driver },
    ];
  }, [bestTrack, fastestS1, fastestS2, fastestS3]);

  const currentRace = schedule[raceIdx];
  const sessionMeta = ALL_SESSIONS.find((s) => s.val === session) ?? ALL_SESSIONS[0];
  const isQ = session === "Q" || session === "SQ";
  const isFP = session === "FP1" || session === "FP2" || session === "FP3";

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none">
            Telemetry <span className="text-primary">Analysis</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentRace ? `${currentRace.raceName} · ` : ""}
            <span style={{ color: sessionMeta.color }}>{sessionMeta.label}</span>
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
            <span className="material-symbols-outlined text-primary text-base animate-spin">sync</span>
            <span className="text-xs font-bold text-primary uppercase">Acquiring Data…</span>
          </div>
        )}
      </div>

      {/* ── Control Panel ── */}
      <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">tune</span>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">Configure Session</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Race + Session selectors */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                Race Event
              </label>
              <select
                className="w-full bg-background-dark border border-border-dark rounded-xl text-sm py-2.5 px-3 text-slate-100 font-bold outline-none focus:border-primary/50 cursor-pointer"
                value={raceIdx}
                onChange={(e) => { setAvailableLaps([]); setTargetLap(""); setRaceIdx(Number(e.target.value)); }}
              >
                {schedule.map((r, i) => (
                  <option key={r.round} value={i}>R{r.round} — {r.raceName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                Session
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_SESSIONS.map((s) => (
                  <button
                    key={s.val}
                    onClick={() => { setAvailableLaps([]); setTargetLap(""); setSession(s.val); }}
                    className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                      session === s.val
                        ? "text-white border border-transparent"
                        : "bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                    }`}
                    style={session === s.val ? { backgroundColor: s.color + "33", borderColor: s.color + "66", color: s.color } : {}}
                  >
                    <span className="material-symbols-outlined text-[12px] block mx-auto mb-0.5">{s.icon}</span>
                    {s.val}
                  </button>
                ))}
              </div>
            </div>

            {/* Lap selector */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                Lap / Scope
              </label>
              {isQ ? (
                <select
                  className="w-full bg-background-dark border border-border-dark rounded-xl text-sm py-2.5 px-3 text-slate-100 font-bold outline-none cursor-pointer"
                  value={targetLap}
                  onChange={(e) => setTargetLap(e.target.value)}
                >
                  <option value="">Fastest Overall</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                </select>
              ) : availableLaps.length > 0 ? (
                <select
                  className="w-full bg-background-dark border border-border-dark rounded-xl text-sm py-2.5 px-3 text-slate-100 font-bold outline-none cursor-pointer"
                  value={targetLap}
                  onChange={(e) => setTargetLap(e.target.value)}
                >
                  <option value="">Fastest Lap</option>
                  {availableLaps.map((l) => (
                    <option key={l} value={String(l)}>Lap {l}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-background-dark border border-border-dark rounded-xl text-sm py-2.5 px-3 text-slate-700 font-bold">
                  Load data to see laps
                </div>
              )}
            </div>
          </div>

          {/* Driver selector */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Drivers ({selectedDrivers.length} selected)
              </label>
              <button
                onClick={() => setSelectedDrivers(
                  selectedDrivers.length === drivers.length ? [] : drivers.map((d) => d.driver.code)
                )}
                className="text-[9px] font-black uppercase text-primary hover:text-white transition-colors tracking-widest"
              >
                {selectedDrivers.length === drivers.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {drivers.map((d) => {
                const color = teamColor(constructorIdFromName(d.constructor), "#888");
                const isSelected = selectedDrivers.includes(d.driver.code);
                const logo = teamLogoUrl(constructorIdFromName(d.constructor));
                return (
                  <button
                    key={d.driver.code}
                    onClick={() => toggleDriver(d.driver.code)}
                    className={`relative flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left overflow-hidden ${
                      isSelected
                        ? "border-transparent"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                    }`}
                    style={isSelected ? {
                      backgroundColor: color + "22",
                      borderColor: color + "55",
                      boxShadow: `0 0 12px ${color}22`,
                    } : {}}
                  >
                    {/* Driver photo */}
                    <div
                      className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                      style={{ boxShadow: isSelected ? `0 0 0 1.5px ${color}` : "0 0 0 1px #333" }}
                    >
                      <img
                        src={driverPhotoUrl(d.driver.code)}
                        alt={d.driver.code}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[11px] font-black uppercase leading-tight"
                        style={{ color: isSelected ? color : "#94a3b8" }}
                      >
                        {d.driver.code}
                      </p>
                      <p className="text-[9px] text-slate-600 uppercase font-bold truncate">
                        {d.driver.name.split(" ").slice(-1)[0]}
                      </p>
                    </div>
                    {isSelected && (
                      <span
                        className="absolute top-1.5 right-1.5 material-symbols-outlined text-[12px]"
                        style={{ color }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => loadTelemetry()}
              disabled={loading || !schedule.length || !selectedDrivers.length}
              className="w-full mt-4 py-3 bg-primary rounded-xl text-white font-black uppercase tracking-widest text-sm hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}>
                {loading ? "sync" : "satellite_alt"}
              </span>
              {loading ? "Acquiring Telemetry…" : "Load Telemetry"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 flex items-center gap-3 text-red-300 text-sm">
          <span className="material-symbols-outlined flex-shrink-0">error_outline</span>
          <span>{error}</span>
        </div>
      )}

      {validTels.length > 0 && (
        <>
          {/* ── Track Map + Session Results ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Track Map */}
            <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">route</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Track Map</h3>
                <span className="text-[9px] text-slate-600 ml-auto">Sector dominance</span>
              </div>
              <div className="relative flex items-center justify-center p-6 min-h-[280px]">
                {trackSectors.length > 0 ? (
                  <>
                    <svg
                      className="w-full max-h-[240px]"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 400 300"
                    >
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      {trackSectors.map((sec, i) => (
                        <path
                          key={i} d={sec.path} fill="none"
                          stroke={sec.color} strokeWidth="9"
                          strokeLinecap="round" strokeLinejoin="round"
                          filter="url(#glow)"
                        />
                      ))}
                    </svg>
                    {/* Sector legend */}
                    <div className="absolute bottom-3 left-3 space-y-1 bg-background-dark/80 backdrop-blur p-2 rounded-lg border border-border-dark">
                      {trackSectors.map((sec, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-1 rounded-full" style={{ backgroundColor: sec.color }} />
                          <span className="text-[9px] font-bold text-slate-400">{sec.label}</span>
                          {sec.driver && (
                            <span className="text-[9px] font-black" style={{ color: sec.color }}>{sec.driver}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-5xl">route</span>
                    <p className="text-xs font-bold uppercase">Load telemetry to see track map</p>
                  </div>
                )}
              </div>
            </div>

            {/* Session Results Table */}
            <div className="lg:col-span-2 bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: sessionMeta.color }}
                >
                  {sessionMeta.icon}
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                  {isFP ? `${sessionMeta.label} — Fastest Sectors & Lap Count` : `${sessionMeta.label} — Sector & Lap Analysis`}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-border-dark text-slate-600 font-black uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Driver</th>
                      {isQ && <>
                        <th className="px-3 py-3 text-center">{session === "SQ" ? "SQ1" : "Q1"}</th>
                        <th className="px-3 py-3 text-center">{session === "SQ" ? "SQ2" : "Q2"}</th>
                        <th className="px-3 py-3 text-center">{session === "SQ" ? "SQ3" : "Q3"}</th>
                        <th className="px-3 py-3 text-center">{session === "SQ" ? "Sprint Grid" : "Race Grid"}</th>
                      </>}
                      {(session === "R" || session === "S") && <th className="px-3 py-3 text-center">Finish</th>}
                      {isFP && <th className="px-3 py-3 text-center">Total Laps</th>}
                      <th className="px-3 py-3 text-center border-l border-border-dark">Sector 1</th>
                      <th className="px-3 py-3 text-center border-l border-border-dark">Sector 2</th>
                      <th className="px-3 py-3 text-center border-l border-border-dark">Sector 3</th>
                      <th className="px-3 py-3 text-center border-l border-border-dark bg-white/5">Lap Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetries.map((t) => {
                      const res = t.tel?.driver_results;
                      const parsed = parsedTels.find((p) => p.driver === t.driver);
                      const isF1 = fastestS1?.driver === t.driver && fastestS1.s1 !== Infinity;
                      const isF2 = fastestS2?.driver === t.driver && fastestS2.s2 !== Infinity;
                      const isF3 = fastestS3?.driver === t.driver && fastestS3.s3 !== Infinity;
                      const dStand = drivers.find((d) => d.driver.code === t.driver);

                      return (
                        <tr
                          key={t.driver}
                          className={`border-b border-border-dark last:border-0 transition-colors ${
                            t.isMissing ? "opacity-30 grayscale" : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                                style={{ boxShadow: `0 0 0 1.5px ${t.color}` }}
                              >
                                <img
                                  src={driverPhotoUrl(t.driver)}
                                  alt={t.driver}
                                  className="w-full h-full object-cover object-top"
                                />
                              </div>
                              <div>
                                <p className="font-black" style={{ color: t.color }}>{t.driver}</p>
                                <p className="text-[9px] text-slate-600 font-bold uppercase">
                                  {dStand?.constructor ?? ""}
                                </p>
                              </div>
                              {t.isMissing && (
                                <span className="text-[9px] text-slate-700 font-bold">No data</span>
                              )}
                            </div>
                          </td>

                          {isQ && (() => {
                            const qr = qualifyingResults.find((q) => q.driverCode === t.driver);
                            const pos = qr?.position ?? null;
                            return <>
                              <td className="px-3 py-3 text-center font-mono text-slate-400 text-[11px]">{qr?.q1 || res?.Q1 || "—"}</td>
                              <td className="px-3 py-3 text-center font-mono text-slate-400 text-[11px]">{qr?.q2 || res?.Q2 || "—"}</td>
                              <td className="px-3 py-3 text-center font-mono text-slate-400 text-[11px]">{qr?.q3 || res?.Q3 || "—"}</td>
                              <td className="px-3 py-3 text-center">
                                <PositionBadge pos={pos ?? (res?.Position ?? null)} />
                              </td>
                            </>;
                          })()}
                          {(session === "R" || session === "S") && (
                            <td className="px-3 py-3 text-center">
                              {(() => {
                                const rr = sessionResults.find((r) => r.driver === t.driver);
                                return rr ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <PositionBadge pos={Number(rr.position)} />
                                    <p className="text-[9px] text-slate-600 font-mono">{rr.time}</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-700">—</span>
                                );
                              })()}
                            </td>
                          )}

                          {isFP && (
                            <td className="px-3 py-3 text-center">
                              <span className="font-black text-slate-200">
                                {t.tel?.available_laps?.length ?? "—"}
                              </span>
                            </td>
                          )}

                          {/* Sectors */}
                          {[
                            { isFastest: isF1, sector: t.tel?.data?.sector_1 },
                            { isFastest: isF2, sector: t.tel?.data?.sector_2 },
                            { isFastest: isF3, sector: t.tel?.data?.sector_3 },
                          ].map((sec, idx) => (
                            <td
                              key={idx}
                              className={`px-3 py-3 text-center font-mono border-l border-border-dark ${
                                sec.isFastest
                                  ? "text-emerald-400 font-black bg-emerald-500/5"
                                  : "text-slate-400"
                              }`}
                            >
                              {sec.isFastest && (
                                <span className="material-symbols-outlined text-[10px] text-emerald-400 mr-0.5">
                                  arrow_drop_up
                                </span>
                              )}
                              {sec.sector?.substring(10, 19) ?? "—"}
                            </td>
                          ))}

                          {/* Lap time */}
                          <td className="px-3 py-3 text-center font-mono font-black text-blue-400 bg-white/5 border-l border-border-dark">
                            {t.tel?.data?.lap_time?.substring(10, 19) ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {telemetries.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-700">
                            <span className="material-symbols-outlined text-4xl">data_thresholding</span>
                            <p className="text-xs font-bold uppercase tracking-widest">Select drivers and load telemetry</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Telemetry Traces ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black italic uppercase">
                Telemetry <span className="text-primary">Traces</span>
              </h2>
              <div className="flex-1 h-px bg-border-dark" />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                X-axis: Distance (m)
              </span>
            </div>

            {/* Speed */}
            <ChartCard title="Speed" unit="km/h" icon="speed" iconColor="#e00700" drivers={displayTels} yLabels={["360", "270", "180", "90", "0"]}>
              <div className="relative h-52">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full border-t border-white/[0.04]" />
                  ))}
                </div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} 360`}>
                  {displayTels.map((t) => (
                    <path
                      key={t.driver}
                      d={buildPath(t.tel.data.Distance, t.tel.data.Speed, W, 360, minX, maxX, 0, 360)}
                      fill="none" stroke={t.color} strokeWidth="2.5"
                      strokeDasharray={t.isSecondDriver ? "8 4" : "none"}
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 4px ${t.color}66)` }}
                    />
                  ))}
                </svg>
              </div>
            </ChartCard>

            {/* Throttle */}
            <ChartCard title="Throttle" unit="%" icon="bolt" iconColor="#22c55e" drivers={displayTels} yLabels={["100", "50", "0"]}>
              <div className="relative h-32">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2].map((i) => <div key={i} className="w-full border-t border-white/[0.04]" />)}
                </div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} 105`}>
                  {displayTels.map((t) => (
                    <path
                      key={t.driver}
                      d={buildPath(t.tel.data.Distance, t.tel.data.Throttle.map(Number), W, 105, minX, maxX, 0, 105)}
                      fill="none" stroke={t.color} strokeWidth="2.5"
                      strokeDasharray={t.isSecondDriver ? "8 4" : "none"}
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  ))}
                </svg>
              </div>
            </ChartCard>

            {/* Brake */}
            <ChartCard title="Brake" unit="ON/OFF" icon="emergency_heat" iconColor="#ef4444" drivers={displayTels} yLabels={["ON", "OFF"]}>
              <div className="relative h-24">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} 100`}>
                  {displayTels.map((t, i) => (
                    <path
                      key={t.driver}
                      d={buildPath(t.tel.data.Distance, t.tel.data.Brake.map((b) => (Number(b) * 80) + i * 4), W, 100, minX, maxX, 0, 100)}
                      fill="none" stroke={t.color} strokeWidth="2.5"
                      strokeDasharray={t.isSecondDriver ? "8 4" : "none"}
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  ))}
                </svg>
              </div>
            </ChartCard>

            {/* RPM */}
            <ChartCard title="Engine RPM" unit="revs" icon="vital_signs" iconColor="#a855f7" drivers={displayTels} yLabels={["15K", "10K", "5K", "0"]}>
              <div className="relative h-40">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="w-full border-t border-white/[0.04]" />)}
                </div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} 15000`}>
                  {displayTels.map((t) => (
                    <path
                      key={t.driver}
                      d={buildPath(t.tel.data.Distance, t.tel.data.RPM, W, 15000, minX, maxX, 0, 15000)}
                      fill="none" stroke={t.color} strokeWidth="2.5"
                      strokeDasharray={t.isSecondDriver ? "8 4" : "none"}
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 3px ${t.color}44)` }}
                    />
                  ))}
                </svg>
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {/* Empty state */}
      {validTels.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-700">
          <span className="material-symbols-outlined text-7xl opacity-30">satellite_alt</span>
          <p className="text-sm font-black uppercase tracking-widest">Select drivers and click Load Telemetry</p>
          <p className="text-xs">Data sourced from FastF1 · Real historical telemetry</p>
        </div>
      )}
    </div>
  );
}

function PositionBadge({ pos }: { pos: number | null }) {
  if (!pos) return <span className="text-slate-700 text-xs">—</span>;
  if (pos === 1) return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(234,179,8,0.18)", border: "1px solid rgba(234,179,8,0.4)" }}>
      <span className="material-symbols-outlined text-yellow-400 text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      <span className="font-black text-yellow-400 text-[11px]">P1</span>
    </div>
  );
  if (pos === 2) return (
    <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-400/15 border border-slate-400/35">
      <span className="font-black text-slate-300 text-[11px]">P2</span>
    </div>
  );
  if (pos === 3) return (
    <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-orange-700/15 border border-orange-500/35">
      <span className="font-black text-orange-400 text-[11px]">P3</span>
    </div>
  );
  return <span className="font-black text-slate-400 text-[11px]">P{pos}</span>;
}
