# Stellar Ledger Loader - Quick Reference

## 🚀 Import

```tsx
import { StellarLedgerLoader } from "@/components/stellar-ledger-loader";
import { useLedgerLoader } from "@/lib/use-ledger-loader";
```

## 📝 Basic Pattern

```tsx
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
```

## 🎣 Hook Pattern

```tsx
const loader = useLedgerLoader();

const handleTransaction = async () => {
  loader.showLoader("create_stream");
  try {
    await submitTransaction();
  } finally {
    loader.hideLoader();
  }
};

return (
  <>
    <button onClick={handleTransaction}>Submit</button>
    <StellarLedgerLoader
      isOpen={loader.isOpen}
      message={loader.message}
      estimatedDuration={loader.duration}
    />
  </>
);
```

## 🎯 Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `isOpen` | `boolean` | ✅ | - |
| `message` | `string` | ❌ | "Waiting for Stellar Ledger to close..." |
| `estimatedDuration` | `number` | ❌ | 5000 |
| `onComplete` | `() => void` | ❌ | - |

## 🔧 Predefined Contexts

```tsx
loader.showLoader("create_stream");    // "Creating your payment stream..."
loader.showLoader("withdraw");         // "Processing withdrawal..."
loader.showLoader("cancel_stream");    // "Cancelling stream..."
loader.showLoader("approve_token");    // "Approving token spending..."
loader.showLoader("transfer_receiver"); // "Transferring stream ownership..."
loader.showLoader("update_stream");    // "Updating stream parameters..."
loader.showLoader("batch_create");     // "Creating multiple streams..."
```

## 🎨 Custom Context

```tsx
loader.showLoader({
  operation: "custom",
  message: "Your custom message...",
  estimatedDuration: 7000,
});
```

## 🔄 Sequential Operations

```tsx
import { useSequentialLoader } from "@/lib/use-ledger-loader";

const loader = useSequentialLoader();

await loader.startSequence([
  { message: "Step 1...", duration: 5000 },
  { message: "Step 2...", duration: 5000 },
  { message: "Step 3...", duration: 3000 },
]);
```

## ⏱️ Auto-Timeout

```tsx
import { useLedgerLoaderWithTimeout } from "@/lib/use-ledger-loader";

const loader = useLedgerLoaderWithTimeout();

loader.showLoader("withdraw", 5000); // Auto-hides after 5s
```

## 🎭 With Toast Notifications

```tsx
import { toast } from "@/lib/toast";

const handleTransaction = async () => {
  loader.showLoader("create_stream");
  
  try {
    const result = await createStream();
    toast.streamCreated(result.txHash);
  } catch (error) {
    toast.transactionFailed(error.message);
  } finally {
    loader.hideLoader();
  }
};
```

## 🔁 With Retry Logic

```tsx
const handleWithRetry = async () => {
  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    loader.showLoader({
      operation: "custom",
      message: attempt > 0 
        ? `Retrying (${attempt}/${maxRetries})...`
        : "Processing...",
      estimatedDuration: 5000,
    });

    try {
      await submitTransaction();
      loader.hideLoader();
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        loader.hideLoader();
        throw error;
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};
```

## 📊 Progress Updates

```tsx
const handleLongOp = async () => {
  loader.showLoader("custom");

  loader.updateMessage("Step 1: Validating...");
  await validate();

  loader.updateMessage("Step 2: Submitting...");
  await submit();

  loader.updateMessage("Step 3: Confirming...");
  await confirm();

  loader.hideLoader();
};
```

## ✅ Best Practices

```tsx
// ✅ Always use try-finally
try {
  await transaction();
} finally {
  loader.hideLoader();
}

// ✅ Provide specific messages
loader.showLoader({
  operation: "custom",
  message: "Creating payment stream for Alice...",
});

// ✅ Handle errors
catch (error) {
  toast.error({ title: "Failed", description: error.message });
}

// ✅ Use realistic durations
estimatedDuration: 5000 // 5 seconds is typical
```

## ❌ Common Mistakes

```tsx
// ❌ Forgetting to hide
loader.showLoader("create_stream");
await createStream(); // If error, loader stays open

// ❌ Multiple instances
<StellarLedgerLoader isOpen={isCreating} />
<StellarLedgerLoader isOpen={isWithdrawing} />

// ❌ No error handling
await createStream(); // No try-catch

// ❌ Generic messages
message: "Loading..." // Not helpful
```

## 🎨 Customization

```tsx
// Custom duration
<StellarLedgerLoader
  isOpen={true}
  estimatedDuration={7000}
/>

// Custom message
<StellarLedgerLoader
  isOpen={true}
  message="Processing your withdrawal..."
/>

// With callback
<StellarLedgerLoader
  isOpen={true}
  onComplete={() => {
    console.log("Loader completed");
    setIsWaiting(false);
  }}
/>
```

## 🧪 Testing

```tsx
// Test with mock
const mockTransaction = async () => {
  loader.showLoader("create_stream");
  await new Promise(r => setTimeout(r, 5000));
  loader.hideLoader();
};

// Test different durations
loader.showLoader({ operation: "custom", message: "3s test", estimatedDuration: 3000 });
loader.showLoader({ operation: "custom", message: "7s test", estimatedDuration: 7000 });
```

## 📱 Demo

Visit `/demo/ledger-loader` for interactive demo

## 📚 Full Documentation

- `STELLAR_LEDGER_LOADER.md` - Complete API reference
- `LEDGER_LOADER_INTEGRATION.md` - Integration guide
- `LEDGER_LOADER_EXAMPLES.md` - Code examples
- `LEDGER_LOADER_SUMMARY.md` - Implementation summary

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Loader doesn't show | Check `isOpen` prop is controlled |
| Progress doesn't animate | Ensure `estimatedDuration > 0` |
| Multiple loaders stack | Use single instance with dynamic state |
| TypeScript errors | Check imports and type definitions |

## 🎯 Quick Checklist

- [ ] Import component and hook
- [ ] Add state management
- [ ] Wrap transaction in try-finally
- [ ] Show loader before transaction
- [ ] Hide loader in finally block
- [ ] Add error handling with toast
- [ ] Test on different devices
- [ ] Verify accessibility

## 💡 Pro Tips

1. Use custom hooks for cleaner code
2. Combine with toast notifications
3. Provide specific, contextual messages
4. Test with different network speeds
5. Handle errors gracefully
6. Use sequential loader for multi-step ops
7. Consider auto-timeout for quick ops
8. Test accessibility features

---

**Need help?** Check the full documentation or visit the demo page!
