"use client";

import { useState } from "react";
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { motion } from "framer-motion";

export default function LedgerLoaderDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [customDuration, setCustomDuration] = useState(5000);
  const [customMessage, setCustomMessage] = useState("Waiting for Stellar Ledger to close...");

  const handleTriggerLoader = () => {
    setIsLoading(true);
  };

  const handleComplete = () => {
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] px-5 py-12 md:px-10 md:py-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="nebula-blob nebula-cyan" />
        <div className="nebula-blob nebula-violet" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="font-heading liquid-chrome mb-4 text-4xl font-semibold md:text-5xl">
            Stellar Ledger Loader
          </h1>
          <p className="font-body text-white/70">
            A full-screen overlay that appears while waiting for the Stellar Ledger to close
          </p>
        </motion.div>

        {/* Demo controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card mb-8 p-8"
        >
          <h2 className="font-heading mb-6 text-xl font-semibold text-white">
            Demo Controls
          </h2>

          <div className="space-y-6">
            {/* Duration control */}
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-white/80">
                Duration (ms)
              </label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-[#00f5ff]/50 focus:bg-white/10"
                min="1000"
                max="10000"
                step="500"
              />
              <p className="font-body mt-1 text-xs text-white/50">
                Default: 5000ms (5 seconds)
              </p>
            </div>

            {/* Message control */}
            <div>
              <label className="font-body mb-2 block text-sm font-medium text-white/80">
                Custom Message
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-[#00f5ff]/50 focus:bg-white/10"
                placeholder="Enter custom message..."
              />
            </div>

            {/* Trigger button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTriggerLoader}
              disabled={isLoading}
              className="font-body neon-glow hover:neon-glow-hover w-full rounded-full border border-[#00F5FF]/50 bg-[#00F5FF]/14 px-8 py-4 text-base font-semibold text-[#D1FCFF] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Trigger Loader"}
            </motion.button>
          </div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8"
        >
          <h2 className="font-heading mb-6 text-xl font-semibold text-white">
            Features
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">🎨</div>
              <h3 className="font-body mb-1 text-sm font-semibold text-white">
                Stellar Glass Design
              </h3>
              <p className="font-body text-xs text-white/60">
                Matches the existing design system with glass morphism and neon accents
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">🎭</div>
              <h3 className="font-body mb-1 text-sm font-semibold text-white">
                3D Rotating Cube
              </h3>
              <p className="font-body text-xs text-white/60">
                Smooth 3D animation with Stellar branding and gradient effects
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">📊</div>
              <h3 className="font-body mb-1 text-sm font-semibold text-white">
                Progress Tracking
              </h3>
              <p className="font-body text-xs text-white/60">
                Real-time progress bar with shimmer effect and percentage display
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-2xl">⚡</div>
              <h3 className="font-body mb-1 text-sm font-semibold text-white">
                Smooth Animations
              </h3>
              <p className="font-body text-xs text-white/60">
                Framer Motion powered with entrance/exit transitions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Usage example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card mt-8 p-8"
        >
          <h2 className="font-heading mb-4 text-xl font-semibold text-white">
            Usage Example
          </h2>

          <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs text-white/80">
            <code>{`import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";

function MyComponent() {
  const [isWaiting, setIsWaiting] = useState(false);

  const handleTransaction = async () => {
    setIsWaiting(true);
    // Your transaction logic here
  };

  return (
    <>
      <button onClick={handleTransaction}>
        Submit Transaction
      </button>

      <StellarLedgerLoader
        isOpen={isWaiting}
        message="Waiting for Stellar Ledger to close..."
        estimatedDuration={5000}
        onComplete={() => setIsWaiting(false)}
      />
    </>
  );
}`}</code>
          </pre>
        </motion.div>
      </div>

      {/* The loader component */}
      <StellarLedgerLoader
        isOpen={isLoading}
        message={customMessage}
        estimatedDuration={customDuration}
        onComplete={handleComplete}
      />
    </main>
  );
}
