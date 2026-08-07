import api from "./index";

export type ClinicalRole = "DOCTOR" | "NURSE" | "LAB_TECH" | "OTHER";

export const CLINICAL_ROLE_LABELS: Record<ClinicalRole, string> = {
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  LAB_TECH: "Lab Technician",
  OTHER: "Other",
};

export const CLINICAL_ROLE_COLORS: Record<ClinicalRole, string> = {
  DOCTOR: "var(--color-primary)",
  NURSE: "var(--color-success)",
  LAB_TECH: "var(--color-info)",
  OTHER: "var(--color-text-muted)",
};

export interface ClinicalStaff {
  id: string;
  name: string;
  role: ClinicalRole;
  active: boolean;
  createdAt: string;
}

export interface StaffStats {
  count: number;
  totalRevenue: number;
  average: number;
  paymentMethods: Record<string, number>;
}

export const getClinicalStaff = async () => {
  const res = await api.get("/api/physicians");
  return Array.isArray(res.data) ? res.data as ClinicalStaff[] : [];
};

export const createClinicalStaff = async (data: {
  name: string;
  role: ClinicalRole;
}) => {
  const res = await api.post("/api/physicians", data);
  return res.data as ClinicalStaff;
};

export const updateClinicalStaff = async (
  id: string,
  data: { name?: string; role?: ClinicalRole; active?: boolean }
) => {
  const res = await api.put(`/api/physicians/${id}`, data);
  return res.data as ClinicalStaff;
};

export const deleteClinicalStaff = async (id: string) => {
  await api.delete(`/api/physicians/${id}`);
};

export const getStaffStats = async (id: string) => {
  const res = await api.get(`/api/physicians/${id}/stats`);
  return res.data as StaffStats;
};