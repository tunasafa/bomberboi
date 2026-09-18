// ──────────────────────────────────────────────
// MultiplayerGame — PvP battle mode (2-4 players)
// ──────────────────────────────────────────────

// Spawn positions for each player slot (grid coordinates)
const MP_SPAWN_POSITIONS = [
    { x: 1, y: 1 },   // P1: top-left
    { x: 11, y: 11 },  // P2: bottom-right
    { x: 1, y: 11 },   // P3: bottom-left
    { x: 11, y: 1 }    // P4: top-right
];

class MultiplayerGame {
    constructor(canvas, network, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();

        this.network = network;
        this.isHost = network.isHost;
        this.mySlot = config.yourSlot;
        this.playerCount = config.playerCount;
        this.seed = config.seed;

        this.sound = new SoundManager();
        this.loadSounds();

        // Map generation (deterministic via seed)
        this.map = new GameMap(1);
        this.map.grid = this.map.generateMultiplayerMap(this.seed);
        this.map.invalidate();
        
        // Broadcast block updates immediately to avoid JSON array caching bugs
        this._recentBlockChanges = [];
        this.map.onBlockChanged = (x, y, val) => {
            if (this.isHost) {
                this._recentBlockChanges.push({ x, y, val, time: performance.now() });
                this.network.broadcastState({ updateType: 'BLOCK_UPDATE', x, y, val });
            }
        };

        // Game state
        this.explosions = [];
        this.powerups = [];
        this.isGameOver = false;
        this.gameWon = false;
        this.winnerId = -1;
        this.lastTime = 0;
        this.paused = false;
        this.stateTickCounter = 0;
        this._lastReceivedSeq = -1;
        this.score = 0;
        this.enemies = null; // null signals multiplayer mode to bomb.js

        // Create players
        this.players = [];
        this.playerInputs = []; // remote input states (host only)

        for (let i = 0; i < this.playerCount; i++) {
            const spawn = MP_SPAWN_POSITIONS[i];
            const player = new Player(this, i);
            player.x = spawn.x * 32;
            player.y = spawn.y * 32;
            player.targetX = player.x;
            player.targetY = player.y;
            player.alive = true;
            player.maxBombs = 1;
            player.bombRange = 1;
            player.baseSpeed = 2;
            player.lives = 0;
            this.players.push(player);
            this.playerInputs.push(new InputHandler(false));
        }

        // The local player uses the real input handler
        this.input = new InputHandler(true);
        this.playerInputs[this.mySlot] = this.input;

        // For the local player reference (used by some code paths)
        this.player = this.players[this.mySlot];

        // Host: listen for remote inputs
        if (this.isHost) {
            this.network.onInputReceived = (playerId, keys) => {
                if (playerId >= 0 && playerId < this.playerCount && this.playerInputs[playerId]) {
                    this.playerInputs[playerId].setRemoteState(keys);
                }
            };
        }

        // Client: listen for state updates and buffer them synchronously
        if (!this.isHost) {
            this._pendingState = null;
            this.network.onStateUpdate = (state) => {
                if (state.updateType === 'BLOCK_UPDATE') {
                    if (this.map.grid[state.y]) {
                        this.map.grid[state.y][state.x] = state.val;
                        this.map.invalidateTile(state.x, state.y);
                    }
                    return;
                }
                this._pendingState = state;
            };
        }

        // Listen for player death sound
        this.network.onPlayerDied = (playerId) => {
            this.sound.playSound('death');
        };

        // Listen for game over
        this.network.onGameOver = (winnerId) => {
            this.isGameOver = true;
            this.winnerId = winnerId;
            this._showWinner(winnerId);
        };

        // Handle remote player disconnects
        if (this.isHost) {
            this.network.onPlayerLeft = (playerId) => {
                if (playerId >= 0 && playerId < this.playerCount) {
                    const p = this.players[playerId];
                    p.alive = false;
                    console.log(`[GAME] Player ${playerId} disconnected.`);
                }
            };
        }

        // Update HUD
        if (window.updateLevelDisplay) window.updateLevelDisplay('PVP');

        // Start game loop with fixed 60Hz timestep accumulator
        this.lastTime = performance.now();
        this.lastStateSentTime = 0;
        this.STATE_SEND_INTERVAL = 1000 / 30; // 30Hz network tick rate
        this._accumulator = 0;
        this._lastInputMask = -1;
        this._lastInputTime = 0;
        this._stopped = false;
        
        this._boundLoop = this.loop.bind(this);
        requestAnimationFrame(this._boundLoop);
    }

