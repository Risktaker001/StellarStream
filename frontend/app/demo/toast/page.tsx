"use client";

import { toast } from "@/lib/toast";

export default function ToastDemoPage() {
  const mockTxHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-heading font-bold mb-2 liquid-chrome">
          Toast Notifications Demo
        </h1>
        <p className="text-gray-400 mb-8">
          Test the Stellar Glass toast notification system
        </p>

        <div className="space-y-4">
          {/* Stream Operations */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary mb-3">
              Stream Operations
            </h2>
            
            <button
              onClick={() => toast.streamCreated(mockTxHash)}
              className="w-full px-6 py-3 bg-primary/10 border border-primary/30 rounded-xl text-primary hover:bg-primary/20 transition-all font-medium"
            >
              Stream Created
            </button>

            <button
              onClick={() => toast.withdrawalComplete("1,250.50", "USDC", mockTxHash)}
              className="w-full px-6 py-3 bg-primary/10 border border-primary/30 rounded-xl text-primary hover:bg-primary/20 transition-all font-medium"
            >
              Withdrawal Complete
            </button>

            <button
              onClick={() => toast.streamCancelled(mockTxHash)}
              className="w-full px-6 py-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary hover:bg-secondary/20 transition-all font-medium"
            >
              Stream Cancelled
            </button>

            <button
              onClick={() => toast.transactionFailed("Insufficient XLM for gas fees")}
              className="w-full px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all font-medium"
            >
              Transaction Failed
            </button>
          </div>

          {/* Generic Toast Types */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <h2 className="text-lg font-semibold text-primary mb-3">
              Generic Notifications
            </h2>

            <button
              onClick={() =>
                toast.success({
                  title: "Success!",
                  description: "Your operation completed successfully",
                  txHash: mockTxHash,
                })
              }
              className="w-full px-6 py-3 bg-primary/10 border border-primary/30 rounded-xl text-primary hover:bg-primary/20 transition-all font-medium"
            >
              Success Toast
            </button>

            <button
              onClick={() =>
                toast.error({
                  title: "Error Occurred",
                  description: "Something went wrong with your request",
                })
              }
              className="w-full px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all font-medium"
            >
              Error Toast
            </button>

            <button
              onClick={() =>
                toast.warning({
                  title: "Warning",
                  description: "Please review your transaction details",
                })
              }
              className="w-full px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 hover:bg-yellow-500/20 transition-all font-medium"
            >
              Warning Toast
            </button>

            <button
              onClick={() =>
                toast.info({
                  title: "Information",
                  description: "Your stream will start in 5 minutes",
                })
              }
              className="w-full px-6 py-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary hover:bg-secondary/20 transition-all font-medium"
            >
              Info Toast
            </button>
          </div>

          {/* Custom Duration */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <h2 className="text-lg font-semibold text-primary mb-3">
              Custom Duration
            </h2>

            <button
              onClick={() =>
                toast.success({
                  title: "Quick Toast",
                  description: "This will disappear in 2 seconds",
                  duration: 2000,
                })
              }
              className="w-full px-6 py-3 bg-primary/10 border border-primary/30 rounded-xl text-primary hover:bg-primary/20 transition-all font-medium"
            >
              2 Second Toast
            </button>

            <button
              onClick={() =>
                toast.info({
                  title: "Long Toast",
                  description: "This will stay for 10 seconds",
                  duration: 10000,
                })
              }
              className="w-full px-6 py-3 bg-secondary/10 border border-secondary/30 rounded-xl text-secondary hover:bg-secondary/20 transition-all font-medium"
            >
              10 Second Toast
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-sm font-semibold text-primary mb-2">Usage Example:</h3>
          <pre className="text-xs text-gray-400 overflow-x-auto">
{`import { toast } from "@/lib/toast";

// Stream created
toast.streamCreated(txHash);

// Withdrawal complete
toast.withdrawalComplete("1,250.50", "USDC", txHash);

// Custom toast
toast.success({
  title: "Success!",
  description: "Operation completed",
  txHash: "abc123...",
  duration: 5000
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
