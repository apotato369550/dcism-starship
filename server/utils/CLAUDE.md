# Server Utilities

Helper functions and utilities used throughout the server.

## geometry.js

**Purpose**: Coordinate system utilities and spatial calculations.

**Key Functions**:

### `getCoords(index)`
Converts tile array index to x,y grid coordinates.

```javascript
getCoords(0)     // { x: 0, y: 0 } (top-left)
getCoords(20)    // { x: 0, y: 1 } (leftmost, row 2)
getCoords(399)   // { x: 19, y: 19 } (bottom-right)
```

**Formula**:
- `x = index % MAP_WIDTH`
- `y = Math.floor(index / MAP_WIDTH)`

**Used By**:
- AI targeting (to find enemies and nearby tiles)
- Adjacency checks (to find neighbors)
- Spawn validation (to find unoccupied tiles)

### `getDistance(idx1, idx2)`
Calculates Euclidean distance between two tiles.

```javascript
const dist = getDistance(0, 20);  // Distance from top-left to (0,1)
// Returns: Math.sqrt((0-0)² + (0-1)²) = 1.0
```

**Used By**:
- AI targeting (find nearest enemy capital)
- Spawn optimization (maximize distance from existing players)

**Important**:
- Uses Euclidean distance, not Manhattan
- Used for strategic decisions, not pathfinding
- Bots look for nearest enemy, but don't plan paths around obstacles

### `isAdjacent(tileIndex, gameMap, playerId, MAP_WIDTH)`
Checks if a tile is adjacent to player's owned territory.

```javascript
// If player owns tile 5 (in 20-width grid)
isAdjacent(6, gameMap, playerId, 20)   // true (right neighbor)
isAdjacent(25, gameMap, playerId, 20)  // true (below)
isAdjacent(0, gameMap, playerId, 20)   // false (not adjacent)
```

**Adjacent Means**:
- Top, bottom, left, or right neighbor (not diagonal)
- Must be in bounds (not off-map)

**Used By**:
- Capture validation (can only capture adjacent tiles)
- AI decision-making (find capturable targets)
- Build location validation (sometimes)

**Edge Cases Handled**:
- Tiles on edges/corners (checked against bounds)
- Tiles owned by other players (counted as adjacent if in-bounds)
- Neutral tiles (can be adjacent to player ownership)

---

## How to Add Utilities

### Pattern
```javascript
function helperFunction(input1, input2) {
    // Pure function - no side effects
    // Testable - same input always gives same output
    return result;
}

module.exports = {
    helperFunction,
    // ... other exports
};
```

### When to Add Utility
- Function used in multiple places
- Mathematical/algorithmic logic
- Pure functions (no side effects)

### When NOT to Add Here
- Business logic (keep in GameEngine)
- Socket handlers (keep in index.js)
- Configuration (keep in config/)

---

## Testing Utilities

All utility functions should have tests in `tests/server/utils/`.

When modifying:
1. Update function
2. Update corresponding test
3. Run: `npm test`
4. Ensure all geometry tests pass

---

## Performance Notes

**Hot Path Functions** (called frequently):
- `isAdjacent()` - Called once per capture attempt (user action or AI)
- `getCoords()` - Called during AI targeting (once per bot decision tick)
- `getDistance()` - Called during AI targeting

**Optimization**:
- These are all simple math, very fast
- No database calls or async operations
- Safe to call frequently

---

## Future Utilities to Add

Possible additions as features expand:
- `getTile(x, y)` - Get tile by coordinates (currently used inline)
- `getTilesInRadius(center, radius)` - Find tiles within radius
- `getPath(start, end)` - Pathfinding for strategic AI
- `getCaptureChain(startTile)` - Find connected owned territory

These would support:
- More sophisticated AI (lookahead, pathfinding)
- Potential multiplayer features (area effects)
- Strategic evaluation (territorial strength analysis)
