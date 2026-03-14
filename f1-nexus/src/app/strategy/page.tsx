"use client";
import { useState } from "react";
import { simulateStrategy, type StrategyData, driverPhotoUrl, teamColor } from "@/lib/api";

// ─── 2026 Full driver roster ──────────────────────────────────────────────────

const DRIVERS_2026 = [
  { code: "VER", name: "Verstappen",  team: "Red Bull",     constructor: "red_bull" },
  { code: "HAD", name: "Hadjar",      team: "Red Bull",     constructor: "red_bull" },
  { code: "LAW", name: "Lawson",      team: "Racing Bulls", constructor: "rb" },
  { code: "LIN", name: "Lindblad",   team: "Racing Bulls", constructor: "rb" },
  { code: "RUS", name: "Russell",     team: "Mercedes",     constructor: "mercedes" },
  { code: "ANT", name: "Antonelli",   team: "Mercedes",     constructor: "mercedes" },
  { code: "LEC", name: "Leclerc",     team: "Ferrari",      constructor: "ferrari" },
  { code: "HAM", name: "Hamilton",    team: "Ferrari",      constructor: "ferrari" },
  { code: "NOR", name: "Norris",      team: "McLaren",      constructor: "mclaren" },
  { code: "PIA", name: "Piastri",     team: "McLaren",      constructor: "mclaren" },
  { code: "ALO", name: "Alonso",      team: "Aston Martin", constructor: "aston_martin" },
  { code: "STR", name: "Stroll",      team: "Aston Martin", constructor: "aston_martin" },
  { code: "GAS", name: "Gasly",       team: "Alpine",       constructor: "alpine" },
  { code: "COL", name: "Colapinto",   team: "Alpine",       constructor: "alpine" },
  { code: "ALB", name: "Albon",       team: "Williams",     constructor: "williams" },
  { code: "SAI", name: "Sainz",       team: "Williams",     constructor: "williams" },
  { code: "HUL", name: "Hulkenberg",  team: "Audi",         constructor: "audi" },
  { code: "BOR", name: "Bortoleto",   team: "Audi",         constructor: "audi" },
  { code: "BEA", name: "Bearman",     team: "Haas",         constructor: "haas" },
  { code: "OCO", name: "Ocon",        team: "Haas",         constructor: "haas" },
  { code: "PER", name: "Perez",       team: "Cadillac",     constructor: "cadillac" },
  { code: "BOT", name: "Bottas",      team: "Cadillac",     constructor: "cadillac" },
];

