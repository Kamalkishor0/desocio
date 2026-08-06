"use client";

import { Send, Bookmark, MessageCircle, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { thoughtApi, type PublicThought, type ThoughtComment } from "@/lib/api/thought";
import { formatDate, resolveMediaUrl } from "@/lib/media";

type Props = {
  thought: PublicThought;
  onClose: () => void;
};

function initialFor(thought: PublicThought) {
  const source = thought.author.name || thought.author.username || "?";
  return source.charAt(0).toUpperCase();
}

export function PublicThoughtModal({ thought, onClose }: Props) {
  const { user } = useAuth();
  const [currentThought, setCurrentThought] = useState(thought);
  const [comments, setComments] = useState<ThoughtComment[]>([]);
  const [supportCount, setSupportCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingSupport, setTogglingSupport] = useState(false);
  const [togglingSave, setTogglingSave] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = resolveMediaUrl(currentThought.author.profilePictureUrl);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);

        const [thoughtResponse, commentResponse, supporterResponse, saverResponse] = await Promise.all([
          thoughtApi.getById(thought.id),
          thoughtApi.getComments(thought.id, { limit: 50 }),
          thoughtApi.getSupporters(thought.id, { limit: 50 }),
          thoughtApi.getSavers(thought.id, { limit: 50 }),
        ]);

        if (!active) {
          return;
        }

        setCurrentThought(thoughtResponse);
        setComments(commentResponse.data);
        setSupportCount(supporterResponse.total);
        setSaveCount(saverResponse.total);
        setIsSupported(Boolean(user?.id && supporterResponse.data.some((entry) => entry.user.id === user.id)));
        setIsSaved(Boolean(user?.id && saverResponse.data.some((entry) => entry.user.id === user.id)));
      } catch (error) {
        console.error("Failed to load thought details:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [thought.id, user?.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function refreshComments() {
    const response = await thoughtApi.getComments(currentThought.id, { limit: 50 });
    setComments(response.data);
  }

  async function refreshSupporters() {
    const response = await thoughtApi.getSupporters(currentThought.id, { limit: 50 });
    setSupportCount(response.total);
    setIsSupported(Boolean(user?.id && response.data.some((entry) => entry.user.id === user.id)));
  }

  async function refreshSavers() {
    const response = await thoughtApi.getSavers(currentThought.id, { limit: 50 });
    setSaveCount(response.total);
    setIsSaved(Boolean(user?.id && response.data.some((entry) => entry.user.id === user.id)));
  }

  async function toggleSupport() {
    if (togglingSupport) {
      return;
    }

    const previous = isSupported;
    const previousCount = supportCount;

    setTogglingSupport(true);
    setIsSupported(!previous);
    setSupportCount((current) => Math.max(0, current + (previous ? -1 : 1)));

    try {
      if (previous) {
        await thoughtApi.unsupport(currentThought.id);
      } else {
        await thoughtApi.support(currentThought.id);
      }

      await refreshSupporters();
    } catch (error) {
      console.error("Failed to update support:", error);
      setIsSupported(previous);
      setSupportCount(previousCount);
    } finally {
      setTogglingSupport(false);
    }
  }

  async function toggleSave() {
    if (togglingSave) {
      return;
    }

    const previous = isSaved;
    const previousCount = saveCount;

    setTogglingSave(true);
    setIsSaved(!previous);
    setSaveCount((current) => Math.max(0, current + (previous ? -1 : 1)));

    try {
      if (previous) {
        await thoughtApi.unsave(currentThought.id);
      } else {
        await thoughtApi.save(currentThought.id);
      }

      await refreshSavers();
    } catch (error) {
      console.error("Failed to update save:", error);
      setIsSaved(previous);
      setSaveCount(previousCount);
    } finally {
      setTogglingSave(false);
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = commentText.trim();
    if (!text || submittingComment) {
      return;
    }

    try {
      setSubmittingComment(true);
      await thoughtApi.comment(currentThought.id, text, replyTo?.id);
      setCommentText("");
      setReplyTo(null);
      await refreshComments();
    } catch (error) {
      console.error("Failed to add thought comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  }

  const commentAvatar = currentThought.author.profilePictureUrl
    ? avatarUrl
    : null;

  function startReply(comment: ThoughtComment) {
    setReplyTo({ id: comment.id, username: comment.author.username });
    commentInputRef.current?.focus();
  }

  function renderComment(comment: ThoughtComment, isReply = false) {
    const replyAvatar = resolveMediaUrl(comment.author.profilePictureUrl);

    return (
      <li key={comment.id} className={isReply ? "ml-8" : undefined}>
        <div className="flex gap-2.5 rounded-xl border border-gray-700 bg-[#080809] p-3">
          {replyAvatar ? (
            <img
              src={replyAvatar}
              alt={comment.author.username}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 text-[11px] font-semibold text-white">
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-white">{comment.author.name}</span>
              <span className="truncate">@{comment.author.username}</span>
              <span>•</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-gray-200">
              {comment.text}
            </p>

            {currentThought.type === "discussions" && !isReply ? (
              <button
                type="button"
                onClick={() => startReply(comment)}
                className="mt-2 text-xs font-medium text-gray-400 transition hover:text-white"
              >
                Reply
              </button>
            ) : null}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
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
        className="flex h-[85vh] max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#080809] md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col md:w-[55%]">
          <div className="flex items-start justify-between gap-3 border-b border-gray-700 p-4">
            <div className="flex min-w-0 gap-3">
              {commentAvatar ? (
                <img
                  src={commentAvatar}
                  alt={thought.author.username}
                  className="h-10 w-10 shrink-0 rounded-full border border-gray-700 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-[#080809] text-sm font-semibold text-white">
                  {initialFor(thought)}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {currentThought.author.name}
                </p>
                <p className="text-sm text-gray-400">@{currentThought.author.username}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(currentThought.createdAt)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-[#080809] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="slim-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4 md:max-h-[42vh]">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-2/3 rounded bg-[#080809]" />
                <div className="h-4 w-full rounded bg-[#080809]" />
                <div className="h-4 w-5/6 rounded bg-[#080809]" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment) => renderComment(comment))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSupport}
                disabled={togglingSupport}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${isSupported
                  ? "border-gray-500 bg-[#080809] text-white"
                  : "border-gray-700 text-gray-300 hover:bg-[#080809]"
                  }`}
              >
                <ThumbsUp size={18} />
                Support
              </button>

              <button
                type="button"
                onClick={toggleSave}
                disabled={togglingSave}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${isSaved
                  ? "border-gray-500 bg-[#080809] text-white"
                  : "border-gray-700 text-gray-300 hover:bg-[#080809]"
                  }`}
              >
                <Bookmark size={18} />
                Save
              </button>

              <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300">
                <MessageCircle size={18} />
                Comments
              </span>
            </div>

            <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={
                  replyTo
                    ? `Reply to @${replyTo.username}...`
                    : "Add a comment..."
                }
                className="flex-1 rounded-xl border border-gray-700 bg-[#080809] px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gray-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                aria-label="Post comment"
                className="rounded-xl bg-[#080809] p-2 text-white transition hover:bg-[#080809] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={18} />
              </button>
            </form>

            {replyTo ? (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300">
                <span>
                  Replying to <span className="font-medium text-white">@{replyTo.username}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-gray-400 transition hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="rounded-full border border-gray-700 px-2 py-1 text-gray-300">
                {currentThought.type}
              </span>
              <span className="rounded-full border border-gray-700 px-2 py-1 text-gray-300">
                {currentThought.visibility}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 bg-[#080809] p-4 md:w-[45%] md:border-l md:border-t-0">
          <div className="rounded-2xl border border-gray-700 bg-[#080809] p-4">
            <p className="text-sm font-semibold text-white">About this thought</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">
              {currentThought.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}