import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { groupsApi } from "../api/groupsApi";
import { useOnlineUserIds } from "../hooks/useOnlineUserIds";
import { Avatar } from "./Avatar";

export function MembersTab({ groupId }: { groupId: number }) {
  const onlineUserIds = useOnlineUserIds();

  const membersQuery = useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => groupsApi.getGroupMembers(groupId),
    retry: false,
  });

  const members = membersQuery.data ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf3fb] px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#101820]">
          <Users className="size-4 text-[#073f43]" />
          Members
        </h2>
        <span className="rounded-full bg-[#073f43] px-2.5 py-0.5 text-xs font-bold text-white">
          {members.length}
        </span>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {membersQuery.isLoading ? (
          <p className="text-sm text-[#7a8e91]">Loading members...</p>
        ) : members.length ? (
          members.map((member) => {
            const isOnline = onlineUserIds.has(member.user_id);

            return (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-xl border border-[#edf3fb] bg-[#f8fafc] p-3 transition hover:border-[#d6dde3] hover:bg-white"
              >
                <div className="relative">
                  <Avatar initials={`${member.user.first_name[0]}${member.user.last_name[0]}`} />
                  <span
                    aria-label={isOnline ? "Online" : "Offline"}
                    className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-emerald-500" : "bg-[#c8d1d7]"
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#101820]">
                    {member.user.first_name} {member.user.last_name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-[#7a8e91]">{member.role ?? "member"}</span>
                    <span className="text-[#c8d1d7]">·</span>
                    <span className={`text-xs font-semibold ${isOnline ? "text-emerald-600" : "text-[#aab7ba]"}`}>
                      {isOnline ? "online" : "offline"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[#7a8e91]">No members found.</p>
        )}
      </div>
    </div>
  );
}

