import api from "./index";

export type UserRole = "ADMIN" | "FINANCE" | "USER";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export const getUsers = async () => {
  const res = await api.get("/api/users");
  return Array.isArray(res.data) ? res.data as AppUser[] : [];
};

export const createUser = async (data: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}) => {
  const res = await api.post("/api/users", data);
  return res.data as AppUser;
};

export const updateUser = async (
  id: string,
  data: { name?: string; role?: UserRole; password?: string }
) => {
  const res = await api.put(`/api/users/${id}`, data);
  return res.data as AppUser;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/api/users/${id}`);
};