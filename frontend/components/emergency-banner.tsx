"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, X, Clock } from "lucide-react";
import { useProtocolStatus } from "@/lib/use-protocol-status";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
    const ms = Date.now() - date.getTime();
    const m = Math.floor(ms / 60_000);
    const h = Math.floor(ms / 3_600_000);
    if (h > 0) return `${h}h ${m % 60}m ago`;
    if (m > 0) return `${m}m ago`;
    return "just now";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmergencyBanner() {
    const { isEmergency, emergencyReason, emergencyDetectedAt } = useProtocolStatus();
    const [dismissed, setDismissed] = useState(false);
    const [tick, setTick] = useState(0);

    // Refresh the "X ago" timestamp every minute
    useEffect(() => {
        if (!isEmergency) return;
        const id = setInterval(() => setTick((t) => t + 1), 60_000);
        return () => clearInterval(id);
    }, [isEmergency]);

    // Un-dismiss if emergency state is re-detected (e.g. after a clear + re-pause)
    useEffect(() => {
        if (isEmergency) setDismissed(false);
    }, [isEmergency, emergencyDetectedAt]);

    if (!isEmergency || dismissed) return null;

    return (
        <>
            {/* ── Animated top border pulse ── */}
            <div
                aria-hidden
                className="fixed top-0 inset-x-0 h-[2px] z-[60]"
                style={{
                    background: "linear-gradient(90deg, transparent, #ef4444, #f97316, #ef4444, transparent)",
                    animation: "emergencyPulse 2s ease-in-out infinite",
                }}
            />

            {/* ── Banner ── */}
            <div
                role="alert"
                aria-live="assertive"
                className="fixed top-[2px] inset-x-0 z-50 flex items-center gap-3 px-4 py-3 md:py-2.5"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.18) 50%, rgba(239,68,68,0.12) 100%)",
                    borderBottom: "1px solid rgba(239,68,68,0.35)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 4px 32px rgba(239,68,68,0.15), inset 0 -1px 0 rgba(239,68,68,0.2)",
                }}
            >
                {/* Icon */}
                <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
                    <ShieldAlert
                        size={15}
                        className="text-red-400"
                        style={{ animation: "emergencyIconPulse 1.5s ease-in-out infinite" }}
                    />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-body text-xs font-bold tracking-wider text-red-300 uppercase whitespace-nowrap">
                        ⚠ Emergency Mode Active
                    </span>
                    <span className="hidden sm:block h-3 w-px bg-red-500/30 flex-shrink-0" />
                    <span className="font-body text-xs text-red-200/70 leading-snug truncate">
                        {emergencyReason ?? "Protocol paused by guardian — all funds are safe and unaffected."}
                    </span>
                </div>

                {/* Detected timestamp */}
                {emergencyDetectedAt && (
                    <div className="hidden md:flex items-center gap-1 flex-shrink-0 text-[11px] text-red-400/50">
                        <Clock size={10} />
                        <span key={tick}>{timeAgo(emergencyDetectedAt)}</span>
                    </div>
                )}

                {/* Dismiss */}
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss emergency banner"
                    className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-red-400/50 hover:text-red-300 hover:bg-red-500/15 transition-colors ml-1"
                >
                    <X size={13} />
                </button>
            </div>

            {/* ── Push page content down so banner doesn't overlap ── */}
            <div className="h-[46px] md:h-[42px]" aria-hidden />

            {/* ── Keyframes ── */}
            <style>{`
        @keyframes emergencyPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1;   }
        }
        @keyframes emergencyIconPulse {
          0%, 100% { transform: scale(1);    opacity: 1;   }
          50%       { transform: scale(1.15); opacity: 0.75; }
        }
      `}</style>
        </>
    );
}