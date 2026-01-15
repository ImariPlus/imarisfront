import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMonthRange = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

export const calculateMonthlyAdvances = async (
  staffId: string,
  month: number,
  year: number
) => {
  const { start, end } = getMonthRange(month, year);

  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      category: "ADVANCE",
      staffId,
      createdAt: { gte: start, lte: end },
    },
  });

  return result._sum.amount ?? 0;
};

export const calculatePayrollFigures = ({
  grossPay,
  advancesTaken,
  savedAmount,
  today = new Date(),
  month,
  year,
}: {
  grossPay: number;
  advancesTaken: number;
  savedAmount: number;
  today?: Date;
  month: number;
  year: number;
}) => {
  const netPayable = grossPay - advancesTaken;
  const remainingAmount = netPayable - savedAmount;

  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = today.getDate();
  const remainingDays = Math.max(daysInMonth - currentDay, 1);

  const dailySaveTarget = remainingAmount / remainingDays;

  return {
    netPayable,
    remainingAmount,
    dailySaveTarget,
  };
};
