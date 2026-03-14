"use client";
import { useState, useEffect } from "react";
import { getPredictions, getSchedule, getDriverStandings, driverPhotoUrl, teamColor, constructorIdFromName, type PredictorData, type ScheduleRace, type DriverStanding } from "@/lib/api";

// ─── Static feature reference ─────────────────────────────────────────────────

const MODEL_FEATURES = [
  { key: "qualifying",   label: "Qualifying Position",   weight: 28, icon: "timer",          color: "#ff1500", desc: "Grid slot — single strongest predictor of race outcome" },
  { key: "recent_form",  label: "Recent Form (5 races)", weight: 22, icon: "trending_up",    color: "#f97316", desc: "Points-weighted average of last 5 race finishes" },
  { key: "track_hist",   label: "Circuit Track History", weight: 16, icon: "map",            color: "#a78bfa", desc: "Driver & team historical performance at this circuit" },
  { key: "team_pace",    label: "Team Pace Differential",weight: 14, icon: "speed",          color: "#60a5fa", desc: "Constructor gap vs field average over last 3 events" },
  { key: "reliability",  label: "Reliability Index",     weight:  8, icon: "build",          color: "#34d399", desc: "DNF / mechanical failure rate across last 2 seasons" },
  { key: "tyre_mgmt",    label: "Tyre Management Score", weight:  6, icon: "circle",         color: "#fbbf24", desc: "Historical compound degradation vs field baseline" },
  { key: "ers_deploy",   label: "ERS Deployment Profile",weight:  3, icon: "bolt",           color: "#38bdf8", desc: "2026 uprated MGU-K usage pattern from prior events" },
  { key: "weather",      label: "Weather Conditions",    weight:  2, icon: "cloud",          color: "#94a3b8", desc: "Temperature, humidity, chance of safety car" },
  { key: "pit_strategy", label: "Pit Strategy Model",    weight:  1, icon: "flag",           color: "#fb923c", desc: "Optimal stop window from Monte Carlo strategy sim" },
];

const CONFIDENCE_LEVELS = [
  { label: "ELITE",    color: "#34d399", range: "≥ 70%",  desc: "High historical accuracy — strong predictive signal" },
  { label: "STRONG",   color: "#60a5fa", range: "50–70%", desc: "Solid prediction with moderate variance" },
  { label: "MODERATE", color: "#fbbf24", range: "30–50%", desc: "Competitive field — prediction less certain" },
  { label: "OPEN",     color: "#f97316", range: "< 30%",  desc: "Highly contested — multiple realistic outcomes" },
];

const MODEL_METRICS = [
  { label: "Top-3 Accuracy",   value: "89.5%", sub: "2024–25 seasons",   icon: "emoji_events",  color: "#34d399" },
  { label: "Winner Accuracy",  value: "48.6%", sub: "2024–25 seasons",   icon: "star",          color: "#fbbf24" },
  { label: "Lap Time MAE",     value: "3.22s", sub: "gradient boosting", icon: "analytics",     color: "#60a5fa" },
  { label: "Simulations",      value: "10,000",sub: "Monte Carlo runs",  icon: "memory",        color: "#a78bfa" },
];

