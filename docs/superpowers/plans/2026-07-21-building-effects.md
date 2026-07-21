# 건물 이펙트 애니메이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 쿠키 클리커에서 생산 건물(손수 굽기/작은 화덕/쿠키 공장)을 1개 이상 보유하는 동안, 메인 쿠키 캔버스 아래쪽에 해당 건물의 2프레임 픽셀 애니메이션 이펙트를 계속 표시한다.

**Architecture:** 새 캔버스나 DOM 요소를 추가하지 않고, 기존 메인 캔버스(`#cookie-canvas`)를 세로로 확장해 쿠키 아래 3개의 고정 슬롯에 이펙트를 그린다. 애니메이션 프레임은 `performance.now()` 기준 300ms 간격으로 전환되어 렌더 호출 빈도와 무관하게 일정한 속도를 유지한다. `main.js`는 변경하지 않는다 — 기존 `renderCookie(canvas, state)` 호출이 내부적으로 이펙트까지 그리도록 확장한다.

**Tech Stack:** 기존과 동일 — Vite + 바닐라 JavaScript, HTML5 Canvas. 새 프로젝트 의존성 없음. 검증에는 Playwright를 사용하지만 프로젝트의 `package.json`에는 추가하지 않고, 검증 전용 임시 디렉토리에 설치해서 쓴다.

## Global Constraints

- 모든 이펙트는 코드로 그리는 픽셀 그리드 방식이다 — 외부 이미지/스프라이트 파일을 사용하지 않는다 (spec 참조).
- 건물당 2프레임 애니메이션, 약 300ms 간격으로 전환한다 (spec 참조).
- 이펙트는 건물 보유 개수(1개 이상)와 무관하게 슬롯당 항상 1개만 표시한다 — 개수가 늘어도 아이콘이 여러 개 생기지 않는다 (spec 참조).
- `main.js`는 이 작업 범위에서 변경하지 않는다 — 기존 `renderCookie(canvas, state)` 시그니처를 그대로 재사용한다 (spec 참조).
- 별도 자동화 테스트 프레임워크를 프로젝트에 설치하지 않는다 — 순수 로직은 Node `assert`로, DOM/캔버스 렌더링은 Playwright로 실제 브라우저를 띄워 픽셀 데이터를 직접 검증한다. Playwright는 프로젝트 `package.json`에 추가하지 않고 임시 디렉토리에 설치한다 (spec 참조).

---

### Task 1: 건물 이펙트 픽셀 아트 데이터 & 그리기 함수 (pixelart.js)

**Files:**
- Modify: `src/pixelart.js`

**Interfaces:**
- Consumes: 없음 (순수 모듈, 기존 `drawPixelGrid` 재사용)
- Produces:
  - `drawBuildingEffect(ctx, buildingId, frameIndex, originX, originY, pixelSize)` → `void`. `buildingId`는 `'hand' | 'oven' | 'factory'`. `frameIndex`는 임의의 정수(모듈로 연산으로 프레임 배열 길이만큼 순환). 알 수 없는 `buildingId`는 조용히 no-op.

Task 2(render.js)가 이 함수를 그대로 사용한다.

- [ ] **Step 1: src/pixelart.js 파일 끝에 이펙트 데이터와 함수 추가**

파일 맨 끝(기존 `drawBuildingIcon` 함수 뒤)에 아래 내용을 추가한다:

```javascript

const BUILDING_EFFECT_GRIDS = {
  hand: [
    [
      [0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [1, 1, 2, 2, 2, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
      [4, 4, 4, 3, 3, 4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    ],
    [
      [0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 1, 1, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
      [4, 4, 4, 3, 3, 4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    ],
  ],
  oven: [
    [
      [0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
      [0, 4, 0, 4, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 2, 2, 2, 2, 1, 0, 0, 0, 0],
      [1, 2, 2, 2, 2, 1, 0, 0, 0, 0],
      [1, 2, 3, 3, 2, 1, 0, 0, 0, 0],
      [1, 2, 2, 2, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    ],
    [
      [0, 4, 0, 0, 4, 0, 0, 0, 0, 0],
      [0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 2, 2, 2, 2, 1, 0, 0, 0, 0],
      [1, 2, 3, 3, 3, 1, 0, 0, 0, 0],
      [1, 2, 3, 3, 2, 1, 0, 0, 0, 0],
      [1, 2, 2, 2, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    ],
  ],
  factory: [
    [
      [0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    ],
    [
      [0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    ],
  ],
};

const BUILDING_EFFECT_COLORS = {
  hand: { 1: '#e8b98d', 2: '#ffffff', 3: '#c9a15a', 4: '#6b4423' },
  oven: { 1: '#8a8a8a', 2: '#3a2a1a', 3: '#ff8c3a', 4: '#cfcfcf' },
  factory: { 1: '#9c9c9c', 2: '#5a5a5a', 3: '#4a4a4a', 4: '#d9d9d9' },
};

export function drawBuildingEffect(ctx, buildingId, frameIndex, originX, originY, pixelSize) {
  const frames = BUILDING_EFFECT_GRIDS[buildingId];
  const colors = BUILDING_EFFECT_COLORS[buildingId];
  if (!frames || !colors) return;
  const grid = frames[frameIndex % frames.length];
  if (!grid) return;
  drawPixelGrid(ctx, grid, colors, originX, originY, pixelSize);
}
```

