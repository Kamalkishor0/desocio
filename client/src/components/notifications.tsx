"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  notificationsApi,
  type Notification,
} from "@/lib/api/notifications";
import { formatDate, resolveMediaUrl } from "@/lib/media";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await notificationsApi.getNotifications();

        setNotifications(response.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-44 rounded-lg bg-white/10" />
          <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.03]" />
          <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.03]" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
            <Bell size={19} />
          </div>
          <div>
            <h1 className="heading-font text-2xl font-semibold tracking-tight text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep up with what is happening around you.
            </p>
          </div>
        </div>
        <CheckCheck className="hidden text-gray-600 sm:block" size={20} />
      </header>

      {error ? (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5 text-sm text-red-200">
          Notifications could not be loaded right now.
        </section>
      ) : notifications.length === 0 ? (
        <section className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <Bell className="mb-4 text-gray-600" size={28} />
          <h2 className="font-medium text-gray-200">You are all caught up</h2>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            New friend requests, reactions, and updates will appear here.
          </p>
        </section>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`flex gap-3 rounded-2xl border p-4 transition-colors ${
                notification.isRead
                  ? "border-white/10 bg-white/[0.025]"
                  : "border-emerald-300/20 bg-emerald-300/[0.07]"
              }`}
            >
              {notification.actor?.profilePictureUrl ? (
                <img
                  src={resolveMediaUrl(notification.actor.profilePictureUrl) ?? undefined}
                  alt={notification.actor.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] font-semibold text-gray-200">
                  {notification.actor?.name?.[0]?.toUpperCase() ?? "D"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6 text-gray-300">
                  <span
                    className={
                      notification.actor
                        ? "cursor-pointer font-semibold text-white hover:underline"
                        : "font-semibold text-white"
                    }
                    onClick={() => {
                      if (notification.actor?.username) {
                        router.push(`/home/profile/${notification.actor.username}`);
                      }
                    }}
                  >
                    {notification.actor?.name ?? "DeSocio"}
                  </span>{" "}
                  {getNotificationMessage(notification.type)}
                </p>
                <time className="mt-1 block text-xs text-gray-500">
                  {formatDate(notification.createdAt)}
                </time>
              </div>
              {!notification.isRead && (
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-300"
                  aria-label="Unread"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function getNotificationMessage(type: string) {
  switch (type) {
    case "friendRequest":
      return "sent you a friend request.";

    case "friendRequestAccepted":
      return "accepted your friend request.";

    case "friendRequestRejected":
      return "rejected your friend request.";

    case "newPostReaction":
      return "reacted to your post.";

    case "newPostComment":
      return "commented on your post.";

    case "newThoughtSupport":
      return "supported your thought.";

    case "newThoughtComment":
      return "commented on your thought.";

    case "thoughtReported":
      return "reported your thought.";

    case "welcome":
      return "Welcome to DeSocio!";

    case "systemAnnouncement":
      return "There is a new announcement.";

    case "maintenance":
      return "DeSocio has a maintenance announcement.";

    case "securityAlert":
      return "There is a security alert for your account.";

    default:
      return "You have a new notification.";
  }
}