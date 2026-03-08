import { Request, Response } from "express";
import {
  PrismaClient,
  ExpenseCategory,
  TimelineType,
  TimelineAction,
  ReferenceType,
} from "@prisma/client";

const prisma = new PrismaClient();

interface JwtAuth {
  id: string;
  role: "ADMIN" | "FINANCE" | "USER";
}

// GET /expenses
export const getExpenses = async (req: Request, res: Response) => {
  const { from, to } = req.query;

  const expenses = await prisma.expense.findMany({
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

// POST /expenses
export const createExpense = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  const auth = req.auth;
  if (!auth) return res.status(401).json({ message: "Unauthenticated" });

  const { title, amount, category, notes } = req.body;

  if (!title || !amount || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!Object.values(ExpenseCategory).includes(category)) {
    return res.status(400).json({ message: "Invalid expense category" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          title,
          amount,
          category,
          notes,
          recordedBy: { connect: { id: auth.id } },
        },
      });

      await tx.timelineEntry.create({
        data: {
          type: TimelineType.EXPENSE,
          action: TimelineAction.CREATED,
          performedById: auth.id,
          referenceId: expense.id,
          referenceType: ReferenceType.EXPENSE,
          metadata: {
            title,
            amount,
            category,
            notes: notes || null,
          },
        },
      });

      return expense;
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create expense" });
  }
};

// PUT /expenses/:id
export const updateExpense = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  const auth = req.auth;
  if (!auth) return res.status(401).json({ message: "Unauthenticated" });

  const { id } = req.params;
  const { title, amount, category, notes } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");

      if (category && !Object.values(ExpenseCategory).includes(category)) {
        throw new Error("INVALID_CATEGORY");
      }

      const updated = await tx.expense.update({
        where: { id },
        data: { title, amount, category, notes },
      });

      await tx.timelineEntry.create({
        data: {
          type: TimelineType.EXPENSE,
          action: TimelineAction.UPDATED,
          performedById: auth.id,
          referenceId: id,
          referenceType: ReferenceType.EXPENSE,
          metadata: {
            title,
            amount,
            category,
            notes,
          },
        },
      });

      return updated;
    });

    res.json(result);
  } catch (err: any) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Expense not found" });
    }
    if (err.message === "INVALID_CATEGORY") {
      return res.status(400).json({ message: "Invalid expense category" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};

// DELETE /expenses/:id
export const deleteExpense = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  const auth = req.auth;
  if (!auth) return res.status(401).json({ message: "Unauthenticated" });

  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.timelineEntry.create({
        data: {
          type: TimelineType.EXPENSE,
          action: TimelineAction.DELETED,
          performedById: auth.id,
          referenceId: id,
          referenceType: ReferenceType.EXPENSE,
        },
      });

      await tx.expense.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};