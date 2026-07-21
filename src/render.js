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
