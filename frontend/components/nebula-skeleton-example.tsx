"use client";

import { useState } from "react";
import NebulaSkeleton from "./nebula-skeleton";
import StreamSummaryCard from "./streamsummarycard";

export default function NebulaSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .skeleton-demo-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #050510 0%, #0a0a14 100%);
          padding: 60px 40px;
          font-family: 'Syne', sans-serif;
        }

        .demo-header {
          max-width: 1200px;
          margin: 0 auto 40px;
          text-align: center;
        }

        .demo-title {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .demo-subtitle {
          font-size: 16px;
          color: rgba(232, 234, 246, 0.6);
          margin-bottom: 32px;
        }

        .demo-controls {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 48px;
        }

        .demo-button {
          padding: 12px 24px;
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: 12px;
          color: #00e5ff;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .demo-button:hover {
          background: rgba(0, 229, 255, 0.15);
          border-color: rgba(0, 229, 255, 0.4);
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
          transform: translateY(-2px);
        }

        .demo-button.active {
          background: rgba(138, 43, 226, 0.15);
          border-color: rgba(138, 43, 226, 0.4);
          color: #8a2be2;
        }

        .demo-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 32px;
          align-items: start;
        }

        .demo-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-label {
          font-size: 14px;
          font-weight: 700;
          color: rgba(232, 234, 246, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding-left: 8px;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .bento-large {
          grid-column: span 2;
        }

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .skeleton-demo-container {
            padding: 40px 20px;
          }

          .demo-title {
            font-size: 32px;
          }

          .demo-grid {
            grid-template-columns: 1fr;
          }

          .bento-grid {
            grid-template-columns: 1fr;
          }

          .bento-large {
            grid-column: span 1;
          }
        }
      `}</style>

      <div className="skeleton-demo-container">
        <div className="demo-header">
          <h1 className="demo-title">Nebula Pulse Skeleton</h1>
          <p className="demo-subtitle">
            Futuristic loading states with shimmering nebula effects for Glass cards
          </p>
          
          <div className="demo-controls">
            <button
              className={`demo-button ${isLoading ? "active" : ""}`}
              onClick={() => setIsLoading(true)}
            >
              Show Skeleton
            </button>
            <button
              className={`demo-button ${!isLoading ? "active" : ""}`}
              onClick={() => setIsLoading(false)}
            >
              Show Content
            </button>
          </div>
        </div>

        <div className="demo-grid">
          {/* Card Variant */}
          <div className="demo-section">
            <div className="section-label">Card Variant</div>
            {isLoading ? (
              <NebulaSkeleton variant="card" />
            ) : (
              <StreamSummaryCard />
            )}
          </div>

          {/* Bento Grid Variants */}
          <div className="demo-section">
            <div className="section-label">Bento Grid Variants</div>
            <div className="bento-grid">
              <NebulaSkeleton variant="bento-small" />
              <NebulaSkeleton variant="bento-small" />
              <div className="bento-large">
                <NebulaSkeleton variant="bento-large" />
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="demo-section" style={{ gridColumn: "1 / -1" }}>
            <div className="section-label">List Item Variant</div>
            <div className="list-container">
              <NebulaSkeleton variant="list-item" />
              <NebulaSkeleton variant="list-item" />
              <NebulaSkeleton variant="list-item" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
