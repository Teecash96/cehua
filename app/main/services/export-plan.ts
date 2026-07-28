// Business logic for exporting a plan as a Markdown file.
// The renderer builds the full Markdown string; this service only handles the
// native Save dialog + writing bytes to disk.

import * as fs from "node:fs/promises";

import { dialog, logger } from "@glaze/core/backend";

export interface ExportPlanResult {
  saved: boolean;
  canceled?: boolean;
  path?: string;
}

export async function exportPlanMarkdown(fileName: string, markdown: string): Promise<ExportPlanResult> {
  const result = await dialog.showSaveDialog({
    title: "Export Plan",
    defaultPath: fileName,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });

  if (result.canceled || !result.filePath) {
    return { saved: false, canceled: true };
  }

  try {
    await fs.writeFile(result.filePath, markdown, "utf-8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("export", "Failed to write plan markdown", { path: result.filePath, message });
    throw new Error(`Could not write file to ${result.filePath}: ${message}`);
  }

  logger.info("export", "Exported plan markdown", { path: result.filePath });
  return { saved: true, path: result.filePath };
}
