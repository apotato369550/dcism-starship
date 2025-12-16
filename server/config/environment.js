// Environment Configuration Parser
require('dotenv').config();
const SHARED_CONSTANTS = require('../../shared/constants');

module.exports = {
    MAP_WIDTH: parseInt(process.env.MAP_WIDTH) || SHARED_CONSTANTS.MAP_WIDTH,
    MAP_HEIGHT: parseInt(process.env.MAP_HEIGHT) || SHARED_CONSTANTS.MAP_HEIGHT,
    MAP_SIZE:
        parseInt(process.env.MAP_WIDTH) * parseInt(process.env.MAP_HEIGHT) ||
        SHARED_CONSTANTS.MAP_SIZE,
    COOLDOWN_MS: parseInt(process.env.COOLDOWN_MS) || SHARED_CONSTANTS.COOLDOWN_MS,
    STARTING_ENERGY: parseInt(process.env.STARTING_ENERGY) || SHARED_CONSTANTS.STARTING_ENERGY,
    STARTING_ENERGY_PER_SEC:
        parseInt(process.env.STARTING_ENERGY_PER_SEC) || SHARED_CONSTANTS.STARTING_ENERGY_PER_SEC,
    BASE_TILE_DEFENSE:
        parseInt(process.env.BASE_TILE_DEFENSE) || SHARED_CONSTANTS.BASE_TILE_DEFENSE,
    BASE_TILE_MAX_DEFENSE:
        parseInt(process.env.BASE_TILE_MAX_DEFENSE) || SHARED_CONSTANTS.BASE_TILE_MAX_DEFENSE,
    ECONOMY_TICK_MS: parseInt(process.env.ECONOMY_TICK_MS) || SHARED_CONSTANTS.ECONOMY_TICK_MS,
    PORT: parseInt(process.env.PORT) || SHARED_CONSTANTS.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN || SHARED_CONSTANTS.CORS_ORIGIN,
};
