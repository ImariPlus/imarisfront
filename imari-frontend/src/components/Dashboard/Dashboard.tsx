import React, { useEffect, useState } from "react";
import api from "../../api";
import { formatMoney } from "../../utils/format";
import "../../styles/Dashboard.css";

interface TimelineEntry {
  id: string;
  description: string;
  type: string;
  createdAt: string;
  user?: { name: string };
}

interface DashboardData {
  today?: {
    totalExpected?: number;
    netEarnedToday?: number;
  };
  finance?: {
    expensesToday?: number;
    totalRemainingPayroll?: number;
    recentTimeline?: TimelineEntry[];
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("api/dashboard");
        setData(res.data ?? {});
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-container">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="dashboard-container error">{error}</div>;
  }

  const today = data?.today ?? {};
  const finance = data?.finance ?? {};

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* STATS */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Expected</h3>
          <p>{formatMoney(today.totalExpected ?? 0)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Net Earned Today</h3>
          <p>{formatMoney(today.netEarnedToday ?? 0)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Expenses Today</h3>
          <p>{formatMoney(finance.expensesToday ?? 0)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Remaining Payroll</h3>
          <p>{formatMoney(finance.totalRemainingPayroll ?? 0)}</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>

        {finance.recentTimeline?.length ? (
          <ul className="timeline-preview">
            {finance.recentTimeline.slice(0, 5).map((entry) => (
              <li key={entry.id}>
                <span className={`badge ${entry.type.toLowerCase()}`}>
                  {entry.type}
                </span>
                <span>{entry.description}</span>
                <small>
                  {entry.user?.name ?? "System"} ·{" "}
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No recent activity</p>
        )}

        <button className="link-button">View full timeline →</button>
      </div>
    </div>
  );
};

export default Dashboard;
