"use client";

import { useState, useEffect } from "react";

interface NetworkStatusOrbProps {
  /** congestion level between 0 (no congestion) and 1 (max congestion) */
  congestionLevel?: number;
  /** average transaction fee (in XLM or whatever unit) */
  averageFee?: number;
  /** pixel size of the orb */
  size?: number;
}

export default function NetworkStatusOrb({
  congestionLevel = 0,
  averageFee,
  size = 20,
}: NetworkStatusOrbProps) {
  // constrain values
  const level = Math.min(Math.max(congestionLevel, 0), 1);
  const green = "#28a745"; // low congestion
  const yellow = "#ffc107"; // moderate
  const red = "#dc3545"; // high

  let color = green;
  if (level >= 0.66) {
    color = red;
  } else if (level >= 0.33) {
    color = yellow;
  }

  // pulse speed: faster when congestion is higher
  const baseDuration = 2.5; // seconds when no congestion
  const pulseDuration = baseDuration - level * 2; // ranges 2.5 -> 0.5s

  const tooltip = `Network congestion ${Math.round(level * 100)}%` +
    (averageFee !== undefined ? ` • avg fee ${averageFee.toFixed(3)}` : "");

  return (
    <div
      className="network-status-root"
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
      title={tooltip}
    >
      <div
        className="network-orb"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size / 2}px ${color}`,
          animation: `orbPulse ${pulseDuration}s ease-in-out infinite`,
        }}
      />
      {averageFee !== undefined && (
        <span
          className="network-fee"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {averageFee.toFixed(3)}
        </span>
      )}

      <style>{`
        @keyframes orbPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
