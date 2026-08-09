import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard, ArrowRightLeft, Clock, Wallet,
  Receipt, BarChart2, Settings, LogOut
} from "lucide-react";
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

  const isFinance = userRole === "FINANCE";
  const isAdmin = userRole === "ADMIN";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">Imari+</h1>
        {userName && <p className="welcome-text">Welcome, {userName}</p>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/transactions">
          <ArrowRightLeft size={16} /> Transactions
        </NavLink>
        <NavLink to="/timeline">
          <Clock size={16} /> Daily Timeline
        </NavLink>
        {(isFinance || isAdmin) && (
          <NavLink to="/payroll">
            <Wallet size={16} /> Payroll
          </NavLink>
        )}
        {(isFinance || isAdmin) && (
          <NavLink to="/expenses">
            <Receipt size={16} /> Expenses
          </NavLink>
        )}
        {(isFinance || isAdmin) && (
          <NavLink to="/reports">
            <BarChart2 size={16} /> Reports
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        {isAdmin && (
          <NavLink to="/settings" className="settings-link">
            <Settings size={16} /> Settings
          </NavLink>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;