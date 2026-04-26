"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StellarLedgerLoaderProps {
  isOpen: boolean;
  message?: string;
  estimatedDuration?: number;
  onComplete?: () => void;
}

export function StellarLedgerLoader({
  isOpen,
  message = "Waiting for Stellar Ledger to close...",
  estimatedDuration = 5000,
  onComplete,
}: StellarLedgerLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 200);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isOpen, estimatedDuration, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        >
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Content container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10 flex flex-col items-center gap-8 px-6"
          >
            {/* 3D Rotating Stellar Rocket */}
            <div className="relative">
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />

              {/* Rotating cube/rocket container */}
              <motion.div
                animate={{
                  rotateY: [0, 360],
                  rotateX: [0, 15, 0],
                }}
                transition={{
                  rotateY: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  rotateX: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
                className="relative"
              >
                {/* Abstract Stellar Cube */}
                <div className="relative h-32 w-32">
                  {/* Front face */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#00f5ff]/40 bg-gradient-to-br from-[#00f5ff]/20 to-[#8a00ff]/20"
                    style={{
                      transform: "translateZ(32px)",
                      boxShadow: "0 0 40px rgba(0, 245, 255, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.1)",
                    }}
                  >
                    {/* Stellar logo representation */}
                    <div className="flex h-full items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="text-6xl font-bold"
                        style={{
                          background: "linear-gradient(135deg, #00f5ff 0%, #8a00ff 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        ⬡
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Back face */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#8a00ff]/40 bg-gradient-to-br from-[#8a00ff]/20 to-[#00f5ff]/20"
                    style={{
                      transform: "translateZ(-32px) rotateY(180deg)",
                      boxShadow: "0 0 40px rgba(138, 0, 255, 0.3)",
                    }}
                  />

                  {/* Top face */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#00f5ff]/30 bg-gradient-to-br from-[#00f5ff]/15 to-[#8a00ff]/15"
                    style={{
                      transform: "rotateX(90deg) translateZ(32px)",
                    }}
                  />

                  {/* Bottom face */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#8a00ff]/30 bg-gradient-to-br from-[#8a00ff]/15 to-[#00f5ff]/15"
                    style={{
                      transform: "rotateX(-90deg) translateZ(32px)",
                    }}
                  />

                  {/* Left face */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#00f5ff]/30 bg-gradient-to-br from-[#00f5ff]/15 to-[#8a00ff]/15"
                    style={{
                      transform: "rotateY(-90deg) translateZ(32px)",
                    }}
                  />

                  {/* Right face */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-[#8a00ff]/30 bg-gradient-to-br from-[#8a00ff]/15 to-[#00f5ff]/15"
                    style={{
                      transform: "rotateY(90deg) translateZ(32px)",
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Message text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center"
            >
              <h3 className="font-heading text-xl font-semibold text-white md:text-2xl">
                {message}
              </h3>
              <p className="font-body mt-2 text-sm text-white/60">
                Ledger closes every ~5 seconds
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Progress container */}
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
                {/* Progress fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #00f5ff 0%, #8a00ff 100%)",
                    boxShadow: "0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(138, 0, 255, 0.4)",
                  }}
                  transition={{ duration: 0.1 }}
                />

                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                    width: "50%",
                  }}
                />
              </div>

              {/* Progress percentage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-body mt-3 text-center text-sm font-medium text-[#00f5ff]"
              >
                {Math.round(progress)}%
              </motion.div>
            </motion.div>

            {/* Pulsing dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: i === 1 ? "#00f5ff" : "#8a00ff",
                    boxShadow: `0 0 10px ${i === 1 ? "rgba(0, 245, 255, 0.6)" : "rgba(138, 0, 255, 0.6)"}`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
