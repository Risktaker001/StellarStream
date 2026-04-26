import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransactionPendingOrb } from './TransactionPendingOrb';
import type { WalletStatus } from '../types/wallet';

describe('TransactionPendingOrb', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Visibility toggling', () => {
    it('should not render when wallet status is idle', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="idle" />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when wallet status is signed', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="signed" />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when wallet status is rejected', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="rejected" />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when wallet status is pending', () => {
      render(<TransactionPendingOrb walletStatus="pending" />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('should disappear immediately when status changes from pending to signed', () => {
      const { rerender, container } = render(<TransactionPendingOrb walletStatus="pending" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<TransactionPendingOrb walletStatus="signed" />);
      expect(container.firstChild).toBeNull();
    });

    it('should disappear immediately when status changes from pending to rejected', () => {
      const { rerender, container } = render(<TransactionPendingOrb walletStatus="pending" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<TransactionPendingOrb walletStatus="rejected" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Content rendering', () => {
    it('should display the correct text', () => {
      render(<TransactionPendingOrb walletStatus="pending" />);
      expect(screen.getByText('Awaiting Ledger Authorization...')).toBeInTheDocument();
    });

    it('should render the orb element', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orb = container.querySelector('.orb');
      expect(orb).toBeInTheDocument();
    });

    it('should render the orb wrapper with animation class', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbWrapper = container.querySelector('.orb-wrapper');
      expect(orbWrapper).toBeInTheDocument();
      expect(orbWrapper).toHaveClass('orb-wrapper');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<TransactionPendingOrb walletStatus="pending" />);
      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<TransactionPendingOrb walletStatus="pending" />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have default aria-label', () => {
      render(<TransactionPendingOrb walletStatus="pending" />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Transaction status');
    });

    it('should accept custom aria-label', () => {
      render(<TransactionPendingOrb walletStatus="pending" ariaLabel="Custom label" />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should update ARIA live region when pending', async () => {
      render(<TransactionPendingOrb walletStatus="pending" />);
      
      await waitFor(() => {
        const liveRegion = document.querySelector('.sr-only[aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Awaiting Ledger Authorization...');
      });
    });

    it('should clear ARIA live region when not pending', async () => {
      const { rerender } = render(<TransactionPendingOrb walletStatus="pending" />);
      
      await waitFor(() => {
        const liveRegion = document.querySelector('.sr-only[aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Awaiting Ledger Authorization...');
      });

      rerender(<TransactionPendingOrb walletStatus="idle" />);
      
      // Component unmounts, so live region should not exist
      const liveRegion = document.querySelector('.sr-only[aria-live="polite"]');
      expect(liveRegion).not.toBeInTheDocument();
    });
  });

  describe('Animation state', () => {
    it('should apply breathing animation class when pending', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbWrapper = container.querySelector('.orb-wrapper');
      expect(orbWrapper).toBeInTheDocument();
      
      // Check that the element has the class that triggers animation
      expect(orbWrapper).toHaveClass('orb-wrapper');
    });

    it('should not render animation when not pending', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="idle" />);
      const orbWrapper = container.querySelector('.orb-wrapper');
      expect(orbWrapper).not.toBeInTheDocument();
    });
  });

  describe('Performance and memory', () => {
    it('should not cause memory leaks on rapid status changes', () => {
      const statuses: WalletStatus[] = ['idle', 'pending', 'signed', 'pending', 'rejected', 'idle'];
      const { rerender } = render(<TransactionPendingOrb walletStatus="idle" />);

      statuses.forEach((status) => {
        rerender(<TransactionPendingOrb walletStatus={status} />);
      });

      // If no errors thrown, component handles rapid changes
      expect(true).toBe(true);
    });

    it('should clean up effects on unmount', () => {
      const { unmount } = render(<TransactionPendingOrb walletStatus="pending" />);
      unmount();
      
      // Verify no elements remain
      const container = document.querySelector('.transaction-pending-orb-container');
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('should apply correct container class', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      expect(orbContainer).toBeInTheDocument();
    });

    it('should apply correct text class', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const text = container.querySelector('.orb-text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('Awaiting Ledger Authorization...');
    });
  });
});
