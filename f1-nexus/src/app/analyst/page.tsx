import Link from "next/link";
import { getAnalysis, getLastRaceResults, driverPhotoUrl, teamColor, constructorIdFromName } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

function circuitImage(raceName: string): string {
  const n = raceName.toLowerCase();
  if (n.includes("australia"))   return "/circuits/australia.webp";
  if (n.includes("bahrain"))     return "/circuits/bahrain.webp";
  if (n.includes("saudi"))       return "/circuits/saudi_arabia.webp";
  if (n.includes("japan"))       return "/circuits/japan.webp";
  if (n.includes("china"))       return "/circuits/china.webp";
  if (n.includes("miami"))       return "/circuits/miami.webp";
  if (n.includes("emilia") || n.includes("imola")) return "/circuits/emilia_romagna.webp";
  if (n.includes("monaco"))      return "/circuits/monaco.webp";
  if (n.includes("canada"))      return "/circuits/canada.webp";
  if (n.includes("spain"))       return "/circuits/spain.webp";
  if (n.includes("austria"))     return "/circuits/austria.webp";
  if (n.includes("great britain") || n.includes("british")) return "/circuits/great_britain.webp";
  if (n.includes("hungary"))     return "/circuits/hungary.webp";
  if (n.includes("belgium"))     return "/circuits/belgium.webp";
  if (n.includes("netherlands")) return "/circuits/netherlands.webp";
  if (n.includes("italy") || n.includes("monza")) return "/circuits/italy.webp";
  if (n.includes("azerbaijan"))  return "/circuits/azerbaijan.webp";
  if (n.includes("singapore"))   return "/circuits/singapore.webp";
  if (n.includes("united states") || n.includes("cota")) return "/circuits/united_states.webp";
  if (n.includes("mexico"))      return "/circuits/mexico.webp";
  if (n.includes("brazil"))      return "/circuits/brazil.webp";
  if (n.includes("las vegas"))   return "/circuits/las_vegas.webp";
  if (n.includes("qatar"))       return "/circuits/qatar.webp";
  if (n.includes("abu dhabi"))   return "/circuits/abu_dhabi.webp";
  return "/circuits/australia.webp";
}

