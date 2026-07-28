// The PRD tab: an editable, document-style rendering of the generated PRD.
// Every field edits in place and commits back to the plan store. Each section
// also has a regenerate action that asks the AI to redo just that section,
// using the rest of the plan as context, while leaving everything else intact.

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button, Text, Tooltip, TooltipContent, TooltipTrigger, toast } from "@glaze/core/components";
import { useGlazeAI } from "@glaze/core/hooks";
import { cn } from "@glaze/core/utils";

import { BLOCKED_MESSAGE, isBlockedState } from "../lib/ai-blocked";
import { buildSectionPrompt, parseSectionValue, SYSTEM_PROMPT, type PrdSectionKey } from "../lib/ai-plan";
import type { Plan, PRD } from "../lib/types";
import { AssignableList } from "./assignable-list";
import { EditableList } from "./editable-list";
import { EditableText } from "./editable-text";

interface PrdPanelProps {
  plan: Plan;
  onChange: (patch: Partial<PRD>) => void;
  /** Commit an assignable list's items together with its aligned owners. */
  onSectionChange: (section: "coreFeatures" | "userStories", items: string[], assignees: (string | null)[]) => void;
}

function Section({
  title,
  onRegenerate,
  loading,
  children,
}: {
  title: string;
  onRegenerate: () => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-separator bg-well/50 p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Text variant="small-strong" color="secondary" className="uppercase tracking-[0.06em]">
          {title}
        </Text>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="transparent"
              size="small"
              iconOnly
              aria-label={`Regenerate ${title}`}
              disabled={loading}
              onClick={onRegenerate}
            >
              <RefreshCw className={cn("size-3", loading && "animate-spin")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Regenerate section</TooltipContent>
        </Tooltip>
      </div>
      {children}
    </section>
  );
}

export function PrdPanel({ plan, onChange, onSectionChange }: PrdPanelProps) {
  const { prd } = plan;
  const members = plan.team ?? [];
  const { streamText, state, enableInHost } = useGlazeAI();
  const [regenerating, setRegenerating] = React.useState<PrdSectionKey | null>(null);

  const planRef = React.useRef(plan);
  planRef.current = plan;
  const bufferRef = React.useRef("");
  const finalizedRef = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const activeSectionRef = React.useRef<PrdSectionKey | null>(null);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const finalize = React.useCallback(() => {
    if (finalizedRef.current) return;
    const key = activeSectionRef.current;
    const text = bufferRef.current;
    if (!key || !text.trim()) return;
    finalizedRef.current = true;
    try {
      const value = parseSectionValue(key, text);
      onChange({ [key]: value } as Partial<PRD>);
    } catch {
      toast.error("Cehua couldn’t read the regenerated section. Try again.");
    } finally {
      activeSectionRef.current = null;
      setRegenerating(null);
    }
  }, [onChange]);

  // Mirror the home-view resume flow: a first attempt blocked on consent
  // delivers no output, then the hook resumes and streams into bufferRef; once
  // it reports ready we finalize. If it stays blocked, surface the message.
  React.useEffect(() => {
    if (!activeSectionRef.current) return;
    if (state === "ready" && bufferRef.current.trim()) {
      finalize();
    } else if (typeof state === "string" && isBlockedState(state)) {
      toast.error(BLOCKED_MESSAGE[state]);
      activeSectionRef.current = null;
      setRegenerating(null);
    }
  }, [state, finalize]);

  async function regenerateSection(key: PrdSectionKey) {
    if (activeSectionRef.current) return;
    finalizedRef.current = false;
    bufferRef.current = "";
    activeSectionRef.current = key;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRegenerating(key);

    try {
      await streamText({
        model: "smart",
        system: SYSTEM_PROMPT,
        prompt: buildSectionPrompt(key, planRef.current),
        maxOutputTokens: 500,
        abortSignal: controller.signal,
        onTextDelta: (delta) => {
          bufferRef.current += delta;
        },
      });
      finalize();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const blockedState = (error as { state?: string } | null)?.state;
      if (blockedState === "host-unavailable") {
        // Continue without asking the user to open Glaze manually — the hook
        // resumes the stream once Glaze mints a token (handled above).
        await enableInHost().catch(() => {});
        return;
      }
      if (typeof blockedState === "string" && isBlockedState(blockedState)) {
        toast.error(BLOCKED_MESSAGE[blockedState]);
      } else {
        toast.error("Cehua couldn’t regenerate that section. Try again.");
      }
      activeSectionRef.current = null;
      setRegenerating(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-4 px-8 py-8">
      <Section title="Product summary" onRegenerate={() => regenerateSection("summary")} loading={regenerating === "summary"}>
        <EditableText
          value={prd.summary}
          onCommit={(value) => onChange({ summary: value })}
          ariaLabel="Product summary"
          placeholder="A one to two sentence summary…"
          className="text-large"
        />
      </Section>

      <Section title="Problem" onRegenerate={() => regenerateSection("problem")} loading={regenerating === "problem"}>
        <EditableText
          value={prd.problem}
          onCommit={(value) => onChange({ problem: value })}
          ariaLabel="Problem"
          placeholder="What problem does this solve?"
        />
      </Section>

      <Section title="Target user" onRegenerate={() => regenerateSection("targetUser")} loading={regenerating === "targetUser"}>
        <EditableText
          value={prd.targetUser}
          onCommit={(value) => onChange({ targetUser: value })}
          ariaLabel="Target user"
          placeholder="Who is this for?"
        />
      </Section>

      <Section title="User goal" onRegenerate={() => regenerateSection("userGoal")} loading={regenerating === "userGoal"}>
        <EditableText
          value={prd.userGoal}
          onCommit={(value) => onChange({ userGoal: value })}
          ariaLabel="User goal"
          placeholder="What is the user trying to achieve?"
        />
      </Section>

      <Section
        title="Core features"
        onRegenerate={() => regenerateSection("coreFeatures")}
        loading={regenerating === "coreFeatures"}
      >
        <AssignableList
          items={prd.coreFeatures}
          assignees={plan.assignments?.coreFeatures ?? []}
          members={members}
          onChange={(items, assignees) => onSectionChange("coreFeatures", items, assignees)}
          itemLabel="Feature"
          addLabel="Add feature"
        />
      </Section>

      <Section
        title="User stories"
        onRegenerate={() => regenerateSection("userStories")}
        loading={regenerating === "userStories"}
      >
        <AssignableList
          items={prd.userStories}
          assignees={plan.assignments?.userStories ?? []}
          members={members}
          onChange={(items, assignees) => onSectionChange("userStories", items, assignees)}
          ordered
          itemLabel="User story"
          addLabel="Add story"
        />
      </Section>

      <Section
        title="Success criteria"
        onRegenerate={() => regenerateSection("successCriteria")}
        loading={regenerating === "successCriteria"}
      >
        <EditableList
          items={prd.successCriteria}
          onChange={(items) => onChange({ successCriteria: items })}
          itemLabel="Criterion"
          addLabel="Add criterion"
        />
      </Section>

      <Section
        title="Assumptions"
        onRegenerate={() => regenerateSection("assumptions")}
        loading={regenerating === "assumptions"}
      >
        <EditableList
          items={prd.assumptions}
          onChange={(items) => onChange({ assumptions: items })}
          itemLabel="Assumption"
          addLabel="Add assumption"
        />
      </Section>

      <Section
        title="Out of scope"
        onRegenerate={() => regenerateSection("outOfScope")}
        loading={regenerating === "outOfScope"}
      >
        <EditableList
          items={prd.outOfScope}
          onChange={(items) => onChange({ outOfScope: items })}
          itemLabel="Item"
          addLabel="Add item"
        />
      </Section>
    </div>
  );
}
