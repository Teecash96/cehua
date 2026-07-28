// Formatting helpers: relative timestamps + Markdown/plain-text exports.

import { findMember } from "./team";
import type { FlowStep, Plan, TeamMember } from "./types";

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 2 * day) return "yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "cehua"
  );
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim() || "_Not specified_"}\n`;
}

function bulletList(title: string, items: string[]): string {
  if (items.length === 0) return `## ${title}\n\n_None_\n`;
  return `## ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}\n`;
}

function ownerName(team: TeamMember[] | undefined, id: string | null | undefined): string {
  const member = findMember(team, id);
  return member && member.name.trim() ? member.name.trim() : "";
}

function bulletListWithOwners(
  title: string,
  items: string[],
  assignees: (string | null)[] | undefined,
  team: TeamMember[] | undefined,
): string {
  if (items.length === 0) return `## ${title}\n\n_None_\n`;
  const rows = items.map((item, index) => {
    const owner = ownerName(team, assignees?.[index]);
    return owner ? `- ${item} _(owner: ${owner})_` : `- ${item}`;
  });
  return `## ${title}\n\n${rows.join("\n")}\n`;
}

export function prdToMarkdown(plan: Plan): string {
  const { prd, assignments, team } = plan;
  return [
    section("Product summary", prd.summary),
    section("Problem", prd.problem),
    section("Target user", prd.targetUser),
    section("User goal", prd.userGoal),
    bulletListWithOwners("Core features", prd.coreFeatures, assignments?.coreFeatures, team),
    bulletListWithOwners("User stories", prd.userStories, assignments?.userStories, team),
    bulletList("Success criteria", prd.successCriteria),
    bulletList("Assumptions", prd.assumptions),
    bulletList("Out of scope", prd.outOfScope),
  ].join("\n");
}

export function flowToNumberedText(flow: FlowStep[], team?: TeamMember[]): string {
  const lines: string[] = [];
  flow.forEach((step, index) => {
    const owner = ownerName(team, step.assigneeId);
    lines.push(`${index + 1}. ${step.title || "Step"}${owner ? ` (owner: ${owner})` : ""}`);
    if (step.action) lines.push(`   Action: ${step.action}`);
    if (step.result) lines.push(`   Result: ${step.result}`);
    if (step.type === "decision" && step.branches?.length) {
      lines.push("   Decision:");
      step.branches.forEach((branch) => {
        lines.push(`     - ${branch.label}: ${branch.result}`);
      });
    }
    lines.push("");
  });
  return lines.join("\n").trim();
}

export function prdCopyText(plan: Plan): string {
  return `# ${plan.name}\n\n${prdToMarkdown(plan)}`.trim();
}

export function planToMarkdown(plan: Plan): string {
  return [
    `# ${plan.name}`,
    "",
    prdToMarkdown(plan),
    "## User flow",
    "",
    flowToNumberedText(plan.flow, plan.team),
    "",
  ].join("\n");
}
