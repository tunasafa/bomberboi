class InputHandler {
    constructor(listenToWindow = true) {
        this.keys = {};
        this.lastKey = '';
        
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
    setRemoteState(state) {
        if (typeof state === 'number') {
            this.keys['ArrowUp'] = (state & 1) !== 0;
            this.keys['ArrowDown'] = (state & 2) !== 0;
            this.keys['ArrowLeft'] = (state & 4) !== 0;
            this.keys['ArrowRight'] = (state & 8) !== 0;
            this.keys[' '] = (state & 16) !== 0;
        } else if (state) {
            this.keys['ArrowUp'] = !!state.up;
            this.keys['ArrowDown'] = !!state.down;
            this.keys['ArrowLeft'] = !!state.left;
            this.keys['ArrowRight'] = !!state.right;
            this.keys[' '] = !!state.bomb;
        }
    }
}