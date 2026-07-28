// Cehua's brand mark: the app icon (a stylized "C" drawn as a user-flow path).
// Used in the sidebar header and empty states as the app's visual identity.

import { cn } from "@glaze/core/utils";

import brandIcon from "../assets/brand-icon.png";

interface BrandMarkProps {
  /** Larger app-icon-sized mark used in the hero and empty states. */
  tile?: boolean;
  className?: string;
}

export function BrandMark({ tile = false, className }: BrandMarkProps) {
  return (
    <img
      src={brandIcon}
      alt="Cehua"
      draggable={false}
      className={cn(
        "shrink-0 select-none object-cover",
        tile ? "size-11 rounded-[13px] brand-glow" : "size-5 rounded-[6px]",
        className,
      )}
    />
  );
}
