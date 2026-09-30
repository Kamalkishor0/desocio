import { Request, Response } from "express";
import { FriendRequestStatus } from "@prisma/client";
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
import { normalizeEmail } from "../utils/auth";
import { AuthenticatedRequest } from "../types/auth";
import {
    deleteCachedJson,
    getCachedJson,
    setCachedJson,
    signRateLimitCacheKey
} from "../config/redis";
import { createNotification } from "../service/notifications.service";
import crypto from "crypto";

const GOOGLE_STATE_COOKIE = "google_oauth_state";
const GOOGLE_PENDING_COOKIE = "google_oauth_pending";
const REFERRAL_COOKIE = "referral_code";

async function applyReferralCode(req: Request, res: Response, receiverId: string) {
    const referralCode = req.cookies?.[REFERRAL_COOKIE] as string | undefined;
    if (!referralCode) return;

    try {
        const inviter = await prisma.user.findUnique({
            where: { referralCode },
            select: { id: true },
        });

        if (inviter && inviter.id !== receiverId) {
            const existing = await prisma.friendRequest.findFirst({
                where: {
                    OR: [
                        { senderId: inviter.id, receiverId },
                        { senderId: receiverId, receiverId: inviter.id },
                    ],
                    status: FriendRequestStatus.pending,
                },
                select: { id: true },
            });

            if (!existing) {
                const request = await prisma.friendRequest.create({
                    data: { senderId: inviter.id, receiverId, status: FriendRequestStatus.pending },
                });
                await createNotification({
                    userId: receiverId,
                    actorId: inviter.id,
                    type: "friendRequest",
                    entityId: request.id,
                    entityType: "friendRequest",
                });
            }
        }
    } finally {
        res.clearCookie(REFERRAL_COOKIE, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }
}

function googleRedirectUri() {
    return process.env.GOOGLE_REDIRECT_URI || `${process.env.SERVER_URL || "http://localhost:3001"}/auth/google/callback`;
}

function clientRedirect(path: string) {
    return `${process.env.CLIENT_URL || "http://localhost:3000"}${path}`;
}

function googleUsername(name: string, email: string) {
    const base = (name || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24) || "user";
    return base.length >= 3 ? base : `${base}user`.slice(0, 30);
}

async function uniqueGoogleUsername(name: string, email: string) {
    const base = googleUsername(name, email);
    let username = base;
    let suffix = 0;
    while (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
        suffix += 1;
        username = `${base.slice(0, 30 - String(suffix).length - 1)}_${suffix}`;
    }
    return username;
}

export function GoogleStart(_req: Request, res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({ message: "Google sign-in is not configured" });
    }
    const state = crypto.randomBytes(32).toString("hex");
    res.cookie(GOOGLE_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000
    });
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: googleRedirectUri(),
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account"
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function GoogleCallback(req: Request, res: Response) {
    const { code, state } = req.query as { code?: string; state?: string };
    const savedState = req.cookies?.[GOOGLE_STATE_COOKIE] as string | undefined;
    res.clearCookie(GOOGLE_STATE_COOKIE);
    if (!code || !state || !savedState || state !== savedState) {
        return res.redirect(clientRedirect("/?authError=invalid_google_state"));
    }
    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID || "",
                client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
                redirect_uri: googleRedirectUri(),
                grant_type: "authorization_code"
            })
        });
        if (!tokenResponse.ok) throw new Error("Google token exchange failed");
        const tokens = await tokenResponse.json() as { access_token?: string };
        if (!tokens.access_token) throw new Error("Google access token missing");
        const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (!profileResponse.ok) throw new Error("Google profile request failed");
        const profile = await profileResponse.json() as { email?: string; email_verified?: boolean; name?: string; picture?: string };
        if (!profile.email || !profile.email_verified) throw new Error("Google email is not verified");
        const email = normalizeEmail(profile.email);
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            const { accessToken, refreshToken } = await issueTokens(existingUser);
            setAccessCookie(res, accessToken);
            setRefreshCookie(res, refreshToken);
            return res.redirect(clientRedirect("/home"));
        }
        res.cookie(GOOGLE_PENDING_COOKIE, JSON.stringify({
            email,
            name: profile.name?.trim() || email.split("@")[0],
            picture: profile.picture || null
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60 * 1000
        });
        return res.redirect(clientRedirect("/?auth=google&step=complete"));
    } catch {
        return res.redirect(clientRedirect("/?authError=google_sign_in_failed"));
    }
}

