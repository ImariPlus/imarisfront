import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import * as userController from "../controllers/user.controller";
const router = Router();

// admin routes
router.get("/", auth, isAdmin, userController.getUsers);
router.post("/", auth, isAdmin, userController.createUser);
router.delete("/:id", auth, isAdmin, userController.deleteUser);

// user routes
router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);

export default router;
