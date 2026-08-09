import { useState } from "react";
import { analyzeInsights } from "../../api/insights";
import "../../styles/Insights.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface InsightsPanelProps {
  month: number;
  year: number;
}

// Renders **bold** segments from the AI's markdown-ish response without
// pulling in a full markdown parser for one feature.
function renderInsights(text: string) {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i}>
          {parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
        </p>
      );
    });
}

export default function InsightsPanel({ month, year }: InsightsPanelProps) {
  const [insights, setInsights] = useState("");
  const [period, setPeriod] = useState<{ month: number; year: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setError("");
    setInsights("");
    setLoading(true);
    try {
      const result = await analyzeInsights(month, year);
      setInsights(result.insights);
      setPeriod(result.period);
    } catch {
      setError("Failed to generate AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insights-panel">
      <div className="insights-controls">
        <p className="insights-subtitle">
          AI-powered analysis of {MONTH_NAMES[month - 1]} {year}
        </p>
        <button className="generate-btn" onClick={generate} disabled={loading}>
          {loading ? "Analyzing..." : "Generate insights"}
        </button>
      </div>

      {error && <p className="insights-error">{error}</p>}

      {loading && (
        <div className="insights-loading">
          <span className="insights-spinner" />
          Claude is analyzing your numbers...
        </div>
      )}

      {insights && !loading && (
        <div className="insights-result">
          <div className="insights-result-header">
            <span className="insights-badge">AI Insights</span>
            {period && (
              <span className="insights-period">
                {MONTH_NAMES[period.month - 1]} {period.year}
              </span>
            )}
          </div>
          <div className="insights-text">{renderInsights(insights)}</div>
        </div>
      )}

      {!insights && !loading && !error && (
        <p className="empty-state">
          Click &ldquo;Generate insights&rdquo; to get an AI analysis of this period&rsquo;s numbers.
        </p>
      )}
    </div>
  );
}