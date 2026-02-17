import { Request, Response } from "express";
import { PrismaClient, PayrollStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardSnapshot = async (req: Request, res: Response) => {
  try {
    const role = req.auth?.role;

    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    // ===== TODAY RANGE =====
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // ===== YESTERDAY RANGE =====
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    /* =========================
       TODAY TRANSACTIONS (for totals)
    ========================= */
    const transactionsToday = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        physician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

    /* =========================
       TODAY + YESTERDAY (for recent list)
    ========================= */
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startOfYesterday,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        physician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 20, // safe limit
    });

    const baseDashboard = {
      today: {
        totalExpected,
        totalDiscounts,
        netEarnedToday,
      },
      recentTransactions,
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
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const payrolls = await prisma.staffPayroll.findMany({
      include: { staff: true },
    });

    let totalRemainingPayroll = 0;

    const payrollsWithExtras = payrolls.map((p) => {
      let locked = false;

      if (
        p.status === PayrollStatus.PAID ||
        p.status === PayrollStatus.CLOSED
      ) {
        locked = true;
      } else {
        totalRemainingPayroll += p.remainingAmount;
      }

      return {
        ...p,
        moneySavedThisMonth: p.savedAmount,
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
