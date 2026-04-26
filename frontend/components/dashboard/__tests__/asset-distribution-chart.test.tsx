import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AssetDistributionChart from "../asset-distribution-chart";

describe("AssetDistributionChart", () => {
  const mockAssets = [
    {
      token: "USDC",
      amount: 15000,
      usdValue: 15000,
      color: "#00f5ff",
    },
    {
      token: "XLM",
      amount: 50000,
      usdValue: 10000,
      color: "#8a00ff",
    },
    {
      token: "USDT",
      amount: 5000,
      usdValue: 5000,
      color: "#ff3b5c",
    },
  ];

  it("renders without crashing", () => {
    render(<AssetDistributionChart assets={mockAssets} />);
    expect(screen.getByText("Total Value")).toBeInTheDocument();
  });

  it("displays total USD value correctly", () => {
    render(<AssetDistributionChart assets={mockAssets} />);
    // Total: 15000 + 10000 + 5000 = 30000
    expect(screen.getByText("$30,000.00")).toBeInTheDocument();
  });

  it("renders all asset tokens in legend", () => {
    render(<AssetDistributionChart assets={mockAssets} />);
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("XLM")).toBeInTheDocument();
    expect(screen.getByText("USDT")).toBeInTheDocument();
  });

  it("calculates percentages correctly", () => {
    render(<AssetDistributionChart assets={mockAssets} />);
    // USDC: 15000/30000 = 50%
    // XLM: 10000/30000 = 33.3%
    // USDT: 5000/30000 = 16.7%
    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByText("33.3%")).toBeInTheDocument();
    expect(screen.getByText("16.7%")).toBeInTheDocument();
  });

  it("updates center text on legend item hover", () => {
    render(<AssetDistributionChart assets={mockAssets} />);
    
    const usdcLegendItem = screen.getByText("USDC").closest(".legend-item");
    
    if (usdcLegendItem) {
      fireEvent.mouseEnter(usdcLegendItem);
      expect(screen.getByText("USDC")).toBeInTheDocument();
      expect(screen.getByText("$15,000.00")).toBeInTheDocument();
      
      fireEvent.mouseLeave(usdcLegendItem);
      expect(screen.getByText("Total Value")).toBeInTheDocument();
    }
  });

  it("applies custom className", () => {
    const { container } = render(
      <AssetDistributionChart assets={mockAssets} className="custom-class" />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("handles empty assets array", () => {
    render(<AssetDistributionChart assets={[]} />);
    expect(screen.getByText("Total Value")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("handles single asset", () => {
    const singleAsset = [mockAssets[0]];
    render(<AssetDistributionChart assets={singleAsset} />);
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("formats large numbers correctly", () => {
    const largeAssets = [
      {
        token: "BTC",
        amount: 10,
        usdValue: 1000000,
        color: "#ffb300",
      },
    ];
    render(<AssetDistributionChart assets={largeAssets} />);
    expect(screen.getByText("$1,000,000.00")).toBeInTheDocument();
  });

  it("renders SVG gradients", () => {
    const { container } = render(<AssetDistributionChart assets={mockAssets} />);
    const gradients = container.querySelectorAll("linearGradient");
    expect(gradients.length).toBeGreaterThan(0);
  });

  it("applies active class to hovered legend item", () => {
    render(<AssetDistributionChart assets={mockAssets} />);
    
    const usdcLegendItem = screen.getByText("USDC").closest(".legend-item");
    
    if (usdcLegendItem) {
      expect(usdcLegendItem).not.toHaveClass("active");
      
      fireEvent.mouseEnter(usdcLegendItem);
      expect(usdcLegendItem).toHaveClass("active");
      
      fireEvent.mouseLeave(usdcLegendItem);
      expect(usdcLegendItem).not.toHaveClass("active");
    }
  });
});
