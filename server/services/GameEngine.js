// Game Engine - Core Game Logic
const geometry = require('../utils/geometry');
const config = require('../config/environment');

class GameEngine {
    constructor() {
        this.gameMap = this.initializeMap();
        this.players = {};
    }

    initializeMap() {
        const map = [];
        for (let i = 0; i < config.MAP_SIZE; i++) {
            map.push({
                id: i,
                owner: null,
                defense: config.BASE_TILE_DEFENSE,
                maxDefense: config.BASE_TILE_MAX_DEFENSE,
                unit: null,
                isHome: false,
                color: '#2b1d3d',
            });
        }
        return map;
    }

    findSpawnPoint() {
        let bestIndex = -1;
        let maxMinDistance = -1;
        for (let i = 0; i < 50; i++) {
            let candidate = Math.floor(Math.random() * config.MAP_SIZE);
            if (this.gameMap[candidate].owner !== null) continue;

            let minDistance = 999;
            const activePlayers = Object.values(this.players);
            if (activePlayers.length === 0) return candidate;

            activePlayers.forEach(p => {
                if (p.homeIndex !== -1) {
                    let dist = geometry.getDistance(candidate, p.homeIndex);
                    if (dist < minDistance) minDistance = dist;
                }
            });

            if (minDistance > maxMinDistance) {
                maxMinDistance = minDistance;
                bestIndex = candidate;
            }
        }
        return bestIndex !== -1 ? bestIndex : Math.floor(Math.random() * config.MAP_SIZE);
    }

    addPlayer(socketId, username) {
        const spawnPoint = this.findSpawnPoint();
        const colors = ['#ff00ff', '#00ffff', '#ff1493', '#00ff00', '#ff6400', '#87ceeb'];
        const color = colors[Object.keys(this.players).length % colors.length];

        const player = {
            id: socketId,
            username,
            mp: config.STARTING_ENERGY,
            mps: config.STARTING_ENERGY_PER_SEC,
            lastMoveTime: Date.now(),
            homeIndex: spawnPoint,
            color: color,
        };

        this.players[socketId] = player;
        this.gameMap[spawnPoint].owner = socketId;
        this.gameMap[spawnPoint].isHome = true;
        this.gameMap[spawnPoint].color = color;

        return player;
    }

    removePlayer(socketId) {
        delete this.players[socketId];
        this.gameMap.forEach(tile => {
            if (tile.owner === socketId) {
                tile.owner = null;
                tile.unit = null;
                tile.isHome = false;
                tile.color = '#2b1d3d';
            }
        });
    }

    canPlayerAct(socketId) {
        const player = this.players[socketId];
        if (!player) return false;
        return Date.now() - player.lastMoveTime >= config.COOLDOWN_MS;
    }

    setPlayerCooldown(socketId) {
        if (this.players[socketId]) {
            this.players[socketId].lastMoveTime = Date.now();
        }
    }

    addTileDefense(tileIndex, defense) {
        const tile = this.gameMap[tileIndex];
        tile.defense = Math.min(tile.defense + defense, tile.maxDefense);
    }

    reduceTileDefense(tileIndex, amount) {
        const tile = this.gameMap[tileIndex];
        tile.defense = Math.max(0, tile.defense - amount);
    }

    getTile(index) {
        return this.gameMap[index];
    }

    updateTilePlayer(index, playerId, color) {
        const tile = this.gameMap[index];
        tile.owner = playerId;
        tile.color = color;
        tile.defense = config.BASE_TILE_DEFENSE;
        tile.unit = null;
    }
}

module.exports = GameEngine;
