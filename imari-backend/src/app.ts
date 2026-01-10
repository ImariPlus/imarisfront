import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.routes";
import physiciansRoutes from "./routes/physicians.routes";
import userRoutes from "./routes/userRoutes";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";

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
