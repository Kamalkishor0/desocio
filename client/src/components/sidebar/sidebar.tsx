"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

import { api } from "@/lib/api";
import {
  SidebarItem,
  topSidebarItems,
  bottomSidebarItems,
} from "./sidebarItems";

type SidebarProps = {
  expanded: boolean;
};

export function Sidebar({ expanded }: SidebarProps) {
  const {user} = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleItemClick = async (id: SidebarItem["id"]) => {
    switch (id) {
      case "home":
        router.push("/home");
        break;
        
      case "search":
        router.push("/home/search");
        break;
  
      case "messages":
        router.push("/home/chat");
        break;

      case "notifications":
        router.push("/home/notifications");
        break;

      case "profile":
        if(!user){
          return router.push("/login");
        }
        router.push(`/home/profile/${user.username}`);
        break;

      case "friends":
        router.push("/home/friends");
        break;

      case "post":
        router.push("/home/createpost");
        break;

      case "settings":
        break;

      case "logout":
        setLoggingOut(true);

        try {
          await api.logout();
        } finally {
          router.replace("/");
          setLoggingOut(false);
        }
        break;
    }
  };

  return (
    <nav className="flex h-full flex-col justify-between pb-6">
      <div className="space-y-2">
        {topSidebarItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleItemClick(id)}
            className={`flex items-center gap-4 rounded-xl p-3 transition ${
              expanded ? "w-full" : "w-fit"
            } hover:bg-white/10`}
          >
            <Icon size={22} />

            <span
              className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ease-in-out ${
                expanded
                  ? "ml-2 max-w-[120px] opacity-100"
                  : "ml-0 max-w-0 opacity-0"
              }`}
            >
              {label === "Post" ? "Create" : label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {bottomSidebarItems.map(({ id, icon: Icon, label }) => {
          const isLogout = id === "logout";

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleItemClick(id)}
              disabled={isLogout && loggingOut}
              className={`flex items-center gap-4 rounded-xl p-3 transition ${
                expanded ? "w-full" : "w-fit"
              } ${
                isLogout
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon size={22} />

              <span
                className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ease-in-out ${
                  expanded
                    ? "ml-2 max-w-[120px] opacity-100"
                    : "ml-0 max-w-0 opacity-0"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}