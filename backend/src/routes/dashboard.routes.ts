import { Router } from "express";
import { getDashboardSnapshot } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  allowRoles("ADMIN", "FINANCE"),
  getDashboardSnapshot
);

export default router;
