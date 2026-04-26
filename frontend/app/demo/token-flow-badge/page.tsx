"use client";

import TokenFlowBadge from "@/components/token-flow-badge";
import EnhancedStreamSummaryCard from "@/components/enhanced-stream-summary-card";

export default function TokenFlowBadgeDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Token Flow Badge Demo
          </h1>
          <p className="text-slate-300 text-lg">
            Interactive badges showing stream direction with animated pulse effects
          </p>
        </div>

        {/* Size Variations */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Size Variations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Incoming Badges */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Incoming Streams</h3>
              
              <div className="flex items-center gap-4">
                <TokenFlowBadge direction="incoming" size="sm" />
                <span className="text-slate-300">Small (sm)</span>
              </div>
              
              <div className="flex items-center gap-4">
                <TokenFlowBadge direction="incoming" size="md" />
                <span className="text-slate-300">Medium (md) - Default</span>
              </div>
              
              <div className="flex items-center gap-4">
                <TokenFlowBadge direction="incoming" size="lg" />
                <span className="text-slate-300">Large (lg)</span>
              </div>
            </div>

            {/* Outgoing Badges */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-violet-400 mb-4">Outgoing Streams</h3>
              
              <div className="flex items-center gap-4">
                <TokenFlowBadge direction="outgoing" size="sm" />
                <span className="text-slate-300">Small (sm)</span>
              </div>
              
              <div className="flex items-center gap-4">
                <TokenFlowBadge direction="outgoing" size="md" />
                <span className="text-slate-300">Medium (md) - Default</span>
              </div>
              
              <div className="flex items-center gap-4">
                <TokenFlowBadge direction="outgoing" size="lg" />
                <span className="text-slate-300">Large (lg)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage in Lists */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Usage in Stream Lists</h2>
          
          <div className="space-y-4">
            {/* Mock stream list items */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <TokenFlowBadge direction="incoming" />
                <div>
                  <div className="text-white font-medium">USDC Stream</div>
                  <div className="text-slate-400 text-sm">From: GCKFBEIYTKP...</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-mono">+1,250.00 USDC</div>
                <div className="text-slate-400 text-sm">Rate: 50/hour</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <TokenFlowBadge direction="outgoing" />
                <div>
                  <div className="text-white font-medium">XLM Stream</div>
                  <div className="text-slate-400 text-sm">To: GDXLKEY2TR2...</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-violet-400 font-mono">-500.00 XLM</div>
                <div className="text-slate-400 text-sm">Rate: 25/hour</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <TokenFlowBadge direction="incoming" />
                <div>
                  <div className="text-white font-medium">AQUA Stream</div>
                  <div className="text-slate-400 text-sm">From: GBNZILSTVQ...</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-mono">+10,000.00 AQUA</div>
                <div className="text-slate-400 text-sm">Rate: 100/hour</div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Examples */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Integration Examples</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Stream Card */}
            <div>
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Incoming Stream Card</h3>
              <EnhancedStreamSummaryCard
                direction="incoming"
                sender={{
                  address: "GCKFBEIYTKP7WM6AMMBN3VZ7TMX5R7QZAPRNYXAX",
                  label: "DeFi Protocol"
                }}
                receiver={{
                  address: "GDXLKEY2TR2BOZYY7YKMZBRH4HQCKQYCVKFWYGME",
                  label: "Your Wallet"
                }}
                tokenSymbol="USDC"
                amountStreamed={1250.75}
                totalAmount={5000}
                startTime={new Date(Date.now() - 86400000 * 2)}
                endTime={new Date(Date.now() + 86400000 * 8)}
              />
            </div>

            {/* Outgoing Stream Card */}
            <div>
              <h3 className="text-lg font-medium text-violet-400 mb-4">Outgoing Stream Card</h3>
              <EnhancedStreamSummaryCard
                direction="outgoing"
                sender={{
                  address: "GDXLKEY2TR2BOZYY7YKMZBRH4HQCKQYCVKFWYGME",
                  label: "Your Wallet"
                }}
                receiver={{
                  address: "GBNZILSTVQZ4R7LYKAQF3HZPNE2EGLKW27JRIMLF",
                  label: "Savings Account"
                }}
                tokenSymbol="XLM"
                amountStreamed={500.25}
                totalAmount={2000}
                startTime={new Date(Date.now() - 86400000 * 1)}
                endTime={new Date(Date.now() + 86400000 * 14)}
              />
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Design Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Incoming Streams</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong>Color:</strong> Cyan (#00e5ff)</li>
                <li>• <strong>Direction:</strong> Arrow pointing down</li>
                <li>• <strong>Animation:</strong> Gentle inward pulse (2s cycle)</li>
                <li>• <strong>Glow:</strong> Soft cyan shadow effect</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-violet-400 mb-4">Outgoing Streams</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong>Color:</strong> Violet (#8a2be2)</li>
                <li>• <strong>Direction:</strong> Arrow pointing up</li>
                <li>• <strong>Animation:</strong> Energetic outward pulse (1.8s cycle)</li>
                <li>• <strong>Glow:</strong> Soft violet shadow effect</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">Glass Design Pattern</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• <strong>Shape:</strong> Pill-shaped container with rounded corners</li>
              <li>• <strong>Border:</strong> 1px semi-transparent border</li>
              <li>• <strong>Background:</strong> Semi-transparent with backdrop blur</li>
              <li>• <strong>Overlay:</strong> Subtle gradient for glass effect</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}