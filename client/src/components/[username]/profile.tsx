"use client";

import { useEffect, useState } from "react";
import { api , request } from "@/lib/api";
import type { AuthUser } from "@/types/auth";
import type { FeedPost } from "@/lib/api/feed";
import type { Thought } from "@/lib/api/thought";
import { formatDate, resolveMediaUrl } from "@/lib/media";
import { PostModal } from "@/components/post-modal";

function initialFor(user: AuthUser): string {
  const source = user.name || user.username || "?";
  return source.charAt(0).toUpperCase();
}

export function Profile({ username }: { username: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
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
      const profile = await api.getProfileByUsername(username);

      if (!active) return;

      setUser(profile.user);
      setPosts(Array.isArray(profile.posts) ? profile.posts : []);
      setThoughts(Array.isArray(profile.thoughts) ? profile.thoughts : []);
      setFriendsCount(profile.friendsCount ?? 0);
    } catch (err) {
      if (!active) return;

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
}, [username]);

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
      <section className="glass rounded-3xl bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40 md:p-8">
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
            OG since {formatDate(user.createdAt)}
          </p>
        ) : null}
      </section>

      <section className="glass rounded-3xl bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40 md:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 mb-4 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            aria-pressed={activeTab === "posts"}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "posts"
                ? "bg-white text-slate-950" : "text-slate-300"
            }`}
          >
            Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("thoughts")}
            aria-pressed={activeTab === "thoughts"}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "thoughts"
                ? "bg-white text-slate-950" : "text-slate-300"
            }`}
          >
            Thoughts
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
