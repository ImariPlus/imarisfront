import { Router } from "express";
import * as controller from "../controllers/physicians.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles, isAdmin } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, controller.getPhysicians);
router.get("/:id", authenticate, controller.getPhysician);
router.post("/", authenticate, isAdmin, controller.createPhysician);
router.put("/:id", authenticate, isAdmin, controller.updatePhysician);
router.delete("/:id", authenticate, isAdmin, controller.deletePhysician);
router.get("/:id/stats", authenticate, controller.getPhysicianStats);
router.get("/:id/transactions", authenticate, controller.getPhysicianTransactions);
router.get("/:id/payroll-review", authenticate, controller.getPhysicianPayrollReview);
router.get("/payroll-summary", authenticate, allowRoles("ADMIN", "FINANCE"), controller.getPhysicianPayrollSummary);

export default router;
