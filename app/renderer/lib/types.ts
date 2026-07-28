// Core domain types for Cehua plans.

export type FlowStepType = "entry" | "action" | "decision" | "success" | "exit";

export interface FlowBranch {
  label: string;
  result: string;
}

export interface FlowStep {
  id: string;
  type: FlowStepType;
  title: string;
  action: string;
  result: string;
  /** Only meaningful for `type === "decision"` — the two (or more) outcomes. */
  branches?: FlowBranch[];
  /** Optional owner — a `TeamMember.id`. */
  assigneeId?: string | null;
}

export interface PRD {
  summary: string;
  problem: string;
  targetUser: string;
  userGoal: string;
  coreFeatures: string[];
  userStories: string[];
  successCriteria: string[];
  assumptions: string[];
  outOfScope: string[];
}

/** The raw inputs the user typed into the New Plan form, preserved with the plan. */
export interface PlanInputs {
  name: string;
  idea: string;
  targetUser: string;
  problem: string;
  goal: string;
}

/** A person working on the plan. Local only — no accounts or sync. */
export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  /** Index into the fixed color palette; keeps each person's color stable. */
  colorIndex: number;
}

/**
 * Per-item ownership for the two assignable PRD lists. Each array is aligned
 * by index to the matching `prd` list; a slot holds a `TeamMember.id` or null.
 */
export interface PlanAssignments {
  coreFeatures?: (string | null)[];
  userStories?: (string | null)[];
}

export interface Plan {
  id: string;
  name: string;
  inputs: PlanInputs;
  prd: PRD;
  flow: FlowStep[];
  /** People organizing this plan (optional — older plans have none). */
  team?: TeamMember[];
  /** Owner assignments for core features and user stories (optional). */
  assignments?: PlanAssignments;
  createdAt: number;
  updatedAt: number;
}

/** The AI-generated payload before it becomes a persisted Plan. */
export interface GeneratedPlan {
  name: string;
  prd: PRD;
  flow: FlowStep[];
}
