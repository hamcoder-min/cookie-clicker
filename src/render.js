import { drawCookie, drawBuildingIcon } from './pixelart.js';
import { BUILDINGS, getBuildingCost, getCps } from './state.js';

const BASE_PIXEL_SIZE = 12;
const GRID_DIMENSION = 10;
const BUILDING_ICON_PIXEL_SIZE = 4;
const BUILDING_ICON_GRID_DIMENSION = 6;
const BUILDING_ICON_CANVAS_SIZE = BUILDING_ICON_PIXEL_SIZE * BUILDING_ICON_GRID_DIMENSION;
let clickEffectFrames = 0;

// Module-level cache of shop row DOM elements, keyed by building id.
// Rows are built once and reused across renderShop calls so in-flight
// mousedown/mouseup clicks on the buy button never land on a detached node.
const shopRowCache = new Map();

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