- [ ] **Step 2: 드로잉 호출 검증 (fake ctx, Node assert)**

Run:
```bash
node --input-type=module -e "
import assert from 'node:assert';
import { drawBuildingEffect } from './src/pixelart.js';

function makeFakeCtx() {
  return { calls: [], fillStyle: null, fillRect(...args) { this.calls.push(args); } };
}

const ctx1 = makeFakeCtx();
drawBuildingEffect(ctx1, 'hand', 0, 0, 0, 6);
assert.ok(ctx1.calls.length > 0);

const ctx2 = makeFakeCtx();
drawBuildingEffect(ctx2, 'hand', 1, 0, 0, 6);
assert.ok(ctx2.calls.length > 0);

const ctx3 = makeFakeCtx();
drawBuildingEffect(ctx3, 'hand', 2, 0, 0, 6);
assert.strictEqual(ctx3.calls.length, ctx1.calls.length);

const ctxOven = makeFakeCtx();
drawBuildingEffect(ctxOven, 'oven', 0, 0, 0, 6);
assert.ok(ctxOven.calls.length > 0);

const ctxFactory = makeFakeCtx();
drawBuildingEffect(ctxFactory, 'factory', 0, 0, 0, 6);
assert.ok(ctxFactory.calls.length > 0);

const ctx4 = makeFakeCtx();
drawBuildingEffect(ctx4, 'nonexistent', 0, 0, 0, 6);
assert.strictEqual(ctx4.calls.length, 0);

console.log('PASS');
"
```
Expected: `PASS` 출력, 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/pixelart.js
git commit -m "feat: add 2-frame pixel art effects for building animations"
```

---

### Task 2: 이펙트를 메인 캔버스에 표시 (render.js + index.html)

**Files:**
- Modify: `src/render.js`
- Modify: `index.html`

**Interfaces:**
- Consumes:
  - `pixelart.js`: `drawBuildingEffect(ctx, buildingId, frameIndex, originX, originY, pixelSize)` (Task 1에서 추가)
  - `state.js`: `BUILDINGS` (기존)
- Produces: `renderCookie(canvas, state)`의 동작 확장 — 시그니처는 변경되지 않으므로 `main.js`는 수정할 필요가 없다.

- [ ] **Step 1: index.html의 캔버스 높이를 200에서 280으로 변경**

`index.html`에서 다음 줄을 찾는다:

```html
  <canvas id="cookie-canvas" width="200" height="200"></canvas>
```

아래로 교체한다:

```html
  <canvas id="cookie-canvas" width="200" height="280"></canvas>
```

- [ ] **Step 2: src/render.js 전체를 아래 내용으로 교체**

현재 `src/render.js`는 `renderCookie`, `renderStats`, `renderShop`, `triggerClickEffect`를 export하고 있다. 아래는 이펙트 렌더링이 추가된 전체 파일 내용이다 — 파일 전체를 이 내용으로 교체한다 (기존 `renderStats`, `renderShop` 로직은 그대로 유지됨):

```javascript
import { drawCookie, drawBuildingIcon, drawBuildingEffect } from './pixelart.js';
import { BUILDINGS, getBuildingCost, getCps } from './state.js';

const BASE_PIXEL_SIZE = 12;
const GRID_DIMENSION = 10;
const COOKIE_AREA_HEIGHT = 200;
const BUILDING_ICON_PIXEL_SIZE = 4;
const BUILDING_ICON_GRID_DIMENSION = 6;
const BUILDING_ICON_CANVAS_SIZE = BUILDING_ICON_PIXEL_SIZE * BUILDING_ICON_GRID_DIMENSION;
const EFFECT_GRID_DIMENSION = 10;
const EFFECT_PIXEL_SIZE = 6;
const EFFECT_SLOT_SIZE = EFFECT_GRID_DIMENSION * EFFECT_PIXEL_SIZE;
const EFFECT_ROW_Y = COOKIE_AREA_HEIGHT + 10;
const EFFECT_FRAME_DURATION_MS = 300;
let clickEffectFrames = 0;

