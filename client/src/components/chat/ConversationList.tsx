"use client";

import { useEffect, useState } from "react";
import { chatApi } from "@/lib/api/chat";
import type { ConversationListItem } from "@/types/chat";
import { ConversationCard } from "./ConversationCard";

export function ConversationList() {
  const [conversations, setConversations] = useState<
    ConversationListItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await chatApi.getConversations();

        if (!active) return;

        setConversations(data);
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
        />
      ))}
    </div>
  );
}