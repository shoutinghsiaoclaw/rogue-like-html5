import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7/+esm';
import { CONFIG } from '../game/config.js';

/**
 * Player Entity
 */
export class Player extends PIXI.Container {
    constructor(data) {
        super();
        this.data = data;
        this._createSprite();
    }

    _createSprite() {
        const graphics = new PIXI.Graphics();
        graphics.rect(4, 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8)
            .fill(CONFIG.COLORS.PLAYER);
        this.addChild(graphics);
        this.sprite = graphics;
    }

    updatePosition() {
        this.x = this.data.x * CONFIG.TILE_SIZE;
        this.y = this.data.y * CONFIG.TILE_SIZE;
    }

    animate(time) {
        if (this.sprite) {
            this.sprite.scale.set(1 + Math.sin(time / 200) * 0.05);
        }
    }

    flash() {
        this.alpha = 0.5;
        setTimeout(() => this.alpha = 1, 100);
    }
}
