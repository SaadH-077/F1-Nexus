"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "grid_view", label: "Hub" },
  { href: "/telemetry", icon: "monitoring", label: "Telemetry" },
  { href: "/strategy", icon: "analytics", label: "Strategy" },
  { href: "/analyst", icon: "bar_chart", label: "Analyst" },
  { href: "/predictor", icon: "speed", label: "Predictor" },
  { href: "/historical", icon: "history", label: "History" },
  { href: "/paddock", icon: "explore", label: "Paddock" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-dark/95 backdrop-blur-xl border-t border-border-dark">
      <div className="w-full flex justify-around px-0.5 py-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 transition-colors min-w-0 flex-1 ${
                isActive ? "text-primary" : "text-slate-400 hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined text-base leading-none"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[7px] font-bold uppercase tracking-wide truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="text-center pb-0.5">
        <span className="text-[7px] font-bold text-slate-800 tracking-[0.2em] uppercase select-none">
          Made by Saad Haroon · F1 Nexus © 2026
        </span>
      </div>
    </div>
  );
}
