# Toast Integration Guide

Complete guide for integrating toast notifications into StellarStream components.

## Table of Contents

1. [Stream Creation Page](#stream-creation-page)
2. [Withdrawal Component](#withdrawal-component)
3. [Wallet Connection](#wallet-connection)
4. [Settings Page](#settings-page)
5. [Error Handling Patterns](#error-handling-patterns)

---

## Stream Creation Page

### Location: `app/dashboard/create-stream/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

export default function CreateStreamPage() {
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    token: "USDC",
    duration: 86400,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.receiver) {
      toast.error({
        title: "Invalid Address",
        description: "Please enter a valid receiver address",
        duration: 5000,
      });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        duration: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      // Show pending notification
      toast.info({
        title: "Creating Stream",
        description: "Please confirm the transaction in your wallet",
        duration: 5000,
      });

      // Call your API/contract
      const result = await createStream({
        receiver: formData.receiver,
        amount: formData.amount,
        token: formData.token,
        duration: formData.duration,
      });

      // Success notification with transaction link
      toast.streamCreated(result.txHash);

      // Reset form
      setFormData({
        receiver: "",
        amount: "",
        token: "USDC",
        duration: 86400,
      });

    } catch (error: any) {
      // Handle specific error types
      if (error.code === "INSUFFICIENT_BALANCE") {
        toast.error({
          title: "Insufficient Balance",
          description: `You don't have enough ${formData.token} to create this stream`,
          duration: 6000,
        });
      } else if (error.code === "INSUFFICIENT_GAS") {
        toast.transactionFailed("Insufficient XLM for gas fees");
      } else if (error.code === "USER_REJECTED") {
        toast.info({
          title: "Transaction Cancelled",
          description: "You rejected the transaction in your wallet",
          duration: 4000,
        });
      } else {
        toast.transactionFailed(error.message || "Failed to create stream");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Your form fields here */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary rounded-xl"
      >
        {loading ? "Creating Stream..." : "Create Stream"}
      </button>
    </form>
  );
}

// Mock function - replace with your actual implementation
async function createStream(data: any) {
  // Your Stellar/Soroban contract call here
  return { txHash: "abc123..." };
}
```

---

## Withdrawal Component

### Location: `components/topupandwithdrawal.tsx` (or new component)

```tsx
"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

interface WithdrawalProps {
  streamId: string;
  availableAmount: string;
  token: string;
  onSuccess?: () => void;
}

export function WithdrawalComponent({
  streamId,
  availableAmount,
  token,
  onSuccess,
}: WithdrawalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleWithdraw = async () => {
    // Validation
    const withdrawAmount = parseFloat(amount);
    const available = parseFloat(availableAmount);

    if (withdrawAmount <= 0) {
      toast.error({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        duration: 5000,
      });
      return;
    }

    if (withdrawAmount > available) {
      toast.error({
        title: "Insufficient Funds",
        description: `Only ${availableAmount} ${token} available for withdrawal`,
        duration: 6000,
      });
      return;
    }

    setLoading(true);

    try {
      toast.info({
        title: "Processing Withdrawal",
        description: "Please confirm the transaction in your wallet",
        duration: 5000,
      });

      const result = await withdrawFromStream(streamId, amount);

      // Success with formatted amount
      toast.withdrawalComplete(
        parseFloat(amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        }),
        token,
        result.txHash
      );

      // Reset and callback
      setAmount("");
      onSuccess?.();

    } catch (error: any) {
      if (error.code === "STREAM_NOT_ACTIVE") {
        toast.error({
          title: "Stream Not Active",
          description: "This stream is no longer active",
          duration: 6000,
        });
      } else if (error.code === "UNAUTHORIZED") {
        toast.error({
          title: "Unauthorized",
          description: "You are not authorized to withdraw from this stream",
          duration: 6000,
        });
      } else {
        toast.transactionFailed(error.message || "Withdrawal failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(availableAmount);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Withdraw Funds</h3>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Amount</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleMaxClick}
            className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl text-primary"
            disabled={loading}
          >
            MAX
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Available: {availableAmount} {token}
        </p>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={loading || !amount}
        className="w-full px-6 py-3 bg-primary rounded-xl disabled:opacity-50"
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
}

// Mock function
async function withdrawFromStream(streamId: string, amount: string) {
  return { txHash: "def456..." };
}
```

---

## Wallet Connection

### Location: `components/wallet-connect.tsx` (new component)

```tsx
"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

export function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);

    try {
      // Your wallet connection logic (Freighter, Albedo, etc.)
      const walletAddress = await connectWallet();

      setConnected(true);
      setAddress(walletAddress);

      toast.success({
        title: "Wallet Connected",
        description: `Connected to ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`,
        duration: 4000,
      });

    } catch (error: any) {
      if (error.code === "USER_REJECTED") {
        toast.info({
          title: "Connection Cancelled",
          description: "You cancelled the wallet connection",
          duration: 3000,
        });
      } else if (error.code === "WALLET_NOT_FOUND") {
        toast.error({
          title: "Wallet Not Found",
          description: "Please install Freighter or another Stellar wallet",
          duration: 6000,
        });
      } else {
        toast.error({
          title: "Connection Failed",
          description: error.message || "Failed to connect wallet",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setAddress("");

    toast.info({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected",
      duration: 3000,
    });
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success({
        title: "Copied!",
        description: "Address copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast.error({
        title: "Copy Failed",
        description: "Failed to copy address",
        duration: 3000,
      });
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyAddress}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-6 py-2 bg-primary rounded-xl disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

// Mock function
async function connectWallet(): Promise<string> {
  return "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B";
}
```

---

## Settings Page

### Location: `app/dashboard/settings/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoWithdraw: false,
    defaultToken: "USDC",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      // Save settings to backend/localStorage
      await saveSettings(settings);

      toast.success({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully",
        duration: 3000,
      });

    } catch (error: any) {
      toast.error({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      autoWithdraw: false,
      defaultToken: "USDC",
    });

    toast.info({
      title: "Settings Reset",
      description: "Settings restored to defaults",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="glass-card p-6 space-y-4">
        {/* Settings form fields */}
        
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock function
async function saveSettings(settings: any) {
  // Save to backend or localStorage
}
```

---

## Error Handling Patterns

### Centralized Error Handler

```tsx
// lib/error-handler.ts
import { toast } from "./toast";

export function handleTransactionError(error: any) {
  const errorMap: Record<string, { title: string; description: string }> = {
    INSUFFICIENT_BALANCE: {
      title: "Insufficient Balance",
      description: "You don't have enough funds for this transaction",
    },
    INSUFFICIENT_GAS: {
      title: "Insufficient Gas",
      description: "You don't have enough XLM for gas fees",
    },
    USER_REJECTED: {
      title: "Transaction Cancelled",
      description: "You rejected the transaction in your wallet",
    },
    NETWORK_ERROR: {
      title: "Network Error",
      description: "Unable to connect to Stellar network",
    },
    TIMEOUT: {
      title: "Transaction Timeout",
      description: "Transaction took too long to process",
    },
    UNAUTHORIZED: {
      title: "Unauthorized",
      description: "You are not authorized to perform this action",
    },
  };

  const errorInfo = errorMap[error.code] || {
    title: "Transaction Failed",
    description: error.message || "An unexpected error occurred",
  };

  toast.error({
    title: errorInfo.title,
    description: errorInfo.description,
    txHash: error.txHash,
    duration: 6000,
  });
}

// Usage in components
try {
  await someTransaction();
} catch (error) {
  handleTransactionError(error);
}
```

### Loading States with Toasts

```tsx
async function performLongOperation() {
  // Show initial toast
  const loadingToastId = toast.info({
    title: "Processing",
    description: "This may take a few moments...",
    duration: 10000,
  });

  try {
    const result = await longRunningOperation();
    
    // Success replaces loading toast
    toast.success({
      title: "Complete",
      description: "Operation completed successfully",
      txHash: result.txHash,
    });
  } catch (error) {
    toast.transactionFailed("Operation failed");
  }
}
```

---

## Best Practices

### 1. Always Provide Context

```tsx
// ❌ Bad
toast.error({ title: "Error" });

// ✅ Good
toast.error({
  title: "Stream Creation Failed",
  description: "Insufficient XLM for gas fees. Please add more XLM to your wallet.",
});
```

### 2. Use Appropriate Durations

```tsx
// Quick confirmations
toast.success({ title: "Copied!", duration: 2000 });

// Important information
toast.error({ title: "Transaction Failed", duration: 6000 });

// Critical warnings
toast.warning({ title: "Low Balance", duration: 8000 });
```

### 3. Include Transaction Hashes

```tsx
// Always include txHash when available
toast.streamCreated(result.txHash);
toast.withdrawalComplete(amount, token, result.txHash);
```

### 4. Handle User Actions

```tsx
// User cancelled - use info, not error
if (error.code === "USER_REJECTED") {
  toast.info({
    title: "Cancelled",
    description: "Transaction was cancelled",
  });
}
```

### 5. Provide Next Steps

```tsx
toast.error({
  title: "Insufficient Balance",
  description: "Add more USDC to your wallet to continue",
  duration: 6000,
});
```

---

## Testing Checklist

- [ ] Toast appears in bottom-right corner
- [ ] Glass morphism effect is visible
- [ ] Hyper Violet progress bar animates correctly
- [ ] Stellar.Expert link opens in new tab
- [ ] Toast auto-dismisses after duration
- [ ] Multiple toasts stack properly
- [ ] Mobile responsive (full width on small screens)
- [ ] Reduced motion respected
- [ ] Keyboard accessible

---

## Additional Resources

- **Full Documentation**: `TOAST_NOTIFICATION_SYSTEM.md`
- **Code Examples**: `lib/toast-examples.ts`
- **Demo Page**: `/demo/toast`
- **Quick Setup**: `TOAST_SETUP.md`
