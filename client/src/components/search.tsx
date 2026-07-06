"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { NotFound } from "@/components/not-found";
import type { SearchUser } from "@/lib/api/profile";
import { useDebounce } from "@/hooks/use-debounce";
import { useRef } from "react";

export function Search() {
  const router = useRouter();

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const debouncedUsername = useDebounce(username, 350);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || users.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setHighlightedIndex((current) =>
          current === users.length - 1 ? 0 : current + 1
        );

        break;

      case "ArrowUp":
        event.preventDefault();

        setHighlightedIndex((current) =>
          current <= 0 ? users.length - 1 : current - 1
        );

        break;

      case "Escape":
        setOpen(false);
        break;

      case "Enter":
        event.preventDefault();

        if (highlightedIndex >= 0) {
          router.push(
            `/home/profile/${users[highlightedIndex].username}`
          );
        }

        break;
    }
  }
  useEffect(() => {
    async function search() {
      const trimmed = debouncedUsername.trim();

      if (!trimmed) {
        setUsers([]);
        setSearched(false);
        setOpen(false);
        return;
      }

      setLoading(true);

      try {
        const result = await api.getSearchResult(trimmed);

        setUsers(result.users);
        setOpen(true);
        setSearched(true);
      } catch (err) {
        console.error(err);
        setUsers([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [debouncedUsername]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (users.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [users]);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto mt-8 w-full max-w-2xl px-4"
    >
      <div className="relative">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Search by username..."
          autoComplete="off"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          className="h-12 w-full rounded-full border border-slate-700 bg-slate-800 pl-5 pr-14 text-sm text-white placeholder:text-slate-500 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-600"
        />

        <SearchIcon
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {loading && (
        <p className="mt-6 text-center text-slate-400">
          Searching...
        </p>
      )}

      {!loading && searched && users.length === 0 && (
        <div className="mt-6">
          <NotFound
            title="User not found"
            description={`We couldn't find anyone matching "${username}".`}
          />
        </div>
      )}

      {open && (
        <div className="absolute left-4 right-4 top-14 z-50 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

          {!loading &&
            users.map((user, index) => {
              const avatar = resolveMediaUrl(user.profilePictureUrl);

              return (
                <button
                  onMouseEnter={() => setHighlightedIndex(index)}
                  key={user.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/home/profile/${user.username}`);
                  }}
                  className={`flex w-full items-center gap-4 border-b border-slate-800 p-4 text-left transition last:border-none ${highlightedIndex === index
                    ? "bg-slate-800"
                    : "hover:bg-slate-800"
                    }`}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={user.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700 font-semibold text-white">
                      {(user.name || user.username)[0].toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {user.name}
                    </p>

                    <p className="truncate text-sm text-slate-400">
                      @{user.username}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}