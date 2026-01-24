import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import NewTransaction from "./components/NewTransaction";
import DailyTimeline from "./components/DailyTimeline";
import PayrollModule from "./components/PayrollModule/PayrollModule";
import ExpenseTracker from "./components/ExpenseTracker";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<NewTransaction />} />
            <Route path="/timeline" element={<DailyTimeline />} />
            <Route path="/payroll" element={<PayrollModule />} />
            <Route path="/expenses" element={<ExpenseTracker />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
