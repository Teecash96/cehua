// The calm, on-brand generating state — not a generic spinner. A gently
// pulsing brand mark, a friendly message, and skeleton lines suggesting a
// document taking shape.

import { Button, Text } from "@glaze/core/components";

import { BrandMark } from "./brand-mark";

export function GeneratingView({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-7 px-8 text-center">
      <div className="drag-region absolute inset-x-0 top-0 h-13" />
      <div className="animate-pulse">
        <BrandMark tile />
      </div>
      <div className="space-y-1.5">
        <Text variant="heading2" className="shimmer-text">
          Turning your idea into a plan…
        </Text>
        <Text color="secondary">Drafting the PRD and mapping the user flow.</Text>
      </div>
      <div className="w-full max-w-xs space-y-2.5 pt-1" aria-hidden>
        {["w-2/5", "w-full", "w-full", "w-4/5", "w-1/2"].map((width, index) => (
          <div key={index} className={`h-3 rounded-md bg-well animate-pulse ${width}`} />
        ))}
      </div>
      <Button variant="transparent" size="small" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
