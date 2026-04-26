# Stellar Glass Toast Notification System

## Overview

A fully-themed notification system for StellarStream that matches the "Stellar Glass" design aesthetic. Features backdrop-blur glass morphism, Hyper Violet progress bars, and seamless integration with Stellar.Expert transaction links.

## Features

✅ **Glass Morphism Design** - backdrop-blur-xl with subtle glass sheen effects  
✅ **Hyper Violet Progress Bar** - Animated progress indicator at the bottom of each toast  
✅ **Bottom-Right Placement** - Non-intrusive positioning  
✅ **Stellar.Expert Integration** - Direct links to view transactions  
✅ **Multiple Variants** - Success, Error, Warning, Info  
✅ **Stream-Specific Methods** - Convenience functions for common operations  
✅ **Responsive** - Mobile-friendly with adaptive sizing  
✅ **Accessible** - Respects prefers-reduced-motion  

## Installation

```bash
cd frontend
npm install sonner
```

## Files Created

```
frontend/
├── components/
│   └── toast-provider.tsx       # Sonner provider with custom config
├── lib/
│   └── toast.tsx                # Toast utility functions
├── app/
│   ├── layout.tsx               # Updated with ToastProvider
│   ├── globals.css              # Toast styles added
│   └── demo/
│       └── toast/
│           └── page.tsx         # Demo page
└── TOAST_NOTIFICATION_SYSTEM.md # This file
```

## Usage

### Basic Usage

```tsx
import { toast } from "@/lib/toast";

// Success notification
toast.success({
  title: "Success!",
  description: "Your operation completed successfully",
  txHash: "abc123...", // Optional
  duration: 5000 // Optional, defaults to 5000ms
});

// Error notification
toast.error({
  title: "Error Occurred",
  description: "Something went wrong",
  duration: 6000
});

// Warning notification
toast.warning({
  title: "Warning",
  description: "Please review your transaction"
});

// Info notification
toast.info({
  title: "Information",
  description: "Your stream will start soon"
});
```

### Stream-Specific Convenience Methods

```tsx
import { toast } from "@/lib/toast";

// Stream created successfully
toast.streamCreated(txHash);

// Withdrawal completed
toast.withdrawalComplete("1,250.50", "USDC", txHash);

// Stream cancelled
toast.streamCancelled(txHash);

// Transaction failed
toast.transactionFailed("Insufficient XLM for gas fees");
```

### Integration Example

```tsx
"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

export default function CreateStreamPage() {
  const [loading, setLoading] = useState(false);

  const handleCreateStream = async () => {
    setLoading(true);
    
    try {
      // Your stream creation logic here
      const result = await createStream({
        receiver: "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
        amount: "1000",
        token: "USDC",
        duration: 86400
      });

      // Show success toast with transaction hash
      toast.streamCreated(result.txHash);
      
    } catch (error) {
      // Show error toast
      toast.transactionFailed(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCreateStream} disabled={loading}>
      {loading ? "Creating..." : "Create Stream"}
    </button>
  );
}
```

### Withdrawal Example

```tsx
const handleWithdraw = async (streamId: string) => {
  try {
    const result = await withdrawFromStream(streamId);
    
    toast.withdrawalComplete(
      result.amount,
      result.token,
      result.txHash
    );
  } catch (error) {
    toast.transactionFailed("Withdrawal failed. Please try again.");
  }
};
```

## Design Specifications

### Colors

