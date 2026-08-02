import { useState } from "react";
import { createExpense, type ExpenseCategory } from "../../api/expenses";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "SUPPLIES", label: "Supplies" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "RENT", label: "Rent" },
  { value: "SALARY", label: "Salary" },
  { value: "ADVANCE", label: "Staff Advance" },
  { value: "OTHER", label: "Other" },
];

interface Props {
  onSuccess?: () => void;
}

export default function FormExpenses({ onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<ExpenseCategory>("SUPPLIES");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !amount) {
      return setError("Title and amount are required.");
    }

    setLoading(true);
    try {
      await createExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        notes: notes.trim() || undefined,
      });

      setTitle("");
      setAmount("");
      setCategory("SUPPLIES");
      setNotes("");
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Record Expense</h3>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="e.g. Office supplies"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Amount (RWF)</label>
        <input
          type="number"
          placeholder="0"
          min={1}
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Notes (optional)</label>
        <textarea
          placeholder="Any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {error && <p className="expense-error">{error}</p>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
}