// AI Engine - Bot Decision Making Logic
const geometry = require('../utils/geometry');
const config = require('../config/environment');

class AIEngine {
    constructor(gameEngine, io, shop) {
        this.gameEngine = gameEngine;
        this.io = io;
        this.shop = shop;
    }

    /**
     * Make AI decisions for all bot players
     * Call this from the game loop
     */
    makeDecisions(botSocketIds) {
        botSocketIds.forEach(botId => {
            if (!this.gameEngine.players[botId]) {
                console.warn(`[AI] Bot ${botId} not found in players`);
                return;
            }

            // Check if bot can act (respects AI_COOLDOWN_MS via GameEngine)
            if (!this.gameEngine.canPlayerAct(botId)) {
                return; // Still on cooldown
            }

            const decision = this.calculateBotDecision(botId);
            if (decision) {
                console.log(`[AI] ${this.gameEngine.players[botId].username} decision:`, decision.type);
                this.executeBotDecision(botId, decision);
            }
        });
    }

    /**
     * Calculate the best action for a bot to take
     */
    calculateBotDecision(botId) {
        const bot = this.gameEngine.players[botId];
        if (!bot) return null;

        if (!this.gameEngine.canPlayerAct(botId)) {
            return null; // Still on cooldown
        }

        // Strategy priority:
        // 1. Attack enemy capital if adjacent and affordable
        // 2. Capture adjacent enemy/neutral tiles to expand toward enemy
        // 3. Build defense on home or front-line tiles
        // 4. Build production to generate more income
        // 5. Generate energy manually if low

        // Find enemy players
        const enemies = Object.values(this.gameEngine.players).filter(p => p.id !== botId);
        if (enemies.length === 0) {
            console.log(`[AI] ${bot.username} - No enemies found`);
            return null; // No enemies, no action needed
        }

        // Find nearest enemy
        const nearestEnemy = this.findNearestEnemy(bot, enemies);
        if (!nearestEnemy) return null;

        // Check if we can capture the enemy's capital
        const capitalTile = this.gameEngine.getTile(nearestEnemy.homeIndex);
        if (this.isAdjacent(nearestEnemy.homeIndex, botId)) {
            if (bot.mp >= capitalTile.defense) {
                return {
                    type: 'capture',
                    tileIndex: nearestEnemy.homeIndex,
                    priority: 100, // Highest priority - end the game
                };
            }
        }

        // Find all tiles we can capture (enemy and neutral) to expand toward enemy
        const expansionOptions = this.findExpansionTargets(botId, nearestEnemy);
        if (expansionOptions.length > 0) {
            // Sort by priority: closer to enemy = better, and lower defense cost = better
            expansionOptions.sort((a, b) => {
                // Weight distance heavily (closer is much better)
                const distanceScore = (a.distanceToEnemy - b.distanceToEnemy) * 3;
                const costScore = (a.cost - b.cost) * 0.5;
                const randomness = (Math.random() - 0.5) * 5;
                return distanceScore + costScore + randomness;
            });

            const target = expansionOptions[0];
            if (bot.mp >= target.cost * 1.05) { // Aggressive: only 5% safety margin
                return {
                    type: 'capture',
                    tileIndex: target.index,
                    priority: 80,
                };
            }
        }

        // Build strategy based on energy level
        const botOwnedTiles = this.gameEngine.gameMap.filter(t => t.owner === botId);
        const hasProduction = botOwnedTiles.some(t => {
            const unit = t.unit ? this.shop[t.unit] : null;
            return unit && unit.type === 'prod';
        });

        // If we have enough energy, build something (aggressive: start at 25 energy)
        if (bot.mp >= 25) {
            // Prefer production if we don't have much
            if (!hasProduction || bot.mp >= 150) {
                // Try to build production on random owned tile
                const prodTarget = this.findBuildTarget(botId, 'prod');
                if (prodTarget) {
                    return {
                        type: 'build',
                        tileIndex: prodTarget.index,
                        unitType: prodTarget.unit,
                        priority: hasProduction ? 50 : 60,
                    };
                }
            }

            // Build defense on front-line tiles or home (lower priority for more aggression)
            const defTarget = this.findBuildTarget(botId, 'mil');
            if (defTarget) {
                return {
                    type: 'build',
                    tileIndex: defTarget.index,
                    unitType: defTarget.unit,
                    priority: 65, // Lower than capture (80) to prioritize offense
                };
            }
        }

        // Generate energy if we're low and no good build target
        // But first, try to attack cheap/undefended tiles if desperate
        if (bot.mp < 30) {
            const cheapCaptures = this.findExpansionTargets(botId, nearestEnemy)
                .filter(t => t.cost <= bot.mp + 5); // Can afford with current energy

            if (cheapCaptures.length > 0) {
                // Attack instead of generating if we can grab a cheap tile
                return {
                    type: 'capture',
                    tileIndex: cheapCaptures[0].index,
                    priority: 85, // Higher priority than generating
                };
            }

            return {
                type: 'generate',
                priority: 10,
            };
        }

        return null;
    }

