import { readFile } from "node:fs/promises";

import { isKpiProfile, type KpiProfile } from "../domain/kpi.js";

const KPI_LOCAL_DATA_URL = new URL("../../data/kpis.local.json", import.meta.url);
const KPI_EXAMPLE_DATA_URL = new URL(
  "../../data/kpis.example.json",
  import.meta.url,
);

async function resolveDefaultDataUrl(): Promise<URL> {
  try {
    await readFile(KPI_LOCAL_DATA_URL, "utf8");
    return KPI_LOCAL_DATA_URL;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return KPI_EXAMPLE_DATA_URL;
    }

    throw error;
  }
}

export async function loadKpiProfile(dataUrl?: URL): Promise<KpiProfile> {
  const resolvedDataUrl = dataUrl ?? (await resolveDefaultDataUrl());
  const contents = await readFile(resolvedDataUrl, "utf8");
  const data: unknown = JSON.parse(contents);

  if (!isKpiProfile(data)) {
    throw new Error("KPI 데이터 형식이 올바르지 않습니다.");
  }

  const ids = new Set(data.kpis.map((kpi) => kpi.id));

  if (ids.size !== data.kpis.length) {
    throw new Error("KPI ID는 중복될 수 없습니다.");
  }

  return data;
}
