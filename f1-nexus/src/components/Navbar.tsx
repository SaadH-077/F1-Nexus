"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getNews, getNextRace, type NewsArticle, type NextRace } from "@/lib/api";
import NotificationPanel from "./NotificationPanel";
import SubscribeModal from "./SubscribeModal";

const navLinks = [
  { href: "/", label: "Hub" },
  { href: "/telemetry", label: "Telemetry" },
  { href: "/strategy", label: "Strategy" },
  { href: "/analyst", label: "Analyst" },
  { href: "/predictor", label: "Predictor" },
  { href: "/historical", label: "Historical" },
  { href: "/paddock", label: "Paddock" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [nextRace, setNextRace] = useState<NextRace | null>(null);

  useEffect(() => {
    getNews().then(setArticles).catch(() => {});
    getNextRace().then(setNextRace).catch(() => {});
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-xl border-b border-border-dark">
        {/* Red accent stripe */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                speed
              </span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Formula 1</span>
              <h1 className="text-lg font-[900] tracking-tight uppercase italic leading-tight">
                F1 <span className="text-primary">Nexus</span>
              </h1>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Subscribe CTA */}
            <button
              onClick={() => setSubscribeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 border border-white/20 hover:bg-primary hover:border-primary transition-all group"
            >
              <span className="material-symbols-outlined text-slate-800 group-hover:text-white text-base transition-colors">notifications_active</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 group-hover:text-white transition-colors">Subscribe</span>
            </button>

            {/* Bell icon with notification panel */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  notifications
                </span>
                {articles.length > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background-dark" />
                )}
              </button>

              <NotificationPanel
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                articles={articles}
                nextRace={nextRace}
              />
            </div>
          </div>
        </div>
      </nav>

      <SubscribeModal open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </>
  );
}
