// Geometry Utilities
const config = require('../config/environment');

function getCoords(index) {
    return { x: index % config.MAP_WIDTH, y: Math.floor(index / config.MAP_WIDTH) };
}

function getDistance(idx1, idx2) {
    const p1 = getCoords(idx1);
    const p2 = getCoords(idx2);
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function isAdjacent(tileIndex, gameMap, playerId, MAP_WIDTH) {
    const { x, y } = getCoords(tileIndex);
    const neighbors = [
        { x: x - 1, y: y },
        { x: x + 1, y: y },
        { x: x, y: y - 1 },
        { x: x, y: y + 1 },
    ];
    for (let n of neighbors) {
        if (
            n.x >= 0 &&
            n.x < MAP_WIDTH &&
            n.y >= 0 &&
            n.y < Math.ceil(gameMap.length / MAP_WIDTH)
        ) {
            const idx = n.y * MAP_WIDTH + n.x;
            if (gameMap[idx].owner === playerId) return true;
        }
    }
    return false;
}

module.exports = {
    getCoords,
    getDistance,
    isAdjacent,
};