export async function GoogleComplete(req: Request, res: Response) {
    const pendingData = req.cookies?.[GOOGLE_PENDING_COOKIE] as string | undefined;
    if (!pendingData) {
        return res.status(400).json({ message: "Google sign-up session expired. Please try again." });
    }

    let payload: { email?: string; name?: string; picture?: string };
    try {
        payload = JSON.parse(pendingData) as { email?: string; name?: string; picture?: string };
    } catch {
        res.clearCookie(GOOGLE_PENDING_COOKIE);
        return res.status(400).json({ message: "Invalid Google sign-up session." });
    }

    const { name, username, password, confirmPassword } = req.body as { name?: string; username?: string; password?: string; confirmPassword?: string };
    const nextName = typeof name === "string" ? name.trim() : "";
    const nextUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    const nextPassword = typeof password === "string" ? password : "";
    const nextConfirmPassword = typeof confirmPassword === "string" ? confirmPassword : "";

    if (!payload.email || !nextName || !nextUsername) {
        return res.status(400).json({ message: "Name and username are required" });
    }
    if (nextName.length < 2 || nextName.length > 100) {
        return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
    }
    if (nextUsername.length < 3 || nextUsername.length > 32) {
        return res.status(400).json({ message: "Username must be between 3 and 32 characters long" });
    }
    if (!/^[a-z0-9_]+$/.test(nextUsername)) {
        return res.status(400).json({ message: "Username can only contain lowercase letters, numbers and underscores" });
    }
    if (!nextPassword || !nextConfirmPassword) {
        return res.status(400).json({ message: "Password and confirm password are required" });
    }
    if (nextPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    if (!/[A-Z]/.test(nextPassword) || !/[a-z]/.test(nextPassword) || !/[0-9]/.test(nextPassword)) {
        return res.status(400).json({ message: "Password must contain at least one uppercase letter, one lowercase letter and one number" });
    }
    if (nextPassword !== nextConfirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = normalizeEmail(payload.email);
    const existingEmailUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmailUser) {
        res.clearCookie(GOOGLE_PENDING_COOKIE);
        const { accessToken, refreshToken } = await issueTokens(existingEmailUser);
        setAccessCookie(res, accessToken);
        setRefreshCookie(res, refreshToken);
        return res.status(200).json({ message: "Google sign-in successful", user: existingEmailUser });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: nextUsername } });
    if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(nextPassword, 10);
    const newUser = await prisma.user.create({
        data: {
            email: normalizedEmail,
            name: nextName,
            username: nextUsername,
            passwordHash,
            profilePictureUrl: payload.picture || null
        },
        select: {
            id: true,
            name: true,
            username: true,
            referralCode: true,
            email: true,
            createdAt: true,
            profilePictureUrl: true,
            bio: true,
            lastSeenAt: true
        }
    });
    await createNotification({ userId: newUser.id, type: "welcome" });
    await applyReferralCode(req, res, newUser.id);
    res.clearCookie(GOOGLE_PENDING_COOKIE);
    const { accessToken, refreshToken } = await issueTokens(newUser);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ message: "Google account created successfully", user: newUser });
}

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

function accountSelect() {
    return {
        id: true,
        name: true,
        username: true,
        referralCode: true,
        email: true,
        createdAt: true,
        lastSeenAt: true,
        profilePictureUrl: true,
        bio: true,
        showOnlineStatus: true
    } as const;
}

