// Stats UI Management
export class StatsUI {
    constructor() {
        this.mpDisplay = document.getElementById('mpDisplay');
        this.mpsDisplay = document.getElementById('mpsDisplay');
    }

    updateStats(player) {
        this.mpDisplay.innerText = Math.floor(player.mp);
        this.mpsDisplay.innerText = '+' + player.mps;
    }
}
