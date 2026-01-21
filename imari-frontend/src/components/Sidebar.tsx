import React from "react";
import { NavLink } from "react-router-dom";
// import "../styles/Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar container-left">
      <h1 className="logo">Imari+</h1>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/transactions">New Transaction</NavLink>
        <NavLink to="/timeline">Daily Timeline</NavLink>
        <NavLink to="/payroll">Payroll</NavLink>
        <NavLink to="/expenses">Expense Tracker</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
