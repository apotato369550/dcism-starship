# Tests

Jest test suite for validating game logic. Tests are organized by module.

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch   # Run in watch mode (re-run on file change)
```

**Configuration**: `jest.config.js`
- Test environment: Node.js
- Test files: `**/*.test.js` or `**/*.spec.js`

## Test Structure

```
tests/
├── server/
│   ├── services/        # GameEngine tests
│   └── utils/           # Geometry tests
└── shared/
    └── constants.test.js # Constants validation
```

### Server Tests

#### `server/utils/geometry.test.js`
Tests coordinate transformation and distance calculations.

**Tests**:
- `getCoords(index)` - Convert tile index to x,y
- `getDistance(idx1, idx2)` - Calculate Euclidean distance
- `isAdjacent(tileIndex, gameMap, playerId, MAP_WIDTH)` - Check adjacency

**Why These Matter**:
- Coordinates must be consistent (used in rendering, AI targeting, spawn)
- Distance used for enemy targeting (AI looks for nearest enemy)
- Adjacency gates all capture attempts (critical validation)

#### `shared/constants.test.js`
Validates game constants are sensible.

**Tests**:
- Map size is positive and reasonable
- Cooldown is positive
- Colors are valid hex values
- No duplicate colors
- Energy values are non-negative

**Why This Matters**:
- Constants are shared config used everywhere
- Invalid values break game logic
- Quick sanity check before deployment

---

## Writing New Tests

### Test Pattern
```javascript
const { describe, it, expect } = require('@jest/globals');
const { someFunction } = require('../../server/utils/geometry');

describe('Module Name', () => {
    it('should do something specific', () => {
        const result = someFunction(input);
        expect(result).toBe(expected);
    });
});
```

### Common Jest Matchers
```javascript
expect(value).toBe(expected)              // Exact equality (===)
expect(array).toContain(item)             // Array contains
expect(obj).toEqual(expected)             // Deep equality
expect(fn).toThrow()                      // Function throws
expect(value).toBeGreaterThan(5)          // Comparison
expect(value).toBeDefined()               // Is not undefined
```

### When to Add Tests

**Add tests for**:
- Utility functions (deterministic, easy to test)
- Game logic validation (adjacency, distance, spawning)
- Balance constants (sanity checks)
- Bug fixes (test the fix, then fix the bug)

**Don't test**:
- UI rendering (hard to test, changes frequently)
- Socket.IO events (integration test, requires running server)
- External APIs (mock them)

### Example Test Structure

Testing a geometry function:
```javascript
describe('geometry.isAdjacent', () => {
    let gameMap;
    let playerId;

    beforeEach(() => {
        // Setup: Create a simple 5×5 test map
        gameMap = [];
        for (let i = 0; i < 25; i++) {
            gameMap.push({ owner: null, id: i });
        }
        playerId = 'test-player';
    });

    it('should return true if tile is adjacent to player ownership', () => {
        // Arrange: Player owns tile at index 5
        gameMap[5].owner = playerId;

        // Act: Check if adjacent tile 6 is adjacent
        const result = isAdjacent(6, gameMap, playerId, 5);

        // Assert: Should be true
        expect(result).toBe(true);
    });

    it('should return false if no adjacent player ownership', () => {
        gameMap[5].owner = playerId;
        const result = isAdjacent(0, gameMap, playerId, 5);
        expect(result).toBe(false);
    });
});
```

---

## Test Coverage Goals

Currently tested:
- ✅ Geometry utilities (distance, coordinates, adjacency)
- ✅ Constants validation

Should add tests for:
- GameEngine methods (spawn, player add/remove, cooldown)
- AIEngine decisions (capture targets, build targets)
- Capture validation (adjacent, affordable, correct owner)

---

## Debugging Tests

### Run Specific Test File
```bash
npm test -- geometry.test.js
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="isAdjacent"
```

### Debug in DevTools
```bash
node --inspect-brk node_modules/.bin/jest --runInBand geometry.test.js
```
Then open `chrome://inspect` to debug.

### Print Debug Info
```javascript
it('should do something', () => {
    console.log('Debug value:', someValue);
    expect(result).toBe(expected);
});
```
Output shown with `npm test -- --verbose`

---

## Continuous Integration

Tests should run on:
- Pre-commit (via git hooks if set up)
- Before deployment
- In CI/CD pipeline (GitHub Actions, etc.)

All tests must pass before merging.

---

## When to Update Tests

### After Bug Fix
1. Write test that catches the bug
2. Fix the bug (test passes)
3. Keep test forever (prevents regression)

### After Feature Addition
1. Write tests for new logic
2. Ensure >80% code coverage for new files
3. Test edge cases

### After Refactoring
1. Re-run all tests (should still pass)
2. Add tests for any new internal functions
3. Remove tests for deleted functions

### After Balance Changes
1. Update constant tests if values changed
2. Re-run all tests (catch side effects)
3. Add balance-specific tests if needed

---

## Example: Adding a Balance Test

When adding a new unit cost:

```javascript
// In config/tiles.js
new_unit: {
  cost: 250,
  ...
}
```

Then test it:

```javascript
// tests/shared/constants.test.js
it('should have reasonable unit costs', () => {
  const costs = Object.values(SHOP).map(u => u.cost);

  // All costs should be positive
  costs.forEach(cost => {
    expect(cost).toBeGreaterThan(0);
  });

  // Costs should follow progression
  const prodCosts = [20, 150, 600];
  expect(prodCosts[1]).toBeGreaterThan(prodCosts[0]);
  expect(prodCosts[2]).toBeGreaterThan(prodCosts[1]);
});
```

---

## Test Maintenance Checklist

After every significant change:
- [ ] Run all tests: `npm test`
- [ ] No test failures
- [ ] No new console warnings
- [ ] Coverage didn't decrease
- [ ] New tests added if needed
- [ ] Old tests updated if logic changed

Before deployment:
- [ ] All tests passing
- [ ] Code linting passes: `npm run lint`
- [ ] Manual gameplay test: `npm start`
