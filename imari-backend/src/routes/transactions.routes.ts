import { Router } from "express";

const router = Router();

// GET all transactions (daily view)
router.get("/", (_req, res) => {
  res.json({
    message: "List of transactions (placeholder)",
    data: [],
  });
});

// POST new transaction
router.post("/", (req, res) => {
  const transaction = req.body;

  res.status(201).json({
    message: "Transaction created",
    data: transaction,
  });
});

export default router;
