import { Router } from "express";
import {
  getDailyTimeline,
  addTimelineEntry,
  updateTimelineEntry,
  deleteTimelineEntry,
} from "../controllers/timeline.controller";

const router = Router();

router.get("/", getDailyTimeline);
router.post("/", addTimelineEntry);
router.put("/:id", updateTimelineEntry);
router.delete("/:id", deleteTimelineEntry);

export default router;