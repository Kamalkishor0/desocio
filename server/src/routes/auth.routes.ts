import { GoogleCallback, GoogleComplete, GoogleStart, Login, Logout, Refresh, Register, setUsername, me, updateAccount, changePassword, deleteAccount } from "../controllers/auth.controller";
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
authRouter.get("/google", GoogleStart);
authRouter.get("/google/callback", GoogleCallback);
authRouter.post("/google/complete", GoogleComplete);
authRouter.post("/username", authMiddleware, setUsername);
authRouter.patch("/account", authMiddleware, updateAccount);
authRouter.post("/password", authMiddleware, changePassword);
authRouter.delete("/account", authMiddleware, deleteAccount);
authRouter.post("/register", registerLimiter, Register);
authRouter.post("/refresh", refreshLimiter, Refresh);
authRouter.post("/logout", logoutLimiter, Logout);
authRouter.get("/me", authMiddleware, me);

export default authRouter;