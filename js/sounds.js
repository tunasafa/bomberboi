class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
    }

    loadSound(name, path) {
        this.sounds[name] = new Audio(path);
    }

    playSound(name) {
        if (!this.muted && this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
    }
}
