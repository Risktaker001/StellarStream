# Stellar Ledger Loader - Code Examples

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Using Custom Hook](#using-custom-hook)
3. [Sequential Operations](#sequential-operations)
4. [Error Handling](#error-handling)
5. [Advanced Patterns](#advanced-patterns)

## Basic Usage

### Simple Transaction

```tsx
import { useState } from "react";
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";

function SimpleTransaction() {
  const [isWaiting, setIsWaiting] = useState(false);

  const handleTransaction = async () => {
    setIsWaiting(true);
    
    try {
      await submitTransaction();
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <>
      <button onClick={handleTransaction}>Submit</button>
      <StellarLedgerLoader isOpen={isWaiting} />
    </>
  );
}
```

### With Custom Message

```tsx
function CustomMessage() {
  const [isWaiting, setIsWaiting] = useState(false);

  return (
    <>
      <button onClick={() => setIsWaiting(true)}>Start</button>
      
      <StellarLedgerLoader
        isOpen={isWaiting}
        message="Processing your payment stream..."
        estimatedDuration={6000}
        onComplete={() => setIsWaiting(false)}
      />
    </>
  );
}
```

## Using Custom Hook

### Basic Hook Usage

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";
import { toast } from "@/lib/toast";

function StreamCreation() {
  const loader = useLedgerLoader();

  const handleCreateStream = async () => {
    loader.showLoader("create_stream");

    try {
      const result = await createStreamTransaction();
      
      toast.streamCreated(result.txHash);
    } catch (error) {
      toast.transactionFailed(error.message);
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <button onClick={handleCreateStream}>Create Stream</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### Multiple Operations

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";

function MultipleOperations() {
  const loader = useLedgerLoader();

  const handleWithdraw = async () => {
    loader.showLoader("withdraw");
    try {
      await withdrawFunds();
    } finally {
      loader.hideLoader();
    }
  };

  const handleCancel = async () => {
    loader.showLoader("cancel_stream");
    try {
      await cancelStream();
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <button onClick={handleWithdraw}>Withdraw</button>
      <button onClick={handleCancel}>Cancel</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### Custom Context

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";

function CustomContext() {
  const loader = useLedgerLoader();

  const handleSpecialOperation = async () => {
    loader.showLoader({
      operation: "custom",
      message: "Performing special operation...",
      estimatedDuration: 8000,
    });

    try {
      await specialOperation();
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <button onClick={handleSpecialOperation}>Special Op</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

## Sequential Operations

### Batch Stream Creation

```tsx
import { useSequentialLoader } from "@/lib/use-ledger-loader";
import { toast } from "@/lib/toast";

function BatchStreamCreation() {
  const loader = useSequentialLoader();
  const [streams, setStreams] = useState([
    { recipient: "GABC...", amount: "100" },
    { recipient: "GDEF...", amount: "200" },
    { recipient: "GHIJ...", amount: "300" },
  ]);

  const handleCreateBatch = async () => {
    const steps = streams.map((stream, index) => ({
      message: `Creating stream for ${stream.recipient.slice(0, 8)}...`,
      duration: 5000,
    }));

    try {
      await loader.startSequence(steps);
      
      toast.success({
        title: "Batch Complete",
        description: `Created ${streams.length} streams successfully`,
      });
    } catch (error) {
      toast.error({
        title: "Batch Failed",
        description: error.message,
      });
    }
  };

  return (
    <>
      <button onClick={handleCreateBatch}>
        Create {streams.length} Streams
      </button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### Multi-Step Transaction

```tsx
import { useSequentialLoader } from "@/lib/use-ledger-loader";

function MultiStepTransaction() {
  const loader = useSequentialLoader();

  const handleComplexOperation = async () => {
    await loader.startSequence([
      { message: "Step 1: Approving token...", duration: 5000 },
      { message: "Step 2: Creating stream...", duration: 5000 },
      { message: "Step 3: Setting up notifications...", duration: 3000 },
    ]);
  };

  return (
    <>
      <button onClick={handleComplexOperation}>Start Process</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
      
      {loader.totalSteps > 0 && (
        <div className="text-white/70 text-sm mt-2">
          Step {loader.currentStep} of {loader.totalSteps}
        </div>
      )}
    </>
  );
}
```

## Error Handling

### With Try-Catch

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";
import { toast } from "@/lib/toast";

function WithErrorHandling() {
  const loader = useLedgerLoader();

  const handleTransaction = async () => {
    loader.showLoader("create_stream");

    try {
      const result = await createStream();
      
      toast.success({
        title: "Success",
        description: "Stream created successfully",
        txHash: result.txHash,
      });
    } catch (error) {
      if (error.code === "USER_REJECTED") {
        toast.warning({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
        });
      } else if (error.code === "INSUFFICIENT_BALANCE") {
        toast.error({
          title: "Insufficient Balance",
          description: "You don't have enough funds",
        });
      } else {
        toast.error({
          title: "Transaction Failed",
          description: error.message || "Please try again",
        });
      }
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <button onClick={handleTransaction}>Create Stream</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### With Retry Logic

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";
import { toast } from "@/lib/toast";

function WithRetry() {
  const loader = useLedgerLoader();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleTransactionWithRetry = async () => {
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      loader.showLoader({
        operation: "custom",
        message: attempt > 0 
          ? `Retrying transaction (${attempt}/${MAX_RETRIES})...`
          : "Processing transaction...",
        estimatedDuration: 5000,
      });

      try {
        const result = await submitTransaction();
        
        toast.success({
          title: "Success",
          txHash: result.txHash,
        });
        
        loader.hideLoader();
        setRetryCount(0);
        return;
      } catch (error) {
        attempt++;
        
        if (attempt >= MAX_RETRIES) {
          toast.error({
            title: "Transaction Failed",
            description: `Failed after ${MAX_RETRIES} attempts`,
          });
          loader.hideLoader();
          setRetryCount(0);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  return (
    <>
      <button onClick={handleTransactionWithRetry}>
        Submit with Retry
      </button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

## Advanced Patterns

### Optimistic Updates

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";
import { toast } from "@/lib/toast";

function OptimisticWithdrawal() {
  const loader = useLedgerLoader();
  const [balance, setBalance] = useState(1000);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const handleWithdraw = async () => {
    // Optimistically update UI
    const newBalance = balance - withdrawAmount;
    setBalance(newBalance);

    loader.showLoader("withdraw");

    try {
      const result = await withdrawFromStream(withdrawAmount);
      
      // Confirm with actual balance from blockchain
      setBalance(result.actualBalance);
      
      toast.withdrawalComplete(
        withdrawAmount.toString(),
        "USDC",
        result.txHash
      );
    } catch (error) {
      // Revert optimistic update
      setBalance(balance);
      
      toast.transactionFailed(error.message);
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <div>Balance: {balance} USDC</div>
      <input
        type="number"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
      />
      <button onClick={handleWithdraw}>Withdraw</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### With Progress Updates

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";

function WithProgressUpdates() {
  const loader = useLedgerLoader();

  const handleLongOperation = async () => {
    loader.showLoader("custom");

    try {
      // Step 1
      loader.updateMessage("Validating transaction...");
      await validateTransaction();
      
      // Step 2
      loader.updateMessage("Submitting to network...");
      await submitToNetwork();
      
      // Step 3
      loader.updateMessage("Waiting for confirmation...");
      await waitForConfirmation();
      
      toast.success({ title: "Complete" });
    } catch (error) {
      toast.error({ title: "Failed", description: error.message });
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <button onClick={handleLongOperation}>Start</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### Conditional Loading

```tsx
import { useLedgerLoader } from "@/lib/use-ledger-loader";

function ConditionalLoading() {
  const loader = useLedgerLoader();
  const [needsApproval, setNeedsApproval] = useState(false);

  const handleTransaction = async () => {
    // Check if approval is needed
    const approval = await checkTokenApproval();
    setNeedsApproval(!approval);

    if (!approval) {
      loader.showLoader("approve_token");
      await approveToken();
    }

    loader.showLoader("create_stream");
    
    try {
      await createStream();
      toast.success({ title: "Stream Created" });
    } finally {
      loader.hideLoader();
    }
  };

  return (
    <>
      <button onClick={handleTransaction}>Create Stream</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### With Auto-Timeout

```tsx
import { useLedgerLoaderWithTimeout } from "@/lib/use-ledger-loader";

function WithAutoTimeout() {
  const loader = useLedgerLoaderWithTimeout();

  const handleQuickOperation = async () => {
    // Auto-hides after 5 seconds
    loader.showLoader("withdraw", 5000);
    
    try {
      await quickTransaction();
    } catch (error) {
      // Loader will auto-hide, but we can hide it early on error
      loader.hideLoader();
      toast.error({ title: "Failed", description: error.message });
    }
  };

  return (
    <>
      <button onClick={handleQuickOperation}>Quick Op</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

## Testing Examples

### Mock Transaction

```tsx
function TestLoader() {
  const loader = useLedgerLoader();

  const mockTransaction = async () => {
    loader.showLoader("create_stream");
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    loader.hideLoader();
    
    toast.success({
      title: "Mock Transaction Complete",
      description: "This was a test transaction",
    });
  };

  return (
    <>
      <button onClick={mockTransaction}>Test Loader</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

### Different Durations

```tsx
function TestDurations() {
  const loader = useLedgerLoader();

  const test3Seconds = () => {
    loader.showLoader({
      operation: "custom",
      message: "3 second test...",
      estimatedDuration: 3000,
    });
    setTimeout(() => loader.hideLoader(), 3000);
  };

  const test7Seconds = () => {
    loader.showLoader({
      operation: "custom",
      message: "7 second test...",
      estimatedDuration: 7000,
    });
    setTimeout(() => loader.hideLoader(), 7000);
  };

  return (
    <>
      <button onClick={test3Seconds}>3s Test</button>
      <button onClick={test7Seconds}>7s Test</button>
      
      <StellarLedgerLoader
        isOpen={loader.isOpen}
        message={loader.message}
        estimatedDuration={loader.duration}
      />
    </>
  );
}
```

## Best Practices

1. **Always use try-finally**: Ensure loader is hidden even on errors
2. **Provide context**: Use specific messages for each operation
3. **Handle errors**: Show appropriate feedback to users
4. **Clean state**: Reset loader state after operations
5. **Test thoroughly**: Test with different durations and scenarios
6. **Accessibility**: Ensure keyboard and screen reader support
7. **Performance**: Use the custom hook for better state management

## Common Pitfalls

### ❌ Forgetting to hide loader

```tsx
// Bad
const handleTransaction = async () => {
  loader.showLoader("create_stream");
  await createStream(); // If this throws, loader stays open
};

// Good
const handleTransaction = async () => {
  loader.showLoader("create_stream");
  try {
    await createStream();
  } finally {
    loader.hideLoader(); // Always hides
  }
};
```

### ❌ Multiple loader instances

```tsx
// Bad - Creates multiple overlays
<StellarLedgerLoader isOpen={isCreating} />
<StellarLedgerLoader isOpen={isWithdrawing} />

// Good - Single instance with dynamic state
const loader = useLedgerLoader();
<StellarLedgerLoader isOpen={loader.isOpen} message={loader.message} />
```

### ❌ Not handling errors

```tsx
// Bad
const handleTransaction = async () => {
  loader.showLoader("create_stream");
  await createStream(); // No error handling
  loader.hideLoader();
};

// Good
const handleTransaction = async () => {
  loader.showLoader("create_stream");
  try {
    await createStream();
    toast.success({ title: "Success" });
  } catch (error) {
    toast.error({ title: "Failed", description: error.message });
  } finally {
    loader.hideLoader();
  }
};
```
