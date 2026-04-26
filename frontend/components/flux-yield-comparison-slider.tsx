"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  calculateSimpleYield,
  calculateYieldDifference,
  formatCurrency,
  formatPercentage,
} from "@/lib/yield-calculator";

// ═══════════════════════════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

export interface FluxYieldComparisonSliderProps {
  principalAmount: number;
  timePeriod: number;
  idleYieldRate: number;
  streamingYieldRate: number;
  currency?: string;
  className?: string;
  onSliderChange?: (position: number) => void;
}

interface SliderState {
  dividerPosition: number;
  isDragging: boolean;
  idleYield: number;
  streamingYield: number;
  yieldDifference: number;
}

interface GlassDividerProps {
  position: number;
  onDrag: (newPosition: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface SplitViewProps {
  dividerPosition: number;
  children: {
    left: React.ReactNode;
    right: React.ReactNode;
  };
}

interface NebulaGlowOverlayProps {
  intensity?: number;
  animate?: boolean;
}

interface ElectricCyanBadgeProps {
  label: string;
  value: string;
  position: "left" | "right";
  highlight?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ElectricCyanBadge Component
// ═══════════════════════════════════════════════════════════════════════════

const ElectricCyanBadge = React.memo(function ElectricCyanBadge({
  label,
  value,
  position,
  highlight = false,
}: ElectricCyanBadgeProps) {
  return (
    <div
      className={`absolute top-8 ${
        position === "left" ? "left-8" : "right-8"
      } z-30 px-4 py-2 rounded-lg font-body font-semibold max-sm:text-xs max-sm:px-3 max-sm:py-1.5`}
      style={{
        background: "rgba(0, 245, 255, 0.12)",
        border: "1px solid rgba(0, 245, 255, 0.3)",
        boxShadow: highlight
          ? "0 0 20px rgba(0, 245, 255, 0.3)"
          : "0 0 16px rgba(0, 245, 255, 0.2)",
        color: "#00f5ff",
        willChange: "contents",
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="text-xs text-white/60 mb-1 max-sm:text-[10px]">{label}</div>
      <div className="text-base max-sm:text-sm">{value}</div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// NebulaGlowOverlay Component
// ═══════════════════════════════════════════════════════════════════════════

const NebulaGlowOverlay = React.memo(function NebulaGlowOverlay({
  intensity = 1,
  animate = true,
}: NebulaGlowOverlayProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Cyan blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "-14rem",
          left: "-10rem",
          width: "36rem",
          height: "36rem",
          background: "radial-gradient(circle at 35% 35%, #00f5ff, transparent 72%)",
          filter: "blur(90px)",
          opacity: 0.45 * intensity,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={
          shouldAnimate
            ? {
                x: ["0%", "5%", "-3%", "8%", "0%"],
                y: ["0%", "-8%", "5%", "3%", "0%"],
                scale: [1, 1.1, 0.95, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Violet blob */}
      <motion.div
        className="absolute rounded-full"
        style={{
          right: "-14rem",
          bottom: "-16rem",
          width: "40rem",
          height: "40rem",
          background: "radial-gradient(circle at 65% 60%, #8a00ff, transparent 72%)",
          filter: "blur(90px)",
          opacity: 0.45 * intensity,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={
          shouldAnimate
            ? {
                x: ["0%", "-6%", "4%", "-3%", "0%"],
                y: ["0%", "4%", "-6%", "-4%", "0%"],
                scale: [1, 1.08, 0.92, 1.12, 1],
              }
            : {}
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// SplitView Component
// ═══════════════════════════════════════════════════════════════════════════

function SplitView({ dividerPosition, children }: SplitViewProps) {
  return (
    <div className="absolute inset-0 flex">
      {/* Left Panel - Idle View */}
      <div
        className="relative overflow-hidden"
        style={{ width: `${dividerPosition}%` }}
      >
        {children.left}
      </div>

      {/* Right Panel - Streaming View */}
      <div
        className="relative overflow-hidden"
        style={{ width: `${100 - dividerPosition}%` }}
      >
        {children.right}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GlassDivider Component
// ═══════════════════════════════════════════════════════════════════════════

function GlassDivider({
  position,
  onDrag,
  onDragStart,
  onDragEnd,
  containerRef,
}: GlassDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null);

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;

      try {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        // Get X coordinate from mouse or touch event
        const clientX =
          "touches" in event ? event.touches[0].clientX : event.clientX;
        
        // Calculate position relative to container
        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        
        // Clamp to [10, 90] range
        const clampedPosition = Math.max(10, Math.min(90, percentage));
        
        onDrag(clampedPosition);
      } catch (error) {
        console.error("Drag calculation failed:", error);
      }
    },
    [containerRef, onDrag]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onDragStart();

      const handleMouseMove = (event: MouseEvent) => handleDrag(event);
      const handleMouseUp = () => {
        onDragEnd();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onDragStart, onDragEnd, handleDrag]
  );

  const handleTouchStart = useCallback(
    (_e: React.TouchEvent) => {
      onDragStart();

      const handleTouchMove = (event: TouchEvent) => handleDrag(event);
      const handleTouchEnd = () => {
        onDragEnd();
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [onDragStart, onDragEnd, handleDrag]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      try {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const newPosition = Math.min(position + 5, 90);
          onDrag(newPosition);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const newPosition = Math.max(position - 5, 10);
          onDrag(newPosition);
        }
      } catch (error) {
        console.error("Keyboard navigation failed:", error);
      }
    },
    [position, onDrag]
  );

  return (
    <motion.div
      ref={dividerRef}
      className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-20 focus:outline-none"
      style={{ left: `${position}%` }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="Yield comparison slider"
      aria-valuemin={10}
      aria-valuemax={90}
      aria-valuenow={Math.round(position)}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 1.1 }}
    >
      {/* Glass divider bar */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/10 border-l border-r border-white/20" />
      
      {/* Drag handle with focus indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-16 backdrop-blur-lg bg-white/20 border border-white/30 rounded-full flex items-center justify-center focus-within:ring-2 focus-within:ring-[var(--stellar-primary)] focus-within:ring-offset-2 focus-within:ring-offset-transparent">
        <div className="flex flex-col gap-1">
          <div className="w-1 h-1 rounded-full bg-white/60" />
          <div className="w-1 h-1 rounded-full bg-white/60" />
          <div className="w-1 h-1 rounded-full bg-white/60" />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function FluxYieldComparisonSlider({
  principalAmount,
  timePeriod,
  idleYieldRate,
  streamingYieldRate,
  currency = "XLM",
  className = "",
  onSliderChange,
}: FluxYieldComparisonSliderProps) {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Validate and sanitize props
  const validPrincipal = useMemo(() => {
    if (principalAmount <= 0) {
      console.warn("Invalid principal amount, defaulting to 1000");
      return 1000;
    }
    return principalAmount;
  }, [principalAmount]);

  const validTimePeriod = useMemo(() => {
    if (timePeriod <= 0) {
      console.warn("Invalid time period, defaulting to 30");
      return 30;
    }
    return timePeriod;
  }, [timePeriod]);

  const validIdleRate = useMemo(() => {
    if (idleYieldRate < 0) {
      console.warn("Invalid idle yield rate, defaulting to 0");
      return 0;
    }
    return idleYieldRate;
  }, [idleYieldRate]);

  const validStreamingRate = useMemo(() => {
    if (streamingYieldRate < 0) {
      console.warn("Invalid streaming yield rate, defaulting to 0");
      return 0;
    }
    if (streamingYieldRate < idleYieldRate) {
      console.warn("Streaming rate is less than idle rate");
    }
    return streamingYieldRate;
  }, [streamingYieldRate, idleYieldRate]);

  // Calculate yields with debouncing
  const [debouncedPosition, setDebouncedPosition] = useState(dividerPosition);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedPosition(dividerPosition);
    }, 50);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [dividerPosition]);

  const yieldData = useMemo(() => {
    const idleYield = calculateSimpleYield(
      validPrincipal,
      validIdleRate,
      validTimePeriod
    );
    const streamingYield = calculateSimpleYield(
      validPrincipal,
      validStreamingRate,
      validTimePeriod
    );
    const yieldDifference = calculateYieldDifference(idleYield, streamingYield);

    return {
      idleYield,
      streamingYield,
      yieldDifference,
      idleTotal: validPrincipal + idleYield,
      streamingTotal: validPrincipal + streamingYield,
    };
  }, [validPrincipal, validTimePeriod, validIdleRate, validStreamingRate, debouncedPosition]);

  const handleDrag = useCallback(
    (newPosition: number) => {
      setDividerPosition(newPosition);
      onSliderChange?.(newPosition);
    },
    [onSliderChange]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`glass-card relative overflow-hidden min-h-[400px] ${className}`}
    >
      {/* Electric Cyan Badges */}
      <ElectricCyanBadge
        label="Idle Yield"
        value={formatCurrency(yieldData.idleYield, currency)}
        position="left"
      />
      <ElectricCyanBadge
        label="Streaming Yield"
        value={formatCurrency(yieldData.streamingYield, currency)}
        position="right"
        highlight
      />

      {/* SplitView Layout */}
      <SplitView
        dividerPosition={dividerPosition}
        children={{
          left: (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white/[0.02] to-transparent">
              <h3 className="font-heading text-xl text-white/80 mb-2">Idle Funds</h3>
              <p className="text-white/50 text-sm mb-4">Standard wallet growth</p>
              <div className="text-center space-y-2">
                <div className="text-white/60 text-sm">Principal</div>
                <div className="text-white/90 text-lg font-semibold">
                  {formatCurrency(validPrincipal, currency)}
                </div>
                <div className="text-white/60 text-sm mt-4">Total after {validTimePeriod} days</div>
                <div className="text-white/90 text-2xl font-bold">
                  {formatCurrency(yieldData.idleTotal, currency)}
                </div>
                <div className="text-white/40 text-xs mt-2">
                  Rate: {formatPercentage(validIdleRate * 100)} APY
                </div>
              </div>
            </div>
          ),
          right: (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-bl from-[var(--stellar-primary)]/[0.05] to-transparent relative">
              {/* Nebula Glow Overlay */}
              <NebulaGlowOverlay />
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-heading text-xl text-[var(--stellar-primary)] mb-2">
                  Streaming Funds
                </h3>
                <p className="text-white/50 text-sm mb-4">StellarStream growth</p>
                <div className="text-center space-y-2">
                  <div className="text-white/60 text-sm">Principal</div>
                  <div className="text-[var(--stellar-primary)] text-lg font-semibold">
                    {formatCurrency(validPrincipal, currency)}
                  </div>
                  <div className="text-white/60 text-sm mt-4">Total after {validTimePeriod} days</div>
                  <div className="text-[var(--stellar-primary)] text-2xl font-bold">
                    {formatCurrency(yieldData.streamingTotal, currency)}
                  </div>
                  <div className="text-white/40 text-xs mt-2">
                    Rate: {formatPercentage(validStreamingRate * 100)} APY
                  </div>
                  {yieldData.yieldDifference !== Infinity && (
                    <div className="mt-4 px-3 py-1 rounded-full bg-[var(--stellar-primary)]/20 border border-[var(--stellar-primary)]/40">
                      <span className="text-[var(--stellar-primary)] text-sm font-semibold">
                        +{formatPercentage(yieldData.yieldDifference)} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
        }}
      />

      {/* GlassDivider */}
      <GlassDivider
        position={dividerPosition}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        containerRef={containerRef}
      />
    </div>
  );
}
