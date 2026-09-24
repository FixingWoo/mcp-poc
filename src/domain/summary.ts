import { calculateKpiAchievement } from "./achievement.js";
import type { KpiProfile } from "./kpi.js";

export interface UnmetKpiSummary {
  readonly id: string;
  readonly category: string;
  readonly name: string;
  readonly achievementRate: number;
}

export interface KpiSummary {
  readonly owner: string;
  readonly totalCount: number;
  readonly achievedCount: number;
  readonly unmetCount: number;
  readonly averageAchievementRate: number;
  readonly unmetKpis: UnmetKpiSummary[];
}

export function summarizeKpis(profile: KpiProfile): KpiSummary {
  const achievements = profile.kpis.map(calculateKpiAchievement);
  const achievedCount = achievements.filter(
    ({ status }) => status === "달성",
  ).length;
  const averageAchievementRate =
    achievements.length === 0
      ? 0
      : Math.round(
          (achievements.reduce(
            (sum, { achievementRate }) =>
              sum + Math.min(achievementRate, 100),
            0,
          ) /
            achievements.length) *
            100,
        ) / 100;

  return {
    owner: profile.owner,
    totalCount: achievements.length,
    achievedCount,
    unmetCount: achievements.length - achievedCount,
    averageAchievementRate,
    unmetKpis: achievements
      .filter(({ status }) => status === "미달")
      .map(({ id, category, name, achievementRate }) => ({
        id,
        category,
        name,
        achievementRate,
      })),
  };
}
