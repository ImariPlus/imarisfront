import { useEffect, useState } from "react";
import {
  initPayroll,
  previewPayroll,
  type PayrollPreview,
} from "../../api/payroll";
import api from "../../api";

interface Employee {
  id: string;
  name: string;
  roles: string;
  department: string | null;
  physician?: {
    payType?: "FIXED" | "COMMISSION";
    commissionRate?: number | null;
    basePay?: number | null;
  } | null;
}

interface Props {
  month: number;
  year: number;
  existingEmployeeIds: string[];
  onSuccess?: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function FormPayroll({
  month,
  year,
  existingEmployeeIds,
  onSuccess,
}: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [grossPay, setGrossPay] = useState<number | "">("");

  const [preview, setPreview] = useState<PayrollPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load employees (payroll is based on Employee, not User)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/api/employees");

        const all = Array.isArray(res.data)
          ? (res.data as Employee[])
          : [];

        setEmployees(
          all.filter(
            (employee) => !existingEmployeeIds.includes(employee.id)
          )
        );
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError("Couldn't load employees.");
      }
    };

    fetchEmployees();
  }, [existingEmployeeIds]);

  // When an employee is selected, ask the backend for a salary suggestion
  useEffect(() => {
    if (!employeeId) {
      setPreview(null);
      setGrossPay("");
      return;
    }

    const fetchPreview = async () => {
      setPreviewLoading(true);
      setError("");

      try {
        const result = await previewPayroll({
          employeeId,
          month,
          year,
        });

        setPreview(result);

        // Commission-based employee
        if (result.suggestion?.suggestedGrossPay != null) {
          setGrossPay(result.suggestion.suggestedGrossPay);
          return;
        }

        // Fixed-pay employee
        const selected = employees.find(
          (employee) => employee.id === employeeId
        );

        const basePay = selected?.physician?.basePay;

        if (basePay != null) {
          setGrossPay(basePay);
        } else {
          setGrossPay("");
        }
      } catch (err: unknown) {
        console.error("Payroll preview error:", err);

        setPreview(null);
        setGrossPay("");

        const apiError = err as ApiError;

        setError(
          apiError.response?.data?.message ??
            "We couldn't calculate a suggestion. You can enter the amount manually."
        );
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [employeeId, month, year, employees]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    if (!employeeId) {
      setError("Select an employee.");
      return;
    }

    if (!grossPay || Number(grossPay) <= 0) {
      setError("Enter a valid gross pay.");
      return;
    }

    setLoading(true);

    try {
      await initPayroll({
        employeeId,
        month,
        year,
        grossPay: Number(grossPay),
      });

      setEmployeeId("");
      setGrossPay("");
      setPreview(null);

      onSuccess?.();
    } catch (err: unknown) {
      console.error("Payroll initialization error:", err);

      const apiError = err as ApiError;

      setError(
        apiError.response?.data?.message ??
          "Failed to initialize payroll."
      );
    } finally {
      setLoading(false);
    }
  };

  // Better empty state wording
  if (employees.length === 0) {
    return (
      <div className="payroll-add-empty">
        <div className="payroll-add-empty__icon">📋</div>

        <strong>Payroll has already been started for all employees this month</strong>

        <p>
          Everyone currently in Imari+ already has a payroll record for
          {" "}
          <strong>
            {new Date(year, month - 1).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </strong>.
        </p>

        <div className="payroll-add-empty__next">
          <span>You can still:</span>
          <ul>
            <li>record salary savings,</li>
            <li>mark salaries as paid,</li>
            <li>add newly hired employees,</li>
            <li>or switch to another month.</li>
          </ul>
        </div>
      </div>
    );
  }

  const selectedEmployee = employees.find(
    (employee) => employee.id === employeeId
  );

  return (
    <form className="card payroll-add-form" onSubmit={handleSubmit}>
      <div className="payroll-add-form__header">
        <div>
          <h3>Start payroll for an employee</h3>
          <p>Let's set up their salary for this month.</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="payroll-employee">Who are you paying?</label>

        <select
          id="payroll-employee"
          value={employeeId}
          onChange={(event) => {
            setEmployeeId(event.target.value);
            setError("");
          }}
        >
          <option value="">Select an employee...</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} — {employee.roles}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <div className="payroll-employee-preview">
          <strong>{selectedEmployee.name}</strong>

          <span>
            {selectedEmployee.roles}
            {selectedEmployee.department
              ? ` · ${selectedEmployee.department}`
              : ""}
          </span>
        </div>
      )}

      {previewLoading && (
        <div className="payroll-suggestion payroll-suggestion--loading">
          Looking at what we know about this employee...
        </div>
      )}

      {!previewLoading && preview?.suggestion && (
        <div className="payroll-suggestion">
          <div>
            <span className="payroll-suggestion__eyebrow">
              Suggested amount
            </span>

            <strong>
              {preview.suggestion.suggestedGrossPay.toLocaleString()} RWF
            </strong>
          </div>

          <p>
            Based on
            {" "}
            <strong>
              {preview.suggestion.revenue.toLocaleString()} RWF
            </strong>
            {" "}
            in recorded revenue this month.
          </p>

          <small>You can change this amount if needed.</small>
        </div>
      )}

      {!previewLoading && preview && !preview.suggestion && (
        <div className="payroll-suggestion payroll-suggestion--fixed">
          <span className="payroll-suggestion__eyebrow">
            Regular pay
          </span>

          <strong>
            {selectedEmployee?.physician?.basePay != null
              ? `${selectedEmployee.physician.basePay.toLocaleString()} RWF`
              : "Enter their monthly pay"}
          </strong>

          <p>
            This employee doesn't have a calculated commission amount for this month.
          </p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="gross-pay">
          How much should they receive this month?
        </label>

        <input
          id="gross-pay"
          type="number"
          placeholder="e.g. 150000"
          min={1}
          value={grossPay}
          onChange={(event) =>
            setGrossPay(
              event.target.value === ""
                ? ""
                : Number(event.target.value)
            )
          }
        />
      </div>

      {error && <p className="field-error">{error}</p>}

      <button
        type="submit"
        className="btn-primary"
        disabled={
          loading ||
          previewLoading ||
          !employeeId ||
          !grossPay
        }
      >
        {loading ? "Adding..." : "Start payroll"}
      </button>
    </form>
  );
}