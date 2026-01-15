import { Request, Response } from "express";
import { PrismaClient, PayrollStatus, ExpenseCategory } from "@prisma/client";
import { calculatePayrollFigures, getMonthRange, calculateMonthlyAdvances } from "../utils/payroll.math";

const prisma = new PrismaClient();

/**
 * Initialize payroll for a staff member (Admin/Finance only)
 */
export const initPayroll = async (req: Request, res: Response) => {
  try {
    const { staffId, month, year, grossPay } = req.body;

    if (!staffId || !month || !year || grossPay == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if payroll already exists
    let payroll = await prisma.staffPayroll.findUnique({
      where: { staffId_month_year: { staffId, month, year } },
    });

    // Calculate advances + remaining
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
      // Create new payroll
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
          status: PayrollStatus.PENDING,
        },
      });
    } else {
      // Update existing payroll
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
  const { staffId, month, year, amountSavedToday } = req.body;

  if (!staffId || !month || !year || !amountSavedToday) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const payrollRecord = await prisma.staffPayroll.findUnique({
      where: { staffId_month_year: { staffId, month, year } },
    });

    if (!payrollRecord) return res.status(404).json({ message: "Payroll not found" });
    //  Prevent saving if payroll is already settled
    if (payrollRecord.status === PayrollStatus.PAID || payrollRecord.status === PayrollStatus.CLOSED) {
      const dailyFigures = calculatePayrollFigures({
        grossPay: payrollRecord.grossPay,
        advancesTaken: payrollRecord.advancesTaken,
        savedAmount: payrollRecord.savedAmount,
        month,
        year,
      });
      
      return res.status(400).json({ 
        message: `Payroll already settled ${payrollRecord.status}. Money saved this month:`, moneySavedThisMonth: payrollRecord.savedAmount, 
        ...dailyFigures,
     });
    }
    
    // Get total advances for this month
    const { start, end } = getMonthRange(month, year);
    const totalAdvances = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        category: ExpenseCategory.ADVANCE,
        staffId,
        createdAt: { gte: start, lte: end },
      },
    });

    // Prevent over-saving
    const increment = Math.min(
      amountSavedToday,
      payrollRecord.netPayable - payrollRecord.savedAmount
    );

    const updatedPayroll = await prisma.staffPayroll.update({
      where: { staffId_month_year: { staffId, month, year } },
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
    const { staffId, month, year, status } = req.body;

    if (!staffId || !month || !year || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (![PayrollStatus.PAID, PayrollStatus.CLOSED].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payrollRecord = await prisma.staffPayroll.findUnique({
      where: { staffId_month_year: { staffId, month, year } },
    });

    if (!payrollRecord) return res.status(404).json({ message: "Payroll not found" });

    // Prevent overpayment by capping savedAmount
    const finalSavedAmount = Math.min(payrollRecord.savedAmount, payrollRecord.netPayable);

    const updatedPayroll = await prisma.staffPayroll.update({
      where: { staffId_month_year: { staffId, month, year } },
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
 * List all payrolls (Admin/Finance only)
 */
export const listPayrolls = async (req: Request, res: Response) => {
  try {
    const payrolls = await prisma.staffPayroll.findMany({
      orderBy: [ 
        { year: "desc" },
        { month: "desc" }
      ],
      include: { staff: true },
    });

    res.json(payrolls);
  } catch (error) {
    console.error("List payrolls error:", error);
    res.status(500).json({ message: "Failed to fetch payrolls" });
  }
};