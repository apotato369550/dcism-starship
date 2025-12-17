# Server Services

Core game logic services that handle state management and artificial intelligence.

## GameEngine.js

**Purpose**: Authoritative game state manager. The single source of truth for all game data.

**Key Properties**:
- `gameMap` - Array of 400 tile objects representing the 20×20 grid
- `players` - Object mapping socket IDs to player objects

**Core Methods**:

### Player Management
- `addPlayer(socketId, username)` - Creates new player with:
  - Unique spawn point (via `findSpawnPoint()`)
  - Assigned color from palette
  - Initial energy and mps values
  - Home base tile marked as `isHome: true`
  - Returns player object to send to client

- `removePlayer(socketId)` - Completely removes player:
  - Clears all owned tiles
  - Resets tile colors to dark default
  - Removes from players object

### Spawn Logic
- `findSpawnPoint()` - Intelligent spawn placement:
  - Tries 50 random candidates
  - Rejects occupied tiles
  - Maximizes minimum distance from existing players
  - Ensures strategic spacing on map
  - Falls back to pure random if no optimal found

### Tile Operations
- `getTile(index)` - Returns tile object at index
- `updateTilePlayer(index, playerId, color)` - Transfer tile ownership:
  - Resets defense to base level
  - Removes any units
  - Updates color to new owner's color
  - Used when capturing enemy tiles

- `addTileDefense(tileIndex, defense)` - Strengthen tile:
  - Adds to current defense (capped at maxDefense)
  - Used when building military units

- `reduceTileDefense(tileIndex, amount)` - Weaken tile:
  - Subtracts from current defense (min 0)
  - Used during attack simulation

### Action Validation
- `canPlayerAct(socketId)` - Checks if cooldown elapsed:
  - Compares `Date.now() - player.lastMoveTime` against `COOLDOWN_MS`
  - Returns boolean

- `setPlayerCooldown(socketId)` - Sets action timestamp:
  - Updates `lastMoveTime = Date.now()`
  - Prevents rapid action spam

### Map Initialization
- `initializeMap()` - Creates default 400-tile map:
  - Each tile has: `id`, `owner: null`, `defense: BASE_TILE_DEFENSE`, `maxDefense`, `unit: null`, `isHome: false`, `color: '#2b1d3d'` (dark purple)
  - Called once in constructor

**When to Extend**:
- Adding new tile types → add properties to tile object in `initializeMap()`
- Adding new player stats → add properties in `addPlayer()`
- Complex tile rules → add validation in `updateTilePlayer()` or new method

---

## AIEngine.js

**Purpose**: Autonomous decision-making for bot players. Provides moderate-difficulty AI that fights strategically but not perfectly.

**Key Concepts**:

### Decision-Making Pipeline
1. `makeDecisions(botSocketIds)` - Called every economy tick
   - Throttles to prevent spam (min 2 seconds between decisions)
   - Calls `calculateBotDecision()` for each bot

2. `calculateBotDecision(botId)` - Returns best action object or null
   - Analyzes game state
   - Evaluates available actions
   - Returns action with type and priority

3. `executeBotDecision(botId, decision)` - Performs the action
   - Validates preconditions
   - Updates game state
   - Emits events to broadcast results

### Strategy Priority
Actions evaluated in this order:

1. **Attack Capital** (priority 100)
   - If enemy capital adjacent and affordable → capture it
   - Ends the game

2. **Capture Territory** (priority 80)
   - Find tiles adjacent to nearest enemy
   - Sort by defense cost (easier = try first)
   - Add randomness ±20 to prevent perfect play
   - Capture if energy sufficient

3. **Build Production** (priority 60)
   - If low on production buildings AND have energy
   - Try: `void_harvester` → `flux_reactor` → `solar_siphon`
   - Build on empty owned tiles, prioritize front-line

4. **Build Defense** (priority 70)
   - If have energy AND tiles to defend
   - Try: `laser_battery` → `orbital_wall`
   - Strengthen front-line or home position

5. **Generate Energy** (priority 10)
   - If energy < 30 and no good action
   - Add 1 energy (manual charge)

### Helper Methods

- `findNearestEnemy(bot, enemies)` - Euclidean distance to all enemies, returns closest

- `findCaptureTargets(botId, enemy)` - Find attackable tiles:
  - Get all enemy-owned tiles
  - Find neutral/enemy tiles adjacent to them
  - Verify adjacency to bot's territory
  - Return sorted by defense cost

- `findBuildTarget(botId, buildType)` - Select tile for building:
  - Get all owned tiles
  - Prefer empty tiles (no unit)
  - Prioritize front-line (adjacent to enemies)
  - Fall back to home base

- `isAdjacent(tileIndex, botId)` - Check if tile touches bot's territory
  - Wrapper around `geometry.isAdjacent()`

- `hasEnemyNeighbor(tileIndex, botId)` - Check if tile is on front-line
  - Returns true if any neighbor owned by another player

### Randomness & Difficulty
The AI is intentionally not perfect:
- **Capture target selection**: ±20 random adjustment to defense costs
- **Decision throttling**: 2-second minimum between actions (humans can spam more)
- **No lookahead**: Doesn't predict multi-move consequences
- **Simple strategy**: Greedy nearest-enemy targeting, not strategic expansion planning

**To adjust difficulty**:
- Reduce throttle time (2000ms) for faster decisions
- Increase randomness multiplier (currently 20) in `findCaptureTargets()`
- Add resource buffers (currently 20% in capture logic)
- Implement lookahead/planning for higher difficulty

### Execution Details

Each action type handles validation:
- **Generate**: Just add 1 MP (always safe)
- **Build**: Verify tile ownership, unit availability, cooldown, cost
- **Capture**: Verify adjacency, defense cost, cooldown, enemy ownership

Failed actions silently skip (no error emitted to client).

**When to Extend**:
- New unit types → `findBuildTarget()` naturally includes them via SHOP
- Different strategy → modify `calculateBotDecision()` priority order
- Difficulty levels → add config param, modify throttle/randomness
- Specialized behaviors → add new helper methods for specific strategies

---

## Service Integration

In `server/index.js`:
```javascript
const gameEngine = new GameEngine();      // State management
const aiEngine = new AIEngine(gameEngine, io, SHOP);  // AI decisions
const activeBots = [];  // Track which players are bots

// In join_game event:
if (mode === 'single') {
    for (let i = 0; i < botCount; i++) {
        const botId = `bot-${Date.now()}-${i}`;
        const botPlayer = gameEngine.addPlayer(botId, botNames[i]);
        activeBots.push(botId);
        // ... setup
    }
}

// In economy loop (every 1 second):
if (activeBots.length > 0) {
    aiEngine.makeDecisions(activeBots);
}
```

Services are instantiated once and persist for game lifetime. All data flows through GameEngine as authoritative source.
