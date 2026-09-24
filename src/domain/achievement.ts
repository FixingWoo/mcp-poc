import type { Kpi } from "./kpi.js";

export type AchievementStatus = "달성" | "미달";

export interface KpiAchievement extends Kpi {
  readonly achievementRate: number;
  readonly status: AchievementStatus;
}

export function calculateKpiAchievement(kpi: Kpi): KpiAchievement {
  const achievementRate = Math.round((kpi.actual / kpi.target) * 10_000) / 100;

  return {
    ...kpi,
    achievementRate,
    status: achievementRate >= 100 ? "달성" : "미달",
  };
}
