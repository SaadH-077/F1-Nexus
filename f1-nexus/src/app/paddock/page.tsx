"use client";
import { useState, useEffect } from "react";
import { getSchedule, type ScheduleRace } from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";

// ─── Flag helper — SVG for crisp display at any size ──────────────────────────

function circuitFlagUrl(raceName: string): string {
  const n = raceName.toLowerCase();
  if (n.includes("australia"))                                      return "https://flagcdn.com/au.svg";
  if (n.includes("bahrain"))                                        return "https://flagcdn.com/bh.svg";
  if (n.includes("saudi"))                                          return "https://flagcdn.com/sa.svg";
  if (n.includes("japan") || n.includes("japanese"))                return "https://flagcdn.com/jp.svg";
  if (n.includes("chin"))                                           return "https://flagcdn.com/cn.svg";
  if (n.includes("miami"))                                          return "https://flagcdn.com/us.svg";
  if (n.includes("emilia") || n.includes("imola"))                  return "https://flagcdn.com/it.svg";
  if (n.includes("monaco"))                                         return "https://flagcdn.com/mc.svg";
  if (n.includes("canad"))                                          return "https://flagcdn.com/ca.svg";
  if (n.includes("spain") || n.includes("spanish") || n.includes("barcelona")) return "https://flagcdn.com/es.svg";
  if (n.includes("austria") || n.includes("austrian"))              return "https://flagcdn.com/at.svg";
  if (n.includes("great britain") || n.includes("british"))         return "https://flagcdn.com/gb.svg";
  if (n.includes("hungar"))                                         return "https://flagcdn.com/hu.svg";
  if (n.includes("belgi"))                                          return "https://flagcdn.com/be.svg";
  if (n.includes("dutch") || n.includes("netherland"))              return "https://flagcdn.com/nl.svg";
  if (n.includes("ital") || n.includes("monza"))                    return "https://flagcdn.com/it.svg";
  if (n.includes("azerbaijan"))                                     return "https://flagcdn.com/az.svg";
  if (n.includes("singapore"))                                      return "https://flagcdn.com/sg.svg";
  if (n.includes("united states") || n.includes("cota"))            return "https://flagcdn.com/us.svg";
  if (n.includes("mexico"))                                         return "https://flagcdn.com/mx.svg";
  if (n.includes("brazil") || n.includes("são paulo"))              return "https://flagcdn.com/br.svg";
  if (n.includes("las vegas"))                                      return "https://flagcdn.com/us.svg";
  if (n.includes("qatar"))                                          return "https://flagcdn.com/qa.svg";
  if (n.includes("abu dhabi"))                                      return "https://flagcdn.com/ae.svg";
  return "https://flagcdn.com/un.svg";
}

// ─── 2026 Driver Grid — career stats entering 2026 season ─────────────────────

