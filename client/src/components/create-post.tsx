"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { postApi } from "@/lib/api/post";

const MAX_PHOTOS = 6;
const MAX_TEXT = 500;

export function CreatePost() {
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const isEmpty = !text.trim() && photos.length === 0;

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    setError(null);
    setSuccess(null);

    // Allow selecting the same file again
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isEmpty) {
      setError("Write something or add a photo before publishing.");
      return;
    }

    try {
      setLoading(true);

      await postApi.create({
        text,
        photos,
      });

      setText("");
      setPhotos([]);
      setSuccess("Your post has been published.");
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(
        err instanceof Error ? err.message : "Failed to publish post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      <form
        onSubmit={handleSubmit}
        className="glass w-full space-y-5 rounded-3xl bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40 md:p-8"
      >
        <div className="space-y-1">
          <h2 className="heading-font text-2xl font-semibold text-white">
            Create post
          </h2>
          <p className="text-sm text-slate-300">
            Share what&apos;s on your mind with your friends.
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            rows={6}
            value={text}
            onFocus={() => {
              setError(null);
              setSuccess(null);
            }}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="What's happening?"
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
          />
          <div className="flex justify-end text-xs text-slate-500">
            {text.length}/{MAX_TEXT}
          </div>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-white/10"
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
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white opacity-0 transition hover:bg-rose-500 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={18} />
            Add photos
          </button>

          <span className="text-sm text-slate-400">
            {photos.length}/{MAX_PHOTOS} photos
          </span>
        </div>

        <input
          ref={inputRef}
          hidden
          multiple
          accept="image/*"
          type="file"
          onChange={handleFiles}
        />

        {error ? (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || isEmpty}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish post"}
        </button>
      </form>
    </div>
  );
}
