import { Request, Response } from "express";
import { PrismaClient, PayrollStatus, ExpenseCategory } from "@prisma/client";
import {
  calculatePayrollFigures,
  getMonthRange,
  calculateMonthlyAdvances,
  suggestGrossPay,
} from "../utils/payroll.math";

const prisma = new PrismaClient();

const SAFE_EMPLOYEE_INCLUDE = {
  physician: true,
  user: { select: { id: true, name: true, role: true } },
} as const;

/**
 * GET /api/payroll/preview?employeeId=&month=&year=
 * Returns a suggested gross pay for commission-based employees so the
 * finance officer can review the number before confirming it. Returns
 * suggestion: null for fixed-pay staff, meaning "enter it manually".
 */
export const previewPayroll = async (req: Request, res: Response) => {
  try {
    const employeeId = req.query.employeeId as string;
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "employeeId, month and year are required" });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { physician: true },
    });

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const suggestion = await suggestGrossPay(employee, month, year);

    res.json({
      employeeId,
      payType: employee.physician?.payType ?? "FIXED",
      suggestion, // null => manual entry, otherwise { suggestedGrossPay, revenue }
    });
  } catch (err) {
    console.error("Payroll preview error:", err);
    res.status(500).json({ message: "Failed to preview payroll" });
  }
};

/**
 * Initialize/update payroll for an employee (Admin/Finance only)
 */
export const initPayroll = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year, grossPay } = req.body;

    if (!employeeId || !month || !year || grossPay == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let payroll = await prisma.staffPayroll.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });

    const advancesTaken = await calculateMonthlyAdvances(employeeId, month, year);
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
          employeeId,
          month,
          year,
          grossPay,
          advancesTaken,
          savedAmount: savedAmountValue,
          remainingAmount,
          netPayable,
          status: PayrollStatus.PENDING,
        },
      });
    } else {
      payroll = await prisma.staffPayroll.update({
        where: { employeeId_month_year: { employeeId, month, year } },
        data: {
          grossPay,
          advancesTaken,
          savedAmount: savedAmountValue,
          remainingAmount,
          netPayable,
        },
      });
    }

    return res.json(payroll);
  } catch (error) {
    console.error("Payroll init error:", error);
    return res.status(500).json({ message: "Failed to initialize payroll" });
  }
};

/**
 * Update daily saved amount for payroll (Admin/Finance only)
 */
export const updateDailySave = async (req: Request, res: Response) => {
  const { employeeId, month, year, amountSavedToday } = req.body;

  if (!employeeId || !month || !year || !amountSavedToday) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const payrollRecord = await prisma.staffPayroll.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });

    if (!payrollRecord) return res.status(404).json({ message: "Payroll not found" });

    if (payrollRecord.status === PayrollStatus.PAID || payrollRecord.status === PayrollStatus.CLOSED) {
      const dailyFigures = calculatePayrollFigures({
        grossPay: payrollRecord.grossPay,
        advancesTaken: payrollRecord.advancesTaken,
        savedAmount: payrollRecord.savedAmount,
        month,
        year,
      });

      return res.status(400).json({
        message: `Payroll already settled (${payrollRecord.status}). Money saved this month:`,
        moneySavedThisMonth: payrollRecord.savedAmount,
        ...dailyFigures,
      });
    }

    const { start, end } = getMonthRange(month, year);
    const totalAdvances = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        category: ExpenseCategory.ADVANCE,
        employeeId,
        createdAt: { gte: start, lte: end },
      },
    });

    const increment = Math.min(
      amountSavedToday,
      payrollRecord.netPayable - payrollRecord.savedAmount
    );

    const updatedPayroll = await prisma.staffPayroll.update({
      where: { employeeId_month_year: { employeeId, month, year } },
      data: {
        savedAmount: { increment },
        advancesTaken: totalAdvances._sum.amount ?? 0,
      },
    });

    const dailyFigures = calculatePayrollFigures({
      grossPay: updatedPayroll.grossPay,
      advancesTaken: updatedPayroll.advancesTaken,
      savedAmount: updatedPayroll.savedAmount,
      month,
      year,
    });

    res.json({ ...updatedPayroll, ...dailyFigures });
  } catch (err) {
    console.error("Daily save error:", err);
    res.status(500).json({ message: "Failed to update daily save" });
  }
};

/**
 * Finalize payroll (mark PAID or CLOSED) (Admin/Finance only)
 */
export const finalizePayroll = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year, status } = req.body;

    if (!employeeId || !month || !year || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (![PayrollStatus.PAID, PayrollStatus.CLOSED].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payrollRecord = await prisma.staffPayroll.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });

    if (!payrollRecord) return res.status(404).json({ message: "Payroll not found" });

    const finalSavedAmount = Math.min(payrollRecord.savedAmount, payrollRecord.netPayable);

    const updatedPayroll = await prisma.staffPayroll.update({
      where: { employeeId_month_year: { employeeId, month, year } },
      data: {
        status,
        savedAmount: finalSavedAmount,
        remainingAmount: payrollRecord.netPayable - finalSavedAmount,
      },
    });

    res.json(updatedPayroll);
  } catch (error) {
    console.error("Finalize payroll error:", error);
    res.status(500).json({ message: "Failed to finalize payroll" });
  }
};

/**
 * List all payrolls for a given month/year (Admin/Finance only).
 * Selects only safe fields off the related User — never the password hash.
 */
export const listPayrolls = async (req: Request, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const payrolls = await prisma.staffPayroll.findMany({
      where: {
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { employee: { include: SAFE_EMPLOYEE_INCLUDE } },
    });

    res.json(payrolls);
  } catch (error) {
    console.error("List payrolls error:", error);
    res.status(500).json({ message: "Failed to fetch payrolls" });
  }
};