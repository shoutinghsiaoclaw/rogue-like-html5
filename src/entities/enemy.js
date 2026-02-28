import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/+esm';
import { CONFIG } from '../game/config.js';

/**
 * Enemy Entity
 */
export class Enemy extends PIXI.Container {
    constructor(data) {
        super();
        this.data = data;
        this._createSprite();
    }

    _createSprite() {
        const color = this.data.type === 'SLIME' 
            ? CONFIG.COLORS.SLIME 
            : CONFIG.COLORS.SKELETON;
            
        const graphics = new PIXI.Graphics();
        graphics.rect(4, 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8)
            .fill(color);
        this.addChild(graphics);
        this.sprite = graphics;
    }

    updatePosition() {
        this.x = this.data.x * CONFIG.TILE_SIZE;
        this.y = this.data.y * CONFIG.TILE_SIZE;
    }

    flashHit() {
        this.sprite.tint = 0xff0000;
        setTimeout(() => this.sprite.tint = 0xffffff, 100);
    }
}