- **Success**: Cyan (#00f5ff) - Stellar Primary
- **Error**: Red (#ff3b5c)
- **Warning**: Amber (#ffb300)
- **Info**: Hyper Violet (#8a00ff) - Stellar Secondary

### Progress Bar

- **Color**: Hyper Violet gradient (#8a00ff → #b84dff)
- **Height**: 3px
- **Position**: Bottom of toast
- **Animation**: Linear left-to-right based on duration
- **Glow**: 0 0 8px rgba(138, 0, 255, 0.6)

### Glass Effect

- **Background**: rgba(10, 10, 20, 0.85)
- **Backdrop Filter**: blur(24px)
- **Border**: 1px solid rgba(255, 255, 255, 0.1)
- **Border Radius**: 16px
- **Shadow**: Multi-layer with inset glow

### Typography

- **Font Family**: Poppins (body), matching design system
- **Title**: 14px, font-weight 600
- **Description**: 13px, font-weight 400
- **Link**: 12px, font-weight 500

### Dimensions

- **Min Width**: 360px
- **Max Width**: 420px
- **Padding**: 16px 18px 20px
- **Gap**: 12px between icon and content
- **Icon Size**: 36x36px with 20px icon

### Animation

- **Slide In**: 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)
- **Progress**: Linear based on duration
- **Hover**: 0.2s ease transitions

## API Reference

### `toast.success(options)`

Display a success notification.

**Options:**
- `title` (string, required): Main message
- `description` (string, optional): Additional details
- `txHash` (string, optional): Stellar transaction hash
- `duration` (number, optional): Display duration in ms (default: 5000)

### `toast.error(options)`

Display an error notification.

**Options:**
- `title` (string, required): Error message
- `description` (string, optional): Error details
- `txHash` (string, optional): Failed transaction hash
- `duration` (number, optional): Display duration in ms (default: 6000)

### `toast.warning(options)`

Display a warning notification.

**Options:**
- `title` (string, required): Warning message
- `description` (string, optional): Warning details
- `duration` (number, optional): Display duration in ms (default: 5000)

### `toast.info(options)`

Display an info notification.

**Options:**
- `title` (string, required): Info message
- `description` (string, optional): Additional info
- `duration` (number, optional): Display duration in ms (default: 4000)

### Convenience Methods

#### `toast.streamCreated(txHash: string)`

Shows "Stream Created Successfully" notification with Stellar.Expert link.

#### `toast.withdrawalComplete(amount: string, token: string, txHash: string)`

Shows "Withdrawal Complete" notification with amount, token, and transaction link.

#### `toast.streamCancelled(txHash: string)`

Shows "Stream Cancelled" info notification.

#### `toast.transactionFailed(reason?: string)`

Shows "Transaction Failed" error notification with optional reason.

## Stellar.Expert Integration

When a `txHash` is provided, a clickable link is automatically added to the toast:

```tsx
toast.success({
  title: "Transaction Successful",
  txHash: "abc123..."
});
```

The link format:
```
https://stellar.expert/explorer/public/tx/{txHash}
```

**Link Styling:**
- Cyan background with glass effect
- Hover state with glow
- External link icon (lucide-react)
- Opens in new tab with security attributes

## Demo Page

Visit `/demo/toast` to see all toast variants in action.

The demo includes:
- Stream operation toasts
- Generic notification types
- Custom duration examples
- Usage code snippets

## Responsive Behavior

**Desktop (>640px):**
- Fixed width (360-420px)
- Bottom-right corner placement
- 24px margin from edges

**Mobile (≤640px):**
- Full width with 16px margins
- Stacks vertically
- Touch-friendly sizing

## Accessibility

- **Reduced Motion**: Animations disabled when `prefers-reduced-motion` is set
- **Keyboard Navigation**: Focusable links with proper tab order
- **Screen Readers**: Semantic HTML with ARIA attributes
- **Color Contrast**: WCAG AA compliant text colors

## Customization

### Changing Default Durations

Edit `frontend/lib/toast.tsx`:

```tsx
export const toast = {
  success: ({ duration = 5000, ...options }) => { // Change default here
    // ...
  }
};
```

### Changing Progress Bar Color

Edit `frontend/app/globals.css`:

```css
.stellar-toast-progress::after {
  background: linear-gradient(90deg, #8a00ff, #b84dff); /* Change colors */
  box-shadow: 0 0 8px rgba(138, 0, 255, 0.6);
}
```

### Changing Position

Edit `frontend/components/toast-provider.tsx`:

```tsx
<Toaster
  position="bottom-right" // Change to: top-left, top-right, bottom-left, etc.
  // ...
/>
```

## Best Practices

1. **Use Specific Methods**: Prefer `toast.streamCreated()` over generic `toast.success()` for stream operations
2. **Include Transaction Hashes**: Always provide `txHash` when available for transparency
3. **Keep Titles Short**: 3-5 words maximum for scanability
4. **Provide Context**: Use descriptions for error details or next steps
5. **Appropriate Durations**: 
   - Success: 5-6 seconds
   - Errors: 6-8 seconds (users need time to read)
   - Info: 4-5 seconds
6. **Don't Spam**: Avoid showing multiple toasts for the same action

## Troubleshooting

### Toasts Not Appearing

1. Verify `<ToastProvider />` is in `app/layout.tsx`
2. Check that Sonner is installed: `npm list sonner`
3. Ensure imports are correct: `import { toast } from "@/lib/toast"`

### Styling Issues

1. Verify `globals.css` includes toast styles
2. Check for CSS conflicts with other libraries
3. Ensure Tailwind is processing the styles

### Progress Bar Not Animating

1. Check browser DevTools for CSS animation support
2. Verify `--duration` CSS variable is being set
3. Test with `prefers-reduced-motion` disabled

## Future Enhancements

Potential improvements for future iterations:

- [ ] Toast queue management for multiple simultaneous toasts
- [ ] Swipe-to-dismiss on mobile
- [ ] Sound effects for different toast types
- [ ] Persistent toasts that require manual dismissal
- [ ] Toast history/log viewer
- [ ] Custom toast templates for specific stream events
- [ ] Integration with Stellar wallet connection status

## Support

For issues or questions:
1. Check the demo page at `/demo/toast`
2. Review this documentation
3. Inspect browser console for errors
4. Verify all dependencies are installed

---

**Design Pattern**: Stellar Glass  
**Library**: Sonner  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-02-21
