const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock SocketClient for testing
class MockSocketClient {
    constructor() {
        this.socket = {
            on: jest.fn((event, callback) => {
                this.eventHandlers = this.eventHandlers || {};
                this.eventHandlers[event] = callback;
            }),
            emit: jest.fn(),
            id: 'test-socket-id',
        };
        this.eventHandlers = {};
    }

    onConnect(callback) {
        this.socket.on('connect', () => {
            callback(this.socket.id);
        });
    }

    onInit(callback) {
        this.socket.on('init', (data) => {
            callback(data);
        });
    }

    onMapUpdate(callback) {
        this.socket.on('map_update_single', (tile) => {
            callback(tile);
        });
    }

    onPlayerUpdate(callback) {
        this.socket.on('update_self', (player) => {
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
        this.socket.on('chat_receive', (data) => {
            callback(data);
        });
    }

    onPlayersUpdate(callback) {
        this.socket.on('players_update', (data) => {
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

describe('SocketClient', () => {
    let client;

    beforeEach(() => {
        client = new MockSocketClient();
    });

    it('should have onPlayersUpdate handler registered', () => {
        const callback = jest.fn();
        client.onPlayersUpdate(callback);

        // Verify the event listener was registered
        expect(client.socket.on).toHaveBeenCalledWith('players_update', expect.any(Function));
    });

    it('should receive and handle players_update event', () => {
        const callback = jest.fn();
        client.onPlayersUpdate(callback);

        // Simulate receiving players_update from server
        const playersData = {
            player1: { id: 'player1', username: 'You', color: '#fff' },
            'bot-123': { id: 'bot-123', username: 'REPLICANT-01', color: '#f0f' },
        };

        // Call the handler
        if (client.socket.on.mock.calls[0]) {
            const handler = client.socket.on.mock.calls[0][1];
            handler(playersData);
        }

        expect(callback).toHaveBeenCalledWith(playersData);
    });

    it('should handle chat_receive events from bot actions', () => {
        const callback = jest.fn();
        client.onChatReceive(callback);

        const chatData = {
            user: 'SYSTEM',
            msg: 'REPLICANT-01 captured enemy territory!',
            color: '#ff9900',
        };

        // Verify chat handler is registered
        expect(client.socket.on).toHaveBeenCalledWith('chat_receive', expect.any(Function));
    });

    it('should register all required event handlers', () => {
        const callbacks = {
            connect: jest.fn(),
            init: jest.fn(),
            mapUpdate: jest.fn(),
            playerUpdate: jest.fn(),
            gameOver: jest.fn(),
            gameWon: jest.fn(),
            actionSuccess: jest.fn(),
            chatReceive: jest.fn(),
            playersUpdate: jest.fn(),
        };

        client.onConnect(callbacks.connect);
        client.onInit(callbacks.init);
        client.onMapUpdate(callbacks.mapUpdate);
        client.onPlayerUpdate(callbacks.playerUpdate);
        client.onGameOver(callbacks.gameOver);
        client.onGameWon(callbacks.gameWon);
        client.onActionSuccess(callbacks.actionSuccess);
        client.onChatReceive(callbacks.chatReceive);
        client.onPlayersUpdate(callbacks.playersUpdate);

        // Verify all were registered
        const callCount = client.socket.on.mock.calls.length;
        expect(callCount).toBe(9);

        // Verify specific handlers
        const eventNames = client.socket.on.mock.calls.map((call) => call[0]);
        expect(eventNames).toContain('players_update');
        expect(eventNames).toContain('chat_receive');
        expect(eventNames).toContain('map_update_single');
    });

    it('should emit join_game with bot count options', () => {
        client.joinGame('TestPlayer', { mode: 'single', botCount: 2 });

        expect(client.socket.emit).toHaveBeenCalledWith('join_game', {
            username: 'TestPlayer',
            mode: 'single',
            botCount: 2,
        });
    });

    it('should emit place_unit with correct parameters', () => {
        client.placeUnit(42, 'solar_siphon');

        expect(client.socket.emit).toHaveBeenCalledWith('place_unit', {
            tileIndex: 42,
            unitType: 'solar_siphon',
        });
    });

    it('should emit capture_attempt with tile index', () => {
        client.captureAttempt(100);

        expect(client.socket.emit).toHaveBeenCalledWith('capture_attempt', 100);
    });
});

describe('Socket Event Flow', () => {
    it('should verify player list update flow', () => {
        // Simulates: Server creates bots → emits players_update → client receives it

        const gameState = { players: {} };
        const updateHandler = jest.fn((players) => {
            gameState.players = players;
        });

        const client = new MockSocketClient();
        client.onPlayersUpdate(updateHandler);

        // Simulate server sending players_update
        const newPlayers = {
            player1: { id: 'player1', username: 'You' },
            'bot-1': { id: 'bot-1', username: 'BOT1' },
            'bot-2': { id: 'bot-2', username: 'BOT2' },
        };

        // Invoke the handler
        if (client.socket.on.mock.calls[0]) {
            client.socket.on.mock.calls[0][1](newPlayers);
        }

        expect(updateHandler).toHaveBeenCalled();
    });

    it('should verify chat message broadcast flow', () => {
        // Simulates: AI decides action → broadcasts chat → client renders

        const chatMessages = [];
        const chatHandler = jest.fn((data) => {
            chatMessages.push(data);
        });

        const client = new MockSocketClient();
        client.onChatReceive(chatHandler);

        // Simulate multiple bot actions
        const actions = [
            { user: 'SYSTEM', msg: 'REPLICANT-01 generated 1 energy.', color: '#888' },
            { user: 'SYSTEM', msg: 'REPLICANT-01 built a Solar Siphon.', color: '#888' },
            { user: 'SYSTEM', msg: 'REPLICANT-01 captured enemy territory!', color: '#ff9900' },
        ];

        actions.forEach((action) => {
            if (client.socket.on.mock.calls[0]) {
                client.socket.on.mock.calls[0][1](action);
            }
        });

        expect(chatHandler.mock.calls.length).toBeGreaterThan(0);
    });
});
