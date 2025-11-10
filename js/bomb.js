// Bomb class
class Bomb {
    constructor(game, x, y, range) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.timer = 120;
        this.range = range;
        this.exploded = false;
        this.animationFrame = 0;
    }
    
    update() {
        this.timer--;
        this.animationFrame++;
        
        if (this.timer <= 0 && !this.exploded) {
            this.explode();
        }
    }
    
    draw(ctx) {
        this.drawBomb(ctx, this.x, this.y);
    }
    
    drawBomb(ctx, x, y) {
        const blinkSpeed = this.timer < 60 ? 4 : 8;
        const isBlinking = Math.floor(this.animationFrame / blinkSpeed) % 2 === 0;
        
        const bodyColor = isBlinking && this.timer < 60 ? '#4a4a4a' : '#2a2a2a';
        ctx.fillStyle = bodyColor;
        
        ctx.fillRect(x + 6, y + 4, 20, 24);  
        ctx.fillRect(x + 4, y + 6, 24, 20); 
        ctx.fillRect(x + 2, y + 10, 28, 12); 
        
        ctx.fillStyle = isBlinking && this.timer < 60 ? '#6a6a6a' : '#4a4a4a';
        ctx.fillRect(x + 8, y + 6, 8, 4);
        ctx.fillRect(x + 6, y + 8, 4, 6);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(x + 18, y + 22, 6, 4);
        ctx.fillRect(x + 20, y + 18, 4, 8);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 14, y + 2, 4, 6);
        ctx.fillRect(x + 15, y + 1, 2, 2);
        
        if (this.animationFrame % 6 < 3) {
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x + 15, y, 2, 2);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(x + 16, y, 1, 1);
        } else {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(x + 15, y, 2, 1);
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(x + 16, y, 1, 1);
        }
        
        if (this.timer < 30 && isBlinking) {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x + 1, y + 5, 30, 22);
            ctx.fillRect(x + 5, y + 1, 22, 30);
            ctx.fillStyle = '#4a2a2a';
            ctx.fillRect(x + 6, y + 4, 20, 24);
            ctx.fillRect(x + 4, y + 6, 24, 20);
        }
    }
    
    explode() {
        this.exploded = true;
        this.game.map.removeBomb(this.x, this.y);
        this.game.sound.playSound('explosion');
        
        this.game.explosions.push(new Explosion(this.game, this.x, this.y, 0));
        
        for (let direction = 1; direction <= 4; direction++) {
            for (let i = 1; i <= this.range; i++) {
                let x = this.x;
                let y = this.y;
                
                switch (direction) {
                    case 1:
                        y -= i * 32;
                        break;
                    case 2:
                        x += i * 32;
                        break;
                    case 3:
                        y += i * 32;
                        break;
                    case 4:
                        x -= i * 32;
                        break;
                }
                
                const tileX = Math.floor(x / 32);
                const tileY = Math.floor(y / 32);
                
                if (tileX < 0 || tileX >= this.game.map.cols || tileY < 0 || tileY >= this.game.map.rows) {
                    continue;
                }
                
                if (this.game.map.grid[tileY][tileX] === 1) { 
                    break;
                }
                
                this.game.explosions.push(new Explosion(this.game, x, y, direction));
                
                if (this.game.map.grid[tileY][tileX] === 2) {
                    break;
                }
            }
        }
        
        const bombIndex = this.game.player.bombs.findIndex(bomb => 
            bomb.x === this.x && bomb.y === this.y
        );
        if (bombIndex !== -1) {
            this.game.player.bombs.splice(bombIndex, 1);
        }
    }
}

