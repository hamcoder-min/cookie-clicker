# 쿠키 클리커 게임 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 픽셀 아트 스타일의 쿠키 클리커(방치형) 게임을 Vite + 바닐라 JS로 만든다.

**Architecture:** 단일 `gameState` 객체 + `setInterval` 기반 게임 루프. 사용자 입력(클릭/구매)이 `state.js`의 액션 함수를 호출해 상태를 갱신하고, 100ms 주기의 게임 루프가 초당 생산량(cps)만큼 쿠키를 늘리며 화면을 다시 그린다. 1.5초 주기로 `localStorage`에 자동저장한다.

**Tech Stack:** Vite(devDependency), 바닐라 JavaScript (ES modules), HTML5 Canvas. 프레임워크·테스트 라이브러리 없음.

## Global Constraints

- 외부 이미지/스프라이트 파일을 사용하지 않는다 — 모든 픽셀 아트는 코드로 그린다 (spec 참조).
- 건물 구매 가격 상승률은 15% (`costMultiplier = 1.15`)로 고정한다 (spec 참조).
- 별도 자동화 테스트 프레임워크는 설치하지 않는다 — 순수 로직 검증은 Node 내장 `assert`로, DOM/Canvas 관련 동작은 브라우저 수동 확인으로 검증한다 (spec 참조).
- localStorage 파싱 실패 시 반드시 초기 상태로 폴백해야 한다 (spec 참조).

---

### Task 1: 프로젝트 스캐폴딩 & 페이지 뼈대

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `.gitignore`

**Interfaces:**
- Produces: `#cookie-canvas` (canvas, 200x200), `#cookie-count` (span), `#cps` (span), `#shop` (div) — 이후 모든 task가 이 DOM id들을 사용한다.

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "cookie-clicker",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: .gitignore 작성**

```
node_modules
dist
```

- [ ] **Step 3: index.html 작성**

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>쿠키 클리커</title>
  <style>
    body { font-family: sans-serif; text-align: center; background: #fdf6e3; }
    #cookie-canvas { cursor: pointer; image-rendering: pixelated; }
    .shop-row { display: flex; justify-content: space-between; max-width: 320px; margin: 8px auto; }
  </style>
</head>
<body>
  <h1>쿠키 클리커</h1>
  <p>쿠키: <span id="cookie-count">0</span> (초당 <span id="cps">0</span>)</p>
  <canvas id="cookie-canvas" width="200" height="200"></canvas>
  <h2>상점</h2>
  <div id="shop"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: 의존성 설치**

Run: `npm install`
Expected: `node_modules` 생성, `vite`가 devDependency로 설치됨.

- [ ] **Step 5: 개발 서버로 뼈대 확인**

Run: `npm run dev` (백그라운드 실행 후 `curl -s http://localhost:5173/ | grep "쿠키 클리커"`)
Expected: `<title>` 또는 `<h1>` 안에 "쿠키 클리커" 문자열이 포함된 HTML 반환. 확인 후 서버 종료.

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore index.html
git commit -m "chore: scaffold vite project with page shell"
```

---

### Task 2: 게임 상태 모듈 (state.js)

**Files:**
- Create: `src/state.js`

**Interfaces:**
- Consumes: 없음 (순수 모듈)
- Produces:
  - `BUILDINGS` — `{ id, name, baseCost, costMultiplier, cps }[]`
  - `createInitialState()` → `{ cookies: number, buildings: { [id]: number } }`
  - `getCps(state)` → `number`
  - `getBuildingCost(state, buildingId)` → `number`
  - `addCookie(state)` → `void` (state.cookies += 1)
  - `buyBuilding(state, buildingId)` → `boolean` (성공 여부)
  - `tick(state, deltaSeconds)` → `void`
  - `saveState(state)` → `void`
  - `loadState()` → state 객체

이후 Task 3~5는 이 함수 시그니처를 그대로 사용한다.

- [ ] **Step 1: src/state.js 작성**

```javascript
export const BUILDINGS = [
  { id: 'hand', name: '손수 굽기', baseCost: 15, costMultiplier: 1.15, cps: 0.1 },
  { id: 'oven', name: '작은 화덕', baseCost: 100, costMultiplier: 1.15, cps: 1 },
  { id: 'factory', name: '쿠키 공장', baseCost: 1100, costMultiplier: 1.15, cps: 8 },
];

const STORAGE_KEY = 'cookie-clicker-save';

export function createInitialState() {
  const buildings = {};
  BUILDINGS.forEach((b) => { buildings[b.id] = 0; });
  return { cookies: 0, buildings };
}

export function getCps(state) {
  return BUILDINGS.reduce((sum, b) => sum + state.buildings[b.id] * b.cps, 0);
}

export function getBuildingCost(state, buildingId) {
  const building = BUILDINGS.find((b) => b.id === buildingId);
  const owned = state.buildings[buildingId];
  return Math.ceil(building.baseCost * Math.pow(building.costMultiplier, owned));
}

export function addCookie(state) {
  state.cookies += 1;
}

export function buyBuilding(state, buildingId) {
  const cost = getBuildingCost(state, buildingId);
  if (state.cookies < cost) return false;
  state.cookies -= cost;
  state.buildings[buildingId] += 1;
  return true;
}

export function tick(state, deltaSeconds) {
  state.cookies += getCps(state) * deltaSeconds;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.cookies !== 'number' || typeof parsed.buildings !== 'object' || parsed.buildings === null) {
      return createInitialState();
    }
    return parsed;
  } catch (e) {
    return createInitialState();
  }
}
```

- [ ] **Step 2: 순수 로직 검증 (Node assert)**

Run:
```bash
node --input-type=module -e "
import assert from 'node:assert';
import { createInitialState, addCookie, buyBuilding, getBuildingCost, getCps, tick } from './src/state.js';

