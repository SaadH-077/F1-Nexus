"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getSchedule,
  getDriverStandings,
  getConstructorStandings,
  type ScheduleRace,
  type DriverStanding,
  type ConstructorStanding,
} from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";

// ─── Flag helper ───────────────────────────────────────────────────────────────

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

// ─── Driver career data ────────────────────────────────────────────────────────

interface CareerTeam {
  team: string;
  years: string;
}

interface Driver {
  code: string;
  name: string;
  team: string;
  teamId: string;
  nat: string;
  natCode: string;
  number: number;
  ch: number;
  wins: number;
  poles: number;
  podiums: number;
  fastLaps: number;
  debutYear: number;
  careerTeams: CareerTeam[];
}

const DRIVERS_2026: Driver[] = [
  // Mercedes
  {
    code: "RUS", name: "George Russell", team: "Mercedes", teamId: "mercedes",
    nat: "🇬🇧", natCode: "gb", number: 63,
    ch: 0, wins: 5, poles: 11, podiums: 31, fastLaps: 6, debutYear: 2019,
    careerTeams: [
      { team: "Williams", years: "2019–2021" },
      { team: "Mercedes-AMG", years: "2022–present" },
    ],
  },
  {
    code: "ANT", name: "Kimi Antonelli", team: "Mercedes", teamId: "mercedes",
    nat: "🇮🇹", natCode: "it", number: 12,
    ch: 0, wins: 1, poles: 1, podiums: 3, fastLaps: 1, debutYear: 2025,
    careerTeams: [
      { team: "Mercedes-AMG", years: "2025–present" },
    ],
  },
  // Ferrari
  {
    code: "LEC", name: "Charles Leclerc", team: "Ferrari", teamId: "ferrari",
    nat: "🇲🇨", natCode: "mc", number: 16,
    ch: 0, wins: 14, poles: 32, podiums: 58, fastLaps: 14, debutYear: 2018,
    careerTeams: [
      { team: "Sauber", years: "2018" },
      { team: "Scuderia Ferrari", years: "2019–present" },
    ],
  },
  {
    code: "HAM", name: "Lewis Hamilton", team: "Ferrari", teamId: "ferrari",
    nat: "🇬🇧", natCode: "gb", number: 44,
    ch: 7, wins: 105, poles: 104, podiums: 200, fastLaps: 67, debutYear: 2007,
    careerTeams: [
      { team: "McLaren", years: "2007–2012" },
      { team: "Mercedes-AMG", years: "2013–2024" },
      { team: "Scuderia Ferrari", years: "2025–present" },
    ],
  },
  // McLaren
  {
    code: "NOR", name: "Lando Norris", team: "McLaren", teamId: "mclaren",
    nat: "🇬🇧", natCode: "gb", number: 4,
    ch: 1, wins: 10, poles: 15, podiums: 43, fastLaps: 8, debutYear: 2019,
    careerTeams: [
      { team: "McLaren", years: "2019–present" },
    ],
  },
  {
    code: "PIA", name: "Oscar Piastri", team: "McLaren", teamId: "mclaren",
    nat: "🇦🇺", natCode: "au", number: 81,
    ch: 0, wins: 8, poles: 5, podiums: 22, fastLaps: 4, debutYear: 2023,
    careerTeams: [
      { team: "McLaren", years: "2023–present" },
    ],
  },
  // Red Bull
  {
    code: "VER", name: "Max Verstappen", team: "Red Bull", teamId: "red_bull",
    nat: "🇳🇱", natCode: "nl", number: 1,
    ch: 4, wins: 64, poles: 41, podiums: 115, fastLaps: 32, debutYear: 2015,
    careerTeams: [
      { team: "Toro Rosso", years: "2015" },
      { team: "Red Bull Racing", years: "2016–present" },
    ],
  },
  {
    code: "HAD", name: "Isack Hadjar", team: "Red Bull", teamId: "red_bull",
    nat: "🇫🇷", natCode: "fr", number: 22,
    ch: 0, wins: 0, poles: 0, podiums: 0, fastLaps: 0, debutYear: 2025,
    careerTeams: [
      { team: "Racing Bulls", years: "2025" },
      { team: "Red Bull Racing", years: "2026–present" },
    ],
  },
  // Aston Martin
  {
    code: "ALO", name: "Fernando Alonso", team: "Aston Martin", teamId: "aston_martin",
    nat: "🇪🇸", natCode: "es", number: 14,
    ch: 2, wins: 33, poles: 23, podiums: 108, fastLaps: 23, debutYear: 2001,
    careerTeams: [
      { team: "Minardi", years: "2001" },
      { team: "Renault", years: "2003–2006" },
      { team: "McLaren", years: "2007" },
      { team: "Renault", years: "2008–2009" },
      { team: "Scuderia Ferrari", years: "2010–2014" },
      { team: "McLaren", years: "2015–2017" },
      { team: "Alpine", years: "2021–2022" },
      { team: "Aston Martin", years: "2023–present" },
    ],
  },
  {
    code: "STR", name: "Lance Stroll", team: "Aston Martin", teamId: "aston_martin",
    nat: "🇨🇦", natCode: "ca", number: 18,
    ch: 0, wins: 0, poles: 1, podiums: 4, fastLaps: 2, debutYear: 2017,
    careerTeams: [
      { team: "Williams", years: "2017" },
      { team: "Force India / Racing Point", years: "2018–2020" },
      { team: "Aston Martin", years: "2021–present" },
    ],
  },
  // Alpine
  {
    code: "GAS", name: "Pierre Gasly", team: "Alpine", teamId: "alpine",
    nat: "🇫🇷", natCode: "fr", number: 10,
    ch: 0, wins: 1, poles: 0, podiums: 5, fastLaps: 2, debutYear: 2017,
    careerTeams: [
      { team: "Toro Rosso", years: "2017–2019" },
      { team: "Red Bull Racing", years: "2019" },
      { team: "AlphaTauri", years: "2019–2022" },
      { team: "Alpine", years: "2023–present" },
    ],
  },
  {
    code: "COL", name: "Franco Colapinto", team: "Alpine", teamId: "alpine",
    nat: "🇦🇷", natCode: "ar", number: 43,
    ch: 0, wins: 0, poles: 0, podiums: 1, fastLaps: 0, debutYear: 2024,
    careerTeams: [
      { team: "Williams", years: "2024" },
      { team: "Alpine", years: "2025–present" },
    ],
  },
  // Williams
  {
    code: "ALB", name: "Alexander Albon", team: "Williams", teamId: "williams",
    nat: "🇹🇭", natCode: "th", number: 23,
    ch: 0, wins: 0, poles: 0, podiums: 1, fastLaps: 1, debutYear: 2019,
    careerTeams: [
      { team: "Toro Rosso", years: "2019" },
      { team: "Red Bull Racing", years: "2019–2020" },
      { team: "Williams", years: "2022–present" },
    ],
  },
  {
    code: "SAI", name: "Carlos Sainz", team: "Williams", teamId: "williams",
    nat: "🇪🇸", natCode: "es", number: 55,
    ch: 0, wins: 5, poles: 7, podiums: 26, fastLaps: 8, debutYear: 2015,
    careerTeams: [
      { team: "Toro Rosso", years: "2015–2017" },
      { team: "Renault", years: "2018" },
      { team: "McLaren", years: "2019–2020" },
      { team: "Scuderia Ferrari", years: "2021–2024" },
      { team: "Williams", years: "2025–present" },
    ],
  },
  // RB / Racing Bulls
  {
    code: "LAW", name: "Liam Lawson", team: "RB", teamId: "rb",
    nat: "🇳🇿", natCode: "nz", number: 30,
    ch: 0, wins: 0, poles: 0, podiums: 2, fastLaps: 0, debutYear: 2023,
    careerTeams: [
      { team: "AlphaTauri / RB", years: "2023–2024" },
      { team: "Red Bull Racing", years: "2025" },
      { team: "Racing Bulls", years: "2026–present" },
    ],
  },
  {
    code: "LIN", name: "Arvid Lindblad", team: "RB", teamId: "rb",
    nat: "🇬🇧", natCode: "gb", number: 6,
    ch: 0, wins: 0, poles: 0, podiums: 0, fastLaps: 0, debutYear: 2026,
    careerTeams: [
      { team: "Racing Bulls", years: "2026–present" },
    ],
  },
  // Haas
  {
    code: "OCO", name: "Esteban Ocon", team: "Haas", teamId: "haas",
    nat: "🇫🇷", natCode: "fr", number: 31,
    ch: 0, wins: 1, poles: 0, podiums: 4, fastLaps: 2, debutYear: 2016,
    careerTeams: [
      { team: "Manor", years: "2016" },
      { team: "Force India", years: "2017–2018" },
      { team: "Renault", years: "2020" },
      { team: "Alpine", years: "2021–2023" },
      { team: "Haas F1", years: "2025–present" },
    ],
  },
  {
    code: "BEA", name: "Oliver Bearman", team: "Haas", teamId: "haas",
    nat: "🇬🇧", natCode: "gb", number: 87,
    ch: 0, wins: 0, poles: 0, podiums: 0, fastLaps: 0, debutYear: 2024,
    careerTeams: [
      { team: "Ferrari (substitute)", years: "2024" },
      { team: "Haas F1", years: "2025–present" },
    ],
  },
  // Audi (formerly Sauber)
  {
    code: "HUL", name: "Nico Hülkenberg", team: "Audi", teamId: "sauber",
    nat: "🇩🇪", natCode: "de", number: 27,
    ch: 0, wins: 0, poles: 1, podiums: 1, fastLaps: 2, debutYear: 2010,
    careerTeams: [
      { team: "Williams", years: "2010–2012" },
      { team: "Force India", years: "2012–2014" },
      { team: "Sauber", years: "2015–2016" },
      { team: "Renault", years: "2017–2019" },
      { team: "Haas F1", years: "2023–2024" },
      { team: "Audi F1", years: "2025–present" },
    ],
  },
  {
    code: "BOR", name: "Gabriel Bortoleto", team: "Audi", teamId: "sauber",
    nat: "🇧🇷", natCode: "br", number: 5,
    ch: 0, wins: 0, poles: 0, podiums: 0, fastLaps: 0, debutYear: 2025,
    careerTeams: [
      { team: "Sauber / Audi F1", years: "2025–present" },
    ],
  },
  // Cadillac
  {
    code: "BOT", name: "Valtteri Bottas", team: "Cadillac", teamId: "cadillac",
    nat: "🇫🇮", natCode: "fi", number: 77,
    ch: 0, wins: 10, poles: 20, podiums: 67, fastLaps: 19, debutYear: 2013,
    careerTeams: [
      { team: "Williams", years: "2013–2016" },
      { team: "Mercedes-AMG", years: "2017–2021" },
      { team: "Alfa Romeo / Sauber", years: "2022–2024" },
      { team: "Cadillac F1", years: "2025–present" },
    ],
  },
  {
    code: "PER", name: "Sergio Pérez", team: "Cadillac", teamId: "cadillac",
    nat: "🇲🇽", natCode: "mx", number: 11,
    ch: 0, wins: 7, poles: 4, podiums: 40, fastLaps: 12, debutYear: 2011,
    careerTeams: [
      { team: "Sauber", years: "2011–2012" },
      { team: "McLaren", years: "2013" },
      { team: "Force India / Racing Point", years: "2014–2020" },
      { team: "Red Bull Racing", years: "2021–2024" },
      { team: "Cadillac F1", years: "2025–present" },
    ],
  },
];

