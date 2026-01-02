// src/middlewares/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.header("x-user-id"); // assume user ID is sent in header for now
    if (!userId) return res.status(401).json({ error: "Missing user ID" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Authorization failed" });
  }
};
