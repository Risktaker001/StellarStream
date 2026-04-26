# Biometric Security Toggle Component

A futuristic toggle switch inspired by thumbprint scanners and retina scans, featuring animated scan lines and glass morphism design.

## Overview

The Biometric Security Toggle provides a visually striking way to enable/disable security features like Private Mode or High Security. The component features vertical scan line animations, smooth color transitions from gray to neon green, and biometric-inspired iconography.

## Features

- **Animated Scan Lines**: Vertical moving scan lines when toggle is active
- **Glass Morphism**: Frosted glass card with backdrop blur effect
- **Color Transition**: Smooth shift from dim gray to neon success green (#00ff88)
- **Two Variants**: Thumbprint scanner or retina scan icons
- **Pulsing Glow**: Subtle glow animation when active
- **Icon Animation**: Rotating thumbprint/retina icon when enabled
- **Accessible**: Keyboard navigation support (Enter/Space)
- **Customizable**: Labels, callbacks, and disabled states

## Installation

Import the component:

```tsx
import BiometricSecurityToggle from "@/components/biometric-security-toggle";
```

## Basic Usage

```tsx
// Simple toggle
<BiometricSecurityToggle label="Private Mode" />

// With state management
const [isPrivate, setIsPrivate] = useState(false);

<BiometricSecurityToggle
  label="Private Mode"
  onChange={setIsPrivate}
/>

// Retina scan variant
<BiometricSecurityToggle
  label="High Security"
  variant="retina"
  onChange={(enabled) => console.log('Security:', enabled)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `"Private Mode"` | Label displayed below toggle |
| `defaultEnabled` | `boolean` | `false` | Initial toggle state |
| `onChange` | `(enabled: boolean) => void` | `undefined` | Callback when toggle changes |
| `disabled` | `boolean` | `false` | Disable toggle interaction |
| `className` | `string` | `""` | Additional CSS classes |
| `variant` | `"thumbprint" \| "retina"` | `"thumbprint"` | Icon style variant |

## Variants

### Thumbprint Scanner
```tsx
<BiometricSecurityToggle
  label="Private Mode"
  variant="thumbprint"
/>
```
- Fingerprint-style curved lines
- Rotating animation when active
- Best for: Privacy settings, authentication

### Retina Scan
```tsx
<BiometricSecurityToggle
  label="High Security"
  variant="retina"
/>
```
- Eye/iris-style concentric circles
- Scanning animation when active
- Best for: Security settings, verification

## States

### Inactive (Default)
- Dim gray color scheme
- No scan line animation
- Static icon
- "INACTIVE" status label

### Active
- Neon green (#00ff88) color scheme
- Animated scan lines moving vertically
- Rotating icon animation
- Pulsing glow effect
- "ACTIVE" status label

### Disabled
- Reduced opacity (50%)
- No hover effects
- Cursor: not-allowed
- No interaction

## Use Cases

### 1. Privacy Settings
```tsx
<BiometricSecurityToggle
  label="Private Mode"
  variant="thumbprint"
  onChange={(enabled) => {
    // Enable private browsing
    setPrivateMode(enabled);
  }}
/>
```

### 2. Security Dashboard
```tsx
<div className="security-controls">
  <BiometricSecurityToggle
    label="High Security"
    variant="retina"
    onChange={handleSecurityToggle}
  />
  <BiometricSecurityToggle
    label="2FA Required"
    variant="thumbprint"
    onChange={handle2FAToggle}
  />
</div>
```

### 3. Transaction Settings
```tsx
<BiometricSecurityToggle
  label="Require Biometric"
  variant="thumbprint"
  defaultEnabled={true}
  onChange={(enabled) => {
    updateTransactionSettings({ biometric: enabled });
  }}
/>
```

### 4. Admin Panel
```tsx
<BiometricSecurityToggle
  label="Admin Mode"
  variant="retina"
  disabled={!isAdmin}
  onChange={handleAdminMode}
/>
```

### 5. Compliance Features
```tsx
<BiometricSecurityToggle
  label="OFAC Screening"
  variant="thumbprint"
  onChange={(enabled) => {
    setComplianceMode(enabled);
  }}
/>
```

## Design Specifications

### Colors

**Inactive State:**
- Background: `rgba(30, 30, 40, 0.6)`
- Border: `rgba(100, 100, 120, 0.3)`
- Icon: `rgba(150, 150, 170, 0.6)`
- Text: `rgba(150, 150, 170, 0.8)`

**Active State:**
- Background: `rgba(0, 255, 136, 0.1)`
- Border: `rgba(0, 255, 136, 0.5)`
- Icon: `#00ff88` (Neon Green)
- Text: `#00ff88`
- Glow: `0 0 20px rgba(0, 255, 136, 0.3)`

### Dimensions
- Size: 120px × 120px
- Border Radius: 16px
- Border Width: 2px
- Icon Size: 60px × 60px

### Animations

**Scan Lines:**
- Duration: 2s
- Timing: Linear
- Direction: Vertical (top to bottom)
- Count: 3 lines with staggered delays

**Pulse Glow:**
- Duration: 2s
- Timing: Ease-in-out
- Effect: Box-shadow intensity variation

**Icon Rotation:**
- Duration: 3s
- Timing: Ease-in-out
- Effect: 360° rotation with slight scale

## Accessibility

### Keyboard Navigation
- **Tab**: Focus the toggle
- **Enter/Space**: Activate/deactivate toggle
- **Escape**: Remove focus (browser default)

### ARIA Attributes
```tsx
role="switch"
aria-checked={isEnabled}
aria-label={label}
tabIndex={disabled ? -1 : 0}
```

### Screen Readers
- Announces current state (active/inactive)
- Reads label text
- Indicates disabled state

## Integration Examples

### With Form State
```tsx
import { useForm } from "react-hook-form";

function SecurityForm() {
  const { register, watch, setValue } = useForm();
  const privateMode = watch("privateMode");

  return (
    <form>
      <BiometricSecurityToggle
        label="Private Mode"
        defaultEnabled={privateMode}
        onChange={(enabled) => setValue("privateMode", enabled)}
      />
    </form>
  );
}
```

### With Context
```tsx
import { useSecurityContext } from "@/contexts/SecurityContext";

function SecurityToggle() {
  const { isPrivate, setIsPrivate } = useSecurityContext();

  return (
    <BiometricSecurityToggle
      label="Private Mode"
      defaultEnabled={isPrivate}
      onChange={setIsPrivate}
    />
  );
}
```

### Multiple Toggles
```tsx
function SecurityPanel() {
  const [settings, setSettings] = useState({
    private: false,
    highSecurity: false,
    twoFactor: false,
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      <BiometricSecurityToggle
        label="Private"
        onChange={(v) => setSettings({ ...settings, private: v })}
      />
      <BiometricSecurityToggle
        label="High Security"
        variant="retina"
        onChange={(v) => setSettings({ ...settings, highSecurity: v })}
      />
      <BiometricSecurityToggle
        label="2FA"
        onChange={(v) => setSettings({ ...settings, twoFactor: v })}
      />
    </div>
  );
}
```

## Styling

### Custom Wrapper
```tsx
<div className="flex flex-col items-center gap-4">
  <BiometricSecurityToggle label="Private Mode" />
  <p className="text-sm text-gray-400">
    Enable for confidential transactions
  </p>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
  <BiometricSecurityToggle label="Private" />
  <BiometricSecurityToggle label="Secure" variant="retina" />
  <BiometricSecurityToggle label="2FA" />
  <BiometricSecurityToggle label="Verify" variant="retina" />
</div>
```

## Performance

- **CSS Animations**: GPU-accelerated transforms
- **No JavaScript Animation**: Pure CSS for smooth 60fps
- **Minimal Re-renders**: Only updates on state change
- **Lightweight**: ~5KB component size

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)  
✅ Mobile Safari, Chrome Mobile  
✅ Supports backdrop-filter (with fallback)

## Best Practices

1. **Use Meaningful Labels**: Clearly indicate what the toggle controls
2. **Provide Feedback**: Show confirmation when security settings change
3. **Limit Per Page**: Use 3-5 toggles max to avoid overwhelming users
4. **Group Related**: Place security toggles together in settings
5. **Default Off**: Security features should default to inactive
6. **Confirm Changes**: For critical security settings, add confirmation dialogs

## Related Components

- `glitch-text.tsx` - Animated text for headers
- `nebula-skeleton.tsx` - Loading states
- `network-status-orb.tsx` - Status indicators

## Future Enhancements

- [ ] Sound effects on toggle
- [ ] Haptic feedback (mobile)
- [ ] Custom scan line colors
- [ ] Multiple scan patterns
- [ ] Biometric API integration
- [ ] Animation speed control

## Example Page

See `biometric-security-toggle-example.tsx` for:
- Interactive demo with all variants
- Real-time status panel
- Use case examples
- Feature showcase
- Responsive design
