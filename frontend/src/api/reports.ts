import api from "./index";

export interface ReportData {
  period: { month: number; year: number };
  revenue: {
    gross: number;
    discounts: number;
    net: number;
    transactionCount: number;
    byPaymentMethod: Record<string, { count: number; amount: number }>;
    byClinician: { name: string; role: string; count: number; amount: number }[];
    byDay: Record<string, number>;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  payroll: {
    total: number;
    count: number;
  };
  netPosition: number;
}

export const getReportData = async (month: number, year: number) => {
  const res = await api.get("/api/reports", { params: { month, year } });
  return res.data as ReportData;
};