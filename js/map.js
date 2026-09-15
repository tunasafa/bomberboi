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
              name: 'Forest', style: 'forest', 
              groundBase: '#2a5d31', groundDark: '#245028', groundDarker: '#1e4422',
              wallBase: '#4a4a4a', wallLight: '#6a6a6a', wallDark: '#3a3a3a', wallEdge: '#2a2a2a', wallHighlight: '#8a8a8a', wallAccent: '#5a5a5a',
              woodBase: '#8B4513', woodLight: '#A0522D', woodDark: '#654321', woodEdge: '#704214', woodAccent: '#4a2c17', woodHighlight: '#CD853F', woodShadow: '#2F1B14'
            },
            { 
              name: 'Desert', style: 'desert', 
              groundBase: '#c2b280', groundDark: '#b0a070', groundDarker: '#9c8c5c',
              wallBase: '#c2a17a', wallLight: '#d2b18a', wallDark: '#a2815a', wallEdge: '#82613a', wallHighlight: '#e2c19a', wallAccent: '#b2916a',
              woodBase: '#9b7653', woodLight: '#ab8663', woodDark: '#7b5633', woodEdge: '#8b6643', woodAccent: '#5b3613', woodHighlight: '#cb9673', woodShadow: '#4b2603'
            },
            { 
              name: 'Ice', style: 'ice', 
              groundBase: '#a0c8d8', groundDark: '#90b8c8', groundDarker: '#80a8b8',
              wallBase: '#7090b8', wallLight: '#80a0c8', wallDark: '#507098', wallEdge: '#406088', wallHighlight: '#90b0d8', wallAccent: '#6080a8',
              woodBase: '#6B8E23', woodLight: '#7BAE33', woodDark: '#4B6E03', woodEdge: '#5B7E13', woodAccent: '#2B4E00', woodHighlight: '#8BCE53', woodShadow: '#1B3E00'
            },
            { 
              name: 'Dungeon', style: 'dungeon', 
              groundBase: '#4a4a5a', groundDark: '#3a3a4a', groundDarker: '#2a2a3a',
              wallBase: '#3a2a4a', wallLight: '#4a3a5a', wallDark: '#2a1a3a', wallEdge: '#1a0a2a', wallHighlight: '#5a4a6a', wallAccent: '#2a1a4a',
              woodBase: '#4B0082', woodLight: '#5B1092', woodDark: '#2B0062', woodEdge: '#3B0072', woodAccent: '#1B0042', woodHighlight: '#6B20A2', woodShadow: '#0B0022'
            },
            { 
              name: 'Hell', style: 'hell', 
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
                this.drawBlock(ctx, tileX, tileY);
            }
        }
    }
}

drawGround(ctx, x, y) {
    switch (this.theme.style) {
        case 'forest': this.drawGrassGround(ctx, x, y); break;
        case 'desert': this.drawSandGround(ctx, x, y); break;
        case 'ice': this.drawSnowGround(ctx, x, y); break;
        case 'dungeon': this.drawCobblestoneGround(ctx, x, y); break;
        case 'hell': this.drawLavaAshGround(ctx, x, y); break;
        default: this.drawGrassGround(ctx, x, y); break;
    }
}

drawWall(ctx, x, y) {
    switch (this.theme.style) {
        case 'forest': this.drawStoneWall(ctx, x, y); break;
        case 'desert': this.drawSandstonePillar(ctx, x, y); break;
        case 'ice': this.drawCrystalWall(ctx, x, y); break;
        case 'dungeon': this.drawObsidianWall(ctx, x, y); break;
        case 'hell': this.drawMagmaPillar(ctx, x, y); break;
        default: this.drawStoneWall(ctx, x, y); break;
    }
}

drawBlock(ctx, x, y) {
    switch (this.theme.style) {
        case 'forest': this.drawWoodCrate(ctx, x, y); break;
        case 'desert': this.drawClayVase(ctx, x, y); break;
        case 'ice': this.drawIceBlock(ctx, x, y); break;
        case 'dungeon': this.drawIronCrate(ctx, x, y); break;
        case 'hell': this.drawBonePile(ctx, x, y); break;
        default: this.drawWoodCrate(ctx, x, y); break;
    }
}

