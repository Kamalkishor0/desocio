"use client";

import { useEffect, useState } from "react";
import { Hand, Heart, Laugh, Send, X } from "lucide-react";
import { postApi } from "@/lib/api/post";
import type { FeedPost } from "@/lib/api/feed";
import type { PostComment } from "@/lib/api/post";
import type { PostReactionType } from "@/types/post";
import { formatDate, resolveMediaUrl } from "@/lib/media";

type PostAuthor = {
  name?: string;
  username: string;
  profilePictureUrl?: string | null;
};

type PostModalProps = {
  post: FeedPost;
  author: PostAuthor;
  onClose: () => void;
};

const REACTIONS: Array<{
  type: PostReactionType;
  label: string;
  Icon: typeof Heart;
}> = [
  { type: "heart", label: "Heart", Icon: Heart },
  { type: "clap", label: "Clap", Icon: Hand },
  { type: "laugh", label: "Laugh", Icon: Laugh },
];

export function PostModal({ post, author, onClose }: PostModalProps) {
  const [reaction, setReaction] = useState<PostReactionType | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const photos = post.photos
    ? post.photos.slice().sort((a, b) => a.position - b.position)
    : [];
  const avatarUrl = resolveMediaUrl(author.profilePictureUrl);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [reactionState, commentList] = await Promise.all([
          postApi.getReaction(post.id),
          postApi.getComments(post.id),
        ]);
        if (!active) {
          return;
        }
        setReaction(reactionState.reaction);
        setComments(commentList);
      } catch (error) {
        console.error("Failed to load post details:", error);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [post.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function toggleReaction(type: PostReactionType) {
    const previous = reaction;
    setReaction((current) => (current === type ? null : type));
    try {
      await postApi.react(post.id, type);
      const next = await postApi.getReaction(post.id);
      setReaction(next.reaction);
    } catch (error) {
      console.error("Failed to react:", error);
      setReaction(previous);
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || submitting) {
      return;
    }
    try {
      setSubmitting(true);
      await postApi.comment(post.id, text);
      const list = await postApi.getComments(post.id);
      setComments(list);
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center bg-slate-950 md:w-1/2">
          {photos.length > 0 ? (
            <div className="max-h-[45vh] w-full overflow-y-auto md:max-h-[90vh]">
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={resolveMediaUrl(photo.url) ?? undefined}
                  alt=""
                  className="w-full object-contain"
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] w-full items-center justify-center p-8 text-center text-lg text-slate-200">
              {post.text}
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:w-1/2">
          <div className="flex items-center justify-between border-b border-slate-800 p-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={author.username}
                  className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-white">
                  {author.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-white">@{author.username}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {photos.length > 0 && post.text ? (
              <p className="mb-4 whitespace-pre-wrap text-slate-200">
                {post.text}
              </p>
            ) : null}

            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment) => (
                  <li key={comment.id} className="text-sm text-slate-200">
                    <p className="whitespace-pre-wrap">{comment.text}</p>
                    <span className="text-xs text-slate-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-2">
              {REACTIONS.map(({ type, label, Icon }) => {
                const active = reaction === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-label={label}
                    aria-pressed={active}
                    onClick={() => toggleReaction(type)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {formatDate(post.createdAt)}
            </p>

            <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                aria-label="Post comment"
                className="rounded-xl bg-blue-600 p-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
