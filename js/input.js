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
}