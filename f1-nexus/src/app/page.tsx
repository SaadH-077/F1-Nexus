import {
  getDriverStandings,
  getConstructorStandings,
  getNextRace,
  getLastRaceResults,
  getLastSprintResults,
  getLastQualifyingResults,
  getNews,
  teamColor,
  constructorIdFromName,
  localCircuitImage,
  driverPhotoUrl,
  teamLogoUrl,
} from "@/lib/api";
import NewsCarousel from "@/components/NewsCarousel";
import SubscribeCTA from "@/components/SubscribeCTA";
import Countdown from "@/components/Countdown";
import SessionSchedule from "@/components/SessionSchedule";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function positionBadgeClass(pos: number) {
  if (pos === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
  if (pos === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/40";
  if (pos === 3) return "bg-orange-700/20 text-orange-400 border-orange-700/40";
  return "bg-white/5 text-slate-500 border-white/5";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [driversRaw, constructors, { race: lastRace, results: lastResults }, { race: lastSprint, results: sprintResults }, { race: lastQualifying, results: qualifyingResults }, nextRace, newsArticles] =
    await Promise.all([
      getDriverStandings(),
      getConstructorStandings(),
      getLastRaceResults(),
      getLastSprintResults(),
      getLastQualifyingResults(),
      getNextRace(),
      getNews(),
    ]);

  // Always sort by points descending and re-index 1-based positions
  const drivers = [...driversRaw]
    .sort((a, b) => Number(b.points) - Number(a.points))
    .map((d, i) => ({ ...d, position: String(i + 1) }));

  const circuitImgPath = nextRace
    ? localCircuitImage(nextRace.locality, nextRace.country)
    : null;

  const maxPts = constructors.length > 0 ? Math.max(1, Number(constructors[0].points)) : 1;

  const youtubeUrl = lastRace?.name
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `Formula 1 ${lastRace.name} 2026 race highlights full race`
      )}`
    : "https://www.youtube.com/@Formula1";

  const championDriver = drivers[0];
  const championTeamColor = championDriver
    ? teamColor(constructorIdFromName(championDriver.constructor))
    : "#e00700";

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-6">

      {/* ── Championship Leader Bar ── */}
      <div className="flex items-center gap-4 px-5 py-3 bg-card-dark border border-border-dark rounded-xl overflow-x-auto">
        {championDriver && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2"
              style={{ boxShadow: `0 0 0 2px ${championTeamColor}` }}
            >
              <img
                src={driverPhotoUrl(championDriver.driver.code)}
                alt={championDriver.driver.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Championship Leader</p>
              <p className="text-sm font-black italic uppercase leading-tight" style={{ color: championTeamColor }}>
                {championDriver.driver.name.split(" ").slice(-1)[0]}
                <span className="text-slate-400 ml-2 font-bold not-italic text-xs">{championDriver.points} pts</span>
              </p>
            </div>
          </div>
        )}

        <div className="w-px h-8 bg-border-dark flex-shrink-0" />

        {lastRace?.name && lastResults[0] && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">flag</span>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Last Race Winner</p>
              <p className="text-sm font-black italic uppercase leading-tight">
                {lastResults[0].driverName.split(" ").slice(-1)[0]}
                <span className="text-slate-400 ml-2 font-normal text-xs not-italic">{lastRace.name}</span>
              </p>
            </div>
          </div>
        )}

        {lastSprint?.name && sprintResults[0] && (
          <>
            <div className="w-px h-8 bg-border-dark flex-shrink-0" />
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="material-symbols-outlined text-orange-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
              <div>
                <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Sprint Winner</p>
                <p className="text-sm font-black italic uppercase leading-tight">
                  {sprintResults[0].driverName.split(" ").slice(-1)[0]}
                  <span className="text-slate-400 ml-2 font-normal text-xs not-italic">{lastSprint.name.replace(" · Sprint", "")}</span>
                </p>
              </div>
            </div>
          </>
        )}

        <div className="w-px h-8 bg-border-dark flex-shrink-0" />

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="material-symbols-outlined text-slate-500 text-lg">calendar_month</span>
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Season</p>
            <p className="text-sm font-black italic uppercase">
              2026
              <span className="text-slate-400 ml-2 font-normal text-xs not-italic">
                Round {nextRace?.round ?? "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── HERO: Next Race ── */}
      <section className="relative rounded-2xl overflow-hidden border border-border-dark">
        {/* Circuit image background */}
        <div className="absolute inset-0">
          {circuitImgPath ? (
            <img
              src={circuitImgPath}
              alt={nextRace?.circuit ?? "Circuit"}
              className="w-full h-full object-cover object-center opacity-20"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card-dark to-background-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent" />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-0 min-h-[380px] md:min-h-[520px]">
          {/* Left: Race info */}
          <div className="p-5 md:p-8 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Next Event
              </div>

              {/* Race Name */}
              <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.9] mb-3">
                {nextRace ? (
                  <>
                    {nextRace.locality || nextRace.country}
                    <br />
                    <span className="text-primary">Grand Prix</span>
                  </>
                ) : (
                  <>
                    Formula 1<br />
                    <span className="text-primary">2026 Season</span>
                  </>
                )}
              </h2>

              {/* Subtitle */}
              <p className="text-slate-400 font-medium mb-8 text-sm">
                {nextRace
                  ? `${nextRace.circuit} · ${fmtDate(nextRace.date)}`
                  : "Season underway"}
              </p>

              {/* Countdown */}
              {nextRace?.date && <Countdown targetDate={nextRace.date} />}

              {/* Circuit layout — mobile only (hidden on lg where right column takes over) */}
              {circuitImgPath && (
                <div className="lg:hidden relative flex items-center justify-center mb-6 rounded-xl overflow-hidden" style={{ height: "160px" }}>
                  <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(ellipse at center, rgba(224,7,0,0.12) 0%, transparent 70%)" }} />
                  <img
                    src={circuitImgPath}
                    alt={nextRace?.circuit ?? "Circuit"}
                    className="max-w-full max-h-full object-contain"
                    style={{ filter: "drop-shadow(0 0 18px rgba(224,7,0,0.45)) brightness(1.05)" }}
                  />
                </div>
              )}

              {/* Session Schedule */}
              {nextRace && (
                <SessionSchedule
                  sessions={nextRace.sessions ?? []}
                  raceDate={nextRace.date}
                  raceName={nextRace.raceName}
                />
              )}
            </div>

            {/* Round / Country */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-border-dark">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">flag</span>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Round</p>
                  <p className="text-sm font-black">{nextRace?.round ?? "—"} / 2026</p>
                </div>
              </div>
              <div className="w-px h-6 bg-border-dark hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">location_on</span>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Country</p>
                  <p className="text-sm font-black">{nextRace?.country ?? "—"}</p>
                </div>
              </div>
              <div className="w-px h-6 bg-border-dark hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">route</span>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Circuit</p>
                  <p className="text-sm font-black">{nextRace?.circuit ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Circuit Layout (prominent) */}
          <div className="relative hidden lg:flex items-center justify-center p-8">
            {circuitImgPath ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-xl blur-2xl opacity-10"
                  style={{ background: "radial-gradient(ellipse at center, #e00700, transparent)" }}
                />
                <img
                  src={circuitImgPath}
                  alt={nextRace?.circuit ?? "Circuit layout"}
                  className="max-w-full max-h-[400px] object-contain drop-shadow-[0_0_40px_rgba(224,7,0,0.3)]"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full opacity-10">
                <span className="material-symbols-outlined text-[120px] text-slate-600">route</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Qualifying / Starting Grid ── */}
      {lastQualifying && qualifyingResults.length > 0 && (
        <section className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
              Starting Grid
              <span className="text-[9px] font-normal not-italic text-slate-500 uppercase tracking-widest ml-1">
                {lastQualifying.name}
              </span>
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Qualifying</span>
          </div>

          {/* Pole spotlight */}
          {(() => {
            const pole = qualifyingResults[0];
            const poleColor = teamColor(constructorIdFromName(pole.constructor));
            return (
              <div className="flex items-center gap-4 px-5 py-4 border-b border-border-dark" style={{ background: `linear-gradient(90deg, ${poleColor}18 0%, transparent 60%)` }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex-shrink-0">
                  <span className="text-yellow-400 font-black text-xs">P1</span>
                </div>
                <img src={driverPhotoUrl(pole.driverCode)} alt={pole.driverName} className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 2px ${poleColor}` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-black italic uppercase text-base leading-tight">{pole.driverName.split(" ").slice(-1)[0]}</p>
                  <p className="text-[10px] font-bold uppercase" style={{ color: poleColor }}>{pole.constructor}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Pole Time</p>
                  <p className="text-sm font-black tabular-nums text-primary">{pole.q3 || pole.q2 || pole.q1}</p>
                </div>
              </div>
            );
          })()}

          {/* P2–P10 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 divide-y divide-border-dark sm:divide-y-0">
            {qualifyingResults.slice(1, 10).map((q) => {
              const qColor = teamColor(constructorIdFromName(q.constructor));
              return (
                <div key={q.position} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-border-dark">
                  <span className={`text-[10px] font-black w-5 text-center flex-shrink-0 ${q.position <= 3 ? "text-primary" : "text-slate-600"}`}>
                    P{q.position}
                  </span>
                  <img src={driverPhotoUrl(q.driverCode)} alt={q.driverName} className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1.5px ${qColor}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black italic uppercase truncate">{q.driverName.split(" ").slice(-1)[0]}</p>
                    <p className="text-[9px] font-bold uppercase truncate" style={{ color: qColor }}>{q.constructor.split(" ")[0]}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 tabular-nums">{q.q3 || q.q2 || q.q1}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Driver Standings ── */}
        <div className="bg-card-dark border border-border-dark rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">emoji_events</span>
              Driver Standings
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">2026</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[480px] p-3 space-y-1 custom-scrollbar">
            {drivers.length > 0 ? drivers.map((d) => {
              const color = teamColor(constructorIdFromName(d.constructor));
              return (
                <div
                  key={d.driver.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  {/* Position */}
                  <span className="text-[11px] font-black italic text-slate-600 w-4 text-center flex-shrink-0">
                    {d.position}
                  </span>

                  {/* Driver Photo */}
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                    style={{ boxShadow: `0 0 0 2px ${color}` }}
                  >
                    <img
                      src={driverPhotoUrl(d.driver.code)}
                      alt={d.driver.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Name + Team */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase italic leading-tight truncate">
                      {d.driver.name.split(" ").slice(-1)[0]}
                    </p>
                    <p className="text-[9px] font-bold uppercase truncate" style={{ color }}>
                      {d.constructor}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black tabular-nums">{d.points}</span>
                    <span className="text-[9px] text-slate-600 ml-0.5">pts</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-slate-600 text-sm text-center py-8">Loading standings…</p>
            )}
          </div>
        </div>

        {/* ── Constructor Standings ── */}
        <div className="bg-card-dark border border-border-dark rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">construction</span>
              Constructors
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">2026</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[480px] p-4 space-y-3 custom-scrollbar">
            {constructors.length > 0 ? constructors.map((t) => {
              const color = teamColor(t.constructor.id ?? constructorIdFromName(t.constructor.name));
              const pct = Math.round((Number(t.points) / maxPts) * 100);
              return (
                <div key={t.constructor.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Team color swatch */}
                      <div
                        className="w-1 h-7 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex items-center gap-2">
                        {/* Team logo */}
                        {teamLogoUrl(t.constructor.id ?? constructorIdFromName(t.constructor.name)) && (
                          <img
                            src={teamLogoUrl(t.constructor.id ?? constructorIdFromName(t.constructor.name))!}
                            alt={t.constructor.name}
                            className="h-4 object-contain opacity-80"
                          />
                        )}
                        <div>
                          <span className="text-xs font-black uppercase italic">{t.constructor.name}</span>
                          <p className="text-[9px] text-slate-600 font-bold">
                            {t.wins} win{Number(t.wins) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black tabular-nums">{t.points}</span>
                      <span className="text-[9px] text-slate-600 ml-0.5">pts</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 6px ${color}80`,
                      }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-slate-600 text-sm text-center py-8">Loading constructors…</p>
            )}
          </div>
        </div>

        {/* ── Last Race Results ── */}
        <div className="bg-card-dark border border-border-dark rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
            <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">flag</span>
              <span className="truncate max-w-[140px]">{lastRace?.name ?? "Latest Race"}</span>
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Results</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] p-3 space-y-0.5 custom-scrollbar">
            {lastResults.length > 0 ? lastResults.map((r, i) => {
              const color = teamColor(constructorIdFromName(r.constructor));
              return (
                <div
                  key={r.driver}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {/* Position badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] flex-shrink-0 border ${positionBadgeClass(i + 1)}`}
                  >
                    P{r.position}
                  </div>

                  {/* Driver Photo */}
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                    style={{ boxShadow: `0 0 0 1.5px ${color}` }}
                  >
                    <img
                      src={driverPhotoUrl(r.driver)}
                      alt={r.driverName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Name + Team */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase italic leading-tight truncate">
                      {r.driverName.split(" ").slice(-1)[0]}
                    </p>
                    <p className="text-[9px] font-bold uppercase truncate" style={{ color }}>
                      {r.constructor}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="text-[10px] font-mono flex-shrink-0 text-slate-400 ml-1">
                    {r.time}
                  </span>
                </div>
              );
            }) : (
              <p className="text-slate-600 text-sm text-center py-8">No results yet</p>
            )}
          </div>

          {/* YouTube replay button */}
          <div className="border-t border-border-dark p-3">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 transition-all group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-lg">
                play_circle
              </span>
              <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-primary transition-colors">
                Full Race Replay on YouTube
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── F1 News Feed ── */}
      <section className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark">
          <div>
            <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">newspaper</span>
              Latest F1 News
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Live updates from the paddock</p>
          </div>
          <a
            href="https://www.formula1.com/en/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            All News
            <span className="material-symbols-outlined text-[11px]">open_in_new</span>
          </a>
        </div>
        <div className="p-5">
          <NewsCarousel articles={newsArticles} />
        </div>
      </section>

      {/* ── Subscribe CTA ── */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(224,7,0,0.06) 0%, rgba(10,10,10,0.95) 60%)' }}>
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-2">
            Never Miss a Flag
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Get email reminders 15 minutes before Qualifying, Sprint &amp; Race sessions direct to your inbox.
          </p>
          <SubscribeCTA />
        </div>
      </section>
    </div>
  );
}