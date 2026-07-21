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
