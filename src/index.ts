import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { registerCalculateAchievementTool } from "./tools/calculate-achievement.js";
import { registerListKpisTool } from "./tools/list-kpis.js";
import { registerSummarizeKpisTool } from "./tools/summarize-kpis.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-kpi-poc",
    version: "0.1.0",
  });

  registerListKpisTool(server);
  registerCalculateAchievementTool(server);
  registerSummarizeKpisTool(server);

  return server;
}

void serveStdio(createServer);
console.error("MCP KPI PoC server running on stdio");
