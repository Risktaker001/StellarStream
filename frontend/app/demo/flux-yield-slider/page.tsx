"use client";

import React, { useState } from "react";
import { FluxYieldComparisonSlider } from "@/components/flux-yield-comparison-slider";

export default function FluxYieldSliderDemo() {
  const [principal, setPrincipal] = useState(10000);
  const [timePeriod, setTimePeriod] = useState(365);
  const [idleRate, setIdleRate] = useState(0.02);
  const [streamingRate, setStreamingRate] = useState(0.08);
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="min-h-screen bg-[var(--stellar-background)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl liquid-chrome">
            Flux Yield Comparison Slider
          </h1>
          <p className="text-white/60 text-lg">
            Interactive comparison tool for idle vs streaming fund yields
          </p>
        </div>

        {/* Main Component */}
        <div className="w-full">
          <FluxYieldComparisonSlider
            principalAmount={principal}
            timePeriod={timePeriod}
            idleYieldRate={idleRate}
            streamingYieldRate={streamingRate}
            currency="XLM"
            onSliderChange={setSliderPosition}
            className="w-full h-[500px]"
          />
        </div>

        {/* Controls */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="font-heading text-2xl text-white/90 mb-4">
            Adjust Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Principal Amount */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">
                Principal Amount (XLM)
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--stellar-primary)]"
                min="0"
                step="1000"
              />
            </div>

            {/* Time Period */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">
                Time Period (days)
              </label>
              <input
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--stellar-primary)]"
                min="1"
                step="30"
              />
            </div>

            {/* Idle Rate */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">
                Idle Yield Rate (APY %)
              </label>
              <input
                type="number"
                value={idleRate * 100}
                onChange={(e) => setIdleRate(Number(e.target.value) / 100)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--stellar-primary)]"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {/* Streaming Rate */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">
                Streaming Yield Rate (APY %)
              </label>
              <input
                type="number"
                value={streamingRate * 100}
                onChange={(e) => setStreamingRate(Number(e.target.value) / 100)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--stellar-primary)]"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Slider Position Display */}
          <div className="pt-4 border-t border-white/10">
            <div className="text-white/60 text-sm">
              Current Slider Position: <span className="text-[var(--stellar-primary)] font-semibold">{sliderPosition.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="glass-card p-6">
          <h2 className="font-heading text-2xl text-white/90 mb-4">Features</h2>
          <ul className="space-y-3 text-white/70">
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Draggable glass divider with smooth animations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Real-time yield calculations with debouncing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Nebula glow effect on streaming side</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Electric cyan badges showing yield values</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Keyboard navigation (Arrow keys: ← →)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Touch-enabled for mobile devices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Respects prefers-reduced-motion</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--stellar-primary)] mt-1">✓</span>
              <span>Fully accessible with ARIA labels</span>
            </li>
          </ul>
        </div>

        {/* Usage Instructions */}
        <div className="glass-card p-6">
          <h2 className="font-heading text-2xl text-white/90 mb-4">
            How to Use
          </h2>
          <div className="space-y-3 text-white/70">
            <p>
              <strong className="text-white/90">Mouse:</strong> Click and drag the glass divider left or right
            </p>
            <p>
              <strong className="text-white/90">Touch:</strong> Tap and drag the divider on mobile devices
            </p>
            <p>
              <strong className="text-white/90">Keyboard:</strong> Focus the divider (Tab key) and use Arrow Left/Right to move in 5% increments
            </p>
            <p>
              <strong className="text-white/90">Parameters:</strong> Adjust the controls above to see different yield scenarios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
