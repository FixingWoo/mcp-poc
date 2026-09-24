import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const fixturePath = fileURLToPath(
  new URL("./fixtures/kpis.json", import.meta.url),
);

const client = new Client({ name: "mcp-kpi-poc-test", version: "0.1.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/index.js"],
  cwd: projectRoot,
  env: {
    ...process.env,
    KPI_DATA_PATH: fixturePath,
  },
  stderr: "pipe",
});

before(async () => {
  await client.connect(transport);
});

after(async () => {
  await client.close();
});

test("MCP 서버가 세 개의 KPI 도구를 제공한다", async () => {
  const { tools } = await client.listTools();
  const names = tools.map(({ name }) => name).sort();

  assert.deepEqual(names, [
    "calculate_achievement",
    "list_kpis",
    "summarize_kpis",
  ]);
});

test("list_kpis가 전체 KPI를 반환한다", async () => {
  const result = await client.callTool({ name: "list_kpis", arguments: {} });
  const profile = JSON.parse(result.content[0].text);

  assert.equal(result.isError, undefined);
  assert.equal(profile.owner, "테스트 사용자");
  assert.equal(profile.kpis.length, 3);
});

test("calculate_achievement가 미달 KPI를 계산한다", async () => {
  const result = await client.callTool({
    name: "calculate_achievement",
    arguments: { kpiId: "in-progress" },
  });

  assert.equal(result.structuredContent.achievementRate, 50);
  assert.equal(result.structuredContent.status, "미달");
});

test("calculate_achievement가 달성 KPI를 계산한다", async () => {
  const result = await client.callTool({
    name: "calculate_achievement",
    arguments: { kpiId: "completed" },
  });

  assert.equal(result.structuredContent.achievementRate, 100);
  assert.equal(result.structuredContent.status, "달성");
});

test("calculate_achievement가 없는 KPI를 오류로 반환한다", async () => {
  const result = await client.callTool({
    name: "calculate_achievement",
    arguments: { kpiId: "missing" },
  });

  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /KPI를 찾을 수 없습니다/);
});

test("calculate_achievement가 잘못된 입력을 거부한다", async () => {
  const result = await client.callTool({
    name: "calculate_achievement",
    arguments: {},
  });

  assert.equal(result.isError, true);
});

test("summarize_kpis가 전체 현황과 미달 목록을 요약한다", async () => {
  const result = await client.callTool({
    name: "summarize_kpis",
    arguments: {},
  });
  const summary = result.structuredContent;

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.achievedCount, 1);
  assert.equal(summary.unmetCount, 2);
  assert.equal(summary.averageAchievementRate, 50);
  assert.deepEqual(
    summary.unmetKpis.map(({ id }) => id),
    ["not-started", "in-progress"],
  );
});
