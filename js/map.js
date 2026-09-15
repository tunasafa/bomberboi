// Map system
class Map {
    constructor(level = 1) {
        this.level = level;
        this.tileSize = 32;
        this.rows = 13;
        this.cols = 13;
        
        // Determine theme based on level (every level changes theme)
        const themeIndex = (this.level - 1) % 5;
        const themes = [
            { 
              name: 'Forest', 
              groundBase: '#2a5d31', groundDark: '#245028', groundDarker: '#1e4422',
              wallBase: '#4a4a4a', wallLight: '#6a6a6a', wallDark: '#3a3a3a', wallEdge: '#2a2a2a', wallHighlight: '#8a8a8a', wallAccent: '#5a5a5a',
              woodBase: '#8B4513', woodLight: '#A0522D', woodDark: '#654321', woodEdge: '#704214', woodAccent: '#4a2c17', woodHighlight: '#CD853F', woodShadow: '#2F1B14'
            },
            { 
              name: 'Desert', 
              groundBase: '#c2b280', groundDark: '#b0a070', groundDarker: '#9c8c5c',
              wallBase: '#c2a17a', wallLight: '#d2b18a', wallDark: '#a2815a', wallEdge: '#82613a', wallHighlight: '#e2c19a', wallAccent: '#b2916a',
              woodBase: '#9b7653', woodLight: '#ab8663', woodDark: '#7b5633', woodEdge: '#8b6643', woodAccent: '#5b3613', woodHighlight: '#cb9673', woodShadow: '#4b2603'
            },
            { 
              name: 'Ice', 
              groundBase: '#a0c8d8', groundDark: '#90b8c8', groundDarker: '#80a8b8',
              wallBase: '#7090b8', wallLight: '#80a0c8', wallDark: '#507098', wallEdge: '#406088', wallHighlight: '#90b0d8', wallAccent: '#6080a8',
              woodBase: '#6B8E23', woodLight: '#7BAE33', woodDark: '#4B6E03', woodEdge: '#5B7E13', woodAccent: '#2B4E00', woodHighlight: '#8BCE53', woodShadow: '#1B3E00'
            },
            { 
              name: 'Dungeon', 
              groundBase: '#4a4a5a', groundDark: '#3a3a4a', groundDarker: '#2a2a3a',
              wallBase: '#3a2a4a', wallLight: '#4a3a5a', wallDark: '#2a1a3a', wallEdge: '#1a0a2a', wallHighlight: '#5a4a6a', wallAccent: '#2a1a4a',
              woodBase: '#4B0082', woodLight: '#5B1092', woodDark: '#2B0062', woodEdge: '#3B0072', woodAccent: '#1B0042', woodHighlight: '#6B20A2', woodShadow: '#0B0022'
            },
            { 
              name: 'Hell', 
              groundBase: '#6a1a1a', groundDark: '#5a1515', groundDarker: '#4a1010',
              wallBase: '#2a1a1a', wallLight: '#3a2a2a', wallDark: '#1a0a0a', wallEdge: '#0a0000', wallHighlight: '#4a3a3a', wallAccent: '#1a1111',
              woodBase: '#8B0000', woodLight: '#9B1000', woodDark: '#6B0000', woodEdge: '#7B0000', woodAccent: '#4B0000', woodHighlight: '#AB2000', woodShadow: '#2B0000'
            }
        ];
        this.theme = themes[themeIndex];
        
        this.grid = this.generateMap();
    }
    
    generateMap() {
        const grid = [];
        const density = Math.min(0.25 + (this.level * 0.02), 0.75);
        
        
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                if (x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1) {
                    row.push(1); 
                } else if (x % 2 === 0 && y % 2 === 0) {
                    row.push(1);
                } else if (Math.random() < density && !(x < 3 && y < 3)) {
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
    ctx.fillStyle = this.theme.groundBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    ctx.fillStyle = this.theme.groundDark;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(x + i * 8, y + j * 8, 4, 4);
            }
        }
    }

    ctx.fillStyle = this.theme.groundDarker;
    ctx.fillRect(x + 4, y + 4, 2, 2);
    ctx.fillRect(x + 20, y + 12, 2, 2);
    ctx.fillRect(x + 12, y + 24, 2, 2);
    ctx.fillRect(x + 28, y + 8, 2, 2);
}

drawWall(ctx, x, y) {
    ctx.fillStyle = this.theme.wallBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = this.theme.wallLight;
    ctx.fillRect(x + 2, y + 2, 28, 12);
    ctx.fillRect(x + 2, y + 18, 28, 12);
    
    ctx.fillStyle = this.theme.wallDark;
    ctx.fillRect(x, y + 14, this.tileSize, 2);
    ctx.fillRect(x + 14, y + 2, 2, 12);
    ctx.fillRect(x + 20, y + 18, 2, 12);
    

    ctx.fillStyle = this.theme.wallEdge;
    ctx.fillRect(x, y, this.tileSize, 2);
    ctx.fillRect(x, y, 2, this.tileSize);
  
    ctx.fillStyle = this.theme.wallHighlight;

    ctx.fillRect(x + 3, y + 3, 26, 1);
    ctx.fillRect(x + 3, y + 19, 26, 1);
    ctx.fillRect(x + 3, y + 3, 1, 10);
    ctx.fillRect(x + 3, y + 19, 1, 10);
    
    ctx.fillStyle = this.theme.wallAccent;
    ctx.fillRect(x + 6, y + 6, 1, 1);
    ctx.fillRect(x + 10, y + 8, 1, 1);
    ctx.fillRect(x + 18, y + 5, 1, 1);
    ctx.fillRect(x + 22, y + 9, 1, 1);
    ctx.fillRect(x + 8, y + 22, 1, 1);
    ctx.fillRect(x + 14, y + 25, 1, 1);
    ctx.fillRect(x + 24, y + 23, 1, 1);
}

drawWoodenBlock(ctx, x, y) {
    ctx.fillStyle = this.theme.woodBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = this.theme.woodLight;
    ctx.fillRect(x + 2, y + 2, 28, 28);
    
    ctx.fillStyle = this.theme.woodDark;
    for (let i = 0; i < 8; i++) {
        const grainY = y + 4 + i * 3;
        ctx.fillRect(x + 2, grainY, 28, 1);
        
        if (i % 2 === 0) {
            ctx.fillRect(x + 4, grainY + 1, 24, 1);
        } else {
            ctx.fillRect(x + 6, grainY + 1, 20, 1);
        }
    }
    

    ctx.fillStyle = this.theme.woodEdge;
    ctx.fillRect(x + 8, y + 2, 1, 28);
    ctx.fillRect(x + 16, y + 2, 1, 28);
    ctx.fillRect(x + 24, y + 2, 1, 28);
    
    ctx.fillStyle = this.theme.woodAccent;
    
    ctx.fillRect(x + 12, y + 8, 3, 2);
    ctx.fillRect(x + 13, y + 7, 1, 4);

    ctx.fillRect(x + 20, y + 18, 2, 3);
    ctx.fillRect(x + 19, y + 19, 4, 1);
    
  
    ctx.fillStyle = this.theme.woodHighlight;
    
    ctx.fillRect(x + 3, y + 3, 26, 1);
    ctx.fillRect(x + 3, y + 3, 1, 26);
    
    
    for (let i = 0; i < 4; i++) {
        const highlightY = y + 6 + i * 6;
        ctx.fillRect(x + 4, highlightY, 24, 1);
    }
    
    
    ctx.fillStyle = this.theme.woodShadow;
    
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