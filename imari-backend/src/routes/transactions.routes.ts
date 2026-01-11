import { Router } from "express";
import * as transactionsController from "../controllers/transactions.controller";
import { auth, AuthRequest } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();

// Auth required for all transaction routes
router.use(auth);

router.get("/", transactionsController.getTransactions);
router.get("/:id", transactionsController.getTransaction);
router.post("/", transactionsController.createTransaction);
router.put("/:id", isAdmin, transactionsController.updateTransaction);
router.delete("/:id", isAdmin, transactionsController.deleteTransaction);

export default router;
