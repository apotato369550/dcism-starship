// Tile Inspector UI Management
export class InspectorUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.div = document.getElementById('inspector');
        this.info = document.getElementById('insp-info');
        this.btnDemolish = document.getElementById('btn-demolish');
    }

    update(tileIndex, onDemolish) {
        const tile = this.gameState.getTile(tileIndex);

        if (!tile || tile.owner !== this.gameState.myId || !tile.unit) {
            this.div.classList.add('hidden');
            return;
        }

        this.div.classList.remove('hidden');
        const unit = this.gameState.shopData[tile.unit];
        this.info.innerHTML = `Structure: <b style="color:white">${unit.name}</b><br>Defense Bonus: ${unit.type === 'mil' ? unit.val : 0}`;

        this.btnDemolish.onclick = () => {
            onDemolish(tileIndex);
            this.div.classList.add('hidden');
        };
    }

    hide() {
        this.div.classList.add('hidden');
    }
}
