import { useState } from "react";
import { type StaffPayroll, addDailySave, finalizePayroll } from "../../api/payroll";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--color-warning)",
  PAID: "var(--color-success)",
  CLOSED: "var(--color-text-muted)",
};

interface Props {
  payroll: StaffPayroll;
  canManage: boolean;
  onUpdated: () => void;
}

export default function ItemPayroll({ payroll, canManage, onUpdated }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [saveAmount, setSaveAmount] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState("");

  const pct = payroll.netPayable > 0
    ? Math.min(Math.round((payroll.savedAmount / payroll.netPayable) * 100), 100)
    : 0;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  const isLocked = payroll.status === "PAID" || payroll.status === "CLOSED";

  const handleSave = async () => {
    if (!saveAmount || Number(saveAmount) <= 0) return;
    setError(""); setSaving(true);
    try {
      await addDailySave({
        employeeId: payroll.employeeId,
        month: payroll.month,
        year: payroll.year,
        amountSavedToday: Number(saveAmount),
      });
      setSaveAmount("");
      onUpdated();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to save amount."
      );
    } finally { setSaving(false); }
  };

  const handleFinalize = async (status: "PAID" | "CLOSED") => {
    if (!confirm(`Mark ${payroll.employee.name}'s payroll as ${status}?`)) return;
    setFinalizing(true);
    try {
      await finalizePayroll({ employeeId: payroll.employeeId, month: payroll.month, year: payroll.year, status });
      onUpdated();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to finalize payroll."
      );
    } finally { setFinalizing(false); }
  };

  return (
    <div className={`payroll-card ${expanded ? "payroll-card--open" : ""}`}>
      {/* Main row */}
      <div className="payroll-card__main" onClick={() => setExpanded((p) => !p)}>
        {/* Progress ring + avatar */}
        <div className="payroll-ring-wrap">
          <svg width="80" height="80" className="payroll-ring">
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="6"
            />
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="payroll-ring-label">{pct}%</div>
        </div>

        {/* Info */}
        <div className="payroll-card__info">
          <div className="payroll-card__name-row">
            <span className="payroll-card__name">{payroll.employee.name}</span>
            <span className="payroll-card__status" style={{ color: STATUS_COLORS[payroll.status] }}>
              {payroll.status}
            </span>
          </div>
          <div className="payroll-card__role">
            {payroll.employee.roles}
          </div>
          <div className="payroll-card__amounts">
            <span>Saved: <strong>{payroll.savedAmount.toLocaleString()} RWF</strong></span>
            <span>·</span>
            <span>Remaining: <strong>{payroll.remainingAmount.toLocaleString()} RWF</strong></span>
          </div>
        </div>

        <span className={`timeline-chevron ${expanded ? "open" : ""}`}>⌄</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="payroll-card__details" onClick={(e) => e.stopPropagation()}>
          <div className="payroll-details-grid">
            <div className="payroll-detail-item">
              <span>Gross Pay</span>
              <strong>{payroll.grossPay.toLocaleString()} RWF</strong>
            </div>
            <div className="payroll-detail-item">
              <span>Advances Taken</span>
              <strong>{payroll.advancesTaken.toLocaleString()} RWF</strong>
            </div>
            <div className="payroll-detail-item">
              <span>Saved So Far</span>
              <strong>{payroll.savedAmount.toLocaleString()} RWF</strong>
            </div>
            <div className="payroll-detail-item">
              <span>Net Payable</span>
              <strong>{payroll.netPayable.toLocaleString()} RWF</strong>
            </div>
            <div className="payroll-detail-item">
              <span>Remaining</span>
              <strong>{payroll.remainingAmount.toLocaleString()} RWF</strong>
            </div>
            <div className="payroll-detail-item">
              <span>Status</span>
              <strong style={{ color: STATUS_COLORS[payroll.status] }}>{payroll.status}</strong>
            </div>
          </div>

          {canManage && !isLocked && (
            <div className="payroll-card__actions">
              <div className="payroll-save-row">
                <input
                  type="number"
                  placeholder="Amount to save today"
                  value={saveAmount}
                  onChange={(e) => setSaveAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  min={1}
                />
                <button className="btn-primary" onClick={handleSave} disabled={saving || !saveAmount}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              <div className="payroll-finalize-row">
                <button className="btn-ghost" onClick={() => handleFinalize("CLOSED")} disabled={finalizing}>
                  Mark Closed
                </button>
                <button className="btn-primary" onClick={() => handleFinalize("PAID")} disabled={finalizing}>
                  Mark Paid
                </button>
              </div>
            </div>
          )}

          {isLocked && (
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-3)" }}>
              This payroll is {payroll.status.toLowerCase()} and can no longer be modified.
            </p>
          )}

          {error && <p className="field-error" style={{ marginTop: "var(--space-2)" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}