const DRIVERS_2026 = [
  // Mercedes
  { code: "RUS", name: "George Russell",    team: "Mercedes",     teamId: "mercedes",     nat: "🇬🇧", natCode: "gb", ch: 0, wins:  5, poles: 11, podiums:  31 },
  { code: "ANT", name: "Kimi Antonelli",    team: "Mercedes",     teamId: "mercedes",     nat: "🇮🇹", natCode: "it", ch: 0, wins:  0, poles:  1, podiums:   3 },
  // Ferrari
  { code: "LEC", name: "Charles Leclerc",   team: "Ferrari",      teamId: "ferrari",      nat: "🇲🇨", natCode: "mc", ch: 0, wins: 14, poles: 32, podiums:  58 },
  { code: "HAM", name: "Lewis Hamilton",    team: "Ferrari",      teamId: "ferrari",      nat: "🇬🇧", natCode: "gb", ch: 7, wins:105, poles:104, podiums: 200 },
  // McLaren
  { code: "NOR", name: "Lando Norris",      team: "McLaren",      teamId: "mclaren",      nat: "🇬🇧", natCode: "gb", ch: 1, wins: 10, poles: 15, podiums:  43 },
  { code: "PIA", name: "Oscar Piastri",     team: "McLaren",      teamId: "mclaren",      nat: "🇦🇺", natCode: "au", ch: 1, wins:  8, poles:  5, podiums:  22 },
  // Red Bull
  { code: "VER", name: "Max Verstappen",    team: "Red Bull",     teamId: "red_bull",     nat: "🇳🇱", natCode: "nl", ch: 4, wins: 64, poles: 41, podiums: 115 },
  { code: "HAD", name: "Isack Hadjar",      team: "Red Bull",     teamId: "red_bull",     nat: "🇫🇷", natCode: "fr", ch: 0, wins:  0, poles:  0, podiums:   0 },
  // Aston Martin
  { code: "ALO", name: "Fernando Alonso",   team: "Aston Martin", teamId: "aston_martin", nat: "🇪🇸", natCode: "es", ch: 2, wins: 33, poles: 23, podiums: 108 },
  { code: "STR", name: "Lance Stroll",      team: "Aston Martin", teamId: "aston_martin", nat: "🇨🇦", natCode: "ca", ch: 0, wins:  0, poles:  1, podiums:   4 },
  // Alpine
  { code: "GAS", name: "Pierre Gasly",      team: "Alpine",       teamId: "alpine",       nat: "🇫🇷", natCode: "fr", ch: 0, wins:  1, poles:  0, podiums:   5 },
  { code: "COL", name: "Franco Colapinto",  team: "Alpine",       teamId: "alpine",       nat: "🇦🇷", natCode: "ar", ch: 0, wins:  0, poles:  0, podiums:   1 },
  // Williams
  { code: "ALB", name: "Alexander Albon",   team: "Williams",     teamId: "williams",     nat: "🇹🇭", natCode: "th", ch: 0, wins:  0, poles:  0, podiums:   1 },
  { code: "SAI", name: "Carlos Sainz",      team: "Williams",     teamId: "williams",     nat: "🇪🇸", natCode: "es", ch: 0, wins:  5, poles:  7, podiums:  26 },
  // RB / Racing Bulls
  { code: "LAW", name: "Liam Lawson",       team: "RB",           teamId: "rb",           nat: "🇳🇿", natCode: "nz", ch: 0, wins:  0, poles:  0, podiums:   2 },
  { code: "LIN", name: "Arvid Lindblad",    team: "RB",           teamId: "rb",           nat: "🇬🇧", natCode: "gb", ch: 0, wins:  0, poles:  0, podiums:   0 },
  // Haas
  { code: "OCO", name: "Esteban Ocon",      team: "Haas",         teamId: "haas",         nat: "🇫🇷", natCode: "fr", ch: 0, wins:  1, poles:  0, podiums:   4 },
  { code: "BEA", name: "Oliver Bearman",    team: "Haas",         teamId: "haas",         nat: "🇬🇧", natCode: "gb", ch: 0, wins:  0, poles:  0, podiums:   0 },
  // Audi (formerly Sauber)
  { code: "HUL", name: "Nico Hülkenberg",  team: "Audi",         teamId: "sauber",       nat: "🇩🇪", natCode: "de", ch: 0, wins:  0, poles:  1, podiums:   1 },
  { code: "BOR", name: "Gabriel Bortoleto", team: "Audi",         teamId: "sauber",       nat: "🇧🇷", natCode: "br", ch: 0, wins:  0, poles:  0, podiums:   0 },
  // Cadillac (new constructor 2026)
  { code: "BOT", name: "Valtteri Bottas",   team: "Cadillac",     teamId: "cadillac",     nat: "🇫🇮", natCode: "fi", ch: 0, wins: 10, poles: 20, podiums:  67 },
  { code: "PER", name: "Sergio Pérez",      team: "Cadillac",     teamId: "cadillac",     nat: "🇲🇽", natCode: "mx", ch: 0, wins:  7, poles:  4, podiums:  40 },
];

// ─── 2026 Teams — 11 constructors ─────────────────────────────────────────────

