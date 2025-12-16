// Shop UI Management
export class ShopUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.prodDiv = document.getElementById('shop-prod');
        this.milDiv = document.getElementById('shop-mil');
    }

    render(onItemSelected) {
        this.prodDiv.innerHTML = '<div class="shop-grid"></div>';
        this.milDiv.innerHTML = '<div class="shop-grid"></div>';

        const prodGrid = this.prodDiv.querySelector('.shop-grid');
        const milGrid = this.milDiv.querySelector('.shop-grid');

        for (let key in this.gameState.shopData) {
            const item = this.gameState.shopData[key];
            const el = document.createElement('div');
            el.className = 'shop-item';
            el.innerHTML = `
                <div class="shop-item-icon">${item.symbol}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-cost">${item.cost} MP</div>
                <div class="shop-item-val">${item.type === 'prod' ? '+' + item.val + '/s' : '+' + item.val + ' DEF'}</div>
            `;
            el.onclick = () => {
                document
                    .querySelectorAll('.shop-item')
                    .forEach(d => d.classList.remove('selected'));
                if (this.gameState.selectedUnitKey === key) {
                    this.gameState.selectUnit(key);
                } else {
                    this.gameState.selectUnit(key);
                    el.classList.add('selected');
                }
                onItemSelected(key);
            };

            if (item.type === 'prod') prodGrid.appendChild(el);
            else milGrid.appendChild(el);
        }
    }

    clearSelection() {
        document.querySelectorAll('.shop-item').forEach(d => d.classList.remove('selected'));
    }

    updateSelection() {
        document.querySelectorAll('.shop-item').forEach(d => d.classList.remove('selected'));
        if (this.gameState.selectedUnitKey) {
            const items = document.querySelectorAll('.shop-item');
            const keys = Object.keys(this.gameState.shopData);
            const idx = keys.indexOf(this.gameState.selectedUnitKey);
            if (idx >= 0 && items[idx]) items[idx].classList.add('selected');
        }
    }
}
