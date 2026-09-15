class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.input = new InputHandler();
        this.sound = new SoundManager();
        this.level = 1;
        this.maxLevel = 25;
        this.map = new Map(this.level);
        this.player = new Player(this);
        this.enemies = [];
        this.explosions = [];
        this.powerups = [];
        this.isGameOver = false;
        this.gameWon = false;
        this.paused = false;
        this.score = 0;
        this.lastTime = 0;
        
        if (window.updateLevelDisplay) {
            window.updateLevelDisplay(this.level);
        }
        
        this.createEnemies(3 + Math.floor(this.level * 1.5));
        this.loadSounds();
        
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
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
    
    createEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            let validPosition = false;
            
            while (!validPosition) {
                x = (Math.floor(Math.random() * (this.map.cols - 4)) * 32 + 32);
                y = (Math.floor(Math.random() * (this.map.rows - 4)) * 32 + 32);
                
                if (canMove(x, y, 32, 32, this.map.grid) && 
                    Math.abs(x - this.player.x) > 96 && 
                    Math.abs(y - this.player.y) > 96) {
                    validPosition = true;
                }
            }
            
            this.enemies.push(new Enemy(this, x, y));
        }
    }
    
    loop = (timestamp) => {
        let deltaTime = timestamp - this.lastTime;
        if (deltaTime > 1000) deltaTime = 16.67; 
        this.lastTime = timestamp;
        
        
        if (!this.paused && !this.isGameOver && !this.gameWon) {
            this.update(16.67); 
        }
        
        this.draw();
        
        requestAnimationFrame(this.loop);
    }
    
    update(deltaTime) {
        if (this.input.getKey('p') || this.input.getKey('P')) {
            this.pause();
            this.input.keys['p'] = false;
            this.input.keys['P'] = false;
            return;
        }
        
        this.player.update();
    
        this.player.bombs.forEach(bomb => bomb.update());
        
        this.enemies.forEach(enemy => enemy.update());
        
        this.explosions.forEach(explosion => explosion.update());
        
        this.powerups.forEach(powerup => powerup.update());
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.map.draw(this.ctx);
        
        this.powerups.forEach(powerup => powerup.draw(this.ctx));
        
        this.player.bombs.forEach(bomb => bomb.draw(this.ctx));
        
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        
        this.player.draw(this.ctx);
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
    }
    
    drawScore() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '16px "Courier New", monospace';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 25);
    }
    
    pause() {
        this.paused = true;
        document.getElementById('pause-screen').classList.remove('hidden');
    }
    
    resume() {
        this.paused = false;
        document.getElementById('pause-screen').classList.add('hidden');
        this.lastTime = performance.now(); 
    }
    
    gameOver() {
        if (this.isGameOver || this.player.invincible > 0) return;
        
        if (this.player.lives > 0) {
            this.player.lives--;
            this.player.invincible = 180; // 3 seconds of invincibility at 60fps
            return;
        }
        
        this.isGameOver = true;
        this.sound.playSound('death');
        this.updateLeaderboard();
        document.getElementById('final-score').textContent = this.score;
        setTimeout(() => {
            document.getElementById('game-over-screen').classList.remove('hidden');
        }, 1500);
    }
    
    winGame() {
        if (this.isGameOver || this.gameWon || this.levelCompleting) return;
        
        if (this.level < this.maxLevel) {
            this.levelCompleting = true;
            setTimeout(() => {
                this.levelComplete();
                this.levelCompleting = false;
            }, 1000);
        } else {
            this.gameWon = true;
            this.score += 5000; 
            this.updateLeaderboard();
            document.getElementById('final-score-win').textContent = this.score;
            setTimeout(() => {
                document.getElementById('win-screen').classList.remove('hidden');
            }, 1500);
        }
    }
    
    levelComplete() {
        this.paused = true;
        this.score += this.level * 100;
        if (window.updateScore) window.updateScore(this.score);
        if (window.showLevelComplete) window.showLevelComplete(this.level + 1);
    }
    
    startNextLevel() {
        this.level++;
        if (window.updateLevelDisplay) window.updateLevelDisplay(this.level);
        
        this.map = new Map(this.level);
        
        // Keep player stats but reset position
        this.player.x = 32;
        this.player.y = 32;
        this.player.targetX = 32;
        this.player.targetY = 32;
        this.player.moving = false;
        this.player.bombs = [];
        
        this.enemies = [];
        this.explosions = [];
        this.powerups = [];
        this.paused = false;
        
        this.createEnemies(3 + Math.floor(this.level * 1.5));
        
        document.getElementById('level-complete-screen').classList.add('hidden');
        this.lastTime = performance.now();
    }
    
    updateLeaderboard() {
        let scores = JSON.parse(localStorage.getItem('bombermanScores')) || [];
        
        scores.push({
            score: this.score,
            date: new Date().toLocaleDateString()
        });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 5);
        localStorage.setItem('bombermanScores', JSON.stringify(scores));
        const updateLeaderboardList = (listId) => {
            const leaderboardList = document.getElementById(listId);
            if (leaderboardList) {
                leaderboardList.innerHTML = '';
                
                scores.forEach((entry, index) => {
                    const li = document.createElement('li');
                    li.textContent = `${entry.score} - ${entry.date}`;
                    if (entry.score === this.score) {
                        li.classList.add('current-score');
                    }
                    leaderboardList.appendChild(li);
                });
            }
        };
        
        updateLeaderboardList('leaderboard-list');
        updateLeaderboardList('leaderboard-list-win');
    }
    
    restart() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('win-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        
        document.getElementById('level-complete-screen').classList.add('hidden');
        
        this.level = 1;
        if (window.updateLevelDisplay) window.updateLevelDisplay(this.level);
        
        this.map = new Map(this.level);
        this.player = new Player(this);
        this.enemies = [];
        this.explosions = [];
        this.powerups = [];
        this.isGameOver = false;
        this.gameWon = false;
        this.paused = false;
        this.score = 0;
        if (window.updateScore) window.updateScore(this.score);
        
        this.createEnemies(3 + Math.floor(this.level * 1.5));
        
        this.lastTime = performance.now();
    }
}