const TEAMS_2026 = [
  { id: "mercedes",     name: "Mercedes-AMG",     color: "#27F4D2", logo: "/logos/mercedes.webp",    base: "Brackley, UK",        principal: "Toto Wolff",       engine: "Mercedes",  ch: 9,  wins: 125, founded: 1954 },
  { id: "ferrari",      name: "Scuderia Ferrari",  color: "#E80020", logo: "/logos/ferrari.webp",     base: "Maranello, Italy",    principal: "Frédéric Vasseur", engine: "Ferrari",   ch: 16, wins: 243, founded: 1950 },
  { id: "mclaren",      name: "McLaren",           color: "#FF8000", logo: "/logos/mclaren.webp",     base: "Woking, UK",          principal: "Andrea Stella",    engine: "Mercedes",  ch: 8,  wins: 183, founded: 1963 },
  { id: "red_bull",     name: "Red Bull Racing",   color: "#3671C6", logo: "/logos/redbull.webp",     base: "Milton Keynes, UK",   principal: "Christian Horner", engine: "RBPT",      ch: 6,  wins:  95, founded: 2005 },
  { id: "aston_martin", name: "Aston Martin",      color: "#229971", logo: "/logos/astonmartin.webp", base: "Silverstone, UK",     principal: "Mike Krack",       engine: "Honda",     ch: 0,  wins:   0, founded: 2021 },
  { id: "alpine",       name: "Alpine F1 Team",    color: "#0093CC", logo: "/logos/alpine.webp",      base: "Enstone, UK",         principal: "Oliver Oakes",     engine: "Renault",   ch: 2,  wins:  35, founded: 1977 },
  { id: "williams",     name: "Williams Racing",   color: "#64C4FF", logo: "/logos/williams.webp",    base: "Grove, UK",           principal: "James Vowles",     engine: "Mercedes",  ch: 7,  wins: 114, founded: 1977 },
  { id: "rb",           name: "Racing Bulls",      color: "#6692FF", logo: "/logos/rb.webp",          base: "Faenza, Italy",       principal: "Laurent Mekies",   engine: "Honda",     ch: 0,  wins:   2, founded: 2006 },
  { id: "haas",         name: "Haas F1 Team",      color: "#B6BABD", logo: "/logos/haas.webp",        base: "Kannapolis, USA",     principal: "Ayao Komatsu",     engine: "Ferrari",   ch: 0,  wins:   0, founded: 2016 },
  { id: "sauber",       name: "Audi F1 Team",      color: "#F60000", logo: "/logos/sauber.webp",      base: "Hinwil, Switzerland", principal: "Mattia Binotto",   engine: "Audi",      ch: 0,  wins:   1, founded: 1993 },
  { id: "cadillac",     name: "Cadillac F1",       color: "#FFB000", logo: "/logos/cadillac.webp",    base: "Concord, USA",        principal: "Graeme Lowdon",    engine: "Ferrari",   ch: 0,  wins:   0, founded: 2026 },
];

// ─── Resource Cards ────────────────────────────────────────────────────────────

const RESOURCE_PINS = [
  { title: "2026 Technical Regulations", subtitle: "FIA Official Documents",  desc: "Complete 2026 F1 Technical Regulations — active aerodynamics, new power units, 50/50 hybrid split, DRS abolition.", icon: "description", color: "#e00700", tag: "Official FIA", url: "https://www.fia.com/regulation/category/110" },
  { title: "F1 Academy",                 subtitle: "Junior Driver Programme",  desc: "The official F1 Academy — developing the next generation of racing talent from karting to single-seaters.", icon: "school", color: "#f97316", tag: "Formula 1", url: "https://www.f1academy.com" },
  { title: "Drive to Survive — Netflix",  subtitle: "Formula 1 Documentary",    desc: "The Emmy-nominated Netflix docuseries — go behind the scenes of F1 with unprecedented access to drivers, teams, and rivalries.", icon: "live_tv", color: "#E50914", tag: "Netflix", url: "https://www.netflix.com/title/80204890" },
  { title: "Pirelli F1 Tyre Guide",      subtitle: "2026 Compound Data",       desc: "Official Pirelli motorsport data — compound allocations, degradation profiles, and race-weekend briefings.", icon: "circle", color: "#fbbf24", tag: "Technical", url: "https://www.pirelli.com/tyres/en-ww/motorsport/f1" },
  { title: "FastF1 — Open Source API",   subtitle: "Telemetry & Timing",       desc: "FastF1 Python library — retrieve official F1 timing data, telemetry, lap times, weather, and tyre data.", icon: "code", color: "#a78bfa", tag: "Developer", url: "https://docs.fastf1.dev" },
  { title: "Jolpica / Ergast F1 API",    subtitle: "Historical Race Data",     desc: "Free REST API for historical Formula One data — standings, results, schedules back to 1950.", icon: "api", color: "#60a5fa", tag: "Developer", url: "https://jolpi.ca/ergast" },
];

