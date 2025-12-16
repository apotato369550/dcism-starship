require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const SHOP = require('../config/tiles');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// --- CONFIGURATION FROM .env ---
const MAP_WIDTH = parseInt(process.env.MAP_WIDTH) || 20;
const MAP_HEIGHT = parseInt(process.env.MAP_HEIGHT) || 20;
const MAP_SIZE = MAP_WIDTH * MAP_HEIGHT;
const COOLDOWN_MS = parseInt(process.env.COOLDOWN_MS) || 3000;
const STARTING_ENERGY = parseInt(process.env.STARTING_ENERGY) || 10;
const STARTING_ENERGY_PER_SEC = parseInt(process.env.STARTING_ENERGY_PER_SEC) || 0;
const BASE_TILE_DEFENSE = parseInt(process.env.BASE_TILE_DEFENSE) || 10;
const BASE_TILE_MAX_DEFENSE = parseInt(process.env.BASE_TILE_MAX_DEFENSE) || 10;
const ECONOMY_TICK_MS = parseInt(process.env.ECONOMY_TICK_MS) || 1000;
const PORT = parseInt(process.env.PORT) || 3000;

// --- GAME STATE ---
let gameMap = [];
for(let i=0; i<MAP_SIZE; i++) {
    gameMap.push({
        id: i,
        owner: null,
        defense: BASE_TILE_DEFENSE,
        maxDefense: BASE_TILE_MAX_DEFENSE,
        unit: null,
        isHome: false, // Is this a capital city?
        color: '#2b1d3d'
    });
}

let players = {};

// --- HELPER FUNCTIONS ---
function getCoords(index) {
    return { x: index % MAP_WIDTH, y: Math.floor(index / MAP_WIDTH) };
}

