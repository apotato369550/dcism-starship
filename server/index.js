require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import configurations and services
const config = require('./config/environment');
const GameEngine = require('./services/GameEngine');
const AIEngine = require('./services/AIEngine');
const geometry = require('./utils/geometry');
const SHOP = require('../config/tiles');

// Express and Socket.IO Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.CORS_ORIGIN } });

// Serve static files and main HTML
app.use(express.static(path.join(__dirname, '../client')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Initialize Game Engine
const gameEngine = new GameEngine();
const aiEngine = new AIEngine(gameEngine, io, SHOP);
const botNames = ['REPLICANT-01', 'REPLICANT-02', 'REPLICANT-03', 'REPLICANT-04'];
const activeBots = []; // Track bot IDs for AI decisions

// --- SOCKET EVENT HANDLERS ---
io.on('connection', socket => {
    // JOIN GAME
    socket.on('join_game', data => {
        // Handle both old format (string) and new format (object with username + options)
        const username = typeof data === 'string' ? data : data.username;
        const mode = data.mode || 'multiplayer';
        const botCount = data.botCount || 0;

        const player = gameEngine.addPlayer(socket.id, username);
        const tile = gameEngine.getTile(player.homeIndex);

        // Set strong home base defense
        tile.defense = 100;
        tile.maxDefense = 100;

        // Create bot players for single player mode
        if (mode === 'single') {
            console.log(`[SERVER] Creating ${botCount} bots for single-player game`);
            for (let i = 0; i < botCount; i++) {
                const botId = `bot-${Date.now()}-${i}`;
                const botPlayer = gameEngine.addPlayer(botId, botNames[i]);
                const botTile = gameEngine.getTile(botPlayer.homeIndex);
                botTile.defense = 100;
                botTile.maxDefense = 100;
                activeBots.push(botId); // Track bot for AI decisions
                console.log(`[SERVER] Added bot ${botId} (${botNames[i]}) to activeBots. Total: ${activeBots.length}`);
                io.emit('map_update_single', botTile);
                io.emit('chat_receive', {
                    user: 'SYSTEM',
                    msg: `${botPlayer.username} has established a colony.`,
                    color: '#888',
                });
            }
        }

        socket.emit('init', { map: gameEngine.gameMap, you: player, shop: SHOP, players: gameEngine.players });
        io.emit('map_update_single', tile);
        io.emit('chat_receive', {
            user: 'SYSTEM',
            msg: `${player.username} has established a colony.`,
            color: '#fff',
        });
    });

    // CHAT
    socket.on('send_chat', msg => {
        const player = gameEngine.players[socket.id];
        if (player && msg.trim().length > 0) {
            io.emit('chat_receive', {
                user: player.username,
                msg: msg.substring(0, 60),
                color: player.color,
            });
        }
    });

    // MANUAL CHARGE (Click Generate)
    socket.on('click_generate', () => {
        const player = gameEngine.players[socket.id];
        if (player) {
            player.mp += 1;
            socket.emit('update_self', player);
        }
    });

    // BUILD UNIT
    socket.on('place_unit', data => {
        const player = gameEngine.players[socket.id];
        if (!player || !gameEngine.canPlayerAct(socket.id)) return;

        const { tileIndex, unitType } = data;
        const tile = gameEngine.getTile(tileIndex);
        const unitInfo = SHOP[unitType];

        if (tile && unitInfo && tile.owner === socket.id && player.mp >= unitInfo.cost) {
            player.mp -= unitInfo.cost;
            gameEngine.setPlayerCooldown(socket.id);

            tile.unit = unitType;
            if (unitInfo.type === 'mil') {
                tile.maxDefense += unitInfo.val;
                tile.defense += unitInfo.val;
            }

            io.emit('map_update_single', tile);
            socket.emit('update_self', player);
            socket.emit('action_success');
        }
    });

    // DEMOLISH UNIT
    socket.on('demolish_unit', tileIndex => {
        const tile = gameEngine.getTile(tileIndex);
        if (tile && tile.owner === socket.id && tile.unit) {
            const unitInfo = SHOP[tile.unit];
            if (unitInfo.type === 'mil') {
                tile.maxDefense -= unitInfo.val;
                tile.defense = Math.min(tile.defense, tile.maxDefense);
            }
            tile.unit = null;
            io.emit('map_update_single', tile);
        }
    });

    // CAPTURE ATTEMPT
    socket.on('capture_attempt', tileIndex => {
        const player = gameEngine.players[socket.id];
        if (!player || !gameEngine.canPlayerAct(socket.id)) return;
        if (!geometry.isAdjacent(tileIndex, gameEngine.gameMap, socket.id, config.MAP_WIDTH))
            return;

        const tile = gameEngine.getTile(tileIndex);
        if (tile && player.mp >= tile.defense && tile.owner !== socket.id) {
            player.mp -= tile.defense;
            gameEngine.setPlayerCooldown(socket.id);

            const previousOwner = tile.owner;
            const wasHome = tile.isHome;

            gameEngine.updateTilePlayer(tileIndex, socket.id, player.color);

            io.emit('map_update_single', tile);
            socket.emit('update_self', player);
            socket.emit('action_success');

            // Win condition check
            if (wasHome && previousOwner && gameEngine.players[previousOwner]) {
                io.emit('chat_receive', {
                    user: 'SYSTEM',
                    msg: `CAPITAL FALLEN! ${gameEngine.players[previousOwner].username} has been eliminated!`,
                    color: '#ff0000',
                });
                killPlayer(previousOwner);
            }
        }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
        if (gameEngine.players[socket.id]) {
            gameEngine.removePlayer(socket.id);
            // Remove from activeBots if it's a bot
            const botIndex = activeBots.indexOf(socket.id);
            if (botIndex > -1) {
                activeBots.splice(botIndex, 1);
            }
            gameEngine.gameMap.forEach(tile => {
                if (tile.owner === socket.id) {
                    io.emit('map_update_single', tile);
                }
            });
        }
    });
});

// --- PLAYER ELIMINATION ---
function killPlayer(socketId) {
    io.to(socketId).emit('game_over');
    gameEngine.gameMap.forEach(tile => {
        if (tile.owner === socketId) {
            io.emit('map_update_single', tile);
        }
    });
    gameEngine.removePlayer(socketId);

    // Remove from activeBots if it's a bot
    const botIndex = activeBots.indexOf(socketId);
    if (botIndex > -1) {
        activeBots.splice(botIndex, 1);
    }

    // Check if only one player remains (win condition for single player mode)
    const remainingPlayers = Object.keys(gameEngine.players).filter(id => !id.startsWith('bot-'));
    if (remainingPlayers.length === 1) {
        const winner = gameEngine.players[remainingPlayers[0]];
        io.emit('chat_receive', {
            user: 'SYSTEM',
            msg: `🎉 VICTORY! ${winner.username} has conquered all enemies!`,
            color: '#00ff00',
        });
        io.to(remainingPlayers[0]).emit('game_won');
    }
}

// --- ECONOMY LOOP ---
setInterval(() => {
    // Reset MPS
    for (let pid in gameEngine.players) {
        gameEngine.players[pid].mps = 1; // Base 1 passive
    }

    // Calculate production
    gameEngine.gameMap.forEach(tile => {
        if (tile.owner && tile.unit && gameEngine.players[tile.owner]) {
            const u = SHOP[tile.unit];
            if (u.type === 'prod') {
                gameEngine.players[tile.owner].mps += u.val;
            }
        }
    });

    // Distribute income
    for (let id in gameEngine.players) {
        const p = gameEngine.players[id];
        p.mp += p.mps;
        io.to(id).emit('update_self', p);
    }

    // Make AI decisions for active bots
    if (activeBots.length > 0) {
        // Only log occasionally to avoid spam
        if (Math.random() < 0.1) {
            console.log(`[ECONOMY] Ticking with ${activeBots.length} active bots`);
        }
        aiEngine.makeDecisions(activeBots);
    }
}, config.ECONOMY_TICK_MS);

// START SERVER
server.listen(config.PORT, () => {
    console.log(`🚀 DCISM Starship 2.0 Launching on *:${config.PORT}`);
});
