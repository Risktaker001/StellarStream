"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProtocolStatus = {
    /** True when the contract has entered Emergency Mode (Issue #37) */
    isEmergency: boolean;
    /** Human-readable reason string returned by the contract, if any */
    emergencyReason: string | null;
    /** Timestamp of when emergency mode was detected */
    emergencyDetectedAt: Date | null;
    /** Whether the initial status fetch is still in-flight */
    isLoading: boolean;
    /** Last time the status was successfully polled */
    lastChecked: Date | null;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ProtocolStatusContext = createContext<ProtocolStatus>({
    isEmergency: false,
    emergencyReason: null,
    emergencyDetectedAt: null,
    isLoading: true,
    lastChecked: null,
});

// ─── Soroban contract polling stub ───────────────────────────────────────────
//
// Replace the body of this function with the real Soroban SDK call, e.g.:
//
//   import { Contract, SorobanRpc } from "@stellar/stellar-sdk";
//   const server  = new SorobanRpc.Server(RPC_URL);
//   const contract = new Contract(CONTRACT_ADDRESS);
//   const result  = await contract.call("get_protocol_status");
//   return {
//     isEmergency: result.is_emergency,
//     reason:      result.emergency_reason ?? null,
//   };
//
async function fetchProtocolStatus(): Promise<{
    isEmergency: boolean;
    reason: string | null;
}> {
    // Simulate network round-trip
    await new Promise((r) => setTimeout(r, 600));

    // ── DEV TOGGLE ──────────────────────────────────────────────────────────────
    // Set NEXT_PUBLIC_FORCE_EMERGENCY=true in .env.local to test the banner UI
    // without waiting for the contract to actually enter emergency mode.
    if (process.env.NEXT_PUBLIC_FORCE_EMERGENCY === "true") {
        return {
            isEmergency: true,
            reason: "Contract paused by multisig guardian — funds are safe.",
        };
    }
    // ── /DEV TOGGLE ─────────────────────────────────────────────────────────────

    return { isEmergency: false, reason: null };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000; // 30 s — adjust to taste

export function ProtocolStatusProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<ProtocolStatus>({
        isEmergency: false,
        emergencyReason: null,
        emergencyDetectedAt: null,
        isLoading: true,
        lastChecked: null,
    });

    const poll = useCallback(async () => {
        try {
            const { isEmergency, reason } = await fetchProtocolStatus();
            setStatus((prev) => ({
                isEmergency,
                emergencyReason: reason,
                // Preserve the original detection timestamp so the banner doesn't reset
                emergencyDetectedAt:
                    isEmergency && !prev.isEmergency ? new Date() : prev.emergencyDetectedAt,
                isLoading: false,
                lastChecked: new Date(),
            }));
        } catch {
            // Don't update isEmergency on poll failure — keep last known state
            setStatus((prev) => ({ ...prev, isLoading: false, lastChecked: new Date() }));
        }
    }, []);

    useEffect(() => {
        poll();
        const id = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [poll]);

    return (
        <ProtocolStatusContext.Provider value={status}>
            {children}
        </ProtocolStatusContext.Provider>
    );
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

export function useProtocolStatus(): ProtocolStatus {
    return useContext(ProtocolStatusContext);
}