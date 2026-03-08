import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});


// -----------------------------
// Get all payrolls
// -----------------------------
export const getPayrolls = async (params?: {
  month?: number;
  year?: number;
}) => {
  const res = await API.get("/payroll", { params });
  return res.data;
};


// -----------------------------
// Get payroll for one staff
// -----------------------------
export const getPayrollByStaff = async (
  staffId: string,
  month: number,
  year: number
) => {
  const res = await API.get(`/payroll/${staffId}`, {
    params: { month, year }
  });

  return res.data;
};


// -----------------------------
// Initialize payroll
// -----------------------------
export const initPayroll = async (data: {
  staffId: string;
  month: number;
  year: number;
}) => {
  const res = await API.post("/payroll/init", data);
  return res.data;
};


// -----------------------------
// Add daily save
// -----------------------------
export const addDailySave = async (data: {
  payrollId: string;
  amount: number;
  note?: string;
}) => {
  const res = await API.patch("/payroll/daily-save", data);
  return res.data;
};


// -----------------------------
// Finalize payroll
// -----------------------------
export const finalizePayroll = async (data: {
  payrollId: string;
}) => {
  const res = await API.patch("/payroll/finalize", data);
  return res.data;
};

export default {
  getPayrolls,
  getPayrollByStaff,
  initPayroll,
  addDailySave,
  finalizePayroll
};