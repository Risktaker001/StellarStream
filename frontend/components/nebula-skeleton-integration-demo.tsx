"use client";

import { useState, useEffect } from "react";
import NebulaSkeleton from "./nebula-skeleton";
import StreamSummaryCard from "./streamsummarycard";
import XLMBalanceOrb from "./xlm-balance-orb";

/**
 * Integration Demo: Shows how to use Nebula Skeleton with real components
 * This demonstrates best practices for loading states across the app
 */

export default function NebulaSkeletonIntegrationDemo() {
  const [streamLoading, setStreamLoading] = useState(true);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Simulate API calls with different timing
  useEffect(() => {
    // Stream loads after 2s
    const streamTimer = setTimeout(() => setStreamLoading(false), 2000);
    
    // Vault loads after 3s
    const vaultTimer = setTimeout(() => setVaultLoading(false), 3000);
    
    // Dashboard loads after 1.5s
    const dashboardTimer = setTimeout(() => setDashboardLoading(false), 1500);

    return () => {
      clearTimeout(streamTimer);
      clearTimeout(vaultTimer);
      clearTimeout(dashboardTimer);
    };
  }, []);

  const handleRefresh = () => {
    setStreamLoading(true);
    setVaultLoading(true);
    setDashboardLoading(true);
    
    setTimeout(() => setStreamLoading(false), 2000);
    setTimeout(() => setVaultLoading(false), 3000);
    setTimeout(() => setDashboardLoading(false), 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .integration-demo {
          min-height: 100vh;
          background: linear-gradient(180deg, #050510 0%, #0a0a14 100%);
          padding: 60px 40px;
          font-family: 'Syne', sans-serif;
        }

        .demo-header {
          max-width: 1400px;
          margin: 0 auto 48px;
        }

        .demo-title {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .demo-subtitle {
          font-size: 18px;
          color: rgba(232, 234, 246, 0.6);
          margin-bottom: 24px;
        }

        .refresh-button {
          padding: 14px 28px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 12px;
          color: #00e5ff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .refresh-button:hover {
          background: rgba(0, 229, 255, 0.15);
          border-color: rgba(0, 229, 255, 0.5);
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.2);
          transform: translateY(-2px);
        }

        .demo-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section {
          margin-bottom: 64px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: rgba(232, 234, 246, 0.9);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-badge {
          padding: 4px 12px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #00e5ff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 32px;
          margin-bottom: 32px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 24px;
        }

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 800px;
        }

        .code-block {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: rgba(232, 234, 246, 0.8);
          overflow-x: auto;
        }

        .code-comment {
          color: rgba(0, 229, 255, 0.6);
        }

        @media (max-width: 768px) {
          .integration-demo {
            padding: 40px 20px;
          }

          .demo-title {
            font-size: 36px;
          }

          .cards-grid,
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="integration-demo">
        <div className="demo-header">
          <h1 className="demo-title">Nebula Skeleton Integration</h1>
          <p className="demo-subtitle">
            Real-world examples of loading states with the Nebula Pulse skeleton
          </p>
          <button className="refresh-button" onClick={handleRefresh}>
            🔄 Reload All
          </button>
        </div>

        <div className="demo-content">
          {/* Stream Cards Section */}
          <section className="section">
            <h2 className="section-title">
              Stream Cards
              <span className="section-badge">Card Variant</span>
            </h2>
            
            <div className="cards-grid">
              {streamLoading ? (
                <>
                  <NebulaSkeleton variant="card" />
                  <NebulaSkeleton variant="card" />
                  <NebulaSkeleton variant="card" />
                </>
              ) : (
                <>
                  <StreamSummaryCard
                    sender={{ address: "0xA1b2C3d4E5f6789012345678901234567890abcd", label: "Alice" }}
                    receiver={{ address: "0xB2c3D4e5F6a7890123456789012345678901bcde", label: "Bob" }}
                    token="USDC"
                    tokenSymbol="USDC"
                    amountStreamed={342.75}
                    totalAmount={1000}
                  />
                  <StreamSummaryCard
                    sender={{ address: "0xC3d4E5f6A7b8901234567890123456789012cdef", label: "Charlie" }}
                    receiver={{ address: "0xD4e5F6a7B8c9012345678901234567890123def0", label: "Diana" }}
                    token="USDT"
                    tokenSymbol="USDT"
                    amountStreamed={1250.50}
                    totalAmount={5000}
                  />
                  <StreamSummaryCard
                    sender={{ address: "0xE5f6A7b8C9d0123456789012345678901234ef01", label: "Eve" }}
                    receiver={{ address: "0xF6a7B8c9D0e1234567890123456789012345f012", label: "Frank" }}
                    token="XLM"
                    tokenSymbol="XLM"
                    amountStreamed={8750.25}
                    totalAmount={10000}
                  />
                </>
              )}
            </div>

            <div className="code-block">
              <div className="code-comment">// Implementation</div>
              {`{streamLoading ? (
  <NebulaSkeleton variant="card" />
) : (
  <StreamSummaryCard {...streamData} />
)}`}
            </div>
          </section>

          {/* Dashboard Tiles Section */}
          <section className="section">
            <h2 className="section-title">
              Dashboard Tiles
              <span className="section-badge">Bento Variants</span>
            </h2>
            
            <div className="dashboard-grid">
              {dashboardLoading ? (
                <>
                  <NebulaSkeleton variant="bento-small" />
                  <NebulaSkeleton variant="bento-small" />
                  <NebulaSkeleton variant="bento-small" />
                  <NebulaSkeleton variant="bento-small" />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <NebulaSkeleton variant="bento-large" />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ 
                    background: "rgba(10, 10, 20, 0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    borderRadius: "24px",
                    padding: "24px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "#e8eaf6"
                  }}>
                    <div style={{ fontSize: "14px", opacity: 0.6, marginBottom: "8px" }}>Total Streams</div>
                    <div style={{ fontSize: "36px", fontWeight: "700", background: "linear-gradient(135deg, #00e5ff, #8a2be2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      127
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: "rgba(10, 10, 20, 0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    borderRadius: "24px",
                    padding: "24px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "#e8eaf6"
                  }}>
                    <div style={{ fontSize: "14px", opacity: 0.6, marginBottom: "8px" }}>Active Value</div>
                    <div style={{ fontSize: "36px", fontWeight: "700", background: "linear-gradient(135deg, #00e5ff, #8a2be2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      $2.4M
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: "rgba(10, 10, 20, 0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    borderRadius: "24px",
                    padding: "24px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "#e8eaf6"
                  }}>
                    <div style={{ fontSize: "14px", opacity: 0.6, marginBottom: "8px" }}>Avg. Rate</div>
                    <div style={{ fontSize: "36px", fontWeight: "700", background: "linear-gradient(135deg, #00e5ff, #8a2be2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      $18.9K/day
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: "rgba(10, 10, 20, 0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    borderRadius: "24px",
                    padding: "24px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "#e8eaf6"
                  }}>
                    <div style={{ fontSize: "14px", opacity: 0.6, marginBottom: "8px" }}>Gas Saved</div>
                    <div style={{ fontSize: "36px", fontWeight: "700", background: "linear-gradient(135deg, #00e5ff, #8a2be2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      $12.3K
                    </div>
                  </div>
                  
                  <div style={{ 
                    gridColumn: "1 / -1",
                    background: "rgba(10, 10, 20, 0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    borderRadius: "24px",
                    padding: "24px",
                    height: "320px",
                    display: "flex",
                    flexDirection: "column",
                    color: "#e8eaf6"
                  }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Recent Activity</div>
                    <div style={{ fontSize: "14px", opacity: 0.6 }}>Stream activity chart would go here...</div>
                  </div>
                </>
              )}
            </div>

            <div className="code-block">
              <div className="code-comment">// Dashboard Grid Implementation</div>
              {`{dashboardLoading ? (
  <>
    <NebulaSkeleton variant="bento-small" />
    <NebulaSkeleton variant="bento-small" />
    <NebulaSkeleton variant="bento-large" />
  </>
) : (
  <DashboardTiles data={dashboardData} />
)}`}
            </div>
          </section>

          {/* List Items Section */}
          <section className="section">
            <h2 className="section-title">
              Transaction List
              <span className="section-badge">List Item Variant</span>
            </h2>
            
            <div className="list-container">
              {vaultLoading ? (
                <>
                  <NebulaSkeleton variant="list-item" />
                  <NebulaSkeleton variant="list-item" />
                  <NebulaSkeleton variant="list-item" />
                  <NebulaSkeleton variant="list-item" />
                </>
              ) : (
                <>
                  {[
                    { id: 1, type: "Stream Created", amount: "$1,000", time: "2 min ago" },
                    { id: 2, type: "Withdrawal", amount: "$342.75", time: "15 min ago" },
                    { id: 3, type: "Stream Paused", amount: "$5,000", time: "1 hour ago" },
                    { id: 4, type: "Top-up", amount: "$2,500", time: "3 hours ago" },
                  ].map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        background: "rgba(10, 10, 20, 0.85)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(0, 229, 255, 0.15)",
                        borderRadius: "24px",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        color: "#e8eaf6",
                        height: "80px"
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(138, 43, 226, 0.2))",
                          border: "1px solid rgba(0, 229, 255, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px"
                        }}
                      >
                        💎
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>
                          {tx.type}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.5 }}>
                          {tx.time}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: "16px", 
                        fontWeight: "700",
                        fontFamily: "'Space Mono', monospace",
                        color: "#00e5ff"
                      }}>
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="code-block">
              <div className="code-comment">// List Implementation</div>
              {`{loading ? (
  Array.from({ length: 4 }).map((_, i) => (
    <NebulaSkeleton key={i} variant="list-item" />
  ))
) : (
  transactions.map(tx => <TransactionItem key={tx.id} {...tx} />)
)}`}
            </div>
          </section>

          {/* Best Practices Section */}
          <section className="section">
            <h2 className="section-title">
              Integration Best Practices
              <span className="section-badge">Tips</span>
            </h2>
            
            <div style={{
              background: "rgba(10, 10, 20, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(0, 229, 255, 0.15)",
              borderRadius: "24px",
              padding: "32px",
              color: "#e8eaf6"
            }}>
              <ul style={{ 
                listStyle: "none", 
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#00e5ff", fontSize: "20px" }}>✓</span>
                  <div>
                    <strong>Match skeleton to content:</strong> Use the variant that matches your actual component structure
                  </div>
                </li>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#00e5ff", fontSize: "20px" }}>✓</span>
                  <div>
                    <strong>Minimum display time:</strong> Show skeletons for at least 300ms to avoid flashing
                  </div>
                </li>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#00e5ff", fontSize: "20px" }}>✓</span>
                  <div>
                    <strong>Correct count:</strong> Show the same number of skeletons as expected items
                  </div>
                </li>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#00e5ff", fontSize: "20px" }}>✓</span>
                  <div>
                    <strong>Progressive loading:</strong> Load different sections independently for better UX
                  </div>
                </li>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#00e5ff", fontSize: "20px" }}>✓</span>
                  <div>
                    <strong>Test with throttling:</strong> Always test loading states with slow network conditions
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* XLM Balance Orb (always visible) */}
        <XLMBalanceOrb balance={3.2} threshold={5} position="bottom-right" />
      </div>
    </>
  );
}
