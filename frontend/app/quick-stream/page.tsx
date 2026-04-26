"use client";

/**
 * app/quick-stream/page.tsx
 * Issue #159 — Mobile-Optimized "Quick-Stream" View
 * Design Pattern: The Glass Dock
 *
 * Follows StellarStream design system:
 * - Colors: #00f5ff (cyan), #8a00ff (violet), #030303 (bg)
 * - Fonts: font-heading (Lato), font-body (Poppins), font-ticker (Plus Jakarta Sans)
 * - Cards: rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl
 * - Uses: nebula-blob, liquid-chrome, animate-pulse-border, neon-glow from globals.css
 */

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stream {
  id: string;
  name: string;
  token: string;
  status: "active" | "paused" | "ended";
  totalAmount: number;
  streamed: number;
  ratePerSecond: number;
  yieldEarned: number;
  sender: string;
  recipient: string;
  endTime: Date;
}

// ─── Mock Data (replace with Zustand store / Soroban-Client hooks) ────────────

const ACTIVE_STREAMS: Stream[] = [
  {
    id: "0x4a3b…f91c",
    name: "DAO Treasury → Dev Fund",
    token: "USDC",
    status: "active",
    totalAmount: 120_000,
    streamed: 37_500,
    ratePerSecond: 0.03858,
    yieldEarned: 842.17,
    sender: "0xDAO1…3a2f",
    recipient: "0xDev9…7bc1",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 48),
  },
  {
    id: "0x9c2d…a44e",
    name: "Payroll → Alice",
    token: "USDC",
    status: "active",
    totalAmount: 8_000,
    streamed: 3_200,
    ratePerSecond: 0.00925,
    yieldEarned: 18.42,
    sender: "0xHR01…cc2a",
    recipient: "0xAlic…9f3b",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
  },
  {
    id: "0x7f1a…b33d",
    name: "Grant → Research",
    token: "USDC",
    status: "paused",
    totalAmount: 50_000,
    streamed: 12_000,
    ratePerSecond: 0,
    yieldEarned: 231.88,
    sender: "0xFnd2…1ea9",
    recipient: "0xRsch…4dc7",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const daysLeft = (d: Date) =>
  Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));

// ─── Live Counter ─────────────────────────────────────────────────────────────

function LiveCounter({ base, rate }: { base: number; rate: number }) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    if (rate === 0) return;
    const id = setInterval(() => setVal((v) => v + rate * 0.1), 100);
    return () => clearInterval(id);
  }, [rate]);
  return <>{fmt(val)}</>;
}

// ─── Stream Card ──────────────────────────────────────────────────────────────