// Generate a realistic lap-by-lap position trace
function genPositionTrace(gridPos: number, finalPos: number, pitLap: number, laps: number, isDnf = false): number[] {
  const pts: number[] = [];
  for (let lap = 1; lap <= laps; lap++) {
    if (isDnf && lap > 3) { pts.push(20); continue; }
    if (lap === 1) {
      // First lap: small shuffle from grid
      pts.push(Math.max(1, Math.min(20, gridPos + Math.round(Math.sin(gridPos) * 1.5))));
    } else if (lap < pitLap) {
      const progress = (lap - 1) / Math.max(pitLap - 2, 1);
      const prePitTarget = gridPos + (finalPos - gridPos) * progress * 0.5;
      const noise = Math.sin(lap * 0.9 + gridPos) * 0.6;
      pts.push(Math.max(1, Math.min(20, Math.round(prePitTarget + noise))));
    } else if (lap <= pitLap + 2) {
      // Pit drop — fall back by ~3–5 spots
      const drop = Math.min(20, finalPos + Math.max(3, Math.floor((20 - finalPos) * 0.25)));
      pts.push(drop);
    } else {
      // Recovery from pit drop to final position
      const recovery = Math.min(1, (lap - pitLap - 2) / Math.max(laps - pitLap - 2, 1) * 1.6);
      const dropPos = finalPos + Math.max(3, Math.floor((20 - finalPos) * 0.25));
      const pos = dropPos + (finalPos - dropPos) * recovery;
      const noise = Math.sin(lap * 0.5 + gridPos) * 0.4;
      pts.push(Math.max(1, Math.min(20, Math.round(pos + noise))));
    }
  }
  return pts;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalystPage() {
  const { race: lastRace, results: lastResults } = await getLastRaceResults();
  const raceName = lastRace?.name ?? "Australian Grand Prix";
  const year = 2026;
  const analysis = await getAnalysis(year, raceName);

  const top3 = analysis?.metrics?.top3 ?? lastResults.slice(0, 3).map((r, i) => ({
    position: String(i + 1),
    driver: r.driver,
    driverName: r.driverName,
    constructor: r.constructor,
    teamClass: constructorIdFromName(r.constructor),
    gap: i === 0 ? "Leader" : r.time,
  }));

  const sectorDeltas = analysis?.metrics?.sector_deltas ?? [
    { sector: "S1", delta: -0.08 },
    { sector: "S2", delta: -0.19 },
    { sector: "S3", delta: -0.05 },
  ];

  const coverImage = circuitImage(raceName);
  const today = fmtDate(new Date().toISOString());
  const totalLaps = 56;

  // All 22 drivers — 2026 Chinese GP (Shanghai, 15 March 2026)
  // isP2: second driver of team → dashed line for visual distinction
  const allDrivers = [
    { code: "ANT", teamClass: "mercedes",     gridPos:  1, finalPos:  1, pitLap: 20, isP2: true,  isDnf: false },
    { code: "RUS", teamClass: "mercedes",     gridPos:  2, finalPos:  2, pitLap: 21, isP2: false, isDnf: false },
    { code: "HAM", teamClass: "ferrari",      gridPos:  3, finalPos:  3, pitLap: 20, isP2: true,  isDnf: false },
    { code: "LEC", teamClass: "ferrari",      gridPos:  4, finalPos:  4, pitLap: 22, isP2: false, isDnf: false },
    { code: "PIA", teamClass: "mclaren",      gridPos:  5, finalPos: 20, pitLap:  1, isP2: true,  isDnf: true  },
    { code: "NOR", teamClass: "mclaren",      gridPos:  6, finalPos: 20, pitLap:  1, isP2: false, isDnf: true  },
    { code: "GAS", teamClass: "alpine",       gridPos:  7, finalPos:  6, pitLap: 18, isP2: false, isDnf: false },
    { code: "VER", teamClass: "red_bull",     gridPos:  8, finalPos: 20, pitLap: 42, isP2: false, isDnf: true  },
    { code: "HAD", teamClass: "red_bull",     gridPos:  9, finalPos:  8, pitLap: 17, isP2: true,  isDnf: false },
    { code: "BEA", teamClass: "haas",         gridPos: 10, finalPos:  5, pitLap: 26, isP2: true,  isDnf: false },
    { code: "ALO", teamClass: "aston_martin", gridPos: 11, finalPos: 20, pitLap: 28, isP2: false, isDnf: true  },
    { code: "STR", teamClass: "aston_martin", gridPos: 12, finalPos: 20, pitLap: 22, isP2: true,  isDnf: true  },
    { code: "LAW", teamClass: "rb",           gridPos: 13, finalPos:  7, pitLap: 19, isP2: false, isDnf: false },
    { code: "SAI", teamClass: "williams",     gridPos: 14, finalPos:  9, pitLap: 20, isP2: false, isDnf: false },
    { code: "COL", teamClass: "alpine",       gridPos: 15, finalPos: 10, pitLap: 21, isP2: true,  isDnf: false },
    { code: "OCO", teamClass: "haas",         gridPos: 16, finalPos: 11, pitLap: 18, isP2: false, isDnf: false },
    { code: "LIN", teamClass: "rb",           gridPos: 17, finalPos: 12, pitLap: 20, isP2: true,  isDnf: false },
    { code: "HUL", teamClass: "sauber",       gridPos: 18, finalPos: 13, pitLap: 19, isP2: false, isDnf: false },
    { code: "BOR", teamClass: "sauber",       gridPos: 19, finalPos: 20, pitLap:  1, isP2: true,  isDnf: true  },
    { code: "BOT", teamClass: "cadillac",     gridPos: 20, finalPos: 14, pitLap: 22, isP2: false, isDnf: false },
    { code: "PER", teamClass: "cadillac",     gridPos: 20, finalPos: 15, pitLap: 23, isP2: true,  isDnf: false },
    { code: "ALB", teamClass: "williams",     gridPos: 20, finalPos: 20, pitLap:  1, isP2: true,  isDnf: true  },
  ];

  const posTraces = allDrivers.map((d) =>
    genPositionTrace(d.gridPos, d.finalPos, d.pitLap, totalLaps, d.isDnf)
  );

  // SVG position chart config — P1–P20
  const CHART_W = 1000;
  const CHART_H = 480;
  const POS_MAX = 22;
  const CHART_PAD_L = 28;
  const CHART_PAD_R = 8;
  const CHART_PAD_T = 8;
  const CHART_PAD_B = 20;
  const innerW = CHART_W - CHART_PAD_L - CHART_PAD_R;
  const innerH = CHART_H - CHART_PAD_T - CHART_PAD_B;
  const xForLap = (lap: number) => CHART_PAD_L + ((lap - 1) / (totalLaps - 1)) * innerW;
  const yForPos = (pos: number) => CHART_PAD_T + ((pos - 1) / (POS_MAX - 1)) * innerH;

  const chartPaths = posTraces.map((trace) => {
    const pts = trace.map((pos, i) => `${xForLap(i + 1).toFixed(1)},${yForPos(Math.min(pos, POS_MAX)).toFixed(1)}`);
    return `M ${pts.join(" L ")}`;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none">
            Race <span className="text-primary">Analyst</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Post-race analysis & editorial · {raceName}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
          <span className="material-symbols-outlined text-slate-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Race Report</span>
        </div>
      </div>

      {/* ── Hero Article ── */}
      <Link href="/analyst/race" className="block group">
        <div className="relative rounded-2xl overflow-hidden border border-white/5 min-h-[360px] md:min-h-[520px] flex flex-col cursor-pointer">
          <div className="absolute inset-0">
            <img src={coverImage} alt={raceName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: "center 40%" }} />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.97) 100%)"
            }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Read Full Report</span>
            <span className="material-symbols-outlined text-white text-sm">arrow_forward</span>
          </div>

          <div className="relative flex flex-col justify-end flex-1 p-5 md:p-12">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] bg-primary text-white px-3 py-1 rounded-full">Grand Prix Report</span>
                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest drop-shadow-md">{today}</span>
                <span className="text-[9px] text-white/30">·</span>
                <span className="text-[9px] font-bold text-white/60 drop-shadow-md">10 min read</span>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary drop-shadow-lg">
                {analysis?.title ?? `${raceName.toUpperCase()} — ${year} RACE ANALYSIS`}
              </p>

              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight text-white leading-none"
                style={{ textShadow: "0 2px 24px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)" }}>
                {analysis?.headline ?? `The Story Behind the ${raceName}`}
              </h2>

              <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.9)" }}>
                {analysis?.analysis
                  ? analysis.analysis.slice(0, 220) + "…"
                  : "A strategic masterclass delivered pole to flag. ERS deployment and a perfectly timed pit stop built an unassailable lead by mid-race."}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white drop-shadow-md">~ Saad Haroon</p>
                    <p className="text-[9px] text-white/40">{today}</p>
                  </div>
                </div>
                {top3.length > 0 && (
                  <div className="flex items-center gap-3 sm:ml-4 sm:pl-4 sm:border-l sm:border-white/20">
                    {top3.map((r, i) => {
                      const color = teamColor(r.teamClass);
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
                      return (
                        <div key={r.driver} className="flex items-center gap-1.5">
                          <span className="text-sm">{medal}</span>
                          <div className="w-7 h-7 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 1.5px ${color}` }}>
                            <img src={driverPhotoUrl(r.driver)} alt={r.driver} className="w-full h-full object-cover object-top" />
                          </div>
                          <span className="text-[10px] font-black text-white drop-shadow-md">{r.driver}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Podium Steps + Sector Advantage ── */}
      {top3.length > 0 && (
        <div className="grid md:grid-cols-5 gap-4">

          {/* Podium — 3 cols */}
          <section className="md:col-span-3 bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
              <span className="material-symbols-outlined text-primary text-base">emoji_events</span>
              <h3 className="font-black italic uppercase text-sm">Race Podium · {lastRace?.name ?? raceName}</h3>
            </div>
            <div className="px-6 pb-0 pt-6">
              {/* Podium step layout: P2 left, P1 centre, P3 right */}
              <div className="flex items-end justify-center gap-2">
                {/* P2 */}
                {(() => {
                  const r = top3[1];
                  if (!r) return <div className="flex-1" />;
                  const color = teamColor(r.teamClass);
                  return (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden mb-2" style={{ boxShadow: `0 0 0 2px ${color}` }}>
                        <img src={driverPhotoUrl(r.driver)} alt={r.driver} className="w-full h-full object-cover object-top" />
                      </div>
                      <p className="font-black italic uppercase text-xs mb-0.5" style={{ color }}>{r.driver}</p>
                      <p className="text-[8px] text-slate-600 uppercase mb-2">{r.constructor}</p>
                      <p className="text-[9px] font-mono text-slate-500 mb-2">{r.gap ?? "—"}</p>
                      <div className="w-full rounded-t-xl flex flex-col items-center justify-start pt-3 pb-4"
                        style={{ height: 80, background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)", borderBottom: "none" }}>
                        <span className="text-3xl font-black text-slate-400">2</span>
                      </div>
                    </div>
                  );
                })()}

                {/* P1 — tallest */}
                {(() => {
                  const r = top3[0];
                  if (!r) return <div className="flex-1" />;
                  const color = teamColor(r.teamClass);
                  return (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-2" style={{ boxShadow: `0 0 0 2.5px ${color}, 0 0 20px ${color}40` }}>
                        <img src={driverPhotoUrl(r.driver)} alt={r.driver} className="w-full h-full object-cover object-top" />
                      </div>
                      {/* Winner crown */}
                      <span className="text-lg mb-0.5"></span>
                      <p className="font-black italic uppercase text-sm mb-0.5" style={{ color }}>{r.driver}</p>
                      <p className="text-[8px] text-slate-500 uppercase mb-2">{r.constructor}</p>
                      <p className="text-[9px] font-mono text-slate-500 mb-2">Winner</p>
                      <div className="w-full rounded-t-xl flex flex-col items-center justify-start pt-3 pb-4"
                        style={{ height: 120, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderBottom: "none" }}>
                        <span className="text-4xl font-black text-yellow-500/80">1</span>
                      </div>
                    </div>
                  );
                })()}

                {/* P3 */}
                {(() => {
                  const r = top3[2];
                  if (!r) return <div className="flex-1" />;
                  const color = teamColor(r.teamClass);
                  return (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden mb-2" style={{ boxShadow: `0 0 0 2px ${color}` }}>
                        <img src={driverPhotoUrl(r.driver)} alt={r.driver} className="w-full h-full object-cover object-top" />
                      </div>
                      <p className="font-black italic uppercase text-xs mb-0.5" style={{ color }}>{r.driver}</p>
                      <p className="text-[8px] text-slate-600 uppercase mb-2">{r.constructor}</p>
                      <p className="text-[9px] font-mono text-slate-500 mb-2">{r.gap ?? "—"}</p>
                      <div className="w-full rounded-t-xl flex flex-col items-center justify-start pt-3 pb-4"
                        style={{ height: 55, background: "rgba(194,65,12,0.06)", border: "1px solid rgba(194,65,12,0.15)", borderBottom: "none" }}>
                        <span className="text-2xl font-black text-orange-700/70">3</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Sector Advantage — 2 cols */}
          <div className="md:col-span-2 bg-card-dark border border-border-dark rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[14px]">speed</span>
                Sector Advantage · Winner vs Field
              </p>
              <div className="flex items-center justify-around">
                {sectorDeltas.map((s) => {
                  const abs = Math.min(Math.abs(s.delta), 0.5);
                  const offset = Math.round(175 - (abs / 0.5) * 160);
                  return (
                    <div key={s.sector} className="flex flex-col items-center gap-3">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="26" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                          <circle cx="32" cy="32" r="26" fill="transparent" stroke="#e00700" strokeWidth="4"
                            strokeDasharray="163" strokeDashoffset={offset} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[9px] font-black text-slate-300">{s.sector}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-black text-emerald-400 block">
                          {s.delta > 0 ? "+" : ""}{s.delta.toFixed(2)}s
                        </span>
                        <span className="text-[8px] text-slate-600 uppercase">advantage</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick race stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Race Laps",    value: String(totalLaps),    icon: "flag", color: "#60a5fa" },
                { label: "Season",       value: String(year),          icon: "calendar_today", color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-lg mb-1 block" style={{ color: s.color }}>{s.icon}</span>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[8px] font-bold uppercase text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Lap-by-Lap Position Chart ── */}
      <section className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">show_chart</span>
            <h3 className="font-black italic uppercase text-sm">Lap-by-Lap Race Positions</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] text-slate-600 font-mono">— Lead driver &nbsp;· · · Second driver</span>
            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Estimated · All 20</span>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="relative overflow-x-auto rounded-xl border border-white/5 bg-background-dark">
            <svg
              className="w-full"
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ display: "block", minHeight: 340 }}
            >
              {/* Horizontal grid lines P1–P20 */}
              {Array.from({ length: 22 }, (_, i) => i + 1).map((pos) => (
                <line key={pos}
                  x1={CHART_PAD_L} y1={yForPos(pos)} x2={CHART_W - CHART_PAD_R} y2={yForPos(pos)}
                  stroke={pos % 5 === 0 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)"}
                  strokeWidth={pos % 5 === 0 ? "1.5" : "0.8"} />
              ))}
              {/* Vertical lap markers every 10 laps */}
              {[10, 20, 30, 40, 50, totalLaps].map((lap) => (
                <line key={lap}
                  x1={xForLap(lap)} y1={CHART_PAD_T} x2={xForLap(lap)} y2={CHART_H - CHART_PAD_B}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}

              {/* Y-axis labels */}
              {[1, 5, 10, 15, 20, 22].map((pos) => (
                <text key={pos}
                  x={CHART_PAD_L - 4} y={yForPos(pos) + 3}
                  textAnchor="end" fontSize="9" fill="rgba(100,116,139,0.9)" fontFamily="monospace" fontWeight="700">
                  P{pos}
                </text>
              ))}

              {/* X-axis labels */}
              {[1, 10, 20, 30, 40, 50, totalLaps].map((lap) => (
                <text key={lap}
                  x={xForLap(lap)} y={CHART_H - 4}
                  textAnchor="middle" fontSize="8" fill="rgba(100,116,139,0.8)" fontFamily="monospace">
                  L{lap}
                </text>
              ))}

              {/* Driver traces — render back-markers first, leaders on top */}
              {[...chartPaths].reverse().map((path, ri) => {
                const i = chartPaths.length - 1 - ri;
                const d = allDrivers[i];
                const color = teamColor(d.teamClass);
                const dash = d.isP2 ? "6,4" : undefined;
                const opacity = d.isDnf ? 0.35 : d.finalPos <= 5 ? 1 : d.finalPos <= 10 ? 0.75 : 0.5;
                const strokeW = d.finalPos <= 3 ? 2.5 : d.finalPos <= 10 ? 1.8 : 1.2;
                return (
                  <g key={d.code}>
                    {/* Subtle glow for top runners */}
                    {d.finalPos <= 5 && (
                      <path d={path} fill="none" stroke={color} strokeWidth="6" strokeOpacity="0.1"
                        strokeLinejoin="round" strokeDasharray={dash} />
                    )}
                    <path d={path} fill="none" stroke={color}
                      strokeWidth={strokeW}
                      strokeOpacity={opacity}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray={dash} />
                    {/* Pit stop dot */}
                    {!d.isDnf && (
                      <circle
                        cx={xForLap(d.pitLap)}
                        cy={yForPos(Math.min(d.finalPos + Math.max(3, Math.floor((20 - d.finalPos) * 0.25)), 20))}
                        r={d.finalPos <= 5 ? 3.5 : 2.5}
                        fill={color} fillOpacity={opacity}
                        stroke="rgba(0,0,0,0.7)" strokeWidth="1" />
                    )}
                    {/* Driver code label at end of trace */}
                    {d.finalPos <= 10 && (
                      <text
                        x={xForLap(totalLaps) + 4}
                        y={yForPos(d.finalPos) + 3}
                        fontSize="7.5" fill={color} fillOpacity={opacity}
                        fontFamily="monospace" fontWeight="900">
                        {d.code}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend — all 20 drivers */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 mt-4">
            {allDrivers.map((d) => {
              const color = teamColor(d.teamClass);
              return (
                <div key={d.code} className="flex items-center gap-1.5" title={d.isDnf ? `${d.code} — DNF` : d.code}>
                  <svg width="18" height="8">
                    <line x1="0" y1="4" x2="14" y2="4"
                      stroke={color} strokeWidth={d.finalPos <= 3 ? "2.5" : "1.8"}
                      strokeDasharray={d.isP2 ? "4,3" : undefined}
                      strokeOpacity={d.isDnf ? 0.3 : 1} />
                  </svg>
                  <span className="text-[8px] font-black font-mono" style={{ color, opacity: d.isDnf ? 0.4 : 1 }}>{d.code}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[8px] text-slate-700 italic">● = pit stop &nbsp;· · · = second driver of team</span>
          </div>
        </div>
      </section>

    </div>
  );
}
