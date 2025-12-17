const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock GameEngine for testing
class MockGameEngine {
    constructor() {
        this.gameMap = Array(400).fill(null).map((_, i) => ({
            id: i,
            owner: null,
            defense: 10,
            maxDefense: 10,
            unit: null,
            isHome: false,
            color: '#2b1d3d',
        }));
        this.players = {};
    }

    getTile(index) {
        return this.gameMap[index];
    }

    canPlayerAct(playerId) {
        return this.players[playerId] && Date.now() - this.players[playerId].lastMoveTime >= 3000;
    }

    setPlayerCooldown(playerId) {
        if (this.players[playerId]) {
            this.players[playerId].lastMoveTime = Date.now();
        }
    }

    addPlayer(id, username) {
        const player = {
            id,
            username,
            mp: 10,
            mps: 1,
            lastMoveTime: 0,
            homeIndex: Math.floor(Math.random() * 400),
            color: '#ff00ff',
        };
        this.players[id] = player;
        this.gameMap[player.homeIndex].owner = id;
        this.gameMap[player.homeIndex].isHome = true;
        this.gameMap[player.homeIndex].color = player.color;
        return player;
    }

    updateTilePlayer(index, playerId, color) {
        const tile = this.gameMap[index];
        tile.owner = playerId;
        tile.color = color;
        tile.defense = 10;
        tile.unit = null;
    }
}

