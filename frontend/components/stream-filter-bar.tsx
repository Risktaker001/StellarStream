"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * Stream Filter Bar Component (Issue #472)
 * Multi-select filters for Status, Asset, and Role
 * Persists user preferences to localStorage
 */

export type FilterStoreType = "status" | "asset" | "role";
export type FilterValue = string;

export interface StreamFilters {
  status: Set<string>;
  asset: Set<string>;
  role: Set<string>;
}

interface StreamFilterBarProps {
  onFiltersChange?: (filters: StreamFilters) => void;
  onClearAll?: () => void;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active", icon: "●" },
  { value: "completed", label: "Completed", icon: "✓" },
  { value: "paused", label: "Paused", icon: "⏸" },
];

const ASSET_OPTIONS = [
  { value: "usdc", label: "USDC", icon: "◎" },
  { value: "xlm", label: "XLM", icon: "★" },
  { value: "usdt", label: "USDT", icon: "₮" },
  { value: "eth", label: "ETH", icon: "Ξ" },
  { value: "wbtc", label: "WBTC", icon: "₿" },
];

const ROLE_OPTIONS = [
  { value: "sender", label: "Sender", icon: "→" },
  { value: "receiver", label: "Receiver", icon: "←" },
];

const STORAGE_KEY = "stellar_stream_filters";

