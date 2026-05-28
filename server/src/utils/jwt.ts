import crypto from "crypto";
import jwt, { type JwtPayload as JsonWebTokenPayload, type SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"];

function getAccessSecret(): string {
    const secretKey = process.env.JWT_ACCESS_SECRET;
    if (!secretKey) {
        throw new Error("JWT access secret is not defined");
    }
    return secretKey;
}

function getRefreshSecret(): string {
    const secretKey = process.env.JWT_REFRESH_SECRET;
    if (!secretKey) {
        throw new Error("JWT refresh secret is not defined");
    }
    return secretKey;
}

export function signAccessToken(payload: JsonWebTokenPayload) {
    return jwt.sign(payload, getAccessSecret(), { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: JsonWebTokenPayload) {
    return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, getAccessSecret()) as JwtPayload;
        if (typeof decoded !== "object" || decoded === null) {
            return null;
        }
        const { id, username, email } = decoded;
        if (typeof id !== "string" || typeof username !== "string" || typeof email !== "string") {
            return null;
        }
        return { id, username, email };
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, getRefreshSecret()) as JwtPayload;
        if (typeof decoded !== "object" || decoded === null) {
            return null;
        }
        const { id, username, email } = decoded;
        if (typeof id !== "string" || typeof username !== "string" || typeof email !== "string") {
            return null;
        }
        return { id, username, email };
    } catch {
        return null;
    }
}

export function generateRefreshToken(): string {
    return crypto.randomBytes(48).toString("hex");
}

export function hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
