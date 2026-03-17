"use client";
import { useState, useEffect, useRef } from "react";

export default function NewsTicker({ items }: { items: string[] }) {
  const [current, setCurrent] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [scrollPx, setScrollPx] = useState(0);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allItems = [...items, ...items];
  // Slower desktop speed: 2.5s per item, min 20s
  const dur = Math.max(60, items.length * 7.5);

  // Cycle through items on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setScrollPx(0); // instantly reset scroll (no transition during fade-out)
      setTimeout(() => {
        setCurrent((i) => (i + 1) % items.length);
        setTimeout(() => setOpacity(1), 50);
      }, 380);
    }, 5500);
    return () => clearInterval(interval);
  }, [items.length]);

  // After fade-in, measure overflow and start scroll if needed
  useEffect(() => {
    if (opacity !== 1) return;
    const t = setTimeout(() => {
      if (textRef.current && containerRef.current) {
        const overflow = textRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollPx(Math.max(0, overflow));
      }
    }, 300);
    return () => clearTimeout(t);
  }, [current, opacity]);

  // Transition: no transform transition while fading (instant reset); scroll transition while visible
  const transition =
    opacity === 0
      ? "opacity 0.35s ease-out"
      : scrollPx > 0
      ? "opacity 0.35s ease-in, transform 4.2s linear 0.5s"
      : "opacity 0.35s ease-in";

  return (
    <>
      {/* ── Desktop: seamless LEFT-TO-RIGHT scrolling marquee ── */}
      <div className="hidden sm:flex flex-1 overflow-hidden">
        <style>{`
          @keyframes f1ticker {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .f1-ticker { animation: f1ticker ${dur}s linear infinite; }
          .f1-ticker:hover { animation-play-state: paused; }
        `}</style>
        <div className="f1-ticker flex items-center whitespace-nowrap">
          {allItems.map((text, i) => (
            <span key={i} className="inline-flex items-center">
              <span className="text-[11px] font-black uppercase tracking-wide text-white px-5">{text}</span>
              <span className="text-[8px]" style={{ color: "#e00700" }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile: one headline at a time, scrolls if too long ── */}
      <div ref={containerRef} className="flex sm:hidden flex-1 overflow-hidden items-center px-3">
        <span
          ref={textRef}
          className="text-[11px] font-black uppercase tracking-wide text-white inline-block whitespace-nowrap"
          style={{
            opacity,
            transition,
            transform: scrollPx > 0 && opacity === 1 ? `translateX(-${scrollPx}px)` : "translateX(0)",
          }}
        >
          {items[current]}
        </span>
      </div>
    </>
  );
}