const state = createInitialState();
assert.strictEqual(state.cookies, 0);

addCookie(state);
assert.strictEqual(state.cookies, 1);

state.cookies = 100;
const cost = getBuildingCost(state, 'hand');
assert.strictEqual(cost, 15);
const bought = buyBuilding(state, 'hand');
assert.strictEqual(bought, true);
assert.strictEqual(state.buildings.hand, 1);
assert.strictEqual(state.cookies, 85);

const nextCost = getBuildingCost(state, 'hand');
assert.strictEqual(nextCost, Math.ceil(15 * 1.15));

state.cookies = 0;
const failedBuy = buyBuilding(state, 'oven');
assert.strictEqual(failedBuy, false);

assert.strictEqual(getCps(state), 0.1);
tick(state, 10);
assert.ok(Math.abs(state.cookies - 1) < 0.0001);

console.log('PASS');
"
```
Expected: `PASS` 출력, 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/state.js
git commit -m "feat: add game state module with buildings, cost scaling, save/load"
```

---

### Task 3: 픽셀 아트 드로잉 모듈 (pixelart.js)

**Files:**
- Create: `src/pixelart.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `drawPixelGrid(ctx, grid, colors, originX, originY, pixelSize)` → `void`
  - `drawCookie(ctx, originX, originY, pixelSize)` → `void`
  - `drawBuildingIcon(ctx, buildingId, originX, originY, pixelSize)` → `void` (buildingId: `'hand' | 'oven' | 'factory'`)

Task 4(render.js)가 이 세 함수를 그대로 사용한다.

- [ ] **Step 1: src/pixelart.js 작성**

```javascript
export function drawPixelGrid(ctx, grid, colors, originX, originY, pixelSize) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const value = grid[row][col];
      if (value === 0) continue;
      ctx.fillStyle = colors[value];
      ctx.fillRect(originX + col * pixelSize, originY + row * pixelSize, pixelSize, pixelSize);
    }
  }
}

