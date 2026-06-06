import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/app/providers";
import { adminApi } from "@/features/admin/api/adminApi";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/store/authStore";
import { notificationsApi } from "@/features/notifications/api/notificationsApi";
import { profileApi } from "@/features/profile/api/profileApi";
import { disconnectSocket } from "@/lib/socket";

type AppShellProps = {
  children: ReactNode;
  rightRail?: ReactNode;
  activeItem?: string;
};

const navItems = [
  { label: "Home Feed", icon: LayoutDashboard, to: "/feed" },
  { label: "Explore", icon: Compass, to: "/explore" },
  { label: "My Groups", icon: UsersRound, to: "/my-groups" },
  { label: "Messages", icon: MessageSquare, to: "/messages" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
  { label: "Admin", icon: ShieldCheck, to: "/admin" },
  { label: "Profile", icon: UserRound, to: "/profile" },
];

function UserAvatar({ label = "AR" }: { label?: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#073f43]/15 bg-[#c88736] text-xs font-bold text-white">
      {label}
    </div>
  );
}

function getInitialsFromEmail(email?: string | null) {
  if (!email) {
    return "EC";
  }

  const localPart = email.split("@")[0]?.trim();

  if (!localPart) {
    return "EC";
  }

  const pieces = localPart.split(/[._-\s]+/).filter(Boolean);

  if (pieces.length >= 2) {
    return `${pieces[0][0]}${pieces[1][0]}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase();
}

export function AppShell({
  children,
  rightRail,
  activeItem = "Home Feed",
}: AppShellProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.getMyProfile,
    retry: false,
  });
  const adminAccessQuery = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: adminApi.getRoles,
    retry: false,
  });
  const unreadNotificationsQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsApi.getUnreadCount,
    retry: false,
    refetchInterval: 30000,
  });

  const initials =
    profileQuery.data?.first_name?.[0] && profileQuery.data?.last_name?.[0]
      ? `${profileQuery.data.first_name[0]}${profileQuery.data.last_name[0]}`.toUpperCase()
      : getInitialsFromEmail(user?.email);
  const visibleNavItems = navItems.filter(
    (item) => item.label !== "Admin" || adminAccessQuery.isSuccess
  );
  const unreadNotifications = unreadNotificationsQuery.data?.count ?? 0;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchDraft.trim();
    navigate(
      query
        ? `/explore?mode=users&q=${encodeURIComponent(query)}`
        : "/explore?mode=users"
    );
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch {
      // Clear local session even if the server-side logout request fails.
    } finally {
      disconnectSocket();
      clearAuth();
      queryClient.clear();
      navigate("/login");
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#f3f6fb] text-[#101820]">
      <header className="flex h-16 items-center justify-between border-b border-[#c8d1d7] bg-white px-5 lg:px-7">
        <div className="hidden min-w-52 lg:block">
          <div className="text-xl font-bold leading-tight text-[#073f43]">
            EduConnect
          </div>
          <div className="text-xs font-medium text-[#172b2e]">
            Academic Network
          </div>
        </div>

        <form
          className="relative hidden w-[31rem] max-w-[42vw] lg:block"
          onSubmit={handleSearch}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#2d3b3d]" />
          <Input
            type="search"
            placeholder="Search peers or posts..."
            className="h-10 border-[#b8c4c7] bg-[#edf3fb] pl-10 text-sm"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Messages"
            onClick={() => navigate("/messages")}
          >
            <Mail className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              unreadNotifications
                ? `${unreadNotifications} unread notifications`
                : "Notifications"
            }
            className="relative"
            title={
              unreadNotifications
                ? `${unreadNotifications} unread notifications`
                : "Notifications"
            }
            onClick={() => navigate("/notifications")}
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#c88736] px-1 text-[10px] font-bold leading-4 text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            className="hidden h-9 bg-[#073f43] px-4 text-sm text-white hover:bg-[#062f33] sm:inline-flex"
            onClick={() => navigate("/feed?compose=1")}
          >
            Create Post
          </Button>
          <UserAvatar label={initials} />
        </div>
      </header>

      <div
        className={`grid h-[calc(100dvh-4rem)] grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] ${
          rightRail ? "xl:grid-cols-[15rem_minmax(0,1fr)_23rem]" : ""
        }`}
      >
        <aside className="hidden border-r border-[#c8d1d7] bg-[#e9eff8] px-4 py-6 md:flex md:flex-col">
          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;
              const className = `flex h-10 w-full items-center gap-3 rounded-md px-4 text-left text-sm transition ${
                isActive
                  ? "bg-[#d0dee9] font-bold text-[#042f33]"
                  : "text-[#263336] hover:bg-white/60"
              }`;

              return (
                <NavLink key={item.label} to={item.to} className={className}>
                  <Icon className="size-4" />
                  {item.label}
                  {item.label === "Notifications" && unreadNotifications > 0 ? (
                    <span
                      className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-[#c88736] px-1.5 text-[11px] font-bold leading-5 text-white"
                      title={`${unreadNotifications} unread notifications`}
                    >
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#b8c4c7] pt-5">
            <Button className="h-14 w-full bg-[#ffc85c] text-sm font-medium text-[#6b4a05] hover:bg-[#f3bb4a]">
              <GraduationCap className="size-4" />
              Join Research Group
            </Button>
            <button
              className="mt-4 flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-4 text-sm text-[#263336] transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        <section className="overflow-y-auto px-2 sm:px-5 xl:px-10">
          {children}
        </section>

        {rightRail ? (
          <aside className="hidden overflow-y-auto px-5 py-4 xl:block">
            {rightRail}
          </aside>
        ) : null}
      </div>
    </main>
  );
}
