// ⌘K quick switcher — search and jump straight to any saved plan.

import { useNavigate } from "@tanstack/react-router";

import {
  CommandAccessory,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@glaze/core/components";

import { relativeTime } from "../lib/format";
import { usePlans } from "../lib/plans-store";

interface PlanSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanSwitcher({ open, onOpenChange }: PlanSwitcherProps) {
  const navigate = useNavigate();
  const plans = usePlans();

  function openPlan(id: string) {
    onOpenChange(false);
    navigate({ to: "/plan/$planId", params: { planId: id } });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Switch plan" description="Search your saved plans">
      <CommandInput placeholder="Search plans…" />
      <CommandList>
        <CommandEmpty>No matching plans.</CommandEmpty>
        <CommandGroup heading="Plans">
          {plans.map((plan) => (
            <CommandItem key={plan.id} value={plan.name} onSelect={() => openPlan(plan.id)}>
              <span>{plan.name}</span>
              <CommandAccessory>{relativeTime(plan.updatedAt)}</CommandAccessory>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
