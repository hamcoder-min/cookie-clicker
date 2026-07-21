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
    const buildingsValid = BUILDINGS.every(
      (b) => typeof parsed.buildings[b.id] === 'number' && Number.isFinite(parsed.buildings[b.id])
    );
    if (!buildingsValid) return createInitialState();
    return parsed;
  } catch (e) {
    return createInitialState();
  }
}
