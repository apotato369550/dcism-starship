# DCISM STARSHIP 2.0

A real-time multiplayer territory control game with vaporwave aesthetics. Establish colonies, build production and military structures, and compete to dominate the galaxy.

## Features

✨ **Vaporwave Aesthetic**
- Neon pink, cyan, and purple neon glow effects
- CRT scanline overlay
- Press Start 2P pixel font
- Fullscreen canvas with overlay UI

🎮 **Real-time Multiplayer**
- Compete against other players in shared 20x20 grids
- Territory conquest mechanics
- Dynamic production and defense structures
- Cooldown-based action economy

⌨️ **Full Keyboard & Mouse Support**
- WASD camera movement + Ctrl+Scroll zoom + Ctrl+Drag pan
- Arrow keys for tile selection
- Enter key for building/capturing
- Mouse click and drag controls

🎵 **Audio System**
- Pixel sound effects (action, build, capture)
- Chill vaporwave ambient music with C major pentatonic melodies
- Toggleable SFX and music (red when disabled)

## Game Mechanics

### Territory Control
- Start with a home capital tile
- Expand by capturing adjacent tiles (costs energy equal to the tile's defense)
- Only adjacent tiles to your territory can be captured

### Resources
- **Energy (MP)**: Used for building structures and capturing tiles
- Start with 10 energy (configurable)
- Earn energy passively by building production structures
- Recharge bar shows cooldown status (fills up to 100% when ready)

### Buildings

**Production Structures:**
- **Solar Siphon** (⚡): +1 energy/sec, costs 20 MP
- **Flux Reactor** (💠): +5 energy/sec, costs 150 MP
- **Void Harvester** (🌌): +25 energy/sec, costs 600 MP

**Military Structures:**
- **Orbital Wall** (🛡️): +50 defense, costs 50 MP
- **Laser Battery** (🔭): +150 defense, costs 300 MP

### Victory & Defeat
- Eliminate opponents by destroying their capital (👑)
- Protect your own capital at all costs
- Last player standing wins

### Cooldown System
- All actions (building, capturing) have a 3-second cooldown
- Recharge bar drains instantly on action, refills over 3 seconds
- Plan your moves strategically
- All timing configurable via `.env`

## Configuration

All settings are in `.env` file:
```env
# Map size (default: 20x20)
MAP_WIDTH=20
MAP_HEIGHT=20

# Player starting values
STARTING_ENERGY=10
STARTING_ENERGY_PER_SEC=0

# Timing (milliseconds)
COOLDOWN_MS=3000
ECONOMY_TICK_MS=1000

# Server port
PORT=3000
```

## Installation

### Prerequisites
- Node.js (v14 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/apotato369550/dcism-starship.git
cd dcism-starship
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server/index.js
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

### Game Flow
1. **Join the Game**: Enter your callsign and click "INITIALIZE"
2. Your home capital (👑) is automatically selected
3. **Build Structures**: Select a building from the shop, navigate to your tile, press Enter
4. **Expand Territory**: Navigate to adjacent enemy/neutral tiles, press Enter to capture
5. **Manage Resources**: Balance production (income) and military (defense) buildings
6. **Survive**: Defend your capital or destroy enemies' capitals

### Controls
**Mouse:**
- Click tiles to select/build
- Ctrl+Scroll to zoom
- Ctrl+Drag to pan

**Keyboard:**
- W/A/S/D: Move camera
- Arrow keys: Select adjacent tiles
- Enter: Build/capture
- Chat with other players in bottom-right

## Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5 Canvas
- **Real-time Communication**: Socket.IO for bidirectional event-based communication

## Project Structure

```
starbase-dcism-io/
├── client/
│   └── index.html          # Complete client UI and game rendering
├── server/
│   └── index.js            # Server logic and game engine
├── config/
│   └── tiles.js            # Unit/tile type definitions
├── .env                    # Configuration and game balance
├── package.json            # Dependencies
├── CLAUDE.md               # Development guidance
├── README.md               # This file
└── CHANGELOG.md            # Version history
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

ISC
