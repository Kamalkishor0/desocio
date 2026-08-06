"use client";

import { useEffect, useState } from "react";
import { UserX } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  async function handleRedirect(username: string) {
    router.push(`/home/profile/${username}`);
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 text-gray-400">
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
      <section className="rounded-2xl border border-gray-700 bg-[#080809] p-6">
        <h1 className="mb-4 text-xl font-semibold text-white">
          Friends ({friends.length})
        </h1>

        {friends.length === 0 ? (
          <p className="text-gray-500">No friends yet.</p>
        ) : (
          <ul className="space-y-3">
            {friends.map((friend) => {
              const friendAvatar = resolveMediaUrl(friend.profilePictureUrl);
              const isConfirming = confirmingId === friend.id;
              const isRemoving = removingId === friend.id;

              return (
                <li
                  key={friend.id}
                  onClick={() => handleRedirect(friend.username)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 transition hover:border-gray-500 hover:bg-[#080809]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {friendAvatar ? (
                      <img
                        src={friendAvatar}
                        alt={friend.username}
                        className="h-11 w-11 rounded-full border border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-700 bg-[#080809] text-sm font-semibold text-white">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {friend.name}
                      </p>
                      <p className="truncate text-sm text-gray-400">
                        @{friend.username}
                      </p>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => removeFriend(friend.id)}
                        disabled={isRemoving}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-500"
                      >
                        {isRemoving ? "Removing..." : "Confirm"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isRemoving}
                        className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 transition hover:bg-[#080809]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingId(friend.id);
                      }}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-[#080809] hover:text-white"
                      title="Remove friend"
                    >
                      <UserX size={16} />
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