    loadSounds() {
        this.sound.loadSound('explosion', 'sounds/explosion.mp3');
        this.sound.loadSound('bomb', 'sounds/bomb.mp3');
        this.sound.loadSound('death', 'sounds/death.mp3');
    }

    setupCanvas() {
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.width = this.canvas.width = 416;
        this.height = this.canvas.height = 416;
        this.ctx.imageSmoothingEnabled = false;
    }

    loop(timestamp) {
        if (this._stopped) return;

        let deltaTime = timestamp - this.lastTime;
        if (deltaTime > 250) deltaTime = 250; // Clamp against background tab stalls
        this.lastTime = timestamp;

        this._accumulator += deltaTime;
        const FIXED_TIMESTEP = 1000 / 60; // 16.667ms per standard 60Hz tick

        if (!this.paused && !this.isGameOver) {
            while (this._accumulator >= FIXED_TIMESTEP) {
                if (this.isHost) {
                    this.updateHost(timestamp);
                } else {
                    this.updateClient(timestamp, FIXED_TIMESTEP);
                }
                this._accumulator -= FIXED_TIMESTEP;
            }

            if (!this.isHost) {
                this._sendClientInput(timestamp);
            }
        }

        this.draw();
        requestAnimationFrame(this._boundLoop);
    }

    // Client: zero-allocation bitmask input transmission
    _sendClientInput(timestamp) {
        const mask = this.input.getBitmask();
        const hasAnyKey = (mask & 31) !== 0;
        const timeSinceLast = timestamp - this._lastInputTime;

        if (mask !== this._lastInputMask || (hasAnyKey && timeSinceLast > 33) || timeSinceLast > 100) {
            this.network.sendInput(mask);
            this._lastInputMask = mask;
            this._lastInputTime = timestamp;
        }
    }

    // ── HOST: Run authoritative game logic ──────
    updateHost(timestamp) {
        // Update each alive player
        for (let i = 0; i < this.playerCount; i++) {
            const p = this.players[i];
            if (!p.alive) continue;

            // Swap in this player's input handler temporarily
            const savedInput = this.input;
            this.input = this.playerInputs[i];
            p.game = this; // ensure reference
            this._updatePlayer(p, i);
            this.input = savedInput;
        }

        // Update bombs for all players
        for (let i = 0; i < this.playerCount; i++) {
            this.players[i].bombs.forEach(bomb => bomb.update());
        }

        // Update explosions
        this.explosions.forEach(explosion => explosion.update());

        // Update powerups
        for (const powerup of this.powerups) {
            if (!powerup.active) continue;
            // Check collision with all alive players
            for (let i = 0; i < this.playerCount; i++) {
                const p = this.players[i];
                if (p.alive && checkCollision(powerup, p)) {
                    this._collectPowerup(powerup, i);
                    break;
                }
            }
        }

        // Check win condition
        const alivePlayers = this.players.filter(p => p.alive);
        if (alivePlayers.length <= 1 && !this.isGameOver) {
            this.isGameOver = true;
            if (alivePlayers.length === 1) {
                this.winnerId = this.players.indexOf(alivePlayers[0]);
            } else {
                this.winnerId = -1; // draw
            }
            this.network.announceGameOver(this.winnerId);
            this._showWinner(this.winnerId);
        }

        // Broadcast state to clients at strict tick rate
        if (timestamp - this.lastStateSentTime > this.STATE_SEND_INTERVAL) {
            this.network.broadcastState(this._serializeState());
            this.lastStateSentTime = timestamp;
        }
    }

