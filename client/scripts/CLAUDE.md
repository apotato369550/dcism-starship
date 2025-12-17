# Client Scripts Architecture

Frontend application using vanilla JavaScript ES6 modules. No build process—runs directly in browser.

## Overview

- **Entry Point**: `main.js` - Initializes all systems and connects components
- **Game State**: `game/GameState.js` - Client-side game data cache
- **Rendering**: `game/Renderer.js` - HTML5 Canvas game view
- **Camera**: `game/Camera.js` - Viewport and zoom control
- **Network**: `socket/socketClient.js` - Socket.IO wrapper
- **Input**: `input/` - Mouse and keyboard handlers
- **UI**: `ui/` - User interface components (stats, shop, chat, etc.)
- **Audio**: `audio/AudioManager.js` - SFX and music management

## Module Structure

### Game Loop (`main.js`)

**Responsibilities**:
- Initialize all subsystems
- Wire up event handlers
- Connect input → game logic → render → display

**Component Initialization**:
1. **Game Systems**: GameState, Camera, Renderer
2. **UI Systems**: StatsUI, ShopUI, InspectorUI, ChatUI, UIManager
3. **Input Systems**: MouseHandler, KeyboardHandler
4. **Network**: SocketClient

**Event Flow**:
```
Socket Events → GameState Update → Renderer Render → Canvas Display
User Input → Socket Emit → Server Validation → Update broadcast
```

**When to Add Features**:
- New overlay (mode select, settings) → Add to HTML, wire in `main.js`
- New input action (hotkey) → Update `KeyboardHandler` and wire callback
- New game phase → Add state to GameState, handle in socket events

### Game State (`game/GameState.js`)

**Purpose**: Local cache of game state from server. Syncs via Socket.IO.

**Key Properties**:
```javascript
map[]                   // Array of 400 tiles (cache of server map)
myId                    // This player's socket ID
shopData{}              // Unit definitions (from SHOP config)
selectedUnitKey         // Currently selected unit for building (or null)
selectedTileIndex       // Currently selected tile (-1 if none)
isCooldown              // Whether action cooldown is active
```

**Key Methods**:
- `init(data)` - Initialize from server's init event:
  - Cache map, shop data
  - Store player ID for comparisons
  - Select player's home tile initially

- `updateTile(tile)` - Update single tile from server update:
  - Replace entire tile object in map array
  - Called frequently during gameplay

- `selectUnit(unitKey)` - Select unit for building:
  - Set `selectedUnitKey` or null to deselect
  - Triggers UI highlight changes

- `selectTile(index)` - Select tile for inspection:
  - Validate index is in range
  - Set `selectedTileIndex`
  - Triggers UI and renderer updates

- `getTile(index)` - Get tile object by index
- `getSelectedTile()` - Get currently selected tile object

- `isMyTile(index)` - Check if tile owned by player
- `isAdjacentToMine(index)` - Check if tile touches player's territory

- `triggerCooldown()` - Set cooldown flag and disable UI for 3 seconds
- `canBuild()` - Return true if not on cooldown and unit selected

**When to Add Features**:
- New player stat → Add property in `init()`, update in socket handler
- New selection type (more than tile) → Add properties and getters
- New building rules → Add validation method

### Renderer (`game/Renderer.js`)

**Purpose**: HTML5 Canvas rendering of game map.

**Key Properties**:
```javascript
canvas          // HTML canvas element
ctx             // Canvas 2D context
gameState       // Reference to GameState for data
camera          // Reference to Camera for viewport
baseSize = 40   // Pixels per tile at 1x zoom
```

**Rendering Order** (each tick):
1. Clear canvas
2. Apply camera transforms (zoom, pan)
3. For each tile:
   - Draw background (tile color or dark if unowned)
   - Draw grid lines (light gray)
   - Draw unit icon (emoji) if present
   - Draw capital crown (👑) if home tile
   - Draw selection highlight (white/cyan double border)
   - **Draw capital highlight** (yellow border if own capital)
   - Draw HP display (defense in corner)
4. Restore canvas transform

**Key Methods**:
- `render()` - Full frame render
  - Called ~60fps during gameplay
  - Performance critical—keep fast

- `resizeCanvas()` - Handle window resize:
  - Update canvas size to fill window
  - Called on window resize event

- `screenToWorldTile(screenX, screenY)` - Convert mouse coords to tile:
  - Transform screen → camera coordinates
  - Clamp to valid tile range
  - Used in click detection

- `updateTooltip(tooltip, tileIndex, clientX, clientY)` - Show tile info:
  - Display tile name, defense values
  - Update position with mouse
  - Show "OCCUPIED" if owned

**Your Capital Highlight** (yellow border):
```javascript
if (tile.isHome && tile.owner === this.gameState.myId) {
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(x - 2, y - 2, tileSize + 4, tileSize + 4);
}
```

This highlights your home base with thick yellow border at any zoom level.

**When to Extend**:
- New tile visualization (special effects) → Add in main loop after HP display
- New selection types → Add rendering logic in selection highlight section
- UI overlays (not in-game) → Create separate CSS, don't modify Renderer
- Performance issues → Profile with DevTools, optimize loop

### Camera (`game/Camera.js`)

**Purpose**: Viewport management—pan, zoom, coordinate transformation.

