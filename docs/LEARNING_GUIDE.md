# MCP KPI PoC 초보자 학습 가이드

이 문서는 MCP를 처음 접하는 사람이 이 프로젝트를 직접 실행하고 코드를 읽으며 전체 흐름을 이해할 수 있도록 작성한 입문 자료입니다.

## 1. MCP를 한 문장으로 이해하기

MCP(Model Context Protocol)는 **AI가 외부 프로그램의 기능과 데이터를 정해진 방식으로 사용할 수 있게 연결하는 규칙**입니다.

쉽게 비유하면 다음과 같습니다.

- Codex: 일을 요청하고 결과를 설명하는 담당자
- MCP 서버: 담당자가 사용할 수 있는 업무 시스템
- Tool: 업무 시스템의 버튼
- JSON 데이터: 업무 시스템이 읽는 자료

이 프로젝트에서는 Codex가 KPI를 직접 계산하지 않고, KPI MCP 서버의 Tool을 호출해 데이터를 받아옵니다.

```text
사용자 자연어 요청
    ↓
Codex가 적절한 Tool 선택
    ↓
KPI MCP 서버가 JSON 데이터 조회·계산
    ↓
Tool 결과 반환
    ↓
Codex가 사람이 읽기 쉬운 답변 작성
```

## 2. 이 프로젝트가 하는 일

이 프로젝트는 로컬 JSON 파일에 저장된 KPI를 다음 세 가지 방식으로 제공합니다.

| Tool | 하는 일 | 자연어 요청 예시 |
| --- | --- | --- |
| `list_kpis` | 전체 KPI 조회 | “내 KPI 전체를 보여줘” |
| `calculate_achievement` | KPI 하나의 달성률 계산 | “정보처리기사 달성률 알려줘” |
| `summarize_kpis` | 전체 현황 요약 | “현재 KPI 상황을 요약해줘” |

모든 Tool은 읽기 전용입니다. KPI 데이터를 수정하거나 삭제하지 않습니다.

## 3. 꼭 알아야 할 구성 요소

### MCP 호스트

MCP 서버를 연결하고 Tool을 사용할 수 있는 AI 애플리케이션입니다. 이 프로젝트에서는 Codex가 호스트입니다.

### MCP 서버

Tool을 등록하고 호출 요청을 처리하는 프로그램입니다. 이 프로젝트의 시작 파일은 `src/index.ts`입니다.

### Tool

AI가 호출할 수 있는 하나의 기능입니다. 일반 함수와 비슷하지만 이름, 설명, 입력 형식, 출력 형식이 함께 공개됩니다.

### stdio

Codex와 MCP 서버가 표준 입력과 표준 출력으로 메시지를 주고받는 방식입니다. 로컬 프로그램 연결에 적합합니다.

## 4. 프로젝트 구조 읽기

```text
mcp-poc/
├── data/
│   ├── kpis.example.json      # GitHub에 공개하는 예제 데이터
│   └── kpis.local.json        # 실제 로컬 데이터, Git 업로드 제외
├── docs/
│   ├── PROJECT_PLAN.md        # 기획서
│   ├── POC_RESULT.md          # 결과 보고서
│   └── LEARNING_GUIDE.md      # 현재 학습 문서
├── src/
│   ├── data/
│   │   └── kpi-repository.ts  # JSON 파일 읽기와 검증
│   ├── domain/
│   │   ├── kpi.ts             # KPI 데이터 형식
│   │   ├── achievement.ts     # 달성률 계산
│   │   └── summary.ts         # 전체 현황 요약
│   ├── tools/
│   │   ├── list-kpis.ts
│   │   ├── calculate-achievement.ts
│   │   └── summarize-kpis.ts
│   └── index.ts               # 서버 생성과 Tool 등록
└── tests/
    ├── fixtures/              # 테스트 전용 데이터
    └── mcp-tools.test.mjs     # 자동화 통합 테스트
```

처음 코드를 읽을 때는 다음 순서가 가장 쉽습니다.

1. `data/kpis.example.json`
2. `src/domain/kpi.ts`
3. `src/data/kpi-repository.ts`
4. `src/tools/list-kpis.ts`
5. `src/index.ts`

## 5. 요청 하나가 처리되는 과정

사용자가 다음과 같이 요청한다고 가정합니다.

> 내 KPI 전체를 보여줘.

처리 순서는 다음과 같습니다.

1. Codex가 사용 가능한 Tool의 이름과 설명을 확인합니다.
2. 요청과 가장 잘 맞는 `list_kpis`를 선택합니다.
3. KPI MCP 서버에 Tool 호출 요청을 보냅니다.
4. `list-kpis.ts`가 `loadKpiProfile()`을 실행합니다.
5. `kpi-repository.ts`가 `kpis.local.json`을 읽습니다.
6. 서버가 KPI 데이터를 Codex에 반환합니다.
7. Codex가 반환 데이터를 표나 문장으로 정리합니다.

중요한 점은 **Codex가 JSON 파일을 직접 읽은 것이 아니라 MCP Tool을 통해 결과를 받았다는 것**입니다.

## 6. 직접 실행해 보기

### 1단계: 설치

```bash
cd /Users/jeongwoo/Documents/ChatGPT/mcp-poc
npm install
```

### 2단계: 타입 검사와 빌드

```bash
npm run typecheck
npm run build
```

