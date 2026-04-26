"use client";

import { useState } from "react";
import TokenSelector, { type Token } from "./token-selector";

// Example usage of TokenSelector component
const MOCK_TOKENS: Token[] = [
  {
    code: "XLM",
    name: "Stellar Lumens",
    balance: 15420.5847291,
    icon: "⭐",
  },
  {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    name: "USD Coin",
    balance: 8250.42,
    icon: "💵",
  },
  {
    code: "AQUA",
    issuer: "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA",
    name: "Aquarius",
    balance: 125000.0,
    icon: "🌊",
  },
  {
    code: "yXLM",
    issuer: "GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55",
    name: "Yield XLM",
    balance: 3420.891234,
    icon: "📈",
  },
  {
    code: "BTC",
    issuer: "GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF",
    name: "Bitcoin",
    balance: 0.15847291,
    icon: "₿",
  },
  {
    code: "ETH",
    issuer: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
    name: "Ethereum",
    balance: 2.84729156,
    icon: "Ξ",
  },
];

export default function TokenSelectorExample() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-heading mb-4">Select Asset to Stream</h2>
      <TokenSelector
        tokens={MOCK_TOKENS}
        selectedToken={selectedToken}
        onSelect={setSelectedToken}
        placeholder="Choose a Stellar asset"
      />
      
      {selectedToken && (
        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/[0.04]">
          <p className="text-sm text-white/60 mb-2">Selected:</p>
          <p className="text-white font-medium">
            {selectedToken.code} - {selectedToken.name}
          </p>
          <p className="text-sm text-white/50 mt-1">
            Balance: {selectedToken.balance.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
