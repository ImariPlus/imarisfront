import { Request, Response } from "express";
import { PrismaClient, TimelineType, TimelineAction, ReferenceType } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtAuth {
  id: string;
  role: "ADMIN" | "FINANCE" | "USER";
}

// GET /transactions
export const getTransactions = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        physician: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

// POST /transactions
export const createTransaction = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  try {
    const { clientName, amount, paymentMethod, physicianId, notes, discount } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          clientName,
          amount,
          paymentMethod,
          physicianId,
          discount: discount || 0,
          notes,
          createdById: req.auth!.id,
        },
      });

      await tx.timelineEntry.create({
        data: {
          type: TimelineType.TRANSACTION,
          action: TimelineAction.CREATED,
          performedById: req.auth!.id,
          referenceId: transaction.id,
          referenceType: ReferenceType.TRANSACTION,
          metadata: {
            clientName,
            amount,
            discount: discount || 0,
            paymentMethod,
            physicianId,
            notes: notes || null,
          },
        },
      });

      return transaction;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
};

// PUT /transactions/:id
export const updateTransaction = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  try {
    const { id } = req.params;
    const { clientName, amount, paymentMethod, notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: { clientName, amount, paymentMethod, notes },
      });

      await tx.timelineEntry.create({
        data: {
          type: TimelineType.TRANSACTION,
          action: TimelineAction.UPDATED,
          performedById: req.auth!.id,
          referenceId: id,
          referenceType: ReferenceType.TRANSACTION,
          metadata: {
            clientName,
            amount,
            paymentMethod,
            notes,
          },
        },
      });

      return updated;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

// DELETE /transactions/:id
export const deleteTransaction = async (
  req: Request & { auth?: JwtAuth },
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      await tx.timelineEntry.create({
        data: {
          type: TimelineType.TRANSACTION,
          action: TimelineAction.DELETED,
          performedById: req.auth!.id,
          referenceId: id,
          referenceType: ReferenceType.TRANSACTION,
        },
      });

      await tx.transaction.delete({ where: { id } });
    });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};