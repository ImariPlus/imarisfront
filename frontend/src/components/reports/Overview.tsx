import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import type { ReportData } from "../../api/reports";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_LABELS: Record<string, string> = {
  SUPPLIES: "Supplies", UTILITIES: "Utilities", RENT: "Rent",
  SALARY: "Salary", ADVANCE: "Staff Advances", OTHER: "Other",
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash", MOBILE: "Mobile Money", BANK: "Bank Transfer",
};

const COLORS = [
  "var(--color-primary)", "var(--color-success)", "var(--color-warning)",
  "var(--color-danger)", "var(--color-info)", "var(--color-text-muted)",
];

const formatRWF = (v: unknown) => `${Number(v ?? 0).toLocaleString()} RWF`;

interface OverviewProps {
  data: ReportData | null;
}

export default function Overview({ data }: OverviewProps) {
  if (!data) {
    return (
      <p className="empty-state">
        Select a period and click &ldquo;Generate report&rdquo; to see the monthly overview.
      </p>
    );
  }

  const dailyData = Object.entries(data.revenue.byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      amount,
    }));

  const expenseData = Object.entries(data.expenses.byCategory).map(([cat, amount]) => ({
    name: CATEGORY_LABELS[cat] ?? cat,
    value: amount,
  }));

  const paymentData = Object.entries(data.revenue.byPaymentMethod).map(
    ([method, { amount, count }]) => ({
      name: PAYMENT_LABELS[method] ?? method,
      amount,
      count,
    })
  );

  return (
    <>
      <div className="reports-summary">
        <div className="report-card report-card--revenue">
          <span className="report-card__label">Net Revenue</span>
          <span className="report-card__value">{data.revenue.net.toLocaleString()} RWF</span>
          <span className="report-card__sub">
            {data.revenue.transactionCount} transactions · {data.revenue.discounts.toLocaleString()} RWF discounts
          </span>
        </div>
        <div className="report-card report-card--expenses">
          <span className="report-card__label">Total Expenses</span>
          <span className="report-card__value">{data.expenses.total.toLocaleString()} RWF</span>
          <span className="report-card__sub">{Object.keys(data.expenses.byCategory).length} categories</span>
        </div>
        <div className="report-card report-card--payroll">
          <span className="report-card__label">Payroll</span>
          <span className="report-card__value">{data.payroll.total.toLocaleString()} RWF</span>
          <span className="report-card__sub">{data.payroll.count} staff members</span>
        </div>
        <div className={`report-card ${data.netPosition >= 0 ? "report-card--positive" : "report-card--negative"}`}>
          <span className="report-card__label">Net Position</span>
          <span className="report-card__value">{data.netPosition.toLocaleString()} RWF</span>
          <span className="report-card__sub">{data.netPosition >= 0 ? "Profitable month ↑" : "Loss this month ↓"}</span>
        </div>
      </div>

      {dailyData.length > 0 && (
        <div className="card reports-chart">
          <h3>Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={formatRWF} />
              <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="reports-row">
        {expenseData.length > 0 && (
          <div className="card reports-chart">
            <h3>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatRWF} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {paymentData.length > 0 && (
          <div className="card reports-chart">
            <h3>Payment Methods</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={formatRWF} />
                <Bar dataKey="amount" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.revenue.byClinician.length > 0 && (
        <div className="card">
          <h3>Revenue by Clinician</h3>
          <div className="clinician-list">
            {data.revenue.byClinician.map((c, i) => {
              const pct = data.revenue.gross > 0
                ? Math.round((c.amount / data.revenue.gross) * 100)
                : 0;
              return (
                <div key={i} className="clinician-row">
                  <div className="clinician-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="clinician-info">
                    <div className="clinician-name-row">
                      <span className="clinician-name">{c.name}</span>
                      <span className="clinician-amount">{c.amount.toLocaleString()} RWF</span>
                    </div>
                    <div className="clinician-bar-track">
                      <div className="clinician-bar-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="clinician-meta">{c.count} transactions · {pct}% of revenue</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.revenue.transactionCount === 0 && data.expenses.total === 0 && (
        <p className="empty-state">
          No data found for {MONTH_NAMES[data.period.month - 1]} {data.period.year}.
        </p>
      )}
    </>
  );
}