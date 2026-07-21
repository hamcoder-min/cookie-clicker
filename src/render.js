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
