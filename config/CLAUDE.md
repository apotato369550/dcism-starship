# Configuration

Game balance, unit definitions, and build configuration.

## tiles.js

**Purpose**: Define all buildable units and their properties.

**Exports**: `TILE_TYPES` object mapping unit keys to definitions.

**Unit Properties**:
```javascript
{
  name: 'Solar Siphon',          // Display name
  description: '...',            // Flavor text (shown in shop modal)
  type: 'prod',                  // 'prod' (production) or 'mil' (military)
  cost: 20,                       // Energy cost to build
  val: 1,                        // Effect value:
                                 //   - prod type: energy/sec generated
                                 //   - mil type: defense bonus
  symbol: '⚡',                  // Emoji displayed on tiles
  upgrade: 'flux_reactor'        // Key of next tier (null if max)
}
```

### Current Units

**Production (Income Generators)**:
- `solar_siphon`: Cost 20, +1 energy/sec (foundation)
- `flux_reactor`: Cost 150, +5 energy/sec (mid-tier)
- `void_harvester`: Cost 600, +25 energy/sec (late-game)

**Military (Defense Builders)**:
- `orbital_wall`: Cost 50, +50 defense (foundation)
- `laser_battery`: Cost 300, +150 defense (late-game)

### How It Works

When a unit is placed on a tile:

**Production Units** (`type: 'prod'`):
- Add `val` to player's MPS (mps per second)
- Recalculated in economy loop each tick

**Military Units** (`type: 'mil'`):
- Add `val` to tile's `maxDefense`
- Also add to current `defense` when built
- Multiple on same tile stack (multiple buildings = stronger)

### Adding New Units

1. **Create entry in TILE_TYPES**:
```javascript
superlaser: {
  name: 'Superlaser Battery',
  description: 'Ultimate directed energy weapon.',
  type: 'mil',
  cost: 1000,
  val: 300,
  symbol: '⚡️🔫',
  upgrade: null  // No tier beyond this
}
```

2. **No server code changes needed**:
- Server auto-loads SHOP from this file
- Clients auto-render in shop UI
- AI automatically considers it for building

3. **Adjust for balance**:
- Increase `cost` to make rarer
- Adjust `val` for power level
- Set `upgrade` to create tech trees

### Balance Considerations

**Cost Scaling**:
- Should take ~2-3 minutes to afford (at moderate income)
- Production buildings: ~20, 150, 600 (exponential)
- Military buildings: ~50, 300 (exponential)

**Value Scaling**:
- Production: 1, 5, 25 (multiplicative) → late-game vastly outpaces early
- Military: 50, 150 (multiplicative) → buildings stack for exponential defense

**Upgrade Path**:
- Each production unit chain: 1 → 5 → 25 energy/sec
- Creates three tiers of progression
- Encourages tech tree strategy

**When to Rebalance**:
- If early game feels too hard → reduce production costs
- If late game stalls → increase late-game production value
- If defense too strong → reduce military values
- If combat too quick → increase defense values

### Testing Balance

To check if balanced:
1. Start with 0 bots (solo)
2. See if you can afford to build in reasonable time
3. With 1-3 bots: See if challenge feels right
4. With 3 bots: Should be moderate difficulty

---

## Environment Configuration

See `server/config/environment.js` and `/shared/constants.js` for:

**Map Size**:
- `MAP_WIDTH`, `MAP_HEIGHT`: 20x20 grid (400 tiles)

**Game Balance**:
- `STARTING_ENERGY`: 10 (initial player energy)
- `STARTING_ENERGY_PER_SEC`: 0 (passive base income is 1)
- `BASE_TILE_DEFENSE`: 100 (default tile defense before units)
- `BASE_TILE_MAX_DEFENSE`: 100
- `COOLDOWN_MS`: 3000 (action cooldown in milliseconds)
- `ECONOMY_TICK_MS`: 1000 (income distribution frequency)

**Server**:
- `PORT`: 3000 (server port)
- `CORS_ORIGIN`: '*' (allow all origins)

### Tuning for Difficulty

**Make game easier**:
- Reduce `COOLDOWN_MS` (faster actions)
- Increase `STARTING_ENERGY` (start with more resources)
- Reduce unit costs in `tiles.js`

**Make game harder**:
- Increase `COOLDOWN_MS` (slower actions)
- Reduce `STARTING_ENERGY`
- Increase unit costs

**Adjust economy**:
- Reduce `ECONOMY_TICK_MS` for faster-paced game (income ticks faster)
- Adjust production unit values in `tiles.js`

---

## How to Update After Changes

### After Adding New Unit
- [ ] Update CLAUDE.md with new unit in "Current Units" section
- [ ] Document cost/val scaling rationale
- [ ] Note any balance changes made

### After Changing Costs/Values
- [ ] Update balance ratios in this file
- [ ] Note if this breaks existing strategies
- [ ] Test with bots to verify they adapt

### After Changing Cooldowns or Timing
- [ ] Update ECONOMY_TICK_MS/COOLDOWN_MS values here
- [ ] Note impact on action frequency
- [ ] Test AI throttle time still makes sense (currently 2 seconds)

### After Changing Map Size
- [ ] Update MAP_WIDTH/MAP_HEIGHT here
- [ ] Note tile array size: `MAP_WIDTH × MAP_HEIGHT`
- [ ] Check spawn logic still works with new size
- [ ] Update AI distance calculations if needed
