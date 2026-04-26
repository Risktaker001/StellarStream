import { useEffect, useState, useRef, RefObject } from "react";

export interface ScrollBlurState {
  isScrolled: boolean;
  scrollProgress: number; // 0 to 1
  blurIntensity: "md" | "lg" | "xl" | "2xl";
  bgOpacity: number; // 0.05 to 0.15
}

interface UseScrollBlurOptions {
  threshold?: number; // Pixels scrolled before considering "scrolled"
  maxScroll?: number; // Max scroll distance for full effect
}

/**
 * Custom hook for adaptive lucency scroll effects
 * Returns scroll state and blur intensity that increases as user scrolls
 */
export function useScrollBlur(
  options: UseScrollBlurOptions = {}
) {
  const { threshold = 10, maxScroll = 200 } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollBlurState>({
    isScrolled: false,
    scrollProgress: 0,
    blurIntensity: "md",
    bgOpacity: 0.05,
  });

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;
      const isScrolled = scrollTop > threshold;

      // Calculate scroll progress (0 to 1)
      const progress = Math.min(scrollTop / maxScroll, 1);

      // Map progress to blur intensity
      let blurIntensity: "md" | "lg" | "xl" | "2xl";
      if (progress < 0.25) {
        blurIntensity = "md";
      } else if (progress < 0.5) {
        blurIntensity = "lg";
      } else if (progress < 0.75) {
        blurIntensity = "xl";
      } else {
        blurIntensity = "2xl";
      }

      // Map progress to background opacity (0.05 to 0.15)
      const bgOpacity = 0.05 + (progress * 0.1);

      setScrollState({
        isScrolled,
        scrollProgress: progress,
        blurIntensity,
        bgOpacity,
      });
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [threshold, maxScroll]);

  return [scrollState, scrollRef] as const;
}
