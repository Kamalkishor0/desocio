"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ConversationListItem } from "@/types/chat";
import { resolveMediaUrl } from "@/lib/media";

type Props = {
  conversation: ConversationListItem;
};

export function ConversationCard({
  conversation,
}: Props) {
  const pathname = usePathname();
  const href = `/home/chat/${conversation.id}`;
  const isActive = pathname === href;
  const avatarUrl = resolveMediaUrl(
    conversation.otherUser.profilePictureUrl
  );

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-b border-gray-700 p-4 transition hover:bg-[#080809] ${
        isActive ? "bg-[#080809]" : ""
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={conversation.otherUser.username}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#080809] font-semibold">
          {conversation.otherUser.username[0]?.toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {conversation.otherUser.name}
        </p>

        <p className="truncate text-sm text-gray-400">
          {conversation.lastMessage?.content ??
            "No messages yet"}
        </p>
      </div>
    </Link>
  );
}