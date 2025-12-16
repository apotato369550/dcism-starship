// Client-side Game State Management
export class GameState {
    constructor() {
        this.map = [];
        this.myId = null;
        this.shopData = {};
        this.selectedUnitKey = null;
        this.selectedTileIndex = null;
        this.isCooldown = false;
    }

    init(data) {
        this.map = data.map;
        this.shopData = data.shop;
        this.selectedTileIndex = data.you.homeIndex;
    }

    updateTile(tile) {
        this.map[tile.id] = tile;
    }

    selectUnit(unitKey) {
        if (this.selectedUnitKey === unitKey) {
            this.selectedUnitKey = null;
        } else {
            this.selectedUnitKey = unitKey;
        }
    }

    selectTile(index) {
        if (index >= 0 && index < this.map.length) {
            this.selectedTileIndex = index;
        }
    }

    getTile(index) {
        return this.map[index];
    }

    getSelectedTile() {
        if (this.selectedTileIndex !== null) {
            return this.map[this.selectedTileIndex];
        }
        return null;
    }

    canBuild() {
        return !this.isCooldown && this.selectedUnitKey;
    }

    triggerCooldown() {
        this.isCooldown = true;
        setTimeout(() => {
            this.isCooldown = false;
        }, 3000);
    }

    isMyTile(tileIndex) {
        const tile = this.getTile(tileIndex);
        return tile && tile.owner === this.myId;
    }

    isAdjacentToMine(tileIndex) {
        const tile = this.getTile(tileIndex);
        if (!tile) return false;

        const col = tileIndex % 20;
        const row = Math.floor(tileIndex / 20);
        const neighbors = [
            { x: col - 1, y: row },
            { x: col + 1, y: row },
            { x: col, y: row - 1 },
            { x: col, y: row + 1 },
        ];

        for (let n of neighbors) {
            if (n.x >= 0 && n.x < 20 && n.y >= 0 && n.y < 20) {
                const idx = n.y * 20 + n.x;
                if (this.map[idx].owner === this.myId) return true;
            }
        }
        return false;
    }
}
