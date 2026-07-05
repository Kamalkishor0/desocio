"use client";

import { useEffect, useState } from "react";
import { UserX } from "lucide-react";

import { friendsApi } from "@/lib/api/friends";
import type { Friend } from "@/lib/api/friends";
import { resolveMediaUrl } from "@/lib/media";

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await friendsApi.list();
        if (!active) {
          return;
        }
        setFriends(result.data ?? []);
      } catch (err) {
        if (!active) {
          return;
        }
        console.error("Failed to load friends:", err);
        setError("Failed to load friends. Please try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  async function removeFriend(friendId: string) {
    setRemovingId(friendId);
    try {
      await friendsApi.remove(friendId);
      setFriends((current) => current.filter((friend) => friend.id !== friendId));
      setConfirmingId(null);
    } catch (err) {
      console.error("Failed to remove friend:", err);
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 text-slate-400">
        Loading friends...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 text-red-400">{error}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="mb-4 text-xl font-semibold text-white">
          Friends ({friends.length})
        </h1>

        {friends.length === 0 ? (
          <p className="text-slate-500">No friends yet.</p>
        ) : (
          <ul className="space-y-3">
            {friends.map((friend) => {
              const friendAvatar = resolveMediaUrl(friend.profilePictureUrl);
              const isConfirming = confirmingId === friend.id;
              const isRemoving = removingId === friend.id;

              return (
                <li
                  key={friend.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3"
                >
                  {friendAvatar ? (
                    <img
                      src={friendAvatar}
                      alt={friend.username}
                      className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-white">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="min-w-0 flex-1 truncate text-slate-200">
                    @{friend.username}
                  </span>

                  {isConfirming ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden text-sm text-slate-400 sm:inline">
                        Remove?
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFriend(friend.id)}
                        disabled={isRemoving}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
                      >
                        {isRemoving ? "Removing..." : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isRemoving}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:text-white disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(friend.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:text-red-400"
                    >
                      <UserX size={16} />
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
