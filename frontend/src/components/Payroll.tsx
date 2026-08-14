import { useEffect, useState, useMemo, type ComponentType } from "react";
import { jwtDecode } from "jwt-decode";
import { getPayrolls, type StaffPayroll } from "../api/payroll";
import ItemPayroll from "./payroll/item.payroll";
import FormPayroll from "./payroll/form.payroll";
import "../styles/Payroll.css";

interface JwtPayload { id: string; role: string; }

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Payroll() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [payrolls, setPayrolls] = useState<StaffPayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const token = localStorage.getItem("token");
  const userRole = useMemo(() => {
    if (!token) return "USER";
    try { return jwtDecode<JwtPayload>(token).role ?? "USER"; }
    catch { return "USER"; }
  }, [token]);
  const canManage = userRole === "ADMIN" || userRole === "FINANCE";

  useEffect(() => {
    let mounted = true;
    const fetchPayrolls = async () => {
      setLoading(true);
      try {
        const data = await getPayrolls({ month, year });
        if (mounted) setPayrolls(data);
      } catch (err) { console.error(err); }
      finally { if (mounted) setLoading(false); }
    };

    fetchPayrolls();
    return () => { mounted = false; };
  }, [month, year, refreshTrigger]);

  const onUpdated = () => setRefreshTrigger((p) => p + 1);

  const FormPayrollComponent = FormPayroll as ComponentType<{
    month: number;
    year: number;
    existingEmployeeIds: string[];
    onSuccess: () => void;
  }>;

  // Summary totals
  const totalGross = payrolls.reduce((s, p) => s + p.grossPay, 0);
  const totalSaved = payrolls.reduce((s, p) => s + p.savedAmount, 0);
  const totalPayable = payrolls.reduce((s, p) => s + p.netPayable, 0);
  const totalRemaining = payrolls.reduce((s, p) => s + p.remainingAmount, 0);

  const existingEmployeeIds = payrolls.map((p) => p.employeeId);
  const years = [now.getFullYear(), now.getFullYear() - 1];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Payroll</h2>
        <p>Manage staff pay, savings and outstanding balances</p>
      </div>

      {/* Period selector */}
      <div className="payroll-controls">
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
      </div>

      {/* Summary cards */}
      <div className="payroll-summary">
        <div className="payroll-summary-card">
          <span className="payroll-summary-card__label">Total Payroll</span>
          <span className="payroll-summary-card__value">{totalGross.toLocaleString()} RWF</span>
        </div>
        <div className="payroll-summary-card">
          <span className="payroll-summary-card__label">Saved</span>
          <span className="payroll-summary-card__value">{totalSaved.toLocaleString()} RWF</span>
        </div>
        <div className="payroll-summary-card">
          <span className="payroll-summary-card__label">Payable</span>
          <span className="payroll-summary-card__value">{totalPayable.toLocaleString()} RWF</span>
        </div>
        <div className="payroll-summary-card payroll-summary-card--outstanding">
          <span className="payroll-summary-card__label">Outstanding</span>
          <span className="payroll-summary-card__value">{totalRemaining.toLocaleString()} RWF</span>
        </div>
      </div>

      {/* Split layout */}
      <div className="split-layout">
        {canManage && (
          <aside>
            <FormPayrollComponent
              month={month}
              year={year}
              existingEmployeeIds={existingEmployeeIds}
              onSuccess={onUpdated}
            />
          </aside>
        )}

        <main>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="payroll-card" style={{ pointerEvents: "none" }}>
                  <div className="payroll-card__main">
                    <div className="skel" style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      <div className="skel" style={{ width: "40%", height: 14 }} />
                      <div className="skel" style={{ width: "25%", height: 11 }} />
                      <div className="skel" style={{ width: "60%", height: 11 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : payrolls.length === 0 ? (
            <p className="empty-state">No payroll records for {MONTH_NAMES[month - 1]} {year}.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {payrolls.map((p) => (
                <ItemPayroll
                  key={p.id}
                  payroll={p}
                  canManage={canManage}
                  onUpdated={onUpdated}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}