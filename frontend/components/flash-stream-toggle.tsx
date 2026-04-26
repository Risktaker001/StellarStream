"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Flash Stream Toggle Component
 * Issue #420 - Permit2 One-Click Stream Creation
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A toggle switch that enables "Flash Stream" mode - skipping the approval
 * step by using V2 create_via_signature logic for gasless stream creation.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { createSignaturePayload, signMessage, verifySignature } from "@/lib/signature-auth";

interface FlashStreamToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  sender: string;
  receiver: string;
  token: string;
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  contractId?: string;
  onSignatureComplete?: (signature: string) => void;
  disabled?: boolean;
}

type SignatureState = "idle" | "signing" | "verifying" | "verified" | "error";

export default function FlashStreamToggle({
  enabled,
  onEnabledChange,
  sender,
  receiver,
  token,
  amount,
  startTime,
  endTime,
  contractId = "CONTRACT_ID_PLACEHOLDER",
  onSignatureComplete,
  disabled = false,
}: FlashStreamToggleProps) {
  const [signatureState, setSignatureState] = useState<SignatureState>("idle");
  const [signature, setSignature] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Reset signature when toggle is disabled
  useEffect(() => {
    if (!enabled) {
      setSignatureState("idle");
      setSignature("");
      setErrorMessage("");
    }
  }, [enabled]);

  const handleToggle = async () => {
    if (disabled) return;

    const newState = !enabled;
    onEnabledChange(newState);

    // If enabling, we initiate the signature flow
    if (newState) {
      await initiateSignatureFlow();
    }
  };

  const initiateSignatureFlow = async () => {
    try {
      setSignatureState("signing");

      // Create the signature payload
      const payload = createSignaturePayload(
        sender,
        receiver,
        token,
        amount,
        startTime,
        endTime,
        contractId
      );

      // Sign the message
      const signedXdr = await signMessage(payload, sender);
      setSignature(signedXdr);

      // Verify the signature
      setSignatureState("verifying");
      const result = await verifySignature(payload, signedXdr, sender);

      if (result.verified) {
        setSignatureState("verified");
        onSignatureComplete?.(signedXdr);
      } else {
        throw new Error("Signature verification failed");
      }
    } catch (error) {
      console.error("Flash Stream signature error:", error);
      setSignatureState("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to sign");
      onEnabledChange(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .flash-stream-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .flash-stream-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .flash-stream-label {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .flash-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8a00ff 0%, #00f5ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(138, 0, 255, 0.3);
        }

        .flash-text-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .flash-title {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.02em;
        }

        .flash-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Toggle Switch */
        .flash-toggle {
          position: relative;
          width: 52px;
          height: 28px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .flash-toggle.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .flash-toggle.disabled .toggle-track {
          pointer-events: none;
        }

        .toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .toggle-track.inactive {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .toggle-track.active {
          background: linear-gradient(135deg, rgba(138, 0, 255, 0.6) 0%, rgba(0, 245, 255, 0.6) 100%);
          border: 1px solid rgba(138, 0, 255, 0.4);
          box-shadow: 0 0 20px rgba(138, 0, 255, 0.3);
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .toggle-thumb.active {
          transform: translateX(24px);
        }

        /* Status Display */
        .flash-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
        }

        .flash-status.signing {
          border-color: rgba(138, 0, 255, 0.3);
          background: rgba(138, 0, 255, 0.05);
        }

        .flash-status.verified {
          border-color: rgba(0, 245, 255, 0.3);
          background: rgba(0, 245, 255, 0.05);
        }

        .flash-status.error {
          border-color: rgba(255, 107, 43, 0.3);
          background: rgba(255, 107, 43, 0.05);
        }

        .status-icon {
          flex-shrink: 0;
        }

        .status-icon.signing {
          color: #8a00ff;
          animation: spin 1s linear infinite;
        }

        .status-icon.verified {
          color: #00f5ff;
        }

        .status-icon.error {
          color: #ff6b2b;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .status-text {
          color: rgba(255, 255, 255, 0.7);
        }

        .status-text.signing {
          color: #8a00ff;
        }

        .status-text.verified {
          color: #00f5ff;
        }

        .status-text.error {
          color: #ff6b2b;
        }

        .signature-hash {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          margin-left: auto;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      <div className="flash-stream-container">
        {/* Toggle Header */}
        <div className="flash-stream-header">
          <div className="flash-stream-label">
            <div className="flash-icon">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flash-text-group">
              <span className="flash-title">Flash Stream</span>
              <span className="flash-subtitle">Skip approval, sign to create</span>
            </div>
          </div>

          <button
            className={`flash-toggle ${disabled ? "disabled" : ""}`}
            onClick={handleToggle}
            disabled={disabled}
            aria-pressed={enabled}
            aria-label="Enable Flash Stream"
          >
            <div className={`toggle-track ${enabled ? "active" : "inactive"}`}>
              <motion.div
                className={`toggle-thumb ${enabled ? "active" : ""}`}
                layout
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30,
                }}
              />
            </div>
          </button>
        </div>

        {/* Signature Status */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flash-status"
            >
              {signatureState === "idle" && (
                <>
                  <AlertCircle className="status-icon" style={{ color: "rgba(255,255,255,0.4)" }} />
                  <span className="status-text">Ready to sign</span>
                </>
              )}

              {signatureState === "signing" && (
                <>
                  <Loader2 className="status-icon signing" />
                  <span className="status-text signing">Waiting for wallet signature...</span>
                </>
              )}

              {signatureState === "verifying" && (
                <>
                  <Loader2 className="status-icon signing" />
                  <span className="status-text signing">Verifying signature...</span>
                </>
              )}

              {signatureState === "verified" && (
                <>
                  <CheckCircle className="status-icon verified" />
                  <span className="status-text verified">Signature Verified ✓</span>
                  {signature && (
                    <span className="signature-hash">
                      {signature.slice(0, 8)}...
                    </span>
                  )}
                </>
              )}

              {signatureState === "error" && (
                <>
                  <AlertCircle className="status-icon error" />
                  <span className="status-text error">
                    {errorMessage || "Signature failed"}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}