// ==========================================
// GROUND STYLES
// ==========================================

drawGrassGround(ctx, x, y) {
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
    // Tufts of grass
    ctx.fillStyle = this.theme.groundDarker;
    ctx.fillRect(x + 4, y + 4, 2, 4);
    ctx.fillRect(x + 20, y + 12, 2, 4);
    ctx.fillRect(x + 12, y + 24, 2, 4);
    ctx.fillRect(x + 28, y + 8, 2, 4);
}

drawSandGround(ctx, x, y) {
    ctx.fillStyle = this.theme.groundBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Sand ripples (horizontal lines)
    ctx.fillStyle = this.theme.groundDark;
    ctx.fillRect(x, y + 8, this.tileSize, 2);
    ctx.fillRect(x, y + 24, this.tileSize, 2);
    
    // Sparse pebbles
    ctx.fillStyle = this.theme.groundDarker;
    ctx.fillRect(x + 6, y + 12, 2, 2);
    ctx.fillRect(x + 22, y + 6, 2, 2);
    ctx.fillRect(x + 14, y + 28, 4, 2);
}

drawSnowGround(ctx, x, y) {
    ctx.fillStyle = this.theme.groundBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Smooth snow drifts
    ctx.fillStyle = this.theme.groundDark;
    ctx.fillRect(x + 8, y, 16, this.tileSize);
    
    // Icy patches
    ctx.fillStyle = this.theme.groundDarker;
    ctx.fillRect(x + 12, y + 12, 8, 8);
    ctx.fillRect(x + 2, y + 2, 4, 4);
    ctx.fillRect(x + 26, y + 26, 4, 4);
}

drawCobblestoneGround(ctx, x, y) {
    ctx.fillStyle = this.theme.groundDarker;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Irregular cobblestones
    ctx.fillStyle = this.theme.groundBase;
    ctx.fillRect(x + 2, y + 2, 12, 12);
    ctx.fillRect(x + 16, y + 2, 14, 10);
    ctx.fillRect(x + 2, y + 16, 10, 14);
    ctx.fillRect(x + 14, y + 14, 16, 16);
    
    // Stone highlights
    ctx.fillStyle = this.theme.groundDark;
    ctx.fillRect(x + 4, y + 4, 4, 4);
    ctx.fillRect(x + 18, y + 16, 4, 4);
}

drawLavaAshGround(ctx, x, y) {
    ctx.fillStyle = this.theme.groundDarker; // dark ash
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Glowing lava veins
    ctx.fillStyle = '#ff4500'; // literal lava color overriding theme slightly for effect
    ctx.fillRect(x + 8, y, 2, this.tileSize);
    ctx.fillRect(x, y + 16, this.tileSize, 2);
    
    // Hot spots
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(x + 8, y + 16, 4, 4);
    ctx.fillRect(x + 20, y + 4, 2, 2);
    
    // Ash plates
    ctx.fillStyle = this.theme.groundBase;
    ctx.fillRect(x + 2, y + 2, 5, 12);
    ctx.fillRect(x + 12, y + 2, 18, 12);
    ctx.fillRect(x + 2, y + 20, 5, 10);
    ctx.fillRect(x + 12, y + 20, 18, 10);
}

// ==========================================
// WALL STYLES
// ==========================================

drawStoneWall(ctx, x, y) {
    ctx.fillStyle = this.theme.wallBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Large stone bricks (like classic bomberman)
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
    ctx.fillRect(x + 22, y + 9, 1, 1);
    ctx.fillRect(x + 14, y + 25, 1, 1);
}

