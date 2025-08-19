// Map system
class Map {
    constructor() {
        this.tileSize = 32;
        this.rows = 13;
        this.cols = 13;
        this.grid = this.generateMap();
    }
    
    generateMap() {

        const grid = [];
        
        
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                if (x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1) {
                    row.push(1); 
                } else if (x % 2 === 0 && y % 2 === 0) {
                    row.push(1);
                } else if (Math.random() < 0.3 && !(x < 3 && y < 3)) {
                    row.push(2);
                } else {
                    row.push(0);
                }
            }
            grid.push(row);
        }
        
        grid[1][1] = 0;
        grid[1][2] = 0;
        grid[2][1] = 0;
        
        return grid;
    }
    
    draw(ctx) {
    for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
            const tile = this.grid[y][x];
            const tileX = x * this.tileSize;
            const tileY = y * this.tileSize;
            
            this.drawGround(ctx, tileX, tileY);
            
            if (tile === 1) { 
                this.drawWall(ctx, tileX, tileY);
            } else if (tile === 2) { 
                this.drawWoodenBlock(ctx, tileX, tileY);
            }
        }
    }
}

drawGround(ctx, x, y) {
    ctx.fillStyle = '#2a5d31';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    ctx.fillStyle = '#245028';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(x + i * 8, y + j * 8, 4, 4);
            }
        }
    }

    ctx.fillStyle = '#1e4422';
    ctx.fillRect(x + 4, y + 4, 2, 2);
    ctx.fillRect(x + 20, y + 12, 2, 2);
    ctx.fillRect(x + 12, y + 24, 2, 2);
    ctx.fillRect(x + 28, y + 8, 2, 2);
}

drawWall(ctx, x, y) {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(x + 2, y + 2, 28, 12);
    ctx.fillRect(x + 2, y + 18, 28, 12);
    
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x, y + 14, this.tileSize, 2);
    ctx.fillRect(x + 14, y + 2, 2, 12);
    ctx.fillRect(x + 20, y + 18, 2, 12);
    

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, y, this.tileSize, 2);
    ctx.fillRect(x, y, 2, this.tileSize);
  
    ctx.fillStyle = '#8a8a8a';

    ctx.fillRect(x + 3, y + 3, 26, 1);
    ctx.fillRect(x + 3, y + 19, 26, 1);
    ctx.fillRect(x + 3, y + 3, 1, 10);
    ctx.fillRect(x + 3, y + 19, 1, 10);
    
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(x + 6, y + 6, 1, 1);
    ctx.fillRect(x + 10, y + 8, 1, 1);
    ctx.fillRect(x + 18, y + 5, 1, 1);
    ctx.fillRect(x + 22, y + 9, 1, 1);
    ctx.fillRect(x + 8, y + 22, 1, 1);
    ctx.fillRect(x + 14, y + 25, 1, 1);
    ctx.fillRect(x + 24, y + 23, 1, 1);
}

drawWoodenBlock(ctx, x, y) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x + 2, y + 2, 28, 28);
    
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 8; i++) {
        const grainY = y + 4 + i * 3;
        ctx.fillRect(x + 2, grainY, 28, 1);
        
        if (i % 2 === 0) {
            ctx.fillRect(x + 4, grainY + 1, 24, 1);
        } else {
            ctx.fillRect(x + 6, grainY + 1, 20, 1);
        }
    }
    

    ctx.fillStyle = '#704214';
    ctx.fillRect(x + 8, y + 2, 1, 28);
    ctx.fillRect(x + 16, y + 2, 1, 28);
    ctx.fillRect(x + 24, y + 2, 1, 28);
    
    ctx.fillStyle = '#4a2c17';
    
    ctx.fillRect(x + 12, y + 8, 3, 2);
    ctx.fillRect(x + 13, y + 7, 1, 4);

    ctx.fillRect(x + 20, y + 18, 2, 3);
    ctx.fillRect(x + 19, y + 19, 4, 1);
    
  
    ctx.fillStyle = '#CD853F';
    
    ctx.fillRect(x + 3, y + 3, 26, 1);
    ctx.fillRect(x + 3, y + 3, 1, 26);
    
    
    for (let i = 0; i < 4; i++) {
        const highlightY = y + 6 + i * 6;
        ctx.fillRect(x + 4, highlightY, 24, 1);
    }
    
    
    ctx.fillStyle = '#2F1B14';
    
    ctx.fillRect(x, y, this.tileSize, 1);
    ctx.fillRect(x, y, 1, this.tileSize);
    ctx.fillRect(x, y + 31, this.tileSize, 1);
    ctx.fillRect(x + 31, y, 1, this.tileSize);
    
    
    ctx.fillRect(x + 10, y + 2, 1, 6);
    ctx.fillRect(x + 22, y + 15, 1, 8);
    ctx.fillRect(x + 6, y + 25, 8, 1);
}
    
    destroyBlock(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX >= 0 && tileX < this.cols && tileY >= 0 && tileY < this.rows) {
            if (this.grid[tileY][tileX] === 2) {
                this.grid[tileY][tileX] = 0;
                return true;
            }
        }
        return false;
    }
    
    addBomb(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX >= 0 && tileX < this.cols && tileY >= 0 && tileY < this.rows) {
            if (this.grid[tileY][tileX] === 0) {
                this.grid[tileY][tileX] = 3;
                return true;
            }
        }
        return false;
    }
    
    removeBomb(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX >= 0 && tileX < this.cols && tileY >= 0 && tileY < this.rows) {
            if (this.grid[tileY][tileX] === 3) {
                this.grid[tileY][tileX] = 0;
                return true;
            }
        }
        return false;
    }
}