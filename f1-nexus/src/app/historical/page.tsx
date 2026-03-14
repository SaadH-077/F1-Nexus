"use client";
import { useState } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEAM_LOGO: Record<string, string> = {
  ferrari:      "/logos/ferrari.webp",
  mclaren:      "/logos/mclaren.webp",
  mercedes:     "/logos/mercedes.webp",
  red_bull:     "/logos/redbull.webp",
  williams:     "/logos/williams.webp",
  alpine:       "/logos/alpine.webp",
  aston_martin: "/logos/astonmartin.webp",
  haas:         "/logos/haas.webp",
  rb:           "/logos/rb.webp",
  sauber:       "/logos/sauber.webp",
  renault:      "https://commons.wikimedia.org/wiki/Special:FilePath/Renault_F1_logo.png",
  lotus:        "https://commons.wikimedia.org/wiki/Special:FilePath/Team_Lotus_logo.png",
  benetton:     "https://commons.wikimedia.org/wiki/Special:FilePath/Benetton_Formula_logo.png",
  brawn:        "https://commons.wikimedia.org/wiki/Special:FilePath/Brawn_GP_logo.svg",
  brabham:      "https://commons.wikimedia.org/wiki/Special:FilePath/Brabham_Racing_Organisation_logo.png",
  tyrrell:      "https://commons.wikimedia.org/wiki/Special:FilePath/Tyrrell_Racing_logo.svg",
  jordan:       "https://commons.wikimedia.org/wiki/Special:FilePath/Jordan_Grand_Prix_logo.png",
};

const ALL_TEAMS_DATA = [
  // Modern constructors
  { id: "ferrari",   name: "Ferrari",   color: "#E80020", since: 1950, ch: 16, wins: 243, podiums: 807, poles: 249 },
  { id: "mclaren",   name: "McLaren",   color: "#FF8000", since: 1963, ch:  8, wins: 183, podiums: 503, poles: 156 },
  { id: "mercedes",  name: "Mercedes",  color: "#27F4D2", since: 1954, ch:  9, wins: 125, podiums: 283, poles: 131 },
  { id: "red_bull",  name: "Red Bull",  color: "#3671C6", since: 2005, ch:  6, wins:  95, podiums: 242, poles:  92 },
  { id: "williams",  name: "Williams",  color: "#64C4FF", since: 1977, ch:  7, wins: 114, podiums: 313, poles: 128 },
  { id: "renault",   name: "Renault",   color: "#FFD700", since: 1977, ch:  2, wins:  35, podiums:  90, poles:  51 },
  // Historic constructors
  { id: "lotus",     name: "Lotus",     color: "#D4AF37", since: 1958, ch:  7, wins:  79, podiums: 174, poles: 107 },
  { id: "brabham",   name: "Brabham",   color: "#006600", since: 1962, ch:  2, wins:  35, podiums:  99, poles:  39 },
  { id: "tyrrell",   name: "Tyrrell",   color: "#003399", since: 1968, ch:  1, wins:  23, podiums:  72, poles:  14 },
  { id: "benetton",  name: "Benetton",  color: "#00D2BE", since: 1986, ch:  2, wins:  27, podiums:  67, poles:  16 },
  { id: "brawn",     name: "Brawn GP",  color: "#CCFF00", since: 2009, ch:  1, wins:   8, podiums:  15, poles:   8 },
  { id: "jordan",    name: "Jordan",    color: "#FFB800", since: 1991, ch:  0, wins:   4, podiums:  22, poles:   2 },
];

const COMP_METRICS = [
  { label: "Constructors Championships", key: "ch"      as const },
  { label: "Total Race Wins",            key: "wins"    as const },
  { label: "Total Podiums",              key: "podiums" as const },
  { label: "Pole Positions",             key: "poles"   as const },
];

const ALL_TIME_DRIVERS = [
  { name: "Lewis Hamilton",     team: "Mercedes",       color: "#27F4D2", ch: 7, wins: 103, poles: 104, podiums: 197, era: "2007–2025" },
  { name: "Michael Schumacher", team: "Ferrari",        color: "#E80020", ch: 7, wins:  91, poles:  68, podiums: 155, era: "1991–2012" },
  { name: "Max Verstappen",     team: "Red Bull",       color: "#3671C6", ch: 4, wins:  63, poles:  40, podiums: 113, era: "2015–pres" },
  { name: "Sebastian Vettel",   team: "Red Bull",       color: "#3671C6", ch: 4, wins:  53, poles:  57, podiums: 122, era: "2007–2022" },
  { name: "Alain Prost",        team: "McLaren/Ferrari",color: "#FF8000", ch: 4, wins:  51, poles:  33, podiums: 106, era: "1980–1993" },
  { name: "Ayrton Senna",       team: "McLaren",        color: "#FF8000", ch: 3, wins:  41, poles:  65, podiums:  80, era: "1984–1994" },
  { name: "Fernando Alonso",    team: "Renault/Alpine", color: "#0093CC", ch: 2, wins:  32, poles:  22, podiums: 106, era: "2001–pres" },
];

