class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.input = new InputHandler();
        this.map = new Map();
        this.player = new Player(this);
        this.enemies = [];
        this.explosions = [];
        this.isGameOver = false;
        this.gameWon = false;
        this.paused = false;
        this.score = 0;
        this.lastTime = 0;
        
        this.createEnemies(4);
        
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
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
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.map.draw(this.ctx);
        
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
        this.isGameOver = true;
        this.updateLeaderboard();
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    winGame() {
        this.gameWon = true;
        this.score += 1000; 
        this.updateLeaderboard();
        document.getElementById('final-score-win').textContent = this.score;
        document.getElementById('win-screen').classList.remove('hidden');
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
        
        this.map = new Map();
        this.player = new Player(this);
        this.enemies = [];
        this.explosions = [];
        this.isGameOver = false;
        this.gameWon = false;
        this.paused = false;
        this.score = 0;
        
        this.createEnemies(3);
        
        this.lastTime = performance.now();
    }
}