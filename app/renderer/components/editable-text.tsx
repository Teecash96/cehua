// Inline, borderless, auto-growing editable text — used to edit the generated
// PRD in place so it reads like a document, not a form. No design-system
// component fits an inline document field (Textarea is a bordered control),
// so this is intentionally custom, styled only with semantic tokens.

import * as React from "react";

import { cn } from "@glaze/core/utils";

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  singleLine?: boolean;
  className?: string;
}

export function EditableText({
  value,
  onCommit,
  placeholder,
  ariaLabel,
  singleLine = false,
  className,
}: EditableTextProps) {
  const [draft, setDraft] = React.useState(value);
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Keep the draft in sync when the underlying plan changes externally.
  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const autosize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useLayoutEffect(() => {
    autosize();
  }, [draft, autosize]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed !== value) onCommit(trimmed);
    if (trimmed !== draft) setDraft(trimmed);
  }

  return (
    <textarea
      ref={ref}
      aria-label={ariaLabel}
      value={draft}
      rows={1}
      placeholder={placeholder}
      spellCheck
      onChange={(event) => {
        const next = singleLine ? event.target.value.replace(/\n/g, " ") : event.target.value;
        setDraft(next);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={cn(
        "w-full resize-none bg-transparent text-primary placeholder:text-tertiary",
        "-mx-2 rounded-md px-2 py-1 outline-none transition-colors",
        "hover:bg-control-subtle focus:bg-well",
        className,
      )}
    />
  );
}
