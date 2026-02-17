import React, { useEffect, useState } from "react";
import api from "../../api";
import { formatMoney } from "../../utils/format";
import DashboardSkeleton from "./DashboardSkeleton";
import "../../styles/Dashboard.css";

interface Transaction {
  id: string;
  clientName: string;
  amount: number;
  createdAt: string;
  physician?: { name: string };
}

interface DashboardData {
  today?: {
    totalExpected?: number;
    netEarnedToday?: number;
  };
  recentTransactions?: Transaction[];
  finance?: {
    expensesToday?: number;
    totalRemainingPayroll?: number;
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    today: {},
    finance: {},
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/dashboard");
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

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="dashboard-container error">{error}</div>;

  const todayStats = data?.today ?? {};
  const finance = data?.finance ?? {};
  const recent = data?.recentTransactions ?? [];

  // ===== GROUPING LOGIC =====
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const todaysTransactions = recent.filter((t) => {
    const date = new Date(t.createdAt);
    return date >= startOfToday;
  });

  const yesterdaysTransactions = recent.filter((t) => {
    const date = new Date(t.createdAt);
    return date >= startOfYesterday && date < startOfToday;
  });

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* STATS */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Expected</h3>
          <p>{formatMoney(todayStats.totalExpected ?? 0)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Net Earned Today</h3>
          <p>{formatMoney(todayStats.netEarnedToday ?? 0)}</p>
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

      {/* RECENT TRANSACTIONS */}
      <div className="dashboard-section">
        <h2>Recent Transactions</h2>

        {!recent.length && (
          <p className="muted">No recent transactions</p>
        )}

        {/* TODAY */}
        {todaysTransactions.length > 0 && (
          <>
            <h3 className="section-heading">Today</h3>
            <ul className="timeline-preview">
              {todaysTransactions.map((t) => (
                <li key={t.id}>
                  <span className="badge transaction">Transaction</span>
                  <span>{t.clientName}</span>
                  <span>{formatMoney(t.amount)}</span>
                  <span>{t.physician?.name ?? "—"}</span>
                  <small>
                    {new Date(t.createdAt).toLocaleTimeString()}
                  </small>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* YESTERDAY */}
        {yesterdaysTransactions.length > 0 && (
          <>
            <h3 className="section-heading">Yesterday</h3>
            <ul className="timeline-preview">
              {yesterdaysTransactions.map((t) => (
                <li key={t.id}>
                  <span className="badge transaction">Transaction</span>
                  <span>{t.clientName}</span>
                  <span>{formatMoney(t.amount)}</span>
                  <span>{t.physician?.name ?? "—"}</span>
                  <small>
                    {new Date(t.createdAt).toLocaleTimeString()}
                  </small>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
