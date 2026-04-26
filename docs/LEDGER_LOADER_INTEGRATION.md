# Stellar Ledger Loader - Integration Guide

## Quick Start Integration

This guide shows you how to integrate the Stellar Ledger Loader into your existing StellarStream components.

## Installation

The component is already available in your project:

```tsx
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
```

## Real-World Integration Examples

### 1. Stream Creation Flow

```tsx
// frontend/app/dashboard/create-stream/page.tsx
"use client";

import { useState } from "react";
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { toast } from "@/lib/toast";

export default function CreateStreamPage() {
  const [isWaitingForLedger, setIsWaitingForLedger] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    token: "USDC",
    duration: 30,
  });

  const handleCreateStream = async () => {
    try {
      // Validate form
      if (!formData.recipient || !formData.amount) {
        toast.error({
          title: "Validation Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      // Show ledger loader
      setIsWaitingForLedger(true);

      // Submit transaction to Stellar
      const result = await createStreamTransaction({
        recipient: formData.recipient,
        amount: formData.amount,
        token: formData.token,
        duration: formData.duration,
      });

      // Wait for ledger to close (handled by loader)
      await waitForLedgerClose(result.txHash);

      // Show success notification
      toast.streamCreated(result.txHash);

      // Redirect to streams page
      router.push("/dashboard/streams");

    } catch (error) {
      console.error("Stream creation failed:", error);
      
      toast.error({
        title: "Stream Creation Failed",
        description: error.message || "Please try again",
      });
    } finally {
      setIsWaitingForLedger(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Your form UI here */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateStream();
      }}>
        {/* Form fields */}
        <button type="submit" className="neon-glow">
          Create Stream
        </button>
      </form>

      {/* Ledger Loader */}
      <StellarLedgerLoader
        isOpen={isWaitingForLedger}
        message="Creating your payment stream..."
        estimatedDuration={5000}
        onComplete={() => {
          // Optional: Add slight delay before hiding
          setTimeout(() => setIsWaitingForLedger(false), 300);
        }}
      />
    </div>
  );
}
```

### 2. Withdrawal Flow

```tsx
// frontend/components/topupandwithdrawal.tsx
"use client";

import { useState } from "react";
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { toast } from "@/lib/toast";

interface WithdrawalProps {
  streamId: string;
  availableAmount: string;
  token: string;
}

export function WithdrawalComponent({ 
  streamId, 
  availableAmount, 
  token 
}: WithdrawalProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);

      // Submit withdrawal transaction
      const result = await withdrawFromStream({
        streamId,
        amount: withdrawAmount,
      });

      // Show success toast after ledger closes
      toast.withdrawalComplete(withdrawAmount, token, result.txHash);

      // Refresh stream data
      await refreshStreamData(streamId);

    } catch (error) {
      toast.transactionFailed(error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-semibold text-white mb-4">
          Withdraw Funds
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70">Available</label>
            <p className="text-2xl font-bold text-[#00f5ff]">
              {availableAmount} {token}
            </p>
          </div>

          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            max={availableAmount}
          />

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount}
            className="neon-glow w-full rounded-full px-6 py-3 font-semibold"
          >
            {isWithdrawing ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>

      <StellarLedgerLoader
        isOpen={isWithdrawing}
        message="Processing withdrawal..."
        estimatedDuration={5000}
      />
    </>
  );
}
```

### 3. Stream Cancellation

```tsx
// frontend/components/stream-actions.tsx
"use client";

import { useState } from "react";
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { toast } from "@/lib/toast";

interface StreamActionsProps {
  streamId: string;
  onCancelled: () => void;
}

export function StreamActions({ streamId, onCancelled }: StreamActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancelStream = async () => {
    try {
      setShowConfirm(false);
      setIsCancelling(true);

      const result = await cancelStreamTransaction(streamId);

      toast.streamCancelled(result.txHash);
      onCancelled();

    } catch (error) {
      toast.transactionFailed(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-400 hover:bg-red-500/20"
      >
        Cancel Stream
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="glass-card max-w-md p-6">
            <h3 className="font-heading text-xl font-semibold text-white mb-4">
              Cancel Stream?
            </h3>
            <p className="text-white/70 mb-6">
              This will stop the stream and return remaining funds to the sender.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                Keep Stream
              </button>
              <button
                onClick={handleCancelStream}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 text-red-400"
              >
                Cancel Stream
              </button>
            </div>
          </div>
        </div>
      )}

      <StellarLedgerLoader
        isOpen={isCancelling}
        message="Cancelling stream..."
        estimatedDuration={5000}
      />
    </>
  );
}
```

### 4. Batch Operations

```tsx
// frontend/components/batch-stream-creator.tsx
"use client";

import { useState } from "react";
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { toast } from "@/lib/toast";

interface BatchStream {
  recipient: string;
  amount: string;
  duration: number;
}

export function BatchStreamCreator() {
  const [streams, setStreams] = useState<BatchStream[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleCreateBatch = async () => {
    try {
      setIsProcessing(true);

      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        
        // Update progress message
        setCurrentProgress(i + 1);

        // Create individual stream
        await createStreamTransaction(stream);

        // Wait for ledger
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      toast.success({
        title: "Batch Creation Complete",
        description: `Successfully created ${streams.length} streams`,
      });

    } catch (error) {
      toast.transactionFailed(error.message);
    } finally {
      setIsProcessing(false);
      setCurrentProgress(0);
    }
  };

  return (
    <>
      {/* Batch form UI */}
      <button onClick={handleCreateBatch}>
        Create {streams.length} Streams
      </button>

      <StellarLedgerLoader
        isOpen={isProcessing}
        message={`Creating stream ${currentProgress} of ${streams.length}...`}
        estimatedDuration={5000}
      />
    </>
  );
}
```

