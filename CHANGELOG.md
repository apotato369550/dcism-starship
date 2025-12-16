# Changelog

All notable changes to DCISM Starship 2.0 are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ **Vaporwave Aesthetic**
  - CRT scanline overlay effect
  - Press Start 2P pixel font for UI titles
  - Enhanced neon color palette (magenta, cyan, purple)
  - Fullscreen canvas with overlay panels
  - Pixel-art themed rendering

- 🎮 **Enhanced UI/UX**
  - Fullscreen game canvas with dynamic resizing
  - Left sidebar overlay with shop, energy, and stats
  - Chat box overlay (bottom-right)
  - Shop items as 2-column grid cards with larger visuals
  - Bigger "DCISM STARSHIP" title in sidebar
  - Proper recharge bar with "RECHARGE" label
  - Selected tile visual enhancement (double border)
  - Camera bounds to prevent scrolling too far from map

- ⌨️ **Keyboard Controls**
  - WASD for camera movement
  - Arrow keys for tile selection navigation
  - Enter key to build/capture selected tiles
  - Starting tile automatically selected on join

- 🎵 **Audio System**
  - Procedurally generated pixel sound effects (action, build, capture)
  - Chill vaporwave ambient music with C major pentatonic melodies
  - Detuned pad chord base for warmth
  - Toggleable SFX and Music buttons (red when disabled)
  - All audio via Web Audio API (no external files)

- 🎮 **Camera & Viewport**
  - Zoom in/out with Ctrl+Scroll (0.5x to 3x)
  - Pan camera with Ctrl+Click and drag
  - Smooth camera transformations
  - Proper mouse coordinate conversion for tile selection

- ⚙️ **Configuration System**
  - `.env` file for all game settings
  - `config/tiles.js` for easy unit management
  - All balance values configurable without code changes

### Changed
- 🔄 **Game Balance**
  - Starting energy reduced from 100 to 10
  - Starting income changed from 1/sec to 0/sec
  - Default tile defense increased from 10 to 100 (configurable)

- 🎨 **Visual Improvements**
  - Shop icons increased from 28px to 44px
  - Shop text sizes increased
  - Selected tiles show prominent borders
  - Icons remain visible when tile selected

- 🔊 **Audio**
  - Music changed from simple hum to melodic ambient composition
  - Reduced default volume for better balance
  - Added natural variations with detuning

### Fixed
- 🐛 **Bug Fixes**
  - Fixed mouse coordinate conversion for accurate clicking
  - Fixed inverted click-drag panning
  - Fixed WASD camera direction
  - Fixed recharge bar timing
  - Fixed audio toggle visual states

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
