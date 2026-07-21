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
