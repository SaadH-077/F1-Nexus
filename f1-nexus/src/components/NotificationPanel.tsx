"use client";
import { useEffect, useRef, useState } from "react";
import type { NewsArticle, NextRace } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  nextRace: NextRace | null;
}

function timeSince(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return ""; }
}

function timeUntil(isoDate: string): string {
  const diff = Math.max(0, new Date(isoDate).getTime() - Date.now());
  const totalMins = Math.floor(diff / 60000);
  if (totalMins < 60) return `in ${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h < 24) return `in ${h}h ${m}m`;
  return `in ${Math.floor(h / 24)}d`;
}

const SESSION_COLORS: Record<string, string> = {
  FP1: "#94a3b8", FP2: "#94a3b8", FP3: "#94a3b8",
  Qualifying: "#60a5fa", "Sprint Qualifying": "#fb923c",
  Sprint: "#fb923c", RACE: "#ff1500",
};

const REMINDER_SESSIONS = new Set(["Qualifying", "Sprint Qualifying", "Sprint", "RACE"]);

export default function NotificationPanel({ open, onClose, articles, nextRace }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"news" | "alerts">("alerts");

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const allSessions = [
    ...(nextRace?.sessions ?? []),
    ...(nextRace ? [{ label: "RACE", date: nextRace.date }] : []),
  ].filter((s) => new Date(s.date) > new Date());

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-card-dark border border-border-dark rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark">
        <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-dark">
        {(["alerts", "news"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
              tab === t ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t === "alerts" ? "Race Alerts" : "Latest News"}
          </button>
        ))}
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {tab === "alerts" ? (
          <div className="p-3 space-y-2">
            {nextRace ? (
              <>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-1 pb-1">
                  {nextRace.raceName}
                </p>
                {allSessions.map((s, i) => {
                  const color = SESSION_COLORS[s.label] ?? "#94a3b8";
                  const isReminder = REMINDER_SESSIONS.has(s.label);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color + "20", border: `1px solid ${color}40` }}
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ color }}>
                          {s.label === "RACE" ? "flag" : s.label.startsWith("FP") ? "timer" : "speed"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase" style={{ color }}>
                          {s.label}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono">{timeUntil(s.date)}</p>
                      </div>
                      {isReminder && (
                        <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">
                          Remind
                        </span>
                      )}
                    </div>
                  );
                })}
                <p className="text-[9px] text-slate-700 text-center pt-1 italic">
                  Subscribe below to get email reminders 15 min before Qualifying & Race
                </p>
              </>
            ) : (
              <div className="text-center py-8 text-slate-600 text-sm">
                No upcoming sessions
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {articles.slice(0, 6).map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-dark">
                  {a.image ? (
                    <img src={a.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-base text-slate-600">article</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold leading-snug text-slate-200 group-hover:text-white line-clamp-2">
                    {a.title}
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{a.source} · {timeSince(a.publishedAt)}</p>
                </div>
              </a>
            ))}
            {articles.length === 0 && (
              <div className="text-center py-8 text-slate-600 text-sm">
                No news loaded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
