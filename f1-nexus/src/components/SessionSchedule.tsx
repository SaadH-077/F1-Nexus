"use client";
import { useEffect, useState } from "react";
import type { SessionInfo, QualifyingResult, RaceResult } from "@/lib/api";

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
  "Sprint Qualifying": { short: "SQ", icon: "speed", color: "#fb923c" },
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[10px] font-black text-primary animate-pulse uppercase tracking-widest">
                    Live Now
                  </span>
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
            {isExpanded && showQualBtn && qualifyingResults && (
              <div className="border-t border-white/5 px-3 pb-3 pt-2 space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-2">Starting Grid</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {qualifyingResults.slice(0, 10).map((q) => (
                    <div key={q.position} className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black w-4 text-center flex-shrink-0 tabular-nums ${
                        q.position === 1 ? "text-yellow-400" : q.position <= 3 ? "text-orange-400" : "text-slate-600"
                      }`}>
                        P{q.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black italic uppercase truncate block">
                          {q.driverName.split(" ").slice(-1)[0]}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 flex-shrink-0 tabular-nums">
                        {q.q3 || q.q2 || q.q1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expanded sprint qualifying results */}
            {isExpanded && showSprintQualBtn && sprintQualResults && (
              <div className="border-t border-white/5 px-3 pb-3 pt-2 space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-2">Sprint Starting Grid</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {sprintQualResults.slice(0, 10).map((q) => (
                    <div key={q.position} className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black w-4 text-center flex-shrink-0 tabular-nums ${
                        q.position === 1 ? "text-yellow-400" : q.position <= 3 ? "text-orange-400" : "text-slate-600"
                      }`}>
                        P{q.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black italic uppercase truncate block">
                          {q.driverName.split(" ").slice(-1)[0]}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 flex-shrink-0 tabular-nums">
                        {q.q3 || q.q2 || q.q1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expanded sprint results */}
            {isExpanded && showSprintBtn && sprintResults && (
              <div className="border-t border-white/5 px-3 pb-3 pt-2 space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-2">Sprint Results</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {sprintResults.slice(0, 8).map((r, idx) => (
                    <div key={r.driver} className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black w-4 text-center flex-shrink-0 tabular-nums ${
                        idx === 0 ? "text-yellow-400" : idx < 3 ? "text-orange-400" : "text-slate-600"
                      }`}>
                        P{r.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black italic uppercase truncate block">
                          {r.driverName.split(" ").slice(-1)[0]}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 flex-shrink-0 tabular-nums">
                        {r.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
