import { Login, Logout, Refresh, Register } from "../controllers/auth.controller";
import { Router } from "express";
import rateLimit from "express-rate-limit";

const authRouter = Router();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many login attempts. Try again later." }
});

const registerLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	limit: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many registrations. Try again later." }
});

const refreshLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many refresh requests. Try again later." }
});

const logoutLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: "Too many logout requests. Try again later." }
});

authRouter.post("/login", loginLimiter, Login);
authRouter.post("/register", registerLimiter, Register);
authRouter.post("/refresh", refreshLimiter, Refresh);
authRouter.post("/logout", logoutLimiter, Logout);

export default authRouter;