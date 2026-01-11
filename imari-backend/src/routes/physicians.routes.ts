import { Router } from "express";
import * as controller from "../controllers/physicians.controller";
import { auth } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.get("/", auth, controller.getPhysicians);
router.get("/:id", auth, controller.getPhysician);
router.post("/", auth, isAdmin, controller.createPhysician);
router.put("/:id", auth, isAdmin, controller.updatePhysician);
router.delete("/:id", auth, isAdmin, controller.deletePhysician);
router.get("/:id/stats", auth, controller.getPhysicianStats);
router.get("/:id/transactions", auth, controller.getPhysicianTransactions);
router.get("/:id/payroll-review", auth, controller.getPhysicianPayrollReview);

export default router;
