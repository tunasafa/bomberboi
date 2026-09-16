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
        this.map.generateMultiplayerMap(this.seed);

        // Game state
        this.explosions = [];
        this.powerups = [];
        this.isGameOver = false;
        this.gameWon = false;
        this.winnerId = -1;
        this.lastTime = 0;
        this.paused = false;
        this.stateTickCounter = 0;
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
            this.playerInputs.push(new InputHandler());
        }

        // The local player uses the real input handler
        this.input = new InputHandler();
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

        // Client: listen for state updates
        if (!this.isHost) {
            this.network.onStateUpdate = (state) => {
                this._applyStateFromHost(state);
            };
        }

        // Listen for game over
        this.network.onGameOver = (winnerId) => {
            this.isGameOver = true;
            this.winnerId = winnerId;
            this._showWinner(winnerId);
        };

        // Update HUD
        if (window.updateLevelDisplay) window.updateLevelDisplay('PVP');

        // Start game loop
        this.lastTime = performance.now();
        this.lastStateSentTime = 0;
        this.STATE_SEND_INTERVAL = 1000 / 30; // 30Hz tick rate
        
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
        this.ctx.imageSmoothingEnabled = true;
    }

    loop(timestamp) {
        let deltaTime = timestamp - this.lastTime;
        if (deltaTime > 1000) deltaTime = 16.67;
        this.lastTime = timestamp;

        if (!this.paused && !this.isGameOver) {
            if (this.isHost) {
                this.updateHost(timestamp);
            } else {
                // Client: send local input to host every frame
                this.network.sendInput(this.input.getState());
            }
        }

        this.draw();
        requestAnimationFrame(this._boundLoop);
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
            players: this.players.map(p => ({
                x: p.x, y: p.y,
                targetX: p.targetX, targetY: p.targetY,
                dir: p.direction,
                frame: p.animationFrame,
                alive: p.alive,
                moving: p.moving,
                invincible: p.invincible,
                lives: p.lives,
                maxBombs: p.maxBombs,
                bombRange: p.bombRange,
                baseSpeed: p.baseSpeed,
                bombs: p.bombs.map(b => ({
                    x: b.x, y: b.y, timer: b.timer, range: b.range,
                    exploded: b.exploded, frame: b.animationFrame
                }))
            })),
            explosions: this.explosions.map(e => ({
                x: e.x, y: e.y, dir: e.direction, timer: e.timer, frame: e.animationFrame
            })),
            powerups: this.powerups.filter(p => p.active).map(p => ({
                x: p.x, y: p.y, type: p.type, timer: p.animationTimer
            })),
            grid: this.map.grid
        };
    }

    // ── CLIENT: Apply state received from host ──
    _applyStateFromHost(state) {
        // Update players
        if (state.players) {
            for (let i = 0; i < state.players.length && i < this.players.length; i++) {
                const sp = state.players[i];
                const p = this.players[i];
                p.x = sp.x;
                p.y = sp.y;
                p.targetX = sp.targetX;
                p.targetY = sp.targetY;
                p.direction = sp.dir;
                p.animationFrame = sp.frame;
                p.alive = sp.alive;
                p.moving = sp.moving;
                p.invincible = sp.invincible;
                p.lives = sp.lives;
                p.maxBombs = sp.maxBombs;
                p.bombRange = sp.bombRange;
                p.baseSpeed = sp.baseSpeed;

                // Reconstruct bombs
                p.bombs = (sp.bombs || []).map(b => {
                    const bomb = new Bomb(this, b.x, b.y, b.range);
                    bomb.timer = b.timer;
                    bomb.exploded = b.exploded;
                    bomb.animationFrame = b.frame;
                    bomb.ownerSlot = i;
                    return bomb;
                });
            }
        }

        // Update explosions
        if (state.explosions) {
            this.explosions = state.explosions.map(e => {
                const exp = new Explosion(this, e.x, e.y, e.dir);
                exp.timer = e.timer;
                exp.animationFrame = e.frame;
                return exp;
            });
        }

        // Update powerups
        if (state.powerups) {
            this.powerups = state.powerups.map(p => {
                const pw = new Powerup(this, p.x, p.y, p.type);
                pw.animationTimer = p.timer;
                return pw;
            });
        }

        // Update map grid
        if (state.grid) {
            this.map.grid = state.grid;
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

        // Draw player name labels
        this.ctx.save();
        this.ctx.font = '7px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        for (let i = 0; i < this.players.length; i++) {
            const p = this.players[i];
            if (!p.alive) continue;
            const name = (i === this.mySlot) ? 'YOU' : 'P' + (i + 1);
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(name, p.x + 16, p.y - 3);
            this.ctx.fillStyle = MP_PLAYER_COLORS[i];
            this.ctx.fillText(name, p.x + 16, p.y - 4);
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

                document.getElementById('mp-result-title').textContent = isMe ? 'YOU WIN!' : 'GAME OVER';
                document.getElementById('mp-result-title').style.color = isMe ? '#0f0' : '#f00';
                document.getElementById('mp-winner-name').textContent = winnerName + ' WINS!';
                document.getElementById('mp-winner-name').style.color = winnerColor;

                document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
                mpResult.classList.remove('hidden');
            }
        }, 1500);
    }

    // ── Cleanup ─────────────────────────────────
    destroy() {
        this._boundLoop = null;
        this.network.destroy();
    }
}
