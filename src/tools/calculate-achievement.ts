import type { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import { loadKpiProfile } from "../data/kpi-repository.js";
import { calculateKpiAchievement } from "../domain/achievement.js";

const inputSchema = z.object({
  kpiId: z.string().min(1).describe("달성률을 계산할 KPI ID"),
});

const outputSchema = z.object({
  id: z.string(),
  category: z.string(),
  name: z.string(),
  target: z.number(),
  actual: z.number(),
  unit: z.string(),
  achievementRate: z.number(),
  status: z.enum(["달성", "미달"]),
});

export function registerCalculateAchievementTool(server: McpServer): void {
  server.registerTool(
    "calculate_achievement",
    {
      title: "KPI 달성률 계산",
      description: "KPI ID를 기준으로 목표 대비 현재 달성률과 상태를 계산합니다.",
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ kpiId }) => {
      try {
        const profile = await loadKpiProfile();
        const kpi = profile.kpis.find((candidate) => candidate.id === kpiId);

        if (kpi === undefined) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `KPI를 찾을 수 없습니다: ${kpiId}`,
              },
            ],
          };
        }

        const achievement = calculateKpiAchievement(kpi);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(achievement, null, 2),
            },
          ],
          structuredContent: achievement,
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `KPI 달성률을 계산하지 못했습니다: ${message}`,
            },
          ],
        };
      }
    },
  );
}
