const PLAYER_SPRITES = {
  down: [
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,5,5,5,5,5,5,1],
        [1,5,2,3,2,3,5,1],
        [4,4,2,2,2,2,4,4],
        [0,4,1,1,1,1,4,0],
        [0,0,1,5,5,1,0,0],
        [0,4,4,0,0,4,4,0]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    },
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,5,5,5,5,5,5,1],
        [1,5,2,3,2,3,5,1],
        [4,4,2,2,2,2,4,4],
        [0,4,1,1,1,1,4,0],
        [0,4,1,5,5,1,4,0],
        [4,4,0,0,0,0,4,4]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    }
  ],
  
  up: [
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [4,4,1,1,1,1,4,4],
        [0,4,1,1,1,1,4,0],
        [0,0,1,1,1,1,0,0],
        [0,4,4,0,0,4,4,0]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    },
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [4,4,1,1,1,1,4,4],
        [0,4,1,1,1,1,4,0],
        [0,4,1,1,1,1,4,0],
        [4,4,0,0,0,0,4,4]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    }
  ],
  
  left: [
    {
      pattern: [
        [0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,1,0],
        [0,1,1,5,5,5,1,0],
        [0,1,5,2,3,2,5,0],
        [0,4,4,2,2,2,5,0],
        [0,0,4,1,1,1,0,0],
        [0,0,1,1,5,1,0,0],
        [0,0,4,4,0,4,4,0]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    },
    {
      pattern: [
        [0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,1,0],
        [0,1,1,5,5,5,1,0],
        [0,1,5,2,3,2,5,0],
        [0,4,4,2,2,2,5,0],
        [0,0,4,1,1,1,0,0],
        [0,4,1,1,5,1,0,0],
        [0,4,4,0,0,0,0,0]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    }
  ],
  
  right: [
    {
      pattern: [
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,5,5,5,1,1,0],
        [0,5,2,3,2,5,1,0],
        [0,5,2,2,2,4,4,0],
        [0,0,1,1,1,4,0,0],
        [0,0,1,5,1,1,0,0],
        [0,4,4,0,4,4,0,0]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    },
    {
      pattern: [
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,5,5,5,1,1,0],
        [0,5,2,3,2,5,1,0],
        [0,5,2,2,2,4,4,0],
        [0,0,1,1,1,4,0,0],
        [0,0,1,5,1,1,4,0],
        [0,0,0,0,0,4,4,0]
      ],
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700']
    }
  ]
};

class Player {
    constructor(game) {
        this.game = game;
        this.width = 32;
        this.height = 32;
        this.x = 32;
        this.y = 32;
        this.bombs = [];
        this.maxBombs = 3;
        this.bombRange = 2;
        this.baseSpeed = 2;
        this.lives = 0;
        this.invincible = 0;
        this.targetX = 32;
        this.targetY = 32;
        this.moving = false;
        
        
        this.direction = 'down'; 
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.walkCycle = 0; 
    }
    