// ─── 2026 Teams ────────────────────────────────────────────────────────────────

const TEAMS_2026 = [
  { id: "mercedes",     name: "Mercedes-AMG",    color: "#27F4D2", logo: "/logos/mercedes.webp",    base: "Brackley, UK",        principal: "Toto Wolff",       engine: "Mercedes",  ch: 9,  wins: 125, founded: 1954 },
  { id: "ferrari",      name: "Scuderia Ferrari", color: "#E80020", logo: "/logos/ferrari.webp",     base: "Maranello, Italy",    principal: "Frédéric Vasseur", engine: "Ferrari",   ch: 16, wins: 243, founded: 1950 },
  { id: "mclaren",      name: "McLaren",          color: "#FF8000", logo: "/logos/mclaren.webp",     base: "Woking, UK",          principal: "Andrea Stella",    engine: "Mercedes",  ch: 8,  wins: 183, founded: 1963 },
  { id: "red_bull",     name: "Red Bull Racing",  color: "#3671C6", logo: "/logos/redbull.webp",     base: "Milton Keynes, UK",   principal: "Laurent Mekies",   engine: "RBPT",      ch: 6,  wins:  95, founded: 2005 },
  { id: "aston_martin", name: "Aston Martin",     color: "#229971", logo: "/logos/astonmartin.webp", base: "Silverstone, UK",     principal: "Adrian Newey",     engine: "Honda",     ch: 0,  wins:   0, founded: 2021 },
  { id: "alpine",       name: "Alpine F1 Team",   color: "#0093CC", logo: "/logos/alpine.webp",      base: "Enstone, UK",         principal: "Flavio Briatore",  engine: "Renault",   ch: 2,  wins:  35, founded: 1977 },
  { id: "williams",     name: "Williams Racing",  color: "#64C4FF", logo: "/logos/williams.webp",    base: "Grove, UK",           principal: "James Vowles",     engine: "Mercedes",  ch: 7,  wins: 114, founded: 1977 },
  { id: "rb",           name: "Racing Bulls",     color: "#6692FF", logo: "/logos/rb.webp",          base: "Faenza, Italy",       principal: "Alan Permane",     engine: "Honda",     ch: 0,  wins:   2, founded: 2006 },
  { id: "haas",         name: "Haas F1 Team",     color: "#B6BABD", logo: "/logos/haas.webp",        base: "Kannapolis, USA",     principal: "Ayao Komatsu",     engine: "Ferrari",   ch: 0,  wins:   0, founded: 2016 },
  { id: "sauber",       name: "Audi F1 Team",     color: "#F60000", logo: "/logos/sauber.webp",      base: "Hinwil, Switzerland", principal: "Jonathan Wheatley", engine: "Audi",    ch: 0,  wins:   1, founded: 1993 },
  { id: "cadillac",     name: "Cadillac F1",      color: "#FFB000", logo: "/logos/cadillac.webp",    base: "Concord, USA",        principal: "Graeme Lowdon",    engine: "Ferrari",   ch: 0,  wins:   0, founded: 2026 },
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

// ─── Team color helpers ────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27F4D2", ferrari: "#E80020", mclaren: "#FF8000", red_bull: "#3671C6",
  aston_martin: "#229971", alpine: "#0093CC", williams: "#64C4FF",
  rb: "#6692FF", haas: "#B6BABD", sauber: "#F60000", cadillac: "#FFB000",
};
function teamColor(id: string): string {
  return TEAM_COLORS[id.toLowerCase().replace(/-/g, "_")] ?? "#6b7280";
}

