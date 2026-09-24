import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import { loadKpiProfile } from "../data/kpi-repository.js";
import { summarizeKpis } from "../domain/summary.js";

const outputSchema = z.object({
  owner: z.string(),
  totalCount: z.number().int().nonnegative(),
  achievedCount: z.number().int().nonnegative(),
  unmetCount: z.number().int().nonnegative(),
  averageAchievementRate: z.number().nonnegative(),
  unmetKpis: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      name: z.string(),
      achievementRate: z.number().nonnegative(),
    }),
  ),
});

export function registerSummarizeKpisTool(server: McpServer): void {
  server.registerTool(
    "summarize_kpis",
    {
      title: "KPI 현황 요약",
      description:
        "전체 KPI의 평균 달성률, 달성·미달 개수와 미달 항목을 요약합니다.",
      outputSchema,
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
        const summary = summarizeKpis(profile);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
          structuredContent: summary,
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `KPI 현황을 요약하지 못했습니다: ${message}`,
            },
          ],
        };
      }
    },
  );
}
