// ──────────────────────────────────────────────
// NetworkManager — PeerJS WebRTC multiplayer
// ──────────────────────────────────────────────
class NetworkManager {
    constructor() {
        this.peer = null;
        this.connections = [];   // host keeps all client connections
        this.hostConnection = null; // client keeps its connection to host
        this.isHost = false;
        this.roomCode = '';
        this.playerId = -1;      // 0 = host, 1-3 = clients
        this.playerCount = 1;
        this.onPlayerJoined = null;   // callback(playerId, totalPlayers)
        this.onPlayerLeft = null;     // callback(playerId)
        this.onGameStart = null;      // callback({ seed, playerCount, yourSlot })
        this.onStateUpdate = null;    // callback(stateObj) — clients only
        this.onInputReceived = null;  // callback(playerId, inputState) — host only
        this.onGameOver = null;       // callback(winnerId)
        this.onPlayerDied = null;     // callback(playerId)
        this.onError = null;          // callback(errorMsg)
        this.connected = false;
        this._peerPrefix = 'bomberboi-mp-';
        this._lastStartSeed = null;
        this._lastGameOverWinner = null;
    }

    // ── Generate a short room code ──────────────
    _generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    // ── HOST: Create a room ─────────────────────
    createRoom() {
        return new Promise((resolve, reject) => {
            this.roomCode = this._generateCode();
            this.isHost = true;
            this.playerId = 0;
            this.playerCount = 1;

            const peerId = this._peerPrefix + this.roomCode;

            this.peer = new Peer(peerId, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ],
                    iceTransportPolicy: 'all',
                    iceCandidatePoolSize: 10
                }
            });

            this.peer.on('open', (id) => {
                this.connected = true;
                console.log('[NET] Room created:', this.roomCode, 'Peer ID:', id);
                resolve(this.roomCode);
            });

            this.peer.on('connection', (conn) => {
                this._handleNewConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('[NET] Host error:', err.type, err.message);
                if (err.type === 'unavailable-id') {
                    // Room code collision — try again with a new code
                    this.peer.destroy();
                    this.roomCode = this._generateCode();
                    this.createRoom().then(resolve).catch(reject);
                } else {
                    if (this.onError) this.onError('Failed to create room: ' + err.type);
                    reject(err);
                }
            });

