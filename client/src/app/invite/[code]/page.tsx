"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiResponseError, api, type InviteProfile } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const [profile, setProfile] = useState<InviteProfile | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    params.then(({ code }) => api.get(code)).then((response) => {
      if (!active) return;
      if (response.authenticated) {
        router.replace(`/home/profile/${response.profile.username}`);
      } else {
        setProfile(response.profile);
      }
    }).catch((error) => {
      if (!active) return;
      if (error instanceof ApiResponseError && error.status === 404) {
        router.replace("/");
      } else {
        setMissing(true);
      }
    });
    return () => { active = false; };
  }, [params, router]);

  if (missing) {
    return <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">Invite not found.</main>;
  }

  if (!profile) {
    return <main className="flex min-h-screen items-center justify-center bg-black p-6 text-gray-400">Loading invite...</main>;
  }

  const avatarUrl = resolveMediaUrl(profile.profilePictureUrl);
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/40">
        {avatarUrl ? <img src={avatarUrl} alt={profile.name} className="mx-auto h-24 w-24 rounded-full object-cover" /> : <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-semibold text-black">{profile.name.charAt(0).toUpperCase()}</div>}
        <h1 className="mt-5 text-2xl font-semibold">{profile.name}</h1>
        <p className="mt-1 text-gray-400">@{profile.username}</p>
        <p className="mt-5 text-gray-300">{profile.name} has invited you on DeSocio. Accept their friend request.</p>
        {profile.bio ? <p className="mt-5 text-gray-300">{profile.bio}</p> : null}
        <p className="mt-4 text-sm text-gray-400">{profile.friendsCount} friends on DeSocio</p>
        <button type="button" onClick={() => router.push("/")} className="mt-7 w-full rounded-2xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-gray-200">Join DeSocio</button>
      </section>
    </main>
  );
}