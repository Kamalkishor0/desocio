import { Response } from "express";
import prisma from "../config/db";
import { hashRefreshToken, signAccessToken, signRefreshToken } from "./jwt";

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 30);
const ACCESS_TOKEN_MINUTES = Number(process.env.ACCESS_TOKEN_MINUTES || 15);
const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME || "access_token";
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refresh_token";
const IS_PROD = process.env.NODE_ENV === "production";

export { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME };

export function refreshTokenExpiresAt(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
}

function accessCookieMaxAgeMs(): number {
    return ACCESS_TOKEN_MINUTES * 60 * 1000;
}

export function setAccessCookie(res: Response, token: string) {
    res.cookie(ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "lax",
        maxAge: accessCookieMaxAgeMs()
    });
}

export function setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
    });
}

export function clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "lax"
    });
}

export function clearAccessCookie(res: Response) {
    res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "lax"
    });
}

export async function issueTokens(user: { id: string; username: string; email: string }) {
    const accessToken = signAccessToken({ id: user.id, username: user.username, email: user.email });
    const refreshToken = signRefreshToken({ id: user.id, username: user.username, email: user.email });
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt: refreshTokenExpiresAt()
        }
    });

    return { accessToken, refreshToken };
}
