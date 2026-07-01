"use client";

import { api, FeedPost } from "@/lib/api";
import { useEffect, useState } from "react";

type Props = {
  refreshKey: number;
};

export function FeedBoard({ refreshKey }: Props) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .feed({ limit: 6 })
      .then((response) => {
        if (!active) {
          return;
        }
        setPosts(response.data);
        setNextCursor(response.nextCursor);
        setHasMore(Boolean(response.nextCursor));
      })
      .catch((error_) => {
        if (!active) {
          return;
        }
        setError(error_ instanceof Error ? error_.message : "Could not load feed");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  async function loadMore() {
    if (!nextCursor) {
      return;
    }

    setLoadingMore(true);
    try {
      const response = await api.feed({ cursor: nextCursor, limit: 6 });
      setPosts((current) => [...current, ...response.data]);
      setNextCursor(response.nextCursor);
      setHasMore(Boolean(response.nextCursor));
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Could not load more posts");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="glass rounded-[2rem] p-6 shadow-glow">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Private feed</p>
          <h2 className="heading-font mt-2 text-2xl font-semibold text-white">What your circle is sharing</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {posts.length} loaded
        </div>
      </div>

      {loading ? <FeedSkeleton /> : null}
      {error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-center text-slate-300">
              No private posts yet. Once friends start posting, they will appear here.
            </div>
          ) : null}

          {posts.map((post, index) => (
            <article
              key={post.id}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-emerald-400/30"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">@{post.author.username}</p>
                  <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                  {post.visibility}
                </span>
              </div>

              {post.text ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">{post.text}</p> : null}

              {post.photos.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {post.photos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                      <img src={photo.url} alt="Post attachment" className="h-44 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          {hasMore ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? "Loading more..." : "Load more"}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-white/10" />
          <div className="mt-4 h-40 rounded-2xl bg-white/10" />
        </div>
      ))}
    </div>
  );
}