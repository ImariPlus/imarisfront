/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { getInsightsData, type
InsightsData } from "../api/insights";
import "../styles/Insights.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_LABELS: Record<string, string> = {
  SUPPLIES: "Supplies",
  UTILITIES: "Utilities",
  RENT: "Rent",
  SALARY: "Salary",
  ADVANCE: "Staff Advances",
  OTHER: "Other",
};

function buildPrompt(data: InsightsData): string {
  const monthName = MONTH_NAMES[data.period.month - 1];
  const year = data.period.year;

  const expenseLines = Object.entries(data.expenses.byCategory)
    .map(([cat, amt]) => `  - ${CATEGORY_LABELS[cat] ?? cat}: ${amt.toLocaleString()} RWF`)
    .join("\n");

  const physicianLines = Object.entries(data.revenue.byPhysician)
    .map(([name, amt]) => `  - ${name}: ${amt.toLocaleString()} RWF`)
    .join("\n");

  return `You are a financial advisor for a small healthcare clinic in Rwanda called Imari+. Analyze the following monthly financial report and provide 3-5 specific, actionable insights and recommendations. Be concise, practical, and considerate of the healthcare context in Rwanda. Format your response as a numbered list of insights, each with a bold title and 2-3 sentences of explanation.

FINANCIAL REPORT — ${monthName} ${year}

REVENUE:
- Gross revenue: ${data.revenue.gross.toLocaleString()} RWF
- Total discounts given: ${data.revenue.discounts.toLocaleString()} RWF
- Net revenue: ${data.revenue.net.toLocaleString()} RWF
- Total patient transactions: ${data.revenue.transactionCount}

Revenue by physician:
${physicianLines || "  - No data"}

EXPENSES:
- Total expenses: ${data.expenses.total.toLocaleString()} RWF
${expenseLines || "  - No expenses recorded"}

PAYROLL:
- Total gross payroll: ${data.payroll.total.toLocaleString()} RWF
- Staff advances taken: ${data.payroll.advances.toLocaleString()} RWF
- Number of staff on payroll: ${data.payroll.staffCount}

NET POSITION (Revenue - Expenses - Payroll): ${data.netPosition.toLocaleString()} RWF

Please provide specific, actionable insights based on this data.`;
}

export default function Insights() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() === 0 ? 12 : now.getMonth()); // previous month
  const [year, setYear] = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [data, setData] = useState<InsightsData | null>(null);
  const [insights, setInsights] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  const fetchAndAnalyze = async () => {
    setError("");
    setInsights("");
    setData(null);
    setLoadingData(true);

    let fetchedData: InsightsData;
    try {
      fetchedData = await getInsightsData(month, year);
      setData(fetchedData);
    } catch (_err) {
      setError("Failed to load financial data. Please try again.");
      setLoadingData(false);
      return;
    } finally {
      setLoadingData(false);
    }

    // Now call Claude
    setLoadingAI(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: [{ role: "user", content: buildPrompt(fetchedData) }],
        }),
      });

      const result = await response.json();
      const text = result.content?.[0]?.text ?? "No insights generated.";
      setInsights(text);
    } catch (_err) {
      setError("Failed to generate AI insights. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Generate year options (current year and 2 years back)
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="insights-page">
      <div className="insights-header">
        <div>
          <h2>Monthly Insights</h2>
          <p className="insights-subtitle">
            AI-powered financial analysis for your clinic
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div className="insights-controls">
        <div className="period-selector">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          className="generate-btn"
          onClick={fetchAndAnalyze}
          disabled={loadingData || loadingAI}
        >
          {loadingData ? "Loading data..." : loadingAI ? "Analyzing..." : "Generate insights"}
        </button>
      </div>

      {error && <p className="insights-error">{error}</p>}

      {/* Summary cards */}
      {data && (
        <div className="insights-summary">
          <div className="summary-card revenue">
            <span className="summary-label">Net Revenue</span>
            <span className="summary-value">{data.revenue.net.toLocaleString()} RWF</span>
            <span className="summary-sub">{data.revenue.transactionCount} transactions</span>
          </div>
          <div className="summary-card expenses">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-value">{data.expenses.total.toLocaleString()} RWF</span>
            <span className="summary-sub">{Object.keys(data.expenses.byCategory).length} categories</span>
          </div>
          <div className="summary-card payroll">
            <span className="summary-label">Payroll</span>
            <span className="summary-value">{data.payroll.total.toLocaleString()} RWF</span>
            <span className="summary-sub">{data.payroll.staffCount} staff members</span>
          </div>
          <div className={`summary-card net ${data.netPosition >= 0 ? "positive" : "negative"}`}>
            <span className="summary-label">Net Position</span>
            <span className="summary-value">{data.netPosition.toLocaleString()} RWF</span>
            <span className="summary-sub">{data.netPosition >= 0 ? "Profitable month" : "Loss this month"}</span>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {loadingAI && (
        <div className="insights-loading">
          <div className="insights-spinner" />
          <p>Claude is analyzing your financial data...</p>
        </div>
      )}

      {insights && (
        <div className="insights-result">
          <div className="insights-result-header">
            <span className="insights-badge">AI Insights</span>
            <span className="insights-period">
              {MONTH_NAMES[month - 1]} {year}
            </span>
          </div>
          <div className="insights-text">
            {insights.split("\n").map((line, i) => {
              if (!line.trim()) return <br key={i} />;
              // Bold **text**
              const parts = line.split(/\*\*(.*?)\*\*/g);
              return (
                <p key={i}>
                  {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}