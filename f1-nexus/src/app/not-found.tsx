import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #e00700, transparent 70%)" }} />
      </div>

      {/* Red flag icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 mx-auto"
          style={{ boxShadow: "0 0 40px rgba(224,7,0,0.15)" }}>
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            flag
          </span>
        </div>

        {/* DNF badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-flex" />
          Race Aborted
        </div>
      </div>

      {/* Error number */}
      <h1 className="text-[clamp(6rem,20vw,14rem)] font-black italic uppercase leading-none tracking-tighter text-white/5 select-none absolute">
        404
      </h1>

      <div className="relative z-10 space-y-3 mb-10">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">
          Error 404 · Page Not Found
        </p>
        <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-none">
          DNF
        </h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mt-3">
          This page failed to qualify for the grid. It may have retired, been red-flagged, or never existed.
        </p>
      </div>

      {/* Lap time display */}
      <div className="flex items-center gap-4 mb-10 px-6 py-3 rounded-xl bg-card-dark border border-border-dark font-mono">
        <div className="text-center">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Driver</p>
          <p className="text-sm font-black text-slate-400">YOU</p>
        </div>
        <div className="w-px h-8 bg-border-dark" />
        <div className="text-center">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Lap Time</p>
          <p className="text-sm font-black text-primary">—:—-.—</p>
        </div>
        <div className="w-px h-8 bg-border-dark" />
        <div className="text-center">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Status</p>
          <p className="text-sm font-black text-red-500">RETIRED</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-sm tracking-widest transition-all"
        style={{ boxShadow: "0 0 24px rgba(224,7,0,0.3)" }}
      >
        <span className="material-symbols-outlined text-sm">garage</span>
        Return to Pit Lane
      </Link>

      <p className="text-[10px] text-slate-700 mt-6 font-bold tracking-widest uppercase">
        F1 Nexus · Formula 1 Analytics Platform
      </p>
    </div>
  );
}
