import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

export function createServer(): McpServer {
  return new McpServer({
    name: "mcp-kpi-poc",
    version: "0.1.0",
  });
}

void serveStdio(createServer);
console.error("MCP KPI PoC server running on stdio");
