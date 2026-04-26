"use client";

/**
 * StreamRowSkeleton
 *
 * Mirrors the exact DOM structure and spacing of StreamCard so there's
 * zero layout shift when real data loads in.
 *
 * StreamCard anatomy (p-4, rounded-xl, border, backdrop-blur-xl):
 *   ┌─ header row (mb-3) ──────────────────────────────────────────┐
 *   │  [icon 35×35]  [address ~112px wide]     [badge ~64px wide]  │
 *   └──────────────────────────────────────────────────────────────┘
 *   ┌─ space-y-2 body ─────────────────────────────────────────────┐
 *   │  "Total Amount"  (text-xs)        $value  (text-lg)          │
 *   │  "Rate"          (text-xs)        $x/ms   (text-sm)          │
 *   │  pt-2                                                        │
 *   │    "Progress"    (text-xs)        "xx.x%" (text-xs)          │
 *   │    [progress bar h-1.5]                                      │
 *   │  pt-1                                                        │
 *   │    "Ends: …"     (text-xs)                                   │
 *   └──────────────────────────────────────────────────────────────┘
 */
export default function StreamRowSkeleton() {
  return (
    <div
      className="relative rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 animate-pulse"
      aria-hidden="true"
    >
      {/* Header row — matches: flex items-start justify-between mb-3 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Icon: p-1.5 + Icon size={16} → ~35×35px */}
          <div className="w-[35px] h-[35px] rounded-lg bg-white/10" />
          {/* font-mono text-sm address */}
          <div className="h-[14px] w-28 rounded bg-white/10" />
        </div>
        {/* text-xs px-2 py-0.5 rounded-full badge */}
        <div className="h-[20px] w-16 rounded-full bg-white/10" />
      </div>

      {/* Body — matches: space-y-2 */}
      <div className="space-y-2">
        {/* Total Amount: text-xs label + text-lg font-semibold value */}
        <div className="flex justify-between items-baseline">
          <div className="h-[12px] w-20 rounded bg-white/10" />
          <div className="h-[28px] w-24 rounded bg-white/10" />
        </div>

        {/* Rate: text-xs label + text-sm value */}
        <div className="flex justify-between items-baseline">
          <div className="h-[12px] w-8 rounded bg-white/10" />
          <div className="h-[20px] w-32 rounded bg-white/10" />
        </div>

        {/* Progress section — matches: pt-2 */}
        <div className="pt-2">
          <div className="flex justify-between mb-1">
            <div className="h-[12px] w-12 rounded bg-white/10" />
            <div className="h-[12px] w-10 rounded bg-white/10" />
          </div>
          {/* h-1.5 bar track */}
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-2/5 rounded-full bg-white/10" />
          </div>
        </div>

        {/* End date — matches: text-xs pt-1 */}
        <div className="pt-1">
          <div className="h-[12px] w-24 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
