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
              name: 'Classic', style: 'forest', 
              groundBase: '#4CAF50', groundDark: '#388E3C', groundDarker: '#2E7D32',
              wallBase: '#BDBDBD', wallLight: '#E0E0E0', wallDark: '#9E9E9E', wallEdge: '#757575', wallHighlight: '#F5F5F5', wallAccent: '#616161',
              woodBase: '#FF9800', woodLight: '#FFB74D', woodDark: '#F57C00', woodEdge: '#E65100', woodAccent: '#EF6C00', woodHighlight: '#FFE0B2', woodShadow: '#BF360C'
            },
            { 
              name: 'Desert', style: 'desert', 
              groundBase: '#FFF59D', groundDark: '#FFF176', groundDarker: '#FFEE58',
              wallBase: '#FAFAFA', wallLight: '#FFFFFF', wallDark: '#E0E0E0', wallEdge: '#BDBDBD', wallHighlight: '#FFFFFF', wallAccent: '#9E9E9E',
              woodBase: '#D84315', woodLight: '#FF5722', woodDark: '#BF360C', woodEdge: '#9E2A0B', woodAccent: '#FF8A65', woodHighlight: '#FFCCBC', woodShadow: '#5D4037'
            },
            { 
              name: 'Ice', style: 'ice', 
              groundBase: '#0288D1', groundDark: '#0277BD', groundDarker: '#01579B',
              wallBase: '#00BCD4', wallLight: '#26C6DA', wallDark: '#00ACC1', wallEdge: '#0097A7', wallHighlight: '#B2EBF2', wallAccent: '#006064',
              woodBase: '#E1F5FE', woodLight: '#FFFFFF', woodDark: '#B3E5FC', woodEdge: '#81D4FA', woodAccent: '#4FC3F7', woodHighlight: '#FFFFFF', woodShadow: '#0288D1'
            },
            { 
              name: 'Dungeon', style: 'dungeon', 
              groundBase: '#455A64', groundDark: '#37474F', groundDarker: '#263238',
              wallBase: '#212121', wallLight: '#424242', wallDark: '#000000', wallEdge: '#000000', wallHighlight: '#616161', wallAccent: '#757575',
              woodBase: '#FDD835', woodLight: '#FFEE58', woodDark: '#FBC02D', woodEdge: '#F9A825', woodAccent: '#F57F17', woodHighlight: '#FFF59D', woodShadow: '#FF6F00'
            },
            { 
              name: 'Hell', style: 'hell', 
              groundBase: '#3E2723', groundDark: '#212121', groundDarker: '#000000',
              wallBase: '#D32F2F', wallLight: '#F44336', wallDark: '#C62828', wallEdge: '#B71C1C', wallHighlight: '#FFCDD2', wallAccent: '#FF8A80',
              woodBase: '#F5F5F5', woodLight: '#FFFFFF', woodDark: '#E0E0E0', woodEdge: '#BDBDBD', woodAccent: '#9E9E9E', woodHighlight: '#FFFFFF', woodShadow: '#424242'
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
