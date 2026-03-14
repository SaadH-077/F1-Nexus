import Link from "next/link";
import { getAnalysis, getLastRaceResults, driverPhotoUrl, teamColor, constructorIdFromName } from "@/lib/api";

function circuitImage(raceName: string): string {
  const n = raceName.toLowerCase();
  if (n.includes("australia"))      return "/circuits/australia.webp";
  if (n.includes("bahrain"))        return "/circuits/bahrain.webp";
  if (n.includes("saudi"))          return "/circuits/saudi_arabia.webp";
  if (n.includes("japan"))          return "/circuits/japan.webp";
  if (n.includes("china"))          return "/circuits/china.webp";
  if (n.includes("miami"))          return "/circuits/miami.webp";
  if (n.includes("emilia") || n.includes("imola")) return "/circuits/emilia_romagna.webp";
  if (n.includes("monaco"))         return "/circuits/monaco.webp";
  if (n.includes("canada"))         return "/circuits/canada.webp";
  if (n.includes("spain"))          return "/circuits/spain.webp";
  if (n.includes("austria"))        return "/circuits/austria.webp";
  if (n.includes("great britain") || n.includes("british") || n.includes("silverstone")) return "/circuits/great_britain.webp";
  if (n.includes("hungary"))        return "/circuits/hungary.webp";
  if (n.includes("belgium"))        return "/circuits/belgium.webp";
  if (n.includes("netherlands"))    return "/circuits/netherlands.webp";
  if (n.includes("italy") || n.includes("monza")) return "/circuits/italy.webp";
  if (n.includes("azerbaijan"))     return "/circuits/azerbaijan.webp";
  if (n.includes("singapore"))      return "/circuits/singapore.webp";
  if (n.includes("united states") || n.includes("cota") || n.includes("austin")) return "/circuits/united_states.webp";
  if (n.includes("mexico"))         return "/circuits/mexico.webp";
  if (n.includes("brazil"))         return "/circuits/brazil.webp";
  if (n.includes("las vegas"))      return "/circuits/las_vegas.webp";
  if (n.includes("qatar"))          return "/circuits/qatar.webp";
  if (n.includes("abu dhabi"))      return "/circuits/abu_dhabi.webp";
  return "/circuits/australia.webp";
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

export default async function RaceAnalysisPage() {
  const { race: lastRace, results: lastResults } = await getLastRaceResults();
  const raceName = lastRace?.name ?? "Australian Grand Prix";
  const year = 2026;
  const analysis = await getAnalysis(year, raceName);
  const cover = circuitImage(raceName);
  const today = fmtDate(new Date().toISOString());

  const top3 = analysis?.metrics?.top3 ?? lastResults.slice(0, 3).map((r, i) => ({
    position: String(i + 1),
    driver: r.driver,
    driverName: r.driverName,
    constructor: r.constructor,
    teamClass: constructorIdFromName(r.constructor),
    gap: i === 0 ? "Leader" : r.time,
  }));

  const pitStops = analysis?.metrics?.pit_stops ?? [
    { driver: "NOR", team: "mclaren",  time: 2.1, isBest: true  },
    { driver: "LEC", team: "ferrari",  time: 2.6, isBest: false },
    { driver: "VER", team: "red_bull", time: 2.9, isBest: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24">
      {/* Back */}
      <Link
        href="/analyst"
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Race Analyst
      </Link>

      {/* Hero cover */}
      <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 mb-8">
        <img
          src={cover}
          alt={raceName}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-block bg-primary text-white">
            Grand Prix Report
          </span>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white leading-tight mt-2">
            {analysis?.headline ?? `The Story Behind the ${raceName}`}
          </h1>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-dark">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>
        <div>
          <p className="text-sm font-black text-white">~ Saad Haroon</p>
          <p className="text-[11px] text-slate-500">{today} · 10 min read</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{raceName}</span>
        </div>
      </div>

      {/* Sub-headline */}
      {analysis?.title && (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">{analysis.title}</p>
      )}

      {/* Intro quote */}
      <p className="text-lg text-slate-300 leading-relaxed mb-8 font-light italic border-l-2 border-primary pl-4">
        {analysis?.winner && analysis?.constructor
          ? `${analysis.winner} and ${analysis.constructor} delivered one of the defining performances of the 2026 season — a race that combined mechanical excellence, strategic nerve, and outright pace.`
          : `A defining performance in the 2026 season — one that combined mechanical excellence, strategic nerve, and outright pace at ${raceName}.`
        }
      </p>

      {/* Analysis body */}
      <div className="space-y-6 mb-10">
        <p className="text-slate-300 text-base leading-[1.85] tracking-wide" style={{ textIndent: "1.5em" }}>
          {analysis?.analysis ??
            "The race unfolded across 58 laps of strategic and mechanical brilliance. ERS management in Sector 2 and a clinical 2.1-second pit stop created a net four-second cushion over the chasing pack, with structural aerodynamic efficiency in the high-speed complex providing a consistent 0.3-second-per-lap advantage that made the result inevitable from lap 20 onwards."}
        </p>
        <p className="text-slate-400 text-base leading-[1.85] tracking-wide" style={{ textIndent: "1.5em" }}>
          The tyre strategy was the defining subplot. Running a longer opening stint than the cars directly behind allowed the team to undercut at a moment when track position was worth more than fresh rubber — a call that required precise modelling of degradation rates and competitor pit windows. The data ultimately supported the decision: the out-lap on the new set was 1.8 seconds faster than the rival who stopped two laps earlier.
        </p>
        <p className="text-slate-400 text-base leading-[1.85] tracking-wide" style={{ textIndent: "1.5em" }}>
          In the closing sequence, DRS management through the detection loop became critical. Running within 0.9 seconds of the car ahead triggered the drag reduction system, allowing a flat-out run through the braking zone that no rival could match on older rubber. The championship points secured here carry significance beyond the immediate round standings — they reflect a team operating at the ceiling of its collective capability.
        </p>
      </div>

      {/* Podium grid */}
      {top3.length > 0 && (
        <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden mb-10">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border-dark">
            <span className="material-symbols-outlined text-primary text-base">emoji_events</span>
            <h3 className="font-black italic uppercase text-sm">Race Podium · {raceName}</h3>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4">
            {top3.map((r, i) => {
              const color = teamColor(r.teamClass);
              const bg = i === 0 ? "bg-yellow-500/5 border-yellow-500/20"
                       : i === 1 ? "bg-slate-400/5 border-slate-400/20"
                       : "bg-orange-700/5 border-orange-700/20";
              const mc = i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : "#c2410c";
              return (
                <div key={r.driver} className={`rounded-xl border p-4 flex flex-col items-center gap-3 text-center ${bg}`}>
                  <span className="text-2xl font-black" style={{ color: mc }}>P{r.position}</span>
                  <div className="w-16 h-16 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px ${color}, 0 0 16px ${color}40` }}>
                    <img src={driverPhotoUrl(r.driver)} alt={r.driver} className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <p className="font-black italic uppercase text-sm" style={{ color }}>{r.driver}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{r.constructor}</p>
                    <p className="text-[9px] font-mono text-slate-600 mt-1">{r.gap ?? "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-8 border-t border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Written by</p>
          <p className="text-sm font-black text-white">~ Saad Haroon</p>
          <p className="text-[11px] text-slate-500">F1 Nexus · Race Analyst</p>
        </div>
        <Link
          href="/analyst"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">article</span>
          More Analysis
        </Link>
      </div>
    </div>
  );
}
