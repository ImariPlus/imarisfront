import React, { useState } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import NewTransaction from "./components/NewTransaction";
import DailyTimeline from "./components/DailyTimeline";
import PayrollModule from "./components/PayrollModule";
import ExpenseTracker from "./components/ExpenseTracker";
import "./App.css";

const App: React.FC = () => {
  const [active, setActive] = useState("dashboard");

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard />;
      case "transaction":
        return <NewTransaction />;
      case "timeline":
        return <DailyTimeline />;
      case "payroll":
        return <PayrollModule />;
      case "expenses":
        return <ExpenseTracker />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} />
      <main className="content-area">{renderContent()}</main>
    </div>
  );
};

export default App;
