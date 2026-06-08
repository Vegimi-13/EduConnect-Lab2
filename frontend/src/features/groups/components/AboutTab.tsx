import { Info } from "lucide-react";

import type { Group } from "../types/groups.types";
import { formatDate, getGroupDescription } from "./groupFormatters";

export function AboutTab({ group }: { group: Group }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_17rem]">
      <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
        <div className="border-b border-[#edf3fb] px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#101820]">
            <Info className="size-4 text-[#073f43]" />
            About {group.name}
          </h2>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-7 text-[#1f2937]">{getGroupDescription(group)}</p>
          <div className="rounded-xl bg-[#f3f6fb] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7a8e91]">Community focus</p>
            <p className="mt-2 text-sm leading-6 text-[#3d5156]">
              Resource sharing, course collaboration, academic discussion, and project coordination.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
        <div className="border-b border-[#edf3fb] px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#7a8e91]">Details</h2>
        </div>

        <div className="divide-y divide-[#f3f6fb]">
          {[
            { label: "Created", value: formatDate(group.created_at) },
            { label: "Visibility", value: group.visibility ?? "public" },
            { label: "Owner ID", value: String(group.owner_id) },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7a8e91]">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#101820]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
