import { Router } from "express";
import { getDashboardSnapshot } from "../controllers/dashboard.controller";
import { auth } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/",
  auth,
  allowRoles("ADMIN", "FINANCE"),
  getDashboardSnapshot
);

export default router;
