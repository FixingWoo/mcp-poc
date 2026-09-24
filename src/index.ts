import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { registerListKpisTool } from "./tools/list-kpis.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-kpi-poc",
    version: "0.1.0",
  });

  registerListKpisTool(server);

  return server;
}

void serveStdio(createServer);
console.error("MCP KPI PoC server running on stdio");
