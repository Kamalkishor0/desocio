import { Request, Response } from "express";
import prisma from "../config/db";
import bcrypt from "bcrypt";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import {
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    clearAccessCookie,
    clearRefreshCookie,
    issueTokens,
    refreshTokenExpiresAt,
    setAccessCookie,
    setRefreshCookie
} from "../utils/authTokens";
import { normalizeEmail, tempUserName } from "../utils/auth";
import { AuthenticatedRequest, JwtPayload } from "../types/auth";

export async function setUsername(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { username } = req.body as { username?: string };
    const nextUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    if (!nextUsername) {
        return res.status(400).json({ message: "Username is required" });
    }
    if (nextUsername.length < 3 || nextUsername.length > 32) {
        return res.status(400).json({ message: "Username must be 3-32 characters" });
    }
    if (!/^[a-z0-9_]+$/.test(nextUsername)) {
        return res.status(400).json({ message: "Username may contain letters, numbers, and underscores" });
    }

    const existing = await prisma.user.findUnique({
        where: { username: nextUsername },
        select: { id: true }
    });
    if (existing && existing.id !== auth.id) {
        return res.status(409).json({ message: "Username already taken" });
    }

    const updated = await prisma.user.update({
        where: { id: auth.id },
        data: { username: nextUsername },
        select: { id: true, username: true, email: true }
    });

    return res.status(200).json({ message: "Username updated", user: updated });
}
export async function Login(req: Request, res: Response) {
    // Implementation for login
    const {username, email, password} = req.body as{
        username: string;
        email: string;
        password: string;
    }
    if(!password){
        return res.status(400).json({message: "Password is required"});
    }
    if(!email && !username){
        return res.status(400).json({message: "Email or username are required"});
    }
    let user = null;
    if(email){
        user = await prisma.user.findUnique({
            where: {
                email: normalizeEmail(email)
            }
        });
    }else if(username){
        user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });
    }
    if(!user){
        return res.status(400).json({message: "Invalid email or password"});
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid email or password"});
    }
    const { accessToken, refreshToken } = await issueTokens({
        id: user.id,
        username: user.username,
        email: user.email
    });
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
    return res.status(200).json({message: "Login successful"});
};

export async function Register(req: Request, res: Response) {
	// Implementation for register
    const {email, password} = req.body as{
        email: string;
        password: string;
    }
    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"});
    }
    if(password.length < 8){
        return res.status(400).json({message: "Password must be at least 8 characters long"});
    }
    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizeEmail(email)
        }
    });
    if(existingUser){
        return res.status(400).json({message: "email already in use"});
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email: normalizeEmail(email),
            passwordHash: passwordHash,
            username: tempUserName(email)
        },
        select:{
            id: true,
            email: true,
            username: true,
            createdAt: true
        }
    });
    return res.status(201).json({message: "User created successfully", newUser});
};

export async function Refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        return res.status(401).json({ message: "Refresh token expired or revoked" });
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.id }
    });

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    const newRefreshToken = signRefreshToken({
        id: user.id,
        username: user.username,
        email: user.email
    });
    const newTokenHash = hashRefreshToken(newRefreshToken);

    await prisma.$transaction([
        prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() }
        }),
        prisma.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId: user.id,
                expiresAt: refreshTokenExpiresAt()
            }
        })
    ]);

    const accessToken = signAccessToken({
        id: user.id,
        username: user.username,
        email: user.email
    });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({ message: "Token refreshed" });
}

export async function Logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() }
    });

    clearAccessCookie(res);
    clearRefreshCookie(res);
    return res.status(200).json({ message: "Logged out" });
}