            this.peer.on('disconnected', () => {
                console.warn('[NET] Host disconnected from signaling, reconnecting...');
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });
        });
    }

    // ── HOST: Handle incoming connection ────────
    _handleNewConnection(conn) {
        if (this.connections.length >= 3) {
            // Room is full
            const rejectFull = () => {
                conn.send({ type: 'ERROR', message: 'Room is full' });
                setTimeout(() => conn.close(), 500);
            };
            if (conn.open) rejectFull();
            else conn.on('open', rejectFull);
            return;
        }

        const newPlayerId = this.connections.length + 1;
        conn.metadata = { playerId: newPlayerId };

        const onOpen = () => {
            this.connections.push(conn);
            this.playerCount = this.connections.length + 1;

            // Tell the new client their player ID
            conn.send({
                type: 'WELCOME',
                playerId: newPlayerId,
                playerCount: this.playerCount
            });

            // Tell ALL clients about the updated player count
            this._broadcastToClients({
                type: 'PLAYER_COUNT',
                playerCount: this.playerCount
            });

            console.log('[NET] Player', newPlayerId, 'joined. Total:', this.playerCount);
            if (this.onPlayerJoined) this.onPlayerJoined(newPlayerId, this.playerCount);
        };

        // CRITICAL: The connection might already be open by the time
        // peer.on('connection') fires. Check and handle both cases.
        if (conn.open) {
            onOpen();
        } else {
            conn.on('open', onOpen);
        }

        conn.on('data', (data) => {
            if (data.type === 'INPUT' && this.onInputReceived) {
                this.onInputReceived(conn.metadata.playerId, data.keys);
            }
        });

        conn.on('close', () => {
            this._removeConnection(conn);
        });

        conn.on('error', (err) => {
            console.error('[NET] Connection error:', err);
            this._removeConnection(conn);
        });
    }

    _removeConnection(conn) {
        const idx = this.connections.indexOf(conn);
        if (idx !== -1) {
            const playerId = conn.metadata.playerId;
            this.connections.splice(idx, 1);
            this.playerCount = this.connections.length + 1;

            this._broadcastToClients({
                type: 'PLAYER_LEFT',
                playerId: playerId,
                playerCount: this.playerCount
            });

            console.log('[NET] Player', playerId, 'left. Total:', this.playerCount);
            if (this.onPlayerLeft) this.onPlayerLeft(playerId);
        }
    }

    // ── HOST: Broadcast to all clients ──────────
    _broadcastToClients(data) {
        for (const conn of this.connections) {
            if (conn.open) {
                try { conn.send(data); } catch (e) { /* ignore */ }
            }
        }
    }

    // ── HOST: Send game state to all clients ────
    broadcastState(state) {
        if (!this.isHost) return;
        this._broadcastToClients({ type: 'STATE', ...state });
    }

    // ── HOST: Start the game ────────────────────
    startGame(seed) {
        if (!this.isHost) return;
        const msg = {
            type: 'START',
            seed: seed,
            playerCount: this.playerCount
        };
        for (const conn of this.connections) {
            if (conn.open) {
                try {
                    conn.send({ ...msg, yourSlot: conn.metadata.playerId });
                } catch (e) { /* ignore */ }
            }
        }

        // Also notify local host
        if (this.onGameStart) {
            this.onGameStart({ seed, playerCount: this.playerCount, yourSlot: 0 });
        }
    }

    // ── HOST: Announce game over ────────────────
    announceGameOver(winnerId) {
        if (!this.isHost) return;
        this._broadcastToClients({ type: 'GAME_OVER', winnerId });
        if (this.onGameOver) this.onGameOver(winnerId);
    }

    // ── HOST: Announce player death ─────────────
    announcePlayerDeath(playerId) {
        if (!this.isHost) return;
        this._broadcastToClients({ type: 'PLAYER_DIED', playerId });
    }

    // ── CLIENT: Join a room ─────────────────────
    joinRoom(code) {
        return new Promise((resolve, reject) => {
            this.roomCode = code.toUpperCase();
            this.isHost = false;
            let resolved = false;

            this.peer = new Peer(undefined, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ],
                    iceTransportPolicy: 'all',
                    iceCandidatePoolSize: 10
                }
            });

            this.peer.on('open', (myId) => {
                console.log('[NET] Client peer open, ID:', myId);
                const hostPeerId = this._peerPrefix + this.roomCode;
                const conn = this.peer.connect(hostPeerId, { reliable: true });

                const onConnOpen = () => {
                    this.hostConnection = conn;
                    this.connected = true;
                    console.log('[NET] Connected to host, waiting for WELCOME...');
                };

                // Handle connection open
                if (conn.open) {
                    onConnOpen();
                } else {
                    conn.on('open', onConnOpen);
                }

                conn.on('data', (data) => {
                    if (!resolved && data.type === 'WELCOME') {
                        resolved = true;
                        this.playerId = data.playerId;
                        this.playerCount = data.playerCount;
                        this.hostConnection = conn;
                        this.connected = true;
                        console.log('[NET] Joined! Player slot:', this.playerId);
                        resolve(data);
                    } else if (data.type === 'ERROR') {
                        if (!resolved) {
                            resolved = true;
                            reject(new Error(data.message));
                        }
                        if (this.onError) this.onError(data.message);
                    } else {
                        this._handleClientMessage(data);
                    }
                });

                conn.on('close', () => {
                    console.warn('[NET] Lost connection to host');
                    this.connected = false;
                    if (!resolved) {
                        resolved = true;
                        reject(new Error('Connection closed by host'));
                    }
                    if (this.onError) this.onError('Lost connection to host');
                });

                conn.on('error', (err) => {
                    console.error('[NET] Client connection error:', err);
                    if (!resolved) {
                        resolved = true;
                        reject(err);
                    }
                    if (this.onError) this.onError('Connection error');
                });
            });

            this.peer.on('error', (err) => {
                console.error('[NET] Client peer error:', err.type, err.message);
                if (!resolved) {
                    resolved = true;
                    const msg = err.type === 'peer-unavailable'
                        ? 'Room not found — check the code'
                        : 'Connection failed: ' + err.type;
                    reject(new Error(msg));
                }
                if (this.onError) this.onError('Connection failed: ' + err.type);
            });

            this.peer.on('disconnected', () => {
                console.warn('[NET] Client disconnected from signaling, reconnecting...');
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });

            // Timeout
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error('Connection timed out — room may not exist'));
                }
            }, 10000);
        });
    }

    // ── CLIENT: Handle messages from host ───────
    _handleClientMessage(data) {
        switch (data.type) {
            case 'PLAYER_COUNT':
                this.playerCount = data.playerCount;
                if (this.onPlayerJoined) this.onPlayerJoined(-1, data.playerCount);
                break;

            case 'PLAYER_LEFT':
                this.playerCount = data.playerCount;
                if (this.onPlayerLeft) this.onPlayerLeft(data.playerId);
                break;

            case 'START':
                if (this._lastStartSeed === data.seed) break;
                this._lastStartSeed = data.seed;
                this._lastGameOverWinner = null;
                if (this.onGameStart) {
                    this.onGameStart({
                        seed: data.seed,
                        playerCount: data.playerCount,
                        yourSlot: data.yourSlot
                    });
                }
                break;

            case 'STATE':
                if (this.onStateUpdate) this.onStateUpdate(data);
                break;

            case 'GAME_OVER':
                if (this._lastGameOverWinner === data.winnerId && this._lastGameOverWinner !== null) {
                    break;
                }
                this._lastGameOverWinner = data.winnerId;
                if (this.onGameOver) this.onGameOver(data.winnerId);
                break;

            case 'PLAYER_DIED':
                if (this.onPlayerDied) this.onPlayerDied(data.playerId);
                break;
        }
    }

    // ── CLIENT: Send input to host ──────────────
    sendInput(keys) {
        if (this.isHost || !this.hostConnection || !this.hostConnection.open) return;
        try {
            this.hostConnection.send({ type: 'INPUT', keys });
        } catch (e) { /* ignore */ }
    }

    // ── Cleanup ─────────────────────────────────
    destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.connections = [];
        this.hostConnection = null;
        this.connected = false;
        this.isHost = false;
        this.roomCode = '';
        this.playerId = -1;
        this.playerCount = 1;
        this._lastStartSeed = null;
        this._lastGameOverWinner = null;
    }
}
