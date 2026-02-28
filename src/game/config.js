/**
 * Game Constants - Centralized configuration
 */
export const CONFIG = Object.freeze({
    TILE_SIZE: 28,
    GRID_WIDTH: 20,
    GRID_HEIGHT: 14,
    MAX_FLOORS: 5,
    
    PLAYER: {
        START_HP: 100,
        ATTACK: 12,
        DEFENSE: 5
    },
    
    SPAWN: {
        ENEMIES_PER_FLOOR: 2,
        ITEMS_PER_FLOOR: 1
    },
    
    // Color palette
    COLORS: Object.freeze({
        BACKGROUND: 0x0a0a12,
        WALL: 0x2a2a3a,
        FLOOR: 0x151520,
        PLAYER: 0x4ade80,
        SLIME: 0x60a5fa,
        SKELETON: 0xe5e5e5,
        STAIRS: 0xfbbf24,
        HEALTH: 0xf472b6,
        HIT_EFFECT: 0xff0000
    })
});