// Module-level cache of shop row DOM elements, keyed by building id.
// Rows are built once and reused across renderShop calls so in-flight
// mousedown/mouseup clicks on the buy button never land on a detached node.
const shopRowCache = new Map();

export function triggerClickEffect() {
  clickEffectFrames = 5;
}

function renderBuildingEffects(ctx, state, canvasWidth) {
  const gap = (canvasWidth - EFFECT_SLOT_SIZE * BUILDINGS.length) / (BUILDINGS.length + 1);
  const frameIndex = Math.floor(performance.now() / EFFECT_FRAME_DURATION_MS);
  BUILDINGS.forEach((building, index) => {
    if (state.buildings[building.id] <= 0) return;
    const slotX = gap + index * (EFFECT_SLOT_SIZE + gap);
    drawBuildingEffect(ctx, building.id, frameIndex, slotX, EFFECT_ROW_Y, EFFECT_PIXEL_SIZE);
  });
}

export function renderCookie(canvas, state) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = clickEffectFrames > 0 ? 1.1 : 1;
  if (clickEffectFrames > 0) clickEffectFrames--;

  const pixelSize = BASE_PIXEL_SIZE * scale;
  const gridPixelWidth = GRID_DIMENSION * pixelSize;
  const originX = (canvas.width - gridPixelWidth) / 2;
  const originY = (COOKIE_AREA_HEIGHT - gridPixelWidth) / 2;

  drawCookie(ctx, originX, originY, pixelSize);
  renderBuildingEffects(ctx, state, canvas.width);
}

export function renderStats(state, cookieCountEl, cpsEl) {
  cookieCountEl.textContent = Math.floor(state.cookies).toString();
  cpsEl.textContent = getCps(state).toFixed(1);
}

export function renderShop(state, shopContainerEl, onBuy) {
  BUILDINGS.forEach((building) => {
    const cost = getBuildingCost(state, building.id);
    const owned = state.buildings[building.id];

    let entry = shopRowCache.get(building.id);
    if (!entry) {
      const row = document.createElement('div');
      row.className = 'shop-row';

      const icon = document.createElement('canvas');
      icon.width = BUILDING_ICON_CANVAS_SIZE;
      icon.height = BUILDING_ICON_CANVAS_SIZE;
      icon.className = 'shop-row-icon';
      const iconCtx = icon.getContext('2d');
      drawBuildingIcon(iconCtx, building.id, 0, 0, BUILDING_ICON_PIXEL_SIZE);

      const label = document.createElement('span');

      const button = document.createElement('button');
      button.textContent = '구매';
      button.addEventListener('click', () => onBuy(building.id));

      row.appendChild(icon);
      row.appendChild(label);
      row.appendChild(button);
      shopContainerEl.appendChild(row);

      entry = { row, label, button };
      shopRowCache.set(building.id, entry);
    }

    entry.label.textContent = `${building.name} (${owned}개) - ${cost} cookies (초당 ${building.cps})`;
    entry.button.disabled = state.cookies < cost;
  });
}
```

- [ ] **Step 3: Node 모듈 로드 확인**

Run:
```bash
node --input-type=module -e "import * as r from './src/render.js'; console.log(typeof r.renderCookie, typeof r.renderStats, typeof r.renderShop, typeof r.triggerClickEffect);"
```
Expected: `function function function function` — 문법 오류가 없는지 확인하는 용도이며, `document`/`performance` 등 브라우저 전역은 함수 본문 안에서만 쓰이므로 모듈 로드 자체는 실패하지 않는다.

- [ ] **Step 4: Playwright로 실제 브라우저를 띄워 캔버스 픽셀 데이터 검증**

이 프로젝트에는 Playwright가 설치돼 있지 않다(의도적으로 — 게임 자체엔 테스트 프레임워크를 넣지 않는다). 검증 전용 임시 디렉토리에 설치해서 쓰고, 프로젝트의 `package.json`은 건드리지 않는다.

먼저 개발 서버를 백그라운드로 띄운다 (프로젝트 루트 `/Users/bplus/Desktop/vibe-coding/cookie-clicker`에서):

```bash
npm run dev -- --port 5173 --strictPort > /tmp/vite-dev-effects.log 2>&1 &
for i in $(seq 1 30); do curl -sf http://localhost:5173/ >/dev/null && echo "SERVER UP" && break; sleep 1; done
```
Expected: `SERVER UP` 출력.

Playwright를 임시 디렉토리에 설치한다 (프로젝트 디렉토리 밖에):

```bash
mkdir -p /tmp/pw-verify-effects && cd /tmp/pw-verify-effects
npm init -y >/dev/null 2>&1
npm install playwright@1.61.1
npx playwright install chromium
```
Expected: 설치 완료, 에러 없음. (이미 `~/Library/Caches/ms-playwright`에 chromium이 캐시돼 있다면 다운로드 없이 빠르게 끝난다.)

`/tmp/pw-verify-effects/drive.mjs` 파일을 아래 내용으로 작성한다:

```javascript
import { chromium } from 'playwright';
import assert from 'node:assert';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

