"use client";

import AssetDistributionChart from "./asset-distribution-chart";

export default function AssetDistributionExample() {
  // Sample data - replace with real data from your streaming protocol
  const sampleAssets = [
    {
      token: "USDC",
      amount: 15000,
      usdValue: 15000,
      color: "#00f5ff",
    },
    {
      token: "XLM",
      amount: 50000,
      usdValue: 10000,
      color: "#8a00ff",
    },
    {
      token: "USDT",
      amount: 5000,
      usdValue: 5000,
      color: "#ff3b5c",
    },
    {
      token: "BTC",
      amount: 0.15,
      usdValue: 7500,
      color: "#ffb300",
    },
    {
      token: "ETH",
      amount: 1.5,
      usdValue: 2500,
      color: "#00e676",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Glass Card Container */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: "rgba(10, 10, 20, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)",
        }}
      >
        {/* Glass Sheen Effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)",
            pointerEvents: "none",
            borderRadius: "inherit",
          }}
        />

        {/* Header */}
        <div className="relative z-10 mb-6">
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: "#ffffff",
              textShadow: "0 0 20px rgba(0, 245, 255, 0.3)",
            }}
          >
            Asset Distribution
          </h2>
          <p
            className="text-sm"
            style={{
              color: "rgba(232, 234, 246, 0.6)",
            }}
          >
            Your currently streaming assets across all active streams
          </p>
        </div>

        {/* Chart */}
        <div className="relative z-10">
          <AssetDistributionChart assets={sampleAssets} />
        </div>
      </div>

      {/* Usage Instructions */}
      <div
        className="mt-6 p-6 rounded-xl"
        style={{
          background: "rgba(0, 245, 255, 0.05)",
          border: "1px solid rgba(0, 245, 255, 0.2)",
        }}
      >
        <h3
          className="text-lg font-semibold mb-3"
          style={{
            fontFamily: "'Syne', sans-serif",
            color: "#00f5ff",
          }}
        >
          Interactive Features
        </h3>
        <ul
          className="space-y-2 text-sm"
          style={{
            color: "rgba(232, 234, 246, 0.7)",
          }}
        >
          <li>• Hover over chart segments to see individual token values</li>
          <li>• Active segments "pop out" with enhanced glow effects</li>
          <li>• Center text dynamically updates to show selected token</li>
          <li>• Click legend items to highlight specific assets</li>
          <li>• Semi-transparent "Donut Glass" design with Nebula gradients</li>
        </ul>
      </div>
    </div>
  );
}
