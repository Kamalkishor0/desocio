import type { Request, Response } from "express";
import prisma from "../config/db";
import { verifyAccessToken } from "../utils/jwt";

const REFERRAL_COOKIE = "referral_code";
const REFERRAL_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export async function getInvite(req: Request, res: Response) {
  const code = typeof req.params.code === "string" ? req.params.code : "";
  const inviter = await prisma.user.findUnique({
    where: { referralCode: code },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      profilePictureUrl: true,
      _count: { select: { userAFriendships: true, userBFriendships: true } },
    },
  });

  if (!inviter) {
    res.clearCookie(REFERRAL_COOKIE);
    return res.status(404).json({ message: "Invite not found" });
  }

  const accessToken = req.cookies?.[process.env.ACCESS_COOKIE_NAME || "access_token"] as string | undefined;
  const auth = accessToken ? verifyAccessToken(accessToken) : null;
  if (auth) {
    return res.json({ authenticated: true, profile: { username: inviter.username } });
  }

  res.cookie(REFERRAL_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFERRAL_COOKIE_MAX_AGE,
  });

  return res.json({
    authenticated: false,
    profile: {
      name: inviter.name,
      username: inviter.username,
      bio: inviter.bio,
      profilePictureUrl: inviter.profilePictureUrl,
      friendsCount: inviter._count.userAFriendships + inviter._count.userBFriendships,
    },
  });
}