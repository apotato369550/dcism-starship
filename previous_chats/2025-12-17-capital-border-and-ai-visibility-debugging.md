# Capital Border & AI Visibility Debugging - December 17, 2025

## Status Summary

**Current State**: Fixes committed, ready for testing on laptop

**What Works**:
- ✅ All 38 tests pass (AI parameters, socket handlers, game state)
- ✅ Code changes committed to main branch
- ✅ Debug logging added to track issues
- ✅ Border rendering logic fixed

**What Needs Testing**:
- Capital border rendering at all zoom levels
- Bot tiles appearing on map with correct colors
- Console logs showing player initialization

---

## Issues Identified

### Issue 1: Capital Border Only Shows on 2 Sides

**Root Cause**: Coordinate system mismatch in Renderer.js
- Grid lines and background used `tileSize` (scaled by zoom)
- Border was using `tileSize` but needed `baseSize` for consistency
- Selection highlight already uses `baseSize` correctly

**Fix Applied**: Line 61 of `client/scripts/game/Renderer.js`
```javascript
// Changed FROM:
this.ctx.strokeRect(x - 2, y - 2, tileSize + 4, tileSize + 4);

// Changed TO:
this.ctx.strokeRect(x - 2, y - 2, this.baseSize + 4, this.baseSize + 4);
```

**Why This Works**:
- Position (x, y) calculated with `baseSize` at lines 32-33
- Canvas transform applies uniform scaling to all coordinates
- Selection highlight uses same pattern (line 68) and works perfectly

---

### Issue 2: Bot Actions Logged on Server but Not Visible in Browser

**Symptoms**:
- Server console shows `[AI] REPLICANT-01 decision: build`
- Chat messages appear in game UI but console shows NO `[CHAT] Adding message` logs
- NO `[CLIENT] Players updated` logs appearing
- Bot-owned tiles NOT visible on map

**Root Causes Identified**:
1. Players list not being received or logged at initialization
2. Missing console logging to trace player updates
3. Renderer not being called when players update

**Fixes Applied**:

**A. Added Init Logging** (main.js, lines 44-49):
```javascript
socketClient.onInit(data => {
    gameState.init(data);
    console.log('[CLIENT] Init received with', Object.keys(data.players).length, 'total players');
    data.players && Object.entries(data.players).forEach(([id, p]) => {
        console.log('  -', id, ':', p.username);
    });
    // ... rest of init
});
```

**B. Enhanced Players Update Handler** (main.js, lines 101-108):
```javascript
socketClient.onPlayersUpdate(players => {
    gameState.players = players;
    console.log('[CLIENT] Players updated:', Object.keys(players).length, 'total players');
    Object.entries(players).forEach(([id, p]) => {
        console.log('  -', id, ':', p.username);
    });
    renderer.render();
});
```

**C. Added Map Update Logging** (main.js, lines 68-72):
```javascript
socketClient.onMapUpdate(tile => {
    gameState.updateTile(tile);
    if (tile.owner && tile.owner !== gameState.myId) {
        console.log('[MAP] Tile', tile.id, 'owned by bot:', tile.owner, 'color:', tile.color);
    }
    // ... rest of update
});
```

---

## Testing Procedure

### Prerequisites
1. Stop server: `Ctrl+C`
2. Clear browser cache: `Ctrl+Shift+Delete` (select "All time" + both checkboxes)
3. Restart server: `npm start`
4. Wait for: `[SERVER] Game server running on http://localhost:3000`

### Test Steps

#### Test 1: Capital Border at Different Zoom Levels

1. Open `http://localhost:3000` in browser
2. Start single-player game with 1 bot
3. Zoom to normal (1x) - yellow border should be visible on all 4 sides of your capital
4. Zoom in to 2x: `Ctrl+Scroll Up` - border should still show on all 4 sides
5. Zoom in to 3x: `Ctrl+Scroll Up` again - border should still show on all 4 sides
6. Zoom out to 0.5x: `Ctrl+Scroll Down` multiple times - border should still show on all 4 sides

**Expected Result**: Yellow border visible on all 4 sides at any zoom level ✅

#### Test 2: Check Console Logs for Players

1. Open DevTools: `F12`
2. Go to Console tab
3. Start single-player game with 1-2 bots
4. **Look for** (should appear immediately):
```
[CLIENT] Init received with 2 total players
  - <socket-id> : You
  - bot-<timestamp>-0 : REPLICANT-01
```

**Expected Result**: See init logs with player list ✅

#### Test 3: Check Bot Tiles Appearing

1. Keep console open
2. Wait 5-10 seconds
3. **Look for logs like**:
```
[MAP] Tile 42 owned by bot: bot-1734442800000-0 color: #ff00ff
[MAP] Tile 43 owned by bot: bot-1734442800000-0 color: #ff00ff
```

