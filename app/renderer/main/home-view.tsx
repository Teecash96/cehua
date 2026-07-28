// Screen 1 orchestrator (route "/"). Owns the New Plan form inputs and drives
// AI generation via useGlazeAI, then creates a plan and navigates to it.

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGlazeAI } from "@glaze/core/hooks";

import { buildPrompt, parseGeneratedPlan, SYSTEM_PROMPT } from "../lib/ai-plan";
import { BLOCKED_MESSAGE, isBlockedState } from "../lib/ai-blocked";
import { createPlan } from "../lib/plans-store";
import type { PlanInputs } from "../lib/types";
import { GeneratingView } from "../components/generating-view";
import { NewPlanView } from "../components/new-plan-view";

const EMPTY_INPUTS: PlanInputs = { name: "", idea: "", targetUser: "", problem: "", goal: "" };

export function HomeView() {
  const navigate = useNavigate();
  const { streamText, state, enableInHost } = useGlazeAI();

  const [inputs, setInputs] = React.useState<PlanInputs>(EMPTY_INPUTS);
  const [phase, setPhase] = React.useState<"form" | "generating">("form");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const bufferRef = React.useRef("");
  const finalizedRef = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const inputsRef = React.useRef(inputs);
  inputsRef.current = inputs;

  // Abort any in-flight generation if this view unmounts (stops spending credits).
  React.useEffect(() => () => abortRef.current?.abort(), []);

  const finalize = React.useCallback(() => {
    if (finalizedRef.current) return;
    const text = bufferRef.current;
    if (!text.trim()) return;
    finalizedRef.current = true;
    try {
      const generated = parseGeneratedPlan(text, inputsRef.current.name.trim());
      const plan = createPlan({
        name: generated.name,
        inputs: inputsRef.current,
        prd: generated.prd,
        flow: generated.flow,
      });
      setPhase("form");
      navigate({ to: "/plan/$planId", params: { planId: plan.id } });
    } catch {
      finalizedRef.current = false;
      setPhase("form");
      setErrorMessage("Cehua couldn’t read the generated plan. Your input is saved — try again.");
    }
  }, [navigate]);

  // Handle the hook's automatic post-consent resume: a blocked first attempt
  // delivers no output, then resumes and streams into bufferRef; when the hook
  // reports ready we finalize. If it stays blocked, surface the message.
  React.useEffect(() => {
    if (phase !== "generating") return;
    if (state === "ready" && bufferRef.current.trim()) {
      finalize();
    } else if (typeof state === "string" && isBlockedState(state)) {
      setPhase("form");
      setErrorMessage(BLOCKED_MESSAGE[state]);
    }
  }, [state, phase, finalize]);

  async function handleGenerate() {
    setErrorMessage(null);
    finalizedRef.current = false;
    bufferRef.current = "";
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("generating");

    try {
      await streamText({
        model: "smart",
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(inputsRef.current),
        maxOutputTokens: 2200,
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
        // Continue the user's request without asking them to open Glaze manually.
        // The hook resumes the stream once Glaze mints a token (handled above).
        await enableInHost().catch(() => {});
        return;
      }
      if (typeof blockedState === "string" && isBlockedState(blockedState)) {
        setPhase("form");
        setErrorMessage(BLOCKED_MESSAGE[blockedState]);
        return;
      }
      setPhase("form");
      setErrorMessage("Cehua couldn’t finish the plan. Your input is saved — try again.");
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    setPhase("form");
  }

  if (phase === "generating") {
    return <GeneratingView onCancel={handleCancel} />;
  }

  return (
    <NewPlanView
      inputs={inputs}
      onChange={(patch) => setInputs((current) => ({ ...current, ...patch }))}
      onGenerate={handleGenerate}
      errorMessage={errorMessage}
      onDismissError={() => setErrorMessage(null)}
    />
  );
}
