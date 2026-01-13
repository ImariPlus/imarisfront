import { Request } from "express";

export type Role = "ADMIN" | "FINANCE" | "USER";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}