function slotHasContent(ctxHandleResult) {
  const data = ctxHandleResult;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return true;
  }
  return false;
}

async function readSlots(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('cookie-canvas');
    const ctx = canvas.getContext('2d');
    const slotSize = 60;
    const gap = (canvas.width - slotSize * 3) / 4;
    const y = 210;
    return [0, 1, 2].map((i) => {
      const x = gap + i * (slotSize + gap);
      return Array.from(ctx.getImageData(x, y, slotSize, slotSize).data);
    });
  });
}

await page.goto('http://localhost:5173/');
await page.waitForSelector('#cookie-canvas');

// Scenario A: only 'hand' owned
await page.evaluate(() => {
  localStorage.setItem('cookie-clicker-save', JSON.stringify({
    cookies: 5000,
    buildings: { hand: 1, oven: 0, factory: 0 },
  }));
});
await page.reload();
await page.waitForSelector('#cookie-canvas');
await page.waitForTimeout(200);

const slotsA = (await readSlots(page)).map(slotHasContent);
assert.deepStrictEqual(slotsA, [true, false, false], `Scenario A failed: ${JSON.stringify(slotsA)}`);

// Scenario B: all three owned
await page.evaluate(() => {
  localStorage.setItem('cookie-clicker-save', JSON.stringify({
    cookies: 5000,
    buildings: { hand: 1, oven: 1, factory: 1 },
  }));
});
await page.reload();
await page.waitForSelector('#cookie-canvas');
await page.waitForTimeout(200);

const slotsB = (await readSlots(page)).map(slotHasContent);
assert.deepStrictEqual(slotsB, [true, true, true], `Scenario B failed: ${JSON.stringify(slotsB)}`);

// Scenario C: animation frame changes over time (hand slot, first slot)
const sample1 = (await readSlots(page))[0];
await page.waitForTimeout(350);
const sample2 = (await readSlots(page))[0];
const differs = sample1.some((v, idx) => v !== sample2[idx]);
assert.ok(differs, 'expected animation frame to change after 350ms');

assert.deepStrictEqual(errors, [], `Console/page errors: ${JSON.stringify(errors)}`);

console.log('PASS');
console.log(JSON.stringify({ slotsA, slotsB, animationChanged: differs, consoleErrors: errors }));

await browser.close();
```

실행:
```bash
cd /tmp/pw-verify-effects && node drive.mjs
```
Expected: `PASS` 출력과 함께 `{"slotsA":[true,false,false],"slotsB":[true,true,true],"animationChanged":true,"consoleErrors":[]}` 형태의 JSON.

검증이 끝나면 개발 서버를 종료한다:
```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
```

- [ ] **Step 5: Commit**

```bash
git add src/render.js index.html
git commit -m "feat: render building effect animations around the cookie"
```

---

## Self-Review Notes

- **Spec coverage:** 건물 보유 중 계속 표시(Task 2의 `state.buildings[building.id] <= 0` 스킵 로직) · 3종 모두 구현(Task 1의 `BUILDING_EFFECT_GRIDS`에 hand/oven/factory 모두 포함) · 캔버스 확장 및 쿠키 아래 배치(Task 2 Step 1, 2) · 2프레임 애니메이션 + 300ms 전환(Task 1의 프레임 배열 2개 + Task 2의 `EFFECT_FRAME_DURATION_MS`) · 코드로 그리는 픽셀 아트, 외부 이미지 없음(Task 1) · main.js 미변경(Task 2에서 render.js만 수정, main.js는 파일 목록에 없음) · 알 수 없는 buildingId/frameIndex no-op(Task 1 Step 1의 방어 코드, Step 2에서 검증) · Playwright로 픽셀 검증, 프로젝트 의존성에 미포함(Task 2 Step 4) — 모두 태스크에 매핑됨.
- **Placeholder scan:** TBD/TODO 없음, 모든 스텝에 실행 가능한 코드 또는 정확한 명령어 포함.
- **Type consistency:** `drawBuildingEffect(ctx, buildingId, frameIndex, originX, originY, pixelSize)`가 Task 1(정의)과 Task 2(호출)에서 동일한 인자 순서로 사용됨을 확인. `renderCookie(canvas, state)`의 시그니처가 기존 `main.js`가 호출하는 형태와 동일하게 유지됨을 확인 — 반환값 없음, 인자 2개 그대로.
