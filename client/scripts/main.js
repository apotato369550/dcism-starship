// Main Application Entry Point
import { GameState } from './game/GameState.js';
import { Camera } from './game/Camera.js';
import { Renderer } from './game/Renderer.js';
import { AudioManager } from './audio/AudioManager.js';
import { StatsUI } from './ui/StatsUI.js';
import { ShopUI } from './ui/ShopUI.js';
import { InspectorUI } from './ui/InspectorUI.js';
import { ChatUI } from './ui/ChatUI.js';
import { UIManager } from './ui/UIManager.js';
import { MouseHandler } from './input/MouseHandler.js';
import { KeyboardHandler } from './input/KeyboardHandler.js';
import { SocketClient } from './socket/socketClient.js';

// Initialize core systems
const gameState = new GameState();
const canvas = document.getElementById('gameCanvas');
const camera = new Camera(canvas.width, canvas.height);
const renderer = new Renderer(canvas, gameState, camera);
const audioManager = new AudioManager();

// Initialize UI systems
const statsUI = new StatsUI();
const shopUI = new ShopUI(gameState);
const inspectorUI = new InspectorUI(gameState);
const chatUI = new ChatUI();
const uiManager = new UIManager(gameState, statsUI, shopUI, inspectorUI, chatUI);

// Initialize input systems
const mouseHandler = new MouseHandler(canvas, gameState, renderer, audioManager);
const keyboardHandler = new KeyboardHandler(gameState);

// Initialize network
const socketClient = new SocketClient();

// Game flow state
gameState.camera = camera;

// Setup Socket.IO handlers
socketClient.onConnect(myId => {
    gameState.myId = myId;
});

socketClient.onInit(data => {
    gameState.init(data);
    uiManager.renderShop(buildModeActive => {
        // Build mode changed callback
        if (buildModeActive) {
            // Visual feedback for build mode
            document.body.style.cursor = 'crosshair';
        } else {
            document.body.style.cursor = 'default';
        }
    });
    uiManager.updateStats(data.you);
    uiManager.updateInspector(gameState.selectedTileIndex, tileIndex => {
        socketClient.demolishUnit(tileIndex);
    });
    renderer.render();
    audioManager.init();
    if (audioManager.musicEnabled) audioManager.startAmbientMusic();
});

socketClient.onMapUpdate(tile => {
    gameState.updateTile(tile);
    if (gameState.selectedTileIndex === tile.id) {
        uiManager.updateInspector(tile.id, tileIndex => {
            socketClient.demolishUnit(tileIndex);
        });
    }
    renderer.render();
});

socketClient.onPlayerUpdate(player => {
    uiManager.updateStats(player);
});

socketClient.onGameOver(() => {
    document.getElementById('gameOverOverlay').classList.remove('hidden');
});

socketClient.onGameWon(() => {
    document.getElementById('victoryOverlay').classList.remove('hidden');
});

socketClient.onActionSuccess(() => {
    audioManager.playSFX('action');
    uiManager.triggerCooldown(() => {
        renderer.render();
    });
});

socketClient.onChatReceive(data => {
    uiManager.addChatMessage(data.user, data.msg, data.color);
});

// Game mode and settings tracking
let gameMode = null;
let botCount = 0;

// Setup mode selection
document.getElementById('modeBtn-single').addEventListener('click', () => {
    gameMode = 'single';
    document.getElementById('modeOverlay').classList.add('hidden');
    document.getElementById('botsOverlay').classList.remove('hidden');
});

// Setup bot count selection
for (let i = 0; i <= 3; i++) {
    document.getElementById(`botsBtn-${i}`).addEventListener('click', () => {
        botCount = i;
        document.getElementById('botsOverlay').classList.add('hidden');
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('usernameInput').focus();
    });
}

document.getElementById('botsBtn-back').addEventListener('click', () => {
    document.getElementById('botsOverlay').classList.add('hidden');
    document.getElementById('modeOverlay').classList.remove('hidden');
});

// Setup login
document.getElementById('joinBtn').addEventListener('click', () => {
    const name = document.getElementById('usernameInput').value;
    if (name) {
        socketClient.joinGame(name, { mode: gameMode, botCount });
        document.getElementById('loginOverlay').classList.add('hidden');
    }
});