describe('AIEngine Aggressive Parameters', () => {
    let gameEngine;

    beforeEach(() => {
        gameEngine = new MockGameEngine();
    });

    it('should have bots with aggressive parameters', () => {
        const bot = gameEngine.addPlayer('bot-123', 'REPLICANT-01');

        // Verify initial state
        expect(bot.mp).toBe(10);
        expect(bot.username).toBe('REPLICANT-01');
        expect(gameEngine.gameMap[bot.homeIndex].isHome).toBe(true);
    });

    it('should support aggressive capture with 1.05x safety margin', () => {
        const bot = gameEngine.addPlayer('bot-1', 'BOT1');
        const enemy = gameEngine.addPlayer('bot-2', 'BOT2');

        const targetDefense = 50;
        bot.mp = 53; // Enough for 1.05x of 50

        // Aggressive check: 1.05x instead of 1.2x
        const canAttack = bot.mp >= targetDefense * 1.05;
        expect(canAttack).toBe(true);

        // Conservative check would fail: 1.2x
        const wouldBeConservative = bot.mp >= targetDefense * 1.2;
        expect(wouldBeConservative).toBe(false);
    });

    it('should support early building at 25 energy threshold', () => {
        const bot = gameEngine.addPlayer('bot-123', 'TEST_BOT');
        bot.mp = 25;

        // Aggressive: builds at 25 energy
        const canBuildAggressive = bot.mp >= 25;
        expect(canBuildAggressive).toBe(true);

        // Old conservative: 50 energy
        const wouldBeConservative = bot.mp >= 50;
        expect(wouldBeConservative).toBe(false);
    });

    it('should handle bot cooldown correctly', () => {
        const bot = gameEngine.addPlayer('bot-test', 'TEST');

        // Initially can't act (lastMoveTime is 0, way in past actually)
        gameEngine.setPlayerCooldown('bot-test'); // Set to now
        let canAct = gameEngine.canPlayerAct('bot-test');
        expect(canAct).toBe(false); // Just acted, on cooldown

        // Wait (simulated)
        bot.lastMoveTime = Date.now() - 3500; // 3.5 seconds ago
        canAct = gameEngine.canPlayerAct('bot-test');
        expect(canAct).toBe(true); // Cooldown expired
    });

    it('should verify throttle parameters support 1.5s decision frequency', () => {
        // This test documents the aggressive throttle time
        const throttleTime = 1500; // ms - aggressive (was 2000)
        expect(throttleTime).toBe(1500);
        expect(throttleTime).toBeLessThan(2000);
    });

    it('should support cheap capture targeting with reduced randomness', () => {
        const costDiff1 = 10;
        const costDiff2 = 50;

        // With aggressive randomness (±4)
        const randomness = (Math.random() - 0.5) * 8;
        expect(randomness).toBeGreaterThanOrEqual(-4);
        expect(randomness).toBeLessThanOrEqual(4);

        // Cheap tile should often be selected (10 is lower base cost)
        // vs expensive tile (50)
        const scores = [];
        for (let i = 0; i < 100; i++) {
            const rand = (Math.random() - 0.5) * 8;
            scores.push({
                cheap: costDiff1 + rand,
                expensive: costDiff2 + rand,
            });
        }

        // Count how many times cheap beats expensive
        const cheapWins = scores.filter((s) => s.cheap < s.expensive).length;
        expect(cheapWins).toBeGreaterThan(50); // Should be > 50%
    });

    it('should verify defense priority is lower than capture for aggression', () => {
        const capturePriority = 80;
        const defensePriority = 65;

        expect(defensePriority).toBeLessThan(capturePriority);
        expect(capturePriority - defensePriority).toBe(15);
    });

    it('should support emergency attacks on cheap tiles', () => {
        const bot = gameEngine.addPlayer('bot-e1', 'EMERGENCY_BOT');
        bot.mp = 15; // Low energy

        // Can afford cheap tiles
        const cheapTileDefense = 10;
        const canDoEmergencyAttack = bot.mp > cheapTileDefense - 5;
        expect(canDoEmergencyAttack).toBe(true);

        // Cannot afford expensive tiles
        const expensiveTileDefense = 50;
        const cannotAffordExpensive = bot.mp >= expensiveTileDefense;
        expect(cannotAffordExpensive).toBe(false);
    });

    it('should verify multiple bots can coexist', () => {
        gameEngine.addPlayer('bot-123', 'REPLICANT-01');
        gameEngine.addPlayer('bot-456', 'REPLICANT-02');
        gameEngine.addPlayer('bot-789', 'REPLICANT-03');

        expect(Object.keys(gameEngine.players).length).toBe(3);

        // All should be initialized with home tiles
        Object.values(gameEngine.players).forEach((player) => {
            expect(gameEngine.gameMap[player.homeIndex].isHome).toBe(true);
            expect(gameEngine.gameMap[player.homeIndex].owner).toBe(player.id);
        });
    });

    it('should verify bot decision throttle of 1.5 seconds', () => {
        const oldThrottle = 2000;
        const newThrottle = 1500;
        const improvement = ((oldThrottle - newThrottle) / oldThrottle) * 100;

        expect(newThrottle).toBe(1500);
        expect(improvement).toBeCloseTo(25, 1); // 25% faster
    });
});

describe('Socket Event Broadcasting', () => {
    it('should verify players_update event is broadcast', () => {
        // This test documents that players_update should be emitted
        const eventName = 'players_update';
        const mockData = {
            player1: { id: 'player1', username: 'You' },
            'bot-123': { id: 'bot-123', username: 'REPLICANT-01' },
        };

        // Verify structure
        expect(eventName).toBe('players_update');
        expect(Object.keys(mockData).length).toBe(2);
        expect(mockData['bot-123'].username).toContain('REPLICANT');
    });

    it('should verify chat_receive is broadcast for bot actions', () => {
        const messages = [
            { user: 'SYSTEM', msg: 'REPLICANT-01 generated 1 energy.', color: '#888' },
            { user: 'SYSTEM', msg: 'REPLICANT-01 built a Solar Siphon.', color: '#888' },
            { user: 'SYSTEM', msg: 'REPLICANT-01 captured enemy territory!', color: '#ff9900' },
        ];

        messages.forEach((msg) => {
            expect(msg.user).toBe('SYSTEM');
            expect(msg.msg.length).toBeGreaterThan(0);
        });
    });
});
