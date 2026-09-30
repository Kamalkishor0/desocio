"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, ExternalLink, KeyRound, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block space-y-2 text-sm text-gray-300">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2.5 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-300" />
    </label>
  );
}

export function SettingsPanel() {
  const { user: initialUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>(initialUser!);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profilePictureUrl ?? "");
  const [showOnlineStatus, setShowOnlineStatus] = useState(user.showOnlineStatus ?? true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(null); setStatus(null);
    try {
      const response = await api.updateAccount({ name, username, bio, profilePictureUrl, showOnlineStatus });
      setUser(response.user); setStatus("Profile updated");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update profile"); }
    finally { setSaving(false); }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(null); setStatus(null);
    try { await api.changePassword({ currentPassword, newPassword, confirmPassword }); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setStatus("Password changed"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not change password"); }
    finally { setSaving(false); }
  }

  async function logout() {
    await api.logout().catch(() => undefined);
    router.replace("/");
  }

  async function deleteAccount() {
    if (!deletePassword || !window.confirm("Delete your account permanently?")) return;
    setSaving(true); setError(null);
    try { await api.deleteAccount(deletePassword); router.replace("/"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete account"); setSaving(false); }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 md:p-8">
      <div className="flex items-end justify-between border-b border-white/10 pb-5">
        <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Your space</p><h1 className="heading-font mt-1 text-3xl font-semibold text-white">Settings</h1></div>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-white/30 hover:text-white"><LogOut size={16} /> Log out</button>
      </div>

      <form onSubmit={saveProfile} className="glass space-y-5 rounded-2xl bg-white/[0.03] p-5 md:p-6">
        <div><h2 className="text-lg font-semibold text-white">Account</h2><p className="mt-1 text-sm text-gray-400">Control how people find and know you.</p></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Name" value={name} onChange={setName} /><Field label="Username" value={username} onChange={setUsername} placeholder="your_handle" /></div>
        <Field label="Profile picture URL" value={profilePictureUrl} onChange={setProfilePictureUrl} placeholder="https://..." />
        <label className="block space-y-2 text-sm text-gray-300"><span>About me</span><textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} className="w-full resize-y rounded-xl border border-gray-700 bg-black/40 px-3 py-2.5 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-300" placeholder="A short introduction" /></label>
        <div className="flex justify-end"><button disabled={saving} className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-50">Save changes</button></div>
      </form>

      <section className="glass rounded-2xl bg-white/[0.03] p-5 md:p-6"><div className="flex items-start gap-3"><KeyRound className="mt-0.5 text-emerald-300" size={18} /><div><h2 className="text-lg font-semibold text-white">Change password</h2><p className="mt-1 text-sm text-gray-400">Use a strong password with uppercase, lowercase, and a number.</p></div></div>
        <form onSubmit={savePassword} className="mt-5 space-y-4"><div className="grid gap-4 md:grid-cols-3"><Field label="Current password" value={currentPassword} onChange={setCurrentPassword} type="password" /><Field label="New password" value={newPassword} onChange={setNewPassword} type="password" /><Field label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} type="password" /></div><div className="flex justify-end"><button disabled={saving} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 disabled:opacity-50">Change password</button></div></form>
      </section>

      <section className="glass rounded-2xl bg-white/[0.03] p-5 md:p-6"><h2 className="text-lg font-semibold text-white">Online status</h2><div className="mt-4 flex items-center justify-between gap-4"><div><p className="text-sm text-gray-200">Show when you are online</p><p className="mt-1 text-sm text-gray-500">When hidden, other people will not see your activity status.</p></div><button type="button" role="switch" aria-checked={showOnlineStatus} onClick={() => setShowOnlineStatus(!showOnlineStatus)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${showOnlineStatus ? "bg-emerald-300" : "bg-gray-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${showOnlineStatus ? "left-6" : "left-1"}`} /></button></div></section>

      <section className="glass rounded-2xl bg-white/[0.03] p-5 md:p-6"><h2 className="text-lg font-semibold text-white">About us</h2><p className="mt-1 text-sm text-gray-400">Meet the creator behind DeSocio.</p><div className="mt-3 divide-y divide-white/10 text-sm"><div className="flex items-center justify-between py-3 text-gray-300"><span>Creator</span><span className="text-gray-500">Kamalkishor Singh</span></div><a href="https://www.linkedin.com/in/kamalkishor-singh/" target="_blank" rel="noreferrer" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">LinkedIn <ExternalLink size={15} /></a><a href="https://x.com/kamalkishor_45" target="_blank" rel="noreferrer" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">X <ExternalLink size={15} /></a><a href="#" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">Version <span className="text-gray-500">0.1.0</span></a><a href="#" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">Terms of Service <ExternalLink size={15} /></a><a href="#" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">Privacy Policy <ExternalLink size={15} /></a><a href="#" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">Community Guidelines <ExternalLink size={15} /></a><a href="https://github.com/kamalkishor0/desocio" target="_blank" rel="noreferrer" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">Open-source / GitHub <Code2 size={15} /></a><a href="mailto:kamalkishorsingh999@gmail.com" className="flex items-center justify-between py-3 text-gray-300 hover:text-white">Contact / Report a problem <span className="text-gray-500">kamalkishorsingh999@gmail.com</span></a></div></section>

      <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-5 md:p-6"><div className="flex items-start gap-3"><Trash2 className="mt-0.5 text-red-300" size={18} /><div><h2 className="text-lg font-semibold text-white">Delete account</h2><p className="mt-1 text-sm text-gray-400">This disables your account and signs you out everywhere.</p></div></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} type="password" placeholder="Confirm with your password" className="min-w-0 flex-1 rounded-xl border border-red-400/20 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-red-300" /><button type="button" onClick={deleteAccount} disabled={saving || !deletePassword} className="rounded-xl bg-red-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-red-200 disabled:opacity-50">Delete account</button></div></section>

      {status ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-200">{status}</p> : null}
      {error ? <p className="rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <p className="text-xs text-gray-600">Signed in as {user.email}</p>
    </div>
  );
}
