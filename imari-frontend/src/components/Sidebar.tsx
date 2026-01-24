import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sidebar">
      <h1 className="logo">Imari+</h1>
      <div className="sidebar-nav">

        <button
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

        <button
          className={location.pathname === "/transactions" ? "active" : ""}
          onClick={() => navigate("/transactions")}
        >
          New Transaction
        </button>

        <button
          className={location.pathname === "/timeline" ? "active" : ""}
          onClick={() => navigate("/timeline")}
        >
          Daily Timeline
        </button>

        <button
          className={location.pathname === "/payroll" ? "active" : ""}
          onClick={() => navigate("/payroll")}
        >
          Payroll
        </button>

        <button
          className={location.pathname === "/expenses" ? "active" : ""}
          onClick={() => navigate("/expenses")}
        >
          Expense Tracker
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
