import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/+esm';
import { CONFIG } from '../game/config.js';
import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';

/**
 * Game Renderer
 * Handles all PixiJS rendering
 */
export class GameRenderer {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        
        this.playerSprite = null;
        this.enemySprites = [];
        this.itemSprites = [];
    }

    clear() {
        this.container.removeChildren();
        this.playerSprite = null;
        this.enemySprites = [];
        this.itemSprites = [];
    }

    renderMap(map) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = new PIXI.Graphics();
                if (map[y][x] === 'WALL') {
                    tile.rect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE)
                        .fill(CONFIG.COLORS.WALL);
                } else {
                    tile.rect(1, 1, CONFIG.TILE_SIZE - 2, CONFIG.TILE_SIZE - 2)
                        .fill(CONFIG.COLORS.FLOOR);
                }
                tile.x = x * CONFIG.TILE_SIZE;
                tile.y = y * CONFIG.TILE_SIZE;
                this.container.addChild(tile);
            }
        }
    }

    renderStairs(stairs) {
        if (!stairs) return;
        
        const graphics = new PIXI.Graphics();
        graphics.rect(4, 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8)
            .fill(CONFIG.COLORS.STAIRS);
        graphics.x = stairs.x * CONFIG.TILE_SIZE;
        graphics.y = stairs.y * CONFIG.TILE_SIZE;
        graphics.zIndex = 1;
        this.container.addChild(graphics);
    }

    renderItems(items) {
        this.itemSprites = [];
        
        items.forEach(item => {
            const graphics = new PIXI.Graphics();
            graphics.circle(CONFIG.TILE_SIZE / 2, CONFIG.TILE_SIZE / 2, 8)
                .fill(CONFIG.COLORS.HEALTH);
            graphics.x = item.x * CONFIG.TILE_SIZE;
            graphics.y = item.y * CONFIG.TILE_SIZE;
            graphics.zIndex = 2;
            this.container.addChild(graphics);
            this.itemSprites.push(graphics);
        });
    }

    renderEnemies(enemies) {
        this.enemySprites = [];
        
        enemies.forEach(enemyData => {
            const sprite = new Enemy(enemyData);
            sprite.updatePosition();
            sprite.zIndex = 3;
            this.container.addChild(sprite);
            this.enemySprites.push(sprite);
        });
    }

    renderPlayer(playerData) {
        this.playerSprite = new Player(playerData);
        this.playerSprite.updatePosition();
        this.playerSprite.zIndex = 4;
        this.container.addChild(this.playerSprite);
    }

    updateEnemies(enemies) {
        // Remove old enemy sprites
        this.enemySprites.forEach(s => this.container.removeChild(s));
        this.enemySprites = [];
        
        // Recreate
        this.renderEnemies(enemies);
    }

    updateItems(items) {
        this.itemSprites.forEach(s => this.container.removeChild(s));
        this.itemSprites = [];
        
        this.renderItems(items);
    }

    updatePlayerPosition(playerData) {
        if (this.playerSprite) {
            this.playerSprite.data = playerData;
            this.playerSprite.updatePosition();
        }
    }

    animatePlayer(time) {
        if (this.playerSprite) {
            this.playerSprite.animate(time);
        }
    }

    flashEnemy(index) {
        if (this.enemySprites[index]) {
            this.enemySprites[index].flashHit();
        }
    }
}
