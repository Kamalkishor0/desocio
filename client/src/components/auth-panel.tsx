"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Mode = "login" | "register";

type Props = {
  onAuthed: () => void;
};

export function AuthPanel({ onAuthed }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [googlePending, setGooglePending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "google" && params.get("step") === "complete") {
      setGooglePending(true);
      setMode("register");
      setRegisterStep(2);
      setError(null);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "register") {
        if (googlePending) {
          if (!name.trim() || !username.trim()) {
            setError("Name and username are required");
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
          if (!password.trim() || !confirmPassword.trim()) {
            setError("Password and confirm password are required");
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
          if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
          }
          await api.googleComplete({ name, username, password, confirmPassword });
          setGooglePending(false);
          setName("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          onAuthed();
          return;
        }
        return;
      } else {
        await api.login({ userOrEmail: userOrEmail || "", password });
        onAuthed();
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass w-full max-w-md space-y-5 rounded-3xl border border-gray-700 bg-[#080809] p-8 shadow-2xl shadow-black/40">
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-[#080809] p-1 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setRegisterStep(1);
            setError(null);
          }}
          className={`rounded-full px-4 py-2 transition ${mode === "login" ? "bg-white text-[#080809]" : "text-gray-300"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setRegisterStep(1);
            setError(null);
          }}
          className={`rounded-full px-4 py-2 transition ${mode === "register" ? "bg-white text-[#080809]" : "text-gray-300"}`}
        >
          Create account
        </button>
      </div>

      <div className="space-y-1">
        <h2 className="heading-font text-2xl font-semibold text-white">
          {mode === "login" ? "Welcome back" : googlePending ? "Finish your Google signup" : "Create your account"}
        </h2>
        <p className="text-sm text-gray-300">
          {mode === "login"
            ? "Use your email or username."
            : googlePending
              ? "Add your profile details and set a password for future email sign-in."
              : ""}
        </p>
      </div>

      <div className="space-y-3">

        {mode === "login" && (
          <>
            <label className="block space-y-2 text-sm text-gray-200">
              <span>Username or email</span>
              <input
                value={userOrEmail}
                onFocus={() => setError(null)}
                onChange={(event) => setUserOrEmail(event.target.value)}
                type="text"
                placeholder="username"
                className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500"
              />
            </label>

            <label className="block space-y-2 text-sm text-gray-200">
              <span>Password</span>
              <input
                value={password}
                onFocus={() => setError(null)}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-700 bg-[#080809]
                 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500"
              />
            </label>
          </>
        )}
        {mode === "register" && googlePending && (
          <>
            <label className="block space-y-2 text-sm text-gray-200">
              <span>Name</span>
              <input value={name} onFocus={() => setError(null)} onChange={(event) => setName(event.target.value)} type="text" placeholder="Your name" className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500" />
            </label>
            <label className="block space-y-2 text-sm text-gray-200">
              <span>Username</span>
              <input value={username} onFocus={() => setError(null)} onChange={(event) => setUsername(event.target.value)} type="text" placeholder="username" className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500" />
            </label>
            <label className="block space-y-2 text-sm text-gray-200">
              <span>Password</span>
              <input value={password} onFocus={() => setError(null)} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500" />
            </label>
            <label className="block space-y-2 text-sm text-gray-200">
              <span>Confirm password</span>
              <input value={confirmPassword} onFocus={() => setError(null)} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="••••••••" className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500" />
            </label>
          </>
        )}
      </div>

      {error ? <p className="rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-sm text-gray-200">{error}</p> : null}
      {notice ? <p className="rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-sm text-gray-200">{notice}</p> : null}

      {mode === "register" && googlePending ? (
        <button type="button" onClick={() => {
          setGooglePending(false);
          setMode("register");
          setRegisterStep(1);
          setName("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setError(null);
        }} className="w-full text-sm text-gray-400 transition hover:text-white">
          Back
        </button>
      ) : null}
      <button
        type={mode === "register" && !googlePending ? "button" : "submit"}
        disabled={loading}
        onClick={() => {
          if (mode === "register" && !googlePending) {
            window.location.href = api.googleUrl();
          }
        }}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#080809] transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Working..." : mode === "login" ? "Sign in" : googlePending ? "Create account" : "Continue with Google"}
      </button>
      {mode === "login" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            window.location.href = api.googleUrl();
          }}
          className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Google
        </button>
      ) : null}
    </form>
  );
}