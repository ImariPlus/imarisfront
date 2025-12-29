import express, { Request, Response } from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.routes"
import physiciansRoutes from "./routes/physicians.routes"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Imari+ backend is running");
});

// APIs
app.use("/api/transactions", transactionRoutes);
app.use("/api/physicians", physiciansRoutes);

export default app;