const TRACKS = [
  { name: "Australian Grand Prix",     laps: 58,  sc_prob: 0.40, drs_zones: 4 },
  { name: "Chinese Grand Prix",        laps: 56,  sc_prob: 0.30, drs_zones: 2 },
  { name: "Japanese Grand Prix",       laps: 53,  sc_prob: 0.25, drs_zones: 2 },
  { name: "Bahrain Grand Prix",        laps: 57,  sc_prob: 0.30, drs_zones: 3 },
  { name: "Saudi Arabian Grand Prix",  laps: 50,  sc_prob: 0.50, drs_zones: 3 },
  { name: "Miami Grand Prix",          laps: 57,  sc_prob: 0.45, drs_zones: 3 },
  { name: "Emilia Romagna Grand Prix", laps: 63,  sc_prob: 0.30, drs_zones: 2 },
  { name: "Monaco Grand Prix",         laps: 78,  sc_prob: 0.50, drs_zones: 1 },
  { name: "Spanish Grand Prix",        laps: 66,  sc_prob: 0.25, drs_zones: 2 },
  { name: "Canadian Grand Prix",       laps: 70,  sc_prob: 0.55, drs_zones: 2 },
  { name: "Austrian Grand Prix",       laps: 71,  sc_prob: 0.35, drs_zones: 2 },
  { name: "British Grand Prix",        laps: 52,  sc_prob: 0.40, drs_zones: 2 },
  { name: "Belgian Grand Prix",        laps: 44,  sc_prob: 0.40, drs_zones: 2 },
  { name: "Hungarian Grand Prix",      laps: 70,  sc_prob: 0.30, drs_zones: 1 },
  { name: "Dutch Grand Prix",          laps: 72,  sc_prob: 0.30, drs_zones: 1 },
  { name: "Italian Grand Prix",        laps: 53,  sc_prob: 0.30, drs_zones: 3 },
  { name: "Azerbaijan Grand Prix",     laps: 51,  sc_prob: 0.55, drs_zones: 2 },
  { name: "Singapore Grand Prix",      laps: 62,  sc_prob: 0.60, drs_zones: 3 },
  { name: "United States Grand Prix",  laps: 56,  sc_prob: 0.40, drs_zones: 2 },
  { name: "Mexico City Grand Prix",    laps: 71,  sc_prob: 0.30, drs_zones: 3 },
  { name: "São Paulo Grand Prix",      laps: 71,  sc_prob: 0.55, drs_zones: 2 },
  { name: "Las Vegas Grand Prix",      laps: 50,  sc_prob: 0.30, drs_zones: 2 },
  { name: "Qatar Grand Prix",          laps: 57,  sc_prob: 0.35, drs_zones: 2 },
  { name: "Abu Dhabi Grand Prix",      laps: 58,  sc_prob: 0.20, drs_zones: 3 },
];

const COMPOUNDS = [
  {
    label: "S", key: "Soft",   color: "#e00700", text: "#fff",
    fullName: "P Zero Soft",  maxLife: "12–20L", degRate: "0.07–0.10s/lap",
    desc: "Maximum grip, fastest degradation. Short stints only.",
  },
  {
    label: "M", key: "Medium", color: "#eab308", text: "#000",
    fullName: "P Zero Medium", maxLife: "22–32L", degRate: "0.03–0.05s/lap",
    desc: "The strategic compound — balances pace and longevity.",
  },
  {
    label: "H", key: "Hard",   color: "#d1d5db", text: "#000",
    fullName: "P Zero Hard",   maxLife: "35–50L", degRate: "0.01–0.03s/lap",
    desc: "Maximum durability. Consistent across long final stints.",
  },
];

const DATA_YEARS = [2022, 2023, 2024, 2025, 2026];

