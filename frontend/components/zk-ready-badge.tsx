"use client";

/**
 * ZK-Ready Badge Component (Issue #463)
 * Shows on stream cards when Privacy Shield is enabled
 */

interface ZKReadyBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ZKReadyBadge({ 
  className = "", 
  size = "md" 
}: ZKReadyBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-2.5 py-1.5 text-xs",
    lg: "px-3 py-2 text-sm"
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-400/[0.1] ${sizeClasses[size]} font-body font-bold tracking-wider text-indigo-400 transition-all duration-200 hover:border-indigo-400/50 hover:bg-indigo-400/[0.15] ${className}`}
      style={{
        boxShadow: "0 0 8px rgba(99,102,241,0.15), inset 0 0 8px rgba(99,102,241,0.05)"
      }}
    >
      <span className="text-[12px]">🔐</span>
      <span>ZK-Ready</span>
    </div>
  );
}
