import {
  Home,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  SquarePen,
} from "lucide-react";

type SidebarProps = {
  expanded: boolean;
};

export function Sidebar({ expanded }: SidebarProps) {
  const topItems = [
    { icon: Home, label: "Home" },
    { icon: MessageCircle, label: "Messages" },
    { icon: Bell, label: "Notifications" },
    { icon: User, label: "Profile" },
    { icon: SquarePen, label: "Post" },
  ];

  const bottomItems = [
    { icon: Settings, label: "Settings" },
    { icon: LogOut, label: "Logout" }
  ];

  return (
    <nav className="flex h-full flex-col justify-between pb-6">
      <div className="space-y-2">
        {topItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className={`flex items-center gap-4 rounded-xl p-3 transition ${expanded ? "w-full" : "w-fit"
              } hover:bg-white/10`}
          >
            <Icon size={22} />

            <span
              className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ease-in-out ${expanded
                  ? "ml-2 max-w-[120px] opacity-100"
                  : "ml-0 max-w-0 opacity-0"
                }`}
            >
              {label==="Post" ? "Create" : label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {bottomItems.map(({ icon: Icon, label }) => {
          const isLogout = label === "Logout";

          return (
            <button
              key={label}
              className={`flex items-center gap-4 rounded-xl p-3 transition ${expanded ? "w-full" : "w-fit"
                } ${isLogout
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "hover:bg-white/10"
                }`}
            >
              <Icon size={22} />
              <span
                className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-300 ease-in-out ${expanded
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