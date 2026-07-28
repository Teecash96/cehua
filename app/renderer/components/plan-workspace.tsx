// Screen 2 — the generated workspace. Project name + PRD / User Flow tabs, with
// copy and export actions. Edits commit straight back to the local plan store.

import * as React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Copy, Download, MoreHorizontal, Users } from "lucide-react";

import {
  AlertDialog,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsRoot,
  TabsTrigger,
  Toolbar,
  ToolbarActions,
  ToolbarContent,
  ToolbarRow,
  toast,
} from "@glaze/core/components";

import { flowToNumberedText, planToMarkdown, prdCopyText, slugify } from "../lib/format";
import { deletePlan, updatePlan, usePlan } from "../lib/plans-store";
import type { FlowStep, Plan, PRD, TeamMember } from "../lib/types";
import { EditableText } from "./editable-text";
import { FlowDiagram } from "./flow-diagram";
import { PrdPanel } from "./prd-panel";
import { TeamManager } from "./team-manager";

interface ExportResult {
  saved: boolean;
  canceled?: boolean;
  path?: string;
}

async function exportPlanMarkdown(plan: Plan): Promise<void> {
  try {
    const result = await window.glazeAPI.glaze.ipc.invoke<ExportResult>("plan:exportMarkdown", {
      fileName: `${slugify(plan.name)}-plan.md`,
      markdown: planToMarkdown(plan),
    });
    if (result.saved) toast.success("Plan exported");
  } catch {
    toast.error("Couldn’t export the plan");
  }
}

export function PlanWorkspace() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const plan = usePlan(params.planId);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [teamOpen, setTeamOpen] = React.useState(false);

  // ⌘E exports the open plan. Kept above the early return so hook order stays
  // stable if `plan` flips between defined/undefined across renders.
  const planRef = React.useRef(plan);
  planRef.current = plan;
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey && event.key.toLowerCase() === "e" && planRef.current) {
        event.preventDefault();
        void exportPlanMarkdown(planRef.current);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!plan) {
    return (
      <div className="relative h-full">
        <div className="drag-region absolute inset-x-0 top-0 h-13" />
        <EmptyState
          className="h-full"
          title="Plan not found"
          description="This plan may have been deleted."
          actions={<Button onClick={() => navigate({ to: "/" })}>New plan</Button>}
        />
      </div>
    );
  }

  const planId = plan.id;
  const team = plan.team ?? [];

  // In-place edits and per-section AI regeneration flow through here. Because a
  // regenerated core-features/user-stories list is a brand-new set of items,
  // reset that section's owner assignments so nothing stays misaligned.
  function updatePrd(patch: Partial<PRD>) {
    const assignments = { ...(plan!.assignments ?? {}) };
    if ("coreFeatures" in patch) assignments.coreFeatures = (patch.coreFeatures ?? []).map(() => null);
    if ("userStories" in patch) assignments.userStories = (patch.userStories ?? []).map(() => null);
    updatePlan(planId, { prd: { ...plan!.prd, ...patch }, assignments });
  }

  // Editing an assignable list commits its items and aligned owners together.
  function updateAssignableSection(
    section: "coreFeatures" | "userStories",
    items: string[],
    assignees: (string | null)[],
  ) {
    updatePlan(planId, {
      prd: { ...plan!.prd, [section]: items },
      assignments: { ...(plan!.assignments ?? {}), [section]: assignees },
    });
  }

  function updateFlow(flow: FlowStep[]) {
    updatePlan(planId, { flow });
  }

  function updateTeam(members: TeamMember[]) {
    updatePlan(planId, { team: members });
  }

  async function copyText(text: string, message: string) {
    try {
      await window.glazeAPI.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Couldn’t copy to the clipboard");
    }
  }

  function confirmDelete() {
    deletePlan(planId);
    setDeleteOpen(false);
    navigate({ to: "/" });
  }

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <ToolbarRow>
          <ToolbarContent>
            <EditableText
              value={plan.name}
              onCommit={(name) => updatePlan(planId, { name: name || plan.name })}
              ariaLabel="Plan name"
              singleLine
              placeholder="Untitled plan"
              className="text-heading2"
            />
          </ToolbarContent>
          <ToolbarActions>
            <Button variant="transparent" size="small" onClick={() => setTeamOpen(true)}>
              <Users className="size-4" />
              Team{team.length > 0 ? ` · ${team.length}` : ""}
            </Button>
            <Button variant="transparent" size="small" onClick={() => copyText(prdCopyText(plan), "PRD copied")}>
              <Copy className="size-4" />
              Copy PRD
            </Button>
            <Button
              variant="transparent"
              size="small"
              onClick={() => copyText(flowToNumberedText(plan.flow, team), "User flow copied")}
            >
              <Copy className="size-4" />
              Copy flow
            </Button>
            <Button variant="filled" size="small" onClick={() => exportPlanMarkdown(plan)}>
              <Download className="size-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="transparent" size="small" iconOnly aria-label="More actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem icon="square.and.arrow.down" onSelect={() => exportPlanMarkdown(plan)}>
                  Export Markdown…
                </DropdownMenuItem>
                <DropdownMenuItem icon="trash" onSelect={() => setDeleteOpen(true)}>
                  Delete plan…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarActions>
        </ToolbarRow>
      </Toolbar>

      <TabsRoot defaultValue="prd" className="flex min-h-0 flex-1 flex-col">
        <div className="bg-[var(--accent)]/[0.04] px-5 pt-2 pb-1">
          <Tabs size="large">
            <TabsTrigger value="prd">PRD</TabsTrigger>
            <TabsTrigger value="flow">User Flow</TabsTrigger>
          </Tabs>
        </div>
        <TabsContent value="prd" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <PrdPanel plan={plan} onChange={updatePrd} onSectionChange={updateAssignableSection} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="flow" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <FlowDiagram flow={plan.flow} onChange={updateFlow} members={team} />
          </ScrollArea>
        </TabsContent>
      </TabsRoot>

      <TeamManager open={teamOpen} onOpenChange={setTeamOpen} members={team} onChange={updateTeam} />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete plan?"
        description={`“${plan.name}” will be permanently removed.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      >
        This can’t be undone.
      </AlertDialog>
    </div>
  );
}