    // ── CLIENT: 60fps local prediction and remote interpolation ──
    updateClient(timestamp, deltaTime) {
        // 1. Consume and apply pending authoritative state from host
        if (this._pendingState) {
            const state = this._pendingState;
            this._pendingState = null;
            this._applyStateFromHost(state);
        }

        // 2. Update players: local prediction for mySlot, interpolation for remote players
        for (let i = 0; i < this.playerCount; i++) {
            const p = this.players[i];
            if (!p.alive) continue;

            if (i === this.mySlot) {
                this._updateLocalPlayerPrediction(p);
            } else {
                if (p.invincible > 0) p.invincible--;

                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const distSq = dx * dx + dy * dy;

                if (distSq > 0.01) {
                    p.moving = true;
                    p.animationTimer = (p.animationTimer || 0) + 1;
                    if (p.animationTimer % 15 === 0) {
                        p.animationFrame = (p.animationFrame + 1) % 2;
                    }

                    const speed = p.baseSpeed || 2;
                    if (p.x < p.targetX) p.x = Math.min(p.x + speed, p.targetX);
                    else if (p.x > p.targetX) p.x = Math.max(p.x - speed, p.targetX);
                    if (p.y < p.targetY) p.y = Math.min(p.y + speed, p.targetY);
                    else if (p.y > p.targetY) p.y = Math.max(p.y - speed, p.targetY);

                    if (p.x === p.targetX && p.y === p.targetY) {
                        p.moving = false;
                        p.animationFrame = 0;
                    }
                } else {
                    p.moving = false;
                    p.animationFrame = 0;
                }
            }
        }

        // 3. Animate bombs locally at 60 FPS
        for (let i = 0; i < this.playerCount; i++) {
            const p = this.players[i];
            for (let j = 0; j < p.bombs.length; j++) {
                const b = p.bombs[j];
                b.animationFrame++;
                b.timer = Math.max(0, b.timer - 1);
            }
        }

        // 4. Animate explosions locally at 60 FPS
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.timer--;
            exp.animationFrame = 30 - exp.timer;
            if (exp.timer <= 0) {
                this.explosions.splice(i, 1);
            }
        }

