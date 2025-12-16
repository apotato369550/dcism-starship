require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import configurations and services
const config = require('./config/environment');
const GameEngine = require('./services/GameEngine');
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

// --- SOCKET EVENT HANDLERS ---
io.on('connection', socket => {
    // JOIN GAME
    socket.on('join_game', username => {
        const player = gameEngine.addPlayer(socket.id, username);
        const tile = gameEngine.getTile(player.homeIndex);

        // Set strong home base defense
        tile.defense = 100;
        tile.maxDefense = 100;

        socket.emit('init', { map: gameEngine.gameMap, you: player, shop: SHOP });
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
}, config.ECONOMY_TICK_MS);

// START SERVER
server.listen(config.PORT, () => {
    console.log(`🚀 DCISM Starship 2.0 Launching on *:${config.PORT}`);
});
