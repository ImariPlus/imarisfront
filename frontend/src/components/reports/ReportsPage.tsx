import { useState } from "react";
import Overview from "./Overview";
import InsightsPanel from "./InsightsPanel";
import { getReportData, type ReportData } from "../../api/reports";
import "../../styles/Reports.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Tab = "overview" | "insights";

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() === 0 ? 12 : now.getMonth());
  const [year, setYear] = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [tab, setTab] = useState<Tab>("overview");

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  const fetchReport = async () => {
    setError("");
    setLoading(true);
    try {
      setData(await getReportData(month, year));
    } catch {
      setError("Failed to load report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Reports</h2>
        <p>Financial reporting for {MONTH_NAMES[month - 1]} {year}</p>
      </div>

      <div className="reports-controls">
        <div className="period-selector">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {tab === "overview" && (
          <button className="btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? "Loading..." : "Generate report"}
          </button>
        )}
      </div>

      <div className="reports-tabs">
        <button
          className={`reports-tab ${tab === "overview" ? "active" : ""}`}
          onClick={() => setTab("overview")}
        >
          Monthly Overview
        </button>
        <button
          className={`reports-tab ${tab === "insights" ? "active" : ""}`}
          onClick={() => setTab("insights")}
        >
          Insights
        </button>
      </div>

      {tab === "overview" && error && <p className="field-error">{error}</p>}

      {tab === "overview" ? (
        <Overview data={data} />
      ) : (
        <InsightsPanel month={month} year={year} />
      )}
    </div>
  );
}