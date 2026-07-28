// An editable list of short items (core features, user stories, etc.).
// Each row is an inline EditableText with a marker and a hover remove button;
// a ghost "Add" row appends a new item. Renders as a clean bulleted/numbered
// list, editable in place.

import { Plus, X } from "lucide-react";

import { Button } from "@glaze/core/components";

import { EditableText } from "./editable-text";

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  ordered?: boolean;
  itemLabel: string;
  addLabel?: string;
}

export function EditableList({ items, onChange, ordered = false, itemLabel, addLabel = "Add" }: EditableListProps) {
  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next.filter((item, i) => item.length > 0 || i === index).filter((item) => item.length > 0));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
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
          <Button
            variant="transparent"
            size="small"
            iconOnly
            aria-label={`Remove ${itemLabel.toLowerCase()}`}
            className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
