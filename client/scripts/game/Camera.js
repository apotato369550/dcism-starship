// Camera/Viewport Management
export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoomLevel = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.zoomSpeed = 0.1;
        this.panSpeed = 20;
        this.mapWidth = 20 * 40; // 20 tiles * 40px
        this.mapHeight = 20 * 40;
        this.boundsPadding = 100;
        this.panStartX = 0;
        this.panStartY = 0;
    }

    pan(dx, dy) {
        this.x += dx / this.zoomLevel;
        this.y += dy / this.zoomLevel;
        this.clamp();
    }

    panFrom(startX, startY, currentX, currentY) {
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        this.x = this.panStartX - deltaX / this.zoomLevel;
        this.y = this.panStartY - deltaY / this.zoomLevel;
        this.clamp();
    }

    capturePanStart() {
        this.panStartX = this.x;
        this.panStartY = this.y;
    }

    zoom(delta) {
        const oldZoom = this.zoomLevel;
        const zoomChange = delta > 0 ? -this.zoomSpeed : this.zoomSpeed;
        this.zoomLevel = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, this.zoomLevel + zoomChange)
        );
        return this.zoomLevel !== oldZoom;
    }

    zoomTowardsMouse(delta, screenX, screenY, canvasWidth, canvasHeight) {
        const worldX = screenX / this.zoomLevel + this.x - canvasWidth / (2 * this.zoomLevel);
        const worldY = screenY / this.zoomLevel + this.y - canvasHeight / (2 * this.zoomLevel);

        const zoomChange = delta > 0 ? -this.zoomSpeed : this.zoomSpeed;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + zoomChange));

        if (newZoom === this.zoomLevel) return false;

        this.zoomLevel = newZoom;
        this.x = worldX - (screenX / this.zoomLevel - canvasWidth / (2 * this.zoomLevel));
        this.y = worldY - (screenY / this.zoomLevel - canvasHeight / (2 * this.zoomLevel));
        this.clamp();
        return true;
    }

    clamp() {
        const minX = -this.boundsPadding;
        const maxX = this.mapWidth + this.boundsPadding;
        const minY = -this.boundsPadding;
        const maxY = this.mapHeight + this.boundsPadding;

        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    screenToWorld(screenX, screenY, canvasWidth, canvasHeight) {
        return {
            x:
                (screenX - canvasWidth / 2) / this.zoomLevel -
                this.x +
                canvasWidth / (2 * this.zoomLevel),
            y:
                (screenY - canvasHeight / 2) / this.zoomLevel -
                this.y +
                canvasHeight / (2 * this.zoomLevel),
        };
    }

    worldToScreenTile(worldPos) {
        const baseSize = 40;
        const col = Math.floor(worldPos.x / baseSize);
        const row = Math.floor(worldPos.y / baseSize);
        return row * 20 + col;
    }
}