// Setup Audio Toggles
document.getElementById('sfx-toggle').addEventListener('click', e => {
    const enabled = audioManager.toggleSFX();
    e.target.classList.toggle('active', enabled);
});

document.getElementById('music-toggle').addEventListener('click', e => {
    const enabled = audioManager.toggleMusic();
    e.target.classList.toggle('active', enabled);
});

// Initialize audio toggles to active
document.getElementById('sfx-toggle').classList.add('active');
document.getElementById('music-toggle').classList.add('active');

// Setup Manual Charge Button
document.getElementById('manual-charge-btn').addEventListener('click', () => {
    audioManager.playSFX('action');
    socketClient.sendManualCharge();
});

// Setup Mouse Input
mouseHandler.init(
    (tileIndex, tile) => {
        // Tile click handler
        uiManager.selectTile(tileIndex);

        // Handle build mode
        if (uiManager.shopUI.buildMode) {
            if (tile.owner === gameState.myId && gameState.selectedUnitKey) {
                audioManager.playSFX('build');
                socketClient.placeUnit(tileIndex, gameState.selectedUnitKey);
                uiManager.shopUI.exitBuildMode();
            }
        } else {
            // Normal mode
            if (tile.owner === gameState.myId && gameState.selectedUnitKey) {
                audioManager.playSFX('build');
                socketClient.placeUnit(tileIndex, gameState.selectedUnitKey);
            } else if (tile.owner !== gameState.myId) {
                audioManager.playSFX('capture');
                socketClient.captureAttempt(tileIndex);
            }
        }

        renderer.render();
    },
    (deltaY, screenX, screenY) => {
        // Wheel handler
        if (camera.zoomTowardsMouse(deltaY, screenX, screenY, canvas.width, canvas.height)) {
            renderer.render();
        }
    },
    {
        onPanStart: () => {
            camera.capturePanStart();
        },
        onPan: (startMouseX, startMouseY, currentMouseX, currentMouseY) => {
            // Pan handler
            camera.panFrom(startMouseX, startMouseY, currentMouseX, currentMouseY);
            renderer.render();
        },
    },
    () => {
        // Click outside canvas handler - deselect tile
        gameState.selectTile(null);
        uiManager.shopUI.exitBuildMode();
        uiManager.updateInspector(null);
        renderer.render();
    }
);

// Setup Keyboard Input
keyboardHandler.init(
    key => {
        // Arrow key handler
        const col = gameState.selectedTileIndex % 20;
        const row = Math.floor(gameState.selectedTileIndex / 20);
        let newIndex = gameState.selectedTileIndex;

        if (key === 'arrowup' && row > 0) newIndex = gameState.selectedTileIndex - 20;
        if (key === 'arrowdown' && row < 19) newIndex = gameState.selectedTileIndex + 20;
        if (key === 'arrowleft' && col > 0) newIndex = gameState.selectedTileIndex - 1;
        if (key === 'arrowright' && col < 19) newIndex = gameState.selectedTileIndex + 1;

        if (newIndex !== gameState.selectedTileIndex && newIndex >= 0 && newIndex < 400) {
            gameState.selectTile(newIndex);
            uiManager.updateInspector(newIndex, tileIndex => {
                socketClient.demolishUnit(tileIndex);
            });
            renderer.render();
        }
    },
    () => {
        // Enter key handler
        const tile = gameState.getSelectedTile();
        if (!tile) return;

        if (tile.owner === gameState.myId && gameState.selectedUnitKey) {
            audioManager.playSFX('build');
            socketClient.placeUnit(gameState.selectedTileIndex, gameState.selectedUnitKey);
        } else if (tile.owner !== gameState.myId) {
            audioManager.playSFX('capture');
            socketClient.captureAttempt(gameState.selectedTileIndex);
        }
    },
    () => {
        // Camera movement
        const input = keyboardHandler.getMovementInput(camera.panSpeed);
        if (input.dx !== 0 || input.dy !== 0) {
            camera.pan(input.dx, input.dy);
            renderer.render();
        }
    }
);

// Setup Chat
chatUI.onSendMessage(message => {
    socketClient.sendChat(message);
});

// Handle window resize
window.addEventListener('resize', () => {
    renderer.resizeCanvas();
    camera.setCanvasDimensions(canvas.width, canvas.height);
    renderer.render();
});

// Initial render
renderer.render();
