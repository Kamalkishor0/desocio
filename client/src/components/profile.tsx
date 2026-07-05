"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { postApi } from "@/lib/api/post";
import { thoughtApi } from "@/lib/api/thought";
import { friendsApi } from "@/lib/api/friends";
import type { AuthUser } from "@/types/auth";
import type { FeedPost } from "@/lib/api/feed";
import type { Thought } from "@/lib/api/thought";
import type { Friend } from "@/lib/api/friends";
import { formatDate, resolveMediaUrl } from "@/lib/media";
import { PostModal } from "@/components/post-modal";

function initialFor(user: AuthUser): string {
  const source = user.name || user.username || "?";
  return source.charAt(0).toUpperCase();
}

export function Profile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "thoughts">("posts");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [meResult, postsResult, thoughtsResult, friendsResult] =
          await Promise.all([
            api.me(),
            postApi.getAll() as Promise<FeedPost[]>,
            thoughtApi.list(),
            friendsApi.list(),
          ]);
        if (!active) {
          return;
        }
        setUser(meResult.user);
        setPosts(Array.isArray(postsResult) ? postsResult : []);
        setThoughts(Array.isArray(thoughtsResult) ? thoughtsResult : []);
        setFriends(friendsResult.data ?? []);
        setFriendsCount(friendsResult.total ?? friendsResult.data?.length ?? 0);
      } catch (err) {
        if (!active) {
          return;
        }
        console.error("Failed to load profile:", err);
        setError("Failed to load profile. Please try again.");
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

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 text-red-400">
        {error ?? "Profile not found."}
      </div>
    );
  }

  const avatarUrl = resolveMediaUrl(user.profilePictureUrl);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full border border-slate-700 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-2xl font-semibold text-white">
              {initialFor(user)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold text-white">
              {user.name}
            </h1>
            <p className="text-slate-400">@{user.username}</p>
            <p className="truncate text-sm text-slate-500">{user.email}</p>

            <div className="mt-3 flex gap-6 text-sm">
              <span className="text-slate-300">
                <span className="font-semibold text-white">{posts.length}</span>{" "}
                posts
              </span>
              <span className="text-slate-300">
                <span className="font-semibold text-white">{friendsCount}</span>{" "}
                friends
              </span>
              <span className="text-slate-300">
                <span className="font-semibold text-white">
                  {thoughts.length}
                </span>{" "}
                thoughts
              </span>
            </div>
          </div>
        </div>

        {user.bio ? (
          <p className="mt-4 text-slate-300">{user.bio}</p>
        ) : null}

        {user.createdAt ? (
          <p className="mt-4 text-sm text-slate-500">
            Joined {formatDate(user.createdAt)}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            aria-pressed={activeTab === "posts"}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              activeTab === "posts"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("thoughts")}
            aria-pressed={activeTab === "thoughts"}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              activeTab === "thoughts"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Thoughts ({thoughts.length})
          </button>
        </div>

        {activeTab === "posts" ? (
          posts.length === 0 ? (
            <p className="text-slate-500">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {posts.map((post) => {
                const cover = post.photos?.length
                  ? resolveMediaUrl(
                      post.photos
                        .slice()
                        .sort((a, b) => a.position - b.position)[0].url
                    )
                  : null;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-left"
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:opacity-80"
                      />
                    ) : (
                      <span className="line-clamp-5 block h-full w-full p-2 text-xs text-slate-300">
                        {post.text}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : thoughts.length === 0 ? (
          <p className="text-slate-500">No thoughts yet.</p>
        ) : (
          <div className="space-y-4">
            {thoughts.map((thought) => (
              <article
                key={thought.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="whitespace-pre-wrap text-slate-200">
                  {thought.text}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">
                    {thought.type}
                  </span>
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">
                    {thought.visibility}
                  </span>
                  <span>{formatDate(thought.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Friends</h2>
        {friends.length === 0 ? (
          <p className="text-slate-500">No friends yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {friends.map((friend) => {
              const friendAvatar = resolveMediaUrl(friend.profilePictureUrl);
              return (
                <div
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
                  <span className="truncate text-slate-200">
                    @{friend.username}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedPost ? (
        <PostModal
          post={selectedPost}
          author={{
            name: user.name,
            username: user.username,
            profilePictureUrl: user.profilePictureUrl,
          }}
          onClose={() => setSelectedPost(null)}
        />
      ) : null}
    </div>
  );
}
