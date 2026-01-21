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
      <div className="app-layout container-all">
        <Sidebar active={""} setActive={(value: string) => {
          // Handle sidebar navigation here
        }} />
        <main className="content-area">
          <Routes>
            {/* Default landing */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<NewTransaction />} />
            <Route path="/timeline" element={<DailyTimeline />} />
            <Route path="/payroll" element={<PayrollModule />} />
            <Route path="/expenses" element={<ExpenseTracker />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