function getConfidenceLevel(topProb: number) {
  if (topProb >= 70) return CONFIDENCE_LEVELS[0];
  if (topProb >= 50) return CONFIDENCE_LEVELS[1];
  if (topProb >= 30) return CONFIDENCE_LEVELS[2];
  return CONFIDENCE_LEVELS[3];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PredictorPage() {
  const [schedule, setSchedule] = useState<ScheduleRace[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [data, setData] = useState<PredictorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"win" | "podium" | "dist">("win");
  const [standings, setStandings] = useState<DriverStanding[]>([]);

  useEffect(() => {
    getSchedule().then((s) => {
      setSchedule(s);
      if (s.length > 0) {
        const now = new Date();
        const upcoming = s.find((r) => new Date(r.date) > now) ?? s[s.length - 1];
        setSelectedRace(upcoming.raceName);
      }
    });
    getDriverStandings().then(setStandings);
  }, []);

  useEffect(() => {
    if (!selectedRace) return;
    setLoading(true);
    setData(null);
    getPredictions(2026, selectedRace).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [selectedRace]);

  const winProbs = data?.win_probabilities ?? [];
  const podiumProbs = data?.podium_probabilities ?? [];
  const dist = data?.distribution ?? [];
  const topDistProb = dist.length > 0 ? Math.max(...dist.map((d) => d.prob)) : 1;
  const topWinProb = winProbs.length > 0 ? winProbs[0].probability : 0;
  const confidence = getConfidenceLevel(topWinProb);
  const topDriver = winProbs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none">
            Race <span className="text-primary">Predictor</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">ML-driven race outcome prediction · Monte Carlo simulation engine</p>
        </div>

        {/* Race selector */}
        <div className="flex items-center gap-3 bg-card-dark border border-border-dark rounded-xl px-4 py-3 w-full md:w-auto md:min-w-64">
          <span className="material-symbols-outlined text-primary text-base">flag</span>
          <select
            className="flex-1 bg-transparent text-sm text-white font-bold outline-none cursor-pointer"
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
          >
            {schedule.map((r) => (
              <option key={r.round} value={r.raceName} className="bg-[#111]">
                R{r.round} — {r.raceName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Model accuracy KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MODEL_METRICS.map((m) => (
          <div key={m.label} className="bg-card-dark border border-border-dark rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: m.color + "18", border: `1px solid ${m.color}30` }}>
              <span className="material-symbols-outlined text-base" style={{ color: m.color }}>{m.icon}</span>
            </div>
            <div>
              <p className="text-lg font-black text-white leading-none">{m.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{m.label}</p>
              <p className="text-[8px] text-slate-700">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      {loading ? (
        <div className="bg-card-dark border border-border-dark rounded-2xl p-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Running 10,000 simulations…</p>
          <p className="text-slate-600 text-xs">Calculating qualifying-weighted Monte Carlo outcomes</p>
        </div>
      ) : !data && !loading ? (
        <div className="bg-card-dark border border-border-dark rounded-2xl p-16 text-center">
          <span className="material-symbols-outlined text-primary text-4xl mb-3 block">auto_graph</span>
          <p className="text-slate-400 text-sm">Select a race above to generate predictions</p>
        </div>
      ) : data ? (
        <div className="space-y-6">

          {/* ── Hero prediction card ── */}
          <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-3">
              {/* Winner card */}
              <div className="md:col-span-1 relative p-8 flex flex-col items-center justify-center gap-4 border-b md:border-b-0 md:border-r border-border-dark"
                style={{ background: `radial-gradient(ellipse at center, ${topDriver ? teamColor(topDriver.teamClass) + "12" : "transparent"} 0%, transparent 70%)` }}>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Predicted Race Winner</div>
                {topDriver && (
                  <>
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden"
                        style={{ boxShadow: `0 0 0 3px ${teamColor(topDriver.teamClass)}, 0 0 40px ${teamColor(topDriver.teamClass)}50` }}>
                        <img src={driverPhotoUrl(topDriver.driver)} alt={topDriver.name}
                          className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: teamColor(topDriver.teamClass) }}>
                        🏆
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black italic uppercase" style={{ color: teamColor(topDriver.teamClass) }}>
                        {topDriver.name.split(" ").pop()}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {topDriver.teamClass.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-black text-white">{topDriver.probability.toFixed(1)}%</p>
                      <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">win probability</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                      style={{ background: confidence.color + "20", color: confidence.color, border: `1px solid ${confidence.color}40` }}>
                      {confidence.label} confidence
                    </div>
                  </>
                )}
              </div>

              {/* Tabs + charts */}
              <div className="md:col-span-2 flex flex-col">
                {/* Tab bar */}
                <div className="flex border-b border-border-dark">
                  {(["win", "podium", "dist"] as const).map((tab) => {
                    const labels = { win: "Win Probabilities", podium: "Podium Odds", dist: "Finish Distribution" };
                    return (
                      <button key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === tab
                            ? "text-primary border-b-2 border-primary -mb-px"
                            : "text-slate-600 hover:text-slate-300"
                        }`}>
                        {labels[tab]}
                      </button>
                    );
                  })}
                </div>

                <div className="p-6 flex-1">
                  {/* Win probabilities */}
                  {activeTab === "win" && (
                    <div className="space-y-4">
                      {winProbs.slice(0, 8).map((d, i) => {
                        const color = teamColor(d.teamClass);
                        const barW = winProbs[0].probability > 0
                          ? (d.probability / winProbs[0].probability) * 100
                          : 0;
                        return (
                          <div key={d.driver} className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-600 w-4 text-right">{i + 1}</span>
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                              style={{ boxShadow: `0 0 0 1.5px ${color}` }}>
                              <img src={driverPhotoUrl(d.driver)} alt={d.name}
                                className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-black text-white truncate">{d.name}</span>
                                <span className="text-xs font-black ml-2 flex-shrink-0" style={{ color }}>
                                  {d.probability.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${barW}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Podium probabilities */}
                  {activeTab === "podium" && (
                    <div className="grid grid-cols-2 gap-3">
                      {podiumProbs.slice(0, 8).map((d, i) => {
                        const color = teamColor(d.teamClass);
                        return (
                          <div key={d.driver}
                            className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                              style={{ boxShadow: `0 0 0 1.5px ${color}` }}>
                              <img src={driverPhotoUrl(d.driver)} alt={d.name}
                                className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-white truncate">{d.name.split(" ").pop()}</p>
                              <p className="text-[8px] text-slate-600 uppercase">{d.teamClass.replace(/_/g, " ")}</p>
                              <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${d.probability}%`, background: color }} />
                              </div>
                            </div>
                            <span className="text-sm font-black flex-shrink-0" style={{ color }}>
                              {d.probability.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Finish distribution */}
                  {activeTab === "dist" && (
                    <div className="space-y-3">
                      {topDriver && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                          Finishing position distribution — {topDriver.name}
                        </p>
                      )}
                      <div className="flex items-end h-32 gap-1">
                        {dist.map((b, i) => {
                          const h = `${Math.round((b.prob / topDistProb) * 100)}%`;
                          const isTop = b.prob === topDistProb;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="w-full rounded-t transition-all"
                                style={{
                                  height: h,
                                  background: isTop ? "#ff1500" : "rgba(255,21,0,0.2)",
                                  boxShadow: isTop ? "0 0 12px rgba(255,21,0,0.4)" : undefined,
                                  borderTop: "1px solid rgba(255,21,0,0.4)",
                                }} />
                              <span className={`text-[8px] font-bold font-mono ${isTop ? "text-white" : "text-slate-600"}`}>
                                {b.pos === "DNF" ? "D" : `P${b.pos}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-700 font-mono mt-1">
                        <span>Best case</span>
                        <span>Worst case</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Full grid: all drivers win probability ── */}
          <section className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
              <span className="material-symbols-outlined text-primary text-base">grid_view</span>
              <h3 className="font-black italic uppercase text-sm">Full Grid Win Probability</h3>
              <span className="ml-auto text-[9px] text-slate-600 uppercase font-bold tracking-widest">
                {data.simulations?.toLocaleString() ?? "10,000"} Monte Carlo runs
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {winProbs.map((d, i) => {
                const color = teamColor(d.teamClass);
                const barW = winProbs[0].probability > 0 ? (d.probability / winProbs[0].probability) * 100 : 0;
                return (
                  <div key={d.driver} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-700 w-4 flex-shrink-0">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                      style={{ boxShadow: `0 0 0 1.5px ${color}` }}>
                      <img src={driverPhotoUrl(d.driver)} alt={d.name}
                        className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white truncate">{d.name.split(" ").pop()}</p>
                      <div className="h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${barW}%`, background: color }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black flex-shrink-0" style={{ color }}>
                      {d.probability.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      ) : null}

      {/* ── 2026 Live Championship Form ── */}
      {standings.length > 0 && (
        <section className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
            <h3 className="font-black italic uppercase text-sm">2026 Live Championship Form</h3>
            <span className="ml-auto text-[9px] text-slate-600 uppercase font-bold tracking-widest">Used as model input · Updates live</span>
          </div>
          <div className="p-4 flex gap-3 overflow-x-auto">
            {standings.slice(0, 10).map((d, i) => {
              const color = teamColor(constructorIdFromName(d.constructor));
              return (
                <div key={d.driver.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px ${color}` }}>
                      <img src={driverPhotoUrl(d.driver.code)} alt={d.driver.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-background-dark border border-border-dark" style={{ color }}>
                      {i + 1}
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-white text-center leading-tight">{d.driver.name.split(" ").pop()}</p>
                  <p className="text-[8px] font-black" style={{ color }}>{d.points} pts</p>
                </div>
              );
            })}
          </div>
          <div className="px-5 pb-4">
            <p className="text-[9px] text-slate-600 leading-relaxed">
              Current 2026 championship standings feed directly into the <span className="text-slate-400">Recent Form</span> and <span className="text-slate-400">Team Pace</span> feature weights. The model rebalances win probabilities based on live points gaps and momentum trends from the 2026 season.
            </p>
          </div>
        </section>
      )}

      {/* ── Model methodology ── */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Feature importance */}
        <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
            <span className="material-symbols-outlined text-primary text-base">bar_chart</span>
            <h3 className="font-black italic uppercase text-sm">Feature Importance</h3>
            <span className="ml-auto text-[9px] text-slate-600">How predictions are weighted</span>
          </div>
          <div className="p-5 space-y-3">
            {MODEL_FEATURES.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: f.color }}>{f.icon}</span>
                    <span className="text-[10px] font-black text-white">{f.label}</span>
                  </div>
                  <span className="text-[10px] font-black font-mono" style={{ color: f.color }}>{f.weight}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${f.weight}%`, background: f.color, boxShadow: `0 0 6px ${f.color}40` }} />
                </div>
                <p className="text-[8px] text-slate-700 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence levels + methodology */}
        <div className="space-y-4">
          <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              <h3 className="font-black italic uppercase text-sm">Confidence Levels</h3>
            </div>
            <div className="p-5 space-y-3">
              {CONFIDENCE_LEVELS.map((c) => (
                <div key={c.label} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: c.color + "08", border: `1px solid ${c.color}20` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black" style={{ color: c.color }}>{c.label}</span>
                      <span className="text-[9px] font-mono text-slate-500">{c.range}</span>
                    </div>
                    <p className="text-[8px] text-slate-600 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card-dark border border-border-dark rounded-2xl p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">How It Works</p>
            <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <p>The core model is a <span className="text-slate-300 font-bold">Gradient Boosting Regressor</span> (100 estimators, learning rate 0.1) trained on <span className="text-slate-300 font-bold">2024–2025 F1 season data</span> via FastF1. It predicts lap time per driver; drivers are ranked by predicted time to produce finishing order probabilities.</p>
              <p>Qualifying position carries the highest feature weight (28%) as the strongest single predictor — track position in modern F1 is decisive. The model achieved a mean absolute lap-time error of <span className="text-slate-300 font-bold">3.22 seconds</span> and top-3 podium accuracy of <span className="text-slate-300 font-bold">89.5%</span> across the 2024–25 seasons.</p>
              <p>For 2026 predictions, the model augments its historical baseline with <span className="text-slate-300 font-bold">live 2026 standings data</span> — current championship points gaps are mapped to form adjustments on the Recent Form and Team Pace features, accounting for momentum changes from the season so far.</p>
              <p>Monte Carlo simulation runs 10,000 race scenarios sampling from historical degradation distributions, reliability failure rates, and safety car probabilities to produce a statistically robust finishing position distribution per driver.</p>
              <p className="text-slate-600">Data: Jolpica F1 API · FastF1 telemetry · Pirelli compound statistics · 2024–2026 race history</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