function StreamCard({ stream }: { stream: Stream }) {
  const pct = (stream.streamed / stream.totalAmount) * 100;
  const isActive = stream.status === "active";

  return (
    <div
      className={`rounded-3xl border bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-300 ${
        isActive ? "border-cyan-500/25 animate-pulse-border" : "border-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-body text-[10px] tracking-[0.14em] text-white/35 uppercase mb-0.5">
            {stream.id}
          </p>
          <h3 className="font-heading text-lg text-white leading-snug truncate">
            {stream.name}
          </h3>
        </div>
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 flex-shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 flex-shrink-0 rounded-full border border-orange-400/30 bg-orange-400/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-orange-400 uppercase">
            ⏸ Paused
          </span>
        )}
      </div>

      {/* Live ticking amount */}
      <div className="mb-4">
        <p className="font-body text-[10px] tracking-widest text-white/35 uppercase mb-1">Streamed</p>
        <div className="font-ticker text-3xl font-bold tabular-nums leading-none" style={{ color: "#00f5ff" }}>
          <LiveCounter base={stream.streamed} rate={stream.ratePerSecond} />
          <span className="font-body text-sm font-normal text-white/25 ml-1.5">{stream.token}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between font-body text-[10px] text-white/30 mb-1.5">
          <span>{pct.toFixed(1)}% complete</span>
          <span className="tabular-nums">{fmt(stream.totalAmount, 0)} {stream.token}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: isActive
                ? "linear-gradient(90deg, #00f5ff, #8a00ff)"
                : "linear-gradient(90deg, #ffb300, #ff6b00)",
              boxShadow: isActive ? "0 0 10px rgba(0,245,255,0.4)" : "none",
            }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Rate/sec",  value: stream.ratePerSecond.toFixed(5) },
          { label: "Yield ◈",   value: fmt(stream.yieldEarned) },
          { label: "Days left", value: `${daysLeft(stream.endTime)}d` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
            <p className="font-body text-[9px] tracking-widest text-white/25 uppercase">{s.label}</p>
            <p className="font-ticker text-xs font-bold text-white/65 mt-0.5 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Participants */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 min-w-0">
          <p className="font-body text-[9px] tracking-widest text-white/20 uppercase">From</p>
          <p className="font-ticker text-xs text-white/50 truncate mt-0.5">{stream.sender}</p>
        </div>
        <span className="text-white/15 text-sm flex-shrink-0">→</span>
        <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 min-w-0">
          <p className="font-body text-[9px] tracking-widest text-white/20 uppercase">To</p>
          <p className="font-ticker text-xs text-white/50 truncate mt-0.5">{stream.recipient}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isActive ? (
          <button className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 font-body text-xs text-white/45 transition hover:bg-white/[0.08] hover:text-white/70">
            ⏸ Pause
          </button>
        ) : (
          <button className="flex-1 rounded-xl border border-cyan-500/20 bg-cyan-500/5 py-2.5 font-body text-xs text-cyan-400 transition hover:bg-cyan-500/10">
            ▶ Resume
          </button>
        )}
        <button
          className="flex-1 rounded-xl py-2.5 font-body text-xs font-bold text-black transition hover:opacity-90 neon-glow"
          style={{ background: "#00f5ff" }}
        >
          ↑ Withdraw
        </button>
      </div>
    </div>
  );
}

// ─── Glass Dock ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "streams",    label: "Streams",    icon: "〜" },
  { id: "create",     label: "Create",     icon: "+" },
  { id: "governance", label: "Vote",       icon: "⬡", badge: 2 },
  { id: "wallet",     label: "Wallet",     icon: "◎" },
];

function GlassDock({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4">
      <div
        className="mx-auto max-w-[440px] flex items-center justify-around rounded-t-[28px] border border-white/10 relative overflow-hidden"
        style={{
          background: "rgba(3,3,3,0.88)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          paddingTop: 12,
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -1px 0 rgba(0,245,255,0.10), 0 -24px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Cyan shimmer top edge */}
        <div
          className="absolute top-0 pointer-events-none h-px"
          style={{
            left: "15%", right: "15%",
            background: "linear-gradient(to right, transparent, rgba(0,245,255,0.5), transparent)",
          }}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex flex-col items-center gap-1 flex-1 py-1 bg-transparent border-none outline-none cursor-pointer active:scale-90 transition-transform duration-100"
            >
              <div
                className="relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 text-lg"
                style={{
                  background: isActive ? "rgba(0,245,255,0.10)" : "transparent",
                  boxShadow: isActive
                    ? "0 0 0 1px rgba(0,245,255,0.20), 0 0 20px rgba(0,245,255,0.12)"
                    : "none",
                  color: isActive ? "#00f5ff" : "rgba(255,255,255,0.25)",
                }}
              >
                {item.icon}
                {item.badge && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center font-body font-bold text-black"
                    style={{ fontSize: 9, background: "#00f5ff" }}
                  >
                    {item.badge}
                  </div>
                )}
              </div>
              <span
                className="font-body text-[9.5px] font-medium tracking-wide transition-colors duration-200"
                style={{ color: isActive ? "#00f5ff" : "rgba(255,255,255,0.22)" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuickStreamPage() {
  const [activeNav, setActiveNav] = useState("streams");
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const atTop = (scrollRef.current?.scrollTop ?? 1) === 0;
    if (dy > 70 && atTop && !refreshing) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1400); // TODO: real refetch
    }
  };

  const activeStreams = ACTIVE_STREAMS.filter((s) => s.status === "active");
  const totalPerDay = activeStreams.reduce((acc, s) => acc + s.ratePerSecond * 86400, 0);

  return (
    <div className="relative min-h-dvh overflow-x-hidden" style={{ background: "#030303" }}>

      {/* Nebula blobs — same as landing page */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="nebula-blob nebula-cyan" />
        <div className="nebula-blob nebula-violet" />
      </div>

      {/* Scroll area */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 overflow-y-auto h-dvh mx-auto max-w-[440px]"
        style={{ padding: "0 16px 120px" }}
      >

        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between"
          style={{
            padding: "48px 0 16px",
            background: "linear-gradient(to bottom, #030303 55%, transparent)",
          }}
        >
          <div>
            <p className="font-body text-[10px] tracking-[0.18em] uppercase text-white/30">
              StellarStream
            </p>
            <h1 className="font-heading text-[26px] mt-0.5 liquid-chrome">Quick-Stream</h1>
          </div>
          <button className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-white/5 font-body text-xs text-cyan-400 font-semibold transition hover:border-cyan-500/50 group overflow-hidden">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-cyan-500 rounded-full group-hover:w-32 group-hover:h-32 opacity-10" />
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <span className="relative">Connected</span>
          </button>
        </div>

        {/* Pull-to-refresh */}
        <div
          className="flex items-center justify-center gap-1.5 pb-4 font-body text-[11px] tracking-wider"
          style={{ color: "rgba(0,245,255,0.30)" }}
        >
          <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>
            {refreshing ? "↻" : "↓"}
          </span>
          {refreshing ? "refreshing…" : "pull to refresh"}
        </div>

        {/* Overview stats */}
        <p className="font-body text-[10px] tracking-[0.18em] uppercase text-white/30 mb-3">Overview</p>
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { label: "Active",    value: `${activeStreams.length}`,      color: "#00f5ff" },
            { label: "Paused",    value: `${ACTIVE_STREAMS.length - activeStreams.length}`, color: "#ffb300" },
            { label: "Streams",   value: `${ACTIVE_STREAMS.length}`,    color: "#8a00ff" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-3 py-4 text-center"
            >
              <p
                className="font-ticker text-2xl font-bold tabular-nums leading-none"
                style={{ color: s.color, textShadow: `0 0 20px ${s.color}55` }}
              >
                {s.value}
              </p>
              <p className="font-body text-[9.5px] uppercase tracking-widest text-white/25 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Total streaming ticker */}
        <div
          className="rounded-3xl border border-cyan-500/15 bg-white/[0.03] backdrop-blur-xl p-5 mb-6"
          style={{ boxShadow: "0 0 40px rgba(0,245,255,0.04)" }}
        >
          <p className="font-body text-[10px] tracking-[0.18em] uppercase text-white/30 mb-1">
            Total Streaming Today
          </p>
          <div className="font-ticker text-4xl font-bold tabular-nums leading-none" style={{ color: "#00f5ff" }}>
            {fmt(totalPerDay, 0)}
            <span className="font-body text-sm font-normal text-white/25 ml-2">USDC / day</span>
          </div>
          <div
            className="mt-3 h-px w-full"
            style={{ background: "linear-gradient(to right, rgba(0,245,255,0.25), rgba(138,0,255,0.25), transparent)" }}
          />
          <div className="flex justify-between mt-2">
            <span className="font-body text-[10px] text-white/20">{activeStreams.length} active streams</span>
            <span className="font-body text-[10px] text-white/20">8.2% APY yield ◈</span>
          </div>
        </div>

        {/* Stream cards */}
        <p className="font-body text-[10px] tracking-[0.18em] uppercase text-white/30 mb-3">Your Streams</p>
        <div className="space-y-3">
          {ACTIVE_STREAMS.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>

        {/* New stream CTA */}
        <button
          onClick={() => setActiveNav("create")}
          className="w-full mt-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-5 font-body text-sm text-white/20 transition hover:border-cyan-500/20 hover:text-cyan-400/40 hover:bg-cyan-500/[0.03]"
        >
          + New Stream
        </button>

      </div>

      {/* Glass Dock */}
      <GlassDock active={activeNav} onSelect={setActiveNav} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
