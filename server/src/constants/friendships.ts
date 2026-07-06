export const FriendshipStatus = {
  SELF: "self",
  NONE: "none",
  FRIENDS: "friends",
  PENDING_SENT: "pending_sent",
  PENDING_RECEIVED: "pending_received",
} as const;

export type FriendshipStatusType =
  (typeof FriendshipStatus)[keyof typeof FriendshipStatus];