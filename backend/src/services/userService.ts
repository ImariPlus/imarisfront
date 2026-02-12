import { PrismaClient, User, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    },
  });
};

export const updateUser = async (
  id: string,
  data: Partial<{ name: string; email: string; role: UserRole }>
): Promise<User> => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = async (id: string): Promise<User> => {
  return prisma.user.delete({ where: { id } });
};