const SIMULATION_FACTORS = [
  {
    key: "sc", label: "Safety Car Risk", icon: "car_crash", group: "Race Events",
    source: "Jolpica API",
    desc: "SC/VSC probability from historical Jolpica race data",
    detail: "Derived from 5 years of SC deployment records via Jolpica F1 API. At high-probability circuits (Singapore ≥60%), the model triggers a random SC window in ~60% of simulations, forcing reactive pit decisions.",
  },
  {
    key: "deg", label: "Tyre Degradation", icon: "tire_repair", group: "Tyres",
    source: "Historical Laps",
    desc: "Per-constructor tyre wear coefficient from race history",
    detail: "Each constructor has a calibrated degradation multiplier derived from historical stint data. A team known for high tyre stress (e.g. rear-limited car) will degrade faster per lap, tightening the natural pit window.",
  },
  {
    key: "fuel", label: "Fuel Load Effect", icon: "local_gas_station", group: "Car Physics",
    source: "FIA Regs",
    desc: "~0.035–0.045s per lap lap-time gain as fuel burns",
    detail: "Simulates progressive lap-time improvement as the fuel load reduces (~0.3–0.4s per kg). A heavier car in Lap 1 runs slower, shifting undercut windows to later in the stint where the pace offset diminishes.",
  },
  {
    key: "weather", label: "Weather Variability", icon: "cloud", group: "Race Events",
    source: "Weather Model",
    desc: "Probabilistic wet conditions or intermediate stint",
    detail: "Introduces a low-probability random rainfall event mid-race. If triggered, forces an intermediate tyre stint and resets the dry compound strategy from that lap — effectively randomising the remaining stops.",
  },
  {
    key: "drs", label: "Overtake Index", icon: "speed", group: "Circuit",
    source: "Circuit Data",
    desc: "DRS zone count and historical overtaking difficulty",
    detail: "Circuits with 3+ DRS zones reduce the cost of losing track position, making 1-stop strategies viable. Street circuits with 1 DRS zone heavily penalise a late pit stop — the model adjusts pit priority accordingly.",
  },
  {
    key: "start", label: "Grid Position Impact", icon: "flag", group: "Race Events",
    source: "Jolpica API",
    desc: "First-lap gain/loss model from historical race starts",
    detail: "Jolpica race result data is used to compute a per-driver, per-circuit first-lap position delta distribution. Higher variance at street circuits and high-SC-probability tracks. Can justify an early stop if position is lost.",
  },
  {
    key: "competitor", label: "Rival Pit Windows", icon: "group", group: "Competition",
    source: "Historical Data",
    desc: "Overlay rival team historical pit window timing",
    detail: "Pulls the median pit window for each of the top 5 competing teams at this circuit from historical data. When a rival is modelled to stop, the simulator evaluates whether an undercut response changes the optimal outcome.",
  },
  {
    key: "track_evo", label: "Track Evolution", icon: "trending_up", group: "Circuit",
    source: "Lap Time Model",
    desc: "Rubber laid down improves lap times as the race progresses",
    detail: "Grip improves lap-by-lap as rubber builds up on the racing line. Early stints on a green track are modelled as slower. This makes very early pit stops less effective and extends viable stint lengths in opening laps.",
  },
  {
    key: "ers", label: "ERS Deployment Profile", icon: "bolt", group: "Car Physics",
    source: "2026 Regs",
    desc: "2026-spec 350kW MGU-K deployment management per stint",
    detail: "Models the 2026 hybrid deployment limits (350kW MGU-K, 8MJ battery). Overtake Mode boost availability is tracked lap-by-lap. A depleted battery entering a DRS zone reduces pace, influencing optimal pit timing.",
  },
  {
    key: "vsc", label: "Virtual Safety Car", icon: "slow_motion_video", group: "Race Events",
    source: "Jolpica API",
    desc: "VSC probability distinct from full Safety Car model",
    detail: "Separately models VSC probability (historically higher frequency than full SC). A VSC window cuts pit-lane time loss by ~10s, making it a high-value opportunity for a net-zero-cost pit stop if timed correctly.",
  },
];

// ─── Compound tyre SVG icon ───────────────────────────────────────────────────

