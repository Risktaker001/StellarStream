"use client";

import { ReactNode } from "react";

interface GlitchTextProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p";
  className?: string;
  glitchOnHover?: boolean;
  glitchIntensity?: "low" | "medium" | "high";
}

export default function GlitchText({
  children,
  as: Component = "h1",
  className = "",
  glitchOnHover = true,
  glitchIntensity = "medium",
}: GlitchTextProps) {
  const intensityValues = {
    low: { shift: "2px", opacity: "0.6" },
    medium: { shift: "3px", opacity: "0.7" },
    high: { shift: "5px", opacity: "0.8" },
  };

  const { shift, opacity } = intensityValues[glitchIntensity];

  return (
    <>
      <style>{`
        @keyframes glitch-anim-1 {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(0);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(-${shift}, ${shift});
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-${shift}, -${shift});
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(${shift}, ${shift});
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(0);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(0);
          }
        }

        @keyframes glitch-anim-2 {
          0% {
            clip-path: inset(65% 0 15% 0);
            transform: translate(0);
          }
          20% {
            clip-path: inset(17% 0 33% 0);
            transform: translate(${shift}, -${shift});
          }
          40% {
            clip-path: inset(78% 0 11% 0);
            transform: translate(${shift}, ${shift});
          }
          60% {
            clip-path: inset(32% 0 61% 0);
            transform: translate(-${shift}, ${shift});
          }
          80% {
            clip-path: inset(45% 0 23% 0);
            transform: translate(0);
          }
          100% {
            clip-path: inset(14% 0 71% 0);
            transform: translate(0);
          }
        }

        @keyframes glitch-skew {
          0% {
            transform: skew(0deg);
          }
          10% {
            transform: skew(-2deg);
          }
          20% {
            transform: skew(2deg);
          }
          30% {
            transform: skew(-1deg);
          }
          40% {
            transform: skew(1deg);
          }
          50% {
            transform: skew(0deg);
          }
          100% {
            transform: skew(0deg);
          }
        }

        .glitch-text {
          position: relative;
          display: inline-block;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #e8eaf6;
          transition: transform 0.1s ease;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
        }

        .glitch-text::before {
          color: #00e5ff;
          z-index: -1;
          text-shadow: 2px 0 #00e5ff;
        }

        .glitch-text::after {
          color: #8a2be2;
          z-index: -2;
          text-shadow: -2px 0 #8a2be2;
        }

        /* Hover trigger */
        .glitch-text.glitch-hover:hover::before {
          opacity: ${opacity};
          animation: glitch-anim-1 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        .glitch-text.glitch-hover:hover::after {
          opacity: ${opacity};
          animation: glitch-anim-2 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        .glitch-text.glitch-hover:hover {
          animation: glitch-skew 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        /* Always-on glitch (for non-hover variant) */
        .glitch-text.glitch-always::before {
          opacity: ${opacity};
          animation: glitch-anim-1 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        .glitch-text.glitch-always::after {
          opacity: ${opacity};
          animation: glitch-anim-2 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        .glitch-text.glitch-always {
          animation: glitch-skew 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        /* Ensure text remains legible */
        .glitch-text {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <Component
        className={`glitch-text ${glitchOnHover ? 'glitch-hover' : 'glitch-always'} ${className}`}
        data-text={typeof children === 'string' ? children : ''}
      >
        {children}
      </Component>
    </>
  );
}
