"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

type Mode = "login" | "register";

type Props = {
  onAuthed: () => void;
};

export function AuthPanel({ onAuthed }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "register") {
        if (!email.trim() || !password.trim() || !username.trim() || !name.trim()) {
          setError("Fill all the entries");
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long");
          return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
          setError("Password must contain at least one uppercase letter, one lowercase letter and one number");
          return;
        }
        if (username.length < 3 || username.length > 32) {
          setError("Username must be between 3 and 32 characters long");
          return;
        }
        if (!/^[a-z0-9_]+$/.test(username)) {
          setError("Username can only contain lowercase letters, numbers and underscores");
          return;
        }
        await api.register({ email, password, username, name });
        setNotice("Account created. You can sign in now.");
        setMode("login");
      } else {
        await api.login({ userOrEmail: userOrEmail || undefined, password });
        onAuthed();
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass w-full max-w-md space-y-5 rounded-3xl bg-slate-900 p-8 shadow-2xl shadow-slate-800/60">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-4 py-2 transition ${mode === "login" ? "bg-white text-slate-950" : "text-slate-300"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-full px-4 py-2 transition ${mode === "register" ? "bg-white text-slate-950" : "text-slate-300"}`}
        >
          Create account
        </button>
      </div>

      <div className="space-y-1">
        <h2 className="heading-font text-2xl font-semibold text-white">
          {mode === "login" ? "Welcome back" : "Start a new account"}
        </h2>
        <p className="text-sm text-slate-300">
          {mode === "login"
            ? "Use your email or username."
            : "Create the account, then sign in with the same credentials."}
        </p>
      </div>

      <div className="space-y-3">

        {mode === "login" && (
          <>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Username or email</span>
              <input
                value={userOrEmail}
                onChange={(event) => setUserOrEmail(event.target.value)}
                type="text"
                placeholder="username"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-200">
              <span>Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
              />
            </label>
          </>
        )}
        {mode === "register" && (
          <>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@domain.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                placeholder="Your name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                type="text"
                placeholder="username"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
              />
            </label>
          </>
        )}
      </div>

      {error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      {notice ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{notice}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}