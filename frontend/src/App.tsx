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
import Insights from "./components/Insights";
import ClinicalStaff from "./components/ClinicalStaff";
import Settings from "./components/Settings";
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

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <NewTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timeline"
              element={
                <ProtectedRoute>
                  <DailyTimeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <ExpenseTracker />
                </ProtectedRoute>
              }
            />

            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clinical-staff"
              element={
                <ProtectedRoute>
                  <ClinicalStaff />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
