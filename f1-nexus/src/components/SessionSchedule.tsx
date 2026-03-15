"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SessionInfo, QualifyingResult, RaceResult } from "@/lib/api";
import { driverPhotoUrl, teamColor, constructorIdFromName } from "@/lib/api";

interface Props {
  sessions: SessionInfo[];
  raceDate: string;
  raceName?: string;
  qualifyingResults?: QualifyingResult[];
  sprintResults?: RaceResult[];
  sprintQualResults?: QualifyingResult[];
}

interface SessionState {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  isPast: boolean;
  isLive: boolean;
  isNext: boolean;
  totalSecs: number;
}

function calcSession(isoDate: string): Omit<SessionState, "isNext"> {
  const diff = new Date(isoDate).getTime() - Date.now();

  if (diff < -7_200_000) {
    return { days: "00", hours: "00", mins: "00", secs: "00", isPast: true, isLive: false, totalSecs: -1 };
  }
  if (diff < 0) {
    return { days: "00", hours: "00", mins: "00", secs: "00", isPast: false, isLive: true, totalSecs: 0 };
  }

  const total = Math.floor(diff / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return {
    days: String(d).padStart(2, "0"),
    hours: String(h).padStart(2, "0"),
    mins: String(m).padStart(2, "0"),
    secs: String(s).padStart(2, "0"),
    isPast: false,
    isLive: false,
    totalSecs: total,
  };
}

const SESSION_LABELS: Record<string, { short: string; icon: string; color: string }> = {
  FP1: { short: "FP1", icon: "timer", color: "#94a3b8" },
  FP2: { short: "FP2", icon: "timer", color: "#94a3b8" },
  FP3: { short: "FP3", icon: "timer", color: "#94a3b8" },
  "Sprint Qualifying": { short: "SQ", icon: "speed", color: "#f59e0b" },
  Sprint: { short: "SPR", icon: "flash_on", color: "#fb923c" },
  Qualifying: { short: "QUALI", icon: "speed", color: "#60a5fa" },
  RACE: { short: "RACE", icon: "flag", color: "#e00700" },
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function SessionSchedule({ sessions, raceDate, raceName, qualifyingResults, sprintResults, sprintQualResults }: Props) {
  const [states, setStates] = useState<SessionState[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const allSessions: SessionInfo[] = [
    ...sessions,
    { label: "RACE", date: raceDate },
  ];

  useEffect(() => {
    function recalc() {
      const raw = allSessions.map((s) => calcSession(s.date));
      let markedNext = false;
      const result: SessionState[] = raw.map((r) => {
        if (!r.isPast && !r.isLive && !markedNext) {
          markedNext = true;
          return { ...r, isNext: true };
        }
        return { ...r, isNext: false };
      });
      setStates(result);
    }
    recalc();
    const id = setInterval(recalc, 1000);
    return () => clearInterval(id);
  }, [raceDate, sessions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasQualResults = (qualifyingResults?.length ?? 0) > 0;
  const hasSprintResults = (sprintResults?.length ?? 0) > 0;
  const hasSprintQualResults = (sprintQualResults?.length ?? 0) > 0;

  return (
    <div className="space-y-1.5 mb-6">
      <p className="text-[9px] font-black uppercase text-slate-600 tracking-[0.2em] mb-3">
        Weekend Schedule
      </p>

      {allSessions.map((s, i) => {
        const st = states?.[i];
        const meta = SESSION_LABELS[s.label] ?? { short: s.label, icon: "schedule", color: "#94a3b8" };
        const isRace = s.label === "RACE";

        const showQualBtn = st?.isPast && s.label === "Qualifying" && hasQualResults;
        const showSprintBtn = st?.isPast && s.label === "Sprint" && hasSprintResults;
        const showSprintQualBtn = st?.isPast && s.label === "Sprint Qualifying" && hasSprintQualResults;
        const hasBtn = showQualBtn || showSprintBtn || showSprintQualBtn;
        const isExpanded = expanded === s.label;

        return (
          <div
            key={s.label + i}
            className={`rounded-xl border transition-all overflow-hidden ${
              st?.isLive
                ? "border-primary/40 bg-primary/5"
                : st?.isNext
                ? "border-white/10 bg-white/[0.03]"
                : hasBtn
                ? "border-white/8 bg-white/[0.025] opacity-100"
                : st?.isPast
                ? "border-transparent bg-transparent opacity-35"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              {/* Session label + icon */}
              <div className="flex items-center gap-1.5 w-20 flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[13px]"
                  style={{ color: st?.isPast && !hasBtn ? "#374151" : meta.color }}
                >
                  {meta.icon}
                </span>
                <span
                  className="text-[10px] font-black uppercase tracking-wide"
                  style={{ color: st?.isPast && !hasBtn ? "#374151" : isRace ? "#e00700" : meta.color }}
                >
                  {meta.short}
                </span>
                {st?.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping flex-shrink-0" />
                )}
              </div>

              {/* Date */}
              <span className="text-[9px] font-mono text-slate-600 flex-1 hidden sm:block">
                {fmt(s.date)}
              </span>

              {/* Countdown boxes, status, or View Results */}
              {st?.isLive ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping flex-shrink-0" />
                  <span className="text-[10px] font-black text-primary animate-pulse uppercase tracking-widest">
                    Live Now
                  </span>
                  <Link
                    href="/live"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    style={{ background: "rgba(224,7,0,0.18)", color: "#e00700", border: "1px solid rgba(224,7,0,0.4)" }}
                  >
                    <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                    Watch Live
                  </Link>
                </div>
              ) : hasBtn ? (
                <button
                  onClick={() => setExpanded(isExpanded ? null : s.label)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex-shrink-0"
                  style={{
                    background: isExpanded ? "rgba(224,7,0,0.15)" : "rgba(255,255,255,0.05)",
                    color: isExpanded ? "#e00700" : "#94a3b8",
                    border: isExpanded ? "1px solid rgba(224,7,0,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="material-symbols-outlined text-[11px]">
                    {isExpanded ? "expand_less" : "format_list_numbered"}
                  </span>
                  {isExpanded ? "Hide" : "Results"}
                </button>
              ) : st?.isPast ? (
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                    Completed
                  </span>
                </div>
              ) : (
                /* Mini countdown boxes */
                <div className="flex items-center gap-1 flex-shrink-0">
                  {st && st.days !== "00" && (
                    <>
                      <MiniBox value={st?.days ?? "--"} label="D" highlight={isRace} />
                      <span className="text-slate-700 text-[10px] font-black">:</span>
                    </>
                  )}
                  <MiniBox value={st?.hours ?? "--"} label="H" highlight={isRace} />
                  <span className="text-slate-700 text-[10px] font-black">:</span>
                  <MiniBox value={st?.mins ?? "--"} label="M" highlight={isRace} />
                  <span className="text-slate-700 text-[10px] font-black">:</span>
                  <MiniBox value={st?.secs ?? "--"} label="S" highlight={isRace} isSeconds />
                </div>
              )}
            </div>

            {/* Expanded qualifying results */}
            {isExpanded && showQualBtn && qualifyingResults && qualifyingResults.length > 0 && (() => {
              const pole = qualifyingResults[0];
              const poleColor = teamColor(constructorIdFromName(pole.constructor));
              return (
                <div className="border-t border-white/5 pt-3 pb-2">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span className="material-symbols-outlined text-[11px]" style={{ color: "#60a5fa" }}>speed</span>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#60a5fa" }}>Race Qualifying</p>
                    <span className="text-[8px] text-slate-700 ml-1">· determines race starting grid</span>
                  </div>
                  <div className="flex items-center gap-3 mx-3 mb-2 px-3 py-2.5 rounded-xl" style={{ background: `linear-gradient(90deg, ${poleColor}22 0%, rgba(255,255,255,0.03) 100%)`, border: `1px solid ${poleColor}33` }}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0" style={{ background: "rgba(234,179,8,0.2)", border: "1.5px solid rgba(234,179,8,0.5)" }}>
                      <span className="material-symbols-outlined text-yellow-400 text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    </div>
                    <img src={driverPhotoUrl(pole.driverCode)} alt={pole.driverName} className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1.5px ${poleColor}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black italic uppercase leading-tight text-white truncate">{pole.driverName.split(" ").slice(-1)[0]}</p>
                      <p className="text-[9px] font-bold uppercase truncate" style={{ color: poleColor }}>{pole.constructor.split(" ")[0]}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Pole · Q3</p>
                      <p className="text-[11px] font-black tabular-nums text-primary">{pole.q3 || pole.q2 || pole.q1}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    {qualifyingResults.slice(1, 10).map((q) => {
                      const qColor = teamColor(constructorIdFromName(q.constructor));
                      return (
                        <div key={q.position} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04] last:border-0">
                          <span className={`text-[10px] font-black w-5 text-center flex-shrink-0 tabular-nums ${q.position <= 3 ? "text-orange-400" : "text-slate-600"}`}>P{q.position}</span>
                          <img src={driverPhotoUrl(q.driverCode)} alt={q.driverName} className="w-5 h-5 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1px ${qColor}` }} />
                          <span className="flex-1 text-[10px] font-black italic uppercase truncate text-slate-200">{q.driverName.split(" ").slice(-1)[0]}</span>
                          <span className="text-[9px] font-mono text-slate-500 tabular-nums flex-shrink-0">{q.q3 || q.q2 || q.q1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Expanded sprint qualifying results */}
            {isExpanded && showSprintQualBtn && sprintQualResults && sprintQualResults.length > 0 && (() => {
              const pole = sprintQualResults[0];
              const poleColor = teamColor(constructorIdFromName(pole.constructor));
              return (
                <div className="border-t border-white/5 pt-3 pb-2">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span className="material-symbols-outlined text-[11px]" style={{ color: "#f59e0b" }}>speed</span>
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>Sprint Qualifying</p>
                    <span className="text-[8px] text-slate-700 ml-1">· sprint race starting grid</span>
                  </div>
                  <div className="flex items-center gap-3 mx-3 mb-2 px-3 py-2.5 rounded-xl" style={{ background: `linear-gradient(90deg, ${poleColor}22 0%, rgba(255,255,255,0.03) 100%)`, border: `1px solid ${poleColor}33` }}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0" style={{ background: "rgba(234,179,8,0.2)", border: "1.5px solid rgba(234,179,8,0.5)" }}>
                      <span className="material-symbols-outlined text-yellow-400 text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    </div>
                    <img src={driverPhotoUrl(pole.driverCode)} alt={pole.driverName} className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1.5px ${poleColor}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black italic uppercase leading-tight text-white truncate">{pole.driverName.split(" ").slice(-1)[0]}</p>
                      <p className="text-[9px] font-bold uppercase truncate" style={{ color: poleColor }}>{pole.constructor.split(" ")[0]}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Sprint Pole</p>
                      <p className="text-[11px] font-black tabular-nums" style={{ color: "#f59e0b" }}>P1</p>
                    </div>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 px-3 mb-1.5">Sprint Starting Grid</p>
                  <div className="grid grid-cols-2">
                    {sprintQualResults.slice(1, 10).map((q) => {
                      const qColor = teamColor(constructorIdFromName(q.constructor));
                      return (
                        <div key={q.position} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04] last:border-0">
                          <span className={`text-[10px] font-black w-5 text-center flex-shrink-0 tabular-nums ${q.position <= 3 ? "text-orange-400" : "text-slate-600"}`}>P{q.position}</span>
                          <img src={driverPhotoUrl(q.driverCode)} alt={q.driverName} className="w-5 h-5 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1px ${qColor}` }} />
                          <span className="flex-1 text-[10px] font-black italic uppercase truncate text-slate-200">{q.driverName.split(" ").slice(-1)[0]}</span>
                          <span className="text-[9px] font-bold uppercase text-slate-600 flex-shrink-0" style={{ color: qColor }}>{q.constructor.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Expanded sprint results */}
            {isExpanded && showSprintBtn && sprintResults && (() => {
              const winner = sprintResults[0];
              const winnerColor = teamColor(constructorIdFromName(winner.constructor));
              return (
                <div className="border-t border-white/5 pt-3 pb-2">
                  {/* Winner spotlight */}
                  <div className="flex items-center gap-3 mx-3 mb-2 px-3 py-2.5 rounded-xl" style={{ background: `linear-gradient(90deg, ${winnerColor}22 0%, rgba(255,255,255,0.03) 100%)`, border: `1px solid ${winnerColor}33` }}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0" style={{ background: "rgba(234,179,8,0.2)", border: "1.5px solid rgba(234,179,8,0.5)" }}>
                      <span className="material-symbols-outlined text-yellow-400 text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                    </div>
                    <img src={driverPhotoUrl(winner.driver)} alt={winner.driverName} className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1.5px ${winnerColor}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black italic uppercase leading-tight text-white truncate">{winner.driverName.split(" ").slice(-1)[0]}</p>
                      <p className="text-[9px] font-bold uppercase truncate" style={{ color: winnerColor }}>{winner.constructor.split(" ")[0]}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Winner</p>
                      <p className="text-[11px] font-black tabular-nums text-primary">{winner.time}</p>
                    </div>
                  </div>
                  {/* P2–P8 */}
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 px-3 mb-1.5">Sprint Results</p>
                  <div className="grid grid-cols-2">
                    {sprintResults.slice(1, 8).map((r) => {
                      const rColor = teamColor(constructorIdFromName(r.constructor));
                      return (
                        <div key={r.driver} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04] last:border-0">
                          <span className={`text-[10px] font-black w-5 text-center flex-shrink-0 tabular-nums ${Number(r.position) <= 3 ? "text-orange-400" : "text-slate-600"}`}>
                            P{r.position}
                          </span>
                          <img src={driverPhotoUrl(r.driver)} alt={r.driverName} className="w-5 h-5 rounded-full object-cover object-top flex-shrink-0" style={{ boxShadow: `0 0 0 1px ${rColor}` }} />
                          <span className="flex-1 text-[10px] font-black italic uppercase truncate text-slate-200">
                            {r.driverName.split(" ").slice(-1)[0]}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 tabular-nums flex-shrink-0">{r.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}

      {raceName && (
        <p className="text-[8px] text-slate-700 mt-2 uppercase tracking-widest text-center">
          Times shown in your local timezone
        </p>
      )}
    </div>
  );
}

function MiniBox({
  value,
  label,
  highlight,
  isSeconds,
}: {
  value: string;
  label: string;
  highlight?: boolean;
  isSeconds?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`w-7 h-6 flex items-center justify-center rounded text-[11px] font-black tabular-nums ${
          highlight && isSeconds
            ? "bg-primary/15 text-primary"
            : highlight
            ? "bg-white/5 text-white"
            : isSeconds
            ? "bg-primary/10 text-primary/70"
            : "bg-white/5 text-slate-300"
        }`}
      >
        {value}
      </div>
      <span className={`text-[7px] font-bold uppercase block mt-0.5 ${
        highlight ? "text-primary/50" : "text-slate-700"
      }`}>
        {label}
      </span>
    </div>
  );
}
