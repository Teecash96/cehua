// A 20px owner badge and its assign/reassign picker. The badge shows a muted
// colored circle with the member's initial, or a dashed gray placeholder when
// unassigned. Clicking it opens a dropdown to pick, reassign, or unassign.

import { Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@glaze/core/components";
import { cn } from "@glaze/core/utils";

import { memberColor, memberInitial } from "../lib/team";
import type { TeamMember } from "../lib/types";

export function AssigneeBadge({ member, className }: { member?: TeamMember; className?: string }) {
  if (!member) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-5 items-center justify-center rounded-full border border-dashed border-secondary bg-control-subtle text-tertiary",
          className,
        )}
      >
        <Plus className="size-3" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 items-center justify-center rounded-full text-mini-strong text-white select-none",
        className,
      )}
      style={{ backgroundColor: memberColor(member) }}
    >
      {memberInitial(member.name)}
    </span>
  );
}

interface AssigneePickerProps {
  members: TeamMember[];
  assigneeId: string | null | undefined;
  onAssign: (id: string | null) => void;
  /** Used to build the trigger's accessible label. */
  label: string;
}

export function AssigneePicker({ members, assigneeId, onAssign, label }: AssigneePickerProps) {
  const named = members.filter((member) => member.name.trim().length > 0);
  const current = named.find((member) => member.id === assigneeId);
  const triggerLabel = current ? `${label} — assigned to ${current.name}` : `${label} — unassigned`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          className="shrink-0 rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <AssigneeBadge member={current} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {named.length === 0 ? (
          <DropdownMenuItem disabled>No team members yet</DropdownMenuItem>
        ) : (
          named.map((member) => (
            <DropdownMenuItem
              key={member.id}
              icon="circle.fill"
              iconColor={memberColor(member)}
              onSelect={() => onAssign(member.id)}
            >
              {member.role ? `${member.name} · ${member.role}` : member.name}
            </DropdownMenuItem>
          ))
        )}
        {current ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon="minus.circle" onSelect={() => onAssign(null)}>
              Unassign
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
