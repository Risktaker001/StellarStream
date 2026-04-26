"use client";

/**
 * components/stream-matrix.tsx
 * Issue #161 — Easter Egg: "The Stream Matrix"
 *
 * Full-screen canvas animation showing global streams as falling
 * "Digital Dust" particles using StellarStream protocol colors.
 * Triggered by clicking the logo 5 times in nav.tsx.
 */

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Protocol colors from globals.css ────────────────────────────────────────
const COLORS = [
  "#00f5ff", // stellar-primary cyan
  "#8a00ff", // stellar-secondary violet
  "#ffffff", // white
  "#00f5ff",
  "#00f5ff", // cyan weighted heavier (more common)
];

// Stream address fragments that fall like matrix characters
const STREAM_CHARS = "ABCDEF0123456789→◈⬡∿≋Ξ▸◆⬢✦";

interface Particle {
  x: number;
  y: number;
  speed: number;
  char: string;
  color: string;
  opacity: number;
  fontSize: number;
  trail: { y: number; opacity: number }[];
}

interface StreamMatrixProps {
  active: boolean;
  onClose: () => void;
}

export function StreamMatrix({ active, onClose }: StreamMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.floor((w / 24) * 1.4);
    particles.current = Array.from({ length: count }, () => ({
      x:        Math.random() * w,
      y:        Math.random() * h - h,
      speed:    1.2 + Math.random() * 3.5,
      char:     STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)],
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity:  0.15 + Math.random() * 0.75,
      fontSize: 11 + Math.floor(Math.random() * 8),
      trail:    [],
    }));
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      // Fade trail
      ctx.fillStyle = "rgba(3, 3, 3, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        // Draw trail characters
        p.trail.forEach((t, i) => {
          const trailOpacity = (i / p.trail.length) * p.opacity * 0.4;
          ctx.globalAlpha = trailOpacity;
          ctx.fillStyle   = p.color;
          ctx.font        = `${p.fontSize}px "Plus Jakarta Sans", monospace`;
          ctx.fillText(p.char, p.x, t.y);
        });

        // Draw main character
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = p.color === "#00f5ff" ? 12 : 6;
        ctx.font        = `bold ${p.fontSize}px "Plus Jakarta Sans", monospace`;
        ctx.fillText(p.char, p.x, p.y);
        ctx.shadowBlur  = 0;

        // Update trail
        p.trail.push({ y: p.y, opacity: p.opacity });
        if (p.trail.length > 8) p.trail.shift();

        // Move down
        p.y += p.speed;

        // Randomize char occasionally
        if (Math.random() < 0.04) {
          p.char = STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)];
        }

        // Reset when off screen
        if (p.y > canvas.height + 20) {
          p.y      = -20;
          p.x      = Math.random() * canvas.width;
          p.speed  = 1.2 + Math.random() * 3.5;
          p.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
          p.trail  = [];
          p.opacity = 0.15 + Math.random() * 0.75;
        }
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, initParticles]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="stream-matrix"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999]"
          style={{ background: "#030303" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Center overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <p
              className="font-heading text-5xl md:text-7xl font-bold tracking-tight liquid-chrome"
              style={{ textShadow: "0 0 60px rgba(0,245,255,0.3)" }}
            >
              StellarStream
            </p>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-white/30 mt-3">
              Real-time asset flow · Soroban Protocol
            </p>

            {/* Live stream counter */}
            <div
              className="mt-8 rounded-full border border-cyan-500/20 bg-black/40 backdrop-blur-xl px-6 py-2.5 font-ticker text-sm text-cyan-400 tabular-nums"
              style={{ boxShadow: "0 0 30px rgba(0,245,255,0.08)" }}
            >
              ∿ 1,204 streams flowing globally
            </div>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="absolute top-6 right-6 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-4 py-2 font-body text-xs text-white/40 transition hover:border-cyan-500/30 hover:text-cyan-400"
          >
            ESC to close
          </motion.button>

          {/* Bottom hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-[0.2em] uppercase text-white/15"
          >
            Every particle is a live stream
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
