"use client";
import { useEffect, useRef, useState } from "react";
import { subscribeEmail } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) { setStatus("idle"); setName(""); setEmail(""); setMessage(""); }
  }, [open]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStatus("loading");
    try {
      const res = await subscribeEmail(name.trim(), email.trim());
      if (res.status === "ok") {
        setStatus("success");
        setMessage(res.message);
      } else {
        setStatus("error");
        setMessage(res.message ?? "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect to server");
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <div
        className="w-full max-w-md bg-card-dark border border-border-dark rounded-2xl overflow-hidden animate-slide-up"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,21,0,0.08)" }}
      >
        {/* Header / Logo */}
        <div className="relative bg-gradient-to-br from-primary via-red-700 to-red-900 px-8 py-8 text-center overflow-hidden">
          <div className="absolute inset-0 carbon-texture opacity-30" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-4 backdrop-blur-sm border border-white/20">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                speed
              </span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 mb-1">Formula 1</p>
            <h2 className="text-2xl font-[900] italic uppercase tracking-tight text-white leading-none">
              F1 <span className="text-white/80">Nexus</span>
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
              </div>
              <h3 className="text-lg font-black italic uppercase text-white mb-2">You&apos;re In!</h3>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-black italic uppercase text-white leading-tight mb-1">
                  Get Race Reminders
                </h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Receive an email 15 minutes before Qualifying, Sprint, and Race sessions so you never miss a flag.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Max Verstappen"
                    className="w-full bg-background-dark border border-border-dark focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-background-dark border border-border-dark focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                    required
                  />
                </div>

                {status === "error" && (
                  <p className="text-primary text-xs font-bold">{message}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ boxShadow: "0 0 20px rgba(255,21,0,0.3)" }}
                  >
                    {status === "loading" ? (
                      <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">notifications_active</span>
                        Subscribe
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-slate-700 text-center pt-1">
                  No spam. Only session reminders. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
