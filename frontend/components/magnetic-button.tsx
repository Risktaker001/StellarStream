"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  magneticStrength?: number; // 5-10px default
  variant?: "primary" | "secondary" | "danger";
}

export default function MagneticButton({
  children,
  onClick,
  disabled = false,
  className = "",
  magneticStrength = 8,
  variant = "primary",
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use framer-motion springs for smooth magnetic effect
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    
    // Calculate center of button
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from cursor to center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Calculate distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only apply magnetic effect within button bounds + small margin
    const maxDistance = Math.max(rect.width, rect.height) / 2;
    
    if (distance < maxDistance) {
      // Normalize and apply magnetic strength
      const strength = Math.min(1, (maxDistance - distance) / maxDistance);
      const moveX = (deltaX / distance) * magneticStrength * strength;
      const moveY = (deltaY / distance) * magneticStrength * strength;
      
      x.set(moveX);
      y.set(moveY);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, #00e5ff, #00b8d4)",
      shadow: "0 8px 32px rgba(138, 43, 226, 0.4)",
      hoverShadow: "0 12px 48px rgba(138, 43, 226, 0.6)",
    },
    secondary: {
      background: "linear-gradient(135deg, #8a2be2, #6a1bb2)",
      shadow: "0 8px 32px rgba(0, 229, 255, 0.4)",
      hoverShadow: "0 12px 48px rgba(0, 229, 255, 0.6)",
    },
    danger: {
      background: "linear-gradient(135deg, #ff4757, #ee5a6f)",
      shadow: "0 8px 32px rgba(255, 71, 87, 0.4)",
      hoverShadow: "0 12px 48px rgba(255, 71, 87, 0.6)",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <>
      <style>{`
        .magnetic-button {
          position: relative;
          padding: 16px 48px;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          overflow: hidden;
        }

        .magnetic-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .magnetic-button:hover::before {
          opacity: 1;
        }

        .magnetic-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .magnetic-button:active::after {
          width: 300px;
          height: 300px;
        }

        .magnetic-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>

      <motion.button
        ref={buttonRef}
        className={`magnetic-button ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        disabled={disabled}
        style={{
          background: currentVariant.background,
          boxShadow: isHovered ? currentVariant.hoverShadow : currentVariant.shadow,
          x,
          y,
        }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{
          boxShadow: { duration: 0.15 },
        }}
      >
        <span className="button-content">{children}</span>
      </motion.button>
    </>
  );
}