export default function StreamFilterBar({
  onFiltersChange,
  onClearAll,
}: StreamFilterBarProps) {
  const [filters, setFilters] = useState<StreamFilters>({
    status: new Set(),
    asset: new Set(),
    role: new Set(),
  });

  const [openDropdown, setOpenDropdown] = useState<FilterStoreType | null>(null);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilters({
          status: new Set(parsed.status || []),
          asset: new Set(parsed.asset || []),
          role: new Set(parsed.role || []),
        });
      }
    } catch (error) {
      console.error("Failed to load filters from localStorage:", error);
    }
  }, []);

  // Save filters to localStorage and notify parent
  const updateFilters = (newFilters: StreamFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);

    // Persist to localStorage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: Array.from(newFilters.status),
          asset: Array.from(newFilters.asset),
          role: Array.from(newFilters.role),
        })
      );
    } catch (error) {
      console.error("Failed to save filters to localStorage:", error);
    }
  };

  const toggleFilter = (type: FilterStoreType, value: string) => {
    const newSet = new Set(filters[type]);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    updateFilters({ ...filters, [type]: newSet });
  };

  const toggleFilterType = (type: FilterStoreType, values: string[]) => {
    const newSet = new Set(filters[type]);
    const allSelected = values.every((v) => newSet.has(v));

    if (allSelected) {
      values.forEach((v) => newSet.delete(v));
    } else {
      values.forEach((v) => newSet.add(v));
    }

    updateFilters({ ...filters, [type]: newSet });
  };

  const clearAllFilters = () => {
    const newFilters: StreamFilters = {
      status: new Set(),
      asset: new Set(),
      role: new Set(),
    };
    updateFilters(newFilters);
    onClearAll?.();
  };

  const totalFiltersActive =
    filters.status.size + filters.asset.size + filters.role.size;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-[10px] tracking-[0.12em] text-white/50 uppercase">
            Smart Search & Filters
          </p>
          {totalFiltersActive > 0 && (
            <p className="font-body text-xs text-cyan-400/70 mt-0.5">
              {totalFiltersActive} filter{totalFiltersActive !== 1 ? "s" : ""} active
            </p>
          )}
        </div>
        {totalFiltersActive > 0 && (
          <button
            onClick={clearAllFilters}
            className="font-body text-xs font-bold text-cyan-400/70 hover:text-cyan-400 transition-colors underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Status Filter Dropdown */}
        <FilterDropdown
          label="Status"
          options={STATUS_OPTIONS}
          selected={filters.status}
          onToggle={(value) => toggleFilter("status", value)}
          onToggleAll={() =>
            toggleFilterType(
              "status",
              STATUS_OPTIONS.map((o) => o.value)
            )
          }
          isOpen={openDropdown === "status"}
          onOpenChange={(open) =>
            setOpenDropdown(open ? "status" : null)
          }
        />

        {/* Asset Filter Dropdown */}
        <FilterDropdown
          label="Asset"
          options={ASSET_OPTIONS}
          selected={filters.asset}
          onToggle={(value) => toggleFilter("asset", value)}
          onToggleAll={() =>
            toggleFilterType(
              "asset",
              ASSET_OPTIONS.map((o) => o.value)
            )
          }
          isOpen={openDropdown === "asset"}
          onOpenChange={(open) =>
            setOpenDropdown(open ? "asset" : null)
          }
        />

        {/* Role Filter Dropdown */}
        <FilterDropdown
          label="Role"
          options={ROLE_OPTIONS}
          selected={filters.role}
          onToggle={(value) => toggleFilter("role", value)}
          onToggleAll={() =>
            toggleFilterType(
              "role",
              ROLE_OPTIONS.map((o) => o.value)
            )
          }
          isOpen={openDropdown === "role"}
          onOpenChange={(open) =>
            setOpenDropdown(open ? "role" : null)
          }
        />
      </div>

      {/* Active filter pills */}
      {totalFiltersActive > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(filters.status).map((value) => (
            <FilterPill
              key={`status-${value}`}
              label={
                STATUS_OPTIONS.find((o) => o.value === value)?.label ||
                value
              }
              onRemove={() => toggleFilter("status", value)}
            />
          ))}
          {Array.from(filters.asset).map((value) => (
            <FilterPill
              key={`asset-${value}`}
              label={
                ASSET_OPTIONS.find((o) => o.value === value)?.label ||
                value
              }
              onRemove={() => toggleFilter("asset", value)}
            />
          ))}
          {Array.from(filters.role).map((value) => (
            <FilterPill
              key={`role-${value}`}
              label={
                ROLE_OPTIONS.find((o) => o.value === value)?.label ||
                value
              }
              onRemove={() => toggleFilter("role", value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: Array<{ value: string; label: string; icon: string }>;
  selected: Set<string>;
  onToggle: (value: string) => void;
  onToggleAll: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  onToggleAll,
  isOpen,
  onOpenChange,
}: FilterDropdownProps) {
  const allSelected = options.every((o) => selected.has(o.value));
  const someSelected = options.some((o) => selected.has(o.value));

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-body text-xs font-bold tracking-wider transition-all duration-200 ${
          someSelected
            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
            : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.05]"
        }`}
      >
        <span>{label}</span>
        {someSelected && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400/30 text-[9px] text-cyan-400">
            {selected.size}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 rounded-lg border border-white/10 bg-white/10 backdrop-blur-xl overflow-hidden min-w-48 shadow-xl"
          style={{ animation: "dropdownAppear 0.15s ease-out" }}
        >
          <style>{`
            @keyframes dropdownAppear {
              from { opacity: 0; transform: translateY(-4px) scaleY(0.95); }
              to { opacity: 1; transform: translateY(0) scaleY(1); }
            }
          `}</style>

          {/* Select All option */}
          <button
            onClick={onToggleAll}
            className="w-full px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-3"
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {}}
              className="w-4 h-4 rounded border-white/30 bg-transparent accent-cyan-400 cursor-pointer"
              readOnly
            />
            <span className="font-body text-xs font-bold text-white/70">
              {allSelected ? "Deselect All" : "Select All"}
            </span>
          </button>

          {/* Options */}
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onToggle(option.value)}
              className="w-full px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/[0.02] last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selected.has(option.value)}
                onChange={() => {}}
                className="w-4 h-4 rounded border-white/30 bg-transparent accent-cyan-400 cursor-pointer"
                readOnly
              />
              <span className="text-base">{option.icon}</span>
              <span className="font-body text-xs text-white/70">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterPillProps {
  label: string;
  onRemove: () => void;
}

function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5">
      <span className="font-body text-xs font-bold text-cyan-400">
        {label}
      </span>
      <button
        onClick={onRemove}
        className="text-cyan-400/50 hover:text-cyan-400 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
