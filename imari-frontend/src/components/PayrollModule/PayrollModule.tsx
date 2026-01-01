import React, { useState, useEffect } from "react";
import "../../Styles/PayrollModule.css";

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  paid: boolean;
}

const PayrollModule: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate fetching employee payroll data
    const fetchEmployees = async () => {
      try {
        // Replace this with real API call later
        const data: Employee[] = [
          { id: 1, name: "Alice", position: "Nurse", salary: 2000, paid: false },
          { id: 2, name: "Bob", position: "Receptionist", salary: 1500, paid: true },
          { id: 3, name: "Charlie", position: "Doctor", salary: 5000, paid: false },
        ];
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const togglePaid = (id: number) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, paid: !emp.paid } : emp))
    );
  };

  if (loading) return <div className="payroll-container">Loading...</div>;

  return (
    <div className="payroll-container">
      <h2>Payroll</h2>
      <table className="payroll-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.position}</td>
              <td>${emp.salary.toFixed(2)}</td>
              <td>{emp.paid ? "Paid" : "Unpaid"}</td>
              <td>
                <button onClick={() => togglePaid(emp.id)}>
                  {emp.paid ? "Mark Unpaid" : "Mark Paid"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollModule;
