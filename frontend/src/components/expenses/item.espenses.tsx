import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { type Expense, updateExpense, deleteExpense, type ExpenseCategory } from "../../api/expenses";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  SUPPLIES: "Supplies",
  UTILITIES: "Utilities",
  RENT: "Rent",
  SALARY: "Salary",
  ADVANCE: "Staff Advance",
  OTHER: "Other",
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  SUPPLIES: "var(--color-cat-supplies)",
  UTILITIES: "var(--color-cat-utilities)",
  RENT: "var(--color-cat-rent)",
  SALARY: "var(--color-cat-salary)",
  ADVANCE: "var(--color-cat-advance)",
  OTHER: "var(--color-cat-other)",
};

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][];

interface Props {
  expense: Expense;
  onUpdated: () => void;
  onDeleted: () => void;
  canEdit: boolean;
}

export default function ItemExpense({ expense, onUpdated, onDeleted, canEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [notes, setNotes] = useState(expense.notes || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateExpense(expense.id, { title, amount, category, notes: notes || undefined });
      setEditing(false);
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this expense?")) return;
    setLoading(true);
    try {
      await deleteExpense(expense.id);
      onDeleted();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const color = CATEGORY_COLORS[expense.category];
  const date = new Date(expense.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  if (editing) {
    return (
      <form className="expense-item editing" onSubmit={handleUpdate}>
        <div className="editing-fields">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1} />
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORIES.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="expense-item-actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="expense-item">
      <span className="expense-category-dot" style={{ background: color }} title={CATEGORY_LABELS[expense.category]} />
      <div className="expense-item-main">
        <span className="expense-title">{expense.title}</span>
        <span className="expense-meta">
          {date} · {expense.recordedBy.name}
          {expense.notes && <> · <em>{expense.notes}</em></>}
        </span>
      </div>
      <span className="expense-category-badge" style={{ color, borderColor: color }}>
        {CATEGORY_LABELS[expense.category]}
      </span>
      <span className="expense-amount">{expense.amount.toLocaleString()} RWF</span>
      {canEdit && (
        <div className="expense-item-actions">
          <button className="btn-ghost" onClick={() => setEditing(true)} disabled={loading} title="Edit">
            <Pencil size={15} />
          </button>
          <button className="btn-ghost" onClick={handleDelete} disabled={loading} title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}