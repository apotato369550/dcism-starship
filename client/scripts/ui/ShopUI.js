// Shop UI Management - Horizontal Bar + Modal System
export class ShopUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.container = document.getElementById('shop-items-container');
        this.modal = document.getElementById('shop-modal');
        this.modalClose = document.querySelector('.modal-close');
        this.buildBtn = document.getElementById('modal-build-btn');
        this.currentSelectedUnit = null;
        this.buildMode = false;
        this.eventListenersSetup = false; // Track if event listeners are already set up
    }

    render(onBuildModeChanged) {
        this.container.innerHTML = '';
        this.onBuildModeChanged = onBuildModeChanged;

        for (let key in this.gameState.shopData) {
            const item = this.gameState.shopData[key];
            const el = document.createElement('div');
            el.className = 'shop-item';
            el.innerHTML = `
                <div class="shop-item-icon">${item.symbol}</div>
                <div class="shop-item-name">${item.name}</div>
            `;
            el.addEventListener('click', () => this.showModal(key, item));
            this.container.appendChild(el);
        }

        // Setup modal event listeners only once
        if (!this.eventListenersSetup) {
            // Setup modal close button
            this.modalClose.addEventListener('click', () => this.hideModal());

            // Setup build button
            this.buildBtn.addEventListener('click', () => this.enterBuildMode());

            // Close modal when clicking outside
            this.modal.addEventListener('click', e => {
                if (e.target === this.modal) this.hideModal();
            });

            this.eventListenersSetup = true;
        }
    }

    showModal(unitKey, item) {
        this.currentSelectedUnit = unitKey;
        document.getElementById('modal-icon').textContent = item.symbol;
        document.getElementById('modal-title').textContent = item.name;
        document.getElementById('modal-description').textContent = item.description || '';
        document.getElementById('modal-cost').textContent = `${item.cost} MP`;

        const effectText =
            item.type === 'prod' ? `+${item.val} Energy/sec` : `+${item.val} Defense`;
        document.getElementById('modal-effect').textContent = effectText;

        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
        this.currentSelectedUnit = null;
    }

    enterBuildMode() {
        if (!this.currentSelectedUnit) return;

        this.hideModal();
        this.buildMode = true;
        this.gameState.selectUnit(this.currentSelectedUnit);

        if (this.onBuildModeChanged) {
            this.onBuildModeChanged(true);
        }
    }

    exitBuildMode() {
        this.buildMode = false;
        this.gameState.selectUnit(null);
        if (this.onBuildModeChanged) {
            this.onBuildModeChanged(false);
        }
    }

    updateSelection() {
        // Update visual feedback if needed
    }

    clearSelection() {
        document.querySelectorAll('.shop-item').forEach(d => d.classList.remove('selected'));
    }
}
