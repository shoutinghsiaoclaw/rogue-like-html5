import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/+esm';
import { CONFIG } from './config.js';
import { DungeonGenerator } from './dungeon.js';
import { GameRenderer } from './renderer.js';
import { setupControls } from '../utils/controls.js';
import { showMessage, hideMessage, updateUI } from '../ui/display.js';

/**
 * Main Game Class
 */
export class Game {
    constructor() {
        this.app = null;
        this.dungeon = new DungeonGenerator();
        this.renderer = null;
        this.gameState = null;
    }

    async init() {
        // Initialize PixiJS
        this.app = new PIXI.Application();
        
        await this.app.init({
            width: CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE,
            height: CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE,
            backgroundColor: CONFIG.COLORS.FLOOR,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.getElementById('game-container').insertBefore(
            this.app.canvas,
            document.getElementById('ui')
        );

        this.renderer = new GameRenderer(this.app);

        // Setup controls
        setupControls({
            onMove: (dx, dy) => this.move(dx, dy),
            onAttack: () => this.attack()
        });

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Start first floor
        this.startFloor();

        // Game loop
        this.app.ticker.add((ticker) => this.update(ticker.lastTime));
    }

    startFloor() {
        this.gameState = this.dungeon.generate(this.gameState?.floor || 1);
        
        this.renderer.clear();
        this.renderer.renderMap(this.gameState.map);
        this.renderer.renderStairs(this.gameState.stairs);
        this.renderer.renderItems(this.gameState.items);
        this.renderer.renderEnemies(this.gameState.enemies);
        this.renderer.renderPlayer(this.gameState.player);
        
        updateUI(this.gameState.player, this.gameState.floor);
        hideMessage();
    }

    move(dx, dy) {
        if (this.gameState.state !== 'PLAYING') return;

        const { player, map } = this.gameState;
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (map[newY] && map[newY][newX] === 'FLOOR') {
            player.x = newX;
            player.y = newY;
            this.checkCollisions();
            this.renderer.updatePlayerPosition(player);
        }
    }

    attack() {
        if (this.gameState.state !== 'PLAYING') return;

        const { player, enemies } = this.gameState;
        
        // Flash player
        this.renderer.playerSprite?.flash();

        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        let hit = false;

        dirs.forEach(([dx, dy]) => {
            const tx = player.x + dx;
            const ty = player.y + dy;

            enemies.forEach((e, i) => {
                if (e.x === tx && e.y === ty) {
                    const damage = Math.max(1, player.attack - e.defense);
                    e.hp -= damage;
                    hit = true;

                    this.renderer.flashEnemy(i);

                    if (e.hp <= 0) {
                        enemies.splice(i, 1);
                    }
                }
            });
        });

        if (hit) {
            this.renderer.updateEnemies(enemies);
        }
    }

    checkCollisions() {
        const { player, items, stairs, enemies, floor } = this.gameState;

        // Items
        player.hp = Math.min(player.hp + 30, player.maxHp);
        this.gameState.items = items.filter(item => {
            if (item.x === player.x && item.y === player.y) {
                player.hp = Math.min(player.hp + 30, player.maxHp);
                return false;
            }
            return true;
        });
        this.renderer.updateItems(this.gameState.items);

        // Stairs
        if (stairs && player.x === stairs.x && player.y === stairs.y) {
            this.nextFloor();
            return;
        }

        // Enemies
        this.gameState.enemies = enemies.filter(e => {
            if (e.x === player.x && e.y === player.y) {
                const damage = Math.max(1, e.attack - player.defense);
                player.hp -= damage;

                // Push enemy
                const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                const newX = e.x + dir[0];
                const newY = e.y + dir[1];
                
                if (this.dungeon.isWalkable(newX, newY) && !this.gameState.isOccupied(newX, newY)) {
                    e.x = newX;
                    e.y = newY;
                }
                return true;
            }
            return true;
        });

        if (player.hp <= 0) {
            this.gameState.state = 'LOST';
            showMessage(
                `💀 GAME OVER\n\nFloor: ${floor}\n\nTap to restart`,
                () => {
                    this.gameState.floor = 1;
                    this.startFloor();
                }
            );
        }

        updateUI(player, this.gameState.floor);
        this.renderer.updateEnemies(this.gameState.enemies);
    }

    nextFloor() {
        if (this.gameState.floor >= CONFIG.MAX_FLOORS) {
            this.gameState.state = 'WON';
            showMessage(
                `🎉 YOU WIN!\n\nAll ${CONFIG.MAX_FLOORS} floors cleared!\n\nTap to play again`,
                () => {
                    this.gameState.floor = 1;
                    this.startFloor();
                }
            );
        } else {
            this.gameState.floor++;
            this.startFloor();
        }
    }

    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup': this.move(0, -1); break;
            case 's': case 'arrowdown': this.move(0, 1); break;
            case 'a': case 'arrowleft': this.move(-1, 0); break;
            case 'd': case 'arrowright': this.move(1, 0); break;
            case ' ': this.attack(); break;
        }
    }

    update(time) {
        this.renderer?.animatePlayer(time);
    }
}
