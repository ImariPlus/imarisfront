import { useState, useEffect } from "react";
import { initPayroll, addDailySave, getPayrolls } from "../../api/payroll";

interface Payroll {
  user: {
    id: string;
  };
  grossPay?: number;
  savedAmount?: number;
}

interface Props {
  userId?: string; // optionally pass userId from parent
  onSuccess?: () => void;
}

export default function FormPayroll({ userId = "default-user", onSuccess }: Props) {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [grossPay, setGrossPay] = useState<number>(0);
  const [amountSaved, setAmountSaved] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing payroll for this user/month/year
  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const payrolls = await getPayrolls({ month, year });
        const existing = payrolls.find((p: Payroll) => p.user.id === userId);
        if (existing) {
          setGrossPay(existing.grossPay || 0);
          setAmountSaved(existing.savedAmount || 0);
        } else {
          setGrossPay(0);
          setAmountSaved(0);
        }
      } catch (err) {
        console.error("Failed to fetch payroll:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [userId, month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!grossPay && amountSaved === 0) {
      return setError("Enter gross pay or daily save.");
    }

    setLoading(true);
    try {
      if (grossPay > 0) {
        // Initialize payroll for this user
        await initPayroll({ staffId: userId, month, year });
      }
      if (amountSaved > 0) {
        // Add daily save
        await addDailySave({ payrollId: userId, amount: amountSaved });
      }

      // Clear inputs after success
      setGrossPay(0);
      setAmountSaved(0);

      onSuccess?.();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderMonthOptions = () =>
    Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
      <option key={m} value={m}>
        {m}
      </option>
    ));

  const renderYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1].map((y) => (
      <option key={y} value={y}>
        {y}
      </option>
    ));
  };

  return (
    <form className="payroll-form" onSubmit={handleSubmit}>
      <div className="payroll-date">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {renderMonthOptions()}
        </select>

        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {renderYearOptions()}
        </select>
      </div>

      <input
        type="number"
        placeholder="Gross Pay"
        value={grossPay}
        onChange={(e) => setGrossPay(Number(e.target.value))}
        min={0}
      />

      <input
        type="number"
        placeholder="Daily Save (optional)"
        value={amountSaved}
        onChange={(e) => setAmountSaved(Number(e.target.value))}
        min={0}
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}