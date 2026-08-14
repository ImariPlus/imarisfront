// src/utils/payroll.reset.ts
import { PrismaClient, PayrollStatus } from "@prisma/client";
import { calculatePayrollFigures, calculateMonthlyAdvances, suggestGrossPay } from "./payroll.math";

const prisma = new PrismaClient();

// Fallback starting gross pay for an employee who has never had a payroll
// record before and isn't a commission-based physician (nothing to calculate
// from). Finance can adjust it via the payroll UI — this just seeds a row.
const DEFAULT_GROSS_PAY = 150000;

async function resolveGrossPay(employeeId: string, month: number, year: number, previousGrossPay?: number) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { physician: true },
  });

  const suggestion = employee ? await suggestGrossPay(employee, month, year) : null;
  if (suggestion) return suggestion.suggestedGrossPay;

  return previousGrossPay ?? DEFAULT_GROSS_PAY;
}

/**
 * Reset payrolls for a new month based on last month's payrolls.
 * - Fixed-pay staff: carries forward last month's grossPay.
 * - Commission-based physicians: recalculated against this month's revenue.
 * - Recalculates advances and remaining amounts, resets savedAmount to 0.
 */
export const resetMonthlyPayrolls = async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const lastMonth = month === 1 ? 12 : month - 1;
  const lastMonthYear = month === 1 ? year - 1 : year;

  const lastMonthPayrolls = await prisma.staffPayroll.findMany({
    where: { month: lastMonth, year: lastMonthYear },
  });

  for (const payroll of lastMonthPayrolls) {
    const grossPay = await resolveGrossPay(payroll.employeeId, month, year, payroll.grossPay);
    const advancesTaken = await calculateMonthlyAdvances(payroll.employeeId, month, year);

    const { netPayable, remainingAmount } = calculatePayrollFigures({
      grossPay,
      advancesTaken,
      savedAmount: 0,
      month,
      year,
    });

    await prisma.staffPayroll.upsert({
      where: { employeeId_month_year: { employeeId: payroll.employeeId, month, year } },
      update: {
        grossPay,
        advancesTaken,
        savedAmount: 0,
        remainingAmount,
        netPayable,
        status: PayrollStatus.PENDING,
      },
      create: {
        employeeId: payroll.employeeId,
        month,
        year,
        grossPay,
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
 * Ensure payrolls exist for all active employees for the current month.
 * Handles cases where the server starts after the month has begun, or a
 * new employee was added mid-month.
 */
export const ensureMonthlyPayrolls = async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const employeesWithoutPayroll = await prisma.employee.findMany({
    where: {
      active: true,
      payrolls: {
        none: { month, year },
      },
    },
    include: { physician: true },
  });

  for (const employee of employeesWithoutPayroll) {
    const suggestion = await suggestGrossPay(employee, month, year);
    const grossPay = suggestion ? suggestion.suggestedGrossPay : DEFAULT_GROSS_PAY;

    await prisma.staffPayroll.create({
      data: {
        employeeId: employee.id,
        month,
        year,
        grossPay,
        advancesTaken: 0,
        savedAmount: 0,
        remainingAmount: grossPay,
        netPayable: grossPay,
        status: PayrollStatus.PENDING,
      },
    });
  }

  if (employeesWithoutPayroll.length > 0) {
    console.log(
      "Initialized missing payrolls for current month:",
      employeesWithoutPayroll.map((e) => e.name)
    );
  } else {
    console.log("All payrolls already exist for the current month.");
  }
};