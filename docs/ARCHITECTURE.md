# Architecture Guide - DCISM Starship 2.0

## Overview

DCISM Starship 2.0 is a refactored, modular real-time multiplayer game built with:
- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: Vanilla JavaScript (ES6 modules) + HTML5 Canvas
- **No build step**: Runs directly with Node.js and modern browsers

## Design Principles

1. **Separation of Concerns**: Code is organized by functionality (game logic, UI, input, networking)
2. **Modularity**: Each piece handles one responsibility
3. **No Build Step**: Uses ES6 modules (client) and CommonJS (server) for direct execution
4. **Vanilla Stack**: No frameworks, just clean JavaScript

## Server Architecture

### Game State Management (`server/services/GameEngine.js`)
- Centralized game state: `gameMap` (400 tiles) and `players` (connected players)
- Methods for player management: `addPlayer()`, `removePlayer()`, `killPlayer()`
- Methods for tile operations: `getTile()`, `updateTilePlayer()`, `addTileDefense()`
- Cooldown system: `canPlayerAct()`, `setPlayerCooldown()`

### Configuration (`server/config/`)
- **environment.js**: Parses `.env` and provides config to services
- Centralizes all configuration in one place

### Utilities (`server/utils/`)
- **geometry.js**: Coordinate conversion (`getCoords()`), distance calculation (`getDistance()`), adjacency checking (`isAdjacent()`)
- Reusable geometry functions for game rules

### Main Server (`server/index.js`)
- Express HTTP server + Socket.IO setup
- Socket event handlers for game actions
- Economy loop (1 second tick) for passive income calculation
- Player elimination logic

### Socket Events Flow
```
Client → Socket.IO → Server Handler → GameEngine.method() → State Update → Socket.IO → Broadcast to Clients
```

## Client Architecture

### Application Entry Point (`client/scripts/main.js`)
- Initializes all systems (game state, rendering, input, networking)
- Coordinates between modules
- Sets up event listeners and game loop

### Game Logic (`client/scripts/game/`)
- **GameState.js**: Client-side state mirror (map, player ID, selected unit/tile)
- **Renderer.js**: Canvas rendering engine (tiles, units, selection, HP)
- **Camera.js**: Viewport management (pan, zoom, screen-to-world conversion)

### Input Handling (`client/scripts/input/`)
- **MouseHandler.js**: Mouse events (click, wheel zoom, drag pan)
- **KeyboardHandler.js**: Keyboard events (WASD camera, arrows for selection, Enter for action)
- Isolated from rendering logic

### UI Management (`client/scripts/ui/`)
- **UIManager.js**: Coordinates UI updates across components
- **StatsUI.js**: Energy/income display
- **ShopUI.js**: Building selection UI
- **InspectorUI.js**: Tile inspection panel
- **ChatUI.js**: Chat message display

### Audio System (`client/scripts/audio/`)
- **AudioManager.js**: Web Audio API wrapper
  - Sound effects: action, build, capture
  - Ambient music generation (C major pentatonic)
  - Toggle management for SFX and music

### Networking (`client/scripts/socket/`)
- **socketClient.js**: Socket.IO wrapper
  - Emits game actions to server
  - Listens for server events
  - Decoupled from game logic

### Styling (`client/styles/`)
- Modularized CSS by component
- **variables.css**: Theme colors and spacing
- **base.css**: Global styles and scanlines
- **overlays.css**: Login/game-over screens
- **ui-panel.css**: Sidebar styling
- **shop.css**, **inspector.css**: Component styles
- **canvas.css**: Game area
- **chat.css**, **tooltips.css**: Additional components

## Data Flow

### Initialization Flow
1. Client connects via Socket.IO
2. Server emits `init` with full game state
3. Client creates GameState, initializes Renderer
4. Input handlers start listening
5. Game loop begins

### Action Flow (e.g., Building Placement)
1. Player clicks tile (MouseHandler)
2. GameState updates selectedTile
3. Renderer redraws with selection
4. Player presses Enter (KeyboardHandler)
5. Client emits `place_unit` via SocketClient
6. Server validates in GameEngine
7. GameEngine updates tile and player state
8. Server broadcasts `map_update_single` and `update_self`
9. Client receives updates and re-renders

## Module Dependencies

### Server
```
server/index.js
├── config/environment.js
├── services/GameEngine.js
├── utils/geometry.js
└── config/tiles.js (shared)
```

### Client
```
client/scripts/main.js
├── GameState.js → Renderer.js → Camera.js
├── UIManager.js → StatsUI, ShopUI, InspectorUI, ChatUI
├── MouseHandler.js
├── KeyboardHandler.js
├── AudioManager.js
└── SocketClient.js
```

## State Management

### Server State
```javascript
gameEngine.gameMap      // Array of 400 tiles with owner, defense, unit, etc.
gameEngine.players      // Object: { socketId: playerData }
```

### Client State
```javascript
gameState.map           // Mirror of server's gameMap
gameState.selectedUnitKey    // Currently selected building
gameState.selectedTileIndex  // Currently selected tile
gameState.isCooldown        // Whether action cooldown is active
```

## Extension Points

### Adding New Buildings
1. Add to `config/tiles.js` with name, type, cost, val, symbol
2. Server/client automatically support it (no code changes needed)

### Adding New Game Mechanics
1. Add method to `GameEngine` (server-side logic)
2. Add Socket.IO handler in `server/index.js`
3. Add client-side handler in game modules
4. Update UI modules if needed

### Adding New UI Components
1. Create new component class in `client/scripts/ui/`
2. Import in `main.js`
3. Initialize and coordinate via `UIManager`

### Adding New Input Handling
1. Add method to `MouseHandler` or `KeyboardHandler`
2. Call handler from game logic in `main.js`

## Performance Considerations

- **Canvas Rendering**: Optimized with camera transformation matrix
- **Socket.IO**: Only sends tile/player updates when they change
- **Economy Loop**: Runs every 1 second (configurable)
- **Module Loading**: ES6 modules cached by browser after first load
- **No Build Step**: Faster development cycle, but modules not bundled (fine for current scale)

## Testing

Tests are located in `tests/` and use Jest:
- `tests/shared/constants.test.js`: Constants validation
- `tests/server/utils/geometry.test.js`: Geometry utility tests
- Add more tests as functionality grows

Run with: `npm test`

## Future Improvements

1. **Further Modularization**: Separate socket handlers into dedicated files
2. **Asset Management**: Create `assets/` folder for sprites and audio files
3. **Build System**: Add Vite/Webpack for production bundling and minification
4. **Type Safety**: Migrate to TypeScript for better type checking
5. **Persistence**: Add database for game state and player profiles
6. **Scaling**: Implement game rooms/lobbies for multiple matches
