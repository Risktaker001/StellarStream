"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Changelog Modal Component (Issue #475)
 * One-time popup for returning users showing V2 improvements
 * Features a slide deck highlighting Yield, Privacy (P25), Speed (Whisk)
 */

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANGELOG_SLIDES = [
  {
    id: 1,
    title: "Welcome to StellarStream V2",
    subtitle: "A new era of streaming payments",
    content: "We've completely rebuilt the protocol and interface to bring you faster, more private, and more lucrative streaming.",
    accent: "#22d3ee",
    icon: "✨",
  },
  {
    id: 2,
    title: "Yield Enabled 💰",
    subtitle: "Earn rewards on streaming funds",
    content: "Your idle stream balances now automatically yield in real-time. Watch your streams grow while payments flow. Choose between different yield strategies through our new Yield Mode Toggle.",
    accent: "#fbbf24",
    icon: "📈",
    features: [
      "Real-time yield on streamed assets",
      "Multiple yield strategies",
      "Liquid yield reinvestment",
    ],
  },
  {
    id: 3,
    title: "Privacy Redefined 🔐",
    subtitle: "Protocol 25 (X-Ray) Integration",
    content: "Introduce Protocol 25 with selective disclosure. Use our Privacy Shield toggle to enable Poseidon hashing and zero-knowledge stream metadata.",
    accent: "#8b5cf6",
    icon: "🔍",
    features: [
      "Poseidon hash privacy",
      "Selective disclosure",
      "ZK-Ready streams",
      "Full X-Ray compatibility",
    ],
  },
  {
    id: 4,
    title: "Speed Unleashed ⚡",
    subtitle: "Whisk Protocol Integration",
    content: "Experience lightning-fast streaming with Whisk protocol. Sub-second transactions, zero-fee settlements via sponsorship, and gasless signature-based creation.",
    accent: "#10b981",
    icon: "🚀",
    features: [
      "Sub-second transactions",
      "Gasless creation with signatures",
      "Instant settlement",
    ],
  },
  {
    id: 5,
    title: "Ready to Stream?",
    subtitle: "Your dashboard awaits",
    content: "Explore all new features. Create your first V2 stream with yield enabled, privacy shields, and blazing-fast transactions.",
    accent: "#06b6d4",
    icon: "🎯",
  },
];

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const slide = CHANGELOG_SLIDES[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === CHANGELOG_SLIDES.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    // Save to localStorage that user has seen changelog
    localStorage.setItem("stellar_changelog_v2_viewed", "true");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "rgba(0, 0, 0, 0.6)" }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-white/[0.08] backdrop-blur-2xl overflow-hidden"
        style={{
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 0 60px rgba(34,211,238,0.2), 0 0 120px rgba(34,211,238,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
        >
          <X size={20} className="text-white/60" />
        </button>

        {/* Slide Content */}
        <div
          className="min-h-96 p-8 md:p-12 flex flex-col justify-center"
          key={slide.id}
          style={{
            animation: "slideTransition 0.4s cubic-bezier(0.16,1,0.3,1)",
            background: `linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05)), radial-gradient(circle at 100% 0%, ${slide.accent}20, transparent 50%)`,
          }}
        >
          <style>{`
            @keyframes slideTransition {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="space-y-6">
            {/* Icon and Title */}
            <div className="space-y-3">
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-xl border text-2xl"
                style={{
                  background: `${slide.accent}15`,
                  borderColor: `${slide.accent}40`,
                  color: slide.accent,
                }}
              >
                {slide.icon}
              </div>
              <div>
                <h2
                  className="font-heading text-3xl md:text-4xl mb-2"
                  style={{ color: slide.accent }}
                >
                  {slide.title}
                </h2>
                <p className="font-body text-sm text-white/50">
                  {slide.subtitle}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="font-body text-base text-white/70 leading-relaxed">
              {slide.content}
            </p>

            {/* Features list (if present) */}
            {slide.features && (
              <ul className="space-y-2.5">
                {slide.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 font-body text-sm text-white/60"
                  >
                    <span
                      className="text-xs mt-1 flex-shrink-0"
                      style={{ color: slide.accent }}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-white/10 bg-white/[0.02] px-8 py-5 md:px-12 flex items-center justify-between">
          {/* Left: Previous Button */}
          <button
            onClick={handlePrev}
            disabled={isFirstSlide}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-bold transition-all duration-200 ${
              isFirstSlide
                ? "text-white/20 cursor-not-allowed"
                : "border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/90"
            }`}
          >
            <ChevronLeft size={16} />
            <span className="hidden md:inline">Previous</span>
          </button>

          {/* Center: Slide Indicator */}
          <div className="flex items-center gap-2">
            {CHANGELOG_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-8"
                    : "w-2 bg-white/20 hover:bg-white/30"
                }`}
                style={
                  idx === currentSlide
                    ? {
                        background: slide.accent,
                        boxShadow: `0 0 8px ${slide.accent}60`,
                      }
                    : {}
                }
              />
            ))}
          </div>

          {/* Right: Next Button or CTA */}
          {isLastSlide ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-bold border border-cyan-400/40 bg-cyan-400/10 text-cyan-400 transition-all duration-200 hover:bg-cyan-400/15 hover:border-cyan-400/60"
              style={{
                boxShadow: "0 0 12px rgba(34,211,238,0.2)",
              }}
            >
              <span>Get Started</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-bold border border-white/10 bg-white/[0.03] text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/90"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Slide counter - mobile only */}
        <div className="md:hidden text-center py-2 bg-white/[0.02] border-t border-white/10">
          <p className="font-body text-xs text-white/40">
            {currentSlide + 1} of {CHANGELOG_SLIDES.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage changelog modal state
 * Ensures it only shows once per session
 */
export function useChangelogModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Only show on client side
    const hasViewed = localStorage.getItem("stellar_changelog_v2_viewed");
    // Show if user hasn't viewed it before
    setShouldShow(!hasViewed);
  }, []);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen: shouldShow && isOpen, open, close };
}
