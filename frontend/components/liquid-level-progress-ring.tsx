"use client";

import { useState, useEffect } from "react";

interface LiquidLevelProgressRingProps {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Size of the ring in pixels */
  size?: number;
  /** Stroke width of the ring */
  strokeWidth?: number;
  /** Whether to animate the progress changes */
  animated?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Show percentage text in center */
  showPercentage?: boolean;
  /** Custom label to show in center instead of percentage */
  centerLabel?: string;
}

export default function LiquidLevelProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  animated = true,
  className = "",
  showPercentage = true,
  centerLabel,
}: LiquidLevelProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress changes
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    const startProgress = animatedProgress;
    const targetProgress = Math.min(Math.max(progress, 0), 100);
    const duration = 1000; // 1 second animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3);
      
      const currentProgress = startProgress + (targetProgress - startProgress) * easeOutCubic;
      setAnimatedProgress(currentProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, animated]);

  // Calculate SVG properties
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Generate unique IDs for filters
  const glowFilterId = `glow-filter-${Math.random().toString(36).substr(2, 9)}`;
  const liquidFilterId = `liquid-filter-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .liquid-ring-container {
          position: relative;
          display: inline-block;
        }

        .liquid-ring-svg {
          transform: rotate(-90deg);
          filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.3));
        }

        .liquid-ring-track {
          fill: none;
          stroke: rgba(138, 43, 226, 0.15);
          stroke-width: ${strokeWidth}px;
          stroke-linecap: round;
        }

        .liquid-ring-progress {
          fill: none;
          stroke-width: ${strokeWidth}px;
          stroke-linecap: round;
          transition: ${animated ? 'stroke-dashoffset 0.1s linear' : 'none'};
          filter: url(#${glowFilterId});
        }

        .liquid-ring-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Space Mono', monospace;
          color: #e8eaf6;
          text-align: center;
          pointer-events: none;
        }

        .liquid-ring-percentage {
          font-size: ${size * 0.15}px;
          font-weight: 700;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .liquid-ring-label {
          font-size: ${size * 0.08}px;
          color: rgba(232, 234, 246, 0.6);
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        @keyframes liquid-flow {
          0% { stroke-dashoffset: ${circumference}; }
          100% { stroke-dashoffset: ${circumference - 10}; }
        }

        .liquid-animation {
          animation: liquid-flow 2s ease-in-out infinite alternate;
        }
      `}</style>

      <div className={`liquid-ring-container ${className}`} style={{ width: size, height: size }}>
        <svg
          className="liquid-ring-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            {/* Glow filter for the active progress */}
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Liquid gradient that transitions from locked to unlocked */}
            <linearGradient id={liquidFilterId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop 
                offset="0%" 
                stopColor="#8a2be2" 
                stopOpacity={animatedProgress < 5 ? "0.8" : "0.4"}
              />
              <stop 
                offset={`${Math.max(animatedProgress - 10, 0)}%`} 
                stopColor="#8a2be2" 
                stopOpacity="0.6"
              />
              <stop 
                offset={`${animatedProgress}%`} 
                stopColor="#00e5ff" 
                stopOpacity="0.9"
              />
              <stop 
                offset={`${Math.min(animatedProgress + 10, 100)}%`} 
                stopColor="#00e5ff" 
                stopOpacity="1"
              />
              <stop 
                offset="100%" 
                stopColor="#00e5ff" 
                stopOpacity="0.8"
              />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            className="liquid-ring-track"
            cx={center}
            cy={center}
            r={radius}
          />

          {/* Progress ring with liquid effect */}
          <circle
            className="liquid-ring-progress"
            cx={center}
            cy={center}
            r={radius}
            stroke={`url(#${liquidFilterId})`}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `url(#${glowFilterId}) drop-shadow(0 0 ${strokeWidth}px rgba(0, 229, 255, 0.4))`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="liquid-ring-center">
          {centerLabel ? (
            <div className="liquid-ring-label">{centerLabel}</div>
          ) : showPercentage ? (
            <>
              <div className="liquid-ring-percentage">
                {Math.round(animatedProgress)}%
              </div>
              <div className="liquid-ring-label">Unlocked</div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}