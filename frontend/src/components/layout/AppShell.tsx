import type { ReactNode } from "react";
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
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/store/authStore";
import { profileApi } from "@/features/profile/api/profileApi";

type AppShellProps = {
  children: ReactNode;
  rightRail?: ReactNode;
  activeItem?: string;
};

const navItems = [
  { label: "Home Feed", icon: LayoutDashboard, to: "/feed" },
  { label: "Explore", icon: Compass },
  { label: "My Groups", icon: UsersRound },
  { label: "Messages", icon: MessageSquare },
  { label: "Notifications", icon: Bell },
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
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.getMyProfile,
    retry: false,
  });

  const initials =
    profileQuery.data?.first_name?.[0] && profileQuery.data?.last_name?.[0]
      ? `${profileQuery.data.first_name[0]}${profileQuery.data.last_name[0]}`.toUpperCase()
      : getInitialsFromEmail(user?.email);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch {
      // Clear local session even if the server-side logout request fails.
    } finally {
      clearAuth();
      navigate("/login");
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#f3f6fb] text-[#101820]">
      <header className="flex h-16 items-center justify-between border-b border-[#c8d1d7] bg-white px-5 lg:px-7">
        <div className="text-xl font-bold text-[#073f43]">EduConnect</div>

        <div className="relative hidden w-[31rem] max-w-[42vw] lg:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#2d3b3d]" />
          <Input
            type="search"
            placeholder="Search research, peers, or groups..."
            className="h-10 border-[#b8c4c7] bg-[#edf3fb] pl-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon-sm" aria-label="Messages">
            <Mail className="size-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>
          <Button className="hidden h-9 bg-[#073f43] px-4 text-sm text-white hover:bg-[#062f33] sm:inline-flex">
            Create Post
          </Button>
          <UserAvatar label={initials} />
        </div>
      </header>

      <div className="grid h-[calc(100dvh-4rem)] grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_23rem]">
        <aside className="hidden border-r border-[#c8d1d7] bg-[#e9eff8] px-4 py-6 md:flex md:flex-col">
          <div>
            <h1 className="text-2xl font-bold text-[#073f43]">EduConnect</h1>
            <p className="mt-1 text-sm text-[#172b2e]">Academic Network</p>
          </div>

          <nav className="mt-9 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;
              const className = `flex h-10 w-full items-center gap-3 rounded-md px-4 text-left text-sm transition ${
                isActive
                  ? "bg-[#d0dee9] font-bold text-[#042f33]"
                  : "text-[#263336] hover:bg-white/60"
              }`;

              if (item.to) {
                return (
                  <NavLink key={item.label} to={item.to} className={className}>
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                );
              }

              return (
                <button
                  key={item.label}
                  className={className}
                  type="button"
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#b8c4c7] pt-5">
            <Button className="h-14 w-full bg-[#ffc85c] text-sm font-medium text-[#6b4a05] hover:bg-[#f3bb4a]">
              <GraduationCap className="size-4" />
              Join Research Group
            </Button>
            <button
              className="mt-4 flex h-10 items-center gap-3 rounded-md px-4 text-sm text-[#263336] transition hover:bg-white/60 disabled:opacity-60"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        <section className="overflow-y-auto px-4 py-4 sm:px-5 xl:px-10">
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
