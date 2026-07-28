// Shared per-state copy for AI blocked states, used anywhere useGlazeAI's
// state can land on a blocked value (home view generation, PRD section
// regeneration). Glaze shows its own consent/upsell UI on each attempt; these
// messages explain a request that stayed blocked.

export const BLOCKED_MESSAGE: Record<string, string> = {
  "needs-consent": "AI access wasn’t allowed. Try again when you’re ready.",
  "signed-out": "Sign in to Glaze to generate a plan.",
  "needs-subscription": "This needs an upgraded Glaze plan. Try again to see options.",
  "insufficient-credits": "You’re out of Glaze AI credits for now.",
  "daily-limit-reached": "You’ve reached today’s AI limit for this app.",
  "host-unavailable": "Glaze couldn’t be reached. Try again.",
  disabled: "AI is currently unavailable for this account.",
};

export function isBlockedState(state: string): boolean {
  return state in BLOCKED_MESSAGE;
}
