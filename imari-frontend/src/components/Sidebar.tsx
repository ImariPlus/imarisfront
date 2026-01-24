import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/sidebar.css";

interface JwtPayload {
  id: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // If no token, don't render the sidebar
  if (!token) return null;

  let userName: string | undefined = undefined;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    userName = decoded.name;
  } catch (err) {
    console.error("Invalid token:", err);
    return null; // don't render sidebar if token invalid
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
      </nav>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
