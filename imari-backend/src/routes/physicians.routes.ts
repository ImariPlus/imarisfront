import { Router, Request, Response } from "express";

const router = Router();

// 🔹 TEMP DATA (later from DB)
const physicians = [
  { id: 1, name: "Dr. Habimana Paul" },
  { id: 2, name: "Dr. Uwase Paula" },
  { id: 3, name: "Dr. Niyonzima Hakim" },
];

// 🔹 GET all physicians
router.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "List of physicians",
    data: physicians,
  });
});

export default router;
