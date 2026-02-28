import { CONFIG } from './config.js';

/**
 * Game State Manager
 */
export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.floor = 1;
        this.state = 'PLAYING'; // PLAYING, WON, LOST
        this.map = [];
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.stairs = null;
    }

    initPlayer() {
        this.player = {
            x: Math.floor(CONFIG.GRID_WIDTH / 2),
            y: Math.floor(CONFIG.GRID_HEIGHT / 2),
            hp: CONFIG.PLAYER_START_HP,
            maxHp: CONFIG.PLAYER_START_HP,
            attack: CONFIG.PLAYER_ATTACK,
            defense: CONFIG.PLAYER_DEFENSE
        };
    }

    isOccupied(x, y) {
        if (this.player && x === this.player.x && y === this.player.y) return true;
        if (this.enemies.some(e => e.x === x && e.y === y)) return true;
        if (this.items.some(i => i.x === x && i.y === y)) return true;
        if (this.stairs && x === this.stairs.x && y === this.stairs.y) return true;
        return false;
    }

    getRandomEmptyPosition() {
        let attempts = 0;
        while (attempts < 100) {
            const x = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
            if (!this.isOccupied(x, y)) {
                return { x, y };
            }
            attempts++;
        }
        return { x: 3, y: 3 };
    }
}
