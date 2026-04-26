"use client";

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface StreamChartProps {
  totalAmount: number;
  startTime: number;
  endTime: number;
}

export default function StreamChart({ totalAmount, startTime, endTime }: StreamChartProps) {
  const duration = endTime - startTime;
  const points = 50;

  const data = Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1);
    const time = startTime + duration * progress;
    const unlocked = totalAmount * progress;

    return {
      time,
      unlocked,
      label: formatTime(time - startTime)
    };
  });

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#00f5ff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            stroke="#00f5ff"
            strokeWidth={1}
            style={{ filter: "drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))" }}
            tick={{ fill: "#00f5ff", fontSize: 12 }}
            axisLine={{ strokeWidth: 1 }}
            tickLine={false}
          />

          <YAxis
            stroke="#00f5ff"
            strokeWidth={1}
            style={{ filter: "drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))" }}
            tick={{ fill: "#00f5ff", fontSize: 12 }}
            axisLine={{ strokeWidth: 1 }}
            tickLine={false}
            tickFormatter={(value) => formatAmount(value)}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              border: "1px solid rgba(0, 245, 255, 0.3)",
              borderRadius: "8px",
              color: "#00f5ff"
            }}
            formatter={(value) => [formatAmount(typeof value === 'number' ? value : 0), "Unlocked"]}
            labelFormatter={(label) => `Time: ${label}`}
          />

          <Area
            type="linear"
            dataKey="unlocked"
            stroke="#00f5ff"
            strokeWidth={2}
            fill="url(#cyanGradient)"
            style={{ filter: "drop-shadow(0 0 6px rgba(0, 245, 255, 0.8))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(seconds / 60)}m`;
}

function formatAmount(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}
