// Screen 3 — the saved plans library. A personal, browsable sidebar of recent
// plans with name + last-edited time, plus rename/delete via context menu.

import * as React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import {
  AlertDialog,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Dialog,
  EmptyState,
  Input,
  Separator,
  Sidebar,
  SidebarFooter,
  SidebarList,
  SidebarListItem,
  Text,
  Toolbar,
  ToolbarActions,
  ToolbarContent,
  ToolbarRow,
  ToolbarSearchInput,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@glaze/core/components";

import { relativeTime } from "../lib/format";
import { deletePlan, updatePlan, usePlans } from "../lib/plans-store";
import type { Plan } from "../lib/types";
import { BrandMark } from "./brand-mark";

export function PlansSidebar() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const selectedId = params.planId;
  const plans = usePlans();

  const [search, setSearch] = React.useState("");
  const [renameTarget, setRenameTarget] = React.useState<Plan | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Plan | null>(null);

  const query = search.trim().toLowerCase();
  const filtered = query ? plans.filter((plan) => plan.name.toLowerCase().includes(query)) : plans;

  function openPlan(id: string) {
    navigate({ to: "/plan/$planId", params: { planId: id } });
  }

  function startRename(plan: Plan) {
    setRenameValue(plan.name);
    setRenameTarget(plan);
  }

  function confirmRename() {
    if (renameTarget) {
      const name = renameValue.trim() || renameTarget.name;
      updatePlan(renameTarget.id, { name });
    }
    setRenameTarget(null);
  }

  function confirmDelete() {
    if (deleteTarget) {
      deletePlan(deleteTarget.id);
      if (selectedId === deleteTarget.id) navigate({ to: "/" });
    }
    setDeleteTarget(null);
  }

  return (
    <>
      <Sidebar
        toolbar={
          <Toolbar>
            <ToolbarRow>
              <ToolbarContent>
                <div className="flex items-center gap-2">
                  <BrandMark />
                  <Text variant="strong">Cehua</Text>
                </div>
              </ToolbarContent>
              <ToolbarActions>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="transparent"
                      size="small"
                      iconOnly
                      aria-label="New plan"
                      onClick={() => navigate({ to: "/" })}
                    >
                      <Plus className="size-4.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New plan</TooltipContent>
                </Tooltip>
              </ToolbarActions>
            </ToolbarRow>
            <ToolbarRow>
              <ToolbarSearchInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search plans"
              />
            </ToolbarRow>
          </Toolbar>
        }
        footer={
          plans.length > 0 ? (
            <SidebarFooter>
              <Text variant="small" color="tertiary">
                {plans.length} {plans.length === 1 ? "plan" : "plans"}
              </Text>
            </SidebarFooter>
          ) : undefined
        }
      >
        <Separator className="mx-3" />
        {plans.length === 0 ? (
          <EmptyState
            placement="inline"
            title="No saved plans"
            description="Your generated plans will appear here."
            actions={
              <Text variant="small" color="tertiary" className="text-center">
                ⌘N new plan · ⌘K switch plans · ⌘E export
              </Text>
            }
            className="px-4 py-10"
          />
        ) : filtered.length === 0 ? (
          <EmptyState placement="inline" title="No matches" description="Try a different search." className="px-4 py-10" />
        ) : (
          <SidebarList>
            {filtered.map((plan) => (
              <ContextMenu key={plan.id}>
                <ContextMenuTrigger asChild>
                  <SidebarListItem
                    title={plan.name}
                    subtitle={relativeTime(plan.updatedAt)}
                    selected={plan.id === selectedId}
                    className={
                      plan.id === selectedId
                        ? "bg-[var(--accent)]/12 hover:bg-[var(--accent)]/15"
                        : "hover:bg-control-subtle"
                    }
                    onClick={() => openPlan(plan.id)}
                  />
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onSelect={() => openPlan(plan.id)}>Open</ContextMenuItem>
                  <ContextMenuItem onSelect={() => startRename(plan)}>Rename…</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onSelect={() => setDeleteTarget(plan)}>Delete…</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </SidebarList>
        )}
      </Sidebar>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        title="Rename plan"
        onConfirm={confirmRename}
        confirmLabel="Rename"
        size="small"
      >
        <Input
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          aria-label="Plan name"
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              confirmRename();
            }
          }}
        />
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete plan?"
        description={deleteTarget ? `“${deleteTarget.name}” will be permanently removed.` : undefined}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      >
        This can’t be undone.
      </AlertDialog>
    </>
  );
}
