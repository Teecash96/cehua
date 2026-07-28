// Team helpers: a fixed palette of muted, distinct owner colors plus small
// utilities for initials and stable color assignment. Colors are mid-tone so a
// white initial stays readable in both light and dark appearance.

import type { TeamMember } from "./types";

export const MEMBER_COLORS = [
  "#4F5BD5", // indigo
  "#2C8C7C", // teal
  "#A24E8E", // plum
  "#B0702C", // amber
  "#6B5FC7", // violet
  "#3A7CA5", // steel blue
  "#A34B4B", // brick
  "#4F8C57", // sage
];

export function memberColor(member: Pick<TeamMember, "colorIndex">): string {
  const len = MEMBER_COLORS.length;
  return MEMBER_COLORS[((member.colorIndex % len) + len) % len];
}

export function memberInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "?";
}

export function newMemberId(): string {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** First unused palette slot so a new member's color stays distinct. */
export function nextColorIndex(team: TeamMember[]): number {
  for (let i = 0; i < MEMBER_COLORS.length; i++) {
    if (!team.some((member) => member.colorIndex === i)) return i;
  }
  return team.length % MEMBER_COLORS.length;
}

/** Resolve an owner id to a member, tolerating stale/removed ids. */
export function findMember(team: TeamMember[] | undefined, id: string | null | undefined): TeamMember | undefined {
  if (!id || !team) return undefined;
  return team.find((member) => member.id === id);
}
