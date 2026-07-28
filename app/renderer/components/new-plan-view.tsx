// Screen 1 — New plan. A calm canvas: a hero prompt, one required idea field,
// a few optional context fields, a single accent CTA, and example ideas.

import * as React from "react";
import { Sparkles } from "lucide-react";

import { Button, Callout, Input, Label, Text, Textarea } from "@glaze/core/components";

import type { PlanInputs } from "../lib/types";
import { BrandMark } from "./brand-mark";

const EXAMPLES = [
  "A habit tracker for remote workers",
  "A meal planner that reduces food waste",
  "A peer feedback tool for small teams",
];

const TEMPLATES: { label: string; inputs: Partial<PlanInputs> }[] = [
  {
    label: "SaaS Product",
    inputs: {
      idea: "A subscription web app that helps small businesses manage a specific workflow more efficiently.",
      targetUser: "Small business owners and their teams",
      problem: "Manual, spreadsheet-based processes are slow and error-prone",
      goal: "Convert trial teams to a paid subscription within the first week",
    },
  },
  {
    label: "Mobile App",
    inputs: {
      idea: "A mobile app that helps people build and stick to a daily habit through quick check-ins and reminders.",
      targetUser: "Busy individuals trying to build a consistent habit",
      problem: "People start new habits but lose momentum after a few days",
      goal: "Drive daily active use and multi-week streaks",
    },
  },
  {
    label: "Internal Tool",
    inputs: {
      idea: "An internal dashboard giving a team visibility into a process currently tracked ad hoc across spreadsheets and chat.",
      targetUser: "Internal team members and their manager",
      problem: "Status and data are scattered across spreadsheets and chat threads, so nobody has one source of truth",
      goal: "Replace the spreadsheet with a shared, always up-to-date view",
    },
  },
  {
    label: "API",
    inputs: {
      idea: "A developer-facing API and SDK that lets other apps integrate a specific capability without building it themselves.",
      targetUser: "Developers integrating the capability into their own product",
      problem: "Building this capability in-house is slow and easy to get wrong",
      goal: "Get developers to a successful first API call in under 10 minutes",
    },
  },
];

interface NewPlanViewProps {
  inputs: PlanInputs;
  onChange: (patch: Partial<PlanInputs>) => void;
  onGenerate: () => void;
  errorMessage: string | null;
  onDismissError: () => void;
}

export function NewPlanView({ inputs, onChange, onGenerate, errorMessage, onDismissError }: NewPlanViewProps) {
  const [touchedEmpty, setTouchedEmpty] = React.useState(false);
  const hasIdea = inputs.idea.trim().length > 0;

  function handleGenerate() {
    if (!hasIdea) {
      setTouchedEmpty(true);
      return;
    }
    onGenerate();
  }

  return (
    <div className="relative h-full">
      <div className="drag-region absolute inset-x-0 top-0 h-13" />
      <div className="h-full overflow-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-col justify-center gap-7 px-8 py-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandMark tile />
          <div className="space-y-1.5">
            <Text as="h1" variant="heading1" className="tracking-tight">
              Turn an idea into a plan
            </Text>
            <Text color="secondary">Describe your product idea and Cehua drafts a PRD and user flow.</Text>
          </div>
        </div>

        {errorMessage && (
          <Callout
            color="red"
            actions={
              <Button variant="filled" size="small" onClick={onGenerate}>
                Try again
              </Button>
            }
            onDismiss={onDismissError}
            dismissLabel="Dismiss"
          >
            {errorMessage}
          </Callout>
        )}

        <div className="space-y-5 rounded-card border border-separator bg-well/50 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Product or feature name</Label>
            <Input
              id="plan-name"
              value={inputs.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-idea">Describe your idea</Label>
            <Textarea
              id="plan-idea"
              size="large"
              value={inputs.idea}
              onChange={(event) => {
                onChange({ idea: event.target.value });
                if (event.target.value.trim()) setTouchedEmpty(false);
              }}
              placeholder="An app that helps freelancers track unpaid invoices…"
              className="min-h-28"
            />
            {touchedEmpty && !hasIdea && (
              <Text variant="small" color="red">
                Add a short description of your idea to generate a plan.
              </Text>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-user">Target user</Label>
              <Input
                id="plan-user"
                value={inputs.targetUser}
                onChange={(event) => onChange({ targetUser: event.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-problem">Main problem</Label>
              <Input
                id="plan-problem"
                value={inputs.problem}
                onChange={(event) => onChange({ problem: event.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-goal">Primary goal</Label>
              <Input
                id="plan-goal"
                value={inputs.goal}
                onChange={(event) => onChange({ goal: event.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <Button variant="accent" className="w-full" disabled={!hasIdea} onClick={handleGenerate}>
            <Sparkles className="size-4.5" />
            Generate plan
          </Button>
        </div>

        <div className="space-y-3">
          <Text variant="small" color="tertiary" className="text-center">
            Start from a template
          </Text>
          <div className="flex flex-wrap justify-center gap-2">
            {TEMPLATES.map((template) => (
              <Button
                key={template.label}
                variant="filled"
                size="small"
                onClick={() => {
                  onChange(template.inputs);
                  setTouchedEmpty(false);
                }}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Text variant="small" color="tertiary" className="text-center">
            Or try an example
          </Text>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((example) => (
              <Button
                key={example}
                variant="filled"
                size="small"
                onClick={() => {
                  onChange({ idea: example });
                  setTouchedEmpty(false);
                }}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
