import { Response } from "express";
import { PrismaClient, ExpenseCategory } from "@prisma/client";
import { AuthRequest } from "../types/auth";

const prismaClient = new PrismaClient();

export const getExpenses = async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query;

  const expenses = await prismaClient.expense.findMany({
    where: {
      createdAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      recordedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  res.json(expenses);
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  const { title, amount, category, notes } = req.body;
  const userId = req.user?.id;

  if (!title || !amount || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!Object.values(ExpenseCategory).includes(category)) {
    return res.status(400).json({ message: "Invalid expense category" });
  }

  const expense = await prismaClient.expense.create({
    data: {
      title,
      amount,
      category,
      notes,
      recordedBy: {
        connect: { id: userId! },
      },
    },
  });

  res.status(201).json(expense);
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, amount, category, notes } = req.body;

  const expense = await prismaClient.expense.findUnique({ where: { id } });
  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (category && !Object.values(ExpenseCategory).includes(category)) {
    return res.status(400).json({ message: "Invalid expense category" });
  }

  const updated = await prismaClient.expense.update({
    where: { id },
    data: {
      title,
      amount,
      category,
      notes,
    },
  });

  res.json(updated);
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prismaClient.expense.delete({ where: { id } });

  res.status(204).send();
};
