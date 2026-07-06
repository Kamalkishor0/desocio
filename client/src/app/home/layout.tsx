"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { AuthUser } from "@/types/auth";
import { AuthProvider } from "@/context/AuthContext";
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [booting, setBooting] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await api.me();

        if (!active) return;

        setUser(response.user);
      } catch {
        if (!active) return;

        router.replace("/");
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  if (booting || !user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl border border-white/10 bg-white/5 p-8">
          Loading feed...
        </div>
      </main>
    );
  }

  return (
    <AuthProvider user={user}>
      <main className="mx-auto max-w-5xl min-h-screen py-2 md:py-8">
        <div className="grid grid-cols-[4rem_1fr] md:grid-cols-[clamp(5rem,18vw,16rem)_1fr]">
          <aside
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            className="sticky top-2 md:top-8 flex h-[calc(100vh-1rem)] md:h-[calc(100vh-4rem)] w-full flex-col bg-gray-800"
        >
          <h1 className="heading-font mb-6 hidden px-4 text-3xl font-extrabold tracking-tight text-white md:block">
            DeSocio
          </h1>

          <Sidebar expanded={expanded} />
        </aside>

        <section className="slim-scrollbar h-[calc(100vh-1rem)] overflow-y-auto bg-red-900 md:h-[calc(100vh-4rem)]">
          {children}
        </section>
      </div>
    </main>
    </AuthProvider> 
  );
}