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
        }
        
        // Remove from game powerups list
        this.game.powerups = this.game.powerups.filter(p => p !== this);
    }

    draw(ctx) {
        if (!this.active) return;
        
        const floatY = Math.sin(this.animationTimer * 0.1) * 3;
        const drawY = this.y + floatY;
        
        ctx.save();
        
        // Draw background circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x + 16, drawY + 16, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon based on type
        if (this.type === 'bombUp') {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x + 16, drawY + 18, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(this.x + 14, drawY + 10, 4, 4);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + 15, drawY + 8, 2, 2);
        } else if (this.type === 'rangeUp') {
            ctx.fillStyle = '#ff4500';
            ctx.fillRect(this.x + 10, drawY + 14, 12, 4);
            ctx.fillRect(this.x + 14, drawY + 10, 4, 12);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 12, drawY + 12, 8, 8);
        } else if (this.type === 'speedUp') {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(this.x + 12, drawY + 20);
            ctx.lineTo(this.x + 16, drawY + 8);
            ctx.lineTo(this.x + 20, drawY + 20);
            ctx.lineTo(this.x + 16, drawY + 16);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
