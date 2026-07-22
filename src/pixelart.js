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
    [0, 2, 2, 2, 2, 0],
    [2, 2, 2, 2, 2, 2],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 0],
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
  hand: { 1: '#e8b98d', 2: '#ffffff' },
  oven: { 1: '#8a8a8a', 2: '#3a2a1a' },
  factory: { 1: '#9c9c9c' },
};

export function drawCookie(ctx, originX, originY, pixelSize) {
  drawPixelGrid(ctx, COOKIE_GRID, COOKIE_COLORS, originX, originY, pixelSize);
}

export function drawBuildingIcon(ctx, buildingId, originX, originY, pixelSize) {
  const grid = BUILDING_GRIDS[buildingId];
  const colors = BUILDING_COLORS[buildingId];
  if (!grid || !colors) return;
  drawPixelGrid(ctx, grid, colors, originX, originY, pixelSize);
}

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
