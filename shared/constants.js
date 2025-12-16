// Shared Constants
module.exports = {
    // Map Configuration
    MAP_WIDTH: 20,
    MAP_HEIGHT: 20,
    MAP_SIZE: 400,
    TILE_SIZE: 40,

    // Tile Defaults
    BASE_TILE_DEFENSE: 100,
    BASE_TILE_MAX_DEFENSE: 100,

    // Game Mechanics
    SPAWN_ATTEMPTS: 50,
    DEFAULT_SPAWN_DEFENSE: 20,
    CAPITAL_DEFENSE_MODIFIER: 1, // Capital tiles have same defense

    // Colors (Vaporwave palette)
    NEON_COLORS: {
        pink: '#ff10fe',
        magenta: '#ff00ff',
        blue: '#00ffff',
        cyan: '#00f0ff',
        purple: '#b300ff',
        green: '#00ff66',
        dark: '#2b1d3d',
    },

    // Player Starting Values
    STARTING_ENERGY: 10,
    STARTING_ENERGY_PER_SEC: 0,

    // Timing (milliseconds)
    COOLDOWN_MS: 3000,
    ECONOMY_TICK_MS: 1000,

    // Server Configuration
    PORT: 3000,
    CORS_ORIGIN: '*',
};
