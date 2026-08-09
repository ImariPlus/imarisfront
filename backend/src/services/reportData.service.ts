import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ReportData {
  period: { month: number; year: number };
  revenue: {
    gross: number;
    discounts: number;
    net: number;
    transactionCount: number;
    byPaymentMethod: Record<string, { count: number; amount: number }>;
    byClinician: { name: string; role: string; count: number; amount: number }[];
    byDay: Record<string, number>;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  payroll: {
    total: number;
    count: number;
    advances: number;
  };
  netPosition: number;
}

/**
 * Single source of truth for "what happened financially this month".
 * Used by GET /api/reports (charts) and POST /api/insights/analyze (AI prompt),
 * so the two never drift out of sync.
 */
export const getMonthlyReportData = async (
  month: number,
  year: number
): Promise<ReportData> => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  // --- Transactions ---
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: {
      physician: { select: { name: true, role: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalGross = transactions.reduce((s, t) => s + t.amount, 0);
  const totalDiscounts = transactions.reduce((s, t) => s + (t.discount ?? 0), 0);
  const totalNet = totalGross - totalDiscounts;

  const byPaymentMethod: Record<string, { count: number; amount: number }> = {};
  for (const t of transactions) {
    if (!byPaymentMethod[t.paymentMethod]) {
      byPaymentMethod[t.paymentMethod] = { count: 0, amount: 0 };
    }
    byPaymentMethod[t.paymentMethod].count += 1;
    byPaymentMethod[t.paymentMethod].amount += t.amount;
  }

  const byClinicianMap: Record<string, { name: string; role: string; count: number; amount: number }> = {};
  for (const t of transactions) {
    const name = t.physician.name;
    if (!byClinicianMap[name]) {
      byClinicianMap[name] = { name, role: t.physician.role, count: 0, amount: 0 };
    }
    byClinicianMap[name].count += 1;
    byClinicianMap[name].amount += t.amount;
  }
  const byClinician = Object.values(byClinicianMap).sort((a, b) => b.amount - a.amount);

  const byDay: Record<string, number> = {};
  for (const t of transactions) {
    const day = new Date(t.createdAt).toISOString().split("T")[0];
    byDay[day] = (byDay[day] ?? 0) + t.amount;
  }

  // --- Expenses ---
  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: start, lte: end } },
  });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  // --- Payroll ---
  const payrolls = await prisma.staffPayroll.findMany({
    where: { month, year },
    include: { staff: { select: { name: true } } },
  });
  const totalPayroll = payrolls.reduce((s, p) => s + p.grossPay, 0);
  const totalAdvances = payrolls.reduce((s, p) => s + p.advancesTaken, 0);

  return {
    period: { month, year },
    revenue: {
      gross: totalGross,
      discounts: totalDiscounts,
      net: totalNet,
      transactionCount: transactions.length,
      byPaymentMethod,
      byClinician,
      byDay,
    },
    expenses: {
      total: totalExpenses,
      byCategory,
    },
    payroll: {
      total: totalPayroll,
      count: payrolls.length,
      advances: totalAdvances,
    },
    netPosition: totalNet - totalExpenses - totalPayroll,
  };
};