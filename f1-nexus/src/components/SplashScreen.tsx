"use client";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Don't show splash on subsequent navigations — only on fresh page load
    const shown = sessionStorage.getItem("f1nexus_splash");
    if (shown) { setVisible(false); return; }
    sessionStorage.setItem("f1nexus_splash", "1");

    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const hideTimer = setTimeout(() => setVisible(false), 2800);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background-dark transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ff1500 0%, transparent 70%)" }}
        />
      </div>

      {/* Logo block */}
      <div className="relative flex flex-col items-center gap-6 animate-fade-in">
        {/* Icon */}
        <div className="relative">
          <div
            className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center"
            style={{ boxShadow: "0 0 40px rgba(255,21,0,0.5), 0 0 80px rgba(255,21,0,0.2)" }}
          >
            <span
              className="material-symbols-outlined text-white text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              speed
            </span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>

          {/* Pulse rings */}
          <div
            className="absolute inset-0 rounded-2xl animate-ping"
            style={{ border: "1px solid rgba(255,21,0,0.4)", animationDuration: "1.5s" }}
          />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 mb-1">
            Formula 1
          </p>
          <h1 className="text-5xl font-[900] tracking-tight uppercase italic leading-none text-white">
            F1 <span className="text-primary">Nexus</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mt-2">
            Analytics Platform
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full"
            style={{
              animation: "splash-load 2s ease-out forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splash-load {
          0% { width: 0%; }
          40% { width: 60%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