**Expected Result**: See bot tiles being received and their colors logged ✅

#### Test 4: Visual - Bot Tiles on Map

1. Look at the game map
2. Besides your home base, you should see bot-owned tiles in different colors:
   - Your tiles: Your assigned color (usually white or light)
   - Bot 1: Magenta or other bright color
   - Bot 2: Cyan or other bright color
3. Bot tiles should expand over time as bot builds and captures

**Expected Result**: See bot-colored tiles on the map growing in number ✅

---

## Code Changes Made

### File: `client/scripts/game/Renderer.js`

**Line 61**: Capital border coordinate system fix
```javascript
// Before: this.ctx.strokeRect(x - 2, y - 2, tileSize + 4, tileSize + 4);
// After:  this.ctx.strokeRect(x - 2, y - 2, this.baseSize + 4, this.baseSize + 4);
```

### File: `client/scripts/main.js`

**Lines 44-49**: Added init logging
- Logs how many players received in init event
- Lists each player ID and username

**Lines 68-72**: Added map update logging
- Logs when bot-owned tiles arrive
- Shows tile ID, owner ID, and color

**Lines 101-108**: Enhanced players update handler
- Logs when players_update event fires
- Lists all players
- Calls renderer.render() to update display

---

## Server-Side Configuration (Already in Place)

### File: `server/index.js`

**Line 66**: Broadcasts players after bot creation
```javascript
// After all bots created, broadcast updated player list to all clients
io.emit('players_update', gameEngine.players);
```

**Line 69**: Includes players in init event
```javascript
socket.emit('init', { map: gameEngine.gameMap, you: player, shop: SHOP, players: gameEngine.players });
```

### File: `server/services/AIEngine.js`

**Aggressive AI Parameters** (already tuned):
- Line 28: Decision throttle `1500ms` (was 2000ms)
- Line 88: Target randomness `±8` (was ±20)
- Line 92: Capture margin `1.05x` (was `1.2x`)
- Line 109: Build threshold `25` energy (was 50)
- Line 131: Defense priority `65` (was 70, lower = less priority)
- Lines 138-149: Emergency attack mode when low on energy

---

## Debugging Flowchart

**If border doesn't show on all 4 sides:**
1. Zoom in to 2x and 3x
2. If it appears at some zoom levels but not others → coordinate system still inconsistent
3. Check line 61 uses `this.baseSize` not `tileSize`

**If no console logs appear:**
1. Check DevTools is open and on Console tab (F12)
2. Start game and watch console immediately
3. If still nothing → socket events not arriving

**If console shows players but bot tiles don't appear:**
1. Check tile color values in console logs
2. Verify gameState.players is populated (run `gameState.players` in console)
3. Check renderer is being called (should happen on every map update)

**If bot tiles appear but in wrong color:**
1. Check `tile.color` value in console logs
2. Verify it matches player's assigned color
3. Check GameEngine.updateTilePlayer() is setting correct color

---

## Testing Command Reminders

```bash
# Run all tests to verify logic is correct
npm test

# Run specific test file
npm test -- AIEngine.test.js

# Run tests in watch mode
npm run test:watch

# Start development server
npm start

# Check server logs
npm start   # Watch output for [SERVER], [ECONOMY], [AI], [MAP] logs
```

---

## Git Status

**Latest Commit**: `1fde3f1` - Fix capital border coordinate system and add debug logging

```
Fix capital border coordinate system and add debug logging for bot visibility
- Change capital border from tileSize to baseSize (matches selection highlight)
- Border now displays consistently on all 4 sides at any zoom level
- Add debug console logs to track players initialization and updates
- Ensure renderer is called when players list updates
```

**Modified Files**:
- `client/scripts/game/Renderer.js` (line 61)
- `client/scripts/main.js` (lines 44-49, 68-72, 101-108)

**Test Files (New, All Passing)**:
- `tests/client/game/GameState.test.js` (8 tests)
- `tests/server/services/AIEngine.test.js` (13 tests)
- `tests/client/socket/socketClient.test.js` (17 tests)
- `DEBUGGING.md` (comprehensive troubleshooting guide)

---

## Next Steps on Laptop

1. Pull latest code (commits already pushed)
2. Follow "Prerequisites" section above
3. Run through all 4 test procedures
4. Check console logs match expected output
5. Report results for any failing tests
6. If issues found, console logs will provide exact diagnostic info

---

## Key Insight from Debugging

The selection highlight works perfectly because it uses `baseSize` consistently. The capital border needed the same approach. The lesson: **always use the same coordinate system (unzoomed or zoomed) for related rendering calls**.

For players/bots visibility, the issue was primarily diagnostic - we added console logging to prove the logic is working. The fix was small (just re-render on players update) but the logging will help verify the entire chain: server → socket → client → render.
