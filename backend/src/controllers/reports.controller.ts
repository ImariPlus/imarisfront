import { Request, Response } from "express";
import { getMonthlyReportData } from "../services/reportData.service";

export const getReports = async (req: Request, res: Response) => {
  try {
    const role = req.auth?.role;
    if (!role || (role !== "ADMIN" && role !== "FINANCE")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ message: "Valid month and year required" });
    }

    const data = await getMonthlyReportData(month, year);
    return res.json(data);
  } catch (err) {
    console.error("Reports error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};