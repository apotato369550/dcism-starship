// Canvas Rendering Engine
export class Renderer {
    constructor(canvas, gameState, camera) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        this.camera = camera;
        this.baseSize = 40;
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const tileSize = this.baseSize * this.camera.zoomLevel;

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.camera.zoomLevel, this.camera.zoomLevel);
        this.ctx.translate(
            -this.canvas.width / (2 * this.camera.zoomLevel) + this.camera.x,
            -this.canvas.height / (2 * this.camera.zoomLevel) + this.camera.y
        );

        this.gameState.map.forEach((tile, i) => {
            const col = i % 20;
            const row = Math.floor(i / 20);
            const x = col * this.baseSize;
            const y = row * this.baseSize;

            // Background
            this.ctx.fillStyle = tile.owner ? tile.color : '#101015';
            this.ctx.fillRect(x, y, tileSize, tileSize);

            // Grid lines
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, tileSize, tileSize);

            // Units & Icons
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            if (tile.isHome) {
                this.ctx.font = '24px Arial';
                this.ctx.fillText('👑', x + this.baseSize / 2, y + this.baseSize / 2);
            } else if (tile.unit) {
                const u = this.gameState.shopData[tile.unit];
                this.ctx.font = '20px Arial';
                this.ctx.fillText(u ? u.symbol : '?', x + this.baseSize / 2, y + this.baseSize / 2);
            }

            // Your capital highlight (full border on all 4 sides)
            if (tile.isHome && tile.owner === this.gameState.myId) {
                this.ctx.strokeStyle = '#ffff00';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(x - 2, y - 2, this.baseSize + 4, this.baseSize + 4);
            }

            // Selection highlight
            if (this.gameState.selectedTileIndex === i) {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x, y, this.baseSize, this.baseSize);
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x + 2, y + 2, this.baseSize - 4, this.baseSize - 4);
            }

            // HP indicator
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(x + tileSize - 22, y + tileSize - 12, 20, 10);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 9px sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(tile.defense, x + this.baseSize - 4, y + this.baseSize - 3);
        });

        this.ctx.restore();
    }

    screenToWorldTile(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = screenX - rect.left;
        const y = screenY - rect.top;

        const world = this.camera.screenToWorld(x, y, this.canvas.width, this.canvas.height);
        const index = this.camera.worldToScreenTile(world);

        return index >= 0 && index < 400 ? index : -1;
    }

    updateTooltip(tooltip, tileIndex, clientX, clientY) {
        if (tileIndex < 0 || tileIndex >= this.gameState.map.length) {
            tooltip.classList.add('hidden');
            return;
        }

        const tile = this.gameState.map[tileIndex];
        let uName;
        if (tile.unit) {
            uName = this.gameState.shopData[tile.unit].name;
        } else if (tile.isHome) {
            const ownerName = this.gameState.getPlayerName(tile.owner);
            uName = `${ownerName}'s Capital`;
        } else {
            uName = 'Empty Space';
        }

        tooltip.classList.remove('hidden');
        tooltip.style.left = clientX + 15 + 'px';
        tooltip.style.top = clientY + 15 + 'px';
        tooltip.innerHTML = `
            <div style="color:${tile.color}; font-weight:bold;">${uName}</div>
            <div>DEF: ${tile.defense} / ${tile.maxDefense}</div>
            ${tile.owner ? '<div style="font-size:10px; opacity:0.7">OCCUPIED</div>' : ''}
        `;
    }
}
