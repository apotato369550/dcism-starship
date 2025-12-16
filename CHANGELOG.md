# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-16

### Added
- Initial release of DCISM Starship 2.0
- Real-time multiplayer territory control gameplay
- 20x20 grid-based map system
- Socket.IO-based multiplayer networking
- Production buildings system (Solar Siphon, Flux Reactor, Void Harvester)
- Military buildings system (Orbital Wall, Laser Battery)
- Energy-based resource management
- Territory expansion mechanics with adjacency requirements
- Capital defense win/loss condition
- Player elimination system
- Live chat functionality
- HTML5 Canvas-based rendering
- Neon cyberpunk UI theme
- 3-second action cooldown system
- Manual energy generation button
- Tile inspector with demolish functionality
- Spawn point distribution algorithm for fair player placement
- Real-time income calculation (1 second tick rate)
- Tooltip system showing tile information
- Game over overlay with respawn option
- Login screen with callsign entry

### Technical Details
- Express server on port 3000
- CommonJS module system
- Client-side vanilla JavaScript
- Server-authoritative game state
- Event-driven architecture with Socket.IO