const RACE_ARCHIVE = [
  // ── 2026 ──
  { year: "2026", code: "AUS", name: "Australian Grand Prix",     winner: "George Russell",  circuit: "Melbourne",   yt: "https://www.youtube.com/results?search_query=2026+Australian+Grand+Prix+F1+highlights" },
  // ── 2025 ──
  { year: "2025", code: "AUS", name: "Australian Grand Prix",     winner: "Lando Norris",    circuit: "Melbourne",   yt: "https://www.youtube.com/results?search_query=2025+Australian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "CHN", name: "Chinese Grand Prix",        winner: "Max Verstappen",  circuit: "Shanghai",    yt: "https://www.youtube.com/results?search_query=2025+Chinese+Grand+Prix+F1+highlights" },
  { year: "2025", code: "JPN", name: "Japanese Grand Prix",       winner: "Max Verstappen",  circuit: "Suzuka",      yt: "https://www.youtube.com/results?search_query=2025+Japanese+Grand+Prix+F1+highlights" },
  { year: "2025", code: "BHR", name: "Bahrain Grand Prix",        winner: "Max Verstappen",  circuit: "Sakhir",      yt: "https://www.youtube.com/results?search_query=2025+Bahrain+Grand+Prix+F1+highlights" },
  { year: "2025", code: "SAU", name: "Saudi Arabian Grand Prix",  winner: "Lando Norris",    circuit: "Jeddah",      yt: "https://www.youtube.com/results?search_query=2025+Saudi+Arabian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "MIA", name: "Miami Grand Prix",          winner: "Oscar Piastri",   circuit: "Miami",       yt: "https://www.youtube.com/results?search_query=2025+Miami+Grand+Prix+F1+highlights" },
  { year: "2025", code: "EMR", name: "Emilia Romagna Grand Prix", winner: "Lando Norris",    circuit: "Imola",       yt: "https://www.youtube.com/results?search_query=2025+Emilia+Romagna+Grand+Prix+F1+highlights" },
  { year: "2025", code: "MON", name: "Monaco Grand Prix",         winner: "Charles Leclerc", circuit: "Monte Carlo", yt: "https://www.youtube.com/results?search_query=2025+Monaco+Grand+Prix+F1+highlights" },
  { year: "2025", code: "ESP", name: "Spanish Grand Prix",        winner: "Lando Norris",    circuit: "Barcelona",   yt: "https://www.youtube.com/results?search_query=2025+Spanish+Grand+Prix+F1+highlights" },
  { year: "2025", code: "CAN", name: "Canadian Grand Prix",       winner: "Oscar Piastri",   circuit: "Montreal",    yt: "https://www.youtube.com/results?search_query=2025+Canadian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "AUT", name: "Austrian Grand Prix",       winner: "George Russell",  circuit: "Spielberg",   yt: "https://www.youtube.com/results?search_query=2025+Austrian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "GBR", name: "British Grand Prix",        winner: "Lando Norris",    circuit: "Silverstone", yt: "https://www.youtube.com/results?search_query=2025+British+Grand+Prix+F1+highlights" },
  { year: "2025", code: "BEL", name: "Belgian Grand Prix",        winner: "Max Verstappen",  circuit: "Spa",         yt: "https://www.youtube.com/results?search_query=2025+Belgian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "HUN", name: "Hungarian Grand Prix",      winner: "Oscar Piastri",   circuit: "Budapest",    yt: "https://www.youtube.com/results?search_query=2025+Hungarian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "NED", name: "Dutch Grand Prix",          winner: "Lando Norris",    circuit: "Zandvoort",   yt: "https://www.youtube.com/results?search_query=2025+Dutch+Grand+Prix+F1+highlights" },
  { year: "2025", code: "ITA", name: "Italian Grand Prix",        winner: "Charles Leclerc", circuit: "Monza",       yt: "https://www.youtube.com/results?search_query=2025+Italian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "AZE", name: "Azerbaijan Grand Prix",     winner: "Carlos Sainz",    circuit: "Baku",        yt: "https://www.youtube.com/results?search_query=2025+Azerbaijan+Grand+Prix+F1+highlights" },
  { year: "2025", code: "SGP", name: "Singapore Grand Prix",      winner: "Lando Norris",    circuit: "Singapore",   yt: "https://www.youtube.com/results?search_query=2025+Singapore+Grand+Prix+F1+highlights" },
  { year: "2025", code: "USA", name: "United States Grand Prix",  winner: "Lando Norris",    circuit: "Austin",      yt: "https://www.youtube.com/results?search_query=2025+United+States+Grand+Prix+F1+highlights" },
  { year: "2025", code: "MEX", name: "Mexico City Grand Prix",    winner: "Lando Norris",    circuit: "Mexico City", yt: "https://www.youtube.com/results?search_query=2025+Mexico+City+Grand+Prix+F1+highlights" },
  { year: "2025", code: "BRZ", name: "Brazilian Grand Prix",      winner: "Max Verstappen",  circuit: "Interlagos",  yt: "https://www.youtube.com/results?search_query=2025+Brazilian+Grand+Prix+F1+highlights" },
  { year: "2025", code: "LVG", name: "Las Vegas Grand Prix",      winner: "Carlos Sainz",    circuit: "Las Vegas",   yt: "https://www.youtube.com/results?search_query=2025+Las+Vegas+Grand+Prix+F1+highlights" },
  { year: "2025", code: "QAT", name: "Qatar Grand Prix",          winner: "Max Verstappen",  circuit: "Lusail",      yt: "https://www.youtube.com/results?search_query=2025+Qatar+Grand+Prix+F1+highlights" },
  { year: "2025", code: "ABU", name: "Abu Dhabi Grand Prix",      winner: "Max Verstappen",  circuit: "Yas Marina",  yt: "https://www.youtube.com/results?search_query=2025+Abu+Dhabi+Grand+Prix+F1+highlights" },
  // ── 2024 ──
  { year: "2024", code: "BHR", name: "Bahrain Grand Prix",        winner: "Max Verstappen",  circuit: "Sakhir",      yt: "https://www.youtube.com/results?search_query=2024+Bahrain+Grand+Prix+F1+highlights" },
  { year: "2024", code: "SAU", name: "Saudi Arabian Grand Prix",  winner: "Max Verstappen",  circuit: "Jeddah",      yt: "https://www.youtube.com/results?search_query=2024+Saudi+Arabian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "AUS", name: "Australian Grand Prix",     winner: "Carlos Sainz",    circuit: "Melbourne",   yt: "https://www.youtube.com/results?search_query=2024+Australian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "JPN", name: "Japanese Grand Prix",       winner: "Max Verstappen",  circuit: "Suzuka",      yt: "https://www.youtube.com/results?search_query=2024+Japanese+Grand+Prix+F1+highlights" },
  { year: "2024", code: "CHN", name: "Chinese Grand Prix",        winner: "Max Verstappen",  circuit: "Shanghai",    yt: "https://www.youtube.com/results?search_query=2024+Chinese+Grand+Prix+F1+highlights" },
  { year: "2024", code: "MIA", name: "Miami Grand Prix",          winner: "Lando Norris",    circuit: "Miami",       yt: "https://www.youtube.com/results?search_query=2024+Miami+Grand+Prix+F1+highlights" },
  { year: "2024", code: "EMR", name: "Emilia Romagna Grand Prix", winner: "Max Verstappen",  circuit: "Imola",       yt: "https://www.youtube.com/results?search_query=2024+Emilia+Romagna+Grand+Prix+F1+highlights" },
  { year: "2024", code: "MON", name: "Monaco Grand Prix",         winner: "Charles Leclerc", circuit: "Monte Carlo", yt: "https://www.youtube.com/results?search_query=2024+Monaco+Grand+Prix+F1+highlights" },
  { year: "2024", code: "CAN", name: "Canadian Grand Prix",       winner: "Max Verstappen",  circuit: "Montreal",    yt: "https://www.youtube.com/results?search_query=2024+Canadian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "ESP", name: "Spanish Grand Prix",        winner: "Max Verstappen",  circuit: "Barcelona",   yt: "https://www.youtube.com/results?search_query=2024+Spanish+Grand+Prix+F1+highlights" },
  { year: "2024", code: "AUT", name: "Austrian Grand Prix",       winner: "George Russell",  circuit: "Spielberg",   yt: "https://www.youtube.com/results?search_query=2024+Austrian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "GBR", name: "British Grand Prix",        winner: "Lewis Hamilton",  circuit: "Silverstone", yt: "https://www.youtube.com/results?search_query=2024+British+Grand+Prix+F1+highlights" },
  { year: "2024", code: "HUN", name: "Hungarian Grand Prix",      winner: "Oscar Piastri",   circuit: "Budapest",    yt: "https://www.youtube.com/results?search_query=2024+Hungarian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "BEL", name: "Belgian Grand Prix",        winner: "Lewis Hamilton",  circuit: "Spa",         yt: "https://www.youtube.com/results?search_query=2024+Belgian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "NED", name: "Dutch Grand Prix",          winner: "Lando Norris",    circuit: "Zandvoort",   yt: "https://www.youtube.com/results?search_query=2024+Dutch+Grand+Prix+F1+highlights" },
  { year: "2024", code: "ITA", name: "Italian Grand Prix",        winner: "Charles Leclerc", circuit: "Monza",       yt: "https://www.youtube.com/results?search_query=2024+Italian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "AZE", name: "Azerbaijan Grand Prix",     winner: "Oscar Piastri",   circuit: "Baku",        yt: "https://www.youtube.com/results?search_query=2024+Azerbaijan+Grand+Prix+F1+highlights" },
  { year: "2024", code: "SGP", name: "Singapore Grand Prix",      winner: "Lando Norris",    circuit: "Singapore",   yt: "https://www.youtube.com/results?search_query=2024+Singapore+Grand+Prix+F1+highlights" },
  { year: "2024", code: "USA", name: "United States Grand Prix",  winner: "Max Verstappen",  circuit: "Austin",      yt: "https://www.youtube.com/results?search_query=2024+United+States+Grand+Prix+F1+highlights" },
  { year: "2024", code: "MEX", name: "Mexico City Grand Prix",    winner: "Carlos Sainz",    circuit: "Mexico City", yt: "https://www.youtube.com/results?search_query=2024+Mexico+City+Grand+Prix+F1+highlights" },
  { year: "2024", code: "BRZ", name: "Brazilian Grand Prix",      winner: "Max Verstappen",  circuit: "Interlagos",  yt: "https://www.youtube.com/results?search_query=2024+Brazilian+Grand+Prix+F1+highlights" },
  { year: "2024", code: "LVG", name: "Las Vegas Grand Prix",      winner: "Carlos Sainz",    circuit: "Las Vegas",   yt: "https://www.youtube.com/results?search_query=2024+Las+Vegas+Grand+Prix+F1+highlights" },
  { year: "2024", code: "QAT", name: "Qatar Grand Prix",          winner: "Max Verstappen",  circuit: "Lusail",      yt: "https://www.youtube.com/results?search_query=2024+Qatar+Grand+Prix+F1+highlights" },
  { year: "2024", code: "ABU", name: "Abu Dhabi Grand Prix",      winner: "Lando Norris",    circuit: "Yas Marina",  yt: "https://www.youtube.com/results?search_query=2024+Abu+Dhabi+Grand+Prix+F1+highlights" },
  // ── 2023 ──
  { year: "2023", code: "BHR", name: "Bahrain Grand Prix",        winner: "Max Verstappen",  circuit: "Sakhir",      yt: "https://www.youtube.com/results?search_query=2023+Bahrain+Grand+Prix+F1+highlights" },
  { year: "2023", code: "SAU", name: "Saudi Arabian Grand Prix",  winner: "Sergio Pérez",    circuit: "Jeddah",      yt: "https://www.youtube.com/results?search_query=2023+Saudi+Arabian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "AUS", name: "Australian Grand Prix",     winner: "Max Verstappen",  circuit: "Melbourne",   yt: "https://www.youtube.com/results?search_query=2023+Australian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "AZE", name: "Azerbaijan Grand Prix",     winner: "Sergio Pérez",    circuit: "Baku",        yt: "https://www.youtube.com/results?search_query=2023+Azerbaijan+Grand+Prix+F1+highlights" },
  { year: "2023", code: "MIA", name: "Miami Grand Prix",          winner: "Max Verstappen",  circuit: "Miami",       yt: "https://www.youtube.com/results?search_query=2023+Miami+Grand+Prix+F1+highlights" },
  { year: "2023", code: "MON", name: "Monaco Grand Prix",         winner: "Max Verstappen",  circuit: "Monte Carlo", yt: "https://www.youtube.com/results?search_query=2023+Monaco+Grand+Prix+F1+highlights" },
  { year: "2023", code: "ESP", name: "Spanish Grand Prix",        winner: "Max Verstappen",  circuit: "Barcelona",   yt: "https://www.youtube.com/results?search_query=2023+Spanish+Grand+Prix+F1+highlights" },
  { year: "2023", code: "CAN", name: "Canadian Grand Prix",       winner: "Max Verstappen",  circuit: "Montreal",    yt: "https://www.youtube.com/results?search_query=2023+Canadian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "AUT", name: "Austrian Grand Prix",       winner: "Max Verstappen",  circuit: "Spielberg",   yt: "https://www.youtube.com/results?search_query=2023+Austrian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "GBR", name: "British Grand Prix",        winner: "Max Verstappen",  circuit: "Silverstone", yt: "https://www.youtube.com/results?search_query=2023+British+Grand+Prix+F1+highlights" },
  { year: "2023", code: "HUN", name: "Hungarian Grand Prix",      winner: "Max Verstappen",  circuit: "Budapest",    yt: "https://www.youtube.com/results?search_query=2023+Hungarian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "BEL", name: "Belgian Grand Prix",        winner: "Max Verstappen",  circuit: "Spa",         yt: "https://www.youtube.com/results?search_query=2023+Belgian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "NED", name: "Dutch Grand Prix",          winner: "Max Verstappen",  circuit: "Zandvoort",   yt: "https://www.youtube.com/results?search_query=2023+Dutch+Grand+Prix+F1+highlights" },
  { year: "2023", code: "ITA", name: "Italian Grand Prix",        winner: "Carlos Sainz",    circuit: "Monza",       yt: "https://www.youtube.com/results?search_query=2023+Italian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "SGP", name: "Singapore Grand Prix",      winner: "Carlos Sainz",    circuit: "Singapore",   yt: "https://www.youtube.com/results?search_query=2023+Singapore+Grand+Prix+F1+highlights" },
  { year: "2023", code: "JPN", name: "Japanese Grand Prix",       winner: "Max Verstappen",  circuit: "Suzuka",      yt: "https://www.youtube.com/results?search_query=2023+Japanese+Grand+Prix+F1+highlights" },
  { year: "2023", code: "QAT", name: "Qatar Grand Prix",          winner: "Max Verstappen",  circuit: "Lusail",      yt: "https://www.youtube.com/results?search_query=2023+Qatar+Grand+Prix+F1+highlights" },
  { year: "2023", code: "USA", name: "United States Grand Prix",  winner: "Max Verstappen",  circuit: "Austin",      yt: "https://www.youtube.com/results?search_query=2023+United+States+Grand+Prix+F1+highlights" },
  { year: "2023", code: "MEX", name: "Mexico City Grand Prix",    winner: "Max Verstappen",  circuit: "Mexico City", yt: "https://www.youtube.com/results?search_query=2023+Mexico+City+Grand+Prix+F1+highlights" },
  { year: "2023", code: "BRZ", name: "Brazilian Grand Prix",      winner: "Max Verstappen",  circuit: "Interlagos",  yt: "https://www.youtube.com/results?search_query=2023+Brazilian+Grand+Prix+F1+highlights" },
  { year: "2023", code: "LVG", name: "Las Vegas Grand Prix",      winner: "Max Verstappen",  circuit: "Las Vegas",   yt: "https://www.youtube.com/results?search_query=2023+Las+Vegas+Grand+Prix+F1+highlights" },
  { year: "2023", code: "ABU", name: "Abu Dhabi Grand Prix",      winner: "Max Verstappen",  circuit: "Yas Marina",  yt: "https://www.youtube.com/results?search_query=2023+Abu+Dhabi+Grand+Prix+F1+highlights" },
  // ── 2022 ──
  { year: "2022", code: "BHR", name: "Bahrain Grand Prix",        winner: "Charles Leclerc", circuit: "Sakhir",      yt: "https://www.youtube.com/results?search_query=2022+Bahrain+Grand+Prix+F1+highlights" },
  { year: "2022", code: "SAU", name: "Saudi Arabian Grand Prix",  winner: "Charles Leclerc", circuit: "Jeddah",      yt: "https://www.youtube.com/results?search_query=2022+Saudi+Arabian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "AUS", name: "Australian Grand Prix",     winner: "Charles Leclerc", circuit: "Melbourne",   yt: "https://www.youtube.com/results?search_query=2022+Australian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "EMR", name: "Emilia Romagna Grand Prix", winner: "Max Verstappen",  circuit: "Imola",       yt: "https://www.youtube.com/results?search_query=2022+Emilia+Romagna+Grand+Prix+F1+highlights" },
  { year: "2022", code: "MIA", name: "Miami Grand Prix",          winner: "Max Verstappen",  circuit: "Miami",       yt: "https://www.youtube.com/results?search_query=2022+Miami+Grand+Prix+F1+highlights" },
  { year: "2022", code: "ESP", name: "Spanish Grand Prix",        winner: "Max Verstappen",  circuit: "Barcelona",   yt: "https://www.youtube.com/results?search_query=2022+Spanish+Grand+Prix+F1+highlights" },
  { year: "2022", code: "MON", name: "Monaco Grand Prix",         winner: "Sergio Pérez",    circuit: "Monte Carlo", yt: "https://www.youtube.com/results?search_query=2022+Monaco+Grand+Prix+F1+highlights" },
  { year: "2022", code: "AZE", name: "Azerbaijan Grand Prix",     winner: "Max Verstappen",  circuit: "Baku",        yt: "https://www.youtube.com/results?search_query=2022+Azerbaijan+Grand+Prix+F1+highlights" },
  { year: "2022", code: "CAN", name: "Canadian Grand Prix",       winner: "Max Verstappen",  circuit: "Montreal",    yt: "https://www.youtube.com/results?search_query=2022+Canadian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "GBR", name: "British Grand Prix",        winner: "Carlos Sainz",    circuit: "Silverstone", yt: "https://www.youtube.com/results?search_query=2022+British+Grand+Prix+F1+highlights" },
  { year: "2022", code: "AUT", name: "Austrian Grand Prix",       winner: "Charles Leclerc", circuit: "Spielberg",   yt: "https://www.youtube.com/results?search_query=2022+Austrian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "FRA", name: "French Grand Prix",         winner: "Max Verstappen",  circuit: "Paul Ricard", yt: "https://www.youtube.com/results?search_query=2022+French+Grand+Prix+F1+highlights" },
  { year: "2022", code: "HUN", name: "Hungarian Grand Prix",      winner: "Max Verstappen",  circuit: "Budapest",    yt: "https://www.youtube.com/results?search_query=2022+Hungarian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "BEL", name: "Belgian Grand Prix",        winner: "Max Verstappen",  circuit: "Spa",         yt: "https://www.youtube.com/results?search_query=2022+Belgian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "NED", name: "Dutch Grand Prix",          winner: "Max Verstappen",  circuit: "Zandvoort",   yt: "https://www.youtube.com/results?search_query=2022+Dutch+Grand+Prix+F1+highlights" },
  { year: "2022", code: "ITA", name: "Italian Grand Prix",        winner: "Max Verstappen",  circuit: "Monza",       yt: "https://www.youtube.com/results?search_query=2022+Italian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "SGP", name: "Singapore Grand Prix",      winner: "Sergio Pérez",    circuit: "Singapore",   yt: "https://www.youtube.com/results?search_query=2022+Singapore+Grand+Prix+F1+highlights" },
  { year: "2022", code: "JPN", name: "Japanese Grand Prix",       winner: "Max Verstappen",  circuit: "Suzuka",      yt: "https://www.youtube.com/results?search_query=2022+Japanese+Grand+Prix+F1+highlights" },
  { year: "2022", code: "USA", name: "United States Grand Prix",  winner: "Max Verstappen",  circuit: "Austin",      yt: "https://www.youtube.com/results?search_query=2022+United+States+Grand+Prix+F1+highlights" },
  { year: "2022", code: "MEX", name: "Mexico City Grand Prix",    winner: "Max Verstappen",  circuit: "Mexico City", yt: "https://www.youtube.com/results?search_query=2022+Mexico+City+Grand+Prix+F1+highlights" },
  { year: "2022", code: "BRZ", name: "Brazilian Grand Prix",      winner: "George Russell",  circuit: "Interlagos",  yt: "https://www.youtube.com/results?search_query=2022+Brazilian+Grand+Prix+F1+highlights" },
  { year: "2022", code: "ABU", name: "Abu Dhabi Grand Prix",      winner: "Max Verstappen",  circuit: "Yas Marina",  yt: "https://www.youtube.com/results?search_query=2022+Abu+Dhabi+Grand+Prix+F1+highlights" },
];

const LEGENDS = [
  {
    name: "LEWIS HAMILTON", country: "United Kingdom", titles: 7, wins: 103, years: "2007–2025",
    quote: "Still I rise. The battle is never over. I want to inspire a generation.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdC1xS9ZspEfYYu31h5ZBxYdJ3Td7Exi499RuuX-foURWTolo-EylYiFiNnmmCwmPbaHFStqdtL4Ma0IjTiqnTqMTkF9VDStAvirGms9FZ-Xr3TLCKkDios3ImFxDsVi3udTXHC_ArxAUqMMqzYsoJZr0lnnd93M9EZCesed_YOC9dCYHpyId5QWlabpP1CMHYR4-Z1bgmO8G5mJT747fCh2D_dcSI5QNe57gYgAXKldxUEaOjAmkTAssRybVa2OJ6sTGLRRyK2u0S",
  },
  {
    name: "MICHAEL SCHUMACHER", country: "Germany", titles: 7, wins: 91, years: "1991–2012",
    quote: "Once something is a passion, the motivation is there.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEYtRe6XjHadexOp0pUEa0I0Lau8NxSclWyHtfNzhnvIjG83qfL4VCpxjxF6dEplYdOPEq0tjxiHV7KaKNDfeHdtdwwh66B41zXbQRWAstXwRJk6mziupeUGspC0RemMkQJiNLpStgfmjhvy3DAmL4wEwhXJyUj-lDnPw595emKVwKBxnM46tJO9w4T0vFedEPscVhwCCQdJNIO8OJdhB0HFtts2isAUMo9OqauIx14p9A6-rhBgOLpt0VRjkA2jyok4a5GXv8G1C_",
  },
  {
    name: "AYRTON SENNA", country: "Brazil", titles: 3, wins: 41, years: "1984–1994",
    quote: "Racing, competing, it's in my blood. It's part of me, it's part of my life.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTTBPGdEiup8Z7vbaYbrx3_ukboYh55NcujzEHh6zSJjl7G2ILLLsHp0DyVZwIhBA6fnc5uavL0_5xgXOp3JPxaw4Na_sqXMw3JBtqg8WlkVJ8-rBZpg51U79GpTx4Vzp8VvcKOi21j0Md5JKo8EWpQX2VIdu7ZK64CrtCrbVIS_B2llTudF7wbyOgE7K3d2Hv7rmZ6xexpOKInk3vGV79h6RaBVEhBmVk2BknajCDS6RzKZFM1VZIeA1xzx1zyfhOHsaiCyTtbWLe",
  },
  {
    name: "MAX VERSTAPPEN", country: "Netherlands", titles: 4, wins: 63, years: "2015–pres",
    quote: "I don't want to think about what could go wrong. I just go.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCjFy27naU_AWZ4yBMixZOBxDa5abor3TqdCiu08GMusutNQNzFSbu5p5bJ5Sa7hXUfaJ1-GoQU20YpMND4mOci5ENJKex5JfProe96-IPwgRs8xQhfmUxmNNp_vjgffKdPw48MiN5Laog763Uzx3q_Scs2Z6HPJv2Vbp7xu-FOgUyqeh9Gd_ebVmzmpHVDDhguq4e_K7ZFA_5hc7f_7BiITvBuT64LhPSv6VK9dyGhTGOBkau16lnN1HhPdHaJaKaN4-cJ9sTzS4q",
  },
  {
    name: "ALAIN PROST", country: "France", titles: 4, wins: 51, years: "1980–1993",
    quote: "You must take the compromise that allows you to be the quickest over a whole race.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQjg-HFlu4QohpOq01XhP4cm5J-gmUoYDHEZu8G4d4tK0a301coGGqaqmvnOYvatQvoCIJzuaaBkBsXJtTmpV1tkHcyBzX-i1lEKbBlKrap1P4_eduD8Asu_RLaEa8QjdMpPfGBwsV26ieqdKPvQ2dRuOMFuvcXR6q82emK535tSYPVlpAziKMITPf77ubWpGDWirslrF8KzKU7Lr0agsJlF7ewUYUNubEmCKWqvFbLHI8Ni9W9LUM9nmUPxEkELIjRZQMQPgI3Z9j",
  },
  {
    name: "NIKI LAUDA", country: "Austria", titles: 3, wins: 25, years: "1971–1985",
    quote: "I accept risk as part of the sport. But I refused to let the risk define me.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYe6jUrZxRox2XFHuHyBn5UrRSTbc6_g5zKFnzKPK-H1Xiz2YaSA4GdlDgmS1McygzasHUbCBZ5Yxbr9M5lN619qT9iqYugoQSUscGftSKkDNDFcod_cac7u4NBdwi_xo-D0VQFpLGKOM6cKy551jNBZ50EUzVPV_-6pQICVFQsH99R55knxoVF1w-Eu1FJm40MuRda-fSFhqBacPh1qOzvAAN7VWXgukUqOeUagzhHwvG2OqNMnxShyV883TQ3L7JVOPgqPvc_-2e",
  },
  {
    name: "FERNANDO ALONSO", country: "Spain", titles: 2, wins: 32, years: "2001–pres",
    quote: "A racing car is an animal with which you must work in harmony. Push it too far and it bites back.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh2DMF99BbZr_Gbe-t_a11ZQEQ3_D5xEcJ0zUYMM6KS44HKIPT2fTMNIQiV3Jkw4Ro6V0oNAWnX8J8TIHuU9cwN499YiUR6-W9Voefy-BX4t6FE3v_KJzcdspQOmVwwHq0B_q0MPq8lO86LT-sQSBVvPdnjUtaE7QgDOAhQMSOxWJM70mXmLABMQrSkK5o_HUzyas-VHjy3FBR92GMBRAuzVnE1lYgdmqEyRWpU3hUmTM2z8yMsre6LsjhcDLyby00k5pfmC6Oiaed",
  },
  {
    name: "JIM CLARK", country: "United Kingdom", titles: 2, wins: 25, years: "1960–1968",
    quote: "I must say I enjoy motor racing enormously. I enjoy the sheer challenge of it.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfssdR5hj7rD2fxKbZvVhu9ctI1xXe36E-p3KlvQt56p7gpL3bC3TeVo9tIVEFny92pW9N5jrTo90ocDlgOKzdZqmWywsgKWaZuDkXgwLVcMgtL-qavCEP3BbkBny9T_RlB-PXkU9rvsF9BT0PDM0SWpncuXcdA9bkOHSjW7eTXwklHHkAhwE-XnYnd5xM61vMduyWtY8-VdSSEVBzHFkkqzckoufkvYL5aQaxy2nbBZ_4whR827iqTnac0LZeK3GkCbcyn4pq6hGj",
  },
  {
    name: "JACKIE STEWART", country: "United Kingdom", titles: 3, wins: 27, years: "1965–1973",
    quote: "You must be able to look forward, not back. And you must have the courage to keep your foot down.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUrQQ66gRf7MJGD2OhFy4MjbQUFmazK1TF2IzI54m6h-SiJcRhg3OD4qmgF273smtJb3g1sjhGp-Yl7MqxHL3QD4OJ5HReqDmeIY69Yd562os4ECWbPcbUCFC2_GaFDby5tAXYOs6fOIv_Ki8I39R64merka9V5UWC5j3fAWFf091ZXTXKTB5GrR6xmSZcX9wzXPJh1ERKi2fMk2R7qfdDhrKdHyhBjrLdldqSwIaZQO3bl1LZgg-lAgXzR4IadH7lmW5cMK76J06x",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoricalPage() {
  const [teamA, setTeamA] = useState("ferrari");
  const [teamB, setTeamB] = useState("mclaren");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tA = ALL_TEAMS_DATA.find((t) => t.id === teamA)!;
  const tB = ALL_TEAMS_DATA.find((t) => t.id === teamB)!;

  const years = ["All", "2026", "2025", "2024", "2023", "2022"];
  const filteredRaces = RACE_ARCHIVE.filter((r) => {
    const matchYear = selectedYear === "All" || r.year === selectedYear;
    const matchSearch = !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.winner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.circuit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchYear && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* ── Hero ── */}
        <section>
          <div className="relative overflow-hidden rounded-xl h-[340px] md:h-[400px] flex items-end p-5 md:p-8 border border-border-accent group">
            <div
              className="absolute inset-0 bg-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgba(11,11,11,0.92) 0%, rgba(11,11,11,0.2) 60%, rgba(11,11,11,0) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ1tj1l_geHLvv8ZT4pvrJpFfzqyq_44ToGO_ICM8ATbo-TeWoh7uKzGTFyAguUPjpp8mB81e6hoNM_GyS5nYzfdlU5DSLR5sWHVBUCqlypJcppmRQbGyI9PpjzDCD3Vj1Q1aYDPHWJdwxyjsLWeuCPwfwEF6ZKlBkLlBFTeuMxVYukjbigDwNO_rT6Fhj9ZxuMw3KVVwlAXrTJS89Sddh19FqAE50HNuoSHTXUyJNNt3vTQw9Rnb0MEYY6FZW9WubfYqk5tdqYjw8')",
                backgroundPosition: "center 50%",
              }}
            />
            <div className="relative z-10 w-full max-w-2xl">
              <span className="inline-block px-3 py-1 bg-primary text-[10px] font-black tracking-widest uppercase mb-4 rounded-sm">
                Season Highlight
              </span>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">2025 SEASON SUMMARY</h2>
              <p className="text-slate-400 mb-6 text-sm md:text-lg max-w-lg">
                Relive Lando Norris and McLaren&apos;s championship triumph — the season that ended Red Bull&apos;s era of dominance and crowned a new generation.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/results?search_query=2025+F1+season+review+highlights"
                  target="_blank" rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-sm">play_arrow</span> WATCH REVIEW
                </a>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {["2025", "2024", "2023", "2022"].map((y) => (
                    <a key={y}
                      href={`https://www.youtube.com/results?search_query=${y}+F1+season+review`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex h-12 shrink-0 items-center justify-center rounded bg-panel-dark border border-border-accent px-6 hover:border-primary cursor-pointer transition-colors">
                      <p className="text-white text-sm font-bold">{y}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Team Legacy Comparison ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
              <span className="w-1.5 h-8 bg-primary block" /> TEAM LEGACY COMPARISON
            </h3>
          </div>
          <div className="bg-panel-dark rounded-xl border border-border-accent p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Team selectors */}
              <div className="space-y-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Comparing</p>
                <div className="space-y-3">
                  {[{ val: teamA, set: setTeamA }, { val: teamB, set: setTeamB }].map(({ val, set }, si) => {
                    const selected = ALL_TEAMS_DATA.find((t) => t.id === val)!;
                    return (
                      <div key={si}>
                        <select
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          className="w-full bg-black/30 border rounded text-sm py-2 px-3 text-white outline-none cursor-pointer"
                          style={{ borderColor: selected.color + "50" }}
                        >
                          {ALL_TEAMS_DATA.map((t) => (
                            <option key={t.id} value={t.id} className="bg-[#111]">{t.name}</option>
                          ))}
                        </select>
                        {/* Team logo + name bar */}
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded mt-1 border-l-4"
                          style={{ borderColor: selected.color }}>
                          {TEAM_LOGO[selected.id] && (
                            <img key={selected.id} src={TEAM_LOGO[selected.id]} alt={selected.name}
                              className="h-6 w-auto object-contain opacity-90 flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          )}
                          <span className="text-sm font-black uppercase" style={{ color: selected.color }}>
                            {selected.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-border-accent">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Historical data spanning 1950–2026. All-time constructor statistics.
                  </p>
                </div>
              </div>

              {/* Comparison bars */}
              <div className="lg:col-span-3 space-y-8">
                {COMP_METRICS.map((m) => {
                  const aVal = tA[m.key] as number;
                  const bVal = tB[m.key] as number;
                  const total = aVal + bVal || 1;
                  const aW = Math.round((aVal / total) * 100);
                  const bW = 100 - aW;
                  return (
                    <div key={m.label} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{m.label}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {TEAM_LOGO[tA.id] && (
                              <img key={tA.id} src={TEAM_LOGO[tA.id]} alt={tA.name} className="h-4 w-auto object-contain opacity-80"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            )}
                            <span className="font-black italic" style={{ color: tA.color }}>{aVal.toLocaleString()}</span>
                          </div>
                          <span className="text-slate-600 text-xs">vs</span>
                          <div className="flex items-center gap-2">
                            {TEAM_LOGO[tB.id] && (
                              <img key={tB.id} src={TEAM_LOGO[tB.id]} alt={tB.name} className="h-4 w-auto object-contain opacity-80"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            )}
                            <span className="font-black italic" style={{ color: tB.color }}>{bVal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden flex">
                        <div className="h-full rounded-r-sm transition-all duration-700"
                          style={{ width: `${aW}%`, background: tA.color, boxShadow: `0 0 8px ${tA.color}40` }} />
                        <div className="h-full rounded-r-sm ml-px transition-all duration-700"
                          style={{ width: `${bW}%`, background: tB.color, boxShadow: `0 0 8px ${tB.color}40` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Driver Stats + Race Archive ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* All-Time Driver Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary block" /> ALL-TIME DRIVER STATS
              </h3>
            </div>
            <div className="bg-panel-dark rounded-xl border border-border-accent overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[480px]">
                <thead className="bg-black/50 text-slate-400 text-[10px] font-black tracking-widest uppercase border-b border-border-accent">
                  <tr>
                    <th className="px-5 py-4">Driver</th>
                    <th className="px-4 py-4 text-center">Championships</th>
                    <th className="px-4 py-4 text-center">Wins</th>
                    <th className="px-4 py-4 text-center">Poles</th>
                    <th className="px-4 py-4 text-right">Podiums</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-accent">
                  {ALL_TIME_DRIVERS.map((d) => (
                    <tr key={d.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <div>
                            <p className="font-black text-sm uppercase text-white">{d.name}</p>
                            <p className="text-[9px] font-bold" style={{ color: d.color }}>{d.team} · {d.era}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-black italic text-xl text-white">
                        <AnimatedCounter value={d.ch} duration={800} />
                      </td>
                      <td className="px-4 py-4 text-center text-slate-300">
                        <AnimatedCounter value={d.wins} duration={1200} />
                      </td>
                      <td className="px-4 py-4 text-center text-slate-300">
                        <AnimatedCounter value={d.poles} duration={1200} />
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-slate-300">
                        <AnimatedCounter value={d.podiums} duration={1400} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Race Archive */}
          <div className="space-y-5">
            <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
              <span className="w-1.5 h-8 bg-primary block" /> RACE ARCHIVE
            </h3>

            <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1">
              {years.map((y) => (
                <button key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedYear === y
                      ? "bg-primary text-white"
                      : "bg-panel-dark border border-border-accent text-slate-500 hover:border-primary/50"
                  }`}>
                  {y}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                className="w-full bg-panel-dark border border-border-accent rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all text-slate-100"
                placeholder="Search race, winner…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-sm">search</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredRaces.map((r, i) => (
                <a key={i} href={r.yt} target="_blank" rel="noopener noreferrer"
                  className="bg-panel-dark p-3.5 rounded-lg border border-border-accent flex items-center justify-between hover:border-primary/50 cursor-pointer group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-center bg-black/40 px-2.5 py-2 rounded flex-shrink-0">
                      <p className="text-[9px] font-bold text-slate-400">{r.year}</p>
                      <p className="text-xs font-black">{r.code}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight text-white">{r.name}</p>
                      <p className="text-[10px] text-slate-400">Winner: <span className="text-white">{r.winner}</span></p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </a>
              ))}
              {filteredRaces.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No results found.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Legends of F1 ── */}
        <section>
          <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3 mb-8">
            <span className="w-1.5 h-8 bg-primary block" /> LEGENDS OF F1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEGENDS.map((legend) => (
              <div key={legend.name}
                className="group relative rounded-xl overflow-hidden border border-border-accent transition-all duration-500 hover:border-primary/40"
                style={{ aspectRatio: "4/5" }}>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(11,11,11,1) 0%, rgba(11,11,11,0) 50%), url('${legend.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                  }}
                />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <p className="text-primary font-black text-xs tracking-[0.3em] uppercase mb-1">
                    {legend.country} · {legend.years}
                  </p>
                  <h4 className="text-3xl font-black italic leading-none mb-3">
                    {legend.name.split(" ").map((w, i) => <span key={i}>{w}<br /></span>)}
                  </h4>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Titles</p>
                      <p className="text-xl font-black italic">{legend.titles}</p>
                    </div>
                    <div className="h-8 w-px bg-border-accent" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Wins</p>
                      <p className="text-xl font-black italic">{legend.wins}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic border-l-2 border-primary pl-3
                    max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 opacity-0 group-hover:opacity-100">
                    &ldquo;{legend.quote}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
