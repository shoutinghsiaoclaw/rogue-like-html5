import * as PIXI from 'https://unpkg.com/pixi.js@7.3.2/dist/esm/pixi.mjs';
import { CONFIG } from '../game/config.js';
import { PlayerEntity, EnemyEntity, ItemEntity, StairsEntity } from '../entities/entity.js';

/**
 * Object Pool - Reuse sprites to improve performance
 */
class EntityPool {
    constructor() {
        this.pools = {
            enemy: [],
            item: []
        };
    }

    get(type, data) {
        const pool = this.pools[type];
        
        // Find inactive entity in pool
        let entity = pool.find(e => !e.isActive);
        
        if (entity) {
            entity.isActive = true;
            entity.visible = true;
            entity.updateData(data);
            return entity;
        }
        
        // Create new if pool is empty
        switch (type) {
            case 'enemy': return new EnemyEntity(data);
            case 'item': return new ItemEntity(data);
            default: return null;
        }
    }

    release(type, entity) {
        if (entity) {
            entity.isActive = false;
            entity.visible = false;
            entity.removeFromParent();
        }
    }

    releaseAll(type) {
        const pool = this.pools[type];
        pool.forEach(e => {
            e.isActive = false;
            e.visible = false;
            e.removeFromParent();
        });
    }

    addToPool(type, entity) {
        if (entity && this.pools[type]) {
            this.pools[type].push(entity);
        }
    }
}

/**
 * Game Renderer - Handles all PixiJS rendering with best practices
 */
export class GameRenderer {
    constructor(app) {
        this.app = app;
        
        // Layer containers for proper z-ordering
        this.layers = {
            map: new PIXI.Container(),
            stairs: new PIXI.Container(),
            items: new PIXI.Container(),
            enemies: new PIXI.Container(),
            player: new PIXI.Container()
        };
        
        // Add layers to stage
        Object.values(this.layers).forEach(layer => {
            this.app.stage.addChild(layer);
        });

        // Object pools
        this.pool = new EntityPool();
        
        // Cache for map tiles
        this.tileCache = this._createTileCache();
        
        // Player reference
        this.playerSprite = null;
    }

    /**
     * Pre-create tile graphics for performance
     */
    _createTileCache() {
        const cache = {
            wall: new PIXI.Graphics().rect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE).fill(CONFIG.COLORS.WALL),
            floor: new PIXI.Graphics().rect(1, 1, CONFIG.TILE_SIZE - 2, CONFIG.TILE_SIZE - 2).fill(CONFIG.COLORS.FLOOR)
        };
        
        // Make them non-interactive and static
        Object.values(cache).forEach(g => {
            g.disableInteractvie = true;
            g.isStatic = true;
        });
        
        return cache;
    }

    /**
     * Render the entire game state
     */
    render(gameState) {
        this.clear();
        
        this._renderMap(gameState.map);
        
        if (gameState.stairs) {
            this._renderStairs(gameState.stairs);
        }
        
        this._renderItems(gameState.items);
        this._renderEnemies(gameState.enemies);
        this._renderPlayer(gameState.player);
    }

    _renderMap(map) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x] === 'WALL' ? this.tileCache.wall : this.tileCache.floor;
                const instance = tile.clone();
                instance.x = x * CONFIG.TILE_SIZE;
                instance.y = y * CONFIG.TILE_SIZE;
                this.layers.map.addChild(instance);
            }
        }
    }

    _renderStairs(stairs) {
        const sprite = new StairsEntity(stairs);
        this.layers.stairs.addChild(sprite);
    }

    _renderItems(items) {
        items.forEach(item => {
            const sprite = this.pool.get('item', item);
            this.layers.items.addChild(sprite);
        });
    }

    _renderEnemies(enemies) {
        enemies.forEach(enemy => {
            const sprite = this.pool.get('enemy', enemy);
            this.layers.enemies.addChild(sprite);
        });
    }

    _renderPlayer(player) {
        this.playerSprite = new PlayerEntity(player);
        this.layers.player.addChild(this.playerSprite);
    }

    /**
     * Update methods - For incremental updates
     */
    updatePlayerPosition(player) {
        if (this.playerSprite) {
            this.playerSprite.updateData(player);
        }
    }

    updateEnemies(enemies) {
        this.pool.releaseAll('enemy');
        
        enemies.forEach(enemy => {
            const sprite = this.pool.get('enemy', enemy);
            this.layers.enemies.addChild(sprite);
        });
    }

    updateItems(items) {
        this.pool.releaseAll('item');
        
        items.forEach(item => {
            const sprite = this.pool.get('item', item);
            this.layers.items.addChild(sprite);
        });
    }

    animatePlayer(time) {
        if (this.playerSprite) {
            this.playerSprite.animate(time);
        }
    }

    flashEnemy(index) {
        const enemies = this.layers.enemies.children;
        if (enemies[index]) {
            enemies[index].flashHit();
        }
    }

    clear() {
        Object.values(this.layers).forEach(layer => {
            layer.removeChildren();
        });
        this.playerSprite = null;
    }

    destroy() {
        Object.values(this.layers).forEach(layer => layer.destroy({ children: true }));
        this.pool = null;
    }
}
