"use client";
import { useEffect, useState } from "react";

interface Props {
  targetDate: string; // ISO string
}

interface TimeLeft {
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

function calculate(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  const d = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return {
    days: String(d).padStart(2, "0"),
    hours: String(h).padStart(2, "0"),
    mins: String(m).padStart(2, "0"),
    secs: String(s).padStart(2, "0"),
  };
}

const labels = ["DAYS", "HOURS", "MINS", "SECS"];

export default function Countdown({ targetDate }: Props) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    setTime(calculate(target));
    const id = setInterval(() => setTime(calculate(target)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!time) {
    return (
      <div className="flex gap-3 mb-6">
        {labels.map((label) => (
          <div key={label} className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-background-dark border border-border-dark rounded-xl text-xl md:text-3xl font-black text-slate-700 tabular-nums">
              --
            </div>
            <span className="text-[9px] uppercase font-black mt-1.5 block text-slate-600 tracking-widest">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: time.days, label: "DAYS", highlight: false },
    { value: time.hours, label: "HOURS", highlight: false },
    { value: time.mins, label: "MINS", highlight: false },
    { value: time.secs, label: "SECS", highlight: true },
  ];

  return (
    <div className="flex gap-3 mb-6">
      {units.map((item, i) => (
        <div key={item.label} className="text-center">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl text-2xl md:text-3xl font-black tabular-nums relative overflow-hidden ${
              item.highlight
                ? "bg-primary/10 border border-primary/40 text-primary"
                : "bg-background-dark border border-border-dark text-white"
            }`}
          >
            {/* Subtle grid texture */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
                backgroundSize: "8px 8px",
              }}
            />
            {item.highlight && (
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            )}
            <span className="relative">{item.value}</span>
          </div>
          <span
            className={`text-[9px] uppercase font-black mt-1.5 block tracking-widest ${
              item.highlight ? "text-primary" : "text-slate-500"
            }`}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
