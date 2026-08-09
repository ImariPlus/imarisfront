import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getReports } from "../controllers/reports.controller";

const router = Router();

router.get("/", authenticate, getReports);

export default router;