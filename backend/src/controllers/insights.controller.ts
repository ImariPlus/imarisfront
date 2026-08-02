import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMonthlyInsightsData = async (req: Request, res: Response) => {
  try {
    const role = req.auth?.role;
    if (!role || (role !== "ADMIN" && role !== "FINANCE")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ message: "Valid month and year required" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Transactions
    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { physician: { select: { name: true } } },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDiscounts = transactions.reduce((sum, t) => sum + (t.discount ?? 0), 0);
    const netRevenue = totalRevenue - totalDiscounts;
    const transactionCount = transactions.length;

    // Revenue by physician
    const revenueByPhysician: Record<string, number> = {};
    for (const t of transactions) {
      const name = t.physician.name;
      revenueByPhysician[name] = (revenueByPhysician[name] ?? 0) + t.amount;
    }

    // Expenses by category
    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: start, lte: end } },
    });

    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;
    for (const e of expenses) {
      expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount;
      totalExpenses += e.amount;
    }

    // Payroll
    const payrolls = await prisma.staffPayroll.findMany({
      where: { month, year },
      include: { staff: { select: { name: true } } },
    });

    const totalPayroll = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
    const totalAdvances = payrolls.reduce((sum, p) => sum + p.advancesTaken, 0);
    const netPosition = netRevenue - totalExpenses - totalPayroll;

    return res.json({
      period: { month, year },
      revenue: {
        gross: totalRevenue,
        discounts: totalDiscounts,
        net: netRevenue,
        transactionCount,
        byPhysician: revenueByPhysician,
      },
      expenses: {
        total: totalExpenses,
        byCategory: expensesByCategory,
      },
      payroll: {
        total: totalPayroll,
        advances: totalAdvances,
        staffCount: payrolls.length,
      },
      netPosition,
    });
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ message: "Failed to load insights data" });
  }
};