// Socket.IO Client
// eslint-disable-next-line no-undef
export class SocketClient {
    constructor() {
        // eslint-disable-next-line no-undef
        this.socket = io();
    }

    onConnect(callback) {
        this.socket.on('connect', () => {
            callback(this.socket.id);
        });
    }

    onInit(callback) {
        this.socket.on('init', data => {
            callback(data);
        });
    }

    onMapUpdate(callback) {
        this.socket.on('map_update_single', tile => {
            callback(tile);
        });
    }

    onPlayerUpdate(callback) {
        this.socket.on('update_self', player => {
            callback(player);
        });
    }

    onGameOver(callback) {
        this.socket.on('game_over', () => {
            callback();
        });
    }

    onGameWon(callback) {
        this.socket.on('game_won', () => {
            callback();
        });
    }

    onActionSuccess(callback) {
        this.socket.on('action_success', () => {
            callback();
        });
    }

    onChatReceive(callback) {
        this.socket.on('chat_receive', data => {
            callback(data);
        });
    }

    joinGame(username, options = {}) {
        this.socket.emit('join_game', { username, ...options });
    }

    sendManualCharge() {
        this.socket.emit('click_generate');
    }

    placeUnit(tileIndex, unitType) {
        this.socket.emit('place_unit', { tileIndex, unitType });
    }

    captureAttempt(tileIndex) {
        this.socket.emit('capture_attempt', tileIndex);
    }

    demolishUnit(tileIndex) {
        this.socket.emit('demolish_unit', tileIndex);
    }

    sendChat(message) {
        this.socket.emit('send_chat', message);
    }
}
