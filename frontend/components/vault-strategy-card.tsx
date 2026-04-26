"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Zap } from "lucide-react";

interface VaultStrategy {
  id: string;
  name: string;
  type: "safe" | "balanced" | "aggressive";
  protocol: string;
  apy: number;
  icon: typeof Shield;
}

interface VaultStrategyCardProps {
  strategies?: VaultStrategy[];
  selected?: string;
  onSelect?: (strategyId: string) => void;
}

const defaultStrategies: VaultStrategy[] = [
  {
    id: "yxlm",
    name: "Safe",
    type: "safe",
    protocol: "yXLM",
    apy: 4.2,
    icon: Shield,
  },
  {
    id: "blend",
    name: "Balanced",
    type: "balanced",
    protocol: "Blend Protocol",
    apy: 8.7,
    icon: TrendingUp,
  },
  {
    id: "liquidity",
    name: "Aggressive",
    type: "aggressive",
    protocol: "Liquidity Pool",
    apy: 15.3,
    icon: Zap,
  },
];

export function VaultStrategyCard({
  strategies = defaultStrategies,
  selected,
  onSelect,
}: VaultStrategyCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {strategies.map((strategy) => {
        const Icon = strategy.icon;
        const isSelected = selected === strategy.id;

        return (
          <motion.button
            key={strategy.id}
            onClick={() => onSelect?.(strategy.id)}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
              backdrop-blur-xl border-2
              ${
                isSelected
                  ? "border-[#00F5FF] bg-[#00F5FF]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }
            `}
          >
            {/* Glow effect */}
            {isSelected && (
              <motion.div
                className="absolute inset-0 bg-[#00F5FF]/20 blur-2xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[#00F5FF]" />
                  <span className="text-sm font-semibold text-white/70">
                    {strategy.name}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full bg-[#00F5FF]"
                  />
                )}
              </div>

              {/* APY Display */}
              <div className="flex flex-col">
                <motion.span
                  className={`text-4xl font-bold transition-colors duration-300 ${
                    isSelected ? "text-[#00F5FF]" : "text-white"
                  }`}
                  animate={
                    isSelected
                      ? {
                          textShadow: [
                            "0 0 20px rgba(0, 245, 255, 0.5)",
                            "0 0 40px rgba(0, 245, 255, 0.8)",
                            "0 0 20px rgba(0, 245, 255, 0.5)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {strategy.apy}%
                </motion.span>
                <span className="text-xs text-white/50">APY</span>
              </div>

              {/* Protocol */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-sm text-white/60">{strategy.protocol}</span>
              </div>
            </div>

            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${
                isSelected ? "opacity-100" : ""
              }`}
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(0, 245, 255, 0.1), transparent 70%)",
              }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
