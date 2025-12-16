// Test Suite for Geometry Utilities
const geometry = require('../../../server/utils/geometry');

describe('Geometry Utilities', () => {
    describe('getCoords', () => {
        test('should convert tile index to coordinates', () => {
            expect(geometry.getCoords(0)).toEqual({ x: 0, y: 0 });
            expect(geometry.getCoords(1)).toEqual({ x: 1, y: 0 });
            expect(geometry.getCoords(20)).toEqual({ x: 0, y: 1 });
            expect(geometry.getCoords(21)).toEqual({ x: 1, y: 1 });
        });

        test('should handle large indices', () => {
            expect(geometry.getCoords(399)).toEqual({ x: 19, y: 19 });
        });
    });

    describe('getDistance', () => {
        test('should calculate distance between two tiles', () => {
            const dist = geometry.getDistance(0, 0);
            expect(dist).toBe(0);
        });

        test('should calculate distance for adjacent tiles', () => {
            const dist = geometry.getDistance(0, 1); // Distance from (0,0) to (1,0)
            expect(dist).toBe(1);
        });

        test('should calculate diagonal distance', () => {
            const dist = geometry.getDistance(0, 21); // Distance from (0,0) to (1,1)
            expect(dist).toBeCloseTo(Math.sqrt(2), 1);
        });
    });

    describe('isAdjacent', () => {
        test('should identify adjacent tiles', () => {
            // Create a simple test map
            const testMap = Array(400)
                .fill(null)
                .map((_, i) => ({
                    id: i,
                    owner: i === 0 ? 'player1' : null,
                }));

            // Test adjacent tiles (1, 20 are adjacent to 0)
            expect(geometry.isAdjacent(1, testMap, 'player1', 20)).toBe(true);
            expect(geometry.isAdjacent(20, testMap, 'player1', 20)).toBe(true);
        });

        test('should not identify non-adjacent tiles', () => {
            const testMap = Array(400)
                .fill(null)
                .map((_, i) => ({
                    id: i,
                    owner: i === 0 ? 'player1' : null,
                }));

            // Test non-adjacent tiles
            expect(geometry.isAdjacent(2, testMap, 'player1', 20)).toBe(false);
            expect(geometry.isAdjacent(40, testMap, 'player1', 20)).toBe(false);
        });
    });
});
