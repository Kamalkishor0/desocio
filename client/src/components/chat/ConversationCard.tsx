"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ConversationListItem } from "@/types/chat";

type Props = {
  conversation: ConversationListItem;
};

export function ConversationCard({
  conversation,
}: Props) {
  const pathname = usePathname();
  const href = `/home/chat/${conversation.id}`;
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-b border-white/10 p-4 transition hover:bg-white/5 ${
        isActive ? "bg-white/10" : ""
      }`}
    >
      <div className="h-12 w-12 rounded-full bg-slate-700" />

      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {conversation.otherUser.name}
        </p>

        <p className="truncate text-sm text-slate-400">
          {conversation.lastMessage?.content ??
            "No messages yet"}
        </p>
      </div>
    </Link>
  );
}