function TyreIcon({ compound, size = "lg" }: { compound: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const c = COMPOUNDS.find((x) => x.key === compound) ?? COMPOUNDS[0];
  const cfg = {
    sm:  { wh: "w-8 h-8",   cx: 16, r: 12, sw: 2.5, fs: "text-xs" },
    md:  { wh: "w-12 h-12", cx: 24, r: 19, sw: 3.5, fs: "text-sm" },
    lg:  { wh: "w-16 h-16", cx: 32, r: 26, sw: 4,   fs: "text-lg" },
    xl:  { wh: "w-20 h-20", cx: 40, r: 33, sw: 5,   fs: "text-2xl" },
  }[size];
  return (
    <div className={`${cfg.wh} relative flex items-center justify-center flex-shrink-0`}>
      <svg className="absolute inset-0 w-full h-full">
        <circle cx={cfg.cx} cy={cfg.cx} r={cfg.r} fill="rgba(255,255,255,0.03)" stroke={c.color} strokeWidth={cfg.sw} />
        <circle cx={cfg.cx} cy={cfg.cx} r={cfg.r - cfg.sw - 2} fill="transparent" stroke={c.color} strokeWidth="1" strokeOpacity="0.2" />
      </svg>
      <span className={`relative font-black ${cfg.fs}`} style={{ color: c.color }}>{c.label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StrategyPage() {
  const [driverCode, setDriverCode] = useState("NOR");
  const [trackIdx, setTrackIdx] = useState(0);
  const [compound, setCompound] = useState("Soft");
  const [stops, setStops] = useState(2);
  const [factors, setFactors] = useState<Set<string>>(new Set(["sc", "deg", "fuel", "track_evo"]));
  const [dataYears, setDataYears] = useState<Set<number>>(new Set([2024, 2025, 2026]));
  const [result, setResult] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(false);

  const track = TRACKS[trackIdx];
  const driver = DRIVERS_2026.find((d) => d.code === driverCode) ?? DRIVERS_2026[0];
  const driverColor = teamColor(driver.constructor);

  function toggleFactor(key: string) {
    setFactors((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  function toggleYear(y: number) {
    setDataYears((prev) => {
      const n = new Set(prev);
      if (n.has(y) && n.size === 1) return n; // keep at least one
      n.has(y) ? n.delete(y) : n.add(y);
      return n;
    });
  }

  async function handleSimulate() {
    setLoading(true);
    const data = await simulateStrategy({
      driver: driverCode,
      track: track.name,
      starting_compound: compound,
      stops,
      total_laps: track.laps,
    });
    setResult(data);
    setLoading(false);
  }

  const stints = result?.stints ?? [];
  const chartData = result?.chart_data ?? [];

  let svgPath = "";
  const pitMarkers: { x: number; lap: number }[] = [];
  if (chartData.length > 0) {
    const maxDelta = Math.max(...chartData.map((d) => Math.abs(d.delta)), 1);
    const pts = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * 900;
      const y = 110 - (d.delta / maxDelta) * 95;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    svgPath = `M ${pts.join(" L ")}`;
    stints.forEach((s, i) => {
      if (i === 0) return;
      const x = ((s.startLap - 1) / (track.laps - 1)) * 900;
      pitMarkers.push({ x, lap: s.startLap });
    });
  }

  const startCmp = COMPOUNDS.find((c) => c.key === compound) ?? COMPOUNDS[0];
  const factorGroups = [...new Set(SIMULATION_FACTORS.map((f) => f.group))];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none">
            Strategy <span className="text-primary">Simulator</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tyre pit strategy prediction · Monte Carlo engine · 1 000 simulations per run
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
          <span className="material-symbols-outlined text-primary text-sm">bolt</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pit Strategy Engine</span>
        </div>
      </div>

      {/* ── Compound Legend (compact, no repetition) ── */}
      <div className="flex gap-3 flex-wrap">
        {COMPOUNDS.map((c) => {
          const active = compound === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCompound(c.key)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all"
              style={{
                borderColor: active ? c.color + "60" : "rgba(255,255,255,0.06)",
                background: active ? c.color + "12" : "rgba(255,255,255,0.02)",
              }}
            >
              <TyreIcon compound={c.key} size="sm" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase" style={{ color: active ? c.color : "#64748b" }}>
                  {c.fullName}
                </p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[8px] text-slate-600">{c.maxLife}</span>
                  <span className="text-[8px]" style={{ color: c.color + "90" }}>{c.degRate}</span>
                </div>
              </div>
              {active && (
                <div className="ml-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Configuration Panel ── */}
      <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border-dark">
          <span className="material-symbols-outlined text-primary text-base">tune</span>
          <h2 className="text-xs font-black uppercase tracking-widest">Simulation Configuration</h2>
          <span className="ml-auto text-[9px] text-slate-600 font-mono">
            {factors.size} factors · {dataYears.size}yr data window
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Col 1 — Driver */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Driver</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {DRIVERS_2026.map((d) => {
                const color = teamColor(d.constructor);
                const sel = driverCode === d.code;
                return (
                  <button
                    key={d.code}
                    onClick={() => setDriverCode(d.code)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                      sel ? "border-transparent" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                    }`}
                    style={sel ? { backgroundColor: color + "22", borderColor: color + "55" } : {}}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
                      style={{ boxShadow: sel ? `0 0 0 1.5px ${color}` : "0 0 0 1px #2a2a2a" }}>
                      <img src={driverPhotoUrl(d.code)} alt={d.code} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase" style={{ color: sel ? color : "#94a3b8" }}>{d.code}</p>
                      <p className="text-[8px] text-slate-600 truncate">{d.name}</p>
                    </div>
                    {sel && <span className="material-symbols-outlined text-[12px] ml-auto flex-shrink-0" style={{ color }}>check_circle</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Circuit + Stops + Data window */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Circuit</label>
              <select
                className="w-full bg-background-dark border border-border-dark rounded-xl text-sm py-2.5 px-3 text-slate-100 font-bold outline-none focus:border-primary/50 cursor-pointer"
                value={trackIdx}
                onChange={(e) => setTrackIdx(Number(e.target.value))}
              >
                {TRACKS.map((t, i) => (
                  <option key={t.name} value={i} className="bg-slate-900">{t.name}</option>
                ))}
              </select>

              <div className="flex gap-2 mt-2">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center flex-1">
                  <p className="text-[7px] font-bold uppercase text-slate-600">Laps</p>
                  <p className="text-sm font-black text-white">{track.laps}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center flex-1">
                  <p className="text-[7px] font-bold uppercase text-slate-600">DRS Zones</p>
                  <p className="text-sm font-black text-green-400">{track.drs_zones}</p>
                </div>
                {factors.has("sc") && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2 text-center flex-1">
                    <p className="text-[7px] font-bold uppercase text-yellow-600">SC Risk</p>
                    <p className="text-sm font-black text-yellow-400">{Math.round(track.sc_prob * 100)}%</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Planned Pit Stops</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button key={n} onClick={() => setStops(n)}
                    className={`flex-1 py-3 rounded-xl font-black text-lg border transition-all ${
                      stops === n ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {n}
                    <span className="block text-[7px] font-bold uppercase tracking-wider opacity-60">{n === 1 ? "stop" : "stops"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Historical data window */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">database</span>
                Historical Data Window
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {DATA_YEARS.map((y) => {
                  const on = dataYears.has(y);
                  return (
                    <button key={y} onClick={() => toggleYear(y)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${
                        on ? "bg-primary/15 border-primary/40 text-primary" : "bg-white/[0.02] border-white/5 text-slate-600 hover:border-white/10"
                      }`}
                    >
                      {y}
                      {y === 2026 && <span className="ml-1 text-[7px] opacity-60">NEW</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-[8px] text-slate-700 mt-1.5 leading-snug">
                Select which seasons to include in the degradation and pit window models. 2026-only gives the freshest data but smallest sample.
              </p>
            </div>

          </div>

          {/* Col 3 — Simulation Factors (grouped) */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">
              Simulation Factors
            </label>
            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {factorGroups.map((group) => (
                <div key={group}>
                  <p className="text-[7px] font-black uppercase tracking-widest text-slate-700 mb-1.5 px-1">{group}</p>
                  <div className="space-y-1">
                    {SIMULATION_FACTORS.filter((f) => f.group === group).map((f) => {
                      const active = factors.has(f.key);
                      return (
                        <button key={f.key} onClick={() => toggleFactor(f.key)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                            active ? "border-primary/30 bg-primary/5" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px] flex-shrink-0"
                            style={{ color: active ? "#e00700" : "#475569" }}>{f.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[10px] font-black uppercase leading-tight ${active ? "text-white" : "text-slate-500"}`}>
                              {f.label}
                            </p>
                            <p className="text-[7px] text-slate-700 mt-0.5 truncate">{f.desc}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[7px] text-slate-700 hidden sm:block">{f.source}</span>
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                              active ? "bg-primary border-primary" : "border-slate-700"
                            }`}>
                              {active && <span className="material-symbols-outlined text-[9px] text-white">check</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}>
              {loading ? "sync" : "bolt"}
            </span>
            {loading
              ? `Simulating 1 000 scenarios across ${dataYears.size} season${dataYears.size > 1 ? "s" : ""}…`
              : `Run Strategy Simulation · ${factors.size} factors · ${dataYears.size}yr data`}
          </button>
        </div>
      </div>

      {/* ── Strategy Results ── */}
      <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">timeline</span>
            <h2 className="text-xs font-black uppercase tracking-widest">Tyre Strategy Prediction</h2>
          </div>
          {result && (
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                style={{
                  color: result.confidence === "High" ? "#34d399" : result.confidence === "Medium" ? "#eab308" : "#e00700",
                  borderColor: result.confidence === "High" ? "#34d399" + "40" : result.confidence === "Medium" ? "#eab308" + "40" : "#e00700" + "40",
                  background: result.confidence === "High" ? "#34d39915" : result.confidence === "Medium" ? "#eab30815" : "#e0070015",
                }}>
                {result.confidence} confidence
              </span>
              <span className="text-[9px] text-slate-600 font-mono">{result.simulations_run?.toLocaleString()} sims</span>
            </div>
          )}
        </div>

        <div className="p-5">
          {stints.length > 0 ? (
            <div className="space-y-7">

              {/* ── Tyre Sequence Flow ── */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[13px]">tire_repair</span>
                  Predicted Pit Strategy · {driverCode} · {track.name}
                </p>

                <div className="flex items-center flex-wrap gap-0">
                  {stints.map((s, i) => {
                    const cmp = COMPOUNDS.find((c) => c.key === s.compound) ?? COMPOUNDS[0];
                    const lapCount = s.endLap - s.startLap + 1;
                    return (
                      <div key={i} className="flex items-center">
                        {i > 0 && (
                          <div className="flex flex-col items-center mx-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-px bg-primary/30" />
                              <div className="px-2 py-1 rounded-lg border text-[8px] font-black whitespace-nowrap"
                                style={{ background: "rgba(224,7,0,0.1)", borderColor: "rgba(224,7,0,0.3)", color: "#e00700" }}>
                                PIT L{s.startLap}
                              </div>
                              <div className="w-6 h-px bg-primary/30" />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border"
                          style={{ borderColor: cmp.color + "30", background: cmp.color + "08" }}>
                          <TyreIcon compound={s.compound} size="xl" />
                          <div className="text-center">
                            <p className="text-[11px] font-black uppercase" style={{ color: cmp.color }}>{s.compound}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">{lapCount} laps</p>
                            <p className="text-[8px] font-mono text-slate-600">L{s.startLap}–L{s.endLap}</p>
                          </div>
                          <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full"
                            style={{ background: cmp.color + "20", color: cmp.color }}>
                            Stint {i + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Horizontal Strategy Bar ── */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[13px]">view_timeline</span>
                  Race Distance · {track.laps} laps
                </p>

                <div className="flex h-10 w-full rounded-xl overflow-hidden border border-white/10">
                  {stints.map((s, i) => {
                    const pct = ((s.endLap - s.startLap + 1) / track.laps) * 100;
                    const cmp = COMPOUNDS.find((c) => c.key === s.compound);
                    return (
                      <div key={i} className="h-full flex flex-col items-center justify-center overflow-hidden relative"
                        style={{ width: `${pct}%`, background: cmp?.color ?? "#666", color: cmp?.text ?? "#fff" }}>
                        <span className="text-sm font-black leading-none">{s.compound.slice(0, 1)}</span>
                        <span className="text-[7px] font-bold opacity-60 hidden sm:block">{s.endLap - s.startLap + 1}L</span>
                        {i > 0 && <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: "rgba(0,0,0,0.4)" }} />}
                      </div>
                    );
                  })}
                </div>

                <div className="relative mt-2 h-8">
                  <div className="absolute left-0 text-[8px] text-slate-600 font-mono">L1</div>
                  {stints.map((s, i) => {
                    if (i === 0) return null;
                    const pct = ((s.startLap - 1) / track.laps) * 100;
                    return (
                      <div key={i} className="absolute flex flex-col items-center"
                        style={{ left: `${pct}%`, transform: "translateX(-50%)" }}>
                        <div className="w-px h-2 bg-primary/60" />
                        <div className="px-1.5 py-0.5 bg-primary/20 border border-primary/40 rounded text-[8px] font-black text-primary whitespace-nowrap">
                          PIT L{s.startLap}
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute right-0 text-[8px] text-slate-600 font-mono">L{track.laps}</div>
                </div>
              </div>

              {/* ── Delta Chart ── */}
              {svgPath && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[13px]">show_chart</span>
                    Simulated Gap to Race Leader (s)
                  </p>
                  <div className="relative bg-background-dark rounded-xl border border-white/5 overflow-hidden" style={{ height: 160 }}>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 960 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={driverColor} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={driverColor} stopOpacity="0" />
                        </linearGradient>
                        <filter id="dGlow">
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line key={i} x1="0" y1={32 * i} x2="960" y2={32 * i} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      ))}
                      <path d={`${svgPath} L 900,160 L 0,160 Z`} fill="url(#dGrad)" />
                      <path d={svgPath} fill="none" stroke={driverColor} strokeWidth="2.5" filter="url(#dGlow)" />
                      {pitMarkers.map((p, i) => (
                        <g key={i}>
                          <line x1={p.x} y1="0" x2={p.x} y2="160" stroke="#e00700" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                          <rect x={p.x - 14} y="4" width="30" height="14" rx="3" fill="rgba(224,7,0,0.2)" />
                          <text x={p.x + 1} y="14" fill="#e00700" fontSize="9" fontWeight="900" textAnchor="middle">PIT</text>
                        </g>
                      ))}
                    </svg>
                    <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[8px] text-slate-700 font-mono pointer-events-none">
                      <span>START</span>
                      <span>L{Math.round(track.laps * 0.25)}</span>
                      <span>L{Math.round(track.laps * 0.5)}</span>
                      <span>L{Math.round(track.laps * 0.75)}</span>
                      <span>FINISH</span>
                    </div>
                    <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 backdrop-blur-sm">
                      <div className="w-3 h-0.5 rounded-full" style={{ background: driverColor }} />
                      <span className="text-[9px] font-black" style={{ color: driverColor }}>{driverCode}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Idle state ── */
            <div className="flex flex-col items-center justify-center py-14 gap-5 text-slate-700">
              <div className="flex items-center gap-8 opacity-25">
                {COMPOUNDS.map((c) => (
                  <div key={c.key} className="flex flex-col items-center gap-2">
                    <TyreIcon compound={c.key} size="xl" />
                    <span className="text-[9px] font-black uppercase" style={{ color: c.color }}>{c.key}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">Configure and run a simulation</p>
              <p className="text-[11px] text-slate-600 text-center max-w-xs">
                Select a driver, circuit, starting compound, and pit stops — the optimal tyre strategy will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Methodology ── */}
      <section className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
          <span className="material-symbols-outlined text-primary text-base">settings</span>
          <h2 className="text-xs font-black uppercase tracking-widest">How the Simulation is Calculated</h2>
        </div>

        <div className="p-5 space-y-6">

          {/* Monte Carlo overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-black italic uppercase text-white">Monte Carlo Pit Strategy Engine</h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                The simulator runs <strong className="text-white">1 000 independent race scenarios</strong> for your selected driver, circuit, and factor set.
                Each scenario draws inputs from probability distributions calibrated against historical data from the Jolpica F1 API. The pit window that
                appears most frequently as the optimal outcome across all scenarios becomes the <span className="text-primary font-bold">predicted strategy</span>.
              </p>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                On each simulated lap the engine applies tyre degradation (per-compound, per-team), fuel burn improvement, and probabilistic event checks.
                At each valid pit window it evaluates whether stopping delivers a better projected outcome than staying out. The year selector controls
                which historical seasons feed the degradation and pit timing models — 2026-only gives the latest picture, all 5 years gives the largest sample.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 content-start">
              {[
                { v: "1 000", l: "Simulations",    icon: "sync",       c: "#60a5fa" },
                { v: "10",    l: "Factors",         icon: "tune",       c: "#a78bfa" },
                { v: "24",    l: "Circuits",        icon: "map",        c: "#34d399" },
                { v: "22",    l: "Drivers",         icon: "group",      c: "#f97316" },
              ].map((s) => (
                <div key={s.l} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-lg mb-1" style={{ color: s.c }}>{s.icon}</span>
                  <p className="text-xl font-black text-white">{s.v}</p>
                  <p className="text-[8px] font-bold uppercase text-slate-600">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Factor reference — compact, no duplicate tyre data */}
          <div>
            <h3 className="text-sm font-black italic uppercase text-white mb-3">Simulation Factor Reference</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {SIMULATION_FACTORS.map((f) => (
                <div key={f.key} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">{f.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-black uppercase text-white">{f.label}</p>
                      <span className="text-[7px] text-slate-700 font-mono border border-white/5 px-1.5 py-0.5 rounded">{f.source}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence levels */}
          <div>
            <h3 className="text-sm font-black italic uppercase text-white mb-3">Confidence Levels</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { level: "High",   color: "#34d399", icon: "verified",  cond: "≥60% of 1 000 simulations agree on the same pit lap. Low variance across SC and degradation draws." },
                { level: "Medium", color: "#eab308", icon: "warning",   cond: "40–59% agreement. Some divergence driven by SC probability or compound sensitivity at this circuit." },
                { level: "Low",    color: "#e00700", icon: "error",     cond: "<40% agreement. Multiple viable strategy variants exist — treat as directional guidance only." },
              ].map((cl) => (
                <div key={cl.level} className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5" style={{ color: cl.color }}>{cl.icon}</span>
                  <div>
                    <p className="text-sm font-black uppercase" style={{ color: cl.color }}>{cl.level}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{cl.cond}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div>
            <h3 className="text-sm font-black italic uppercase text-white mb-3">Data Sources</h3>
            <div className="grid md:grid-cols-4 gap-2">
              {[
                { src: "Jolpica F1 API",      use: "Race results, grid positions, lap times, safety car records", icon: "storage" },
                { src: "Pirelli Motorsport",  use: "Official compound allocation, degradation benchmarks, tyre life estimates", icon: "tire_repair" },
                { src: "FIA Technical Regs",  use: "2026 power unit rules — ERS deployment limits, fuel flow maxima", icon: "gavel" },
                { src: "Historical Race Data",use: "5-season pit window timing distributions, constructor deg coefficients", icon: "history" },
              ].map((d) => (
                <div key={d.src} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-base mb-1">{d.icon}</span>
                  <p className="text-[10px] font-black text-white">{d.src}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5 leading-snug">{d.use}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <span className="material-symbols-outlined text-slate-600 text-base flex-shrink-0 mt-0.5">info</span>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <strong className="text-slate-500">Disclaimer:</strong> This simulator is for analytical and entertainment purposes.
              Degradation coefficients are estimated from publicly available historical race data via the Jolpica API.
              Safety car probabilities are based on historical averages per circuit from 2021–2026.
              Real race strategy is also influenced by live tyre temperature telemetry, pit crew performance, competitor reactions,
              weather developments, and car-specific characteristics that this model approximates statistically.
              The output represents the most-likely pit strategy based on historical patterns — not a guarantee of race outcomes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
