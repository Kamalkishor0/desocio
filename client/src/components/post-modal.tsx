"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Hand, Heart, Laugh, Send, X } from "lucide-react";
import { postApi } from "@/lib/api/post";
import type { FeedPost } from "@/lib/api/feed";
import type { PostComment } from "@/lib/api/post";
import type { PostReactionType } from "@/types/post";
import { formatDate, resolveMediaUrl } from "@/lib/media";

type PostAuthor = {
  name : string;
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
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(
    null
  );
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = post.photos
    ? post.photos.slice().sort((a, b) => a.position - b.position)
    : [];
  const avatarUrl = resolveMediaUrl(author.profilePictureUrl);

  useEffect(() => {
    setPhotoIndex(0);
  }, [post.id]);

  function showPrevPhoto() {
    setPhotoIndex((current) =>
      current === 0 ? photos.length - 1 : current - 1
    );
  }

  function showNextPhoto() {
    setPhotoIndex((current) =>
      current === photos.length - 1 ? 0 : current + 1
    );
  }

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

  async function fetchReaction() {
    try {
      const next = await postApi.getReaction(post.id);
      setReaction(next.reaction);
    } catch (error) {
      console.error("Failed to fetch reaction:", error);
    }
  }

  async function toggleReaction(type: PostReactionType) {
    const previous = reaction;
    setReaction((current) => (current === type ? null : type));
    try {
      const result = await postApi.react(post.id, type);
      setReaction(result.reaction);
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
      await postApi.comment(post.id, text, replyTo?.id);
      const list = await postApi.getComments(post.id);
      setComments(list);
      setCommentText("");
      setReplyTo(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function startReply(comment: PostComment) {
    setReplyTo({ id: comment.id, username: comment.author.username });
    commentInputRef.current?.focus();
  }

  function renderComment(
    comment: PostComment,
    isReply: boolean,
    replyingTo?: string
  ) {
    const commentAvatar = resolveMediaUrl(comment.author.profilePictureUrl);
    return (
      <li key={comment.id} className={isReply ? "ml-10" : undefined}>
        <div className="flex gap-3">
          {commentAvatar ? (
            <img
              src={commentAvatar}
              alt={comment.author.username}
              className="h-7 w-7 shrink-0 rounded-full border border-slate-700 object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold text-white">
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-200">
              <span className="font-semibold text-white">
                @{comment.author.username}
              </span>{" "}
              {replyingTo ? (
                <span className="font-medium text-blue-400">
                  @{replyingTo}
                </span>
              ) : null}{" "}
              <span className="whitespace-pre-wrap">{comment.text}</span>
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span>{formatDate(comment.createdAt)}</span>
              <button
                type="button"
                onClick={() => startReply(comment)}
                className="font-medium text-slate-400 transition hover:text-white"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {comment.replies.map((reply) =>
              renderComment(reply, true, comment.author.username)
            )}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex items-center justify-center bg-slate-950 md:w-1/2">
          {photos.length > 0 ? (
            <div className="flex h-full max-h-[45vh] w-full items-center justify-center md:max-h-[90vh]">
              <img
                key={photos[photoIndex].id}
                src={resolveMediaUrl(photos[photoIndex].url) ?? undefined}
                alt=""
                className="max-h-[45vh] w-full object-contain md:max-h-[90vh]"
              />

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevPhoto}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextPhoto}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                    {photoIndex + 1}/{photos.length}
                  </div>

                  <div className="absolute bottom-3 right-3 flex gap-1.5">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setPhotoIndex(index)}
                        aria-label={`Go to photo ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          index === photoIndex
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[200px] w-full items-center justify-center p-8 text-center text-lg text-slate-200">
              {post.text}
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:w-1/2">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 p-4">
            <div className="flex min-w-0 gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={author.username}
                  className="h-9 w-9 shrink-0 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-white">
                  {author.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 text-sm text-slate-200">
                <p className="font-semibold text-white">@{author.username}</p>
                {photos.length > 0 && post.text ? (
                  <p className="mt-0.5 whitespace-pre-wrap text-slate-200">
                    {post.text}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="slim-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((comment) => renderComment(comment, false))}
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

            {replyTo ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
                <span>
                  Replying to{" "}
                  <span className="font-medium text-white">
                    @{replyTo.username}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  aria-label="Cancel reply"
                  className="text-slate-400 transition hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}

            <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={
                  replyTo ? `Reply to @${replyTo.username}...` : "Add a comment..."
                }
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
