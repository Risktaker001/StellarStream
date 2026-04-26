/**
 * Custom hook for managing Stellar Ledger Loader state
 * 
 * Provides a clean API for showing/hiding the loader with predefined contexts
 */

"use client";

import { useState, useCallback } from "react";
import {
  TransactionOperation,
  TransactionContext,
  TRANSACTION_CONTEXTS,
  UseLoaderReturn,
} from "./ledger-loader-types";

/**
 * Hook for managing ledger loader state
 * 
 * @example
 * ```tsx
 * const loader = useLedgerLoader();
 * 
 * const handleCreateStream = async () => {
 *   loader.showLoader("create_stream");
 *   try {
 *     await createStream();
 *   } finally {
 *     loader.hideLoader();
 *   }
 * };
 * ```
 */
export function useLedgerLoader(): UseLoaderReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Waiting for Stellar Ledger to close...");
  const [duration, setDuration] = useState(5000);

  /**
   * Show the loader with a predefined or custom context
   */
  const showLoader = useCallback((context: TransactionOperation | TransactionContext) => {
    if (typeof context === "string") {
      // Use predefined context
      const ctx = TRANSACTION_CONTEXTS[context];
      setMessage(ctx.message);
      setDuration(ctx.estimatedDuration || 5000);
    } else {
      // Use custom context
      setMessage(context.message);
      setDuration(context.estimatedDuration || 5000);
    }
    setIsOpen(true);
  }, []);

  /**
   * Hide the loader
   */
  const hideLoader = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Update the message while loader is visible
   */
  const updateMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return {
    isOpen,
    message,
    duration,
    showLoader,
    hideLoader,
    updateMessage,
  };
}

/**
 * Hook variant with automatic cleanup
 * Automatically hides loader after specified duration
 * 
 * @example
 * ```tsx
 * const loader = useLedgerLoaderWithTimeout();
 * 
 * const handleTransaction = async () => {
 *   loader.showLoader("withdraw", 5000); // Auto-hides after 5s
 *   await submitTransaction();
 * };
 * ```
 */
export function useLedgerLoaderWithTimeout() {
  const loader = useLedgerLoader();
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showLoaderWithTimeout = useCallback(
    (context: TransactionOperation | TransactionContext, timeout?: number) => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Show loader
      loader.showLoader(context);

      // Set auto-hide timeout
      const duration = timeout || loader.duration;
      const id = setTimeout(() => {
        loader.hideLoader();
      }, duration);

      setTimeoutId(id);
    },
    [loader, timeoutId]
  );

  const hideLoader = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    loader.hideLoader();
  }, [loader, timeoutId]);

  return {
    ...loader,
    showLoader: showLoaderWithTimeout,
    hideLoader,
  };
}

/**
 * Hook for managing multiple sequential operations
 * Useful for batch operations or multi-step transactions
 * 
 * @example
 * ```tsx
 * const loader = useSequentialLoader();
 * 
 * const handleBatchCreate = async () => {
 *   loader.startSequence([
 *     { message: "Creating stream 1...", duration: 5000 },
 *     { message: "Creating stream 2...", duration: 5000 },
 *     { message: "Creating stream 3...", duration: 5000 },
 *   ]);
 * };
 * ```
 */
export function useSequentialLoader() {
  const loader = useLedgerLoader();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const startSequence = useCallback(
    async (steps: Array<{ message: string; duration?: number }>) => {
      setTotalSteps(steps.length);

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i + 1);
        const step = steps[i];

        loader.showLoader({
          operation: "custom",
          message: `${step.message} (${i + 1}/${steps.length})`,
          estimatedDuration: step.duration || 5000,
        });

        // Wait for step duration
        await new Promise((resolve) =>
          setTimeout(resolve, step.duration || 5000)
        );
      }

      loader.hideLoader();
      setCurrentStep(0);
      setTotalSteps(0);
    },
    [loader]
  );

  return {
    ...loader,
    currentStep,
    totalSteps,
    startSequence,
  };
}
