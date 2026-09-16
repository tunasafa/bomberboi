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
            if (game) {
                game.startNextLevel();
            }
        });
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (game) {
                game.restart();
            } else {
                startGame();
            }
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
            if (game) {
                game.restart();
            } else {
                startGame();
            }
        });
    }
    
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            if (game) {
                game.resume();
            }
        });
    }
    
    if (pauseRestartButton) {
        pauseRestartButton.addEventListener('click', () => {
            if (game) {
                game.restart();
            } else {
                startGame();
            }
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

    function showLobbyMenu() {
        lobbyMenu.style.display = '';
        hostLobby.style.display = 'none';
        joinLobby.style.display = 'none';
        clientWaiting.style.display = 'none';
    }

    function updatePlayerSlots(containerId, count) {
        const slots = document.getElementById(containerId);
        if (!slots) return;
        const items = slots.querySelectorAll('.player-slot');
        items.forEach((slot, idx) => {
            if (idx < count) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
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

    // Back to start screen
    if (lobbyBackBtn) {
        lobbyBackBtn.addEventListener('click', () => {
            cleanupNetwork();
            hideAllScreens();
            document.getElementById('start-screen').classList.remove('hidden');
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
            mpStartBtn.disabled = true;

            try {
                const code = await network.createRoom();
                roomCodeDisplay.textContent = code;
                lobbyStatus.textContent = 'WAITING FOR PLAYERS...';
                updatePlayerSlots('player-slots', 1);

                network.onPlayerJoined = (playerId, totalPlayers) => {
                    updatePlayerSlots('player-slots', totalPlayers);
                    lobbyStatus.textContent = totalPlayers + '/4 PLAYERS';
                    mpStartBtn.disabled = (totalPlayers < 2);
                };

                network.onPlayerLeft = (playerId) => {
                    updatePlayerSlots('player-slots', network.playerCount);
                    lobbyStatus.textContent = network.playerCount + '/4 PLAYERS';
                    mpStartBtn.disabled = (network.playerCount < 2);
                };

                network.onError = (msg) => {
                    lobbyStatus.textContent = msg;
                    lobbyStatus.classList.add('lobby-error');
                };

            } catch (err) {
                lobbyStatus.textContent = 'FAILED: ' + err.message;
                lobbyStatus.classList.add('lobby-error');
            }
        });
    }

    // Host cancel
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

            // Start locally (onGameStart fires for host)
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

    // Join cancel
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
                await network.joinRoom(code);

                // Switch to client waiting view
                joinLobby.style.display = 'none';
                clientWaiting.style.display = '';
                clientRoomCode.textContent = code;
                updatePlayerSlots('client-player-slots', network.playerCount);
                clientStatus.textContent = 'WAITING FOR HOST TO START...';

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
                joinStatus.textContent = 'FAILED: ' + (err.message || 'Connection error');
                joinStatus.classList.add('lobby-error');
            }
        });
    }

    // Client cancel
    if (clientCancelBtn) {
        clientCancelBtn.addEventListener('click', () => {
            cleanupNetwork();
            showLobbyMenu();
        });
    }

    // ── MP RESULT SCREEN ────────────────────────
    if (mpRematchBtn) {
        mpRematchBtn.addEventListener('click', () => {
            // Go back to lobby
            hideAllScreens();
            mpGame = null;
            mpLobbyScreen.classList.remove('hidden');
            showLobbyMenu();
            cleanupNetwork();
        });
    }

    if (mpExitBtn) {
        mpExitBtn.addEventListener('click', () => {
            hideAllScreens();
            mpGame = null;
            cleanupNetwork();
            document.getElementById('start-screen').classList.remove('hidden');
        });
    }
});