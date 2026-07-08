"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { feedApi, FeedPost } from "@/lib/api/feed";
import { FeedPostCard } from "@/components/feed-post-card";

export function FeedBoard() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);

      const response = await feedApi.feed({
        limit: 10,
      });

      setPosts(response.data);
      setNextCursor(response.nextCursor);
      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (!nextCursor) return;

    try {
      setLoadingMore(true);

      const response = await feedApi.feed({
        cursor: nextCursor,
        limit: 10,
      });

      setPosts((current) => [...current, ...response.data]);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor]);

  useEffect(() => {
    const node = loaderRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        loadMore();
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-slate-800" />

              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-slate-800" />
                <div className="h-3 w-20 rounded bg-slate-800" />
              </div>
            </div>

            <div className="mb-4 h-5 w-2/3 rounded bg-slate-800" />

            <div className="aspect-square rounded-xl bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (hasLoaded && posts.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold text-white">
          Your feed is empty
        </h2>

        <p className="mt-3 max-w-md text-slate-400">
          Add friends and ask them to share posts. Once they do,
          they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-6">

      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
        />
      ))}

      <div
        ref={loaderRef}
        className="flex justify-center py-8"
      >
        {loadingMore && (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        )}
      </div>

    </div>
  );
}