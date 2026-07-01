"use client";

import { FeedBoard } from "@/components/feed-board";
import { api, AuthUser } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .me()
      .then((response) => {
        if (!active) {
          return;
        }
        setUser(response.user);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        router.replace("/");
      })
      .finally(() => {
        if (active) {
          setBooting(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await api.logout();
    } finally {
      router.replace("/");
      setLoggingOut(false);
    }
  }

  if (booting) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl border border-white/10 bg-white/5 p-8">
          Loading feed...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">DeSocio</p>
            <h1 className="heading-font mt-2 text-2xl font-semibold text-white">Welcome, @{user?.username}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <FeedBoard refreshKey={refreshKey} />
      </div>
    </main>
  );
}
