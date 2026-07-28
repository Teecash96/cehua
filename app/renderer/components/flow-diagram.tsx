// The User Flow tab — Cehua's signature feature. A clean vertical sequence of
// connected cards with subtle connectors, one branching decision card, and a
// copyable plain-text numbered version below. Every field is editable.

import { CircleCheck, CornerDownRight, GitBranch, LogIn, LogOut, MousePointerClick } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, Text } from "@glaze/core/components";

import { flowToNumberedText } from "../lib/format";
import type { FlowStep, FlowStepType, TeamMember } from "../lib/types";
import { AssigneePicker } from "./assignee-badge";
import { EditableText } from "./editable-text";

type BadgeColor = "secondary" | "blue" | "green";

const STEP_META: Record<FlowStepType, { label: string; icon: LucideIcon; color: BadgeColor }> = {
  entry: { label: "Entry point", icon: LogIn, color: "secondary" },
  action: { label: "Action", icon: MousePointerClick, color: "secondary" },
  decision: { label: "Decision", icon: GitBranch, color: "blue" },
  success: { label: "Success", icon: CircleCheck, color: "green" },
  exit: { label: "Next step", icon: LogOut, color: "secondary" },
};

interface FlowDiagramProps {
  flow: FlowStep[];
  onChange: (flow: FlowStep[]) => void;
  members: TeamMember[];
}

function FieldRow({
  label,
  value,
  onCommit,
  ariaLabel,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="w-14 shrink-0 pt-1 text-small text-tertiary select-none">{label}</span>
      <div className="min-w-0 flex-1">
        <EditableText value={value} onCommit={onCommit} ariaLabel={ariaLabel} placeholder="—" />
      </div>
    </div>
  );
}

export function FlowDiagram({ flow, onChange, members }: FlowDiagramProps) {
  function updateStep(id: string, patch: Partial<FlowStep>) {
    onChange(flow.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  }

  function updateBranch(stepId: string, index: number, patch: Partial<{ label: string; result: string }>) {
    onChange(
      flow.map((step) => {
        if (step.id !== stepId || !step.branches) return step;
        const branches = step.branches.map((branch, i) => (i === index ? { ...branch, ...patch } : branch));
        return { ...step, branches };
      }),
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-8 py-8">
      <div className="flex flex-col">
        {flow.map((step, index) => {
          const meta = STEP_META[step.type];
          const Icon = meta.icon;
          return (
            <div key={step.id}>
              {index > 0 && <div aria-hidden className="mx-auto h-7 w-px flow-connector" />}
              <div className="relative overflow-hidden rounded-card border border-separator bg-well p-4 pl-5 shadow-sm">
                <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--accent)]" />
                <div className="mb-2.5 flex items-center gap-2">
                  <Icon aria-hidden className="size-4 text-tertiary" />
                  <Badge color={meta.color}>{meta.label}</Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <AssigneePicker
                      members={members}
                      assigneeId={step.assigneeId}
                      onAssign={(id) => updateStep(step.id, { assigneeId: id })}
                      label={`Step ${index + 1} owner`}
                    />
                    <span className="text-small text-quaternary tabular-nums select-none">{index + 1}</span>
                  </div>
                </div>
                <EditableText
                  value={step.title}
                  onCommit={(value) => updateStep(step.id, { title: value })}
                  ariaLabel={`Step ${index + 1} title`}
                  singleLine
                  placeholder="Step title"
                  className="text-strong"
                />
                <div className="mt-2 space-y-1">
                  <FieldRow
                    label="Action"
                    value={step.action}
                    onCommit={(value) => updateStep(step.id, { action: value })}
                    ariaLabel={`Step ${index + 1} action`}
                  />
                  <FieldRow
                    label="Result"
                    value={step.result}
                    onCommit={(value) => updateStep(step.id, { result: value })}
                    ariaLabel={`Step ${index + 1} result`}
                  />
                </div>

                {step.type === "decision" && step.branches && step.branches.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {step.branches.map((branch, branchIndex) => (
                      <div key={branchIndex} className="rounded-lg border border-separator bg-control-subtle p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-tertiary">
                          <CornerDownRight aria-hidden className="size-3.5" />
                          <span className="text-mini-strong uppercase tracking-[0.06em] text-tertiary">Outcome</span>
                        </div>
                        <EditableText
                          value={branch.label}
                          onCommit={(value) => updateBranch(step.id, branchIndex, { label: value })}
                          ariaLabel={`Outcome ${branchIndex + 1} label`}
                          singleLine
                          placeholder="Outcome"
                          className="text-small-strong"
                        />
                        <EditableText
                          value={branch.result}
                          onCommit={(value) => updateBranch(step.id, branchIndex, { result: value })}
                          ariaLabel={`Outcome ${branchIndex + 1} result`}
                          placeholder="What happens…"
                          className="text-small text-secondary"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-9 space-y-2">
        <Text variant="small-strong" color="secondary" className="uppercase tracking-[0.06em]">
          Plain text
        </Text>
        <div className="rounded-card bg-well p-4">
          <p className="whitespace-pre-wrap text-small text-secondary">{flowToNumberedText(flow, members)}</p>
        </div>
      </section>
    </div>
  );
}
