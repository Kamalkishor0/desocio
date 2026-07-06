import { Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";
import {
  FriendshipStatus,
  type FriendshipStatusType,
} from "../constants/friendships";
    
function getSingleString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function getProfileByUsername(
  req: AuthenticatedRequest,
  res: Response
) {
  const auth = req.auth;
  if (!auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const username = getSingleString(req.params.username);
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      profilePictureUrl: true,
      createdAt: true,
      lastSeenAt: true,

      posts: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          photos: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },

      thoughts: {
        orderBy: {
          createdAt: "desc",
        },
      },

      _count: {
        select: {
          userAFriendships: true,
          userBFriendships: true,
        },
      },
    },
  });

  if (!profile) {
    return res.status(404).json({ message: "User not found" });
  }

  let friendshipStatus: FriendshipStatusType = FriendshipStatus.NONE;

  if (profile.id === auth.id) {
    friendshipStatus = FriendshipStatus.SELF;
  } else {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            userAId: auth.id,
            userBId: profile.id,
          },
          {
            userAId: profile.id,
            userBId: auth.id,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (friendship) {
      friendshipStatus = FriendshipStatus.FRIENDS;
    } else {
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            {
              senderId: auth.id,
              receiverId: profile.id,
            },
            {
              senderId: profile.id,
              receiverId: auth.id,
            },
          ],
          status: "pending",
        },
        select: {
          senderId: true,
        },
      });

      if (friendRequest) {
        friendshipStatus =
          friendRequest.senderId === auth.id
            ? FriendshipStatus.PENDING_SENT
            : FriendshipStatus.PENDING_RECEIVED;
      }
    }
  }

  res.json({
    user: {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      profilePictureUrl: profile.profilePictureUrl,
      createdAt: profile.createdAt,
      lastSeenAt: profile.lastSeenAt,
    },
    posts: profile.posts,
    thoughts: profile.thoughts,
    friendsCount:
      profile._count.userAFriendships +
      profile._count.userBFriendships,
    friendshipStatus,
  });
}

export async function getSearchResult(
  req: AuthenticatedRequest,
  res: Response
) {
  const auth = req.auth;
  if (!auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const username = getSingleString(req.params.username);
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const users = await prisma.user.findMany({
    where: {
      username: {
        startsWith: username,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      profilePictureUrl: true,
    },
    orderBy: {
      username: "asc",
    },
    take: 10,
  });

  res.json({ users });
}