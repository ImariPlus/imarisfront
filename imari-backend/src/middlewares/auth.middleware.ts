import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtUser {
  id: string;
    role: "ADMIN" | "FINANCE" | "USER";
    }

    export const auth = (req: Request, res: Response, next: NextFunction) => {
      const header = req.headers.authorization;

        if (!header?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
              }

                try {
                    const token = header.split(" ")[1];
                        req.auth = jwt.verify(token, process.env.JWT_SECRET!) as JwtUser;
                            next();
                              } catch {
                                  return res.status(401).json({ message: "Invalid token" });
                                    }
                                    };
                                    