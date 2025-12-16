// Mouse Input Handler
export class MouseHandler {
    constructor(canvas, gameState, renderer, audioManager) {
        this.canvas = canvas;
        this.gameState = gameState;
        this.renderer = renderer;
        this.audioManager = audioManager;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panStartCameraX = 0;
        this.panStartCameraY = 0;
    }

    init(onTileClick, onWheel, onPan) {
        this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
        this.canvas.addEventListener('click', e => this.onCanvasClick(e, onTileClick));
        this.canvas.addEventListener('wheel', e => this.onWheel(e, onWheel), { passive: false });
        this.canvas.addEventListener('mousedown', e => this.onMouseDown(e, onPan));
        document.addEventListener('mousemove', e => this.onDocumentMouseMove(e, onPan));
        document.addEventListener('mouseup', e => this.onMouseUp(e));
    }

    onMouseMove(e) {
        const tileIndex = this.renderer.screenToWorldTile(e.clientX, e.clientY);
        const tooltip = document.getElementById('tooltip');
        this.renderer.updateTooltip(tooltip, tileIndex, e.clientX, e.clientY);
    }

    onCanvasClick(e, callback) {
        if (this.gameState.isCooldown && this.gameState.selectedUnitKey) return;

        const tileIndex = this.renderer.screenToWorldTile(e.clientX, e.clientY);
        if (tileIndex < 0 || tileIndex >= 400) return;

        const tile = this.gameState.getTile(tileIndex);
        this.gameState.selectTile(tileIndex);

        if (callback) callback(tileIndex, tile);
    }

    onWheel(e, callback) {
        if (!e.ctrlKey) return;
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        if (callback) callback(e.deltaY, screenX, screenY);
    }

    onMouseDown(e, callback) {
        if (!e.ctrlKey) return;
        this.isPanning = true;
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.panStartCameraX = this.gameState.camera?.x || 0;
        this.panStartCameraY = this.gameState.camera?.y || 0;
        this.canvas.style.cursor = 'grabbing';
        // Notify camera of pan start if callback provided
        if (callback && callback.onPanStart) {
            callback.onPanStart(this.panStartCameraX, this.panStartCameraY);
        }
    }

    onDocumentMouseMove(e, callback) {
        if (!this.isPanning) return;
        if (callback && callback.onPan) {
            callback.onPan(this.panStartX, this.panStartY, e.clientX, e.clientY);
        }
    }

    onMouseUp() {
        this.isPanning = false;
        this.canvas.style.cursor = 'default';
    }
}
