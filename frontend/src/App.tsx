import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/dashboard/dashboard";
import NewTransaction from "./components/NewTransaction";
import DailyTimeline from "./components/DailyTimeline";
import Payroll from "./components/Payroll";
import ExpenseTracker from "./components/ExpenseTracker";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./components/Settings";
import ReportsPage from "./components/reports/ReportsPage";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="content-area">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* All roles */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <NewTransaction />
              </ProtectedRoute>
            } />
            <Route path="/timeline" element={
              <ProtectedRoute>
                <DailyTimeline />
              </ProtectedRoute>
            } />

            {/* FINANCE + ADMIN only */}
            <Route path="/payroll" element={
              <ProtectedRoute allowedRoles={["ADMIN", "FINANCE"]}>
                <Payroll />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute allowedRoles={["ADMIN", "FINANCE"]}>
                <ExpenseTracker />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={["ADMIN", "FINANCE"]}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <Navigate to="/reports" replace/>
            } />

            {/* ADMIN only */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;