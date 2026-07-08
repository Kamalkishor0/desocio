"use client";

import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Hand,
    Heart,
    Laugh,
    MessageCircle,
    Share2,
} from "lucide-react";

import { FeedPost } from "@/lib/api/feed";
import { postApi } from "@/lib/api/post";
import { resolveMediaUrl, formatDate } from "@/lib/media";
import { PostModal } from "@/components/post-modal";

import type { PostReactionType } from "@/types/post";

const REACTIONS: {
    type: PostReactionType;
    Icon: typeof Heart;
}[] = [
        {
            type: "heart",
            Icon: Heart,
        },
        {
            type: "clap",
            Icon: Hand,
        },
        {
            type: "laugh",
            Icon: Laugh,
        },
    ];

type Props = {
    post: FeedPost;
};

export function FeedPostCard({ post }: Props) {
    const [photoIndex, setPhotoIndex] = useState(0);

    const [reaction, setReaction] = useState<PostReactionType | null>(
        post.viewerReaction
    );

    const [modalOpen, setModalOpen] = useState(false);

    const photos = [...post.photos].sort(
        (a, b) => a.position - b.position
    );

    const avatar = resolveMediaUrl(post.author.profilePictureUrl);

    async function toggleReaction(type: PostReactionType) {
        const previous = reaction;

        setReaction((current) =>
            current === type ? null : type
        );

        try {
            const result = await postApi.react(post.id, type);

            setReaction(result.reaction);
        } catch (error) {
            console.error(error);

            setReaction(previous);
        }
    }

    return (
        <>
            <article className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                <div className="flex items-center gap-3 p-4">

                    {avatar ? (
                        <img
                            src={avatar}
                            alt={post.author.username}
                            className="h-11 w-11 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 font-semibold text-white">
                            {post.author.username[0].toUpperCase()}
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                            {post.author.name}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="truncate">@{post.author.username}</span>
                            <span>•</span>
                            <span className="text-xs">{formatDate(post.createdAt)}</span>
                        </div>
                    </div>

                </div>

                {post.text && (
                    <p className="px-4 pb-3 whitespace-pre-wrap text-slate-200">
                        {post.text}
                    </p>
                )}

                {photos.length > 0 && (
                    <div className="relative">

                        <img
                            src={
                                resolveMediaUrl(
                                    photos[photoIndex].url
                                ) ?? undefined
                            }
                            alt=""
                            className="aspect-square w-full cursor-pointer object-cover"
                            onClick={() => setModalOpen(true)}
                        />

                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={() =>
                                        setPhotoIndex((current) =>
                                            current === 0
                                                ? photos.length - 1
                                                : current - 1
                                        )
                                    }
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    onClick={() =>
                                        setPhotoIndex((current) =>
                                            current === photos.length - 1
                                                ? 0
                                                : current + 1
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
                                >
                                    <ChevronRight size={18} />
                                </button>

                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                                    {photoIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}

                    </div>
                )}

                <div className="flex items-center justify-between px-4 py-3">

                    <div className="flex items-center gap-2">

                        {REACTIONS.map(({ type, Icon }) => {

                            const active = reaction === type;

                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleReaction(type)}
                                    className={`rounded-full border p-2 transition ${active
                                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                            : "border-slate-700 text-slate-300 hover:bg-slate-800"
                                        }`}
                                >
                                    <Icon size={18} />
                                </button>
                            );

                        })}

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() => setModalOpen(true)}
                            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
                        >
                            <MessageCircle size={18} />
                        </button>

                        <button
                            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
                        >
                            <Share2 size={18} />
                        </button>

                    </div>

                </div>

            </article>

            {modalOpen && (
                <PostModal
                    post={post}
                    author={post.author}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}