    /**
     * Find the nearest enemy player
     */
    findNearestEnemy(bot, enemies) {
        let nearest = null;
        let minDistance = Infinity;

        enemies.forEach(enemy => {
            const distance = geometry.getDistance(bot.homeIndex, enemy.homeIndex);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    /**
     * Find tiles we can capture to expand toward the enemy
     * Includes both neutral and enemy tiles, prioritizing movement toward enemy capital
     */
    findExpansionTargets(botId, enemy) {
        const targets = [];
        const MAP_WIDTH = config.MAP_WIDTH;

        // Get all tiles adjacent to our territory
        const ourTiles = this.gameEngine.gameMap
            .map((tile, idx) => (tile.owner === botId ? idx : -1))
            .filter(idx => idx !== -1);

        // Find all tiles adjacent to our territory that we can capture
        const seenIndices = new Set();
        ourTiles.forEach(ourTile => {
            const { x, y } = geometry.getCoords(ourTile);
            const neighbors = [
                { x: x - 1, y: y },
                { x: x + 1, y: y },
                { x: x, y: y - 1 },
                { x: x, y: y + 1 },
            ];

            neighbors.forEach(n => {
                if (n.x >= 0 && n.x < MAP_WIDTH && n.y >= 0 && n.y < MAP_WIDTH) {
                    const idx = n.y * MAP_WIDTH + n.x;

                    // Skip if already seen or if it's ours
                    if (seenIndices.has(idx)) return;
                    seenIndices.add(idx);

                    const tile = this.gameEngine.getTile(idx);

                    // Can capture if: not ours, not a capital, adjacent to our territory
                    if (tile && tile.owner !== botId && !tile.isHome) {
                        // Calculate distance to enemy capital
                        const distanceToEnemy = geometry.getDistance(idx, enemy.homeIndex);

                        targets.push({
                            index: idx,
                            cost: tile.defense,
                            owner: tile.owner,
                            distanceToEnemy: distanceToEnemy,
                        });
                    }
                }
            });
        });

        return targets;
    }

    /**
     * Find tiles to build on (prioritize front-line or home)
     */
    findBuildTarget(botId, buildType) {
        const bot = this.gameEngine.players[botId];

        // Get all owned tiles
        const ownedTiles = this.gameEngine.gameMap
            .map((tile, idx) => (tile.owner === botId ? idx : -1))
            .filter(idx => idx !== -1);

        if (ownedTiles.length === 0) return null;

        // Find best unit to build based on type
        let bestUnit = null;
        if (buildType === 'prod') {
            // Prefer void_harvester > flux_reactor > solar_siphon
            if (bot.mp >= this.shop.void_harvester.cost) {
                bestUnit = 'void_harvester';
            } else if (bot.mp >= this.shop.flux_reactor.cost) {
                bestUnit = 'flux_reactor';
            } else if (bot.mp >= this.shop.solar_siphon.cost) {
                bestUnit = 'solar_siphon';
            }
        } else if (buildType === 'mil') {
            // Prefer laser_battery > orbital_wall
            if (bot.mp >= this.shop.laser_battery.cost) {
                bestUnit = 'laser_battery';
            } else if (bot.mp >= this.shop.orbital_wall.cost) {
                bestUnit = 'orbital_wall';
            }
        }

        if (!bestUnit) return null;

        // Find a good tile to build on
        // Prioritize: empty owned tiles, then front-line tiles
        let target = null;

        // First pass: empty tiles without units (excluding capital)
        for (let idx of ownedTiles) {
            const tile = this.gameEngine.getTile(idx);
            if (!tile.unit && !tile.isHome) {
                target = idx;
                // If front-line (adjacent to enemy), use this immediately
                if (this.hasEnemyNeighbor(idx, botId)) break;
            }
        }

        // If no empty tile found, return null (don't build on capital)
        // Bot will need to capture more territory first

        return target
            ? {
                index: target,
                unit: bestUnit,
            }
            : null;
    }

    /**
     * Check if a tile is adjacent to owned territory
     */
    isAdjacent(tileIndex, botId) {
        return geometry.isAdjacent(tileIndex, this.gameEngine.gameMap, botId, config.MAP_WIDTH);
    }

    /**
     * Check if a tile has an enemy neighbor
     */
    hasEnemyNeighbor(tileIndex, botId) {
        const { x, y } = geometry.getCoords(tileIndex);
        const neighbors = [
            { x: x - 1, y: y },
            { x: x + 1, y: y },
            { x: x, y: y - 1 },
            { x: x, y: y + 1 },
        ];

        for (let n of neighbors) {
            if (n.x >= 0 && n.x < config.MAP_WIDTH && n.y >= 0 && n.y < config.MAP_WIDTH) {
                const idx = n.y * config.MAP_WIDTH + n.x;
                const tile = this.gameEngine.getTile(idx);
                if (tile && tile.owner && tile.owner !== botId) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Execute a bot decision (emit socket event from server)
     */
    executeBotDecision(botId, decision) {
        const bot = this.gameEngine.players[botId];
        if (!bot) return;

        switch (decision.type) {
        case 'generate':
            bot.mp += 1;
            // Silent energy generation - no chat message
            break;

        case 'build': {
            const tile = this.gameEngine.getTile(decision.tileIndex);
            const unitInfo = this.shop[decision.unitType];

            // Cannot build on capital tiles
            if (
                tile &&
                    unitInfo &&
                    tile.owner === botId &&
                    !tile.isHome &&
                    bot.mp >= unitInfo.cost &&
                    this.gameEngine.canPlayerAct(botId)
            ) {
                bot.mp -= unitInfo.cost;
                this.gameEngine.setPlayerCooldown(botId);

                tile.unit = decision.unitType;
                if (unitInfo.type === 'mil') {
                    tile.maxDefense += unitInfo.val;
                    tile.defense += unitInfo.val;
                }

                console.log(`[AI] ${bot.username} built ${decision.unitType} on tile ${decision.tileIndex}`);
                this.io.emit('map_update_single', tile);
                this.io.emit('chat_receive', {
                    user: 'SYSTEM',
                    msg: `${bot.username} constructed ${unitInfo.name}.`,
                    color: '#888',
                });
            }
            break;
        }

        case 'capture': {
            const tile = this.gameEngine.getTile(decision.tileIndex);

            if (
                tile &&
                    bot.mp >= tile.defense &&
                    tile.owner !== botId &&
                    this.gameEngine.canPlayerAct(botId) &&
                    this.isAdjacent(decision.tileIndex, botId)
            ) {
                bot.mp -= tile.defense;
                this.gameEngine.setPlayerCooldown(botId);

                const previousOwner = tile.owner;
                const wasHome = tile.isHome;

                this.gameEngine.updateTilePlayer(decision.tileIndex, botId, bot.color);

                console.log(`[AI] ${bot.username} captured tile ${decision.tileIndex}`);
                this.io.emit('map_update_single', tile);
                this.io.emit('chat_receive', {
                    user: 'SYSTEM',
                    msg: `${bot.username} captured enemy territory!`,
                    color: '#ff9900',
                });

                // Check win condition
                if (wasHome && previousOwner && this.gameEngine.players[previousOwner]) {
                    this.io.emit('chat_receive', {
                        user: 'SYSTEM',
                        msg: `CAPITAL FALLEN! ${this.gameEngine.players[previousOwner].username} has been eliminated!`,
                        color: '#ff0000',
                    });
                }
            }
            break;
        }
        }
    }
}

module.exports = AIEngine;
