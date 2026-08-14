import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { listEmployees, createEmployee } from "../controllers/employee.controller";

const router = Router();

router.use(authenticate);

router.get("/", allowRoles("ADMIN", "FINANCE"), listEmployees);
router.post("/", allowRoles("ADMIN", "FINANCE"), createEmployee);

export default router;