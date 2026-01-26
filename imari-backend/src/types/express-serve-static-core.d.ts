import { JwtUser } from "../middlewares/auth.middleware"

declare module "express-serve-static-core" {
        interface Request {
            auth?: JwtUser;
        }
}

export {};
