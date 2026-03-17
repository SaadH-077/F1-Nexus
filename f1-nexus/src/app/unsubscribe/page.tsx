"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function UnsubscribePage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link.");
      return;
    }
    fetch(`${API}/api/v1/subscribe/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "ok") {
          setStatus("success");
          setMessage(d.message);
        } else {
          setStatus("error");
          setMessage(d.detail ?? "Something went wrong.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the server. Please try again later.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl overflow-hidden border border-border-dark">
        {/* Header */}
        <div className="bg-[#e00700] px-8 py-7 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/60 mb-1">Formula 1</p>
          <h1 className="text-3xl font-black italic text-white tracking-tight">F1 NEXUS</h1>
          <p className="text-[10px] uppercase tracking-[2px] text-white/50 mt-1">Session Reminders</p>
        </div>

        {/* Body */}
        <div className="bg-[#111] px-8 py-8 border-x border-[#222] text-center">
          {status === "loading" && (
            <>
              <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Processing your request…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-2xl">check_circle</span>
              </div>
              <h2 className="text-white text-xl font-black uppercase italic mb-3">Unsubscribed</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{message}</p>
              <p className="text-slate-500 text-xs">You'll receive a confirmation email shortly.</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-400 text-2xl">error</span>
              </div>
              <h2 className="text-white text-xl font-black uppercase italic mb-3">Oops</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0d0d0d] px-8 py-5 border border-[#1a1a1a] border-t-0 rounded-b-2xl text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold">
            ← Return to F1 Nexus
          </Link>
        </div>
      </div>
    </div>
  );
}
