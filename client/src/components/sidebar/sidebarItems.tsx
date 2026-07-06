import {
  Home,
  MessageCircle,
  Bell,
  User,
  Users,
  Settings,
  LogOut,
  SquarePen,
  Search,
} from "lucide-react";

export type SidebarItem = {
  id:
    | "home"
    | "messages"
    | "notifications"
    | "profile"
    | "friends"
    | "post"
    | "settings"
    | "logout"
    | "search";
  label: string;
  icon: typeof Home;
};

export const topSidebarItems: SidebarItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Home",
  },
  {
    id: "search",
    icon: Search,
    label: "Search",
  },
  {
    id: "messages",
    icon: MessageCircle,
    label: "Messages",
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
  },
  {
    id: "profile",
    icon: User,
    label: "Profile",
  },
  {
    id: "friends",
    icon: Users,
    label: "Friends",
  },
  {
    id: "post",
    icon: SquarePen,
    label: "Post",
  }
];

export const bottomSidebarItems: SidebarItem[] = [
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
  },
  {
    id: "logout",
    icon: LogOut,
    label: "Logout",
  },
];