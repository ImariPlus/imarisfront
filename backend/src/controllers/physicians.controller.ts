import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /physicians
export const getPhysicians = async (_: Request, res: Response) => {
  const data = await prisma.physician.findMany({ orderBy: { name: "asc" } });
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
  const { name, role, payType, commissionRate, basePay } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
  try {
    const doc = await prisma.physician.create({
      data: {
        name: name.trim(),
        role: role ?? "DOCTOR",
        payType: payType ?? "FIXED",
        commissionRate: commissionRate ?? 0,
        basePay: basePay ?? 0,
      },
    });
    res.status(201).json(doc);
  } catch (_err) {
    res.status(409).json({ message: "A staff member with that name already exists" });
  }
};

// PUT /physicians/:id
export const updatePhysician = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, active, payType, commissionRate, basePay } = req.body;
  try {
    const doc = await prisma.physician.update({
      where: { id },
      data: { name, role, active, payType, commissionRate, basePay },
    });
    res.json(doc);
  } catch (_err) {
    res.status(404).json({ message: "Not found" });
  }
};


// DELETE /physicians/:id
export const deletePhysician = async (req: Request, res: Response) => {
  const { id } = req.params;
  const linked = await prisma.transaction.count({ where: { physicianId: id } });
  if (linked > 0) {
    return res.status(409).json({
      message: `Cannot delete — this staff member has ${linked} transaction(s) linked to them. Deactivate instead.`,
    });
  }
  await prisma.physician.delete({ where: { id } });
  res.json({ message: "Deleted" });
};

// GET /physicians/:id/stats
export const getPhysicianStats = async (req: Request, res: Response) => {
  const { id } = req.params;
  const transactions = await prisma.transaction.findMany({ where: { physicianId: id } });
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
  const physician = await prisma.physician.findUnique({
    where: { id },
    select: {
      id: true,
      payType: true,
      commissionRate: true,
      basePay: true,
    },
  });
  if (!physician) return res.status(404).json({ message: "Not found" });

  const transactions = await prisma.transaction.findMany({ where: { physicianId: id } });
  const revenue = transactions.reduce((s, t) => s + t.amount, 0);

  let payable = 0;
  if (physician.payType === "COMMISSION_ONLY") {
    payable = revenue * physician.commissionRate;
  } else if (physician.payType === "FIXED") {
    payable = physician.basePay;
  } else if (physician.payType === "BASE_PLUS_COMMISSION") {
    payable = physician.basePay + (revenue * physician.commissionRate);
  }

  res.json({
    physicianId: id,
    payType: physician.payType,
    revenue,
    commissionRate: physician.commissionRate,
    basePay: physician.basePay,
    payable: Math.round(payable),
  });
};

// GET /physicians/payroll-summary?month=8&year=2026
export const getPhysicianPayrollSummary = async (req: Request, res: Response) => {
  const month = parseInt(req.query.month as string);
  const year = parseInt(req.query.year as string);

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year required" });
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const physicians = await prisma.physician.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      role: true,
      payType: true,
      commissionRate: true,
      basePay: true,
      transactions: {
        where: { createdAt: { gte: start, lte: end } },
      },
    },
    orderBy: { name: "asc" },
  });

  const summary = physicians.map((p) => {
    const revenue = p.transactions.reduce((s, t) => s + t.amount, 0);
    let payable = 0;
    if (p.payType === "COMMISSION_ONLY") {
      payable = revenue * p.commissionRate;
    } else if (p.payType === "FIXED") {
      payable = p.basePay;
    } else if (p.payType === "BASE_PLUS_COMMISSION") {
      payable = p.basePay + revenue * p.commissionRate;
    }
    return {
      id: p.id,
      name: p.name,
      role: p.role,
      payType: p.payType,
      commissionRate: p.commissionRate,
      basePay: p.basePay,
      revenue,
      payable: Math.round(payable),
      transactionCount: p.transactions.length,
    };
  });

  res.json(summary);
};