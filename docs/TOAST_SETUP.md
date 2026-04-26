# Toast Notification System - Quick Setup

## Installation

Run this command in the `frontend` directory:

```bash
npm install sonner
```

If you encounter PowerShell execution policy issues on Windows, use one of these alternatives:

```bash
# Option 1: Use CMD instead of PowerShell
cmd /c "npm install sonner"

# Option 2: Temporarily bypass execution policy (PowerShell as Admin)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install sonner

# Option 3: Use npx
npx npm install sonner
```

## Verification

After installation, verify the setup:

1. Check that `sonner` is in `package.json` dependencies
2. Start the dev server: `npm run dev`
3. Visit `http://localhost:3000/demo/toast` to test all toast variants
4. Click the buttons to see different notification types

## Quick Start

### 1. Import the toast utility

```tsx
import { toast } from "@/lib/toast";
```

### 2. Use in your components

```tsx
// Stream created
toast.streamCreated(txHash);

// Withdrawal complete
toast.withdrawalComplete("1,250.50", "USDC", txHash);

// Custom success
toast.success({
  title: "Success!",
  description: "Operation completed",
  txHash: "abc123...",
});

// Error
toast.error({
  title: "Error",
  description: "Something went wrong",
});
```

## Files Overview

```
frontend/
├── components/
│   └── toast-provider.tsx          # ✅ Sonner provider (already integrated)
├── lib/
│   ├── toast.tsx                   # ✅ Main toast utility
│   └── toast-examples.ts           # 📚 Usage examples
├── app/
│   ├── layout.tsx                  # ✅ Provider added
│   ├── globals.css                 # ✅ Styles added
│   └── demo/toast/page.tsx         # 🎨 Demo page
├── TOAST_NOTIFICATION_SYSTEM.md    # 📖 Full documentation
└── TOAST_SETUP.md                  # 📋 This file
```

## Common Use Cases

### Stream Operations

```tsx
// When creating a stream
const handleCreateStream = async () => {
  try {
    const result = await createStream(data);
    toast.streamCreated(result.txHash);
  } catch (error) {
    toast.transactionFailed(error.message);
  }
};

// When withdrawing
const handleWithdraw = async () => {
  try {
    const result = await withdraw(streamId);
    toast.withdrawalComplete(result.amount, result.token, result.txHash);
  } catch (error) {
    toast.transactionFailed("Withdrawal failed");
  }
};
```

### Wallet Operations

```tsx
// Wallet connected
toast.success({
  title: "Wallet Connected",
  description: `Connected to ${address.slice(0, 8)}...`,
  duration: 4000,
});

// Insufficient balance
toast.error({
  title: "Insufficient Balance",
  description: "You don't have enough XLM for gas fees",
  duration: 6000,
});
```

### Form Validation

```tsx
// Invalid input
toast.error({
  title: "Invalid Address",
  description: "Please enter a valid Stellar address",
  duration: 5000,
});
```

## Design Features

✅ **Glass Morphism** - backdrop-blur-xl with subtle transparency  
✅ **Hyper Violet Progress Bar** - Animated at the bottom  
✅ **Bottom-Right Placement** - Non-intrusive  
✅ **Stellar.Expert Links** - Direct transaction viewing  
✅ **Responsive** - Mobile-friendly  
✅ **Accessible** - Keyboard navigation & reduced motion support  

## Troubleshooting

### Toast not appearing?

1. Check browser console for errors
2. Verify `<ToastProvider />` is in `app/layout.tsx`
3. Ensure Sonner is installed: `npm list sonner`

### Styles not working?

1. Verify `globals.css` has the toast styles
2. Clear browser cache and restart dev server
3. Check for CSS conflicts

### Progress bar not animating?

1. Check if `prefers-reduced-motion` is enabled in your OS
2. Verify CSS animations are supported in your browser

## Next Steps

1. ✅ Install Sonner: `npm install sonner`
2. 🎨 Test the demo: Visit `/demo/toast`
3. 📖 Read full docs: `TOAST_NOTIFICATION_SYSTEM.md`
4. 💻 Check examples: `lib/toast-examples.ts`
5. 🚀 Integrate into your components

## Support

- **Demo Page**: `/demo/toast`
- **Full Documentation**: `TOAST_NOTIFICATION_SYSTEM.md`
- **Code Examples**: `lib/toast-examples.ts`
- **API Reference**: See documentation

---

**Status**: ✅ Ready to use (after `npm install sonner`)  
**Design**: Stellar Glass  
**Library**: Sonner  
**Position**: Bottom-Right  
**Progress Bar**: Hyper Violet (#8a00ff)
