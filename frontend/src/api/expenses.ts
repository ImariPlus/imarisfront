import api from "./index";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  notes?: string;
  createdAt: string;
  recordedBy: {
    id: string;
    name: string;
    role: string;
  };
}

export type ExpenseCategory =
  | "SUPPLIES"
  | "UTILITIES"
  | "RENT"
  | "SALARY"
  | "ADVANCE"
  | "OTHER";

export const getExpenses = async (params?: { from?: string; to?: string }) => {
  const res = await api.get("/api/expenses", { params });
  return res.data as Expense[];
};

export const createExpense = async (data: {
  title: string;
  amount: number;
  category: ExpenseCategory;
  notes?: string;
}) => {
  const res = await api.post("/api/expenses", data);
  return res.data as Expense;
};

export const updateExpense = async (
  id: string,
  data: {
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    notes?: string;
  }
) => {
  const res = await api.put(`/api/expenses/${id}`, data);
  return res.data as Expense;
};

export const deleteExpense = async (id: string) => {
  await api.delete(`/api/expenses/${id}`);
};