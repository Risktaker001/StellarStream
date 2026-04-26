"use client";

import { useState } from "react";
import ProjectionTabs, { Tab } from "./projection-tabs";

export default function ProjectionTabsExample() {
  const [selectedView, setSelectedView] = useState("daily");

  // Daily/Monthly tabs
  const viewTabs: Tab[] = [
    {
      id: "daily",
      label: "Daily",
      content: (
        <div>
          <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px", color: "#00e5ff" }}>
            Daily Statistics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <StatCard title="Volume" value="1,234 XLM" change="+12.5%" />
            <StatCard title="Transactions" value="89" change="+8.3%" />
            <StatCard title="Active Streams" value="23" change="+15.2%" />
          </div>
        </div>
      ),
    },
    {
      id: "monthly",
      label: "Monthly",
      content: (
        <div>
          <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px", color: "#00e5ff" }}>
            Monthly Statistics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <StatCard title="Volume" value="45,678 XLM" change="+23.4%" />
            <StatCard title="Transactions" value="2,456" change="+18.7%" />
            <StatCard title="Active Streams" value="156" change="+32.1%" />
          </div>
        </div>
      ),
    },
  ];

  // Stream status tabs
  const statusTabs: Tab[] = [
    {
      id: "active",
      label: "Active",
      content: (
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#e8eaf6" }}>
            Active Streams (23)
          </h3>
          <StreamList streams={["Stream #1234", "Stream #1235", "Stream #1236"]} status="active" />
        </div>
      ),
    },
    {
      id: "paused",
      label: "Paused",
      content: (
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#e8eaf6" }}>
            Paused Streams (5)
          </h3>
          <StreamList streams={["Stream #1237", "Stream #1238"]} status="paused" />
        </div>
      ),
    },
    {
      id: "completed",
      label: "Completed",
      content: (
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#e8eaf6" }}>
            Completed Streams (142)
          </h3>
          <StreamList streams={["Stream #1100", "Stream #1101", "Stream #1102"]} status="completed" />
        </div>
      ),
    },
  ];

  // Settings tabs
  const settingsTabs: Tab[] = [
    {
      id: "general",
      label: "General",
      content: (
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#e8eaf6" }}>
            General Settings
          </h3>
          <SettingsList settings={["Language", "Timezone", "Currency"]} />
        </div>
      ),
    },
    {
      id: "security",
      label: "Security",
      content: (
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#e8eaf6" }}>
            Security Settings
          </h3>
          <SettingsList settings={["Two-Factor Auth", "Biometric Login", "Session Timeout"]} />
        </div>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      content: (
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#e8eaf6" }}>
            Notification Settings
          </h3>
          <SettingsList settings={["Email Alerts", "Push Notifications", "SMS Alerts"]} />
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .projection-demo-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #050510 0%, #0a0a14 100%);
          padding: 60px 40px;
          font-family: 'Syne', sans-serif;
        }

        .demo-header {
          max-width: 1200px;
          margin: 0 auto 48px;
          text-align: center;
        }

        .demo-title {
          font-size: 56px;
          font-weight: 800;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        .demo-subtitle {
          font-size: 18px;
          color: rgba(232, 234, 246, 0.6);
          margin-bottom: 32px;
        }

        .demo-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-section {
          margin-bottom: 64px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: rgba(232, 234, 246, 0.9);
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
        }

        .stat-title {
          font-size: 12px;
          color: rgba(232, 234, 246, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 14px;
          font-weight: 600;
          color: #00ff88;
        }

        .stream-item {
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stream-name {
          font-size: 14px;
          color: rgba(232, 234, 246, 0.9);
        }

        .stream-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stream-badge.active {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .stream-badge.paused {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .stream-badge.completed {
          background: rgba(150, 150, 170, 0.2);
          color: rgba(150, 150, 170, 0.8);
        }

        .setting-item {
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-name {
          font-size: 14px;
          color: rgba(232, 234, 246, 0.9);
        }

        .setting-toggle {
          width: 48px;
          height: 24px;
          background: rgba(0, 229, 255, 0.3);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
        }

        .setting-toggle::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: #00e5ff;
          border-radius: 50%;
          top: 2px;
          right: 2px;
          box-shadow: 0 2px 8px rgba(0, 229, 255, 0.5);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 32px;
        }

        .feature-card {
          background: rgba(10, 10, 20, 0.6);
          border: 1px solid rgba(0, 229, 255, 0.15);
          border-radius: 16px;
          padding: 24px;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00e5ff, #8a2be2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 20px;
        }

        .feature-title {
          font-size: 16px;
          font-weight: 700;
          color: #e8eaf6;
          margin-bottom: 8px;
        }

        .feature-description {
          font-size: 13px;
          color: rgba(232, 234, 246, 0.6);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .projection-demo-container {
            padding: 40px 20px;
          }

          .demo-title {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="projection-demo-container">
        <div className="demo-header">
          <h1 className="demo-title">Projection Tabs</h1>
          <p className="demo-subtitle">
            Tab navigation with light beam projection effect and backdrop blur
          </p>
        </div>

        <div className="demo-content">
          {/* Daily/Monthly View */}
          <section className="demo-section">
            <h2 className="section-title">Daily / Monthly View</h2>
            <ProjectionTabs
              tabs={viewTabs}
              defaultTab="daily"
              onChange={setSelectedView}
            />
          </section>

          {/* Stream Status */}
          <section className="demo-section">
            <h2 className="section-title">Stream Status</h2>
            <ProjectionTabs tabs={statusTabs} defaultTab="active" />
          </section>

          {/* Settings */}
          <section className="demo-section">
            <h2 className="section-title">Settings</h2>
            <ProjectionTabs tabs={settingsTabs} defaultTab="general" />
          </section>

          {/* Features */}
          <section className="demo-section">
            <h2 className="section-title">Component Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💡</div>
                <div className="feature-title">Light Beam Effect</div>
                <div className="feature-description">
                  Conical gradient projection from bottom creates a futuristic light beam appearance
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌫️</div>
                <div className="feature-title">Backdrop Blur</div>
                <div className="feature-description">
                  High-intensity backdrop blur (24px) on active tab for depth and focus
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <div className="feature-title">Smooth Transitions</div>
                <div className="feature-description">
                  Cubic-bezier easing for natural, premium feel when switching tabs
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⌨️</div>
                <div className="feature-title">Keyboard Accessible</div>
                <div className="feature-description">
                  Full keyboard navigation support with visible focus indicators
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <div className="feature-title">Responsive Design</div>
                <div className="feature-description">
                  Adapts to mobile with vertical layout and optimized spacing
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <div className="feature-title">Customizable</div>
                <div className="feature-description">
                  Easy to customize with any content and styling options
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">{change}</div>
    </div>
  );
}

function StreamList({ streams, status }: { streams: string[]; status: string }) {
  return (
    <div>
      {streams.map((stream, index) => (
        <div key={index} className="stream-item">
          <span className="stream-name">{stream}</span>
          <span className={`stream-badge ${status}`}>{status}</span>
        </div>
      ))}
    </div>
  );
}

function SettingsList({ settings }: { settings: string[] }) {
  return (
    <div>
      {settings.map((setting, index) => (
        <div key={index} className="setting-item">
          <span className="setting-name">{setting}</span>
          <div className="setting-toggle" />
        </div>
      ))}
    </div>
  );
}