    update() {
        this.animationTimer++;
        if (this.invincible > 0) this.invincible--;
        
        
        if (this.moving) {
            if (this.animationTimer % 15 === 0) { 
                this.animationFrame = (this.animationFrame + 1) % 2;
            }
        } else {
            this.animationFrame = 0; 
        }
        if (this.x === this.targetX && this.y === this.targetY) {
            const currentGridX = Math.floor(this.x / 32);
            const currentGridY = Math.floor(this.y / 32);
            let newTargetX = this.targetX;
            let newTargetY = this.targetY;
            let newDirection = this.direction;
            
            if (this.game.input.getKey('ArrowUp') && !this.moving) {
                newTargetY = (currentGridY - 1) * 32;
                newDirection = 'up';
            } else if (this.game.input.getKey('ArrowDown') && !this.moving) {
                newTargetY = (currentGridY + 1) * 32;
                newDirection = 'down';
            } else if (this.game.input.getKey('ArrowLeft') && !this.moving) {
                newTargetX = (currentGridX - 1) * 32;
                newDirection = 'left';
            } else if (this.game.input.getKey('ArrowRight') && !this.moving) {
                newTargetX = (currentGridX + 1) * 32;
                newDirection = 'right';
            }
            

            this.direction = newDirection;
            
            
            if ((newTargetX !== this.targetX || newTargetY !== this.targetY) &&
                canMove(newTargetX, newTargetY, this.width, this.height, this.game.map.grid)) {
                this.targetX = newTargetX;
                this.targetY = newTargetY;
                this.moving = true;
                this.animationFrame = 0; 
            } else {
                this.moving = false;
            }
        } else {
            
            const speed = this.baseSpeed;
            if (this.x < this.targetX) {
                this.x = Math.min(this.x + speed, this.targetX);
            } else if (this.x > this.targetX) {
                this.x = Math.max(this.x - speed, this.targetX);
            }
            
            if (this.y < this.targetY) {
                this.y = Math.min(this.y + speed, this.targetY);
            } else if (this.y > this.targetY) {
                this.y = Math.max(this.y - speed, this.targetY);
            }
            
            
            if (this.x === this.targetX && this.y === this.targetY) {
                this.moving = false;
                this.animationFrame = 0; 
            }
        }
        
        
        if (this.game.input.getKey(' ') && this.bombs.length < this.maxBombs) {
            const bombX = Math.floor((this.x + this.width / 2) / 32) * 32;
            const bombY = Math.floor((this.y + this.height / 2) / 32) * 32;
            
            
            const bombExists = this.bombs.some(bomb => 
                Math.floor(bomb.x / 32) === Math.floor(bombX / 32) && 
                Math.floor(bomb.y / 32) === Math.floor(bombY / 32)
            );
            
            
            const tileX = Math.floor(bombX / 32);
            const tileY = Math.floor(bombY / 32);
            const isPositionValid = tileX >= 0 && tileX < this.game.map.cols && 
                                  tileY >= 0 && tileY < this.game.map.rows && 
                                  this.game.map.grid[tileY][tileX] === 0;
            
            if (!bombExists && isPositionValid && this.game.map.addBomb(bombX, bombY)) {
                this.bombs.push(new Bomb(this.game, bombX, bombY, this.bombRange));
                this.game.sound.playSound('bomb');
            }
        }
    }
    
    drawPixelArt(ctx, x, y) {
        const sprites = PLAYER_SPRITES[this.direction];
        const currentSprite = sprites[this.animationFrame];
        const pattern = currentSprite.pattern;
        const colors = currentSprite.colors;
        const pixelSize = 4; 
        
        
        let drawY = y;
        if (this.moving) {
            const bounceAmount = Math.sin(this.animationTimer * 0.3) * 0.5;
            drawY = y + bounceAmount;
        }
        
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                const colorIndex = pattern[row][col];
                if (colorIndex > 0) {
                    ctx.fillStyle = colors[colorIndex];
                    ctx.fillRect(
                        x + col * pixelSize,
                        drawY + row * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
        
        
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    draw(ctx) {
        
        ctx.save();
        
        
        ctx.imageSmoothingEnabled = false;
        
        
        if (this.invincible === 0 || Math.floor(this.animationTimer / 6) % 2 === 0) {
            this.drawPixelArt(ctx, this.x, this.y);
            
            if (this.game.settings && this.game.settings.retroEffects) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                for (let i = 0; i < this.height; i += 2) {
                    ctx.fillRect(this.x, this.y + i, this.width, 1);
                }
            }
        }
        
        
        if (this.game.settings && this.game.settings.showBombCount) {
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.font = '8px monospace';
            const bombText = `${this.bombs.length}/${this.maxBombs}`;
            const textX = this.x;
            const textY = this.y - 4;
            ctx.strokeText(bombText, textX, textY);
            ctx.fillText(bombText, textX, textY);
        }
        
        if (this.lives > 0) {
            for (let i = 0; i < this.lives; i++) {
                ctx.fillStyle = '#ff0000';
                const hx = this.x + (i * 10);
                const hy = this.y - 10;
                ctx.fillRect(hx+1, hy+1, 2, 2);
                ctx.fillRect(hx+5, hy+1, 2, 2);
                ctx.fillRect(hx, hy+2, 8, 3);
                ctx.fillRect(hx+1, hy+5, 6, 2);
                ctx.fillRect(hx+3, hy+7, 2, 2);
            }
        }
        
        ctx.restore();
    }
    
    
    getFacingDirection() {
        return this.direction;
    }
    
    isMoving() {
        return this.moving;
    }
}