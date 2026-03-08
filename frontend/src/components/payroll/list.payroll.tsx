import { useEffect, useState } from "react";
import axios from "../../api/payroll.ts";
import ItemPayroll from "./item.payroll";
import FormPayroll from "./form.payroll";
import SkeletonPayroll from "./skeleton.payroll";
import "../../styles/Payroll.css";

interface User {
  id: string;
  name: string;
  photo: string;
}

interface Payroll {
  id: string;
  user: User;
  savedAmount: number;
  netPayable: number;
}

export default function ListPayroll() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.getPayrolls();
      setPayrolls(res);
    } catch (err) {
      console.error("Failed to fetch payrolls", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleFormSuccess = () => {
    fetchPayrolls();
  };

  if (loading) {
    return (
      <div className="payroll-list">
        {[...Array(5)].map((_, i) => (
          <SkeletonPayroll key={i} />
        ))}
      </div>
    );
  }

  if (payrolls.length === 0) {
    return <p className="payroll-empty">No payrolls to display.</p>;
  }

  return (
    <div className="payroll-container">
      <div className="payroll-list">
        {payrolls.map((payroll) => (
          <div
            key={payroll.id}
            className={`payroll-item ${selectedUserId === payroll.user.id ? "selected" : ""}`}
            onClick={() => setSelectedUserId(payroll.user.id)}
          >
            <ItemPayroll payroll={payroll} />
          </div>
        ))}
      </div>

      <div className="payroll-form-container">
        <FormPayroll onSuccess={handleFormSuccess} />
      </div>
    </div>
  );
}