// ─── Driver Modal ──────────────────────────────────────────────────────────────

interface DriverModalProps {
  driver: Driver;
  tc: string;
  driverStanding: DriverStanding | null;
  onClose: () => void;
}

function DriverModal({ driver, tc, driverStanding, onClose }: DriverModalProps) {
  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const currentYear = new Date().getFullYear();
  const seasons = currentYear - driver.debutYear + 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-2xl mx-4 my-6 rounded-2xl overflow-hidden"
        style={{ background: "#0c0c0c", border: `1px solid ${tc}30` }}
      >
        {/* Top color bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${tc}, ${tc}80)` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <span className="material-symbols-outlined text-slate-400 text-base">close</span>
        </button>

        {/* Hero section */}
        <div className="flex flex-col sm:flex-row">
          {/* Driver photo */}
          <div
            className="relative flex-shrink-0 sm:w-52 h-64 sm:h-auto overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tc}20 0%, #0c0c0c 100%)` }}
          >
            <img
              src={`/drivers/${driver.code}.webp`}
              alt={driver.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
            />
            {/* Number overlay */}
            <div
              className="absolute bottom-3 left-3 text-5xl font-black italic leading-none select-none"
              style={{ color: `${tc}30`, fontSize: "clamp(3rem,8vw,5rem)" }}
            >
              {driver.number}
            </div>
          </div>

          {/* Driver info */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            {/* Name + meta */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={`https://flagcdn.com/${driver.natCode}.svg`}
                  alt={driver.natCode}
                  className="w-5 h-3.5 rounded-sm object-cover"
                />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{driver.team}</span>
              </div>
              <h2 className="text-2xl font-black uppercase italic leading-tight text-white">
                {driver.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded"
                  style={{ background: `${tc}20`, color: tc, border: `1px solid ${tc}40` }}
                >
                  #{driver.number}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                  {driver.debutYear === currentYear ? "Rookie" : `${seasons} seasons`} · Debut {driver.debutYear}
                </span>
              </div>
            </div>

            {/* Current season standing */}
            {driverStanding ? (
              <div
                className="rounded-xl p-3"
                style={{ background: `${tc}10`, border: `1px solid ${tc}25` }}
              >
                <p className="text-[7px] font-black uppercase tracking-widest mb-2" style={{ color: tc }}>
                  2026 Championship Standing
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black leading-none" style={{ color: tc }}>
                      P{driverStanding.position}
                    </p>
                    <p className="text-[7px] text-slate-500 uppercase font-bold mt-0.5">Position</p>
                  </div>
                  <div className="h-8 w-px" style={{ background: `${tc}30` }} />
                  <div className="text-center">
                    <p className="text-2xl font-black leading-none text-white">{driverStanding.points}</p>
                    <p className="text-[7px] text-slate-500 uppercase font-bold mt-0.5">Points</p>
                  </div>
                  <div className="h-8 w-px" style={{ background: `${tc}30` }} />
                  <div className="text-center">
                    <p className="text-2xl font-black leading-none text-white">{driverStanding.wins}</p>
                    <p className="text-[7px] text-slate-500 uppercase font-bold mt-0.5">Wins</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-[9px] text-slate-600">Season standings update after each Grand Prix.</p>
              </div>
            )}

            {/* Career stats */}
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-600 mb-2">Career Statistics</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "WDC", value: driver.ch, icon: "emoji_events" },
                  { label: "Wins", value: driver.wins, icon: "flag" },
                  { label: "Poles", value: driver.poles, icon: "electric_bolt" },
                  { label: "Podiums", value: driver.podiums, icon: "social_leaderboard" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center rounded-lg py-2"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-lg font-black leading-none" style={{ color: tc }}>{s.value}</p>
                    <p className="text-[7px] text-slate-600 uppercase font-bold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Fastest Laps</span>
                  <span className="text-sm font-black" style={{ color: tc }}>{driver.fastLaps}</span>
                </div>
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-[8px] text-slate-500 font-bold uppercase">F1 Debut</span>
                  <span className="text-sm font-black text-white">{driver.debutYear}</span>
                </div>
              </div>
            </div>

            {/* Career timeline */}
            <div>
              <div className="h-px mb-3" style={{ background: `${tc}20` }} />
              <p className="text-[7px] font-black uppercase tracking-widest mb-3" style={{ color: tc }}>
                F1 Career Timeline
              </p>
              <div className="relative">
                <div
                  className="absolute left-[5px] top-2 bottom-2 w-px"
                  style={{ background: `${tc}30` }}
                />
                <div className="space-y-3 pl-6">
                  {driver.careerTeams.map((ct, i) => (
                    <div key={i} className="relative">
                      <div
                        className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          borderColor: tc,
                          background: ct.years.includes("present") ? tc : "#0c0c0c",
                        }}
                      />
                      <div className="flex items-baseline gap-3">
                        <span className="text-[8px] font-bold text-slate-500 flex-shrink-0 w-20">{ct.years}</span>
                        <span className="text-[11px] font-black text-white leading-tight">{ct.team}</span>
                        {ct.years.includes("present") && (
                          <span
                            className="text-[7px] font-black px-1.5 py-0.5 rounded"
                            style={{ background: `${tc}20`, color: tc }}
                          >
                            CURRENT
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PaddockPage() {
  const [schedule, setSchedule] = useState<ScheduleRace[]>([]);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [standingsLoaded, setStandingsLoaded] = useState(false);
  const [activeDriverModal, setActiveDriverModal] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const today = new Date();

  useEffect(() => {
    getSchedule().then(setSchedule).catch(() => {});
    Promise.all([
      getDriverStandings("2026"),
      getConstructorStandings("2026"),
    ]).then(([ds, cs]) => {
      setDriverStandings(ds);
      setConstructorStandings(cs);
      setStandingsLoaded(true);
    }).catch(() => {
      // Fallback: try current year
      Promise.all([
        getDriverStandings("current"),
        getConstructorStandings("current"),
      ]).then(([ds, cs]) => {
        setDriverStandings(ds);
        setConstructorStandings(cs);
        setStandingsLoaded(true);
      }).catch(() => setStandingsLoaded(true));
    });
  }, []);

  // Build fast-lookup maps from standings
  const driverStandingsMap = useMemo(() => {
    const map: Record<string, DriverStanding> = {};
    driverStandings.forEach((ds) => {
      if (ds.driver.code) map[ds.driver.code.toUpperCase()] = ds;
      // Also index by driver id for fallback
      if (ds.driver.id) map[ds.driver.id.toLowerCase()] = ds;
    });
    return map;
  }, [driverStandings]);

  const constructorStandingsMap = useMemo(() => {
    const map: Record<string, ConstructorStanding> = {};
    constructorStandings.forEach((cs) => {
      if (cs.constructor.id) map[cs.constructor.id.toLowerCase()] = cs;
    });
    return map;
  }, [constructorStandings]);

  // Map constructor ids from standings to TEAMS_2026 ids
  function getTeamStanding(teamId: string): ConstructorStanding | null {
    // Direct match
    if (constructorStandingsMap[teamId]) return constructorStandingsMap[teamId];
    // Alias matching
    const aliases: Record<string, string[]> = {
      sauber: ["kick_sauber", "audi", "sauber"],
      red_bull: ["red_bull", "red_bull_racing"],
      aston_martin: ["aston_martin"],
      rb: ["rb", "rb_f1_team", "alphatauri", "racing_bulls"],
    };
    const candidates = aliases[teamId] ?? [];
    for (const alias of candidates) {
      if (constructorStandingsMap[alias]) return constructorStandingsMap[alias];
    }
    return null;
  }

  const activeDriverData = activeDriverModal
    ? DRIVERS_2026.find((d) => d.code === activeDriverModal) ?? null
    : null;

  return (
    <>
      {/* Driver modal */}
      {activeDriverData && (
        <DriverModal
          driver={activeDriverData}
          tc={teamColor(activeDriverData.teamId)}
          driverStanding={driverStandingsMap[activeDriverData.code] ?? null}
          onClose={() => setActiveDriverModal(null)}
        />
      )}

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
                  <div className="divide-y divide-white/5 md:border-r md:border-white/5">
                    {schedule.slice(0, Math.ceil(schedule.length / 2)).map((r, i) => {
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
                        <div key={r.raceName ?? String(i)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${isNext ? "bg-primary/5" : isPast ? "opacity-35" : "hover:bg-white/3"}`}>
                          <img src={flagUrl} alt={country} className="w-9 h-6 object-cover rounded-sm flex-shrink-0" style={{ filter: isPast ? "saturate(0.3)" : "none" }} />
                          <div className="flex-shrink-0 w-11 text-right">
                            <p className="text-[7px] font-bold text-slate-600 uppercase leading-none">{month}</p>
                            <p className={`text-sm font-black leading-tight whitespace-nowrap ${isNext ? "text-primary" : "text-primary/70"}`}>{d1}–{d2}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wide leading-none mb-0.5 truncate">
                              Round {r.round}&nbsp;·&nbsp;{r.circuit}
                            </p>
                            <p className="text-sm font-black text-white uppercase tracking-wide leading-tight truncate">{country}</p>
                          </div>
                          {isNext && <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-white flex-shrink-0">NEXT</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="divide-y divide-white/5">
                    {schedule.slice(Math.ceil(schedule.length / 2)).map((r, i) => {
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
                        <div key={r.raceName ?? `col2-${i}`}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${isNext ? "bg-primary/5" : isPast ? "opacity-35" : "hover:bg-white/3"}`}>
                          <img src={flagUrl} alt={country} className="w-9 h-6 object-cover rounded-sm flex-shrink-0" style={{ filter: isPast ? "saturate(0.3)" : "none" }} />
                          <div className="flex-shrink-0 w-11 text-right">
                            <p className="text-[7px] font-bold text-slate-600 uppercase leading-none">{month}</p>
                            <p className={`text-sm font-black leading-tight whitespace-nowrap ${isNext ? "text-primary" : "text-primary/70"}`}>{d1}–{d2}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wide leading-none mb-0.5 truncate">
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

          {/* ── 2026 Driver Grid ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
                <span className="w-1 h-6 bg-primary block rounded-full" />
                2026 Driver Grid
              </h2>
              <div className="flex items-center gap-3">
                {standingsLoaded && driverStandings.length > 0 && (
                  <span className="text-[8px] font-black text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Live Standings
                  </span>
                )}
                <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
                  Tap driver for full profile
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-1.5">
              {DRIVERS_2026.map((d) => {
                const t = TEAMS_2026.find((t) => t.id === d.teamId)!;
                const tc = teamColor(d.teamId);
                const standing = driverStandingsMap[d.code];
                const lastName = d.name.split(" ").pop()!;
                return (
                  <button
                    key={d.code}
                    onClick={() => setActiveDriverModal(d.code)}
                    className="relative overflow-hidden rounded-xl border transition-all duration-200 w-full hover:scale-105 active:scale-95"
                    style={{
                      aspectRatio: "3/4",
                      borderColor: "rgba(255,255,255,0.09)",
                      background: "#0e0e0e",
                    }}
                  >
                    {/* Country flag */}
                    <div className="absolute top-1.5 right-1.5 z-10">
                      <img
                        src={`https://flagcdn.com/${d.natCode}.svg`}
                        alt={d.natCode.toUpperCase()}
                        className="w-5 h-3.5 rounded-sm object-cover opacity-90"
                      />
                    </div>

                    {/* WDC position badge */}
                    {standing && (
                      <div
                        className="absolute top-1.5 left-1.5 z-10 text-[7px] font-black px-1 py-0.5 rounded leading-none"
                        style={{ background: `${tc}CC`, color: "#000" }}
                      >
                        P{standing.position}
                      </div>
                    )}

                    {/* Driver photo */}
                    <img
                      src={`/drivers/${d.code}.webp`}
                      alt={d.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />

                    {/* Bottom info */}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-1.5"
                      style={{ background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)` }}
                    >
                      <p className="text-[10px] font-black italic leading-none" style={{ color: tc }}>{d.code}</p>
                      <p className="text-[7px] font-black text-white uppercase leading-tight truncate">{lastName}</p>
                      {standing ? (
                        <p className="text-[6px] font-bold leading-tight mt-0.5" style={{ color: tc }}>{standing.points} pts</p>
                      ) : (
                        <p className="text-[6px] text-slate-500 leading-tight truncate mt-0.5">{t?.name ?? d.team}</p>
                      )}
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
              <div className="flex items-center gap-3">
                {standingsLoaded && constructorStandings.length > 0 && (
                  <span className="text-[8px] font-black text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Live Standings
                  </span>
                )}
                <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
                  11 teams · Click for profile
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {TEAMS_2026.map((t) => {
                const isActive = activeTeam === t.id;
                const standing = getTeamStanding(t.id);
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
                          {standing
                            ? `P${standing.position} · ${standing.points} pts`
                            : t.ch > 0 ? `${t.ch}× WCC` : `Est. ${t.founded}`
                          }
                        </p>
                      </div>
                    </button>

                    {/* Expanded profile */}
                    {isActive && (
                      <div className="rounded-2xl border mt-2 p-3 space-y-1.5"
                        style={{ borderColor: `${t.color}30`, background: `${t.color}06` }}>
                        <p className="text-[8px] font-black uppercase tracking-wider mb-2" style={{ color: t.color }}>{t.name}</p>
                        {standing && (
                          <div className="flex gap-4 mb-2 pb-2" style={{ borderBottom: `1px solid ${t.color}20` }}>
                            <div>
                              <p className="text-[6px] text-slate-600 uppercase">Position</p>
                              <p className="text-base font-black" style={{ color: t.color }}>P{standing.position}</p>
                            </div>
                            <div>
                              <p className="text-[6px] text-slate-600 uppercase">Points</p>
                              <p className="text-base font-black text-white">{standing.points}</p>
                            </div>
                            <div>
                              <p className="text-[6px] text-slate-600 uppercase">Wins</p>
                              <p className="text-base font-black text-white">{standing.wins}</p>
                            </div>
                          </div>
                        )}
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
    </>
  );
}
