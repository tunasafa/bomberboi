class Powerup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type; // 'bombUp', 'rangeUp', 'speedUp'
        this.active = true;
        this.animationTimer = 0;
    }

    update() {
        this.animationTimer++;
        
        // Check collision with player
        if (this.active && checkCollision(this, this.game.player)) {
            this.collect();
        }
    }

    collect() {
        this.active = false;
        
        switch (this.type) {
            case 'bombUp':
                this.game.player.maxBombs++;
                break;
            case 'rangeUp':
                this.game.player.bombRange++;
                break;
            case 'speedUp':
                this.game.player.baseSpeed = Math.min((this.game.player.baseSpeed || 2) + 0.5, 4);
                break;
            case 'extraLife':
                this.game.player.lives = (this.game.player.lives || 0) + 1;
                break;
        }
        
        // Remove from game powerups list
        this.game.powerups = this.game.powerups.filter(p => p !== this);
    }

    draw(ctx) {
        if (!this.active) return;
        
        const floatY = Math.sin(this.animationTimer * 0.1) * 3;
        const drawY = this.y + floatY;
        
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(this.x + 4, drawY + 4, 24, 24);
        
        // Draw icon based on type
        if (this.type === 'bombUp') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 8, drawY + 12, 16, 12);
            ctx.fillRect(this.x + 10, drawY + 10, 12, 16);
            ctx.fillRect(this.x + 14, drawY + 8, 4, 4);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + 14, drawY + 14, 4, 4);
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(this.x + 16, drawY + 4, 4, 4);
        } else if (this.type === 'rangeUp') {
            ctx.fillStyle = '#ff4500';
            ctx.fillRect(this.x + 10, drawY + 14, 12, 10);
            ctx.fillRect(this.x + 14, drawY + 10, 4, 14);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 12, drawY + 16, 8, 6);
        } else if (this.type === 'speedUp') {
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(this.x + 14, drawY + 8, 8, 8);
            ctx.fillRect(this.x + 10, drawY + 16, 12, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 8, drawY + 18, 4, 4);
        } else if (this.type === 'extraLife') {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + 8, drawY + 10, 6, 6);
            ctx.fillRect(this.x + 18, drawY + 10, 6, 6);
            ctx.fillRect(this.x + 6, drawY + 12, 20, 8);
            ctx.fillRect(this.x + 10, drawY + 20, 12, 4);
            ctx.fillRect(this.x + 14, drawY + 24, 4, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 10, drawY + 12, 2, 2);
        }
        
        ctx.restore();
    }
}
