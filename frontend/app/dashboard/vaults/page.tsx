"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VaultAsset {
  token: string;
  symbol: string;
  totalValue: number;
  earningYield: number;
  idle: number;
  apy: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockAssets: VaultAsset[] = [
  {
    token: "USDC",
    symbol: "USDC",
    totalValue: 125000,
    earningYield: 95000,
    idle: 30000,
    apy: 8.5,
  },
  {
    token: "XLM",
    symbol: "XLM",
    totalValue: 75000,
    earningYield: 60000,
    idle: 15000,
    apy: 12.3,
  },
  {
    token: "EURC",
    symbol: "EURC",
    totalValue: 50000,
    earningYield: 35000,
    idle: 15000,
    apy: 6.8,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const calculateTVL = (assets: VaultAsset[]) =>
  assets.reduce((sum, asset) => sum + asset.totalValue, 0);

const calculateTotalEarning = (assets: VaultAsset[]) =>
  assets.reduce((sum, asset) => sum + asset.earningYield, 0);

const calculateTotalIdle = (assets: VaultAsset[]) =>
  assets.reduce((sum, asset) => sum + asset.idle, 0);

// ─── Components ──────────────────────────────────────────────────────────────
function TVLCard({ tvl }: { tvl: number }) {
  return (
    <div className="col-span-full md:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00F5FF]/20">
          <DollarSign className="h-5 w-5 text-[#00F5FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Total Value Locked</h3>
          <p className="text-sm text-white/60">In Nebula Vaults</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-white">
        ${fmt(tvl)}
      </div>
    </div>
  );
}

function AssetBreakdownCard({ assets }: { assets: VaultAsset[] }) {
  const totalEarning = calculateTotalEarning(assets);
  const totalIdle = calculateTotalIdle(assets);
  const total = totalEarning + totalIdle;

  return (
    <div className="col-span-full md:col-span-2 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8A00FF]/20">
          <PieChart className="h-5 w-5 text-[#8A00FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Asset Breakdown</h3>
          <p className="text-sm text-white/60">Earning vs Idle Assets</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-white">Earning Yield</span>
          </div>
          <span className="text-sm font-semibold text-green-400">
            ${fmt(totalEarning)} ({((totalEarning / total) * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-white">Idle Assets</span>
          </div>
          <span className="text-sm font-semibold text-gray-400">
            ${fmt(totalIdle)} ({((totalIdle / total) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-[#00F5FF]"
          style={{ width: `${(totalEarning / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: VaultAsset }) {
  const earningPct = (asset.earningYield / asset.totalValue) * 100;
  const idlePct = (asset.idle / asset.totalValue) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00F5FF]/20">
            <span className="text-xs font-bold text-[#00F5FF]">{asset.symbol.slice(0, 2)}</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">{asset.token}</h4>
            <p className="text-xs text-white/60">{asset.apy.toFixed(1)}% APY</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">${fmt(asset.totalValue)}</div>
          <div className="text-xs text-white/60">Total Value</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-green-400">Earning: ${fmt(asset.earningYield)}</span>
          <span className="text-white/60">({earningPct.toFixed(1)}%)</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Idle: ${fmt(asset.idle)}</span>
          <span className="text-white/60">({idlePct.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-green-400"
          style={{ width: `${earningPct}%` }}
        />
      </div>
    </div>
  );
}

export default function VaultsPage() {
  const [assets] = useState<VaultAsset[]>(mockAssets);
  const tvl = calculateTVL(assets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="col-span-full">
        <h1 className="text-2xl font-bold text-white mb-2">Yield Vaults</h1>
        <p className="text-white/60">Manage your assets earning yield in Nebula</p>
      </div>

      {/* TVL Card */}
      <TVLCard tvl={tvl} />

      {/* Asset Breakdown */}
      <AssetBreakdownCard assets={assets} />

      {/* Individual Asset Cards */}
      {assets.map((asset) => (
        <AssetCard key={asset.token} asset={asset} />
      ))}
    </div>
  );
}