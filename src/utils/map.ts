const TILE_WIDTH = 32;

/**
 * Get a tile from non-tile coordinates (like entity coordinates).
 * @param x coordinate on the x-axis
 * @param y coordinate on the y-axis
 */
export function getTileByCoords(x: number, y: number): Tile {
    return map.getTile(Math.floor(x / TILE_WIDTH), Math.floor(y / TILE_WIDTH));
}