**Key Properties**:
```javascript
x, y            // Camera position (center of view)
zoomLevel       // Zoom multiplier (0.5x to 3x)
panSpeed        // Pixels per movement tick
```

**Key Methods**:
- `screenToWorld(screenX, screenY, canvasWidth, canvasHeight)` - Convert screen coords to world
- `worldToScreenTile(world)` - Convert world coords to tile index
- `panFrom(startX, startY, currentX, currentY)` - Pan from mouse drag
- `pan(dx, dy)` - Pan by delta
- `zoomTowardsMouse(deltaY, screenX, screenY, canvasW, canvasH)` - Zoom maintaining mouse position

**When to Modify**:
- Adjust pan speed → modify `panSpeed` property or constant
- Change zoom limits → modify min/max in `zoomTowardsMouse()`
- Add smooth interpolation → modify pan methods

---

## Input Handlers

### MouseHandler (`input/MouseHandler.js`)
Processes mouse clicks and wheel events.

**Behaviors**:
- **Tile click**: Selects tile for inspection/action
- **Ctrl+wheel**: Zoom in/out
- **Ctrl+drag**: Pan camera
- **Click outside canvas**: Deselect tile and exit build mode

### KeyboardHandler (`input/KeyboardHandler.js`)
Processes keyboard input.

**Behaviors**:
- **Arrow keys**: Navigate tile selection
- **Enter**: Build on selected tile or attack selected enemy
- **WASD**: Pan camera

---

## UI Components

### UIManager (`ui/UIManager.js`)
Coordinates all UI subsystems—the orchestrator.

**Key Methods**:
- `renderShop(callback)` - Initialize shop with build mode toggle
- `updateStats(player)` - Update energy/mps display
- `updateInspector(tileIndex, callback)` - Show tile details and demolish button
- `selectTile(index)` - Wrapper to update all UI when tile selected
- `triggerCooldown(callback)` - Flash UI during action cooldown
- `addChatMessage(user, msg, color)` - Display chat message

### StatsUI (`ui/StatsUI.js`)
Displays player energy, mps, and cooldown timer.

### ShopUI (`ui/ShopUI.js`)
Shows available units organized by type (production/military).
- Click unit → enter build mode
- Click again → exit build mode
- Shows cost and effect for each unit

### InspectorUI (`ui/InspectorUI.js`)
Shows details of selected tile and demolish button (if owned).

### ChatUI (`ui/ChatUI.js`)
Chat interface at bottom of screen.

### AudioManager (`audio/AudioManager.js`)
Sound effects and ambient music.

**Methods**:
- `playSFX(type)` - Play action/build/capture sound
- `startAmbientMusic()` - Start looping vaporwave music
- `toggleSFX()` / `toggleMusic()` - Toggle audio on/off

---

## Network Communication (`socket/socketClient.js`)

**Purpose**: Socket.IO wrapper to abstract communication.

**Outbound Events**:
- `joinGame(username, options)` - Join with username and mode
- `click_generate()` - Manual energy charge
- `placeUnit(tileIndex, unitType)` - Build unit
- `captureAttempt(tileIndex)` - Attack tile
- `demolishUnit(tileIndex)` - Remove unit
- `sendChat(message)` - Send message

**Inbound Events**:
- `init(data)` - Game initialized (map, player, shop)
- `map_update_single(tile)` - Single tile changed
- `update_self(player)` - Player stats changed
- `action_success()` - Cooldown triggered
- `game_over()` - Player eliminated
- `game_won()` - Player won
- `chat_receive(data)` - Chat message

**When to Add Features**:
- New action type → Add emit method and handler
- New server event → Add onXxx listener method

---

## Module System (ES6)

All client code uses ES6 modules:
```javascript
// Import
import { Renderer } from './game/Renderer.js';

// Export
export class MyClass {}
export function myFunction() {}
```

**Important**:
- Always include `.js` extension in imports
- Relative paths only (e.g., `./`, `../`)
- No build step—modules loaded directly by browser
- Execution order matters—main.js loads first

---

## Performance Considerations

- **Render**: Called ~60fps, keep tight
- **Event Handlers**: Should emit socket events and return quickly
- **Game State**: Minimize property checks in hot loops
- **Camera**: Coordinate transformations are called per tile per frame
- **Large Maps**: Consider tile culling (don't render off-screen tiles)

---

## Common Patterns

### Updating After Server Event
```javascript
socketClient.onMapUpdate(tile => {
    gameState.updateTile(tile);
    renderer.render();  // Re-render immediately
});
```

### User Action Flow
```javascript
// User clicks tile
mouseHandler → gameState.selectTile() → uiManager.selectTile() → renderer.render()

// User clicks action (e.g., build)
input handler → socketClient.placeUnit() → wait for response → gameState.updateTile() → renderer.render()
```

### Adding New UI Element
1. Create component in `ui/`
2. Export class with methods for updates
3. Initialize in `main.js`
4. Wire socket events to component methods in `main.js`
5. Wire UI events to socket emissions

---

## Debugging Tips

- **Canvas Issues**: Open DevTools, inspect canvas element, check CSS
- **Input Not Working**: Check KeyboardHandler/MouseHandler event listeners
- **Network Issues**: Check Network tab in DevTools, verify socket events
- **Render Problems**: Add console.log in Renderer.render(), check coordinates
- **State Sync Issues**: Log GameState updates vs server events
