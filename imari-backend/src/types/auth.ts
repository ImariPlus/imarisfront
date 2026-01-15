import { Request } from "express";

export type Role = "ADMIN" | "FINANCE" | "USER";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    email: string;
    password: string;
    role: Role;
  };
}
