/**
 * OpenClaw Google Workspace Plugin — Entry Point
 *
 * Registers auth tools (always) and service-specific tools (conditionally)
 * based on which services are enabled in the plugin config.
 */

import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

import { resolvePluginConfig } from "./config/schema.js";
import { buildAuthTools } from "./auth/tools.js";
import { buildGmailTools } from "./services/gmail/tools.js";
import { buildCalendarTools } from "./services/calendar/tools.js";
import { buildDriveTools } from "./services/drive/tools.js";
import { buildContactsTools } from "./services/contacts/tools.js";
import { buildTasksTools } from "./services/tasks/tools.js";
import { buildSheetsTools } from "./services/sheets/tools.js";

export default definePluginEntry({
  id: "openclaw-google-workspace",
  name: "OpenClaw Google Workspace",
  description:
    "All-in-one Google Workspace integration with shared OAuth. Gmail, Calendar, Drive, Contacts, Tasks, Sheets.",
  register(api) {
    if (!api.registerTool) return;

    const config = resolvePluginConfig(api);

    // Auth tools — always registered, never optional
    for (const tool of buildAuthTools(config)) {
      api.registerTool(tool);
    }

    // Service tools — registered conditionally based on config, as optional tools
    const serviceBuilders = [
      { key: "gmail" as const, build: buildGmailTools },
      { key: "calendar" as const, build: buildCalendarTools },
      { key: "drive" as const, build: buildDriveTools },
      { key: "contacts" as const, build: buildContactsTools },
      { key: "tasks" as const, build: buildTasksTools },
      { key: "sheets" as const, build: buildSheetsTools },
    ];

    for (const { key, build } of serviceBuilders) {
      const serviceConfig = config.services[key];
      if (serviceConfig?.enabled) {
        for (const tool of build(config)) {
          api.registerTool(tool, { optional: true });
        }
      }
    }
  },
});