두 명령 모두 오류 없이 끝나면 서버를 실행할 준비가 된 것입니다.

### 3단계: 자동화 테스트

```bash
npm test
```

다음처럼 나오면 정상입니다.

```text
tests 10
pass 10
fail 0
```

### 4단계: MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

브라우저에서 다음 순서로 실행합니다.

1. `Connect`
2. `Tools`
3. `List Tools`
4. 원하는 Tool 선택
5. `Run Tool`

### 5단계: Codex에서 자연어 요청

Codex 앱에서 다음 문장을 차례로 입력합니다.

```text
내 KPI 전체를 보여줘.
정보처리기사 자격증 달성률을 알려줘.
현재 미달된 KPI를 요약해줘.
```

Codex가 상황에 맞게 서로 다른 Tool을 선택하면 성공입니다.

## 7. Tool 코드를 읽는 방법

`list_kpis`는 가장 단순한 Tool입니다. 핵심 흐름만 표현하면 다음과 같습니다.

```ts
server.registerTool(
  "list_kpis",
  { description: "전체 KPI를 조회합니다." },
  async () => {
    const profile = await loadKpiProfile();
    return {
      content: [{ type: "text", text: JSON.stringify(profile) }],
    };
  },
);
```

각 부분의 의미는 다음과 같습니다.

- `list_kpis`: AI가 보는 Tool 이름
- `description`: AI가 Tool 선택에 참고하는 설명
- `async () =>`: Tool이 호출되면 실행되는 함수
- `loadKpiProfile()`: KPI 데이터 읽기
- `content`: Codex에 돌려주는 결과

## 8. 데이터를 바꿔 보며 학습하기

`data/kpis.local.json`에서 한 항목의 `actual` 값을 변경합니다.

```json
{
  "id": "mcp-local-poc",
  "target": 100,
  "actual": 100,
  "unit": "%"
}
```

파일을 저장한 뒤 Codex에 다시 요청합니다.

```text
현재 KPI 상황을 다시 요약해줘.
```

MCP 서버는 Tool이 호출될 때마다 파일을 다시 읽으므로, 서버 코드를 다시 빌드하지 않아도 변경된 데이터가 반영됩니다.

## 9. 추천 학습 실험

### 실험 1: Tool 설명 바꾸기

`src/tools/list-kpis.ts`의 `description`을 바꾸고 빌드한 뒤, Codex의 Tool 선택이 어떻게 달라지는지 확인합니다.

### 실험 2: 새로운 KPI 추가하기

`kpis.local.json`에 KPI 하나를 추가하고 `list_kpis` 결과를 확인합니다.

### 실험 3: 오류 만들기

테스트용 데이터의 `target`을 0으로 설정하고 서버가 오류를 안전하게 반환하는지 확인합니다. 실제 데이터 파일보다는 `tests/fixtures`에서 실험하는 것이 안전합니다.

### 실험 4: 새 Tool 설계하기

다음 Tool을 직접 구상해 봅니다.

```text
get_unmet_kpis
```

목표는 미달 KPI만 반환하는 것입니다. 기존 `summarize_kpis` 코드를 참고하면 됩니다.

## 10. 자주 생기는 문제

### Tool이 Codex에 보이지 않음

- `npm run build`를 실행했는지 확인합니다.
- `codex mcp get kpi`로 등록 상태를 확인합니다.
- Codex 앱을 재시작합니다.
- `/mcp`에서 `kpi` 서버가 활성화됐는지 확인합니다.

### 실제 데이터가 나오지 않음

- `data/kpis.local.json`이 존재하는지 확인합니다.
- `KPI_DATA_PATH`가 올바른 절대 경로인지 확인합니다.
- JSON의 쉼표와 괄호가 올바른지 확인합니다.

### 서버 로그 때문에 연결 오류가 발생함

stdio에서는 표준 출력이 MCP 메시지 전용입니다. 일반 로그는 `console.log`가 아니라 `console.error`로 출력해야 합니다.

## 11. 학습 완료 체크리스트

다음 질문에 답할 수 있으면 이번 PoC를 충분히 이해한 것입니다.

- [ ] MCP 호스트, 서버, Tool의 차이를 설명할 수 있다.
- [ ] Codex가 자연어 요청에서 Tool을 선택하는 흐름을 설명할 수 있다.
- [ ] `list_kpis`가 데이터를 어디에서 읽는지 찾을 수 있다.
- [ ] `calculate_achievement`의 입력과 출력을 설명할 수 있다.
- [ ] `summarize_kpis`의 평균 계산 방식을 설명할 수 있다.
- [ ] MCP Inspector에서 Tool을 직접 호출할 수 있다.
- [ ] `npm test` 결과를 읽을 수 있다.
- [ ] 실제 데이터가 GitHub에 올라가지 않는 이유를 설명할 수 있다.

## 12. 핵심만 다시 정리

```text
MCP는 AI와 외부 기능을 연결하는 규칙이다.
MCP 서버는 Tool을 제공한다.
Codex는 자연어 요청에 맞는 Tool을 선택한다.
이 프로젝트의 Tool은 로컬 KPI 데이터를 조회하고 계산한다.
```

처음부터 모든 코드를 이해하려고 하기보다, `list_kpis` 한 개의 흐름을 완전히 이해한 뒤 계산과 요약 Tool로 넘어가는 것이 가장 빠른 학습 방법입니다.
