import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/sidebar.css";

interface JwtPayload {
  id: string;
  name?: string;
  role?: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) return null;

  let userName: string | undefined;
  let userRole: string | undefined;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    userName = decoded.name;
    userRole = decoded.role;
  } catch {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">Imari+</h1>
        {userName && <p className="welcome-text">Welcome, {userName}</p>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/transactions">New Transaction</NavLink>
        <NavLink to="/timeline">Daily Timeline</NavLink>
        <NavLink to="/payroll">Payroll</NavLink>
        <NavLink to="/expenses">Expense Tracker</NavLink>
        {(userRole === "ADMIN" || userRole === "FINANCE") && (
          <NavLink to="/insights">Monthly Insights</NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        {userRole === "ADMIN" && (
          <NavLink to="/settings" className="settings-link">
            ⚙️ Settings
          </NavLink>
        )}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;