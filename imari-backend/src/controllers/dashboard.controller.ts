import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { PrismaClient, PayrollStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    /* =========================
       BASE: TRANSACTIONS (ALL)
    ========================= */
    const transactionsToday = await prisma.transaction.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      orderBy: { createdAt: "desc" },
    });

    const totalExpected = transactionsToday.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const totalDiscounts = transactionsToday.reduce(
      (sum, t) => sum + (t.discount ?? 0),
      0
    );

    const netEarnedToday = totalExpected - totalDiscounts;

    const baseDashboard = {
      today: {
        totalExpected,
        totalDiscounts,
        netEarnedToday,
      },
      recentTransactions: transactionsToday.slice(0, 5),
    };

    /* =========================
       USER → STOP HERE
    ========================= */
    if (role === "USER") {
      return res.json(baseDashboard);
    }

    /* =========================
       ADMIN / FINANCE ADD-ONS
    ========================= */
    const expensesToday = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    });

    const payrolls = await prisma.staffPayroll.findMany({
      include: { staff: true },
    });

    let totalRemainingPayroll = 0;

    const payrollsWithExtras = payrolls.map((p) => {
      let savedField = p.savedAmount;
      let locked = false;

      if (p.status === PayrollStatus.PAID || p.status === PayrollStatus.CLOSED) {
        savedField = p.savedAmount; // money saved this month
        locked = true; // mark as non-editable
      } else {
        totalRemainingPayroll += p.remainingAmount;
      }

      return {
        ...p,
        moneySavedThisMonth: savedField,
        locked,
      };
    });

    return res.json({
      ...baseDashboard,
      finance: {
        expensesToday: expensesToday._sum.amount ?? 0,
        totalRemainingPayroll,
        payrollCount: payrolls.length,
        payrolls: payrollsWithExtras,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
