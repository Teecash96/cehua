// Like EditableList, but each row carries an owner badge. Items and their
// assignees are kept aligned by index through every mutation, so adding,
// editing, or removing a row never desyncs ownership.

import { Plus, X } from "lucide-react";

import { Button } from "@glaze/core/components";

import type { TeamMember } from "../lib/types";
import { AssigneePicker } from "./assignee-badge";
import { EditableText } from "./editable-text";

interface AssignableListProps {
  items: string[];
  /** Aligned to `items` by index; a slot holds a TeamMember id or null. */
  assignees: (string | null)[];
  members: TeamMember[];
  onChange: (items: string[], assignees: (string | null)[]) => void;
  ordered?: boolean;
  itemLabel: string;
  addLabel?: string;
}

export function AssignableList({
  items,
  assignees,
  members,
  onChange,
  ordered = false,
  itemLabel,
  addLabel = "Add",
}: AssignableListProps) {
  const owners = items.map((_, index) => assignees[index] ?? null);

  function updateItem(index: number, value: string) {
    const zipped = items.map((item, i) => ({ item: i === index ? value : item, owner: owners[i] }));
    const filtered = zipped.filter((entry) => entry.item.length > 0);
    onChange(
      filtered.map((entry) => entry.item),
      filtered.map((entry) => entry.owner),
    );
  }

  function removeItem(index: number) {
    const zipped = items
      .map((item, i) => ({ item, owner: owners[i] }))
      .filter((_, i) => i !== index);
    onChange(
      zipped.map((entry) => entry.item),
      zipped.map((entry) => entry.owner),
    );
  }

  function addItem() {
    onChange([...items, ""], [...owners, null]);
  }

  function setOwner(index: number, memberId: string | null) {
    onChange(
      [...items],
      owners.map((owner, i) => (i === index ? memberId : owner)),
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item, index) => (
        <div key={index} className="group -mx-2 flex items-start gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-control-subtle">
          <span className="w-5 shrink-0 pt-0.5 text-right text-small text-tertiary tabular-nums select-none">
            {ordered ? `${index + 1}.` : "•"}
          </span>
          <div className="min-w-0 flex-1">
            <EditableText
              value={item}
              onCommit={(value) => updateItem(index, value)}
              ariaLabel={`${itemLabel} ${index + 1}`}
              placeholder={`${itemLabel}…`}
            />
          </div>
          <div className="shrink-0">
            <AssigneePicker
              members={members}
              assigneeId={owners[index]}
              onAssign={(id) => setOwner(index, id)}
              label={`${itemLabel} ${index + 1} owner`}
            />
          </div>
          <Button
            variant="transparent"
            size="small"
            iconOnly
            aria-label={`Remove ${itemLabel.toLowerCase()}`}
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => removeItem(index)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <div className="-mx-2 flex items-center gap-3 px-2 pl-10">
        <Button variant="transparent" size="small" onClick={addItem}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
