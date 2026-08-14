import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMonthRange = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

export const calculateMonthlyAdvances = async (
  employeeId: string,
  month: number,
  year: number
) => {
  const { start, end } = getMonthRange(month, year);

  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      category: "ADVANCE",
      employeeId,
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

/**
 * How much revenue a physician personally brought in for a given month,
 * based on the transactions attributed to them. Uses gross transaction
 * amount, matching how "revenue by clinician" is computed in reports.
 */
export const calculatePhysicianRevenue = async (
  physicianId: string,
  month: number,
  year: number
) => {
  const { start, end } = getMonthRange(month, year);

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      physicianId,
      createdAt: { gte: start, lte: end },
    },
  });

  return result._sum.amount ?? 0;
};

/**
 * Suggests a gross pay figure for an employee for the given month.
 * - FIXED-pay physicians and non-physician employees: no suggestion, the
 *   figure is entered manually.
 * - COMMISSION_ONLY: revenue * commissionRate
 * - BASE_PLUS_COMMISSION: basePay + revenue * commissionRate
 *
 * Returns null when there's nothing to suggest (manual entry required).
 */
export const suggestGrossPay = async (
  employee: {
    physician: {
      id: string;
      payType: "FIXED" | "COMMISSION_ONLY" | "BASE_PLUS_COMMISSION";
      commissionRate: number;
      basePay: number;
    } | null;
  },
  month: number,
  year: number
): Promise<{ suggestedGrossPay: number; revenue: number } | null> => {
  const physician = employee.physician;
  if (!physician || physician.payType === "FIXED") return null;

  const revenue = await calculatePhysicianRevenue(physician.id, month, year);
  const commission = revenue * physician.commissionRate;

  const suggestedGrossPay =
    physician.payType === "BASE_PLUS_COMMISSION" ? physician.basePay + commission : commission;

  return { suggestedGrossPay, revenue };
};