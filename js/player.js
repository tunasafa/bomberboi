const PLAYER_SPRITES = {
  down: [
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,2,2,2,2,2,2,1],
        [1,2,3,2,2,3,2,1],
        [1,4,2,2,2,2,4,1],
        [0,1,4,5,5,4,1,0],
        [0,0,6,0,0,6,0,0],
        [0,7,7,0,0,7,7,0]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FF1493', '#8B4513', '#000000']
    },
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,2,2,2,2,2,2,1],
        [1,2,3,2,2,3,2,1],
        [1,4,2,2,2,2,4,1],
        [0,1,4,5,5,4,1,0],
        [0,7,7,0,0,7,7,0],
        [7,7,0,0,0,0,7,7]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FF1493', '#8B4513', '#000000']
    }
  ],
  
  up: [
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,1],
        [1,4,2,2,2,2,4,1],
        [0,1,4,4,4,4,1,0],
        [0,0,7,0,0,7,0,0],
        [0,7,7,0,0,7,7,0]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FFD700', '#8B4513', '#000000']
    },
    {
      pattern: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,1],
        [1,4,2,2,2,2,4,1],
        [0,1,4,4,4,4,1,0],
        [0,7,7,0,0,7,7,0],
        [7,7,0,0,0,0,7,7]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FFD700', '#8B4513', '#000000']
    }
  ],
  
  left: [
    {
      pattern: [
        [0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,1,0],
        [0,1,2,2,2,2,1,0],
        [1,2,2,3,2,2,1,0],
        [1,4,2,2,5,2,4,1],
        [0,1,4,4,4,4,1,0],
        [0,0,0,7,7,0,0,0],
        [0,0,7,7,0,0,0,0]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FF1493', '#8B4513', '#000000']
    },
    {
      pattern: [
        [0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,1,0],
        [0,1,2,2,2,2,1,0],
        [1,2,2,3,2,2,1,0],
        [1,4,2,2,5,2,4,1],
        [0,1,4,4,4,4,1,0],
        [0,0,7,7,0,0,0,0],
        [0,7,7,0,0,0,0,0]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FF1493', '#8B4513', '#000000']
    }
  ],
  

  right: [
    {
      pattern: [
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [0,1,2,2,3,2,2,1],
        [1,4,2,5,2,2,4,1],
        [0,1,4,4,4,4,1,0],
        [0,0,0,7,7,0,0,0],
        [0,0,0,0,7,7,0,0]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FF1493', '#8B4513', '#000000']
    },
    {
      pattern: [
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,2,2,2,2,1,0],
        [0,1,2,2,3,2,2,1],
        [1,4,2,5,2,2,4,1],
        [0,1,4,4,4,4,1,0],
        [0,0,0,0,7,7,0,0],
        [0,0,7,7,0,0,0,0]
      ],
      colors: ['transparent', '#FF4500', '#FFDBAC', '#000000', '#DC143C', '#FF1493', '#8B4513', '#000000']
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
            
            const speed = 2;
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
        
        
        this.drawPixelArt(ctx, this.x, this.y);
        
        
        if (this.game.settings && this.game.settings.retroEffects) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            for (let i = 0; i < this.height; i += 2) {
                ctx.fillRect(this.x, this.y + i, this.width, 1);
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
        
        ctx.restore();
    }
    
    
    getFacingDirection() {
        return this.direction;
    }
    
    isMoving() {
        return this.moving;
    }
}