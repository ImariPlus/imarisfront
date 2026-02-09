import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type for our auth object on the request
interface JwtAuth {
  id: string;
  role: "ADMIN" | "FINANCE" | "USER";
}

// GET /transactions
export const getTransactions = async (req: Request & { auth?: JwtAuth }, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        physician: true, 
        createdBy: { select: { id: true, name: true, email: true } } 
      },
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

// GET /transactions/:id
export const getTransaction = async (req: Request & { auth?: JwtAuth }, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { 
        physician: true, 
        createdBy: { select: { id: true, name: true, email: true } } 
      },
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transaction" });
  }
};

// POST /transactions
export const createTransaction = async (req: Request & { auth?: JwtAuth }, res: Response) => {
  try {
    const { clientName, amount, paymentMethod, physicianId, notes } = req.body;

    // req.auth!.id is safe because auth middleware runs before this
    const transaction = await prisma.transaction.create({
      data: {
        clientName,
        amount,
        paymentMethod,
        physicianId,
        notes,
        createdById: req.auth!.id,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
};

// PUT /transactions/:id
export const updateTransaction = async (req: Request & { auth?: JwtAuth }, res: Response) => {
  try {
    const { id } = req.params;
    const { clientName, amount, paymentMethod, notes } = req.body;

    const updated = await prisma.transaction.update({
      where: { id },
      data: { clientName, amount, paymentMethod, notes },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

// DELETE /transactions/:id
export const deleteTransaction = async (req: Request & { auth?: JwtAuth }, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.transaction.delete({ where: { id } });
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};
