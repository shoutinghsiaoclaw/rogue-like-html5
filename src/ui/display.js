import { CONFIG } from '../game/config.js';

/**
 * UI Display
 */
export function updateUI(player, floor) {
    document.getElementById('hp-text').textContent = player.hp;
    document.getElementById('max-hp-text').textContent = player.maxHp;

    const hpPercent = (player.hp / player.maxHp) * 100;
    const hpFill = document.getElementById('hp-fill');
    hpFill.style.width = hpPercent + '%';

    if (hpPercent > 60) {
        hpFill.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
    } else if (hpPercent > 30) {
        hpFill.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    } else {
        hpFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }

    document.getElementById('floor-text').textContent = floor;
}

export function showMessage(text, callback) {
    const overlay = document.getElementById('message-overlay');
    document.getElementById('message-text').textContent = text;
    overlay.style.display = 'flex';

    const handler = () => {
        overlay.style.display = 'none';
        document.removeEventListener('click', handler);
        document.removeEventListener('touchstart', handler);
        callback();
    };

    setTimeout(() => {
        document.addEventListener('click', handler);
        document.addEventListener('touchstart', handler);
    }, 500);
}

export function hideMessage() {
    document.getElementById('message-overlay').style.display = 'none';
}
