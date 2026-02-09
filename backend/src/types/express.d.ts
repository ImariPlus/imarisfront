import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {};
