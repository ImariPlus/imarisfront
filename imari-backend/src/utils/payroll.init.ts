// src/utils/payroll.init.ts
import { PrismaClient } from "@prisma/client";
import { calculateMonthlyAdvances, calculatePayrollFigures } from "./payroll.math";

const prisma = new PrismaClient();

export const initPayrollForStaff = async (staffId: string, month: number, year: number) => {
  const grossPay = 150000; // default or fetch from staff settings

  let payroll = await prisma.staffPayroll.findUnique({
    where: { staffId_month_year: { staffId, month, year } },
  });

  const advancesTaken = await calculateMonthlyAdvances(staffId, month, year);
  const savedAmountValue = payroll?.savedAmount ?? 0;

  const { netPayable, remainingAmount } = calculatePayrollFigures({
    grossPay,
    advancesTaken,
    savedAmount: savedAmountValue,
    month,
    year,
  });

  if (!payroll) {
    payroll = await prisma.staffPayroll.create({
      data: {
        staffId,
        month,
        year,
        grossPay,
        advancesTaken,
        savedAmount: savedAmountValue,
        remainingAmount,
        netPayable,
      },
    });
  } else {
    payroll = await prisma.staffPayroll.update({
      where: { staffId_month_year: { staffId, month, year } },
      data: {
        grossPay,
        advancesTaken,
        savedAmount: savedAmountValue,
        remainingAmount,
        netPayable,
      },
    });
  }

  return payroll;
};
