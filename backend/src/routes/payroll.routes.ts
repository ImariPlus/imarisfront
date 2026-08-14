// src/routes/payroll.routes.ts
import { Router } from "express";
import { 
    initPayroll,
    updateDailySave,
    finalizePayroll,
    listPayrolls,
    previewPayroll } from "../controllers/payroll.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);

// Preview a suggested gross pay for commission-based employees before confirming
router.get("/preview", allowRoles("ADMIN", "FINANCE"), previewPayroll);
// Only Admin and Finance can initialize payroll
router.post("/init", allowRoles("ADMIN", "FINANCE"), initPayroll);
// Admin & Finance can update daily saved amount
router.post("/daily-save", allowRoles("ADMIN", "FINANCE"), updateDailySave);
// Admin & Finance can finalize payroll
router.put("/finalize", allowRoles("ADMIN", "FINANCE"), finalizePayroll);
// Admin & Finance can list all payrolls
router.get("/", allowRoles("ADMIN", "FINANCE"), listPayrolls);

export default router;