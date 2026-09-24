import type { McpServer } from "@modelcontextprotocol/server";

import { loadKpiProfile } from "../data/kpi-repository.js";

export function registerListKpisTool(server: McpServer): void {
  server.registerTool(
    "list_kpis",
    {
      title: "KPI 목록 조회",
      description: "사용자의 전체 KPI와 현재 달성률을 조회합니다.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const profile = await loadKpiProfile();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(profile, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `KPI 데이터를 불러오지 못했습니다: ${message}`,
            },
          ],
        };
      }
    },
  );
}
