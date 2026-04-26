"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TokenFlowBadgeProps {
  /** Direction of the stream flow */
  direction: "incoming" | "outgoing";
  /** Size of the badge in pixels */
  size?: "sm" | "md" | "lg";
  /** Custom className for additional styling */
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "h-5 w-8 px-1",
    icon: 12,
    text: "text-xs",
  },
  md: {
    container: "h-6 w-10 px-1.5",
    icon: 14,
    text: "text-xs",
  },
  lg: {
    container: "h-7 w-12 px-2",
    icon: 16,
    text: "text-sm",
  },
};

export default function TokenFlowBadge({
  direction,
  size = "md",
  className = "",
}: TokenFlowBadgeProps) {
  const config = sizeConfig[size];
  const isIncoming = direction === "incoming";

  // Animation variants for the pulsing effect
  const pulseVariants = {
    incoming: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    outgoing: {
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  // Container animation for subtle breathing effect
  const containerVariants = {
    incoming: {
      boxShadow: [
        "0 0 0 rgba(0, 229, 255, 0)",
        "0 0 8px rgba(0, 229, 255, 0.3)",
        "0 0 0 rgba(0, 229, 255, 0)",
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    outgoing: {
      boxShadow: [
        "0 0 0 rgba(138, 43, 226, 0)",
        "0 0 10px rgba(138, 43, 226, 0.4)",
        "0 0 0 rgba(138, 43, 226, 0)",
      ],
      transition: {
        duration: 2.2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.div
      className={`
        ${config.container}
        inline-flex items-center justify-center
        rounded-full
        border border-white/10
        backdrop-blur-sm
        relative overflow-hidden
        ${isIncoming 
          ? "bg-cyan-500/10 border-cyan-400/20" 
          : "bg-violet-500/10 border-violet-400/20"
        }
        ${className}
      `}
      variants={containerVariants}
      animate={direction}
      initial={false}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
      
      {/* Animated arrow icon */}
      <motion.div
        variants={pulseVariants}
        animate={direction}
        initial={false}
        className={`
          relative z-10 flex items-center justify-center
          ${isIncoming ? "text-cyan-400" : "text-violet-400"}
        `}
      >
        {isIncoming ? (
          <ArrowDown size={config.icon} strokeWidth={2.5} />
        ) : (
          <ArrowUp size={config.icon} strokeWidth={2.5} />
        )}
      </motion.div>

      {/* Inner glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-full opacity-30
          ${isIncoming 
            ? "bg-gradient-to-br from-cyan-400/20 to-cyan-600/10" 
            : "bg-gradient-to-br from-violet-400/20 to-violet-600/10"
          }
        `} 
      />
    </motion.div>
  );
}