// Local plans library backed by localStorage, exposed to React via
// useSyncExternalStore so the sidebar and workspace stay in sync without a
// remote data layer. All plans live on the user's Mac only.

import { useSyncExternalStore } from "react";

import type { Plan } from "./types";

const STORAGE_KEY = "cehua.plans.v1";

function loadFromDisk(): Plan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Plan[]).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

let plans: Plan[] = loadFromDisk();
const listeners = new Set<() => void>();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // Storage unavailable/full — keep the in-memory copy so the session works.
  }
}

function commit(next: Plan[]): void {
  plans = next.sort((a, b) => b.updatedAt - a.updatedAt);
  persist();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Plan[] {
  return plans;
}

function newId(): string {
  return `plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function usePlans(): Plan[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function usePlan(id: string | undefined): Plan | undefined {
  const all = usePlans();
  return id ? all.find((plan) => plan.id === id) : undefined;
}

export function createPlan(data: Omit<Plan, "id" | "createdAt" | "updatedAt">): Plan {
  const now = Date.now();
  const plan: Plan = { ...data, id: newId(), createdAt: now, updatedAt: now };
  commit([plan, ...plans]);
  return plan;
}

export function updatePlan(id: string, patch: Partial<Omit<Plan, "id" | "createdAt">>): void {
  let changed = false;
  const next = plans.map((plan) => {
    if (plan.id !== id) return plan;
    changed = true;
    return { ...plan, ...patch, updatedAt: Date.now() };
  });
  if (changed) commit(next);
}

export function deletePlan(id: string): void {
  if (!plans.some((plan) => plan.id === id)) return;
  commit(plans.filter((plan) => plan.id !== id));
}
