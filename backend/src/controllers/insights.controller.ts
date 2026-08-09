import { Request, Response } from "express";
import { getMonthlyReportData, ReportData } from "../services/reportData.service";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_LABELS: Record<string, string> = {
  SUPPLIES: "Supplies",
  UTILITIES: "Utilities",
  RENT: "Rent",
  SALARY: "Salary",
  ADVANCE: "Staff Advances",
  OTHER: "Other",
};

function buildPrompt(data: ReportData): string {
  const monthName = MONTH_NAMES[data.period.month - 1];
  const year = data.period.year;

  const expenseLines = Object.entries(data.expenses.byCategory)
    .map(([cat, amt]) => `  - ${CATEGORY_LABELS[cat] ?? cat}: ${amt.toLocaleString()} RWF`)
    .join("\n");

  const clinicianLines = data.revenue.byClinician
    .map((c) => `  - ${c.name}: ${c.amount.toLocaleString()} RWF (${c.count} transactions)`)
    .join("\n");

  return `You are a financial advisor for a small healthcare clinic in Rwanda called Imari+. Analyze the following monthly financial report and provide 3-5 specific, actionable insights and recommendations. Be concise, practical, and considerate of the healthcare context in Rwanda. Format your response as a numbered list of insights, each with a bold title and 2-3 sentences of explanation.

FINANCIAL REPORT — ${monthName} ${year}

REVENUE:
- Gross revenue: ${data.revenue.gross.toLocaleString()} RWF
- Total discounts given: ${data.revenue.discounts.toLocaleString()} RWF
- Net revenue: ${data.revenue.net.toLocaleString()} RWF
- Total patient transactions: ${data.revenue.transactionCount}

Revenue by clinician:
${clinicianLines || "  - No data"}

EXPENSES:
- Total expenses: ${data.expenses.total.toLocaleString()} RWF
${expenseLines || "  - No expenses recorded"}

PAYROLL:
- Total gross payroll: ${data.payroll.total.toLocaleString()} RWF
- Staff advances taken: ${data.payroll.advances.toLocaleString()} RWF
- Number of staff on payroll: ${data.payroll.count}

NET POSITION (Revenue - Expenses - Payroll): ${data.netPosition.toLocaleString()} RWF

Please provide specific, actionable insights based on this data.`;
}

export const generateInsights = async (req: Request, res: Response) => {
  try {
    const role = req.auth?.role;
    if (!role || (role !== "ADMIN" && role !== "FINANCE")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const month = parseInt(req.body.month);
    const year = parseInt(req.body.year);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ message: "Valid month and year required" });
    }

    // Recompute server-side rather than trusting figures from the client —
    // this is what drives an AI API call, so the numbers need to be real.
    const data = await getMonthlyReportData(month, year);
    const prompt = buildPrompt(data);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return res.status(500).json({ message: "AI insights are not configured" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini API error:", response.status, errBody);
      return res.status(502).json({ message: "Failed to generate AI insights" });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "No insights generated.";

    return res.json({ insights: text, period: { month, year } });
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ message: "Failed to generate AI insights" });
  }
};