// ─── Team color helper ─────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27F4D2", ferrari: "#E80020", mclaren: "#FF8000", red_bull: "#3671C6",
  aston_martin: "#229971", alpine: "#0093CC", williams: "#64C4FF",
  rb: "#6692FF", haas: "#B6BABD", sauber: "#F60000", cadillac: "#FFB000",
};
function teamColor(id: string): string {
  return TEAM_COLORS[id.toLowerCase().replace(/-/g, "_")] ?? "#6b7280";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaddockPage() {
  const [schedule, setSchedule] = useState<ScheduleRace[]>([]);
  const [activeDriver, setActiveDriver] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const today = new Date();

  useEffect(() => {
    getSchedule().then(setSchedule).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-24">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden mb-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(224,7,0,0.08) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
        <div className="px-4 pt-8 pb-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2">Formula One · Season Overview</p>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-none mb-4">
            The <span className="text-primary">Paddock</span>
          </h1>
          {/* Season stats bar */}
          <div className="flex flex-wrap gap-6 mt-4">
            {([
              { label: "Rounds",       value: schedule.length > 0 ? schedule.length : 24, icon: "flag" },
              { label: "Drivers",      value: 22,  icon: "person" },
              { label: "Constructors", value: 11,  icon: "directions_car" },
            ] as const).map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div>
                  <AnimatedCounter value={s.value} className="text-xl font-black text-white" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1.5">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-14">

        {/* ── 2026 Race Calendar ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
              <span className="w-1 h-6 bg-primary block rounded-full" />
              2026 Race Calendar
            </h2>
            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
              {schedule.length > 0 ? `${schedule.length} rounds` : "Loading…"}
            </span>
          </div>

          {schedule.length > 0 ? (
            <div className="rounded-2xl border border-white/6 overflow-hidden" style={{ background: "rgba(255,255,255,0.01)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-white/5 md:divide-y-0">
                {/* Left column: rounds 1–12 */}
                <div className="divide-y divide-white/5 md:border-r md:border-white/5">
                  {schedule.slice(0, Math.ceil(schedule.length / 2)).map((r) => {
                    const raceDate = new Date(r.date);
                    const fp1Date = new Date(raceDate); fp1Date.setDate(fp1Date.getDate() - 2);
                    const isPast = raceDate < today;
                    const nextRound = schedule.find((s) => new Date(s.date) > today);
                    const isNext = nextRound?.round === r.round;
                    const flagUrl = circuitFlagUrl(r.raceName);
                    const month = raceDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
                    const d1 = fp1Date.getDate().toString().padStart(2, "0");
                    const d2 = raceDate.getDate().toString().padStart(2, "0");
                    const country = r.raceName.replace(" Grand Prix", "").replace(" GP", "").toUpperCase();
                    return (
                      <div key={r.round}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isNext ? "bg-primary/5" : isPast ? "opacity-35" : "hover:bg-white/3"}`}>
                        <img src={flagUrl} alt={country} className="w-9 h-6 object-cover rounded-sm flex-shrink-0" style={{ filter: isPast ? "saturate(0.3)" : "none" }} />
                        <div className="flex-shrink-0 w-11 text-right">
                          <p className="text-[7px] font-bold text-slate-600 uppercase leading-none">{month}</p>
                          <p className={`text-sm font-black leading-tight ${isNext ? "text-primary" : "text-primary/70"}`}>{d1}–{d2}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wide leading-none mb-0.5">
                            Round {r.round}&nbsp;·&nbsp;{r.circuit}
                          </p>
                          <p className="text-sm font-black text-white uppercase tracking-wide leading-tight truncate">{country}</p>
                        </div>
                        {isNext && <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-white flex-shrink-0">NEXT</span>}
                      </div>
                    );
                  })}
                </div>
                {/* Right column: remaining rounds */}
                <div className="divide-y divide-white/5">
                  {schedule.slice(Math.ceil(schedule.length / 2)).map((r) => {
                    const raceDate = new Date(r.date);
                    const fp1Date = new Date(raceDate); fp1Date.setDate(fp1Date.getDate() - 2);
                    const isPast = raceDate < today;
                    const nextRound = schedule.find((s) => new Date(s.date) > today);
                    const isNext = nextRound?.round === r.round;
                    const flagUrl = circuitFlagUrl(r.raceName);
                    const month = raceDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
                    const d1 = fp1Date.getDate().toString().padStart(2, "0");
                    const d2 = raceDate.getDate().toString().padStart(2, "0");
                    const country = r.raceName.replace(" Grand Prix", "").replace(" GP", "").toUpperCase();
                    return (
                      <div key={r.round}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isNext ? "bg-primary/5" : isPast ? "opacity-35" : "hover:bg-white/3"}`}>
                        <img src={flagUrl} alt={country} className="w-9 h-6 object-cover rounded-sm flex-shrink-0" style={{ filter: isPast ? "saturate(0.3)" : "none" }} />
                        <div className="flex-shrink-0 w-11 text-right">
                          <p className="text-[7px] font-bold text-slate-600 uppercase leading-none">{month}</p>
                          <p className={`text-sm font-black leading-tight ${isNext ? "text-primary" : "text-primary/70"}`}>{d1}–{d2}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wide leading-none mb-0.5">
                            Round {r.round}&nbsp;·&nbsp;{r.circuit}
                          </p>
                          <p className="text-sm font-black text-white uppercase tracking-wide leading-tight truncate">{country}</p>
                        </div>
                        {isNext && <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-white flex-shrink-0">NEXT</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border-dark overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 border-b border-border-dark bg-card-dark animate-pulse" />
              ))}
            </div>
          )}
        </section>

        {/* ── 2026 Driver Grid — grouped by team ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
              <span className="w-1 h-6 bg-primary block rounded-full" />
              2026 Driver Grid
            </h2>
            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
              22 drivers · 11 teams
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-1.5">
            {DRIVERS_2026.map((d) => {
              const t = TEAMS_2026.find((t) => t.id === d.teamId)!;
              const tc = teamColor(d.teamId);
              const isActive = activeDriver === d.code;
              const lastName = d.name.split(" ").pop()!;
              return (
                <button
                  key={d.code}
                  onClick={() => setActiveDriver(isActive ? null : d.code)}
                  className="relative overflow-hidden rounded-xl border transition-all duration-200 w-full"
                  style={{
                    aspectRatio: "3/4",
                    borderColor: isActive ? tc : "rgba(255,255,255,0.09)",
                    background: "#0e0e0e",
                    boxShadow: isActive ? `0 0 18px ${tc}40` : undefined,
                  }}
                >
                  {/* Country flag – top right */}
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <img
                      src={`https://flagcdn.com/${d.natCode}.svg`}
                      alt={d.natCode.toUpperCase()}
                      className="w-5 h-3.5 rounded-sm object-cover opacity-90"
                    />
                  </div>

                  {/* Driver photo */}
                  <img
                    src={`/drivers/${d.code}.webp`}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />

                  {/* Stats overlay on click */}
                  {isActive && (
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center gap-1 p-1"
                      style={{ background: "rgba(0,0,0,0.88)" }}>
                      <p className="text-[9px] font-black italic leading-none mb-1" style={{ color: tc }}>{d.code}</p>
                      {[
                        { l: "Titles", v: d.ch },
                        { l: "Wins",   v: d.wins },
                        { l: "Poles",  v: d.poles },
                        { l: "Pods",   v: d.podiums },
                      ].map((s) => (
                        <div key={s.l} className="flex justify-between w-full px-1.5">
                          <span className="text-[6px] text-slate-500 uppercase">{s.l}</span>
                          <span className="text-[8px] font-black" style={{ color: tc }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom: code + name */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-1.5"
                    style={{ background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)` }}
                  >
                    <p className="text-[10px] font-black italic leading-none" style={{ color: tc }}>{d.code}</p>
                    <p className="text-[7px] font-black text-white uppercase leading-tight truncate">{lastName}</p>
                    <p className="text-[6px] text-slate-500 leading-tight truncate mt-0.5">{t?.name ?? d.team}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 2026 Constructor Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
              <span className="w-1 h-6 bg-primary block rounded-full" />
              2026 Constructor Grid
            </h2>
            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
              11 teams · Click for profile
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {TEAMS_2026.map((t) => {
              const isActive = activeTeam === t.id;
              return (
                <div key={t.id} className="flex flex-col">
                  <button
                    onClick={() => setActiveTeam(isActive ? null : t.id)}
                    className="w-full text-left rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col"
                    style={{
                      borderColor: isActive ? t.color : "rgba(255,255,255,0.07)",
                      boxShadow: isActive ? `0 0 20px ${t.color}20` : undefined,
                    }}>
                    {/* Color header */}
                    <div className="h-1.5 w-full" style={{ background: t.color }} />
                    {/* Logo area */}
                    <div className="flex items-center justify-center px-4 pt-4 pb-3"
                      style={{ background: isActive ? `${t.color}10` : "rgba(255,255,255,0.01)" }}>
                      <img src={t.logo} alt={t.name}
                        className="h-9 w-auto object-contain"
                        style={{ maxWidth: 72 }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    {/* Info */}
                    <div className="px-3 pb-3"
                      style={{ background: isActive ? `${t.color}06` : "rgba(255,255,255,0.01)" }}>
                      <p className="text-[9px] font-black text-white leading-tight">{t.name}</p>
                      <p className="text-[7px] font-bold mt-0.5" style={{ color: t.color }}>
                        {t.ch > 0 ? `${t.ch}× WCC` : `Est. ${t.founded}`}
                      </p>
                    </div>
                  </button>

                  {/* Expanded profile */}
                  {isActive && (
                    <div className="rounded-2xl border mt-2 p-3 space-y-1.5"
                      style={{ borderColor: `${t.color}30`, background: `${t.color}06` }}>
                      <p className="text-[8px] font-black uppercase tracking-wider mb-2" style={{ color: t.color }}>{t.name}</p>
                      {[
                        { l: "Base",      v: t.base.split(",")[0] },
                        { l: "Principal", v: t.principal },
                        { l: "Engine",    v: t.engine },
                        { l: "WCC Titles",v: String(t.ch) },
                        { l: "Race Wins", v: String(t.wins) },
                        { l: "Founded",   v: String(t.founded) },
                      ].map((s) => (
                        <div key={s.l} className="flex justify-between gap-2 items-start">
                          <span className="text-[7px] text-slate-600 flex-shrink-0">{s.l}</span>
                          <span className="text-[7px] font-black text-right" style={{ color: t.color }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── F1 Resources ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
              <span className="w-1 h-6 bg-primary block rounded-full" />
              F1 Resources
            </h2>
            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
              Regulations · Data · Tools
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESOURCE_PINS.map((res) => (
              <a key={res.title}
                href={res.url} target="_blank" rel="noopener noreferrer"
                className="group bg-card-dark border border-border-dark rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 flex flex-col">
                <div className="h-1.5 w-full" style={{ background: res.color }} />
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${res.color}18`, border: `1px solid ${res.color}30` }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: res.color, fontVariationSettings: "'FILL' 1" }}>{res.icon}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${res.color}15`, color: res.color, border: `1px solid ${res.color}30` }}>
                      {res.tag}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-white group-hover:text-primary transition-colors leading-tight">{res.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{res.subtitle}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2">{res.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border-dark">
                    <span className="text-[9px] text-slate-600 font-mono truncate mr-2">{res.url.replace(/^https?:\/\//, "")}</span>
                    <div className="flex items-center gap-1 text-[9px] font-black flex-shrink-0" style={{ color: res.color }}>
                      Open <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
