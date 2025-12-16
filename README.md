# DCISM Starship 2.0

A real-time multiplayer territory control game where players establish colonies, build production and defense structures, and compete to dominate the galaxy.

## Features

- **Real-time Multiplayer**: Compete against other players in a shared 20x20 grid universe
- **Territory Expansion**: Capture adjacent tiles to expand your empire
- **Strategic Building**: Choose between production structures (energy generation) or military defenses
- **Resource Management**: Manage energy resources to build, capture, and defend
- **Live Chat**: Communicate with other players in real-time
- **Capital Defense**: Protect your home base or face elimination

## Game Mechanics

### Territory Control
- Start with a home capital tile
- Expand by capturing adjacent tiles (costs energy equal to the tile's defense)
- Only adjacent tiles to your territory can be captured

### Resources
- **Energy (MP)**: Used for building structures and capturing tiles
- Earn energy passively (1/sec base rate)
- Boost income by building production structures
- Manual charge available for quick energy bursts

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
- Plan your moves strategically

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

1. **Join the Game**: Enter your callsign and click "INITIALIZE"
2. **Build Structures**: Select a building from the shop, then click on your owned tiles to place it
3. **Expand Territory**: Click on adjacent enemy or neutral tiles to capture them (costs energy)
4. **Manage Resources**: Balance between production buildings (for income) and military buildings (for defense)
5. **Demolish**: Click on your structures to select them, then use the "Demolish" button to remove them
6. **Chat**: Use the chat box in the bottom right to communicate with other players

## Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5 Canvas
- **Real-time Communication**: Socket.IO for bidirectional event-based communication

## Project Structure

```
starbase-dcism-io/
├── client/
│   └── index.html          # Client-side UI and game rendering
├── server/
│   └── index.js            # Server logic and Socket.IO handlers
├── package.json            # Project dependencies
├── CLAUDE.md               # Development guidance for Claude Code
└── README.md               # This file
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

ISC
