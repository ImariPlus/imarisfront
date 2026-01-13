import { Response, NextFunction } from "express";
import { AuthRequest, Role } from "../types/auth";

export const allowRoles =
  (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

export const isAdmin = allowRoles("ADMIN");
