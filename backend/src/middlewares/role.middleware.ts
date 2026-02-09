import { Request, Response, NextFunction } from "express";

export const allowRoles =
  (...roles: Array<"ADMIN" | "FINANCE" | "USER">) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

export const isAdmin = allowRoles("ADMIN");
