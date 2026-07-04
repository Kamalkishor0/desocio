"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { postApi } from "@/lib/api/post";

export function CreatePost() {
  console.log("CreatePost rendered");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    setPhotos((prev) => [...prev, ...files].slice(0, 6));

    // Allow selecting the same file again
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Submitting...");

    if (!text.trim() && photos.length === 0) {
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
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-5 text-xl font-semibold text-white">
        Create Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl border border-slate-700"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt=""
                  className="h-40 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-red-500"
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
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:bg-slate-800"
          >
            <ImagePlus size={18} />
            Add Photos
          </button>

          <span className="text-sm text-slate-500">
            {photos.length}/6 photos
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}