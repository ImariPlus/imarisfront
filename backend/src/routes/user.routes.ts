import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";
import * as userController from "../controllers/user.controller";
const router = Router();

// admin routes
router.get("/", authenticate, isAdmin, userController.getUsers);
router.post("/", authenticate, isAdmin, userController.createUser);
router.delete("/:id", authenticate, isAdmin, userController.deleteUser);

// user routes
router.get("/me", authenticate, userController.getMe);
router.put("/me", authenticate, userController.updateMe);

export default router;
