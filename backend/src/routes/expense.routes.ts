import { Router } from "express";
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// All expense routes require authentication
router.use(authenticate);

// Anyone logged in can view expenses
router.get("/", getExpenses);

// Finance + Admin can manage expenses
router.post("/", allowRoles("ADMIN", "FINANCE"), createExpense);
router.put("/:id", allowRoles("ADMIN", "FINANCE"), updateExpense);
router.delete("/:id", allowRoles("ADMIN", "FINANCE"), deleteExpense);

export default router;
