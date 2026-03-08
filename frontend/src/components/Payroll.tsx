import { useState } from "react";
import FormPayroll from "./payroll/form.payroll";
import ListPayroll from "./payroll/list.payroll";
import "../styles/Payroll.css";

export default function Payroll() {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);

  return (
    <div className="payroll-page">
      <h2>Payroll Management</h2>

      <div className="payroll-form-section">
        <FormPayroll onSuccess={handleRefresh} />
      </div>

      <div className="payroll-list-section">
        <ListPayroll key={refresh.toString()} />
      </div>
    </div>
  );
}