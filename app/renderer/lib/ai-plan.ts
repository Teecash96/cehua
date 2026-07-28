// Prompt construction + strict-JSON parsing for AI plan generation.
// The model is asked to return one JSON object; we parse it defensively into
// our domain types so the UI never renders half-formed data.

import type { FlowBranch, FlowStep, FlowStepType, GeneratedPlan, Plan, PlanInputs, PRD } from "./types";

const FLOW_TYPES: FlowStepType[] = ["entry", "action", "decision", "success", "exit"];

export const SYSTEM_PROMPT = [
  "You are a senior product manager who writes crisp, honest PRDs and user flows.",
  "Write the way an experienced PM would after 20 focused minutes: concrete, practical, no filler.",
  "Never invent market statistics, customer research, revenue numbers, or unsupported facts.",
  "When you make a reasonable assumption, put it in the assumptions list rather than stating it as fact.",
  "Keep every field concise. Prefer plain language over buzzwords.",
  "Respond with a single valid JSON object and nothing else — no prose, no markdown code fences.",
].join(" ");

export function buildPrompt(inputs: PlanInputs): string {
  const optional = (label: string, value: string) => (value.trim() ? `${label}: ${value.trim()}` : "");
  const context = [
    inputs.name.trim() ? `Working name: ${inputs.name.trim()}` : "",
    `Idea: ${inputs.idea.trim()}`,
    optional("Target user", inputs.targetUser),
    optional("Main problem", inputs.problem),
    optional("Primary goal", inputs.goal),
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "Turn the following product idea into a concise PRD and one primary user flow.",
    "",
    context,
    "",
    "Return JSON with exactly this shape:",
    `{
  "name": string,                         // a short, human product name (refine the working name if given)
  "prd": {
    "summary": string,                    // 1-2 sentences
    "problem": string,
    "targetUser": string,
    "userGoal": string,
    "coreFeatures": string[],             // at most 5, each a short phrase
    "userStories": string[],              // at most 5, format "As a X, I want Y so that Z"
    "successCriteria": string[],          // at most 5, measurable where possible
    "assumptions": string[],              // reasonable assumptions, clearly stated
    "outOfScope": string[]                // things this deliberately does not do
  },
  "flow": [                               // 5 to 8 steps total, in order
    {
      "type": "entry" | "action" | "decision" | "success" | "exit",
      "title": string,                    // short step title
      "action": string,                   // what the user does
      "result": string,                   // the expected result
      "branches": [                       // ONLY for the one "decision" step; exactly two outcomes
        { "label": string, "result": string }
      ]
    }
  ]
}`,
    "",
    "Requirements: exactly one step with type 'decision' that has two branches; start with an 'entry' step; end with a 'success' step and/or an 'exit'/next-step. Keep 5-8 steps.",
  ].join("\n");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown, cap?: number): string[] {
  if (!Array.isArray(value)) return [];
  const list = value.map(asString).filter((item) => item.length > 0);
  return typeof cap === "number" ? list.slice(0, cap) : list;
}

function asBranches(value: unknown): FlowBranch[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const branches = value
    .map((raw) => {
      if (typeof raw !== "object" || raw === null) return null;
      const record = raw as Record<string, unknown>;
      const label = asString(record.label);
      const result = asString(record.result);
      if (!label && !result) return null;
      return { label, result };
    })
    .filter((branch): branch is FlowBranch => branch !== null);
  return branches.length > 0 ? branches : undefined;
}

function extractJsonObject(text: string): string {
  let candidate = text.trim();
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The AI response did not contain a JSON object.");
  }
  return candidate.slice(start, end + 1);
}

