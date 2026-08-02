import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMonthlyInsightsData } from "../controllers/insights.controller";

const router = Router();

router.get("/", authenticate, getMonthlyInsightsData);

export default router;