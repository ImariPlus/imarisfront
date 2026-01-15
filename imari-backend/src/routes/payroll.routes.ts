// src/routes/payroll.routes.ts
import { Router } from "express";
import { 
    initPayroll,
    updateDailySave,
    finalizePayroll,
    listPayrolls } from "../controllers/payroll.controller";
import { auth } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(auth);

// Only Admin and Finance can initialize payroll
router.post("/init", allowRoles("ADMIN", "FINANCE"), initPayroll);
// Admin & Finance can update daily saved amount
router.post("/daily-save", allowRoles("ADMIN", "FINANCE"), updateDailySave);
// Admin & Finance can finalize payroll
router.put("/finalize", allowRoles("ADMIN", "FINANCE"), finalizePayroll);
// Admin & Finance can list all payrolls
router.get("/", allowRoles("ADMIN", "FINANCE"), listPayrolls);

export default router;
