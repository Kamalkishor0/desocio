import { Login, Logout, Refresh, Register, setUsername, me } from "../controllers/auth.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	loginLimiter,
	logoutLimiter,
	refreshLimiter,
	registerLimiter
} from "../middlewares/rateLimiter.middleware";

const authRouter = Router();

authRouter.post("/login", loginLimiter, Login);
authRouter.post("/username", authMiddleware, setUsername);
authRouter.post("/register", registerLimiter, Register);
authRouter.post("/refresh", refreshLimiter, Refresh);
authRouter.post("/logout", logoutLimiter, Logout);
authRouter.get("/me", authMiddleware, me);

export default authRouter;