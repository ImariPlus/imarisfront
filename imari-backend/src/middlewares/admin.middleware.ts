import { Response, NextFunction } from "express";
import { AuthRequest } from "../controllers/auth.controller";

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
