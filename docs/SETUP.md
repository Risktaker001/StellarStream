# Setup Instructions

## Install Dependencies

Before running the project, install the required dependencies:

```bash
cd frontend
npm install
```

This will install:
- React 19.2.3
- Next.js 16.1.6
- Framer Motion 12.34.2
- Lucide React 0.575.0
- TypeScript 5.x
- Tailwind CSS 4.x

## Run Development Server

```bash
npm run dev
```

Then visit:
- Main app: http://localhost:3000
- Demo page: http://localhost:3000/demo

## Component Usage

The Stellar Address Input component is located at:
`frontend/components/stellar-address-input.tsx`

Import and use it in your pages:

```tsx
import { StellarAddressInput } from '@/components/stellar-address-input';

const [address, setAddress] = useState('');

<StellarAddressInput
  value={address}
  onChange={setAddress}
  onValidationChange={(isValid) => console.log(isValid)}
/>
```
