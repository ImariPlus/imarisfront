import { JwtUser } from "../middlewares/auth.middleware";
import "express";

declare module "express-serve-static-core" {
  interface Request {
    auth?: any;
  }
}

export {};