class Explosion {
    constructor(game, x, y, direction) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.timer = 30;
        this.direction = direction;
        this.animationFrame = 30 - this.timer;
    }
    
    update() {
        this.timer--;
        this.animationFrame = 30 - this.timer;
        
        if (this.timer <= 0) {
            this.game.explosions = this.game.explosions.filter(exp => exp !== this);
        } else {
           
            if (!this.game.isGameOver && !this.game.gameWon) {
                
                if (checkCollision(this, this.game.player)) {
                    this.game.gameOver();
                }
                
               
                for (let i = this.game.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.game.enemies[i];
                    if (checkCollision(this, enemy)) {
                        enemy.destroy();
                        
                        if (this.game.enemies.length === 0) {
                            this.game.winGame();
                        }
                    }
                }
            }
            
            if (this.timer === 29) { 
                this.game.map.destroyBlock(this.x, this.y);
            }
        }
    }
    
    draw(ctx) {
        this.drawExplosion(ctx, this.x, this.y);
    }
    
    drawExplosion(ctx, x, y) {
        const phase = Math.floor(this.animationFrame / 6); 
        const subFrame = this.animationFrame % 6;
        
        if (this.direction === 0) {
            
            this.drawCenterExplosion(ctx, x, y, phase, subFrame);
        } else {
          
            this.drawDirectionalExplosion(ctx, x, y, phase, subFrame);
        }
    }
    
    drawCenterExplosion(ctx, x, y, phase, subFrame) {
    
        ctx.fillStyle = '#ff6600';
        if (phase < 3) {
            ctx.fillRect(x, y, 32, 32);
        }
        
    
        const coreColors = ['#ffff00', '#ff8800', '#ff4400', '#cc2200', '#880000'];
        ctx.fillStyle = coreColors[Math.min(phase, 4)];
        
        if (phase === 0) {
        
            ctx.fillRect(x + 2, y + 2, 28, 28);
            ctx.fillRect(x + 4, y, 24, 32);
            ctx.fillRect(x, y + 4, 32, 24);
        } else if (phase === 1) {
            ctx.fillRect(x + 1, y + 1, 30, 30);
            ctx.fillRect(x + 3, y, 26, 32);
            ctx.fillRect(x, y + 3, 32, 26);
            ctx.fillStyle = '#ff0000';
            if (subFrame < 3) {
                ctx.fillRect(x + 14, y - 2, 4, 6);
                ctx.fillRect(x + 28, y + 14, 6, 4);
                ctx.fillRect(x + 14, y + 28, 4, 6);
                ctx.fillRect(x - 2, y + 14, 6, 4);
            }
        } else if (phase === 2) {
            
            ctx.fillRect(x + 4, y + 4, 24, 24);
            ctx.fillRect(x + 8, y + 2, 16, 28);
            ctx.fillRect(x + 2, y + 8, 28, 16);
            
        
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 12, y + 12, 8, 8);
        } else if (phase === 3) {
        
            ctx.fillRect(x + 8, y + 8, 16, 16);
            ctx.fillRect(x + 6, y + 12, 20, 8);
            ctx.fillRect(x + 12, y + 6, 8, 20);
        } else {
           
            ctx.fillRect(x + 12, y + 12, 8, 8);
        }
        
    
        if (phase >= 2) {
            ctx.fillStyle = '#666666';
            if (subFrame % 2 === 0) {
                ctx.fillRect(x + 4, y + 4, 2, 2);
                ctx.fillRect(x + 26, y + 6, 2, 2);
                ctx.fillRect(x + 6, y + 26, 2, 2);
                ctx.fillRect(x + 24, y + 24, 2, 2);
            }
        }
    }
    
    drawDirectionalExplosion(ctx, x, y, phase, subFrame) {
       
        const flameColors = ['#ffff00', '#ff6600', '#ff3300', '#cc1100', '#660000'];
        ctx.fillStyle = flameColors[Math.min(phase, 4)];
        
        if (phase < 4) {
            if (this.direction === 1 || this.direction === 3) {
               
                ctx.fillRect(x + 8, y, 16, 32);
                ctx.fillRect(x + 12, y, 8, 32);
                if (phase < 2) {
                    ctx.fillRect(x + 4, y + 4, 24, 24);
                }
            } else {
                
                ctx.fillRect(x, y + 8, 32, 16);
                ctx.fillRect(x, y + 12, 32, 8);
                if (phase < 2) {
                    ctx.fillRect(x + 4, y + 4, 24, 24);
                }
            }
            
            
            if (phase <= 1) {
                ctx.fillStyle = '#ff0000';
                if (subFrame < 3) {
                    
                    if (this.direction === 1 || this.direction === 3) {
                        ctx.fillRect(x + 6, y + 8, 2, 16);
                        ctx.fillRect(x + 24, y + 8, 2, 16);
                    } else {
                        ctx.fillRect(x + 8, y + 6, 16, 2);
                        ctx.fillRect(x + 8, y + 24, 16, 2);
                    }
                }
            }
        }
        
        
        if (phase >= 1 && phase < 4) {
            ctx.fillStyle = subFrame % 2 === 0 ? '#ffaa00' : '#ff6600';
            
            ctx.fillRect(x + (this.animationFrame * 3) % 28 + 2, y + (this.animationFrame * 7) % 28 + 2, 1, 1);
            ctx.fillRect(x + (this.animationFrame * 5) % 28 + 2, y + (this.animationFrame * 11) % 28 + 2, 1, 1);
        }
    }
}