// UI Coordination Manager
export class UIManager {
    constructor(gameState, statsUI, shopUI, inspectorUI, chatUI) {
        this.gameState = gameState;
        this.statsUI = statsUI;
        this.shopUI = shopUI;
        this.inspectorUI = inspectorUI;
        this.chatUI = chatUI;
        this.cdBar = document.getElementById('cd-bar');
    }

    updateStats(player) {
        this.statsUI.updateStats(player);
    }

    updateInspector(tileIndex, onDemolish) {
        this.inspectorUI.update(tileIndex, onDemolish);
    }

    triggerCooldown(onComplete) {
        this.gameState.triggerCooldown();
        this.cdBar.style.transition = 'none';
        this.cdBar.style.width = '0%';

        setTimeout(() => {
            this.cdBar.style.transition = 'width 3s linear';
            this.cdBar.style.width = '100%';
        }, 50);

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);
    }

    selectTile(index) {
        this.gameState.selectTile(index);
        this.updateInspector(index);
    }

    renderShop(onItemSelected) {
        this.shopUI.render(onItemSelected);
    }

    addChatMessage(user, msg, color) {
        this.chatUI.addMessage(user, msg, color);
    }
}
