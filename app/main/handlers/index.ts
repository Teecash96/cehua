/**
 * Handler Registration
 *
 * Register all your IPC handlers here
 */

import * as path from "path";
import { fileURLToPath } from "url";

import { appHandlers } from "./app.js";
import { exportPlanMarkdown } from "../services/export-plan.js";
import { getSettingsWindow, openSettingsWindow } from "../windows/settings-window.js";

import { ipcMain, logger } from "@glaze/core/backend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerHandlers(): void {
  logger.info("handlers", "Registering IPC handlers...");

  // Register app handlers using ipcMain API
  ipcMain.handle("app:getInfo", async (_event) => {
    return await appHandlers.getInfo();
  });

  // Return the .glaze project path (used for deep links back to the host)
  // __dirname = build/main, so two levels up is the app root
  ipcMain.handle("app:getProjectPath", async () => {
    return path.join(__dirname, "..", "..");
  });

  // Settings window handlers
  ipcMain.handle("window:openSettings", async (_event) => {
    await openSettingsWindow();
  });

  ipcMain.handle("window:closeSettings", async (_event) => {
    getSettingsWindow()?.close();
  });

  // Export a plan as a Markdown file via a native Save dialog.
  // Request: { fileName: string; markdown: string }
  // Response: { saved: boolean; canceled?: boolean; path?: string }
  ipcMain.handle("plan:exportMarkdown", async (_event, payload: unknown) => {
    if (typeof payload !== "object" || payload === null) {
      throw new Error("plan:exportMarkdown requires { fileName, markdown }");
    }
    const { fileName, markdown } = payload as { fileName?: unknown; markdown?: unknown };
    if (typeof fileName !== "string" || fileName.length === 0) {
      throw new Error("plan:exportMarkdown requires a non-empty fileName");
    }
    if (typeof markdown !== "string") {
      throw new Error("plan:exportMarkdown requires markdown text");
    }
    return await exportPlanMarkdown(fileName, markdown);
  });

  logger.info("handlers", "✓ IPC handlers registered");

  // TODO: Add more handlers here using ipcMain.handle()
  // Example:
  // ipcMain.handle('file:read', async (event, path) => {
  //   const fs = await import('fs/promises');
  //   return await fs.readFile(path, 'utf-8');
  // });
}