const COOKIE_GRID = [
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
  [1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 2, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
];
const COOKIE_COLORS = { 1: '#d2a679', 2: '#5c3a21' };

const BUILDING_GRIDS = {
  hand: [
    [0, 1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
  ],
  oven: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  factory: [
    [0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
};
const BUILDING_COLORS = {
  hand: { 1: '#e8b98d' },
  oven: { 1: '#8a8a8a', 2: '#3a2a1a' },
  factory: { 1: '#9c9c9c' },
};

export function drawCookie(ctx, originX, originY, pixelSize) {
  drawPixelGrid(ctx, COOKIE_GRID, COOKIE_COLORS, originX, originY, pixelSize);
}

export function drawBuildingIcon(ctx, buildingId, originX, originY, pixelSize) {
  drawPixelGrid(ctx, BUILDING_GRIDS[buildingId], BUILDING_COLORS[buildingId], originX, originY, pixelSize);
}
```

- [ ] **Step 2: 드로잉 호출 검증 (fake ctx, Node assert)**

Canvas 없이도 `drawPixelGrid`는 `ctx.fillRect`/`ctx.fillStyle`만 사용하므로 일반 객체로 검증 가능하다.

Run:
```bash
node --input-type=module -e "
import assert from 'node:assert';
import { drawCookie, drawBuildingIcon } from './src/pixelart.js';

function makeFakeCtx() {
  return { calls: [], fillStyle: null, fillRect(...args) { this.calls.push(args); } };
}

const ctx1 = makeFakeCtx();
drawCookie(ctx1, 0, 0, 10);
assert.ok(ctx1.calls.length > 0);

const ctx2 = makeFakeCtx();
drawBuildingIcon(ctx2, 'oven', 0, 0, 10);
assert.ok(ctx2.calls.length > 0);

console.log('PASS');
"
```
Expected: `PASS` 출력, 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/pixelart.js
git commit -m "feat: add pixel art drawing module for cookie and building icons"
```

---

### Task 4: 렌더링 모듈 (render.js)

**Files:**
- Create: `src/render.js`

**Interfaces:**
- Consumes:
  - `pixelart.js`: `drawCookie(ctx, originX, originY, pixelSize)`, `drawBuildingIcon(ctx, buildingId, originX, originY, pixelSize)`
  - `state.js`: `BUILDINGS`, `getBuildingCost(state, buildingId)`, `getCps(state)`
- Produces:
  - `renderCookie(canvas, state)` → `void`
  - `triggerClickEffect()` → `void`
  - `renderStats(state, cookieCountEl, cpsEl)` → `void`
  - `renderShop(state, shopContainerEl, onBuy)` → `void` (onBuy: `(buildingId: string) => void`)

Task 5(main.js)가 이 네 함수를 그대로 사용한다.

- [ ] **Step 1: src/render.js 작성**

```javascript
import { drawCookie } from './pixelart.js';
import { BUILDINGS, getBuildingCost, getCps } from './state.js';

const BASE_PIXEL_SIZE = 12;
const GRID_DIMENSION = 10;
let clickEffectFrames = 0;

export function triggerClickEffect() {
  clickEffectFrames = 5;
}

export function renderCookie(canvas, state) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = clickEffectFrames > 0 ? 1.1 : 1;
  if (clickEffectFrames > 0) clickEffectFrames--;

  const pixelSize = BASE_PIXEL_SIZE * scale;
  const gridPixelWidth = GRID_DIMENSION * pixelSize;
  const originX = (canvas.width - gridPixelWidth) / 2;
  const originY = (canvas.height - gridPixelWidth) / 2;

  drawCookie(ctx, originX, originY, pixelSize);
}

export function renderStats(state, cookieCountEl, cpsEl) {
  cookieCountEl.textContent = Math.floor(state.cookies).toString();
  cpsEl.textContent = getCps(state).toFixed(1);
}

export function renderShop(state, shopContainerEl, onBuy) {
  shopContainerEl.innerHTML = '';
  BUILDINGS.forEach((building) => {
    const cost = getBuildingCost(state, building.id);
    const owned = state.buildings[building.id];

    const row = document.createElement('div');
    row.className = 'shop-row';

    const label = document.createElement('span');
    label.textContent = `${building.name} (${owned}개) - ${cost} cookies`;

    const button = document.createElement('button');
    button.textContent = '구매';
    button.disabled = state.cookies < cost;
    button.addEventListener('click', () => onBuy(building.id));

    row.appendChild(label);
    row.appendChild(button);
    shopContainerEl.appendChild(row);
  });
}
```

- [ ] **Step 2: 브라우저 수동 확인용 임시 마운트 코드 추가**

`src/main.js`가 아직 없으므로, 이 단계에서만 임시로 `index.html` 하단에 인라인 스크립트를 추가해 렌더링을 확인한다 (Task 5에서 제거하고 정식 main.js로 교체됨).

`index.html`의 `<script type="module" src="/src/main.js"></script>` 줄을 아래로 임시 교체:

```html
<script type="module">
  import { renderCookie, renderStats, renderShop } from '/src/render.js';
  import { createInitialState } from '/src/state.js';

  const state = createInitialState();
  state.cookies = 50;
  const canvas = document.getElementById('cookie-canvas');
  renderCookie(canvas, state);
  renderStats(state, document.getElementById('cookie-count'), document.getElementById('cps'));
  renderShop(state, document.getElementById('shop'), (id) => console.log('buy', id));
</script>
```

- [ ] **Step 3: 브라우저에서 시각 확인**

Run: `npm run dev`, 브라우저에서 `http://localhost:5173` 접속.
Expected:
- 캔버스 중앙에 갈색 픽셀 쿠키 아이콘이 보임
- "쿠키: 50 (초당 0.0)" 텍스트 표시
- 상점에 "손수 굽기 (0개) - 15 cookies" 등 3개 행과 각각 "구매" 버튼이 보임 (쿠키 50개 있으므로 손수 굽기/작은 화덕 버튼은 활성화, 쿠키 공장은 비활성화 상태여야 함 — 가격 1100 > 50)

확인 후 서버 종료.

- [ ] **Step 4: 임시 인라인 스크립트를 원래 main.js 참조로 되돌리기**

`index.html`의 `<script type="module">...</script>` 블록을 다시 아래 한 줄로 되돌린다 (Task 5에서 실제 main.js가 생성됨):

```html
<script type="module" src="/src/main.js"></script>
```

- [ ] **Step 5: Commit**

```bash
git add src/render.js index.html
git commit -m "feat: add render module for cookie canvas, stats, and shop panel"
```

---

### Task 5: 메인 진입점 & 게임 루프 (main.js) + 전체 시나리오 검증

**Files:**
- Create: `src/main.js`

**Interfaces:**
- Consumes:
  - `state.js`: `loadState()`, `saveState(state)`, `addCookie(state)`, `buyBuilding(state, buildingId)`, `tick(state, deltaSeconds)`
  - `render.js`: `renderCookie(canvas, state)`, `renderStats(state, cookieCountEl, cpsEl)`, `renderShop(state, shopContainerEl, onBuy)`, `triggerClickEffect()`

- [ ] **Step 1: src/main.js 작성**

```javascript
import { loadState, saveState, addCookie, buyBuilding, tick } from './state.js';
import { renderCookie, renderStats, renderShop, triggerClickEffect } from './render.js';

const state = loadState();

const canvas = document.getElementById('cookie-canvas');
const cookieCountEl = document.getElementById('cookie-count');
const cpsEl = document.getElementById('cps');
const shopContainerEl = document.getElementById('shop');

function rerenderAll() {
  renderCookie(canvas, state);
  renderStats(state, cookieCountEl, cpsEl);
  renderShop(state, shopContainerEl, handleBuy);
}

function handleBuy(buildingId) {
  buyBuilding(state, buildingId);
  rerenderAll();
}

canvas.addEventListener('click', () => {
  addCookie(state);
  triggerClickEffect();
  rerenderAll();
});

let lastTick = performance.now();
setInterval(() => {
  const now = performance.now();
  const deltaSeconds = (now - lastTick) / 1000;
  lastTick = now;
  tick(state, deltaSeconds);
  rerenderAll();
}, 100);

setInterval(() => saveState(state), 1500);

rerenderAll();
```

- [ ] **Step 2: 개발 서버 기동**

Run: `npm run dev`, 브라우저에서 `http://localhost:5173` 접속.

- [ ] **Step 3: 시나리오 1 — 클릭으로 쿠키 증가 확인**

캔버스(쿠키)를 5번 클릭한다.
Expected: "쿠키: 5" 표시로 증가하고, 클릭할 때마다 쿠키 아이콘이 살짝 커졌다 돌아오는 효과가 보임.

- [ ] **Step 4: 시나리오 2 — 건물 구매 후 자동 생산 확인**

쿠키가 15개 이상이 될 때까지 클릭한 뒤 "손수 굽기" 구매 버튼 클릭.
Expected: 쿠키가 15 차감되고 "손수 굽기 (1개)"로 표시 변경. 이후 아무 것도 클릭하지 않아도 "초당 0.1"만큼 쿠키 숫자가 서서히 증가함 (약 10초 대기 후 쿠키 수 확인).

- [ ] **Step 5: 시나리오 3 — 새로고침 후 상태 유지 확인**

브라우저를 새로고침(F5)한다.
Expected: 새로고침 전과 동일한 쿠키 수 및 건물 보유 개수가 유지됨 (자동저장이 1.5초 주기로 동작했으므로).

- [ ] **Step 6: 시나리오 4 — 손상된 저장 데이터 폴백 확인**

브라우저 개발자도구 콘솔에서 `localStorage.setItem('cookie-clicker-save', 'not-json')` 실행 후 새로고침.
Expected: 에러 없이 페이지가 정상 로드되고 "쿠키: 0"으로 초기화됨.

확인 후 서버 종료.

- [ ] **Step 7: Commit**

```bash
git add src/main.js
git commit -m "feat: wire up main entry point with game loop, click handler, and autosave"
```

---

## Self-Review Notes

- **Spec coverage:** 쿠키 카운터/클릭(Task 5) · 생산 건물 3종 + 가격 상승(Task 2) · 상점 패널(Task 4) · 자동저장(Task 2, 5) · 픽셀 아트 코드 드로잉(Task 3) · localStorage 파싱 실패 폴백(Task 2, Task 5 시나리오 4) · 수동 확인 시나리오(Task 5) — 모두 태스크에 매핑됨.
- **Placeholder scan:** TBD/TODO 없음, 모든 스텝에 실행 가능한 코드 또는 정확한 명령어 포함.
- **Type consistency:** `state.js`에서 정의한 함수 시그니처(`addCookie(state)`, `buyBuilding(state, buildingId)`, `tick(state, deltaSeconds)`, `getCps(state)`, `getBuildingCost(state, buildingId)`)를 `render.js`, `main.js`에서 동일하게 사용함을 확인. `pixelart.js`의 `drawCookie`/`drawBuildingIcon` 시그니처도 `render.js`에서 동일하게 사용.
