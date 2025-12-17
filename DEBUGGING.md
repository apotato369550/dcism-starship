# Debugging Guide

## Running Tests

All test files can be run with:
```bash
npm test                # Run all tests once
npm run test:watch     # Run in watch mode
```

### Specific Tests

#### GameState Tests
```bash
npm test -- GameState.test.js
```
Tests verify:
- Player list initialization
- Player name lookup
- Tile updates
- Bot player data

#### AIEngine Tests
```bash
npm test -- AIEngine.test.js
```
Tests verify:
- Aggressive parameters (1.05x capture margin, 25 energy build threshold)
- Decision throttle (1500ms)
- Target randomness (±8)
- Priority system (defense 65 < capture 80)
- Emergency attacks
- Multi-bot coexistence

#### SocketClient Tests
```bash
npm test -- socketClient.test.js
```
Tests verify:
- `onPlayersUpdate` handler is registered
- Chat events from bots are received
- All event handlers are connected
- Event flow from server to client

---

## Manual Debugging Steps

### 1. Check Browser Console for Errors

Open DevTools (F12) → Console tab and look for:
- JavaScript errors (red X)
- `[CLIENT] Players updated` log messages
- `[CHAT]` log messages

**Expected logs when bots act:**
```
[CLIENT] Players updated: 3 total players
[CHAT] Adding message: SYSTEM REPLICANT-01 generated 1 energy.
[CHAT] Adding message: SYSTEM REPLICANT-01 built a Solar Siphon.
```

### 2. Check Network Tab

DevTools → Network tab:
1. Filter by "WS" (WebSocket) or search "socket"
2. Look for Socket.IO connection (should show "101 Switching Protocols")
3. Click and look for messages:
   - `chat_receive` events
   - `map_update_single` events
   - `players_update` events

**Expected WebSocket messages:**
```json
{"sid":"...", ...}  // Connection
{"type":2,"data":["chat_receive", {"user":"SYSTEM", "msg":"..."}]}
{"type":2,"data":["players_update", {...}]}
```

### 3. Check Server Console Logs

Terminal where you ran `npm start`:

**Expected server logs:**
```
[SERVER] Creating 2 bots for single-player game
[SERVER] Added bot bot-1734442800000-0 (REPLICANT-01) to activeBots. Total: 1
[SERVER] Added bot bot-1734442800000-1 (REPLICANT-02) to activeBots. Total: 2
[ECONOMY] Ticking with 2 active bots
[AI] REPLICANT-01 decision: generate
[AI] REPLICANT-01 decision: build
[AI] REPLICANT-01 built solar_siphon on tile 42
```

If you see:
- ❌ NO `[SERVER] Creating` log → Bots weren't created (check bot count selection)
- ❌ NO `[ECONOMY] Ticking` log → Economy loop not running (check server)
- ❌ NO `[AI]` logs → AI not making decisions (check activeBots array)

---

## Capital Border Debugging

### Check If Border Renders

1. Start game
2. Open DevTools → Console
3. Type: `document.getElementById('gameCanvas')`
4. Should return the canvas element (not null)

### Manual Border Test

In browser console, add this logging:
```javascript
// Find the render function and add logging at line 58-62
console.log('Capital check for tile:', tile.isHome, tile.owner === gameState.myId);
if (tile.isHome && tile.owner === gameState.myId) {
  console.log('Drawing yellow border at:', x, y, 'size:', tileSize);
}
```

### Border Issues Checklist

- [ ] Does capital have yellow crown emoji (👑)?
- [ ] Can you zoom in/out without errors?
- [ ] Does selection highlight (white border) show correctly?
- [ ] Is canvas visible (not hidden by CSS)?

If grid lines show but border doesn't:
- Grid uses `tileSize` ✓
- Border should also use `tileSize` ✓
- If border uses `this.baseSize`, it might be wrong size

---

## AI Not Acting Checklist

### Server-Side
- [ ] Check bots are in `activeBots` array
- [ ] Verify `aiEngine.makeDecisions()` is called (check economy loop)
- [ ] Check `executeBotDecision()` is actually executing (add logging)
- [ ] Verify actions don't fail validation

### Client-Side
- [ ] Check `onPlayersUpdate` handler exists (Network tab)
- [ ] Verify `gameState.players` is populated
- [ ] Check chat messages appear for player actions (not just bots)
- [ ] Verify no JavaScript errors in console

### Quick Verification
```bash
# In browser console while game is running:
console.log('Players:', Object.keys(gameState.players));
console.log('My ID:', gameState.myId);
console.log('Bot names:', Object.values(gameState.players).map(p => p.username));
```

---

## If Tests Pass But Game Doesn't Work

This indicates:
1. Logic is correct (tests prove it)
2. Issue is in event routing or rendering
3. Check:
   - Is browser tab in focus? (Some browsers throttle)
   - Clear browser cache (Ctrl+Shift+Delete)
   - Close DevTools console and reopen (sometimes helps)
   - Try different browser (Chrome vs Firefox)
   - Restart server (`npm start`)

---

## Common Issues & Fixes

### Issue: "Bots visible on map but not acting"
- Bots exist (bots.length > 0) ✓
- Actions not executing ✗
- **Fix**: Check `executeBotDecision()` validation, look for errors in console

### Issue: "Yellow border on only 2 sides"
- Uses `tileSize` instead of consistent coordinate ✗
- **Fix**: Verify line 61 uses `tileSize`, same as line 37 (background)

### Issue: "Chat messages don't appear but console shows [AI] logs"
- Server action happening ✓
- Client not receiving/rendering ✗
- **Fix**: Check `onChatReceive` handler, verify chat DOM exists

### Issue: "Players list empty on client"
- `players_update` not broadcast ✗
- **Fix**: Verify line 66 in `server/index.js` broadcasts to all clients

---

## Test Coverage Summary

| Component | Test File | Coverage |
|-----------|-----------|----------|
| GameState | `GameState.test.js` | ✓ Player data sync |
| AIEngine | `AIEngine.test.js` | ✓ All aggressive parameters |
| SocketClient | `socketClient.test.js` | ✓ Event handlers |
| Renderer | (Manual) | Capital border rendering |
| Server | (Console logs) | Bot creation, AI decisions |

Run all tests:
```bash
npm test
```

Should see all tests passing if logic is correct.
