import api from "./index";

export type PayrollStatus = "PENDING" | "PAID" | "CLOSED";

export interface PayrollEmployee {
  id: string;
  name: string;
  roles: string;
  department: string | null;
  physician?: {
    id: string;
    name: string;
    role: string;
    active: boolean;
    payType?: "FIXED" | "COMMISSION";
    commissionRate?: number | null;
    basePay?: number | null;
  } | null;
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface StaffPayroll {
  id: string;

  employeeId: string;

  employee: PayrollEmployee;

  month: number;
  year: number;

  grossPay: number;
  advancesTaken: number;
  savedAmount: number;
  remainingAmount: number;
  netPayable: number;

  status: PayrollStatus;

  createdAt: string;
  updatedAt: string;
}

export interface PayrollPreview {
  employeeId: string;
  payType: "FIXED" | "COMMISSION";
  suggestion: {
    suggestedGrossPay: number;
    revenue: number;
  } | null;
}

export const getPayrolls = async (
  params?: { month?: number; year?: number }
) => {
  const res = await api.get("/api/payroll", { params });

  return Array.isArray(res.data)
    ? (res.data as StaffPayroll[])
    : [];
};

/**
 * Get a suggested gross pay for an employee.
 *
 * For fixed-pay employees:
 * suggestion will normally be null.
 *
 * For commission-based physicians:
 * the backend can return a suggested amount based on
 * their revenue for the selected month.
 */
export const previewPayroll = async (params: {
  employeeId: string;
  month: number;
  year: number;
}) => {
  const res = await api.get("/api/payroll/preview", {
    params,
  });

  return res.data as PayrollPreview;
};

export const initPayroll = async (data: {
  employeeId: string;
  month: number;
  year: number;
  grossPay: number;
}) => {
  const res = await api.post("/api/payroll/init", data);

  return res.data as StaffPayroll;
};

export const addDailySave = async (data: {
  employeeId: string;
  month: number;
  year: number;
  amountSavedToday: number;
}) => {
  const res = await api.post("/api/payroll/daily-save", data);

  return res.data as StaffPayroll;
};

export const finalizePayroll = async (data: {
  employeeId: string;
  month: number;
  year: number;
  status: "PAID" | "CLOSED";
}) => {
  const res = await api.put("/api/payroll/finalize", data);

  return res.data as StaffPayroll;
};