"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";

/**
 * Privacy Shield Toggle Component (Issue #463)
 * Allows users to enable "Selective Disclosure" for their streams
 * with Poseidon hash preparation for Protocol 25 (X-Ray).
 */

interface PrivacyShieldToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function PrivacyShieldToggle({
  enabled,
  onChange,
}: PrivacyShieldToggleProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-[10px] tracking-[0.12em] text-white/50 uppercase">
            Privacy Shield (P25)
          </p>
          <p className="font-body text-xs text-white/30 mt-0.5">
            Enable selective disclosure with Poseidon hashing
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onChange(!enabled)}
          className="relative h-6 w-11 rounded-full border transition-all duration-300 focus:outline-none"
          style={{
            background: enabled
              ? "linear-gradient(135deg, rgba(34,211,238,0.3), rgba(139,92,246,0.3))"
              : "rgba(255,255,255,0.06)",
            borderColor: enabled
              ? "rgba(34,211,238,0.5)"
              : "rgba(255,255,255,0.12)",
            boxShadow: enabled ? "0 0 12px rgba(34,211,238,0.2)" : "none",
          }}
        >
          <span
            className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-all duration-300 flex items-center justify-center"
            style={{
              background: enabled
                ? "linear-gradient(135deg, #22d3ee, #8b5cf6)"
                : "rgba(255,255,255,0.25)",
              transform: enabled ? "translateX(20px)" : "translateX(0)",
              boxShadow: enabled ? "0 0 8px rgba(34,211,238,0.5)" : "none",
            }}
          >
            {enabled ? (
              <Lock size={12} className="text-white" />
            ) : (
              <LockOpen size={12} className="text-white/40" />
            )}
          </span>
        </button>
      </div>

      {/* Info box when expanded */}
      {enabled && (
        <div
          className="rounded-2xl border border-indigo-400/15 bg-indigo-400/[0.03] p-4 space-y-3"
          style={{ animation: "expandDown 0.25s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <style>{`
            @keyframes expandDown {
              from { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
              to   { opacity: 1; transform: translateY(0)   scaleY(1);    }
            }
          `}</style>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-400/[0.1]">
                <span className="text-[10px] text-indigo-400">✓</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-body text-[10px] font-bold tracking-wide text-indigo-400/90 uppercase">
                Selective Disclosure Enabled
              </p>
              <p className="font-body text-xs text-indigo-300/70 leading-relaxed">
                Stream metadata will be hashed using Poseidon, a zero-knowledge optimized hash function.
                This enables Protocol 25 privacy features for selective stream data revelation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-400/[0.1]">
                <span className="text-[10px] text-indigo-400">→</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-body text-[10px] font-bold tracking-wide text-indigo-400/90 uppercase">
                ZK-Ready Badge
              </p>
              <p className="font-body text-xs text-indigo-300/70 leading-relaxed">
                Your stream card will be marked "ZK-Ready" for easy identification of privacy-enabled streams.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-400/[0.1]">
                <span className="text-[10px] text-indigo-400">🔐</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-body text-[10px] font-bold tracking-wide text-indigo-400/90 uppercase">
                X-Ray Protocol Ready
              </p>
              <p className="font-body text-xs text-indigo-300/70 leading-relaxed">
                Prepares your stream for future X-Ray protocol integration with full zero-knowledge privacy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
