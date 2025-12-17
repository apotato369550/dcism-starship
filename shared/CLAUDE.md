# Shared Code

Constants and values used by both server and client.

## constants.js

**Purpose**: Single source of truth for game constants. Changes here affect both backend and frontend.

**What's Defined**:

### Map Configuration
```javascript
MAP_WIDTH: 20              // Grid width in tiles
MAP_HEIGHT: 20             // Grid height in tiles
MAP_SIZE: 400              // Total tiles (20 × 20)
TILE_SIZE: 40              // Pixels per tile (rendering only)
```

### Tile Defaults
```javascript
BASE_TILE_DEFENSE: 100     // Default tile health (used in server)
BASE_TILE_MAX_DEFENSE: 100 // Maximum health cap (used in server)
SPAWN_ATTEMPTS: 50         // Times to try finding spawn point
DEFAULT_SPAWN_DEFENSE: 20  // Starting tile defense (currently unused)
CAPITAL_DEFENSE_MODIFIER: 1 // Capital tile defense multiplier (1 = same)
```

### Game Mechanics
```javascript
STARTING_ENERGY: 10        // Initial MP when joining
STARTING_ENERGY_PER_SEC: 0 // Base passive energy (actual base is 1)

COOLDOWN_MS: 3000          // Action cooldown in milliseconds
ECONOMY_TICK_MS: 1000      // Economy/income tick frequency
```

### Colors (Vaporwave Palette)
```javascript
NEON_COLORS: {
  pink: '#ff10fe',
  magenta: '#ff00ff',
  blue: '#00ffff',
  cyan: '#00f0ff',
  purple: '#b300ff',
  green: '#00ff66',
  dark: '#2b1d3d'
}
```

### Server Configuration
```javascript
PORT: 3000                 // Server port
CORS_ORIGIN: '*'           // Allow all origins (local dev)
```

---

## Usage

### Server
```javascript
const config = require('../shared/constants');
console.log(config.MAP_SIZE);  // 400
```

### Client (if needed)
```javascript
import * as constants from '../shared/constants.js';
// Note: Client typically gets map size from gameState
```

**Note**: Client doesn't typically need constants—server sends them. This file is mainly for server-side constants that might be useful across services.

---

## When to Update

### Adding New Constant
1. Define it in `constants.js`
2. Update this CLAUDE.md with explanation
3. Use the constant in code (don't hardcode values)
4. Commit with rationale

### Changing Game Balance
Examples that require changes here:
- Map size (rare, breaks many things)
- Cooldown timing
- Starting resources
- Energy tick frequency

**Process**:
1. Update constant value
2. Test thoroughly (affects all players)
3. Document rationale in this file
4. Commit with explanation

### Adding Color to Palette
1. Add to `NEON_COLORS` object
2. Use meaningful name (not just 'color1', 'color2')
3. Ensure hex value is correct
4. Update CLAUDE.md with purpose

---

## Current Values Rationale

**Map Size (20×20 = 400 tiles)**:
- Large enough for 3-4 players to have meaningful territory
- Small enough to compute quickly (400 is manageable)
- Fits well on screen at 40px per tile

**Tile Size (40px)**:
- Large enough to see detail
- Small enough to fit grid on screen
- Matches with Renderer baseSize constant

**Starting Energy (10)**:
- Enough to afford one basic unit
- Low enough that waiting for income is meaningful

**Cooldown (3 seconds)**:
- Fast enough for action feel
- Slow enough to prevent spam
- Allows time to see consequences

**Economy Tick (1 second)**:
- Reasonable income distribution frequency
- Not too fast (network overhead)
- Not too slow (feels sluggish)

**Base Tile Defense (100)**:
- Must be >= cheapest military unit (50)
- High enough that early capture is meaningful challenge
- Lowered to 10 mid-game after capture (see GameEngine.updateTilePlayer)

---

## Important Note on Constants

**Server-side Validation**:
The server uses these constants to validate client actions. The values are trusted authority—clients cannot override them.

Example:
- Server checks: `Date.now() - player.lastMoveTime >= COOLDOWN_MS`
- Client shows: cooldown UI based on same value
- If client tries to cheat (ignore cooldown), server rejects action

**Changing Constants is Risky**:
- Larger map → AI pathfinding needs updates
- Faster cooldown → could enable spam in competitive
- Different energy distribution → breaks balance completely

Test thoroughly after changes!

---

## Cross-Module Dependencies

This file is imported by:
- `server/services/GameEngine.js` - Tile defaults
- `server/config/environment.js` - Some values re-exported
- `server/utils/geometry.js` - Map width/height
- `client/scripts/game/GameState.js` - Typically not (hardcodes 20)

**Note**: Client code sometimes hardcodes values (e.g., 20 for map width) instead of importing constants. Consider consolidating if making this a dynamic value.

---

## Future Improvements

- Add difficulty level constants (easy/normal/hard)
- Add difficulty-specific values (cooldown multipliers, starting energy, AI aggression)
- Add optional environment overrides (e.g., DEV_MODE constants)
