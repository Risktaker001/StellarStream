"use client";

import { Zap } from "lucide-react";
import { useState } from "react";

/**
 * Gasless Status Badge Component (Issue #473)
 * Displays "0 XLM Fee" indicator when signature-auth is used
 * Includes tooltip explaining resource fee coverage
 */

interface GaslessStatusBadgeProps {
  showTooltip?: boolean;
  className?: string;
}

export default function GaslessStatusBadge({
  showTooltip = true,
  className = "",
}: GaslessStatusBadgeProps) {
  const [showTooltipBox, setShowTooltipBox] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltipBox(true)}
        onMouseLeave={() => setShowTooltipBox(false)}
        onClick={() => setShowTooltipBox(!showTooltipBox)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 font-body text-xs font-bold tracking-wider text-emerald-400 transition-all duration-200 hover:border-emerald-400/60 hover:bg-emerald-400/[0.15] ${className}`}
        style={{
          boxShadow: "0 0 8px rgba(52,211,153,0.15), inset 0 0 8px rgba(52,211,153,0.05)"
        }}
      >
        <Zap size={14} className="text-emerald-400" />
        <span>Free Transaction</span>
      </button>

      {/* Tooltip */}
      {showTooltip && showTooltipBox && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 max-w-xs"
          style={{ animation: "tooltipAppear 0.2s ease-out" }}
        >
          <style>{`
            @keyframes tooltipAppear {
              from { opacity: 0; transform: translateY(4px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-950/80 backdrop-blur-xl px-4 py-3 space-y-2">
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              0 XLM Fee Required
            </p>
            <p className="font-body text-xs text-emerald-200/70 leading-relaxed">
              Signature-based stream creation uses our fee sponsorship service. The Stellar protocol resource fee is fully covered by StellarStream, enabling zero-fee transmission for you.
            </p>
            <div className="flex items-start gap-2 pt-1.5 border-t border-emerald-400/10">
              <span className="text-[10px] text-emerald-400/60 flex-shrink-0 mt-0.5">→</span>
              <p className="font-body text-[10px] text-emerald-300/60">
                Powered by Stellar Sponsoring Protocol
              </p>
            </div>
          </div>
          
          {/* Arrow pointer */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent"
            style={{ borderTopColor: "rgba(5,46,22,0.8)" }}
          />
        </div>
      )}
    </div>
  );
}
