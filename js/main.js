document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button'); 
    const winRestartButton = document.getElementById('win-restart-button'); 
    const resumeButton = document.getElementById('resume-button'); 
    const pauseRestartButton = document.getElementById('pause-restart-button');
    const nextLevelButton = document.getElementById('next-level-button');
    const muteButton = document.getElementById('mute-button');

    // Multiplayer elements
    const multiplayerButton = document.getElementById('multiplayer-button');
    const mpLobbyScreen = document.getElementById('mp-lobby-screen');
    const lobbyMenu = document.getElementById('lobby-menu');
    const createRoomBtn = document.getElementById('create-room-btn');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const lobbyBackBtn = document.getElementById('lobby-back-btn');
    const hostLobby = document.getElementById('host-lobby');
    const joinLobby = document.getElementById('join-lobby');
    const clientWaiting = document.getElementById('client-waiting');
    const roomCodeDisplay = document.getElementById('room-code-display');
    const roomCodeInput = document.getElementById('room-code-input');
    const joinConnectBtn = document.getElementById('join-connect-btn');
    const mpStartBtn = document.getElementById('mp-start-btn');
    const lobbyStatus = document.getElementById('lobby-status');
    const joinStatus = document.getElementById('join-status');
    const clientStatus = document.getElementById('client-status');
    const clientRoomCode = document.getElementById('client-room-code');
    const hostCancelBtn = document.getElementById('host-cancel-btn');
    const joinCancelBtn = document.getElementById('join-cancel-btn');
    const clientCancelBtn = document.getElementById('client-cancel-btn');
    const mpRematchBtn = document.getElementById('mp-rematch-btn');
    const mpExitBtn = document.getElementById('mp-exit-btn');

    let game;
    let mpGame;
    let network;
    
    // ── SOLO GAME ───────────────────────────────
    function startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        if (!game) {
            game = new Game(canvas);
        } else {
            game.restart();
        }
    }
    
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    if (nextLevelButton) {
        nextLevelButton.addEventListener('click', () => {
            if (game) game.startNextLevel();
        });
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (game) game.restart();
            else startGame();
        });
    }

    if (muteButton) {
        muteButton.addEventListener('click', () => {
            const activeGame = mpGame || game;
            if (activeGame) {
                activeGame.sound.toggleMute();
                muteButton.textContent = activeGame.sound.muted ? 'Unmute' : 'Mute';
            }
        });
    }
    
    if (winRestartButton) {
        winRestartButton.addEventListener('click', () => {
            if (game) game.restart();
            else startGame();
        });
    }
    
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            if (game) game.resume();
        });
    }
    
    if (pauseRestartButton) {
        pauseRestartButton.addEventListener('click', () => {
            if (game) game.restart();
            else startGame();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !game && !mpGame) {
            const startScreen = document.getElementById('start-screen');
            if (startScreen && !startScreen.classList.contains('hidden')) {
                startGame();
            }
        }
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (game) game.setupCanvas();
            if (mpGame) mpGame.setupCanvas();
        }, 100);
    });

    // ── MULTIPLAYER ─────────────────────────────

    function hideAllScreens() {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    }

    function showStartScreen() {
        hideAllScreens();
        document.getElementById('start-screen').classList.remove('hidden');
    }

    function showLobbyMenu() {
        lobbyMenu.style.display = '';
        hostLobby.style.display = 'none';
        joinLobby.style.display = 'none';
        clientWaiting.style.display = 'none';
    }

    // ── Draw pixel-art player heads on lobby slot canvases ──
    function drawPlayerSlotHeads(containerId) {
        const container = document.getElementById(containerId);
        if (!container || typeof MP_PLAYER_SPRITE_SETS === 'undefined') return;

        const slots = container.querySelectorAll('.player-slot');
        slots.forEach((slot) => {
            const slotIdx = parseInt(slot.dataset.slot, 10);
            const cvs = slot.querySelector('canvas');
            if (!cvs || isNaN(slotIdx)) return;

            const ctx = cvs.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, 32, 32);

            const spriteSet = MP_PLAYER_SPRITE_SETS[slotIdx];
            if (!spriteSet) return;

            // Draw the face portion of the down-facing sprite (rows 0-31)
            const sprite = spriteSet.down[0]; // frame 0
            const { pattern, colors } = sprite;

            for (let row = 0; row < Math.min(pattern.length, 32); row++) {
                for (let col = 0; col < Math.min(pattern[row].length, 32); col++) {
                    const colorIndex = pattern[row][col];
                    if (colorIndex === 0) continue;
                    ctx.fillStyle = colors[colorIndex];
                    ctx.fillRect(col, row, 1, 1);
                }
            }
        });
    }

    function updatePlayerSlots(containerId, count) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = container.querySelectorAll('.player-slot');
        items.forEach((slot, idx) => {
            if (idx < count) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
        // Redraw heads (active/inactive state is handled via CSS filter)
        drawPlayerSlotHeads(containerId);
    }

    function cleanupNetwork() {
        if (network) {
            network.destroy();
            network = null;
        }
    }

    // Open multiplayer lobby
    if (multiplayerButton) {
        multiplayerButton.addEventListener('click', () => {
            hideAllScreens();
            mpLobbyScreen.classList.remove('hidden');
            showLobbyMenu();
        });
    }

    // Back to start screen from lobby menu
    if (lobbyBackBtn) {
        lobbyBackBtn.addEventListener('click', () => {
            cleanupNetwork();
            showStartScreen();
        });
    }

    // ── CREATE ROOM ─────────────────────────────
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', async () => {
            cleanupNetwork();
            network = new NetworkManager();

            lobbyMenu.style.display = 'none';
            hostLobby.style.display = '';
            lobbyStatus.textContent = 'CREATING ROOM...';
            lobbyStatus.classList.remove('lobby-error');
            mpStartBtn.disabled = false;

            try {
                const code = await network.createRoom();
                roomCodeDisplay.textContent = code;
                lobbyStatus.textContent = 'WAITING FOR PLAYERS...';
                updatePlayerSlots('player-slots', 1);
                drawPlayerSlotHeads('player-slots');

                network.onPlayerJoined = (playerId, totalPlayers) => {
                    updatePlayerSlots('player-slots', totalPlayers);
                    lobbyStatus.textContent = totalPlayers + '/4 PLAYERS';
                    mpStartBtn.disabled = false;
                };

                network.onPlayerLeft = (playerId) => {
                    updatePlayerSlots('player-slots', network.playerCount);
                    lobbyStatus.textContent = network.playerCount + '/4 PLAYERS';
                    mpStartBtn.disabled = false;
                };

                network.onError = (msg) => {
                    lobbyStatus.textContent = msg;
                    lobbyStatus.classList.add('lobby-error');
                };

            } catch (err) {
                lobbyStatus.textContent = 'FAILED: ' + (err.message || err);
                lobbyStatus.classList.add('lobby-error');
            }
        });
    }

    // Host cancel — go back to lobby menu
    if (hostCancelBtn) {
        hostCancelBtn.addEventListener('click', () => {
            cleanupNetwork();
            showLobbyMenu();
        });
    }

    // Host start game
    if (mpStartBtn) {
        mpStartBtn.addEventListener('click', () => {
            if (!network || !network.isHost) return;
            const seed = Math.floor(Math.random() * 2147483647);

            network.onGameStart = (config) => {
                hideAllScreens();
                mpGame = new MultiplayerGame(canvas, network, config);
            };

            network.startGame(seed);
        });
    }

    // ── JOIN ROOM ───────────────────────────────
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            lobbyMenu.style.display = 'none';
            joinLobby.style.display = '';
            joinStatus.textContent = '';
            joinStatus.classList.remove('lobby-error');
            roomCodeInput.value = '';
            roomCodeInput.focus();
        });
    }

    // Join cancel — go back to lobby menu
    if (joinCancelBtn) {
        joinCancelBtn.addEventListener('click', () => {
            cleanupNetwork();
            showLobbyMenu();
        });
    }

    // Auto-uppercase room code input
    if (roomCodeInput) {
        roomCodeInput.addEventListener('input', () => {
            roomCodeInput.value = roomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        roomCodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && roomCodeInput.value.length === 4) {
                joinConnectBtn.click();
            }
        });
    }

    // Connect to room
    if (joinConnectBtn) {
        joinConnectBtn.addEventListener('click', async () => {
            const code = roomCodeInput.value.trim().toUpperCase();
            if (code.length !== 4) {
                joinStatus.textContent = 'ENTER 4-CHAR CODE';
                joinStatus.classList.add('lobby-error');
                return;
            }

            cleanupNetwork();
            network = new NetworkManager();
            joinStatus.textContent = 'CONNECTING...';
            joinStatus.classList.remove('lobby-error');

            try {
                const welcomeData = await network.joinRoom(code);

                // Switch to client waiting view
                joinLobby.style.display = 'none';
                clientWaiting.style.display = '';
                clientRoomCode.textContent = code;
                updatePlayerSlots('client-player-slots', network.playerCount);
                drawPlayerSlotHeads('client-player-slots');
                clientStatus.textContent = network.playerCount + '/4 PLAYERS - WAITING...';
                clientStatus.classList.remove('lobby-error');

                network.onPlayerJoined = (playerId, totalPlayers) => {
                    updatePlayerSlots('client-player-slots', totalPlayers);
                    clientStatus.textContent = totalPlayers + '/4 PLAYERS - WAITING...';
                };

                network.onPlayerLeft = (playerId) => {
                    updatePlayerSlots('client-player-slots', network.playerCount);
                    clientStatus.textContent = network.playerCount + '/4 PLAYERS - WAITING...';
                };

                network.onGameStart = (config) => {
                    hideAllScreens();
                    mpGame = new MultiplayerGame(canvas, network, config);
                };

                network.onError = (msg) => {
                    clientStatus.textContent = msg;
                    clientStatus.classList.add('lobby-error');
                };

            } catch (err) {
                joinStatus.textContent = err.message || 'Connection failed';
                joinStatus.classList.add('lobby-error');
            }
        });
    }

    // Client cancel — go back to lobby menu
    if (clientCancelBtn) {
        clientCancelBtn.addEventListener('click', () => {
            cleanupNetwork();
            showLobbyMenu();
        });
    }

    // ── MP RESULT SCREEN ────────────────────────
    if (mpRematchBtn) {
        mpRematchBtn.addEventListener('click', () => {
            hideAllScreens();
            mpGame = null;
            cleanupNetwork();
            mpLobbyScreen.classList.remove('hidden');
            showLobbyMenu();
        });
    }

    if (mpExitBtn) {
        mpExitBtn.addEventListener('click', () => {
            mpGame = null;
            cleanupNetwork();
            showStartScreen();
        });
    }

    // ── Draw lobby heads on first paint ─────────
    // (Delayed slightly to ensure player.js sprites are loaded)
    setTimeout(() => {
        drawPlayerSlotHeads('player-slots');
        drawPlayerSlotHeads('client-player-slots');
    }, 100);
});