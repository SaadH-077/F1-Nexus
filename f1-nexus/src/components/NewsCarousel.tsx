"use client";
import { useEffect, useRef, useState } from "react";
import type { NewsArticle } from "@/lib/api";

interface Props {
  articles: NewsArticle[];
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

const SOURCE_COLORS: Record<string, string> = {
  "Motorsport.com": "#e00700",
  "The Race": "#f97316",
  "Autosport": "#3b82f6",
};

export default function NewsCarousel({ articles }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const dragDelta = useRef(0);

  const total = articles.length;

  function scrollTo(idx: number) {
    const clamped = Math.max(0, Math.min(total - 1, idx));
    setCurrent(clamped);
    if (trackRef.current) {
      const child = trackRef.current.children[clamped] as HTMLElement;
      if (child) child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  // Touch/mouse drag
  function onPointerDown(e: React.PointerEvent) {
    setIsDragging(false);
    dragStart.current = e.clientX;
    dragDelta.current = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    dragDelta.current = e.clientX - dragStart.current;
    if (Math.abs(dragDelta.current) > 5) setIsDragging(true);
  }
  function onPointerUp() {
    if (Math.abs(dragDelta.current) > 50) {
      scrollTo(dragDelta.current < 0 ? current + 1 : current - 1);
    }
    dragDelta.current = 0;
  }

  function onScroll() {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const firstChild = track.children[0] as HTMLElement | null;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth + 16; // 16 = gap-4
    const idx = Math.round(track.scrollLeft / cardWidth);
    setCurrent(Math.max(0, Math.min(total - 1, idx)));
  }

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
        <span className="material-symbols-outlined mr-2">wifi_off</span>
        No news available
      </div>
    );
  }

  return (
    <div className="relative select-none">
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 custom-scrollbar"
        style={{ scrollbarWidth: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onScroll={onScroll}
      >
        {articles.map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (isDragging) e.preventDefault(); }}
            className="snap-start flex-shrink-0 w-[280px] md:w-[320px] bg-card-dark border border-border-dark rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.02] transition-all group"
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden bg-neutral-dark">
              {a.image ? (
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center carbon-pattern">
                  <span className="material-symbols-outlined text-4xl text-slate-700">article</span>
                </div>
              )}
              {/* Source badge */}
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest text-white"
                style={{ backgroundColor: SOURCE_COLORS[a.source] ?? "#e00700" }}
              >
                {a.source}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
              <h3 className="text-[13px] font-black uppercase italic leading-snug text-white line-clamp-2 group-hover:text-primary transition-colors">
                {a.title}
              </h3>
              {a.description && (
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {a.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-slate-600 font-mono">
                  {timeSince(a.publishedAt)}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-primary transition-colors flex items-center gap-1">
                  Read
                  <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Nav dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {articles.slice(0, Math.min(total, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-4 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-white/10 hover:bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
