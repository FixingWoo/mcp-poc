export interface Kpi {
  readonly id: string;
  readonly category: string;
  readonly name: string;
  readonly target: number;
  readonly actual: number;
  readonly unit: string;
}

export interface KpiProfile {
  readonly owner: string;
  readonly kpis: Kpi[];
}

export function isKpi(value: unknown): value is Kpi {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.category === "string" &&
    candidate.category.length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0 &&
    typeof candidate.target === "number" &&
    Number.isFinite(candidate.target) &&
    candidate.target > 0 &&
    typeof candidate.actual === "number" &&
    Number.isFinite(candidate.actual) &&
    candidate.actual >= 0 &&
    typeof candidate.unit === "string" &&
    candidate.unit.length > 0
  );
}

export function isKpiProfile(value: unknown): value is KpiProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.owner === "string" &&
    candidate.owner.length > 0 &&
    Array.isArray(candidate.kpis) &&
    candidate.kpis.every(isKpi)
  );
}
