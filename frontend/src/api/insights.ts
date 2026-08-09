import api from "./index";

export interface InsightsResult {
  insights: string;
  period: { month: number; year: number };
}

export const analyzeInsights = async (month: number, year: number) => {
  const res = await api.post("/api/insights/analyze", { month, year });
  return res.data as InsightsResult;
};