drawSandstonePillar(ctx, x, y) {
    ctx.fillStyle = this.theme.wallBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Vertical pillar lines
    ctx.fillStyle = this.theme.wallEdge;
    ctx.fillRect(x + 4, y, 2, this.tileSize);
    ctx.fillRect(x + 26, y, 2, this.tileSize);
    
    // Hieroglyphic-style center square
    ctx.fillStyle = this.theme.wallDark;
    ctx.fillRect(x + 8, y + 8, 16, 16);
    ctx.fillStyle = this.theme.wallLight;
    ctx.fillRect(x + 10, y + 10, 12, 12);
    ctx.fillStyle = this.theme.wallAccent;
    ctx.fillRect(x + 14, y + 14, 4, 4);
    
    // Top and bottom bevels
    ctx.fillStyle = this.theme.wallHighlight;
    ctx.fillRect(x, y, this.tileSize, 4);
    ctx.fillStyle = this.theme.wallEdge;
    ctx.fillRect(x, y + 28, this.tileSize, 4);
}

drawCrystalWall(ctx, x, y) {
    // Angular sharp crystals
    ctx.fillStyle = this.theme.wallDark;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = this.theme.wallBase;
    ctx.beginPath();
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x + 32, y + 16);
    ctx.lineTo(x + 16, y + 32);
    ctx.lineTo(x, y + 16);
    ctx.fill();
    
    ctx.fillStyle = this.theme.wallLight;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 4);
    ctx.lineTo(x + 28, y + 16);
    ctx.lineTo(x + 16, y + 28);
    ctx.lineTo(x + 4, y + 16);
    ctx.fill();
    
    // Specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 12, y + 8, 4, 4);
    ctx.fillRect(x + 16, y + 12, 2, 2);
}

drawObsidianWall(ctx, x, y) {
    ctx.fillStyle = this.theme.wallEdge;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Metal plates
    ctx.fillStyle = this.theme.wallBase;
    ctx.fillRect(x + 2, y + 2, 13, 13);
    ctx.fillRect(x + 17, y + 2, 13, 13);
    ctx.fillRect(x + 2, y + 17, 13, 13);
    ctx.fillRect(x + 17, y + 17, 13, 13);
    
    // Metal highlights
    ctx.fillStyle = this.theme.wallLight;
    ctx.fillRect(x + 3, y + 3, 11, 2);
    ctx.fillRect(x + 18, y + 3, 11, 2);
    ctx.fillRect(x + 3, y + 18, 11, 2);
    ctx.fillRect(x + 18, y + 18, 11, 2);
    
    // Rivets
    ctx.fillStyle = this.theme.wallAccent;
    const offset = 4;
    ctx.fillRect(x + offset, y + offset, 2, 2);
    ctx.fillRect(x + 32 - offset - 2, y + offset, 2, 2);
    ctx.fillRect(x + offset, y + 32 - offset - 2, 2, 2);
    ctx.fillRect(x + 32 - offset - 2, y + 32 - offset - 2, 2, 2);
}

drawMagmaPillar(ctx, x, y) {
    ctx.fillStyle = this.theme.wallDark;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Jagged dark rock
    ctx.fillStyle = this.theme.wallBase;
    ctx.fillRect(x + 4, y, 24, this.tileSize);
    ctx.fillStyle = this.theme.wallEdge;
    ctx.fillRect(x + 6, y, 2, this.tileSize);
    ctx.fillRect(x + 24, y, 2, this.tileSize);
    
    // Lava flows over the rock
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(x + 12, y, 4, 16);
    ctx.fillRect(x + 14, y + 16, 4, 12);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(x + 14, y + 4, 2, 8);
    
    ctx.fillStyle = this.theme.wallHighlight;
    ctx.fillRect(x + 20, y + 6, 2, 8);
}

// ==========================================
// BLOCK STYLES
// ==========================================

