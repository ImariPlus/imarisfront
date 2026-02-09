import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /physicians
export const getPhysicians = async (_: Request, res: Response) => {
  const data = await prisma.physician.findMany();
  res.json(data);
};

// GET /physicians/:id
export const getPhysician = async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await prisma.physician.findUnique({ where: { id } });
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
};

// POST /physicians
export const createPhysician = async (req: Request, res: Response) => {
  const { name } = req.body;
  const doc = await prisma.physician.create({ data: { name } });
  res.status(201).json(doc);
};

// PUT /physicians/:id
export const updatePhysician = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, active } = req.body;
  const doc = await prisma.physician.update({
    where: { id },
    data: { name, active },
  });
  res.json(doc);
};

// DELETE /physicians/:id
export const deletePhysician = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.physician.delete({ where: { id } });
  res.json({ message: "Deleted" });
};

// GET /physicians/:id/stats
export const getPhysicianStats = async (req: Request, res: Response) => {
  const { id } = req.params;

  const transactions = await prisma.transaction.findMany({
    where: { physicianId: id },
  });

  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const avg = transactions.length ? total / transactions.length : 0;

  const byMethod: Record<string, number> = {};
  for (const t of transactions) {
    byMethod[t.paymentMethod] = (byMethod[t.paymentMethod] || 0) + 1;
  }

  res.json({
    physicianId: id,
    count: transactions.length,
    totalRevenue: total,
    average: Math.round(avg),
    paymentMethods: byMethod,
  });
};

// GET /physicians/:id/transactions
export const getPhysicianTransactions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await prisma.transaction.findMany({
    where: { physicianId: id },
    orderBy: { createdAt: "desc" },
  });

  res.json(data);
};


// GET /physicians/:id/payroll-review
export const getPhysicianPayrollReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const transactions = await prisma.transaction.findMany({
    where: { physicianId: id },
  });

  const expenses = await prisma.expense.findMany();

  const revenue = transactions.reduce((s, t) => s + t.amount, 0);
  const costs = expenses.reduce((s, e) => s + e.amount, 0);

  const net = revenue - costs;
  const commissionRate = 0.3; // Example 30%
  const payroll = Math.round(net * commissionRate);

  res.json({
    physicianId: id,
    revenue,
    expenses: costs,
    net,
    commissionRate,
    payroll,
  });
};
