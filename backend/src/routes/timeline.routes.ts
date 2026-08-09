import { Router } from "express";
import {
  getDailyTimeline,
  addTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
} from "../controllers/timeline.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", getDailyTimeline);
router.post("/", addTimelineEntry);
router.put("/:id", updateTimelineEntry);
router.delete("/:id", deleteTimelineEntry);

export default router;