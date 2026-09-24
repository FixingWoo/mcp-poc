# MCP KPI PoC

AI 클라이언트가 MCP(Model Context Protocol)를 통해 개인 KPI 데이터를 조회하고 분석할 수 있는지 검증하는 TypeScript 기반 PoC입니다.

상세 범위와 성공 기준은 [프로젝트 기획서](docs/PROJECT_PLAN.md), 검증 결과와 도입 판단은 [PoC 결과 보고서](docs/POC_RESULT.md)를 참고하세요.

## 제공 기능

| Tool | 설명 | 입력 |
| --- | --- | --- |
| `list_kpis` | 전체 KPI와 현재 달성 현황 조회 | 없음 |
| `calculate_achievement` | 특정 KPI의 달성률과 상태 계산 | `kpiId` |
| `summarize_kpis` | 전체 평균, 달성·미달 개수 및 미달 목록 요약 | 없음 |

모든 Tool은 데이터를 변경하지 않는 읽기 전용 기능입니다.

## 요구 사항

- Node.js 22 이상
- npm

버전 확인:

```bash
node --version
npm --version
```

## 설치 및 빌드

```bash
git clone https://github.com/FixingWoo/mcp-poc.git
cd mcp-poc
npm install
npm run build
```

정상적으로 빌드되면 `dist/index.js`가 생성됩니다.

## KPI 데이터 설정

저장소의 `data/kpis.example.json`은 공개 가능한 예제 데이터입니다. 실제 데이터를 사용하려면 이 파일을 복사해 `data/kpis.local.json`을 만드세요.

```bash
cp data/kpis.example.json data/kpis.local.json
```

데이터 형식:

```json
{
  "owner": "사용자 이름",
  "kpis": [
    {
      "id": "mcp-local-poc",
      "category": "AI PoC 프로젝트 진행",
      "name": "MCP 로컬 환경 기반 PoC 1건 구현",
      "target": 100,
      "actual": 50,
      "unit": "%"
    }
  ]
}
```

- `id`: KPI를 식별하는 중복 없는 문자열
- `category`: 상위 목표
- `name`: 세부 KPI
- `target`: 목표값으로, 0보다 커야 함
- `actual`: 현재 실적으로, 0 이상이어야 함
- `unit`: `%`, `건`, `원` 등의 단위

서버는 `kpis.local.json`이 있으면 실제 데이터를 사용하고, 없으면 `kpis.example.json`을 사용합니다. `kpis.local.json`은 `.gitignore`에 등록되어 원격 저장소에 업로드되지 않습니다.

다른 위치의 데이터 파일을 사용하려면 `KPI_DATA_PATH` 환경변수에 경로를 지정할 수 있습니다.

```bash
KPI_DATA_PATH=/absolute/path/to/kpis.json npm start
```

## MCP Inspector에서 실행

프로젝트를 빌드한 뒤 공식 MCP Inspector를 실행합니다.

```bash
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

브라우저가 열리면 다음 순서로 확인합니다.

1. `Connect`를 선택합니다.
2. `Tools` 화면에서 `List Tools`를 실행합니다.
3. 확인할 Tool을 선택합니다.
4. `Run Tool`을 실행합니다.

`calculate_achievement`는 다음과 같이 KPI ID를 입력합니다.

```json
{
  "kpiId": "mcp-local-poc"
}
```

## AI 클라이언트 연결

stdio 방식의 MCP 클라이언트에는 빌드 결과를 직접 실행하도록 등록합니다. `/absolute/path/to/mcp-poc` 부분은 실제 저장소의 절대 경로로 바꿔야 합니다.

```json
{
  "mcpServers": {
    "kpi": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-poc/dist/index.js"]
    }
  }
}
```

MCP 클라이언트의 실행 명령으로 `npm start`를 사용하면 npm 출력이 프로토콜 채널에 섞일 수 있으므로 `node dist/index.js`를 직접 실행합니다.

### Codex에 등록

절대 경로를 현재 환경에 맞게 바꾼 뒤 다음 명령을 실행합니다.

```bash
codex mcp add kpi \
  --env KPI_DATA_PATH=/absolute/path/to/mcp-poc/data/kpis.local.json \
  -- node /absolute/path/to/mcp-poc/dist/index.js
```

등록 상태를 확인합니다.

```bash
codex mcp get kpi
codex mcp list
```

Codex 데스크톱이나 IDE 확장에서는 MCP 서버 등록 후 해당 클라이언트를 다시 시작합니다. 새 세션에서 “내 KPI 전체 현황을 요약해줘”와 같이 요청해 Tool 선택과 호출을 확인할 수 있습니다.

## 검증

타입 검사:

```bash
npm run typecheck
```

빌드:

```bash
npm run build
```

자동화된 MCP 통합 테스트:

```bash
npm test
```

통합 테스트는 별도의 익명 fixture로 서버를 실행해 Tool 등록, 목록 조회, 달성률 계산, 오류 처리와 전체 요약을 검증합니다.

## 주요 구조

```text
mcp-poc/
├── data/
│   └── kpis.example.json
├── docs/
│   └── PROJECT_PLAN.md
├── src/
│   ├── data/
│   ├── domain/
│   ├── tools/
│   └── index.ts
└── tests/
    ├── fixtures/
    └── mcp-tools.test.mjs
```

## PoC 제한 사항

- 로컬 JSON 파일만 지원합니다.
- 사용자 인증과 세부 권한 관리는 포함하지 않습니다.
- 데이터 변경 Tool과 실시간 동기화는 포함하지 않습니다.
- 운영 환경 배포를 전제로 하지 않습니다.