## Advanced Patterns

### Pattern 1: Chained Transactions

```tsx
const handleComplexOperation = async () => {
  setIsWaiting(true);

  try {
    // Step 1: Approve token
    await approveToken();
    
    // Step 2: Create stream
    await createStream();
    
    // Step 3: Set up notifications
    await setupNotifications();

    toast.success({
      title: "Setup Complete",
      description: "Your stream is now active",
    });
  } catch (error) {
    toast.error({
      title: "Operation Failed",
      description: error.message,
    });
  } finally {
    setIsWaiting(false);
  }
};
```

### Pattern 2: Optimistic Updates

```tsx
const handleWithdraw = async () => {
  // Optimistically update UI
  const optimisticBalance = currentBalance - withdrawAmount;
  setBalance(optimisticBalance);

  setIsWaiting(true);

  try {
    const result = await withdrawFromStream();
    
    // Confirm with actual balance
    setBalance(result.newBalance);
    
    toast.withdrawalComplete(withdrawAmount, token, result.txHash);
  } catch (error) {
    // Revert optimistic update
    setBalance(currentBalance);
    
    toast.transactionFailed(error.message);
  } finally {
    setIsWaiting(false);
  }
};
```

### Pattern 3: Error Recovery

```tsx
const handleTransactionWithRetry = async () => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      setIsWaiting(true);
      
      const result = await submitTransaction();
      
      toast.success({
        title: "Transaction Successful",
        txHash: result.txHash,
      });
      
      return result;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        toast.error({
          title: "Transaction Failed",
          description: `Failed after ${maxRetries} attempts`,
        });
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      if (attempt >= maxRetries) {
        setIsWaiting(false);
      }
    }
  }
};
```

## Testing

### Manual Testing Checklist

- [ ] Loader appears when transaction starts
- [ ] Progress bar animates smoothly
- [ ] 3D cube rotates continuously
- [ ] Message displays correctly
- [ ] Loader disappears after completion
- [ ] Toast notification appears after loader
- [ ] Works on mobile devices
- [ ] Keyboard navigation works
- [ ] Screen reader announces state changes

### Test Scenarios

```tsx
// Test with different durations
<StellarLedgerLoader isOpen={true} estimatedDuration={3000} />
<StellarLedgerLoader isOpen={true} estimatedDuration={7000} />

// Test with custom messages
<StellarLedgerLoader 
  isOpen={true} 
  message="Custom operation in progress..." 
/>

// Test rapid open/close
const [isOpen, setIsOpen] = useState(false);
setIsOpen(true);
setTimeout(() => setIsOpen(false), 100); // Should handle gracefully
```

## Performance Optimization

### Lazy Loading

```tsx
import dynamic from "next/dynamic";

const StellarLedgerLoader = dynamic(
  () => import("@/components/stellar-ledger-loader").then(
    mod => ({ default: mod.StellarLedgerLoader })
  ),
  { ssr: false }
);
```

### Memoization

```tsx
import { memo } from "react";

const MemoizedLoader = memo(StellarLedgerLoader, (prev, next) => {
  return prev.isOpen === next.isOpen && 
         prev.message === next.message;
});
```

## Troubleshooting

### Issue: Loader doesn't show

**Solution**: Check that `isOpen` prop is properly controlled

```tsx
// ❌ Wrong
<StellarLedgerLoader isOpen={true} /> // Always visible

// ✅ Correct
const [isOpen, setIsOpen] = useState(false);
<StellarLedgerLoader isOpen={isOpen} />
```

### Issue: Progress bar doesn't animate

**Solution**: Ensure `estimatedDuration` is set and > 0

```tsx
// ❌ Wrong
<StellarLedgerLoader isOpen={true} estimatedDuration={0} />

// ✅ Correct
<StellarLedgerLoader isOpen={true} estimatedDuration={5000} />
```

### Issue: Multiple loaders stack

**Solution**: Use a single loader instance with dynamic messages

```tsx
// ❌ Wrong - Multiple instances
<StellarLedgerLoader isOpen={isCreating} message="Creating..." />
<StellarLedgerLoader isOpen={isWithdrawing} message="Withdrawing..." />

// ✅ Correct - Single instance
const [loaderState, setLoaderState] = useState({ isOpen: false, message: "" });

<StellarLedgerLoader 
  isOpen={loaderState.isOpen} 
  message={loaderState.message} 
/>
```

## Best Practices Summary

1. **Always handle errors**: Show appropriate toast notifications
2. **Provide context**: Use specific messages for each operation
3. **Clean up state**: Reset loader state in finally blocks
4. **User feedback**: Combine with toast notifications for complete UX
5. **Accessibility**: Test with keyboard and screen readers
6. **Performance**: Consider lazy loading for large apps
7. **Testing**: Test on various devices and network conditions

## Next Steps

1. Integrate into your transaction flows
2. Customize messages for your use cases
3. Test thoroughly on different devices
4. Monitor user feedback
5. Adjust durations based on actual ledger times

## Support

For questions or issues:
- Check the main documentation: `STELLAR_LEDGER_LOADER.md`
- View the demo: `/demo/ledger-loader`
- Review existing implementations in the codebase
