class SoundManager {
    constructor() {
        this.muted = false;
        // Web Audio API for instant, retro synthesized sounds
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    loadSound(name, path) {
        // We don't need to load files anymore; we are synthesizing them!
    }

    playSound(name) {
        if (this.muted) return;
        
        // Resume AudioContext if suspended (browser autoplay policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (name === 'bomb') {
            this.playBombSound();
        } else if (name === 'explosion') {
            this.playExplosionSound();
        } else if (name === 'death') {
            this.playDeathSound();
        }
    }
    
    playBombSound() {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }
    
    playExplosionSound() {
        // Create 0.4 seconds of white noise
        const duration = 0.4;
        const bufferSize = this.audioCtx.sampleRate * duration; 
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        // Filter the noise to sound like a low, rumbling explosion
        const biquadFilter = this.audioCtx.createBiquadFilter();
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        biquadFilter.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + duration);
        
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        noise.connect(biquadFilter);
        biquadFilter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        noise.start();
    }
    
    playDeathSound() {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.audioCtx.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    }

    toggleMute() {
        this.muted = !this.muted;
    }
}
