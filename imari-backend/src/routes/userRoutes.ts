import { Router } from "express";
import * as userController from "../controllers/userController";
import { isAdmin } from "../middlewares/adminMiddlewares";

const router = Router();

// Public routes
router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);

// Admin-only routes
router.post("/", isAdmin, userController.createUser);
router.put("/:id", userController.updateUser); // maybe protect this too?
router.delete("/:id", isAdmin, userController.deleteUser);

export default router;