export async function updateAccount(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });

    const body = req.body as {
        name?: unknown;
        username?: unknown;
        bio?: unknown;
        profilePictureUrl?: unknown;
        showOnlineStatus?: unknown;
    };
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (name.length < 2 || name.length > 100) return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
        data.name = name;
    }
    if (body.username !== undefined) {
        const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
        if (!/^[a-z0-9_]{3,32}$/.test(username)) return res.status(400).json({ message: "Username must be 3-32 characters and use only letters, numbers, and underscores" });
        const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
        if (existing && existing.id !== auth.id) return res.status(409).json({ message: "Username already taken" });
        data.username = username;
    }
    for (const field of ["bio", "profilePictureUrl"] as const) {
        if (body[field] !== undefined) {
            if (typeof body[field] !== "string") return res.status(400).json({ message: `${field} must be text` });
            data[field] = body[field].trim() || null;
        }
    }
    if (body.showOnlineStatus !== undefined) {
        if (typeof body.showOnlineStatus !== "boolean") return res.status(400).json({ message: "showOnlineStatus must be boolean" });
        data.showOnlineStatus = body.showOnlineStatus;
    }

    const user = await prisma.user.update({ where: { id: auth.id }, data, select: accountSelect() });
    return res.json({ message: "Account updated", user });
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    const { currentPassword, newPassword, confirmPassword } = req.body as Record<string, unknown>;
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") return res.status(400).json({ message: "All password fields are required" });
    const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { passwordHash: true } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ message: "Current password is incorrect" });
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return res.status(400).json({ message: "Password must be 8+ characters with uppercase, lowercase, and a number" });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
    await prisma.user.update({ where: { id: auth.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } });
    return res.json({ message: "Password changed" });
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    const { password } = req.body as { password?: unknown };
    const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { passwordHash: true } });
    if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ message: "Password is incorrect" });
    await prisma.$transaction([
        prisma.refreshToken.updateMany({ where: { userId: auth.id, revokedAt: null }, data: { revokedAt: new Date() } }),
        prisma.user.update({ where: { id: auth.id }, data: { accountStatus: "deleted", name: "Deleted user", username: `deleted_${auth.id.slice(-8)}`, email: `deleted_${auth.id}@deleted.local`, bio: null, profilePictureUrl: null } })
    ]);
    clearAccessCookie(res);
    clearRefreshCookie(res);
    return res.json({ message: "Account deleted" });
}
export async function Login(req: Request, res: Response) {
    // Implementation for login
    const ip = req.ip || "unknown";
    const cacheKey = signRateLimitCacheKey(ip);
    const rateLimitData = await getCachedJson<{ count: number; lastAttempt: number }>(cacheKey);
    const now = Date.now();
    if (rateLimitData) {
        const { count, lastAttempt } = rateLimitData;
        if (count >= 5 && now - lastAttempt < 15 * 60 * 1000) {
            return res.status(429).json({ message: "Too many login attempts. Please try again later." });
        }
    }
    const {userOrEmail, password} = req.body as{
        userOrEmail: string;
        password: string;
    }
    if(!password){
        return res.status(400).json({message: "Password is required"});
    }
    if(!userOrEmail){
        return res.status(400).json({message: "Email or username is required"});
    }
    let user = null;
    if(userOrEmail.includes("@")){
        user = await prisma.user.findUnique({
            where: {
                email: normalizeEmail(userOrEmail)
            }
        });
    }else{
        user = await prisma.user.findUnique({
            where: {
                username: userOrEmail
            }
        });
    }
    if(!user){
        await setCachedJson(cacheKey, { count: (rateLimitData?.count ?? 0) + 1, lastAttempt: now }, 15 * 60);
        return res.status(400).json({message: "Invalid username, email or password"});
    }
    if (user.accountStatus !== "active") {
        return res.status(403).json({ message: "This account is not available" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordValid){
        await setCachedJson(cacheKey, { count: (rateLimitData?.count ?? 0) + 1, lastAttempt: now }, 15 * 60);
        return res.status(400).json({message: "Invalid username, email or password"});
    }
    await deleteCachedJson(cacheKey);
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
    const {email, password, username, name} = req.body as{
        email: string;
        password: string;
        name: string;
        username: string;
    }
    if(!email.trim() || !password.trim() || !username.trim() || !name.trim()){
        return res.status(400).json({message: "Fill all the entries"});
    }
    if(password.length < 8){
        return res.status(400).json({message: "Password must be at least 8 characters long"});
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({message: "Password must contain at least one uppercase letter, one lowercase letter and one number"});
    }
    if(username.length < 3 || username.length > 32){
        return res.status(400).json({message: "Username must be between 3 and 32 characters long"});
    }
    if(!/^[a-z0-9_]+$/.test(username)){
        return res.status(400).json({message: "Username can only contain lowercase letters, numbers and underscores"});
    }
    const existingUsername = await prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if(existingUsername){
        return res.status(400).json({message: "username already in use"});
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
            username: username,
            name: name
        },
        select:{
            id: true,
            email: true,
            username: true,
            createdAt: true
        }
    });
    await createNotification({
        userId: newUser.id,
        type: "welcome",
    });
    await applyReferralCode(req, res, newUser.id);
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

    const newRefreshToken = signRefreshToken({ id: user.id });
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
export async function me(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
        where: { id: auth.id },
        select: {
            id: true,
            name: true,
            username: true,
            referralCode: true,
            email: true,
            createdAt : true,
            lastSeenAt : true,
            profilePictureUrl : true,
            bio : true,
            showOnlineStatus: true
        }
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
}