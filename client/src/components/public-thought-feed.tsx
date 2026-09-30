"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { thoughtApi, type PublicThought, type ThoughtType } from "@/lib/api/thought";
import { formatDate, resolveMediaUrl } from "@/lib/media";
import { PublicThoughtModal } from "@/components/public-thought-modal";
import { useAuth } from "@/context/AuthContext";
import { MoreVertical, Trash2 } from "lucide-react";

const THOUGHT_TYPES: { value: ThoughtType; label: string }[] = [
  { value: "thoughts", label: "Thoughts" },
  { value: "recommendations", label: "Recommendations" },
  { value: "ideas", label: "Ideas" },
  { value: "discussions", label: "Discussions" },
];

function initialFor(thought: PublicThought) {
  const source = thought.author.name || thought.author.username || "?";
  return source.charAt(0).toUpperCase();
}

export function PublicThoughtFeed() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<ThoughtType>("thoughts");
  const [thoughts, setThoughts] = useState<PublicThought[]>([]);
  const [selectedThought, setSelectedThought] = useState<PublicThought | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadThoughts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await thoughtApi.publicFeed({
        limit: 10,
        type: activeType,
      });

      setThoughts(response.data);
      setNextCursor(response.nextCursor);
      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to load public thoughts:", error);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    loadThoughts();
  }, [loadThoughts]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (!nextCursor) return;

    try {
      setLoadingMore(true);

      const response = await thoughtApi.publicFeed({
        cursor: nextCursor,
        limit: 10,
        type: activeType,
      });

      setThoughts((current) => [...current, ...response.data]);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error("Failed to load more public thoughts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [activeType, loadingMore, nextCursor]);

  async function handleDelete(thoughtId: string) {
    if (deletingId) return;

    setDeletingId(thoughtId);
    try {
      await thoughtApi.delete(thoughtId);
      setThoughts((current) => current.filter((thought) => thought.id !== thoughtId));
      setSelectedThought((current) => current?.id === thoughtId ? null : current);
    } catch (error) {
      console.error("Failed to delete thought:", error);
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-[#080809] p-1 text-sm">
        {THOUGHT_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveType(value)}
            aria-pressed={activeType === value}
            className={`rounded-full px-4 py-2 transition ${activeType === value
              ? "bg-white text-[#080809]"
              : "text-gray-300"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-gray-700 bg-[#080809] p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-[#080809]" />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-[#080809]" />
                  <div className="h-3 w-20 rounded bg-[#080809]" />
                </div>
              </div>
              <div className="h-4 w-2/3 rounded bg-[#080809]" />
            </div>
          ))}
        </div>
      ) : hasLoaded && thoughts.length === 0 ? (
        <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-gray-700 bg-[#080809] p-8 text-center text-gray-300">
          No public {activeType} yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {thoughts.map((thought) => {
            const avatar = resolveMediaUrl(thought.author.profilePictureUrl);

            const isOwner = user?.id === thought.author.id;

            return (
              <div
                key={thought.id}
                className="block w-full rounded-2xl border border-gray-700 bg-[#080809] p-5 text-left transition hover:border-gray-600 hover:bg-[#080809]"
              >
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={thought.author.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#080809] font-semibold text-white">
                      {initialFor(thought)}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedThought(thought)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold text-white">
                      {thought.author.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="truncate">@{thought.author.username}</span>
                      <span>•</span>
                      <span className="text-xs">{formatDate(thought.createdAt)}</span>
                    </div>
                  </button>

                  <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
                    {thought.type}
                  </span>

                  {isOwner ? (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label="Thought options"
                        aria-expanded={openMenuId === thought.id}
                        onClick={() => setOpenMenuId((current) => current === thought.id ? null : thought.id)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === thought.id ? (
                        <div className="absolute right-0 top-10 z-10 min-w-32 rounded-xl border border-gray-700 bg-[#111113] p-1 shadow-xl">
                          <button
                            type="button"
                            disabled={deletingId === thought.id}
                            onClick={() => handleDelete(thought.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            {deletingId === thought.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedThought(thought)}
                  className="mt-4 block w-full whitespace-pre-wrap text-left text-gray-200"
                >
                  {thought.text}
                </button>
              </div>
            );
          })}

          <div ref={loaderRef} className="flex justify-center py-6">
            {loadingMore && (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
            )}
          </div>
        </div>
      )}

      {selectedThought ? (
        <PublicThoughtModal
          thought={selectedThought}
          onClose={() => setSelectedThought(null)}
        />
      ) : null}
    </div>
  );
}