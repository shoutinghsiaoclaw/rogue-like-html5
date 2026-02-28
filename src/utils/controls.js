/**
 * Input Controls
 */
export function setupControls(handlers) {
    const directions = [
        ['btn-up', 0, -1],
        ['btn-down', 0, 1],
        ['btn-left', -1, 0],
        ['btn-right', 1, 0]
    ];

    directions.forEach(([id, dx, dy]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('touchstart', (e) => { 
                e.preventDefault(); 
                handlers.onMove(dx, dy); 
            });
            btn.addEventListener('mousedown', () => handlers.onMove(dx, dy));
        }
    });

    const attackBtn = document.getElementById('btn-attack');
    if (attackBtn) {
        attackBtn.addEventListener('touchstart', (e) => { 
            e.preventDefault(); 
            handlers.onAttack(); 
        });
        attackBtn.addEventListener('mousedown', () => handlers.onAttack());
    }
}
