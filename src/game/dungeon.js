import { CONFIG } from './config.js';
import { GameState } from './state.js';

/**
 * Dungeon Generator
 * Generates random rooms with enemies, items, and stairs
 */
export class DungeonGenerator {
    constructor() {
        this.state = new GameState();
    }

    generate(floor) {
        this.state.reset();
        this._createMap();
        this.state.initPlayer();
        this._spawnEnemies(floor);
        this._spawnItems(floor);
        this._placeStairs();
        
        return this.state;
    }

    _createMap() {
        const { GRID_WIDTH, GRID_HEIGHT } = CONFIG;
        
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.state.map[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                const isEdge = x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
                this.state.map[y][x] = isEdge ? 'WALL' : 'FLOOR';
            }
        }
    }

    _spawnEnemies(floor) {
        const count = CONFIG.ENEMY_SPAWN_COUNT + floor;
        
        for (let i = 0; i < count; i++) {
            const pos = this.state.getRandomEmptyPosition();
            const isSkeleton = Math.random() > 0.4;
            
            this.state.enemies.push({
                x: pos.x,
                y: pos.y,
                type: isSkeleton ? 'SKELETON' : 'SLIME',
                hp: isSkeleton ? 25 + floor * 8 : 15 + floor * 5,
                maxHp: isSkeleton ? 25 + floor * 8 : 15 + floor * 5,
                attack: isSkeleton ? 8 + floor : 5 + floor,
                defense: isSkeleton ? 3 : 1
            });
        }
    }

    _spawnItems(floor) {
        const count = CONFIG.ITEM_SPAWN_COUNT + Math.floor(floor / 2);
        
        for (let i = 0; i < count; i++) {
            const pos = this.state.getRandomEmptyPosition();
            this.state.items.push({
                x: pos.x,
                y: pos.y,
                type: 'HEALTH'
            });
        }
    }

    _placeStairs() {
        this.state.stairs = this.state.getRandomEmptyPosition();
    }

    isWalkable(x, y) {
        if (x < 0 || x >= CONFIG.GRID_WIDTH || y < 0 || y >= CONFIG.GRID_HEIGHT) return false;
        return this.state.map[y][x] === 'FLOOR';
    }
}
