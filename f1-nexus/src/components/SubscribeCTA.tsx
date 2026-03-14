"use client";
import { useState } from "react";
import SubscribeModal from "./SubscribeModal";

export default function SubscribeCTA() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
        style={{ boxShadow: "0 0 24px rgba(255,21,0,0.35)" }}
      >
        <span className="material-symbols-outlined text-base">notifications_active</span>
        Subscribe for Reminders
      </button>
      <SubscribeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
