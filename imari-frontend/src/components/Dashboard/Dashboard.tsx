import React from "react";
import "../../Styles/Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Total Transactions</h2>
          <p>0</p>
        </div>
        <div className="dashboard-card">
          <h2>Daily Timeline</h2>
          <p>View timeline</p>
        </div>
        <div className="dashboard-card">
          <h2>Payroll Summary</h2>
          <p>0</p>
        </div>
        <div className="dashboard-card">
          <h2>Expenses</h2>
          <p>$0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
