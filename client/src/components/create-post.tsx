"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { postApi } from "@/lib/api/post";
import { thoughtApi } from "@/lib/api/thought";
import type { ThoughtType, ThoughtVisibility } from "@/lib/api/thought";

type Mode = "post" | "thought";

const MAX_PHOTOS = 6;
const POST_MAX_TEXT = 2000;
const THOUGHT_MAX_TEXT = 1000;

const THOUGHT_TYPES: { value: ThoughtType; label: string }[] = [
  { value: "thoughts", label: "Thoughts" },
  { value: "recommendations", label: "Recommendations" },
  { value: "ideas", label: "Ideas" },
  { value: "discussions", label: "Discussions" },
];

const THOUGHT_VISIBILITIES: { value: ThoughtVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export function CreatePost() {
  const [mode, setMode] = useState<Mode>("post");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [thoughtType, setThoughtType] = useState<ThoughtType>("thoughts");
  const [visibility, setVisibility] = useState<ThoughtVisibility>("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const maxText = mode === "post" ? POST_MAX_TEXT : THOUGHT_MAX_TEXT;
  const isEmpty =
    mode === "post" ? !text.trim() && photos.length === 0 : !text.trim();

  function clearFeedback() {
    setError(null);
    setSuccess(null);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    clearFeedback();
    setText((prev) => prev.slice(0, next === "post" ? POST_MAX_TEXT : THOUGHT_MAX_TEXT));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    clearFeedback();
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();

    if (isEmpty) {
      setError(
        mode === "post"
          ? "Write something or add a photo before publishing."
          : "Write something before sharing your thought."
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === "post") {
        await postApi.create({ text, photos });
        setPhotos([]);
        setSuccess("Your post has been published.");
      } else {
        await thoughtApi.create({ text: text.trim(), type: thoughtType, visibility });
        setSuccess("Your thought has been shared.");
      }

      setText("");
    } catch (err) {
      console.error(`Failed to create ${mode}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${mode === "post" ? "publish post" : "share thought"}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      <form
        onSubmit={handleSubmit}
        className="glass w-full space-y-5 rounded-3xl border border-gray-700 bg-[#080809] p-6 shadow-2xl shadow-black/40 md:p-8"
      >
        <div className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-[#080809] p-1 text-sm">
          <button
            type="button"
            onClick={() => switchMode("post")}
            aria-pressed={mode === "post"}
            className={`rounded-full px-4 py-2 transition ${
              mode === "post" ? "bg-white text-[#080809]" : "text-gray-300"
            }`}
          >
            Post
          </button>
          <button
            type="button"
            onClick={() => switchMode("thought")}
            aria-pressed={mode === "thought"}
            className={`rounded-full px-4 py-2 transition ${
              mode === "thought" ? "bg-white text-[#080809]" : "text-gray-300"
            }`}
          >
            Thought
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="heading-font text-2xl font-semibold text-white">
            {mode === "post" ? "Create post" : "Share a thought"}
          </h2>
          <p className="text-sm text-gray-300">
            {mode === "post"
              ? "Share what's on your mind, with photos if you like."
              : "Post a quick text thought and choose who can see it."}
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            rows={6}
            value={text}
            onFocus={clearFeedback}
            onChange={(e) => setText(e.target.value.slice(0, maxText))}
            placeholder={mode === "post" ? "What's happening?" : "What's on your mind?"}
            className="w-full resize-none rounded-2xl border border-gray-700 bg-[#080809] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500"
          />
          <div className="flex justify-end text-xs text-gray-500">
            {text.length}/{maxText}
          </div>
        </div>

        {mode === "post" && photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-700"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt=""
                  className="h-32 w-full object-cover"
                />

                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 rounded-full bg-[#080809] p-1 text-white opacity-0 transition hover:bg-gray-700 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {mode === "post" ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-[#080809] px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus size={18} />
              Add photos
            </button>

            <span className="text-sm text-gray-400">
              {photos.length}/{MAX_PHOTOS} photos
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm text-gray-200">
              <span>Type</span>
              <select
                value={thoughtType}
                onChange={(e) => setThoughtType(e.target.value as ThoughtType)}
                className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition focus:border-gray-500"
              >
                {THOUGHT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-gray-200">
              <span>Visibility</span>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ThoughtVisibility)}
                className="w-full rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-white outline-none transition focus:border-gray-500"
              >
                {THOUGHT_VISIBILITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <input
          ref={inputRef}
          hidden
          multiple
          accept="image/*"
          type="file"
          onChange={handleFiles}
        />

        {error ? (
          <p className="rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-sm text-gray-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-2xl border border-gray-700 bg-[#080809] px-4 py-3 text-sm text-gray-200">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || isEmpty}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#080809] transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? mode === "post"
              ? "Publishing..."
              : "Sharing..."
            : mode === "post"
              ? "Publish post"
              : "Share thought"}
        </button>
      </form>
    </div>
  );
}
