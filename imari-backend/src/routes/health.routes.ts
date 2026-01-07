import { Router } from "express";

const router = Router();

router.get("/ping", (_req, res) => {
  res.json({
    status: "ok",
    message: "health route works"
  });
});

export default router;
