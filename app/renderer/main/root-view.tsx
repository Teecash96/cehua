import { Outlet, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { SplitView, Status } from "@glaze/core/components";
import { useTheme, useConnection, useEnvironment } from "@glaze/core/hooks";

import { PlanSwitcher } from "../components/plan-switcher";
import { PlansSidebar } from "../components/plans-sidebar";

export function RootView() {
  useTheme();
  const navigate = useNavigate();
  const [switcherOpen, setSwitcherOpen] = React.useState(false);

  // IPC connection and environment
  const connectionQuery = useConnection();
  const environmentQuery = useEnvironment();

  // Cleanup IPC connection on unmount
  React.useEffect(() => {
    return () => {
      window.glazeAPI?.glaze?.ipc?.disconnect();
    };
  }, []);

  // App-wide keyboard shortcuts: ⌘N for a new plan, ⌘K to switch plans. ⌘E
  // (export) lives in PlanWorkspace since it only applies to an open plan.
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.metaKey) return;
      const key = event.key.toLowerCase();
      if (key === "n") {
        event.preventDefault();
        navigate({ to: "/" });
      } else if (key === "k") {
        event.preventDefault();
        setSwitcherOpen((isOpen) => !isOpen);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="h-full relative">
      <SplitView className="h-full" storageKey="cehua-main" sidebar={<PlansSidebar />}>
        <Outlet />
      </SplitView>

      <PlanSwitcher open={switcherOpen} onOpenChange={setSwitcherOpen} />

      <div className="flex flex-col items-end gap-1 mt-2 fixed bottom-12 right-2">
        {import.meta.env.DEV ? (
          <>
            {connectionQuery.error ? <Status variant="error">Backend disconnected</Status> : null}
            {environmentQuery.data ? null : <Status variant="error">Dev Server not found</Status>}
          </>
        ) : null}
      </div>
    </div>
  );
}
