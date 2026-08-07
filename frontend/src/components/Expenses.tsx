import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import FormExpenses from "./expenses/form.expenses";
import ListExpenses from "./expenses/list.expenses";
import "../styles/Expenses.css";

interface JwtPayload {
  id: string;
  role: string;
}

export default function Expenses() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const token = localStorage.getItem("token");
  let userRole = "USER";
  if (token) {
    try {
      userRole = jwtDecode<JwtPayload>(token).role;
    } catch (err) {
      // Log decode errors to help with debugging invalid or expired tokens
      // Avoids empty catch block lint error
      
      console.error("Failed to decode token:", err);
    }
  }
  const canAdd = userRole === "ADMIN" || userRole === "FINANCE";

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h2>Expense Tracker</h2>
        <p>Monitor clinic spending, payroll advances, and operational costs.</p>
      </div>

      <div className="expenses-layout">
        {canAdd && (
          <aside className="expenses-sidebar">
            <FormExpenses onSuccess={handleSuccess} />
          </aside>
        )}

        <main className="expenses-main">
          <ListExpenses refreshTrigger={refreshTrigger} />
        </main>
      </div>
    </div>
  );
}