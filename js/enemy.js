const ENEMY_SPRITES = {
  blob: {
    pattern: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,2,1,1,2,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,3,3,3,3,1,1],
      [1,1,1,3,3,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0]
    ],
    colors: ['transparent', '#8B44AC', '#FF69B4', '#4B0082']
  },
  
  spider: {
    pattern: [
      [0,1,0,0,0,0,1,0],
      [1,0,1,2,2,1,0,1],
      [0,1,2,2,2,2,1,0],
      [1,2,2,3,3,2,2,1],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [1,0,1,0,0,1,0,1],
      [0,1,0,0,0,0,1,0]
    ],
    colors: ['transparent', '#8B4513', '#FF4500', '#FFD700']
  },
  
  skull: {
    pattern: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,2,1,1,1,1,2,1],
      [1,1,2,1,1,2,1,1],
      [1,1,1,3,3,1,1,1],
      [1,1,3,1,1,3,1,1],
      [0,1,1,3,3,1,1,0],
      [0,0,1,1,1,1,0,0]
    ],
    colors: ['transparent', '#228B22', '#32CD32', '#000000']
  },
  
  ghost: {
    pattern: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,2,1,1,1,1,2,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,3,3,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1]
    ],
    colors: ['transparent', '#4169E1', '#87CEEB', '#000000']
  },
  
  demon: {
    pattern: [
      [1,0,0,2,2,0,0,1],
      [0,1,2,2,2,2,1,0],
      [0,2,3,2,2,3,2,0],
      [2,2,2,2,2,2,2,2],
      [2,2,0,2,2,0,2,2],
      [2,2,2,0,0,2,2,2],
      [0,2,2,2,2,2,2,0],
      [0,0,2,0,0,2,0,0]
    ],
    colors: ['transparent', '#8B0000', '#DC143C', '#FFD700']
  }
};


class Enemy {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.speed = 1;
    this.direction = Math.floor(Math.random() * 4); 
    this.moveTimer = 0;
    this.alive = true;
    
    
    const spriteTypes = Object.keys(ENEMY_SPRITES);
    this.spriteType = spriteTypes[Math.floor(Math.random() * spriteTypes.length)];
    this.sprite = ENEMY_SPRITES[this.spriteType];
    
    
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.bobOffset = Math.random() * Math.PI * 2; 
  }
  
  update() {
    if (!this.alive) return;
    
    this.moveTimer++;
    this.animationTimer++;
    
    
    if (this.animationTimer % 30 === 0) {
      this.animationFrame = (this.animationFrame + 1) % 2;
    }
    
    
    if (this.moveTimer > 60 || Math.random() < 0.02) {
      this.direction = Math.floor(Math.random() * 4);
      this.moveTimer = 0;
    }
    
    
    const prevX = this.x;
    const prevY = this.y;
    const speed = 1;
    
    switch (this.direction) {
      case 0: 
        this.y -= speed;
        break;
      case 1: 
        this.x += speed;
        break;
      case 2: 
        this.y += speed;
        break;
      case 3: 
        this.x -= speed;
        break;
    }
    
   
    if (!canMove(this.x, this.y, this.width, this.height, this.game.map.grid)) {
      this.x = prevX;
      this.y = prevY;
      this.direction = Math.floor(Math.random() * 4);
    }
    
    
    if (checkCollision(this, this.game.player)) {
      this.game.gameOver();
    }
  }
  
  drawPixelArt(ctx, x, y) {
    const pattern = this.sprite.pattern;
    const colors = this.sprite.colors;
    const pixelSize = 4; 
    
    
    const bobAmount = Math.sin(this.animationTimer * 0.1 + this.bobOffset) * 1;
    const drawY = y + bobAmount;
    
    
    let currentColors = [...colors];
    if (this.animationFrame === 1 && this.spriteType === 'ghost') {
      
      currentColors = colors.map(color => 
        color === 'transparent' ? color : color + '88'
      );
    }
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const colorIndex = pattern[row][col];
        if (colorIndex > 0) {
          ctx.fillStyle = currentColors[colorIndex];
          ctx.fillRect(
            x + col * pixelSize,
            drawY + row * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }
    
    
    if (this.spriteType === 'demon') {
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (this.spriteType === 'ghost') {
      ctx.shadowColor = '#4169E1';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  
  draw(ctx) {
    if (!this.alive) return;
    
    ctx.save();
    
    ctx.imageSmoothingEnabled = false;
    
    this.drawPixelArt(ctx, this.x, this.y);
    
    if (this.game.settings && this.game.settings.retroEffects) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < this.height; i += 2) {
        ctx.fillRect(this.x, this.y + i, this.width, 1);
      }
    }
    
    ctx.restore();
  }
  
  destroy() {
    this.alive = false;
    
    if (this.game.particles) {
      this.createDestructionParticles();
    }
    
    this.game.enemies = this.game.enemies.filter(enemy => enemy !== this);
    
    if (this.game.enemies.length === 0) {
      this.game.winGame();
    }
  }
  
  createDestructionParticles() {
    const particleCount = 8;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const particle = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: this.sprite.colors[1], 
        life: 30,
        maxLife: 30
      };
      
      this.game.particles.push(particle);
    }
  }
}

function getEnemyInfo(enemy) {
  const info = {
    blob: { speed: 1, score: 100, name: "Blob" },
    spider: { speed: 1.2, score: 150, name: "Spider" },
    skull: { speed: 0.8, score: 200, name: "Skull" },
    ghost: { speed: 1.5, score: 300, name: "Ghost" },
    demon: { speed: 1.1, score: 250, name: "Demon" }
  };
  
  return info[enemy.spriteType] || info.blob;
}