        // 5. Animate powerups bobbing locally
        for (let i = 0; i < this.powerups.length; i++) {
            this.powerups[i].animationTimer = (this.powerups[i].animationTimer || 0) + 1;
        }
    }

    // Client: local player prediction for 0-latency responsive movement
    _updateLocalPlayerPrediction(player) {
        player.animationTimer++;
        if (player.invincible > 0) player.invincible--;

        if (player.moving) {
            if (player.animationTimer % 15 === 0) {
                player.animationFrame = (player.animationFrame + 1) % 2;
            }
        } else {
            player.animationFrame = 0;
        }

        if (player.x === player.targetX && player.y === player.targetY) {
            const currentGridX = Math.floor(player.x / 32);
            const currentGridY = Math.floor(player.y / 32);
            let newTargetX = player.targetX;
            let newTargetY = player.targetY;
            let newDirection = player.direction;

            if (this.input.getKey('ArrowUp') && !player.moving) {
                newTargetY = (currentGridY - 1) * 32;
                newDirection = 'up';
            } else if (this.input.getKey('ArrowDown') && !player.moving) {
                newTargetY = (currentGridY + 1) * 32;
                newDirection = 'down';
            } else if (this.input.getKey('ArrowLeft') && !player.moving) {
                newTargetX = (currentGridX - 1) * 32;
                newDirection = 'left';
            } else if (this.input.getKey('ArrowRight') && !player.moving) {
                newTargetX = (currentGridX + 1) * 32;
                newDirection = 'right';
            }

            player.direction = newDirection;

            if ((newTargetX !== player.targetX || newTargetY !== player.targetY) &&
                canMove(newTargetX, newTargetY, player.width, player.height, this.map.grid)) {
                player.targetX = newTargetX;
                player.targetY = newTargetY;
                player.moving = true;
                player.animationFrame = 0;
            } else {
                player.moving = false;
            }
        } else {
            const speed = player.baseSpeed || 2;
            if (player.x < player.targetX) player.x = Math.min(player.x + speed, player.targetX);
            else if (player.x > player.targetX) player.x = Math.max(player.x - speed, player.targetX);
            if (player.y < player.targetY) player.y = Math.min(player.y + speed, player.targetY);
            else if (player.y > player.targetY) player.y = Math.max(player.y - speed, player.targetY);

            if (player.x === player.targetX && player.y === player.targetY) {
                player.moving = false;
                player.animationFrame = 0;
            }
        }
    }

    _getRecentBlockChanges() {
        const now = performance.now();
        this._recentBlockChanges = this._recentBlockChanges.filter(b => (now - b.time) < 2000);
        return this._recentBlockChanges.map(b => [b.x, b.y, b.val]);
    }

    // ── Update a single player (host only) ──────
    _updatePlayer(player, slotIndex) {
        player.animationTimer++;
        if (player.invincible > 0) player.invincible--;

        if (player.moving) {
            if (player.animationTimer % 15 === 0) {
                player.animationFrame = (player.animationFrame + 1) % 2;
            }
        } else {
            player.animationFrame = 0;
        }

        if (player.x === player.targetX && player.y === player.targetY) {
            const currentGridX = Math.floor(player.x / 32);
            const currentGridY = Math.floor(player.y / 32);
            let newTargetX = player.targetX;
            let newTargetY = player.targetY;
            let newDirection = player.direction;

            const inp = this.playerInputs[slotIndex];
            if (inp.getKey('ArrowUp') && !player.moving) {
                newTargetY = (currentGridY - 1) * 32;
                newDirection = 'up';
            } else if (inp.getKey('ArrowDown') && !player.moving) {
                newTargetY = (currentGridY + 1) * 32;
                newDirection = 'down';
            } else if (inp.getKey('ArrowLeft') && !player.moving) {
                newTargetX = (currentGridX - 1) * 32;
                newDirection = 'left';
            } else if (inp.getKey('ArrowRight') && !player.moving) {
                newTargetX = (currentGridX + 1) * 32;
                newDirection = 'right';
            }

            player.direction = newDirection;

            if ((newTargetX !== player.targetX || newTargetY !== player.targetY) &&
                canMove(newTargetX, newTargetY, player.width, player.height, this.map.grid)) {
                player.targetX = newTargetX;
                player.targetY = newTargetY;
                player.moving = true;
                player.animationFrame = 0;
            } else {
                player.moving = false;
            }
        } else {
            const speed = player.baseSpeed;
            if (player.x < player.targetX) player.x = Math.min(player.x + speed, player.targetX);
            else if (player.x > player.targetX) player.x = Math.max(player.x - speed, player.targetX);
            if (player.y < player.targetY) player.y = Math.min(player.y + speed, player.targetY);
            else if (player.y > player.targetY) player.y = Math.max(player.y - speed, player.targetY);

            if (player.x === player.targetX && player.y === player.targetY) {
                player.moving = false;
                player.animationFrame = 0;
            }
        }

        // Bomb placement
        const inp = this.playerInputs[slotIndex];
        const isSpaceDown = inp.getKey(' ');
        if (isSpaceDown && !player.bombKeyWasDown && player.bombs.length < player.maxBombs) {
            const bombX = Math.floor((player.x + player.width / 2) / 32) * 32;
            const bombY = Math.floor((player.y + player.height / 2) / 32) * 32;

            const bombExists = player.bombs.some(bomb =>
                Math.floor(bomb.x / 32) === Math.floor(bombX / 32) &&
                Math.floor(bomb.y / 32) === Math.floor(bombY / 32)
            );

            const tileX = Math.floor(bombX / 32);
            const tileY = Math.floor(bombY / 32);
            const isPositionValid = tileX >= 0 && tileX < this.map.cols &&
                                    tileY >= 0 && tileY < this.map.rows &&
                                    this.map.grid[tileY][tileX] === 0;

            if (!bombExists && isPositionValid && this.map.addBomb(bombX, bombY)) {
                const bomb = new Bomb(this, bombX, bombY, player.bombRange);
                bomb.ownerSlot = slotIndex;
                player.bombs.push(bomb);
                this.sound.playSound('bomb');
            }
        }
        player.bombKeyWasDown = isSpaceDown;
    }

    // ── Handle explosion hits on all players ────
    gameOver() {
        // In multiplayer, gameOver is called per-player via explosions
        // Find which player was hit by checking explosion collisions
        for (let i = 0; i < this.playerCount; i++) {
            const p = this.players[i];
            if (!p.alive || p.invincible > 0) continue;

            for (const exp of this.explosions) {
                if (checkCollision(exp, p, 8)) {
                    if (p.lives > 0) {
                        p.lives--;
                        p.invincible = 180;
                    } else {
                        p.alive = false;
                        this.sound.playSound('death');
                        this.network.announcePlayerDeath(i);
                    }
                    break;
                }
            }
        }
    }

    // Override to prevent single-player win logic
    winGame() { }

    // ── Powerup collection ──────────────────────
    _collectPowerup(powerup, playerIdx) {
        powerup.active = false;
        const p = this.players[playerIdx];

        switch (powerup.type) {
            case 'bombUp': p.maxBombs++; break;
            case 'rangeUp': p.bombRange++; break;
            case 'speedUp': p.baseSpeed = Math.min((p.baseSpeed || 2) + 0.5, 4); break;
            case 'extraLife': p.lives = (p.lives || 0) + 1; break;
        }

        this.powerups = this.powerups.filter(pw => pw !== powerup);
    }

    // ── Serialize game state for network ────────
    _serializeState() {
        return {
            seq: this.stateTickCounter++,
            p: this.players.map(p => ({
                x: Math.round(p.x * 10) / 10,
                y: Math.round(p.y * 10) / 10,
                tx: p.targetX,
                ty: p.targetY,
                d: p.direction,
                f: p.animationFrame,
                a: p.alive ? 1 : 0,
                m: p.moving ? 1 : 0,
                iv: p.invincible,
                l: p.lives,
                mb: p.maxBombs,
                br: p.bombRange,
                bs: p.baseSpeed,
                b: p.bombs.map(b => ({
                    x: b.x,
                    y: b.y,
                    t: b.timer,
                    r: b.range,
                    e: b.exploded ? 1 : 0,
                    f: b.animationFrame
                }))
            })),
            e: this.explosions.map(e => ({
                x: e.x,
                y: e.y,
                d: e.direction,
                t: e.timer,
                f: e.animationFrame
            })),
            pw: this.powerups.filter(p => p.active).map(p => ({
                x: p.x,
                y: p.y,
                tp: p.type,
                t: p.animationTimer
            })),
            bks: this._getRecentBlockChanges()
        };
    }

    // ── CLIENT: Apply state received from host ──
    _applyStateFromHost(state) {
        if (state.updateType === 'BLOCK_UPDATE') {
            this.map.grid[state.y][state.x] = state.val;
            this.map.invalidateTile(state.x, state.y);
            return;
        }

        // Discard out-of-order stale packets over UDP
        if (state.seq !== undefined) {
            if (this._lastReceivedSeq !== undefined && state.seq < this._lastReceivedSeq) {
                return;
            }
            this._lastReceivedSeq = state.seq;
        }

        // Apply any recent block updates to ensure 100% grid consistency
        if (state.bks && Array.isArray(state.bks)) {
            for (let k = 0; k < state.bks.length; k++) {
                const [bx, by, bval] = state.bks[k];
                if (this.map.grid[by] && this.map.grid[by][bx] !== bval) {
                    this.map.grid[by][bx] = bval;
                    this.map.invalidateTile(bx, by);
                }
            }
        }

        // Update players
        const rawPlayers = state.p || state.players;
        if (rawPlayers) {
            for (let i = 0; i < rawPlayers.length && i < this.players.length; i++) {
                const sp = rawPlayers[i];
                const p = this.players[i];

                const hostX = sp.x;
                const hostY = sp.y;
                const hostTx = sp.tx !== undefined ? sp.tx : (sp.targetX !== undefined ? sp.targetX : hostX);
                const hostTy = sp.ty !== undefined ? sp.ty : (sp.targetY !== undefined ? sp.targetY : hostY);
                const isAlive = sp.a !== undefined ? (sp.a === 1) : (sp.alive !== undefined ? sp.alive : p.alive);
                const isMoving = sp.m !== undefined ? (sp.m === 1) : (sp.moving !== undefined ? sp.moving : false);

                // Play death sound if player just died
                if (p.alive && !isAlive) {
                    this.sound.playSound('death');
                }

                p.alive = isAlive;
                p.invincible = sp.iv !== undefined ? sp.iv : (sp.invincible !== undefined ? sp.invincible : p.invincible);
                p.lives = sp.l !== undefined ? sp.l : (sp.lives !== undefined ? sp.lives : p.lives);
                p.maxBombs = sp.mb !== undefined ? sp.mb : (sp.maxBombs !== undefined ? sp.maxBombs : p.maxBombs);
                p.bombRange = sp.br !== undefined ? sp.br : (sp.bombRange !== undefined ? sp.bombRange : p.bombRange);
                p.baseSpeed = sp.bs !== undefined ? sp.bs : (sp.baseSpeed !== undefined ? sp.baseSpeed : p.baseSpeed);

                const diffX = hostX - p.x;
                const diffY = hostY - p.y;
                const dist = Math.sqrt(diffX * diffX + diffY * diffY);

                if (i === this.mySlot) {
                    // Local player reconciliation:
                    // Client predicted local movement. Reconcile if divergence detected.
                    if (dist > 16) {
                        p.x = hostX;
                        p.y = hostY;
                        p.targetX = hostTx;
                        p.targetY = hostTy;
                        p.moving = isMoving;
                    } else if (dist > 1) {
                        p.x += diffX * 0.15;
                        p.y += diffY * 0.15;
                    }
                } else {
                    // Remote player interpolation to host target
                    p.targetX = hostTx;
                    p.targetY = hostTy;
                    p.direction = sp.d !== undefined ? sp.d : (sp.dir || p.direction);

                    if (dist > 24 || !isMoving) {
                        if (!isMoving && dist < 2) {
                            p.x = hostX;
                            p.y = hostY;
                            p.moving = false;
                        } else if (dist > 24) {
                            p.x = hostX;
                            p.y = hostY;
                        } else {
                            p.x += diffX * 0.4;
                            p.y += diffY * 0.4;
                        }
                    } else {
                        p.x += diffX * 0.35;
                        p.y += diffY * 0.35;
                        p.moving = true;
                    }
                }

                // Update bombs (Zero-allocation in-place matching)
                const rawBombs = sp.b || sp.bombs;
                if (rawBombs && rawBombs.length > 0) {
                    let writeIdx = 0;
                    for (let j = 0; j < p.bombs.length; j++) {
                        const existingBomb = p.bombs[j];
                        let foundInIncoming = false;
                        for (let k = 0; k < rawBombs.length; k++) {
                            if (rawBombs[k].x === existingBomb.x && rawBombs[k].y === existingBomb.y) {
                                foundInIncoming = true;
                                break;
                            }
                        }
                        if (foundInIncoming) {
                            p.bombs[writeIdx++] = existingBomb;
                        } else {
                            const btx = Math.floor(existingBomb.x / 32);
                            const bty = Math.floor(existingBomb.y / 32);
                            if (this.map.grid[bty] && this.map.grid[bty][btx] === 3) {
                                this.map.grid[bty][btx] = 0;
                            }
                        }
                    }
                    p.bombs.length = writeIdx;

                    for (let k = 0; k < rawBombs.length; k++) {
                        const b = rawBombs[k];
                        const bTimer = b.t !== undefined ? b.t : b.timer;
                        const bExp = b.e !== undefined ? (b.e === 1) : b.exploded;
                        const bFrame = b.f !== undefined ? b.f : b.animationFrame;
                        const bRange = b.r !== undefined ? b.r : b.range;

                        let existing = null;
                        for (let j = 0; j < p.bombs.length; j++) {
                            if (p.bombs[j].x === b.x && p.bombs[j].y === b.y) {
                                existing = p.bombs[j];
                                break;
                            }
                        }

                        if (existing) {
                            existing.timer = bTimer;
                            existing.exploded = bExp;
                            existing.animationFrame = bFrame;
                        } else {
                            const bomb = new Bomb(this, b.x, b.y, bRange);
                            bomb.timer = bTimer;
                            bomb.exploded = bExp;
                            bomb.animationFrame = bFrame;
                            bomb.ownerSlot = i;
                            p.bombs.push(bomb);
                            this.sound.playSound('bomb');
                        }

                        const btx = Math.floor(b.x / 32);
                        const bty = Math.floor(b.y / 32);
                        if (this.map.grid[bty] && this.map.grid[bty][btx] === 0) {
                            this.map.grid[bty][btx] = 3;
                        }
                    }
                } else {
                    for (let j = 0; j < p.bombs.length; j++) {
                        const btx = Math.floor(p.bombs[j].x / 32);
                        const bty = Math.floor(p.bombs[j].y / 32);
                        if (this.map.grid[bty] && this.map.grid[bty][btx] === 3) {
                            this.map.grid[bty][btx] = 0;
                        }
                    }
                    p.bombs.length = 0;
                }
            }
        }

        // Update explosions (Zero-allocation in-place matching)
        const rawExplosions = state.e || state.explosions;
        if (rawExplosions) {
            const hadExplosions = this.explosions.length > 0;

            let writeIdx = 0;
            for (let j = 0; j < this.explosions.length; j++) {
                const exp = this.explosions[j];
                let found = false;
                for (let k = 0; k < rawExplosions.length; k++) {
                    const e = rawExplosions[k];
                    const eDir = e.d !== undefined ? e.d : (e.dir || e.direction);
                    if (e.x === exp.x && e.y === exp.y && eDir === exp.direction) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    this.explosions[writeIdx++] = exp;
                }
            }
            this.explosions.length = writeIdx;

            for (let k = 0; k < rawExplosions.length; k++) {
                const e = rawExplosions[k];
                const eDir = e.d !== undefined ? e.d : (e.dir || e.direction);
                const eTimer = e.t !== undefined ? e.t : e.timer;
                const eFrame = e.f !== undefined ? e.f : (e.frame !== undefined ? e.frame : e.animationFrame);

                let existing = null;
                for (let j = 0; j < this.explosions.length; j++) {
                    const exp = this.explosions[j];
                    if (exp.x === e.x && exp.y === e.y && exp.direction === eDir) {
                        existing = exp;
                        break;
                    }
                }

                if (existing) {
                    existing.timer = eTimer;
                    existing.animationFrame = eFrame;
                } else {
                    const exp = new Explosion(this, e.x, e.y, eDir);
                    exp.timer = eTimer;
                    exp.animationFrame = eFrame;
                    this.explosions.push(exp);
                }
            }

            if (!hadExplosions && this.explosions.length > 0) {
                this.sound.playSound('explosion');
            }
        }

        // Update powerups (Zero-allocation in-place matching)
        const rawPowerups = state.pw || state.powerups;
        if (rawPowerups) {
            let writeIdx = 0;
            for (let j = 0; j < this.powerups.length; j++) {
                const pw = this.powerups[j];
                let found = false;
                for (let k = 0; k < rawPowerups.length; k++) {
                    if (rawPowerups[k].x === pw.x && rawPowerups[k].y === pw.y) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    this.powerups[writeIdx++] = pw;
                }
            }
            this.powerups.length = writeIdx;

            for (let k = 0; k < rawPowerups.length; k++) {
                const pw = rawPowerups[k];
                const pwType = pw.tp !== undefined ? pw.tp : pw.type;
                const pwTimer = pw.t !== undefined ? pw.t : (pw.timer || 0);

                let existing = null;
                for (let j = 0; j < this.powerups.length; j++) {
                    if (this.powerups[j].x === pw.x && this.powerups[j].y === pw.y) {
                        existing = this.powerups[j];
                        break;
                    }
                }

                if (existing) {
                    existing.animationTimer = pwTimer;
                } else {
                    const powerup = new Powerup(this, pw.x, pw.y, pwType);
                    powerup.animationTimer = pwTimer;
                    this.powerups.push(powerup);
                }
            }
        }
    }

    // ── Drawing ─────────────────────────────────
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw map
        this.map.draw(this.ctx);

        // Draw powerups
        this.powerups.forEach(powerup => {
            if (powerup.active) powerup.draw(this.ctx);
        });

        // Draw bombs for all players
        for (const p of this.players) {
            p.bombs.forEach(bomb => {
                if (!bomb.exploded) bomb.draw(this.ctx);
            });
        }

        // Draw explosions
        this.explosions.forEach(explosion => explosion.draw(this.ctx));

        // Draw all players
        for (let i = 0; i < this.players.length; i++) {
            const p = this.players[i];
            if (!p.alive) continue;
            p.draw(this.ctx);
        }

        // Draw player name labels with rounded integer coordinates for crisp rendering
        this.ctx.save();
        this.ctx.font = '7px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        for (let i = 0; i < this.players.length; i++) {
            const p = this.players[i];
            if (!p.alive) continue;
            const name = (i === this.mySlot) ? 'YOU' : 'P' + (i + 1);
            const px = Math.round(p.x);
            const py = Math.round(p.y);
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(name, px + 16, py - 3);
            this.ctx.fillStyle = MP_PLAYER_COLORS[i];
            this.ctx.fillText(name, px + 16, py - 4);
        }
        this.ctx.restore();
    }

    // ── Show winner screen ──────────────────────
    _showWinner(winnerId) {
        setTimeout(() => {
            const mpResult = document.getElementById('mp-result-screen');
            if (mpResult) {
                const winnerName = winnerId >= 0 ? MP_PLAYER_NAMES[winnerId] : 'NOBODY';
                const winnerColor = winnerId >= 0 ? MP_PLAYER_COLORS[winnerId] : '#fff';
                const isMe = winnerId === this.mySlot;

                const resultImg = document.getElementById('mp-result-title-img');
                if (resultImg) {
                    resultImg.src = isMe ? 'img/you_win_logo.png' : 'img/game_over_logo.png';
                    resultImg.alt = isMe ? 'YOU WIN!' : 'GAME OVER';
                }

                if (winnerId < 0) {
                    document.getElementById('mp-winner-name').textContent = 'DRAW!';
                    document.getElementById('mp-winner-name').style.color = '#fff';
                } else {
                    document.getElementById('mp-winner-name').textContent = winnerName + ' WINS!';
                    document.getElementById('mp-winner-name').style.color = winnerColor;
                }

                document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
                mpResult.classList.remove('hidden');
            }
        }, 1500);
    }

    // ── Stop the game loop (preserves network) ─
    stop() {
        this._stopped = true;
    }

    // ── Full cleanup (destroys network too) ─────
    destroy() {
        this._stopped = true;
        this._boundLoop = null;
        this.network.destroy();
    }
}
