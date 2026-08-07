import React, { useEffect, useState } from "react";
import api from "../../api";
import { formatMoney } from "../../utils/format";
import DashboardSkeleton from "./skeleton.dashboard";
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
    payrolls?: {
      grossPay: number;
      savedAmount: number;
      remainingAmount: number;
    }[];
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

  // Payroll progress
  const payrolls = finance.payrolls ?? [];
  const totalGross = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
  const totalSaved = payrolls.reduce((sum, p) => sum + p.savedAmount, 0);
  const pct = totalGross > 0 ? Math.round((totalSaved / totalGross) * 100) : 0;

  // Grouping
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const todaysTransactions = recent.filter((t) => new Date(t.createdAt) >= startOfToday);
  const yesterdaysTransactions = recent.filter((t) => {
    const d = new Date(t.createdAt);
    return d >= startOfYesterday && d < startOfToday;
  });

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

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

        <div className="dashboard-card payroll-card-wide">
          <div className="payroll-header">
            <div>
              <h3>Remaining Payroll</h3>
              <p className="payroll-amount">
                {formatMoney(finance.totalRemainingPayroll ?? 0)}
              </p>
            </div>
            <span className="payroll-chip">This month</span>
          </div>
          <div className="payroll-progress">
            <div className="payroll-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="payroll-footer">
            <span>Saved so far</span>
            <strong>{pct}%</strong>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="dashboard-section">
        <h2>Recent Transactions</h2>

        {!recent.length && <p className="muted">No recent transactions</p>}

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
                  <small>{new Date(t.createdAt).toLocaleTimeString()}</small>
                </li>
              ))}
            </ul>
          </>
        )}

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
                  <small>{new Date(t.createdAt).toLocaleTimeString()}</small>
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