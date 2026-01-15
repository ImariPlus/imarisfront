import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cron from "node-cron";
import { resetMonthlyPayrolls } from "./utils/payroll.reset";
import transactionRoutes from "./routes/transactions.routes";
import physiciansRoutes from "./routes/physicians.routes";
import userRoutes from "./routes/user.routes";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import expenseRoutes from "./routes/expense.routes";
import payrollRoutes from "./routes/payroll.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoutes);

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("Imari+ backend is running");
});

// API Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/physicians", physiciansRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);


cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Resetting monthly payrolls...");
    await resetMonthlyPayrolls();
    console.log("Monthly payrolls have been reset.");
  } catch (error) {
    console.error("Error resetting monthly payrolls:", error);
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// General error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
