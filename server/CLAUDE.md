# Server Architecture

The server is the authoritative backend for DCISM Starship 2.0, handling all game logic, state management, and real-time communication with players.

## Overview

- **Entry Point**: `index.js` - Express server setup, Socket.IO initialization, game loop orchestration
- **Game Engine**: `services/GameEngine.js` - Core game state and validation logic
- **AI System**: `services/AIEngine.js` - Bot decision-making and strategy
- **Utilities**: `utils/` - Geometry calculations and helpers
- **Configuration**: `config/environment.js` - Environment variable parsing

## Key Responsibilities

### Main Server (`index.js`)
- **Express Setup**: Serves static client files
- **Socket.IO Connection Handling**: Player joins, disconnects, chat
- **Action Validation**: Place units, capture tiles, demolish structures
- **Economy Loop**: Runs every 1 second to:
  - Calculate production income (MPS) from production buildings
  - Distribute energy to all players
  - Execute AI decisions for active bots
- **Win Condition Checks**: Eliminates players when capital is captured
- **Event Broadcasting**: Sends updates to clients via `map_update_single`, `update_self`, `game_over`, `game_won`

### GameEngine Service (`services/GameEngine.js`)
Manages authoritative game state:
- **Game Map**: 400-tile array representing the 20x20 grid
- **Players Object**: Maps socket IDs to player data (energy, mps, home position, color, cooldown)
- **Tile Operations**: Create tiles, assign ownership, calculate adjacency
- **Player Management**: Add/remove players, set cooldowns, track resources

Key methods:
- `addPlayer(socketId, username)` - Spawn player with color and home base
- `removePlayer(socketId)` - Clear all player tiles from map
- `findSpawnPoint()` - Find optimal spawn location far from other players
- `canPlayerAct(socketId)` - Check if cooldown has elapsed
- `setPlayerCooldown(socketId)` - Set action cooldown timestamp

### AI Engine (`services/AIEngine.js`)
Autonomous bot decision-making:
- **Decision Loop**: Analyzes game state each economy tick
- **Strategy Priority**:
  1. Attack enemy capital if adjacent and affordable
  2. Capture adjacent enemy tiles if affordable
  3. Build defense structures
  4. Build production structures for income growth
  5. Generate energy manually if low
- **Moderate Difficulty**: Includes randomness to prevent perfect bot play
- **Action Execution**: Emits actual game events (place_unit, capture_attempt, click_generate)

See `services/AIEngine.js` for detailed strategy logic.

### Geometry Utilities (`utils/geometry.js`)
- `getCoords(index)` - Convert tile index to x,y coordinates
- `getDistance(idx1, idx2)` - Calculate distance between tiles (for enemy targeting)
- `isAdjacent(tileIndex, gameMap, playerId, MAP_WIDTH)` - Check if tile is adjacent to player's territory

## Socket.IO Events

### Client → Server
- `join_game(data)` - Player joins with username and game mode options
- `click_generate()` - Manual energy generation
- `place_unit(data)` - Build a unit on a tile (validates ownership, resources, cooldown)
- `capture_attempt(tileIndex)` - Attack/capture an enemy tile (validates adjacency, resources, cooldown)
- `demolish_unit(tileIndex)` - Remove a unit from owned tile
- `send_chat(message)` - Broadcast message to all players

### Server → Client
- `init(data)` - Full game state on join (map, player data, shop)
- `map_update_single(tile)` - Single tile changed (broadcast to all)
- `update_self(player)` - Player's stats updated (energy, mps)
- `action_success()` - Triggers client-side cooldown UI
- `game_over()` - Player was eliminated
- `game_won()` - Player won the game (all enemies eliminated)
- `chat_receive(data)` - Message from another player

## Game State Structure

### Tile Object
```javascript
{
  id: 0,                    // Unique index 0-399
  owner: socketId || null,  // Player who owns this tile
  defense: 10,              // Current defense points
  maxDefense: 10,           // Maximum defense capacity
  unit: unitType || null,   // Building type ('solar_siphon', 'laser_battery', etc)
  isHome: true || false,    // Is this player's capital?
  color: '#ff00ff'          // Tile color (player's color)
}
```

### Player Object
```javascript
{
  id: socketId,                    // Unique identifier
  username: 'PlayerName',
  mp: 10,                          // Current energy/money
  mps: 1,                          // Energy generation per second
  lastMoveTime: Date.now(),        // Timestamp for cooldown tracking
  homeIndex: 42,                   // Tile index of capital
  color: '#ff00ff'                 // Assigned color
}
```

## How to Add Features

### Adding New Building Types
1. Add entry to `config/tiles.js` with properties: `name`, `type` (prod/mil), `cost`, `val`, `symbol`, `upgrade`
2. No server code changes needed—automatically loaded by SHOP import
3. AI will automatically use it if it's cheaper/more valuable than existing options

### Adding New Server Events
1. Add socket event handler in `server/index.js` in the `io.on('connection')` callback
2. Validate action first (player exists, cooldown OK, resources OK, ownership OK)
3. Update game state (GameEngine methods)
4. Broadcast updates via `io.emit()` or `io.to(socketId).emit()`

### Modifying AI Behavior
1. Edit `AIEngine.calculateBotDecision()` to change strategy priority
2. Edit `AIEngine.findCaptureTargets()` to change target selection
3. Edit `AIEngine.findBuildTarget()` to change building strategy
4. Adjust throttle time (currently 2 seconds) in `AIEngine.makeDecisions()` for more/less frequent decisions

### Performance Considerations
- **Economy loop runs every 1 second**—keep game loop fast
- **AI decisions throttled to 2 seconds**—prevents CPU overload with many bots
- **Map updates broadcast to all players**—minimize update frequency
- **Avoid O(n²) algorithms** in game loop (map has 400 tiles × player count)

## Common Bugs & Fixes

### Bot Not Acting
- Check `activeBots` array is populated when bots join
- Verify `AIEngine.makeDecisions()` is called in economy loop
- Check bot's cooldown (3 second action cooldown applies to bots too)

### Capital Not Destroying Enemy
- Verify `killPlayer()` function is called on capital capture
- Check `remainingPlayers` filter correctly identifies human vs bot players
- Ensure `game_won` event is emitted when last enemy is eliminated

### Incorrect Spawn Points
- Check `findSpawnPoint()` finds unoccupied tiles
- Verify distance calculation prefers far-away locations
- Ensure spawn defense (100) is set correctly for new players

## Testing

Run tests with:
```bash
npm test              # Run all tests once
npm run test:watch   # Run tests in watch mode
```

Tests are in `tests/server/` and validate:
- Geometry calculations (distance, adjacency, coordinates)
- Game state management (player add/remove)
- Action validation (cooldowns, resources, adjacency)

## Future Improvements

- **Difficulty Levels**: Modify AI strategy based on difficulty setting
- **Multiplayer Support**: Currently single-player only; multiplayer would need:
  - Network synchronization for simultaneous actions
  - Anti-cheat validation (client sending false positions)
  - Turn-based or real-time conflict resolution
- **Persistent State**: Save/load game state from database
- **Replay System**: Record and playback game actions
