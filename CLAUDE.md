# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DCISM Starship 2.0 is a real-time multiplayer territory control game built with Socket.IO, Express, and vanilla JavaScript. Players establish colonies, build production and defense structures, capture enemy territories, and compete to eliminate opponents by destroying their capitals.

## Architecture

### Stack
- **Backend**: Node.js with Express and Socket.IO for real-time multiplayer
- **Frontend**: Vanilla JavaScript with HTML5 Canvas rendering
- **No build process**: Runs directly with Node.js (CommonJS modules)

### Project Structure
```
starbase-dcism-io/
├── server/
│   └── index.js        # Socket.IO server, game logic, and economy loop
├── client/
│   └── index.html      # Full UI, canvas rendering, and client Socket.IO code
└── package.json        # Dependencies only (no custom scripts)
```

### Communication Flow
1. Client connects via Socket.IO (`io()` in client, `io.on('connection')` in server)
2. Player joins game with username → server assigns spawn point, home base, color
3. Client emits actions: `click_generate`, `place_unit`, `capture_attempt`, `demolish_unit`, `send_chat`
4. Server validates actions, updates game state, broadcasts changes via `map_update_single` or `update_self`
5. Economy loop runs every 1 second on server, calculating income from production buildings

### Game State Management
- **Server-side**: Single authoritative `gameMap` array (400 tiles for 20x20 grid) and `players` object
- **Client-side**: Local `map` array synced via Socket.IO events, renders on HTML5 canvas
- **Tile structure**: Each tile has `id`, `owner`, `defense`, `maxDefense`, `unit`, `isHome`, `color`
- **Player structure**: `id`, `username`, `mp` (energy/currency), `mps` (energy per second), `lastMoveTime`, `homeIndex`, `color`

### Key Game Mechanics
- **Territory expansion**: Must be adjacent to owned tiles (checked via `isAdjacent()`)
- **Capture cost**: Equal to target tile's current defense value
- **Cooldown system**: 3 second global cooldown on all player actions (build, capture, attack)
- **Win condition**: Destroying an opponent's capital (tile with `isHome: true`) eliminates them
- **Buildings**: Production units increase `mps`, military units increase tile `maxDefense` and `defense`

### Shop System
Defined in `SHOP` object in `server/index.js`:
- Production: `solar_siphon` → `flux_reactor` → `void_harvester` (increasing income)
- Military: `orbital_wall` → `laser_battery` (increasing defense)
- Each unit has: `name`, `type` (prod/mil), `cost`, `val` (income or defense bonus), `symbol` (emoji)

## Development Commands

### Start the server
```bash
node server/index.js
```
The game runs on `http://localhost:3000`

### Install dependencies
```bash
npm install
```

### No build/test commands
The project has no build process, linting, or tests configured. All code runs directly.

## Making Changes

### Modifying game balance
- Map size: `MAP_WIDTH`, `MAP_HEIGHT` in `server/index.js`
- Cooldown duration: `COOLDOWN_MS` (currently 3000ms)
- Starting resources: `mp: 100` in player initialization
- Unit costs/values: Edit `SHOP` object entries

### Adding new buildings
1. Add entry to `SHOP` object with `name`, `type`, `cost`, `val`, `symbol`, `upgrade`
2. Client automatically renders new items in shop UI (production/military categories)
3. No client-side changes needed unless adding new unit types beyond prod/mil

### Canvas rendering
- Tile size: `TILE_SIZE = 40` (pixels per tile)
- Rendering order in `render()`: background → grid lines → selection highlight → unit symbols → HP text
- Colors defined in CSS `:root` variables (`--neon-pink`, `--neon-blue`, etc.)

### Socket.IO events
**Client → Server:**
- `join_game(username)` - Initialize player
- `click_generate()` - Manual energy generation
- `place_unit({tileIndex, unitType})` - Build structure
- `capture_attempt(tileIndex)` - Attack/capture tile
- `demolish_unit(tileIndex)` - Remove owned structure
- `send_chat(message)` - Broadcast chat message

**Server → Client:**
- `init({map, you, shop})` - Full game state on join
- `map_update_single(tile)` - Single tile changed
- `update_self(player)` - Your player stats changed
- `game_over()` - You were eliminated
- `action_success()` - Trigger cooldown UI
- `chat_receive({user, msg, color})` - Chat message

### UI Modes
- **Build mode**: Select shop item → click owned tiles to place
- **Inspector mode**: Click owned tile with building → shows demolish option
- **Capture mode**: Click adjacent enemy/neutral tiles (costs energy equal to defense)

## Common Patterns

### Server-side validation
Always check before actions:
1. Player exists in `players` object
2. Cooldown elapsed: `Date.now() - player.lastMoveTime >= COOLDOWN_MS`
3. Sufficient resources: `player.mp >= cost`
4. Ownership/adjacency rules

### Broadcasting updates
- Use `io.emit()` for global updates (map changes, chat)
- Use `io.to(socketId).emit()` for player-specific updates
- Use `socket.emit()` for responses to the sender only

### Player elimination
`killPlayer(socketId)` function:
1. Emits `game_over` to victim
2. Clears all victim's tiles from map
3. Broadcasts tile updates to all players
4. Removes player from `players` object
