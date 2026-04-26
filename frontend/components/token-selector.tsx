"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export type Token = {
  code: string;
  issuer?: string;
  name: string;
  balance: number;
  icon?: string;
};

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  placeholder?: string;
}

export default function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  placeholder = "Select asset",
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.code.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f5ff]/50"
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#8a00ff] flex items-center justify-center text-white font-semibold text-sm">
              {selectedToken.icon || selectedToken.code.charAt(0)}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-medium">{selectedToken.code}</span>
              <span className="text-xs text-white/50">{selectedToken.name}</span>
            </div>
          </div>
        ) : (
          <span className="text-white/50">{placeholder}</span>
        )}
        <ChevronDown
          size={18}
          className={`text-white/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#030303]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00f5ff]/50 focus:border-[#00f5ff]/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Token List */}
            <div className="max-h-[280px] overflow-y-auto token-selector-scroll">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => {
                  const isSelected = selectedToken?.code === token.code;
                  return (
                    <button
                      key={`${token.code}-${token.issuer || "native"}`}
                      type="button"
                      onClick={() => handleSelect(token)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#8a00ff] flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {token.icon || token.code.charAt(0)}
                        </div>
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="text-white font-medium group-hover:text-[#00f5ff] transition-colors">
                            {token.code}
                          </span>
                          <span className="text-xs text-white/50 truncate w-full">
                            {token.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-white/70 font-mono">
                          {token.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 7,
                          })}
                        </span>
                        {isSelected && (
                          <Check size={18} className="text-[#00f5ff]" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-white/40 text-sm">
                  No assets found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
