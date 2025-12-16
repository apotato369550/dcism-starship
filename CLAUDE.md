# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DCISM Starship 2.0 is a real-time multiplayer territory control game with vaporwave aesthetic built with Socket.IO, Express, and vanilla JavaScript. Players establish colonies, build production and defense structures, capture enemy territories, and compete to eliminate opponents by destroying their capitals.

## Architecture

### Stack
- **Backend**: Node.js with Express and Socket.IO for real-time multiplayer
- **Frontend**: Vanilla JavaScript with HTML5 Canvas rendering
- **Configuration**: Environment variables via `.env` file
- **No build process**: Runs directly with Node.js (CommonJS modules)

### Project Structure (Refactored)
```
starbase-dcism-io/
├── server/
│   ├── index.js                    # Express setup, Socket.IO handlers, economy loop
│   ├── config/
│   │   ├── environment.js         # .env parsing and validation
│   │   └── constants.js           # (shared in shared/)
│   ├── services/
│   │   ├── GameEngine.js          # Core game logic and state management
│   │   └── (additional services as needed)
│   └── utils/
│       └── geometry.js            # Coordinate and distance calculations
├── client/
│   ├── index.html                  # Minimal HTML structure
│   ├── styles/
│   │   ├── variables.css          # CSS custom properties and theme
│   │   ├── base.css               # Body and global styles
│   │   ├── overlays.css           # Login/game-over overlays
│   │   ├── ui-panel.css           # Left sidebar UI
│   │   ├── shop.css               # Shop grid
│   │   ├── inspector.css          # Tile inspector
│   │   ├── canvas.css             # Game area
│   │   ├── chat.css               # Chat box
│   │   └── tooltips.css           # Tooltip styles
│   └── scripts/
│       ├── main.js                # Application entry point
│       ├── socket/
│       │   └── socketClient.js    # Socket.IO wrapper
│       ├── game/
│       │   ├── GameState.js       # Client game state
│       │   ├── Renderer.js        # Canvas rendering
│       │   └── Camera.js          # Camera/viewport control
│       ├── input/
│       │   ├── MouseHandler.js    # Mouse event handling
│       │   └── KeyboardHandler.js # Keyboard event handling
│       └── ui/
│           ├── UIManager.js       # UI coordination
│           ├── StatsUI.js         # Stats display
│           ├── ShopUI.js          # Shop panel
│           ├── InspectorUI.js     # Tile inspector
│           ├── ChatUI.js          # Chat interface
│           └── AudioManager.js    # Audio system
├── shared/
│   └── constants.js               # Shared game constants
├── config/
│   └── tiles.js                   # Unit/building definitions
├── tests/
│   ├── server/
│   │   └── utils/
│   │       └── geometry.test.js   # Geometry utility tests
│   └── shared/
│       └── constants.test.js      # Constants tests
├── docs/
│   ├── ARCHITECTURE.md            # Architecture guide
│   └── CONTRIBUTING.md            # Contribution guidelines
├── .env                           # Environment variables
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc.json               # Prettier configuration
├── jest.config.js                 # Jest test configuration
├── package.json                   # Dependencies and scripts
└── CLAUDE.md                      # This file (developer guidance)
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
Defined in `config/tiles.js`:
- Production: `solar_siphon` → `flux_reactor` → `void_harvester` (increasing income)
- Military: `orbital_wall` → `laser_battery` (increasing defense)
- Each unit has: `name`, `type` (prod/mil), `cost`, `val` (income or defense bonus), `symbol` (emoji), `upgrade` (next tier or null)
- Auto-imported by server on startup

## Development Commands

### Start the server
```bash
npm start           # Production mode
npm run dev         # Development mode with nodemon (hot reload)
```
The game runs on `http://localhost:3000`

### Install dependencies
```bash
npm install
```

### Linting and Code Quality
```bash
npm run lint        # Check code with ESLint
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Format code with Prettier
```

### Testing
```bash
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
```
Tests are located in `tests/` and use Jest framework.

## Module System

### Client-Side (ES6 Modules)
Client code uses ES6 modules with `import`/`export` syntax. All modules are ES6 and run directly in the browser (no build step):
- **Entry point**: `client/scripts/main.js`
- **Module organization**: Organized by concern (game, UI, input, audio, socket)
- **Import paths**: Use relative paths (e.g., `import { Renderer } from './game/Renderer.js'`)

### Server-Side (CommonJS)
Server code uses CommonJS (`require`/`module.exports`):
- **Entry point**: `server/index.js`
- **Services**: GameEngine and utilities in `server/services/` and `server/utils/`
- **Configuration**: Environment parsing in `server/config/`
- **No build step**: Runs directly with Node.js

### Shared Code
Common constants and types are in `shared/constants.js`:
- Accessible to both client and server
- Use `require()` in server, `import` in client if needed

## Making Changes

### Adding New Modules
1. **Client modules**: Create in `client/scripts/` with appropriate subfolder
2. **Export as class or functions**: `export class MyClass {}` or `export function myFunc() {}`
3. **Import in main.js**: `import { MyClass } from './path/to/MyClass.js'`

### Adding New Services (Server)
1. **Create in `server/services/`**: `module.exports = class MyService {}`
2. **Import in `server/index.js`**: `const MyService = require('./services/MyService')`
3. **Initialize and use**: `const service = new MyService(); service.method();`

### Modifying game balance
All game configuration is in `.env` file:
- **Map size**: `MAP_WIDTH`, `MAP_HEIGHT` (default: 20x20)
- **Starting resources**: `STARTING_ENERGY` (default: 10), `STARTING_ENERGY_PER_SEC` (default: 0)
- **Cooldown duration**: `COOLDOWN_MS` (default: 3000ms)
- **Tile defaults**: `BASE_TILE_DEFENSE`, `BASE_TILE_MAX_DEFENSE` (default: 10 each)
- **Economy tick**: `ECONOMY_TICK_MS` (default: 1000ms)
- **Server port**: `PORT` (default: 3000)

### Adding new buildings
1. Add entry to `config/tiles.js` with `name`, `type`, `cost`, `val`, `symbol`, `upgrade`
2. Server automatically imports and exports to clients
3. Client automatically renders new items in shop UI (production/military categories)
4. No client-side changes needed unless adding new unit types beyond prod/mil

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

### UI & Controls
**Mouse Controls:**
- **Click tile**: Select for inspection or execute action
- **Ctrl + Scroll**: Zoom in/out (0.5x to 3x)
- **Ctrl + Drag**: Pan camera

**Keyboard Controls:**
- **WASD**: Move camera (W=up, A=left, S=down, D=right)
- **Arrow Keys**: Navigate tile selection (↑↓←→)
- **Enter**: Build on selected tile or capture enemy tile

**UI Modes:**
- **Build mode**: Select shop item → select owned tile → press Enter to place
- **Inspector mode**: Select owned tile with building → shows demolish option
- **Capture mode**: Select enemy/neutral tile → press Enter to attack

### Audio
- **SFX Toggle**: Enable/disable sound effects (action, build, capture)
- **Music Toggle**: Enable/disable chill vaporwave ambient music
- **Red when disabled**: Buttons turn red when toggled off
- Toggles appear in left sidebar

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
