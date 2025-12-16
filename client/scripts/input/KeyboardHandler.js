// Keyboard Input Handler
export class KeyboardHandler {
    constructor(gameState) {
        this.gameState = gameState;
        this.keys = {};
        this.cameraMovementActive = false;
    }

    init(onArrowKey, onEnter, onCameraMove) {
        document.addEventListener('keydown', e => this.onKeyDown(e, onArrowKey, onEnter));
        document.addEventListener('keyup', e => this.onKeyUp(e));

        // Camera movement loop
        setInterval(() => {
            if (onCameraMove) onCameraMove(this.keys);
        }, 1000 / 60); // 60 FPS
    }

    onKeyDown(e, onArrowKey, onEnter) {
        const key = e.key.toLowerCase();
        this.keys[key] = true;

        // Arrow keys for tile selection
        if (
            this.gameState.selectedTileIndex !== null &&
            ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
        ) {
            e.preventDefault();
            if (onArrowKey) onArrowKey(key);
        }

        // Enter to build/conquer
        if (key === 'enter' && this.gameState.selectedTileIndex !== null) {
            e.preventDefault();
            if (onEnter) onEnter();
        }
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    getMovementInput(panSpeed) {
        const input = { dx: 0, dy: 0 };
        if (this.keys['w']) input.dy += panSpeed;
        if (this.keys['a']) input.dx += panSpeed;
        if (this.keys['s']) input.dy -= panSpeed;
        if (this.keys['d']) input.dx -= panSpeed;
        return input;
    }
}
