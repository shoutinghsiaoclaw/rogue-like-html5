import * as PIXI from 'https://unpkg.com/pixi.js@7.3.2/dist/esm/pixi.mjs';
import { CONFIG } from './config.js';
import { DungeonGenerator } from './dungeon.js';
import { GameRenderer } from './renderer.js';
import { setupControls } from '../utils/controls.js';
import { showMessage, hideMessage, updateUI } from '../ui/display.js';

/**
 * Main Game Class - Entry point
 * Handles game lifecycle and coordinates between systems
 */
export class Game {
    constructor() {
        this.app = null;
        this.dungeon = null;
        this.renderer = null;
        this.gameState = null;
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            // Initialize PixiJS first
            await PIXI.Application.init();
            
            // Create PixiJS application
            this.app = new PIXI.Application({
                width: CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE,
                height: CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE,
                backgroundColor: CONFIG.COLORS.FLOOR,
                resolution: Math.min(window.devicePixelRatio || 1, 2),
                autoDensity: true,
                antialias: true
            });

        // Insert canvas into DOM
        document.getElementById('game-container').insertBefore(
            this.app.canvas,
            document.getElementById('ui')
        );

        // Initialize renderer
        this.renderer = new GameRenderer(this.app);

        // Initialize dungeon generator
        this.dungeon = new DungeonGenerator();

        // Setup input handlers
        this._setupInput();

        // Start first floor
        this.startFloor();

        // Start game loop
        this.app.ticker.add((ticker) => this._update(ticker.lastTime));
    }

    _setupInput() {
        setupControls({
            onMove: (dx, dy) => this.move(dx, dy),
            onAttack: () => this.attack()
        });

        document.addEventListener('keydown', (e) => this._handleKeyDown(e));
    }

    /**
     * Start a new floor
     */
    startFloor() {
        const currentFloor = this.gameState?.floor || 1;
        this.gameState = this.dungeon.generate(currentFloor);
        
        this.renderer.render(this.gameState);
        updateUI(this.gameState.player, this.gameState.floor);
        hideMessage();
    }

    /**
     * Move player in direction
     */
    move(dx, dy) {
        if (this.gameState.state !== 'PLAYING') return;

        const { player, map } = this.gameState;
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (map[newY]?.[newX] === 'FLOOR') {
            player.x = newX;
            player.y = newY;
            this._checkCollisions();
            this.renderer.updatePlayerPosition(player);
        }
    }

    /**
     * Attack adjacent enemies
     */
    attack() {
        if (this.gameState.state !== 'PLAYING') return;

        const { player, enemies } = this.gameState;
        
        // Visual feedback
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

    /**
     * Check for collisions after movement
     */
    _checkCollisions() {
        const { player, items, stairs, enemies, floor } = this.gameState;

        // Collect items
        const wasOnItem = items.some(item => item.x === player.x && item.y === player.y);
        if (wasOnItem) {
            player.hp = Math.min(player.hp + 30, player.maxHp);
        }
        this.gameState.items = items.filter(item => !(item.x === player.x && item.y === player.y));
        this.renderer.updateItems(this.gameState.items);

        // Check stairs
        if (stairs && player.x === stairs.x && player.y === stairs.y) {
            this._nextFloor();
            return;
        }

        // Check enemy collisions
        this.gameState.enemies = enemies.filter(e => {
            if (e.x === player.x && e.y === player.y) {
                const damage = Math.max(1, e.attack - player.defense);
                player.hp -= damage;

                // Push enemy away
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

        // Check death
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

    /**
     * Progress to next floor
     */
    _nextFloor() {
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

    /**
     * Handle keyboard input
     */
    _handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup':    this.move(0, -1); break;
            case 's': case 'arrowdown':  this.move(0, 1); break;
            case 'a': case 'arrowleft':  this.move(-1, 0); break;
            case 'd': case 'arrowright': this.move(1, 0); break;
            case ' ': this.attack(); break;
        }
    }

    /**
     * Game loop - called every frame
     */
    _update(time) {
        this.renderer?.animatePlayer(time);
    }
}