drawWoodCrate(ctx, x, y) {
    ctx.fillStyle = this.theme.woodBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = this.theme.woodEdge;
    ctx.fillRect(x, y, this.tileSize, 2);
    ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    ctx.fillRect(x, y, 2, this.tileSize);
    ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);

    ctx.fillStyle = this.theme.woodLight;
    ctx.fillRect(x + 2, y + 6, this.tileSize - 4, 4);
    ctx.fillRect(x + 2, y + 14, this.tileSize - 4, 4);
    ctx.fillRect(x + 2, y + 22, this.tileSize - 4, 4);
    
    // Classic diagonal crossbeam
    ctx.fillStyle = this.theme.woodDark;
    for (let i = 2; i < this.tileSize - 2; i += 2) {
        ctx.fillRect(x + i, y + i, 2, 2);
        ctx.fillRect(x + this.tileSize - i - 2, y + i, 2, 2);
    }
}

drawClayVase(ctx, x, y) {
    // Rounded clay pot
    ctx.fillStyle = this.theme.woodBase;
    ctx.beginPath();
    ctx.arc(x + 16, y + 20, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Pot neck and rim
    ctx.fillRect(x + 10, y + 6, 12, 8);
    ctx.fillStyle = this.theme.woodEdge;
    ctx.fillRect(x + 8, y + 4, 16, 4);
    
    // Details
    ctx.fillStyle = this.theme.woodHighlight;
    ctx.beginPath();
    ctx.arc(x + 12, y + 18, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = this.theme.woodDark;
    ctx.fillRect(x + 10, y + 12, 12, 2);
}

drawIceBlock(ctx, x, y) {
    // Translucent-looking ice block
    ctx.fillStyle = this.theme.woodBase;
    ctx.fillRect(x + 2, y + 2, 28, 28);
    
    ctx.fillStyle = this.theme.woodLight;
    ctx.fillRect(x + 4, y + 4, 24, 24);
    
    // Beveled edges
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y + 2, 28, 2);
    ctx.fillRect(x + 2, y + 2, 2, 28);
    
    ctx.fillStyle = this.theme.woodDark;
    ctx.fillRect(x + 2, y + 28, 28, 2);
    ctx.fillRect(x + 28, y + 2, 2, 28);
    
    // Internal cracks/lines
    ctx.fillStyle = this.theme.woodEdge;
    ctx.fillRect(x + 8, y + 8, 2, 12);
    ctx.fillRect(x + 10, y + 14, 8, 2);
    ctx.fillRect(x + 20, y + 20, 6, 2);
}

drawIronCrate(ctx, x, y) {
    // Heavy metal crate
    ctx.fillStyle = this.theme.woodBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = this.theme.woodDark;
    ctx.fillRect(x + 4, y + 4, 24, 24);
    
    ctx.fillStyle = this.theme.woodEdge;
    ctx.fillRect(x + 8, y + 8, 16, 16);
    
    // Diagonal metal beams
    ctx.fillStyle = this.theme.woodLight;
    for (let i = 4; i < 28; i += 2) {
        ctx.fillRect(x + i, y + i, 2, 2);
        ctx.fillRect(x + 30 - i, y + i, 2, 2);
    }
    
    // Solid metal rim
    ctx.fillStyle = this.theme.woodHighlight;
    ctx.fillRect(x, y, this.tileSize, 2);
    ctx.fillRect(x, y, 2, this.tileSize);
}

drawBonePile(ctx, x, y) {
    ctx.fillStyle = this.theme.groundBase;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Scorched brimstone / bone pile
    ctx.fillStyle = this.theme.woodDark;
    ctx.fillRect(x + 4, y + 16, 24, 12);
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 12, 0, Math.PI, true);
    ctx.fill();
    
    // Bone details
    ctx.fillStyle = this.theme.woodLight;
    ctx.fillRect(x + 8, y + 18, 16, 4);
    ctx.fillRect(x + 12, y + 10, 8, 4);
    
    // Skull eyes
    ctx.fillStyle = this.theme.woodEdge;
    ctx.fillRect(x + 10, y + 20, 4, 4);
    ctx.fillRect(x + 18, y + 20, 4, 4);
    ctx.fillRect(x + 14, y + 12, 4, 2);
}
}
