import { PrismaClient, User, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (data: { name: string; email: string; role: UserRole }): Promise<User> => {
  return prisma.user.create({ data });
};

export const updateUser = async (id: string, data: Partial<{ name: string; email: string; role: UserRole }>): Promise<User> => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: string): Promise<User> => {
  return prisma.user.delete({ where: { id } });
};
