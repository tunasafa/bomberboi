class InputHandler {
    constructor() {
        this.keys = {};
        this.lastKey = '';
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.lastKey = e.key;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    getKey(key) {
        return this.keys[key];
    }
    
    getLastKey() {
        return this.lastKey;
    }
    
    clearLastKey() {
        this.lastKey = '';
    }

    // Serialize current input state for network transmission
    getState() {
        return {
            up: !!this.keys['ArrowUp'],
            down: !!this.keys['ArrowDown'],
            left: !!this.keys['ArrowLeft'],
            right: !!this.keys['ArrowRight'],
            bomb: !!this.keys[' '],
            pause: !!this.keys['p'] || !!this.keys['P']
        };
    }

    // Apply remote input state received from network
    setRemoteState(state) {
        this.keys['ArrowUp'] = state.up;
        this.keys['ArrowDown'] = state.down;
        this.keys['ArrowLeft'] = state.left;
        this.keys['ArrowRight'] = state.right;
        this.keys[' '] = state.bomb;
    }
}