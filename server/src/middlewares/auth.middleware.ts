import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import { verifyAccessToken } from "../utils/jwt";
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const cookies = req.cookies[process.env.ACCESS_COOKIE_NAME || "access_token"];
    if (!cookies) {
        return res.status(401).json({ message: "Access token is required" });
    }
    const payload = verifyAccessToken(cookies);
    if (!payload) {
        return res.status(401).json({ message: "Invalid access token" });
    }
    req.auth = payload;
    next();
}