export function parseGeneratedPlan(text: string, fallbackName: string): GeneratedPlan {
  const parsed: unknown = JSON.parse(extractJsonObject(text));
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("The AI response was not a valid plan.");
  }
  const root = parsed as Record<string, unknown>;
  const prdRaw = (root.prd ?? {}) as Record<string, unknown>;

  const prd: PRD = {
    summary: asString(prdRaw.summary),
    problem: asString(prdRaw.problem),
    targetUser: asString(prdRaw.targetUser),
    userGoal: asString(prdRaw.userGoal),
    coreFeatures: asStringList(prdRaw.coreFeatures, 5),
    userStories: asStringList(prdRaw.userStories, 5),
    successCriteria: asStringList(prdRaw.successCriteria, 5),
    assumptions: asStringList(prdRaw.assumptions),
    outOfScope: asStringList(prdRaw.outOfScope),
  };

  const flowRaw = Array.isArray(root.flow) ? root.flow : [];
  const flow: FlowStep[] = flowRaw
    .map((raw, index): FlowStep | null => {
      if (typeof raw !== "object" || raw === null) return null;
      const record = raw as Record<string, unknown>;
      const typeValue = asString(record.type) as FlowStepType;
      const type: FlowStepType = FLOW_TYPES.includes(typeValue) ? typeValue : "action";
      const title = asString(record.title);
      const action = asString(record.action);
      const result = asString(record.result);
      if (!title && !action && !result) return null;
      const step: FlowStep = {
        id: `step_${index}_${Math.random().toString(36).slice(2, 7)}`,
        type,
        title,
        action,
        result,
      };
      if (type === "decision") {
        const branches = asBranches(record.branches);
        if (branches) step.branches = branches;
      }
      return step;
    })
    .filter((step): step is FlowStep => step !== null);

  if (!prd.summary && flow.length === 0) {
    throw new Error("The AI response was missing the plan content.");
  }

  const name = asString(root.name) || fallbackName || "Untitled plan";
  return { name, prd, flow };
}

// Per-section regeneration: regenerate a single PRD field in place, using the
// rest of the plan as context, without touching anything else.

export type PrdSectionKey = keyof PRD;

interface PrdSectionSpec {
  label: string;
  kind: "text" | "list";
  cap?: number;
}

const PRD_SECTIONS: Record<PrdSectionKey, PrdSectionSpec> = {
  summary: { label: "Product summary", kind: "text" },
  problem: { label: "Problem", kind: "text" },
  targetUser: { label: "Target user", kind: "text" },
  userGoal: { label: "User goal", kind: "text" },
  coreFeatures: { label: "Core features", kind: "list", cap: 5 },
  userStories: { label: "User stories", kind: "list", cap: 5 },
  successCriteria: { label: "Success criteria", kind: "list", cap: 5 },
  assumptions: { label: "Assumptions", kind: "list" },
  outOfScope: { label: "Out of scope", kind: "list" },
};

export function buildSectionPrompt(key: PrdSectionKey, plan: Plan): string {
  const spec = PRD_SECTIONS[key];
  const { prd, inputs } = plan;

  const context = [
    `Product name: ${plan.name}`,
    `Idea: ${inputs.idea.trim()}`,
    inputs.targetUser.trim() ? `Target user (input): ${inputs.targetUser.trim()}` : "",
    inputs.problem.trim() ? `Main problem (input): ${inputs.problem.trim()}` : "",
    inputs.goal.trim() ? `Primary goal (input): ${inputs.goal.trim()}` : "",
    "",
    "Current PRD (context only — regenerate only the target section below):",
    `Summary: ${prd.summary}`,
    `Problem: ${prd.problem}`,
    `Target user: ${prd.targetUser}`,
    `User goal: ${prd.userGoal}`,
    `Core features: ${prd.coreFeatures.join("; ")}`,
    `User stories: ${prd.userStories.join("; ")}`,
    `Success criteria: ${prd.successCriteria.join("; ")}`,
    `Assumptions: ${prd.assumptions.join("; ")}`,
    `Out of scope: ${prd.outOfScope.join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const shape = spec.kind === "list" ? "string[]" : "string";
  const capNote = spec.kind === "list" && spec.cap ? ` (at most ${spec.cap} items)` : "";

  return [
    `Regenerate ONLY the "${spec.label}" section of this PRD with a fresh alternative take that stays consistent with the rest of the plan below.`,
    "Never invent market statistics, customer research, revenue numbers, or unsupported facts. Keep it concise and in plain language.",
    "",
    context,
    "",
    `Return a single JSON object with exactly this shape: { "value": ${shape} }${capNote}.`,
    "Respond with the JSON object only — no prose, no markdown code fences.",
  ].join("\n");
}

export function parseSectionValue(key: PrdSectionKey, text: string): PRD[typeof key] {
  const spec = PRD_SECTIONS[key];
  const parsed: unknown = JSON.parse(extractJsonObject(text));
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("The AI response was not valid.");
  }
  const value = (parsed as Record<string, unknown>).value;

  if (spec.kind === "list") {
    const list = asStringList(value, spec.cap);
    if (list.length === 0) throw new Error("The AI response was missing the section content.");
    return list as PRD[typeof key];
  }

  const str = asString(value);
  if (!str) throw new Error("The AI response was missing the section content.");
  return str as PRD[typeof key];
}
