import { useEffect, useState, useCallback } from "react";
import { getExpenses, type Expense, type ExpenseCategory } from "../../api/expenses";
import ItemExpense from "./item.espenses";
import SkeletonExpense from "./skeleton.expenses";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: string;
  role: string;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  SUPPLIES: "#6366f1",
  UTILITIES: "#0ea5e9",
  RENT: "#f59e0b",
  SALARY: "#10b981",
  ADVANCE: "#f43f5e",
  OTHER: "#94a3b8",
};

// Default date range: first day of current month to today
const defaultFrom = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
};
const defaultTo = () => new Date().toISOString().split("T")[0];

export default function ListExpenses({ refreshTrigger }: { refreshTrigger: number }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ExpenseCategory | "ALL">("ALL");
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const token = localStorage.getItem("token");
  let userRole = "USER";
  if (token) {
    try {
      userRole = jwtDecode<JwtPayload>(token).role;
    } catch (err) {
      console.error("Failed to decode JWT token", err);
    }
  }
  const canEdit = userRole === "ADMIN" || userRole === "FINANCE";

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenses({ from, to: to + "T23:59:59" });
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger, fetchExpenses]);

  const filtered =
    filter === "ALL" ? expenses : expenses.filter((e) => e.category === filter);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expense-list-container">

      {/* Date range filter */}
      <div className="expense-date-range">
        <label>From</label>
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => setFrom(e.target.value)}
        />
        <label>To</label>
        <input
          type="date"
          value={to}
          min={from}
          max={defaultTo()}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          className="filter-btn"
          onClick={() => { setFrom(defaultFrom()); setTo(defaultTo()); }}
        >
          This month
        </button>
      </div>

      {/* Category filter + total */}
      <div className="expense-summary">
        <span className="expense-total">
          Total: <strong>{total.toLocaleString()} RWF</strong>
        </span>
        <div className="expense-filters">
          {(["ALL", "SUPPLIES", "UTILITIES", "RENT", "SALARY", "ADVANCE", "OTHER"] as const).map(
            (cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? "active" : ""}`}
                style={
                  filter === cat && cat !== "ALL"
                    ? {
                        background: CATEGORY_COLORS[cat as ExpenseCategory],
                        color: "#fff",
                        borderColor: CATEGORY_COLORS[cat as ExpenseCategory],
                      }
                    : {}
                }
                onClick={() => setFilter(cat)}
              >
                {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* List */}
      <div className="expense-list">
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonExpense key={i} />)
        ) : filtered.length === 0 ? (
          <p className="expense-empty">No expenses found for this period.</p>
        ) : (
          filtered.map((expense) => (
            <ItemExpense
              key={expense.id}
              expense={expense}
              canEdit={canEdit}
              onUpdated={fetchExpenses}
              onDeleted={fetchExpenses}
            />
          ))
        )}
      </div>
    </div>
  );
}