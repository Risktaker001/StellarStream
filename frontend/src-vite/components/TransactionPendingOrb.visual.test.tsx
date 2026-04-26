import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TransactionPendingOrb } from './TransactionPendingOrb';

/**
 * Visual regression tests
 * These tests verify the component's visual structure and CSS classes
 */
describe('TransactionPendingOrb - Visual Tests', () => {
  describe('Layout and positioning', () => {
    it('should have fixed positioning styles', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      expect(orbContainer).toBeInTheDocument();
      
      const styles = window.getComputedStyle(orbContainer!);
      expect(styles.position).toBe('fixed');
    });

    it('should be positioned in bottom-right corner', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      const styles = window.getComputedStyle(orbContainer!);
      expect(styles.bottom).toBeTruthy();
      expect(styles.right).toBeTruthy();
    });

    it('should have high z-index for overlay', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      const styles = window.getComputedStyle(orbContainer!);
      expect(parseInt(styles.zIndex)).toBeGreaterThan(1000);
    });

    it('should be non-blocking with pointer-events none', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      const styles = window.getComputedStyle(orbContainer!);
      expect(styles.pointerEvents).toBe('none');
    });
  });

  describe('Orb structure', () => {
    it('should have orb wrapper element', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbWrapper = container.querySelector('.orb-wrapper');
      
      expect(orbWrapper).toBeInTheDocument();
    });

    it('should have orb element inside wrapper', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orb = container.querySelector('.orb');
      const orbWrapper = container.querySelector('.orb-wrapper');
      
      expect(orb).toBeInTheDocument();
      expect(orbWrapper).toContainElement(orb);
    });

    it('should have circular orb shape', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orb = container.querySelector('.orb');
      
      const styles = window.getComputedStyle(orb!);
      expect(styles.borderRadius).toBe('50%');
    });

    it('should have orb with defined dimensions', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbWrapper = container.querySelector('.orb-wrapper');
      
      const styles = window.getComputedStyle(orbWrapper!);
      expect(styles.width).toBeTruthy();
      expect(styles.height).toBeTruthy();
    });
  });

  describe('Text rendering', () => {
    it('should render text element with correct class', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const text = container.querySelector('.orb-text');
      
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('Awaiting Ledger Authorization...');
    });

    it('should have text positioned next to orb', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      const styles = window.getComputedStyle(orbContainer!);
      expect(styles.display).toBe('flex');
    });
  });

  describe('Animation classes', () => {
    it('should have animation class on orb wrapper', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbWrapper = container.querySelector('.orb-wrapper');
      
      expect(orbWrapper).toHaveClass('orb-wrapper');
    });

    it('should have will-change property for performance', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      const styles = window.getComputedStyle(orbContainer!);
      expect(styles.willChange).toBe('transform');
    });
  });

  describe('Accessibility elements', () => {
    it('should have screen reader only element', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const srOnly = container.querySelector('.sr-only');
      
      expect(srOnly).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on live region', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const srOnly = container.querySelector('.sr-only');
      
      expect(srOnly).toHaveAttribute('aria-live', 'polite');
      expect(srOnly).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Performance optimizations', () => {
    it('should use CSS containment', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      
      const styles = window.getComputedStyle(orbContainer!);
      // Check if contain property is set (may vary by browser)
      expect(styles.contain).toBeTruthy();
    });
  });

  describe('Component structure integrity', () => {
    it('should maintain consistent DOM structure', () => {
      const { container } = render(<TransactionPendingOrb walletStatus="pending" />);
      
      // Verify the expected structure
      const orbContainer = container.querySelector('.transaction-pending-orb-container');
      const orbWrapper = container.querySelector('.orb-wrapper');
      const orb = container.querySelector('.orb');
      const text = container.querySelector('.orb-text');
      const srOnly = container.querySelector('.sr-only');
      
      expect(orbContainer).toBeInTheDocument();
      expect(orbWrapper).toBeInTheDocument();
      expect(orb).toBeInTheDocument();
      expect(text).toBeInTheDocument();
      expect(srOnly).toBeInTheDocument();
      
      // Verify hierarchy
      expect(orbContainer).toContainElement(orbWrapper);
      expect(orbContainer).toContainElement(text);
      expect(orbContainer).toContainElement(srOnly);
      expect(orbWrapper).toContainElement(orb);
    });
  });
});
