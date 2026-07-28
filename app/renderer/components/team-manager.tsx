// The Team dialog: add, rename, re-role, and remove the people organizing a
// plan. Members are stored locally on the plan. Each row commits on blur;
// half-added members with no name are dropped when the dialog closes.

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Button, Dialog, Input, Text } from "@glaze/core/components";

import { newMemberId, nextColorIndex } from "../lib/team";
import type { TeamMember } from "../lib/types";
import { AssigneeBadge } from "./assignee-badge";

interface TeamManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
}

export function TeamManager({ open, onOpenChange, members, onChange }: TeamManagerProps) {
  function updateMember(id: string, patch: Partial<TeamMember>) {
    onChange(members.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  }

  function removeMember(id: string) {
    onChange(members.filter((member) => member.id !== id));
  }

  function addMember() {
    onChange([...members, { id: newMemberId(), name: "", role: "", colorIndex: nextColorIndex(members) }]);
  }

  function close() {
    const cleaned = members.filter((member) => member.name.trim().length > 0);
    if (cleaned.length !== members.length) onChange(cleaned);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Team"
      description="Add the people working on this plan, then assign them to features, stories, and flow steps."
      confirmLabel="Done"
      onConfirm={close}
      size="large"
    >
      <div className="flex flex-col gap-2">
        {members.length === 0 ? (
          <Text variant="small" color="secondary" className="py-1">
            No members yet. Add the first teammate below.
          </Text>
        ) : (
          members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onNameChange={(name) => updateMember(member.id, { name })}
              onRoleChange={(role) => updateMember(member.id, { role })}
              onRemove={() => removeMember(member.id)}
            />
          ))
        )}
        <div>
          <Button variant="transparent" size="small" onClick={addMember}>
            <Plus className="size-4" />
            Add member
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function MemberRow({
  member,
  onNameChange,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  onNameChange: (name: string) => void;
  onRoleChange: (role: string) => void;
  onRemove: () => void;
}) {
  const [name, setName] = React.useState(member.name);
  const [role, setRole] = React.useState(member.role ?? "");

  React.useEffect(() => setName(member.name), [member.name]);
  React.useEffect(() => setRole(member.role ?? ""), [member.role]);

  return (
    <div className="flex items-center gap-2">
      <AssigneeBadge member={{ ...member, name: name || member.name }} />
      <Input
        value={name}
        placeholder="Name"
        aria-label="Member name"
        className="flex-1"
        onChange={(event) => setName(event.target.value)}
        onBlur={() => name !== member.name && onNameChange(name)}
      />
      <Input
        value={role}
        placeholder="Role (optional)"
        aria-label="Member role"
        className="flex-1"
        onChange={(event) => setRole(event.target.value)}
        onBlur={() => role !== (member.role ?? "") && onRoleChange(role)}
      />
      <Button
        variant="transparent"
        size="small"
        iconOnly
        aria-label={`Remove ${member.name || "member"}`}
        onClick={onRemove}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
