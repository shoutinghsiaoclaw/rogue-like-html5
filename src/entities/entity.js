import * as PIXI from 'https://unpkg.com/pixi.js@7.3.2/dist/esm/pixi.mjs';
import { CONFIG } from '../game/config.js';

/**
 * Base Entity class - All game objects inherit from this
 */
export class Entity extends PIXI.Container {
    constructor(data, type) {
        super();
        this.data = data;
        this.entityType = type;
        this.isActive = true;
    }

    updateData(newData) {
        this.data = newData;
        this.updatePosition();
    }

    updatePosition() {
        if (this.data) {
            this.x = this.data.x * CONFIG.TILE_SIZE;
            this.y = this.data.y * CONFIG.TILE_SIZE;
        }
    }

    destroy() {
        this.isActive = false;
        super.destroy({ children: true });
    }
}

/**
 * Player Entity
 */
export class PlayerEntity extends Entity {
    constructor(data) {
        super(data, 'player');
        this._createSprite();
    }

    _createSprite() {
        this.graphics = new PIXI.Graphics();
        this.graphics.rect(4, 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8)
            .fill(CONFIG.COLORS.PLAYER);
        this.addChild(this.graphics);
    }

    animate(time) {
        if (this.graphics) {
            // Subtle breathing animation
            this.graphics.scale.set(1 + Math.sin(time / 200) * 0.05);
        }
    }

    flash() {
        if (this.graphics) {
            this.alpha = 0.5;
            setTimeout(() => { this.alpha = 1; }, 100);
        }
    }
}

/**
 * Enemy Entity
 */
export class EnemyEntity extends Entity {
    constructor(data) {
        super(data, 'enemy');
        this._createSprite();
    }

    _createSprite() {
        this.graphics = new PIXI.Graphics();
        const color = this.data.type === 'SLIME' 
            ? CONFIG.COLORS.SLIME 
            : CONFIG.COLORS.SKELETON;
            
        this.graphics.rect(4, 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8)
            .fill(color);
        this.addChild(this.graphics);
    }

    flashHit() {
        if (this.graphics) {
            this.graphics.tint = CONFIG.COLORS.HIT_EFFECT;
            setTimeout(() => { 
                if (this.graphics) this.graphics.tint = 0xffffff; 
            }, 100);
        }
    }
}

/**
 * Item Entity
 */
export class ItemEntity extends Entity {
    constructor(data) {
        super(data, 'item');
        this._createSprite();
    }

    _createSprite() {
        this.graphics = new PIXI.Graphics();
        this.graphics.circle(CONFIG.TILE_SIZE / 2, CONFIG.TILE_SIZE / 2, 8)
            .fill(CONFIG.COLORS.HEALTH);
        this.addChild(this.graphics);
    }
}

/**
 * Stairs Entity
 */
export class StairsEntity extends Entity {
    constructor(data) {
        super(data, 'stairs');
        this._createSprite();
    }

    _createSprite() {
        this.graphics = new PIXI.Graphics();
        this.graphics.rect(4, 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8)
            .fill(CONFIG.COLORS.STAIRS);
        this.addChild(this.graphics);
    }
}