function getDistance(idx1, idx2) {
    const p1 = getCoords(idx1);
    const p2 = getCoords(idx2);
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function findSpawnPoint() {
    let bestIndex = -1;
    let maxMinDistance = -1;
    // Look for a spot far from others
    for(let i=0; i<50; i++) {
        let candidate = Math.floor(Math.random() * MAP_SIZE);
        if (gameMap[candidate].owner !== null) continue;

        let minDistance = 999;
        const activePlayers = Object.values(players);
        if (activePlayers.length === 0) return candidate; 

        activePlayers.forEach(p => {
            if(p.homeIndex !== -1) {
                let dist = getDistance(candidate, p.homeIndex);
                if(dist < minDistance) minDistance = dist;
            }
        });

        if (minDistance > maxMinDistance) {
            maxMinDistance = minDistance;
            bestIndex = candidate;
        }
    }
    return bestIndex !== -1 ? bestIndex : Math.floor(Math.random() * MAP_SIZE);
}

function isAdjacent(tileIndex, playerId) {
    const { x, y } = getCoords(tileIndex);
    const neighbors = [{ x: x - 1, y: y }, { x: x + 1, y: y }, { x: x, y: y - 1 }, { x: x, y: y + 1 }];
    for (let n of neighbors) {
        if (n.x >= 0 && n.x < MAP_WIDTH && n.y >= 0 && n.y < MAP_HEIGHT) {
            const idx = n.y * MAP_WIDTH + n.x;
            if (gameMap[idx].owner === playerId) return true;
        }
    }
    return false;
}

function killPlayer(socketId) {
    // 1. Notify Player
    io.to(socketId).emit('game_over');
    
    // 2. Clear map tiles
    gameMap.forEach(tile => {
        if (tile.owner === socketId) {
            tile.owner = null;
            tile.color = '#2b1d3d';
            tile.defense = 10;
            tile.maxDefense = 10;
            tile.unit = null;
            tile.isHome = false;
            io.emit('map_update_single', tile);
        }
    });

    // 3. Remove from memory
    delete players[socketId];
}

io.on('connection', (socket) => {
    // --- JOIN GAME ---
    socket.on('join_game', (username) => {
        const neonColors = ['#FF0099', '#00FFFF', '#9D00FF', '#CCFF00', '#FF6600', '#00FFAA'];
        
        const spawnIndex = findSpawnPoint();
        
        players[socket.id] = { 
            id: socket.id,
            username: username.substring(0, 15) || "Drifter",
            mp: STARTING_ENERGY,
            mps: STARTING_ENERGY_PER_SEC,
            lastMoveTime: 0,
            homeIndex: spawnIndex,
            color: neonColors[Math.floor(Math.random() * neonColors.length)] 
        };

        // Setup Home Base
        const tile = gameMap[spawnIndex];
        tile.owner = socket.id;
        tile.color = players[socket.id].color;
        tile.defense = 100; // Strong starter defense
        tile.maxDefense = 100;
        tile.isHome = true;

        socket.emit('init', { map: gameMap, you: players[socket.id], shop: SHOP });
        io.emit('map_update_single', tile);
        io.emit('chat_receive', { user: 'SYSTEM', msg: `${players[socket.id].username} has established a colony.`, color: '#fff' });
    });

    // --- CHAT ---
    socket.on('send_chat', (msg) => {
        if(players[socket.id] && msg.trim().length > 0) {
            io.emit('chat_receive', {
                user: players[socket.id].username,
                msg: msg.substring(0, 60),
                color: players[socket.id].color
            });
        }
    });

    // --- MANUAL CHARGE ---
    socket.on('click_generate', () => {
        if(!players[socket.id]) return;
        players[socket.id].mp += 1;
        socket.emit('update_self', players[socket.id]);
    });

    // --- BUILD UNIT ---
    socket.on('place_unit', (data) => {
        const player = players[socket.id];
        if (!player) return;

        // Cooldown
        if (Date.now() - player.lastMoveTime < COOLDOWN_MS) return;

        const { tileIndex, unitType } = data;
        const tile = gameMap[tileIndex];
        const unitInfo = SHOP[unitType];

        if (tile && unitInfo && tile.owner === socket.id && player.mp >= unitInfo.cost) {
            // If replacing, only allow if same type or empty (simplified: just overwrite for now)
            player.mp -= unitInfo.cost;
            player.lastMoveTime = Date.now();
            
            tile.unit = unitType;
            
            // If military, boost defense
            if(unitInfo.type === 'mil') {
                tile.maxDefense += unitInfo.val;
                tile.defense += unitInfo.val;
            }

            io.emit('map_update_single', tile);
            socket.emit('update_self', player);
            socket.emit('action_success'); 
        }
    });

    // --- DEMOLISH UNIT ---
    socket.on('demolish_unit', (tileIndex) => {
        const tile = gameMap[tileIndex];
        if(tile && tile.owner === socket.id && tile.unit) {
            const unitInfo = SHOP[tile.unit];
            
            // Remove Stats
            if(unitInfo.type === 'mil') {
                tile.maxDefense -= unitInfo.val;
                tile.defense = Math.min(tile.defense, tile.maxDefense);
            }
            
            tile.unit = null;
            io.emit('map_update_single', tile);
        }
    });

    // --- CAPTURE ---
    socket.on('capture_attempt', (tileIndex) => {
        const player = players[socket.id];
        if (!player) return;

        if (Date.now() - player.lastMoveTime < COOLDOWN_MS) return;
        if (!isAdjacent(tileIndex, socket.id)) return;

        const tile = gameMap[tileIndex];

        // LOGIC: Capture
        if (tile && player.mp >= tile.defense && tile.owner !== socket.id) {
            player.mp -= tile.defense;
            player.lastMoveTime = Date.now();

            const previousOwner = tile.owner;
            const wasHome = tile.isHome;

            // Take Ownership
            tile.owner = socket.id;
            tile.color = player.color;
            tile.unit = null; // Destroy buildings
            tile.isHome = false; // Capture removes capital status (unless we want to transfer it? For now, destroy it)
            
            // Reset Defense logic
            tile.maxDefense = 20; 
            tile.defense = 20;

            io.emit('map_update_single', tile);
            socket.emit('update_self', player);
            socket.emit('action_success');

            // WIN CONDITION CHECK
            if (wasHome && previousOwner) {
                io.emit('chat_receive', { user: 'SYSTEM', msg: `CAPITAL FALLEN! ${players[previousOwner].username} has been eliminated!`, color: '#ff0000' });
                killPlayer(previousOwner);
            }
        }
    });

    socket.on('disconnect', () => {
        if(players[socket.id]) delete players[socket.id];
        // We don't wipe tiles on disconnect anymore, only on 'Game Over'.
        // This allows re-connecting if you had a session system (not implemented here, but good practice).
        // For this demo, we will wipe them to keep the map clean.
        gameMap.forEach(tile => {
            if (tile.owner === socket.id) {
                tile.owner = null;
                tile.color = '#2b1d3d';
                tile.defense = 10;
                tile.unit = null;
                tile.isHome = false;
                io.emit('map_update_single', tile);
            }
        });
    });
});

// --- ECONOMY LOOP ---
setInterval(() => {
    // Reset MPS
    for (let pid in players) players[pid].mps = 1; // Base 1 passive

    // Calculate
    gameMap.forEach(tile => {
        if (tile.owner && tile.unit && players[tile.owner]) {
            const u = SHOP[tile.unit];
            if(u.type === 'prod') players[tile.owner].mps += u.val;
        }
    });

    // Distribute
    for (let id in players) {
        let p = players[id];
        p.mp += p.mps;
        io.to(id).emit('update_self', p);
    }
}, 1000);

server.listen(PORT, () => {
    console.log('🚀 DCISM Starship 2.0 Launching on *:3000');
});