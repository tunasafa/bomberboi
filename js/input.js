class InputHandler {
    constructor(listenToWindow = true) {
        this.keys = {};
        this.lastKey = '';
        // Queued direction for remote players — persists until consumed at tile boundary
        this._queuedDirection = null;  // 'up'|'down'|'left'|'right'|null
        this._queuedBomb = false;
        this._isRemote = !listenToWindow;
        
        if (listenToWindow) {
            window.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;
                if (e.code) this.keys[e.code] = true;
                this.lastKey = e.key;
            });
            
            window.addEventListener('keyup', (e) => {
                this.keys[e.key] = false;
                if (e.code) this.keys[e.code] = false;
            });
        }
    }
    
    getKey(key) {
        if (key === 'ArrowUp') return !!(this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys['KeyW']);
        if (key === 'ArrowDown') return !!(this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.keys['KeyS']);
        if (key === 'ArrowLeft') return !!(this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.keys['KeyA']);
        if (key === 'ArrowRight') return !!(this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.keys['KeyD']);
        if (key === ' ') return !!(this.keys[' '] || this.keys['Enter'] || this.keys['Space']);
        return !!this.keys[key];
    }
    
    getLastKey() {
        return this.lastKey;
    }
    
    clearLastKey() {
        this.lastKey = '';
    }

    // Fast zero-allocation bitmask of input state
    getBitmask() {
        let mask = 0;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys['KeyW']) mask |= 1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.keys['KeyS']) mask |= 2;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.keys['KeyA']) mask |= 4;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.keys['KeyD']) mask |= 8;
        if (this.keys[' '] || this.keys['Enter'] || this.keys['Space']) mask |= 16;
        if (this.keys['p'] || this.keys['P'] || this.keys['KeyP']) mask |= 32;
        return mask;
    }

    // Serialize current input state for network transmission (supports WASD)
    getState() {
        return {
            up: !!(this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']),
            down: !!(this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']),
            left: !!(this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']),
            right: !!(this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']),
            bomb: !!(this.keys[' '] || this.keys['Enter']),
            pause: !!(this.keys['p'] || this.keys['P'])
        };
    }

    // Apply remote input state received from network (supports object or bitmask)
    // Extracts the directional intent and queues it for consumption at tile boundary
    setRemoteState(state) {
        let up = false, down = false, left = false, right = false, bomb = false;

        if (typeof state === 'number') {
            up    = (state & 1) !== 0;
            down  = (state & 2) !== 0;
            left  = (state & 4) !== 0;
            right = (state & 8) !== 0;
            bomb  = (state & 16) !== 0;
        } else if (state) {
            up    = !!state.up;
            down  = !!state.down;
            left  = !!state.left;
            right = !!state.right;
            bomb  = !!state.bomb;
        }

        // Update raw key state (used for current-frame reads)
        this.keys['ArrowUp']    = up;
        this.keys['ArrowDown']  = down;
        this.keys['ArrowLeft']  = left;
        this.keys['ArrowRight'] = right;
        this.keys[' ']          = bomb;

        // Queue the directional intent — this persists until the host consumes
        // it at the next tile boundary, preventing missed turns from latency.
        // Most recent direction wins (last-write-wins for rapid key switches).
        if (up)         this._queuedDirection = 'up';
        else if (down)  this._queuedDirection = 'down';
        else if (left)  this._queuedDirection = 'left';
        else if (right) this._queuedDirection = 'right';
        // Don't clear _queuedDirection when no keys are pressed — it persists
        // until consumed. Only clear if explicitly no direction is intended
        // (all directions released).
        if (!up && !down && !left && !right) {
            this._queuedDirection = null;
        }

        if (bomb) this._queuedBomb = true;
    }

    // Called by host at tile-boundary to consume the queued direction.
    // Returns the queued direction and clears it.
    consumeQueuedDirection() {
        const dir = this._queuedDirection;
        // Don't clear here — let it persist so the player keeps moving in the
        // same direction if the key is still held. It will be cleared when
        // the remote releases all direction keys.
        return dir;
    }

    // Called by host to check & consume queued bomb press
    consumeQueuedBomb() {
        const b = this._queuedBomb;
        this._queuedBomb = false;
        return b;
    }
}