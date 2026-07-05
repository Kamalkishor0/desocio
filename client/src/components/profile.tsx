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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function initialFor(user: AuthUser): string {
  const source = user.name || user.username || "?";
  return source.charAt(0).toUpperCase();
}

export function Profile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white">
              {user.name}
            </h1>
            <p className="text-slate-400">@{user.username}</p>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
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
        <h2 className="mb-4 text-xl font-semibold text-white">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-slate-500">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                {post.text ? (
                  <p className="whitespace-pre-wrap text-slate-200">
                    {post.text}
                  </p>
                ) : null}

                {post.photos && post.photos.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {post.photos
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((photo) => (
                        <img
                          key={photo.id}
                          src={resolveMediaUrl(photo.url) ?? undefined}
                          alt=""
                          className="h-40 w-full rounded-lg border border-slate-800 object-cover"
                        />
                      ))}
                  </div>
                ) : null}

                <p className="mt-3 text-xs text-slate-500">
                  {formatDate(post.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Thoughts</h2>
        {thoughts.length === 0 ? (
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
    </div>
  );
}
