"use client";

import { useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/lib/media";
import type { FriendRequest } from "@/lib/api/friends";

type FriendRequestCardProps = {
  request: FriendRequest;
  type: "received" | "sent";
  onAccept?: (senderId: string) => void;
  onReject?: (senderId: string) => void;
  onCancel?: (receiverId: string) => void;
};

export function FriendRequestCard({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestCardProps) {
  const user = type === "received" ? request.sender : request.receiver;

  if (!user) return null;

  const avatarUrl = resolveMediaUrl(user.profilePictureUrl);
  const router = useRouter();
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div
        onClick={() => router.push(`/home/profile/${user.username}`)}
        className="flex min-w-0 items-center gap-4"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-lg font-semibold text-white">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate font-medium text-white">{user.name}</p>
          <p className="truncate text-sm text-slate-400">@{user.username}</p>
        </div>
      </div>

      {type === "received" ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onReject?.(user.id)}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Reject
          </button>

          <button
            onClick={() => onAccept?.(user.id)}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Accept
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCancel?.(user.id)}
          className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          Cancel Request
        </button>
      )}
    </div>
  );
}