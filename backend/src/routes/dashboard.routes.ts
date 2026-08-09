import { Router } from "express";
import { getDashboardSnapshot } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate, getDashboardSnapshot
);

export default router;
