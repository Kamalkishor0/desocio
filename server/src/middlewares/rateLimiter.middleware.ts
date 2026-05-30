import rateLimit from "express-rate-limit";

const createLimiter = (windowMs: number, limit: number, message: string) =>
	rateLimit({
		windowMs,
		limit,
		standardHeaders: true,
		legacyHeaders: false,
		message: { message }
	});

export const loginLimiter = createLimiter(15 * 60 * 1000, 10, "Too many login attempts. Try again later.");
export const registerLimiter = createLimiter(60 * 60 * 1000, 5, "Too many registrations. Try again later.");
export const refreshLimiter = createLimiter(15 * 60 * 1000, 30, "Too many refresh requests. Try again later.");
export const logoutLimiter = createLimiter(15 * 60 * 1000, 30, "Too many logout requests. Try again later.");
