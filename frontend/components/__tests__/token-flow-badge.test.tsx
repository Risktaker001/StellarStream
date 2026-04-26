import { render, screen } from '@testing-library/react';
import TokenFlowBadge from '../token-flow-badge';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowDown: ({ size, strokeWidth }: any) => (
    <svg data-testid="arrow-down" width={size} height={size} strokeWidth={strokeWidth}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  ArrowUp: ({ size, strokeWidth }: any) => (
    <svg data-testid="arrow-up" width={size} height={size} strokeWidth={strokeWidth}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
}));

describe('TokenFlowBadge', () => {
  it('renders incoming badge with down arrow', () => {
    render(<TokenFlowBadge direction="incoming" />);
    
    expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
    expect(screen.queryByTestId('arrow-up')).not.toBeInTheDocument();
  });

  it('renders outgoing badge with up arrow', () => {
    render(<TokenFlowBadge direction="outgoing" />);
    
    expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
    expect(screen.queryByTestId('arrow-down')).not.toBeInTheDocument();
  });

  it('applies correct size classes for small badge', () => {
    const { container } = render(<TokenFlowBadge direction="incoming" size="sm" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('h-5', 'w-8', 'px-1');
  });

  it('applies correct size classes for medium badge (default)', () => {
    const { container } = render(<TokenFlowBadge direction="incoming" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('h-6', 'w-10', 'px-1.5');
  });

  it('applies correct size classes for large badge', () => {
    const { container } = render(<TokenFlowBadge direction="incoming" size="lg" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('h-7', 'w-12', 'px-2');
  });

  it('applies incoming color classes', () => {
    const { container } = render(<TokenFlowBadge direction="incoming" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-cyan-500/10', 'border-cyan-400/20');
  });

  it('applies outgoing color classes', () => {
    const { container } = render(<TokenFlowBadge direction="outgoing" />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-violet-500/10', 'border-violet-400/20');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TokenFlowBadge direction="incoming" className="custom-class" />
    );
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-class');
  });

  it('renders glass effect elements', () => {
    const { container } = render(<TokenFlowBadge direction="incoming" />);
    
    // Check for glass overlay
    const glassOverlay = container.querySelector('.bg-gradient-to-br.from-white\\/5');
    expect(glassOverlay).toBeInTheDocument();
    
    // Check for inner glow
    const innerGlow = container.querySelector('.bg-gradient-to-br.from-cyan-400\\/20');
    expect(innerGlow).toBeInTheDocument();
  });

  it('renders correct icon size based on size prop', () => {
    render(<TokenFlowBadge direction="incoming" size="lg" />);
    
    const icon = screen.getByTestId('arrow-down');
    expect(icon).toHaveAttribute('width', '16');
    expect(icon).toHaveAttribute('height', '16');
  });
});