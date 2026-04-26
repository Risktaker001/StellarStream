"use client";

import { useState, useEffect } from "react";
import LiquidLevelProgressRing from "@/components/liquid-level-progress-ring";
import StreamCardWithLiquidRing from "@/components/stream-card-with-liquid-ring";

export default function LiquidRingDemo() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(65);
  const [progress3, setProgress3] = useState(100);
  const [liveProgress, setLiveProgress] = useState(0);

  // Simulate live streaming progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveProgress((prev) => {
        const next = prev + 0.5;
        return next > 100 ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-['Syne']">
            Liquid Level Progress Ring
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            A circular progress indicator showing stream unlock progress with liquid-like visual effects.
            The ring transitions from Hyper Violet (locked) to Electric Cyan (unlocked).
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Static Examples */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4 font-['Syne']">Empty Stream</h3>
            <div className="flex justify-center mb-4">
              <LiquidLevelProgressRing progress={0} size={120} />
            </div>
            <p className="text-slate-400 text-sm">No tokens unlocked yet</p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4 font-['Syne']">Partial Progress</h3>
            <div className="flex justify-center mb-4">
              <LiquidLevelProgressRing progress={35} size={120} />
            </div>
            <p className="text-slate-400 text-sm">35% of tokens unlocked</p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4 font-['Syne']">Nearly Complete</h3>
            <div className="flex justify-center mb-4">
              <LiquidLevelProgressRing progress={85} size={120} />
            </div>
            <p className="text-slate-400 text-sm">85% of tokens unlocked</p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4 font-['Syne']">Complete Stream</h3>
            <div className="flex justify-center mb-4">
              <LiquidLevelProgressRing progress={100} size={120} />
            </div>
            <p className="text-slate-400 text-sm">All tokens unlocked</p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-white font-semibold mb-6 font-['Syne'] text-xl">Interactive Demo</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Progress 1: {Math.round(progress1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress1}
                  onChange={(e) => setProgress1(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Progress 2: {Math.round(progress2)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress2}
                  onChange={(e) => setProgress2(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Progress 3: {Math.round(progress3)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress3}
                  onChange={(e) => setProgress3(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <button
                onClick={() => {
                  setProgress1(Math.random() * 100);
                  setProgress2(Math.random() * 100);
                  setProgress3(Math.random() * 100);
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all duration-200"
              >
                Randomize All
              </button>
            </div>

            {/* Ring Displays */}
            <div className="flex justify-center items-center">
              <div className="text-center">
                <LiquidLevelProgressRing progress={progress1} size={140} />
                <p className="text-slate-400 text-sm mt-2">Controllable Ring 1</p>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="text-center">
                <LiquidLevelProgressRing progress={progress2} size={140} />
                <p className="text-slate-400 text-sm mt-2">Controllable Ring 2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Size Variations */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-white font-semibold mb-6 font-['Syne'] text-xl">Size Variations</h3>
          
          <div className="flex flex-wrap justify-center items-end gap-8">
            <div className="text-center">
              <LiquidLevelProgressRing progress={75} size={80} strokeWidth={6} />
              <p className="text-slate-400 text-sm mt-2">Small (80px)</p>
            </div>
            
            <div className="text-center">
              <LiquidLevelProgressRing progress={75} size={120} strokeWidth={8} />
              <p className="text-slate-400 text-sm mt-2">Medium (120px)</p>
            </div>
            
            <div className="text-center">
              <LiquidLevelProgressRing progress={75} size={160} strokeWidth={10} />
              <p className="text-slate-400 text-sm mt-2">Large (160px)</p>
            </div>
            
            <div className="text-center">
              <LiquidLevelProgressRing progress={75} size={200} strokeWidth={12} />
              <p className="text-slate-400 text-sm mt-2">Extra Large (200px)</p>
            </div>
          </div>
        </div>

        {/* Stream Card Integration */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-white font-semibold mb-6 font-['Syne'] text-xl">Stream Card Integration</h3>
          
          <div className="flex flex-wrap justify-center gap-6">
            <StreamCardWithLiquidRing 
              streamId="001"
              sender={{ address: "0xA1b2C3d4E5f6789012345678901234567890abcd", label: "Alice" }}
              receiver={{ address: "0xB2c3D4e5F6a7890123456789012345678901bcde", label: "Bob" }}
              tokenSymbol="USDC"
              amountStreamed={342.75}
              totalAmount={1000}
            />
            
            <StreamCardWithLiquidRing 
              streamId="002"
              sender={{ address: "0xC3d4E5f6A7b8901234567890123456789012cdef", label: "Charlie" }}
              receiver={{ address: "0xD4e5F6a7B8c9012345678901234567890123def0", label: "Diana" }}
              tokenSymbol="ETH"
              amountStreamed={0.85}
              totalAmount={2.5}
            />
          </div>
        </div>

        {/* Live Animation */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h3 className="text-white font-semibold mb-6 font-['Syne'] text-xl">Live Stream Simulation</h3>
          
          <div className="flex justify-center">
            <div className="text-center">
              <LiquidLevelProgressRing 
                progress={liveProgress} 
                size={180} 
                strokeWidth={12}
                centerLabel="Live Stream"
                showPercentage={false}
              />
              <p className="text-slate-400 text-sm mt-4">
                Simulating real-time stream progress: {Math.round(liveProgress)}%
              </p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mt-8">
          <h3 className="text-white font-semibold mb-4 font-['Syne'] text-xl">Usage</h3>
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>{`import LiquidLevelProgressRing from "@/components/liquid-level-progress-ring";

// Basic usage
<LiquidLevelProgressRing progress={65} />

// With custom size and stroke
<LiquidLevelProgressRing 
  progress={75} 
  size={160} 
  strokeWidth={10} 
/>

// With custom center label
<LiquidLevelProgressRing 
  progress={42} 
  centerLabel="Streaming" 
  showPercentage={false} 
/>`}</pre>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
        }
      `}</style>
    </div>
  );
}