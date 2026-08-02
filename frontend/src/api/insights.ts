import api from "./index";

export interface InsightsData {
  period: { month: number; year: number };
  revenue: {
    gross: number;
    discounts: number;
    net: number;
    transactionCount: number;
    byPhysician: Record<string, number>;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  payroll: {
    total: number;
    advances: number;
    staffCount: number;
  };
  netPosition: number;
}

export const getInsightsData = async (month: number, year: number) => {
  const res = await api.get("/api/insights", { params: { month, year } });
  return res.data as InsightsData;
};