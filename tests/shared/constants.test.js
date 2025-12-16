// Test Suite for Shared Constants
const constants = require('../../shared/constants');

describe('Shared Constants', () => {
    test('should have MAP_WIDTH defined', () => {
        expect(constants.MAP_WIDTH).toBeDefined();
        expect(typeof constants.MAP_WIDTH).toBe('number');
        expect(constants.MAP_WIDTH).toBeGreaterThan(0);
    });

    test('should have MAP_HEIGHT defined', () => {
        expect(constants.MAP_HEIGHT).toBeDefined();
        expect(typeof constants.MAP_HEIGHT).toBe('number');
        expect(constants.MAP_HEIGHT).toBeGreaterThan(0);
    });

    test('should have TILE_SIZE defined', () => {
        expect(constants.TILE_SIZE).toBe(40);
    });

    test('should have game timing constants', () => {
        expect(constants.COOLDOWN_MS).toBeDefined();
        expect(constants.ECONOMY_TICK_MS).toBeDefined();
        expect(constants.COOLDOWN_MS).toBeGreaterThan(0);
        expect(constants.ECONOMY_TICK_MS).toBeGreaterThan(0);
    });

    test('should have default defense values', () => {
        expect(constants.BASE_TILE_DEFENSE).toBeDefined();
        expect(constants.BASE_TILE_MAX_DEFENSE).toBeDefined();
    });

    test('should have neon colors defined', () => {
        expect(constants.NEON_COLORS).toBeDefined();
        expect(constants.NEON_COLORS.pink).toBe('#ff10fe');
        expect(constants.NEON_COLORS.cyan).toBe('#00f0ff');
    });
});
