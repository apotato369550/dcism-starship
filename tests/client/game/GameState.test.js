const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock GameState for testing
class GameState {
    constructor() {
        this.map = [];
        this.myId = null;
        this.myName = null;
        this.players = {};
        this.shopData = {};
        this.selectedUnitKey = null;
        this.selectedTileIndex = null;
        this.isCooldown = false;
    }

    init(data) {
        this.map = data.map;
        this.shopData = data.shop;
        this.selectedTileIndex = data.you.homeIndex;
        this.myId = data.you.id;
        this.myName = data.you.username;
        if (data.players) {
            this.players = data.players;
        }
    }

    getPlayerName(playerId) {
        if (this.players[playerId]) {
            return this.players[playerId].username;
        }
        return 'Unknown Player';
    }

    updateTile(tile) {
        this.map[tile.id] = tile;
    }
}

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    it('should initialize with player data', () => {
        const data = {
            map: Array(400).fill({ id: 0, owner: null }),
            shop: { test_unit: { name: 'Test' } },
            you: { id: 'player1', username: 'TestPlayer', homeIndex: 0 },
            players: {
                player1: { id: 'player1', username: 'TestPlayer', color: '#fff' },
                'bot-123-0': { id: 'bot-123-0', username: 'BOT1', color: '#f00' },
            },
        };

        gameState.init(data);

        expect(gameState.myId).toBe('player1');
        expect(gameState.myName).toBe('TestPlayer');
        expect(Object.keys(gameState.players).length).toBe(2);
    });

    it('should return correct player names', () => {
        gameState.players = {
            player1: { username: 'PlayerOne' },
            'bot-123': { username: 'REPLICANT-01' },
        };

        expect(gameState.getPlayerName('player1')).toBe('PlayerOne');
        expect(gameState.getPlayerName('bot-123')).toBe('REPLICANT-01');
        expect(gameState.getPlayerName('unknown')).toBe('Unknown Player');
    });

    it('should update tile data', () => {
        gameState.map = Array(400).fill(null).map((_, i) => ({ id: i, owner: null }));
        const updatedTile = { id: 5, owner: 'player1', defense: 50 };

        gameState.updateTile(updatedTile);

        expect(gameState.map[5]).toEqual(updatedTile);
        expect(gameState.map[6]).toEqual({ id: 6, owner: null });
    });

    it('should handle player list updates for bots', () => {
        const initialPlayers = {
            player1: { id: 'player1', username: 'You', color: '#fff' },
        };
        gameState.players = initialPlayers;

        // Simulate bot creation broadcast
        const updatedPlayers = {
            player1: { id: 'player1', username: 'You', color: '#fff' },
            'bot-1734442800000-0': { id: 'bot-1734442800000-0', username: 'REPLICANT-01', color: '#f0f' },
            'bot-1734442800000-1': { id: 'bot-1734442800000-1', username: 'REPLICANT-02', color: '#0ff' },
        };

        gameState.players = updatedPlayers;

        expect(Object.keys(gameState.players).length).toBe(3);
        expect(gameState.getPlayerName('bot-1734442800000-0')).toBe('REPLICANT-01');
    });
});
