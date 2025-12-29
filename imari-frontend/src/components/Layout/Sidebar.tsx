import React from "react";

type SidebarProps = {
  active: string;
  setActive: (key: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ active, setActive }) => {
  return (
    <nav className="sidebar">
      <h1>Imari+</h1>
      <button onClick={() => setActive("dashboard")}>Dashboard</button>
      <button onClick={() => setActive("transaction")}>New Transaction</button>
      <button onClick={() => setActive("timeline")}>Daily Timeline</button>
      <button onClick={() => setActive("payroll")}>Payroll</button>
      <button onClick={() => setActive("expenses")}>Expense Tracker</button>
    </nav>
  );
};

export default Sidebar;
