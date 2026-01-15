// src/utils/payroll.reset.ts
import { PrismaClient, PayrollStatus, UserRole } from "@prisma/client";
import { calculatePayrollFigures, calculateMonthlyAdvances } from "./payroll.math";

const prisma = new PrismaClient();

/**
 * Reset payrolls for a new month based on last month's payrolls.
 * - Copies grossPay from last month.
 * - Recalculates advances and remaining amounts.
 * - Sets savedAmount to 0.
 */
export const resetMonthlyPayrolls = async () => {
  const today = new Date();
  const month = today.getMonth() + 1; // JS months: 0-11
  const year = today.getFullYear();

  // Determine last month
  const lastMonth = month === 1 ? 12 : month - 1;
  const lastMonthYear = month === 1 ? year - 1 : year;

  // Get all payrolls from last month
  const lastMonthPayrolls = await prisma.staffPayroll.findMany({
    where: { month: lastMonth, year: lastMonthYear },
  });

  for (const payroll of lastMonthPayrolls) {
    const advancesTaken = await calculateMonthlyAdvances(payroll.staffId, month, year);

    const { netPayable, remainingAmount } = calculatePayrollFigures({
      grossPay: payroll.grossPay,
      advancesTaken,
      savedAmount: 0, // reset savedAmount for new month
      month,
      year,
    });

    // Upsert payroll for current month
    await prisma.staffPayroll.upsert({
      where: { staffId_month_year: { staffId: payroll.staffId, month, year } },
      update: {
        grossPay: payroll.grossPay,
        advancesTaken,
        savedAmount: 0,
        remainingAmount,
        netPayable,
        status: PayrollStatus.PENDING,
      },
      create: {
        staffId: payroll.staffId,
        month,
        year,
        grossPay: payroll.grossPay,
        advancesTaken,
        savedAmount: 0,
        remainingAmount,
        netPayable,
        status: PayrollStatus.PENDING,
      },
    });
  }

  console.log(`Monthly payrolls reset successfully for ${month}/${year}`);
};

/**
 * Ensure payrolls exist for all staff for the current month.
 * This handles cases where the server starts after the month has begun.
 */
export const ensureMonthlyPayrolls = async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // Find staff members without a payroll for this month
  const staffWithoutPayroll = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
      NOT: {
        staffPayrolls: {
          some: { month, year },
        },
      },
    },
  });

  for (const staff of staffWithoutPayroll) {
    // Initialize payroll for staff
    await prisma.staffPayroll.create({
      data: {
        staffId: staff.id,
        month,
        year,
        grossPay: 150000, // default or pull from staff settings
        advancesTaken: 0,
        savedAmount: 0,
        remainingAmount: 150000,
        netPayable: 150000,
        status: PayrollStatus.PENDING,
      },
    });
  }

  if (staffWithoutPayroll.length > 0) {
    console.log("Initialized missing payrolls for current month:", staffWithoutPayroll.map(s => s.name));
  } else {
    console.log("All payrolls already exist for the current month.");
  }
};
