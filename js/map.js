// Seeded pseudo-RNG (mulberry32) for deterministic map generation
function seededRandom(seed) {
    let s = seed | 0;
    return function () {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Map system with 25 Unique Retro Pixel-Art Themes
class GameMap {
    constructor(level = 1) {
        this.level = level;
        this.tileSize = 32;
        this.rows = 13;
        this.cols = 13;
        
        // Offscreen canvas cache for the entire map
        this._cacheCanvas = null;
        this._cacheCtx = null;
        this._cacheDirty = true;
        
        // Determine theme based on level (all 25 levels have unique themes!)
        const themeIndex = (this.level - 1) % 25;
        const themes = GameMap.getThemes();
        this.theme = themes[themeIndex] || themes[0];
        
        this.grid = this.generateMap();
    }

    static getThemes() {
        return [
            // Level 1: Classic Meadow (Darker Rich Wood Texture Crate)
            {
                level: 1, name: 'Classic Meadow', style: 'classic',
                groundBase: '#3E8E41', groundDark: '#337736', groundDarker: '#265C29',
                wallBase: '#546E7A', wallLight: '#78909C', wallDark: '#37474F', wallEdge: '#263238', wallHighlight: '#90A4AE', wallAccent: '#455A64',
                woodBase: '#A0672F', woodLight: '#B87B3E', woodDark: '#754316', woodEdge: '#4E290B', woodAccent: '#5C310C', woodHighlight: '#CF9255', woodShadow: '#361A05'
            },
            // Level 2: Desert Dunes (Terracotta Urn 2.5D Curvy)
            {
                level: 2, name: 'Desert Dunes', style: 'desert',
                groundBase: '#D4B483', groundDark: '#C49F68', groundDarker: '#B38B52',
                wallBase: '#8D6A3E', wallLight: '#B08B57', wallDark: '#5E4322', wallEdge: '#3E2B14', wallHighlight: '#D4AF77', wallAccent: '#4A351B',
                woodBase: '#B85D38', woodLight: '#D9774E', woodDark: '#8C3B1A', woodEdge: '#59230E', woodAccent: '#E8A27E', woodHighlight: '#F2C1A7', woodShadow: '#3B1405'
            },
            // Level 3: Glacial Cavern (Ice Brick Wall)
            {
                level: 3, name: 'Glacial Cavern', style: 'ice',
                groundBase: '#D6ECF7', groundDark: '#BCDDEE', groundDarker: '#9FCBE3',
                wallBase: '#1565C0', wallLight: '#1E88E5', wallDark: '#0D47A1', wallEdge: '#0A2B66', wallHighlight: '#90CAF9', wallAccent: '#E3F2FD',
                woodBase: '#4DD0E1', woodLight: '#80DEEA', woodDark: '#0097A7', woodEdge: '#006064', woodAccent: '#00838F', woodHighlight: '#E0F7FA', woodShadow: '#004D40'
            },
            // Level 4: Castle Dungeon (Lightened Wood Vault Chest + Flagstones)
            {
                level: 4, name: 'Castle Dungeon', style: 'dungeon',
                groundBase: '#546E7A', groundDark: '#455A64', groundDarker: '#37474F',
                wallBase: '#262633', wallLight: '#424254', wallDark: '#171721', wallEdge: '#0D0D14', wallHighlight: '#747491', wallAccent: '#9E9EB8',
                woodBase: '#8D6E63', woodLight: '#A1887F', woodDark: '#6D4C41', woodEdge: '#3E2723', woodAccent: '#FFB300', woodHighlight: '#D7CCC8', woodShadow: '#261C19'
            },
            // Level 5: Volcanic Hell (Continuous Molten Lava Floor + Radiant Yellow Gemstone)
            {
                level: 5, name: 'Volcanic Hell', style: 'hell',
                groundBase: '#B32E24', groundDark: '#620E26', groundDarker: '#3E0A18',
                wallBase: '#373740', wallLight: '#545461', wallDark: '#23232B', wallEdge: '#131317', wallHighlight: '#79798A', wallAccent: '#9595A6',
                woodBase: '#FFD700', woodLight: '#FFFDE7', woodDark: '#D97706', woodEdge: '#78350F', woodAccent: '#F59E0B', woodHighlight: '#FFFFFF', woodShadow: '#1F0A00'
            },
            // Level 6: Mayan Temple (Lightened Jade-Moss Stone Floor + Totem + Coin)
            {
                level: 6, name: 'Mayan Temple', style: 'temple',
                groundBase: '#587B6C', groundDark: '#446355', groundDarker: '#324C41',
                wallBase: '#8C6826', wallLight: '#B0883C', wallDark: '#5E4413', wallEdge: '#3B2907', wallHighlight: '#D6AE58', wallAccent: '#00BFA5',
                woodBase: '#757575', woodLight: '#9E9E9E', woodDark: '#424242', woodEdge: '#212121', woodAccent: '#BDBDBD', woodHighlight: '#E0E0E0', woodShadow: '#1B1B1B'
            },
            // Level 7: Industrial Factory (Contrasting Dark Vulcanized Floor + Simple 2.5D Steel Block Wall)
            {
                level: 7, name: 'Industrial Factory', style: 'factory',
                groundBase: '#262A30', groundDark: '#1C1F24', groundDarker: '#14161A',
                wallBase: '#475569', wallLight: '#64748B', wallDark: '#334155', wallEdge: '#1E293B', wallHighlight: '#94A3B8', wallAccent: '#CBD5E1',
                woodBase: '#FFB300', woodLight: '#FFCA28', woodDark: '#C98200', woodEdge: '#1C1C1C', woodAccent: '#212121', woodHighlight: '#FFE082', woodShadow: '#151515'
            },
            // Level 8: Toxic Sewer (Exhaust Fan Wall + Light Bluish Grey Ground + Green Drum)
            {
                level: 8, name: 'Toxic Sewer', style: 'sewer',
                groundBase: '#90A4AE', groundDark: '#78909C', groundDarker: '#607D8B',
                wallBase: '#37474F', wallLight: '#546E7A', wallDark: '#263238', wallEdge: '#1A2327', wallHighlight: '#00E5FF', wallAccent: '#78909C',
                woodBase: '#1B5E20', woodLight: '#2E7D32', woodDark: '#0D3811', woodEdge: '#061D09', woodAccent: '#76FF03', woodHighlight: '#B2FF59', woodShadow: '#000000'
            },
            // Level 9: Sunken Coral Reef
            {
                level: 9, name: 'Coral Reef', style: 'reef',
                groundBase: '#00695C', groundDark: '#004D40', groundDarker: '#00332C',
                wallBase: '#E0F2F1', wallLight: '#FFFFFF', wallDark: '#B2DFDB', wallEdge: '#80CBC4', wallHighlight: '#E0F7FA', wallAccent: '#00897B',
                woodBase: '#D81B60', woodLight: '#F06292', woodDark: '#880E4F', woodEdge: '#4A002A', woodAccent: '#BA68C8', woodHighlight: '#F8BBD0', woodShadow: '#2E001A'
            },
            // Level 10: Deep Gem Mine (Authentic Earthy Dirt Floor + Bedrock Wall + Big Orange Gem)
            {
                level: 10, name: 'Deep Gem Mine', style: 'mine',
                groundBase: '#6A5137', groundDark: '#5E452E', groundDarker: '#503A26',
                wallBase: '#1E293B', wallLight: '#37474F', wallDark: '#111827', wallEdge: '#0F172A', wallHighlight: '#78909C', wallAccent: '#C084FC',
                woodBase: '#F97316', woodLight: '#FB923C', woodDark: '#C2410C', woodEdge: '#7C2D12', woodAccent: '#FACC15', woodHighlight: '#FEF08A', woodShadow: '#431407'
            },
            // Level 11: Cyber Lab (Lighter Server Computers Wall + Dial Gauge Destructible)
            {
                level: 11, name: 'Cyber Lab', style: 'lab',
                groundBase: '#CFD8DC', groundDark: '#B0BEC5', groundDarker: '#90A4AE',
                wallBase: '#475569', wallLight: '#64748B', wallDark: '#334155', wallEdge: '#1E293B', wallHighlight: '#00E5FF', wallAccent: '#76FF03',
                woodBase: '#37474F', woodLight: '#546E7A', woodDark: '#263238', woodEdge: '#1A2327', woodAccent: '#D50000', woodHighlight: '#FFB300', woodShadow: '#ECEFF1'
            },
            // Level 12: Feudal Japan (Japanese Wood Floor + Ishigaki Grey Brick Wall + Nigiri Sushi)
            {
                level: 12, name: 'Feudal Japan', style: 'japan',
                groundBase: '#C59B63', groundDark: '#B0854E', groundDarker: '#8C6534',
                wallBase: '#475569', wallLight: '#64748B', wallDark: '#334155', wallEdge: '#1E293B', wallHighlight: '#94A3B8', wallAccent: '#CBD5E1',
                woodBase: '#FFFFFF', woodLight: '#FF7043', woodDark: '#1B3B1B', woodEdge: '#1A0A00', woodAccent: '#FF5722', woodHighlight: '#FFE0B2', woodShadow: '#CFD8DC'
            },
            // Level 13: City Streets (Lightened Asphalt Road + Cast-Iron Metal Manhole Wall + Speed Camera Device)
            {
                level: 13, name: 'City Streets', style: 'city',
                groundBase: '#474D54', groundDark: '#353A40', groundDarker: '#25292D',
                wallBase: '#373A40', wallLight: '#52565E', wallDark: '#282A2E', wallEdge: '#18191B', wallHighlight: '#686E78', wallAccent: '#808794',
                woodBase: '#FBBF24', woodLight: '#FEF08A', woodDark: '#18181B', woodEdge: '#141414', woodAccent: '#DC2626', woodHighlight: '#FCA5A5', woodShadow: '#0F172A'
            },
            // Level 14: Pharaoh's Vault (Remade Royal Cobalt Lapis Obelisk + Gilded Egyptian Chest)
            {
                level: 14, name: "Pharaoh's Vault", style: 'vault',
                groundBase: '#F0E2C6', groundDark: '#D6C49F', groundDarker: '#B5A076',
                wallBase: '#0F172A', wallLight: '#2563EB', wallDark: '#1E3A8A', wallEdge: '#8D5B28', wallHighlight: '#FFD700', wallAccent: '#00E5FF',
                woodBase: '#F59E0B', woodLight: '#FBBF24', woodDark: '#B45309', woodEdge: '#78350F', woodAccent: '#DC2626', woodHighlight: '#FEF08A', woodShadow: '#451A03'
            },
            // Level 15: Bee Hive (Honey Floor + Seamless Honeycomb Wall + First Pink Flower)
            {
                level: 15, name: 'Bee Hive', style: 'beehive',
                groundBase: '#FFC107', groundDark: '#FFA000', groundDarker: '#FF8F00',
                wallBase: '#D97706', wallLight: '#F59E0B', wallDark: '#92400E', wallEdge: '#78350F', wallHighlight: '#FEF08A', wallAccent: '#B45309',
                woodBase: '#E91E63', woodLight: '#FF4081', woodDark: '#C2185B', woodEdge: '#880E4F', woodAccent: '#FFEE58', woodHighlight: '#FFFFFF', woodShadow: '#4CAF50'
            },
            // Level 16: Pirate Galleon (Curved Oak Rum Cask with Dark Outer Border Outline)
            {
                level: 16, name: 'Pirate Galleon', style: 'ship',
                groundBase: '#6D4C41', groundDark: '#533830', groundDarker: '#3A241F',
                wallBase: '#26262B', wallLight: '#42424A', wallDark: '#17171A', wallEdge: '#0A0A0C', wallHighlight: '#747480', wallAccent: '#B08B57',
                woodBase: '#8D6E63', woodLight: '#A1887F', woodDark: '#5D4037', woodEdge: '#261C19', woodAccent: '#212121', woodHighlight: '#FFA000', woodShadow: '#1B1311'
            },
            // Level 17: Wild West Outpost (Frontier Trail + Fort Log Palisade + TNT Dynamite Crate)
            {
                level: 17, name: 'Wild West Outpost', style: 'western',
                groundBase: '#C19A6B', groundDark: '#A07848', groundDarker: '#7A5528',
                wallBase: '#5D4037', wallLight: '#795548', wallDark: '#3E2723', wallEdge: '#271612', wallHighlight: '#D7CCC8', wallAccent: '#A1887F',
                woodBase: '#DC2626', woodLight: '#EF4444', woodDark: '#B91C1C', woodEdge: '#7F1D1D', woodAccent: '#F59E0B', woodHighlight: '#FEF08A', woodShadow: '#450A0A'
            },
            // Level 18: Clockwork Steamworks (Cancelled middle squares, clean brass floor)
            {
                level: 18, name: 'Clockwork Steam', style: 'clockwork',
                groundBase: '#8D6E63', groundDark: '#795548', groundDarker: '#5D4037',
                wallBase: '#B85D38', wallLight: '#D9774E', wallDark: '#78351B', wallEdge: '#451D0E', wallHighlight: '#FFB74D', wallAccent: '#FFE082',
                woodBase: '#FFA000', woodLight: '#FFB74D', woodDark: '#C77700', woodEdge: '#4E2E00', woodAccent: '#455A64', woodHighlight: '#FFF8E1', woodShadow: '#2E1A00'
            },
            // Level 19: Vampire Cathedral (Checkered Marble + Halloween Head + Old Carved Cross Tile)
            {
                level: 19, name: 'Vampire Cathedral', style: 'vampire',
                groundBase: '#2D1F2A', groundDark: '#7E2235', groundDarker: '#1A1119',
                wallBase: '#E65100', wallLight: '#F57C00', wallDark: '#BF360C', wallEdge: '#5D1900', wallHighlight: '#FFEE58', wallAccent: '#388E3C',
                woodBase: '#2B2B36', woodLight: '#424254', woodDark: '#171721', woodEdge: '#0D0D14', woodAccent: '#ECEFF1', woodHighlight: '#FFFFFF', woodShadow: '#78909C'
            },
            // Level 20: Space Station (Pressurized Titanium Deck + Simple Bulkhead Wall + Cargo Crate)
            {
                level: 20, name: 'Space Station', style: 'space',
                groundBase: '#1E222D', groundDark: '#141720', groundDarker: '#0B0D12',
                wallBase: '#334155', wallLight: '#475569', wallDark: '#1E293B', wallEdge: '#0F172A', wallHighlight: '#94A3B8', wallAccent: '#00E5FF',
                woodBase: '#0284C7', woodLight: '#38BDF8', woodDark: '#0369A1', woodEdge: '#0C4A6E', woodAccent: '#FACC15', woodHighlight: '#E0F2FE', woodShadow: '#082F49'
            },
            // Level 21: Nuclear Silo (Simple Grayish Concrete Floor + Safety Hazard Blast Wall)
            {
                level: 21, name: 'Nuclear Silo', style: 'nuclear',
                groundBase: '#546E7A', groundDark: '#455A64', groundDarker: '#37474F',
                wallBase: '#FBC02D', wallLight: '#FDD835', wallDark: '#C49000', wallEdge: '#212121', wallHighlight: '#FFEB3B', wallAccent: '#212121',
                woodBase: '#E65100', woodLight: '#F57C00', woodDark: '#A33300', woodEdge: '#4E1600', woodAccent: '#76FF03', woodHighlight: '#FFE082', woodShadow: '#212121'
            },
            // Level 22: Casino Royale (Green Felt Floor + 3D Casino Dice (5) + $1 Round Chip)
            {
                level: 22, name: 'Casino Royale', style: 'casino',
                groundBase: '#2E7D32', groundDark: '#1B5E20', groundDarker: '#0D3811',
                wallBase: '#FFFFFF', wallLight: '#F8FAFC', wallDark: '#CBD5E1', wallEdge: '#94A3B8', wallHighlight: '#DC2626', wallAccent: '#B91C1C',
                woodBase: '#1D4ED8', woodLight: '#3B82F6', woodDark: '#1E40AF', woodEdge: '#172554', woodAccent: '#FFFFFF', woodHighlight: '#DBEAFE', woodShadow: '#0F172A'
            },
            // Level 23: Zen Garden (Raked Sand + Terracotta Brick Wall + Stone Lantern)
            {
                level: 23, name: 'Zen Garden', style: 'zen',
                groundBase: '#D7CCC8', groundDark: '#BCAAA4', groundDarker: '#A1887F',
                wallBase: '#8F310E', wallLight: '#B8531A', wallDark: '#5A0D05', wallEdge: '#2A0502', wallHighlight: '#C05915', wallAccent: '#78220C',
                woodBase: '#607D8B', woodLight: '#78909C', woodDark: '#455A64', woodEdge: '#263238', woodAccent: '#FFB300', woodHighlight: '#CFD8DC', woodShadow: '#1B2327'
            },
            // Level 24: Celestial Temple (Solid Black Starry Floor + Winged Pillar + Solar Relic)
            {
                level: 24, name: 'Celestial Temple', style: 'celestial',
                groundBase: '#000000', groundDark: '#05050A', groundDarker: '#000000',
                wallBase: '#FFFFFF', wallLight: '#FFFFFF', wallDark: '#CFD8DC', wallEdge: '#000000', wallHighlight: '#FFD700', wallAccent: '#00E5FF',
                woodBase: '#F59E0B', woodLight: '#FBBF24', woodDark: '#D97706', woodEdge: '#B45309', woodAccent: '#FEF08A', woodHighlight: '#FFFFFF', woodShadow: '#78350F'
            },
            // Level 25: Golden Emperor's Palace (Royal White Marble + Contrasting Gilded Obsidian Column + Multifaceted Diamond Jewel)
            {
                level: 25, name: 'Emperor Palace', style: 'palace',
                groundBase: '#ECEFF1', groundDark: '#CFD8DC', groundDarker: '#B0BEC5',
                wallBase: '#111827', wallLight: '#1F2937', wallDark: '#0F172A', wallEdge: '#030712', wallHighlight: '#FFD700', wallAccent: '#DC2626',
                woodBase: '#38BDF8', woodLight: '#BAE6FD', woodDark: '#0284C7', woodEdge: '#075985', woodAccent: '#7DD3FC', woodHighlight: '#FFFFFF', woodShadow: '#334155'
            }
        ];
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

    generateMultiplayerMap(seed) {
        const rng = seededRandom(seed);
        const grid = [];
        const density = 0.35;

        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                if (x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1) {
                    row.push(1);
                } else if (x % 2 === 0 && y % 2 === 0) {
                    row.push(1);
                } else if (rng() < density) {
                    row.push(2);
                } else {
                    row.push(0);
                }
            }
            grid.push(row);
        }

        grid[1][1] = 0; grid[1][2] = 0; grid[2][1] = 0;
        grid[11][11] = 0; grid[11][10] = 0; grid[10][11] = 0;
        grid[11][1] = 0; grid[11][2] = 0; grid[10][1] = 0;
        grid[1][11] = 0; grid[1][10] = 0; grid[2][11] = 0;

        this.grid = grid;
        this.invalidate();
        return grid;
    }

    _ensureCache() {
        const width = this.cols * this.tileSize;
        const height = this.rows * this.tileSize;

        if (!this._cacheCanvas) {
            this._cacheCanvas = document.createElement('canvas');
            this._cacheCanvas.width = width;
            this._cacheCanvas.height = height;
            this._cacheCtx = this._cacheCanvas.getContext('2d');
            this._cacheDirty = true;
        }

        if (this._cacheDirty) {
            this._renderFullMapToCache();
            this._cacheDirty = false;
        }
    }

    _renderFullMapToCache() {
        const ctx = this._cacheCtx;
        ctx.clearRect(0, 0, this._cacheCanvas.width, this._cacheCanvas.height);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this._renderTileToCache(x, y);
            }
        }
    }

    _renderTileToCache(tileX, tileY) {
        const ctx = this._cacheCtx;
        const px = tileX * this.tileSize;
        const py = tileY * this.tileSize;
        const val = this.grid[tileY][tileX];

        this.drawGround(ctx, px, py);

        if (val === 1) {
            this.drawWall(ctx, px, py);
        } else if (val === 2) {
            this.drawBlock(ctx, px, py);
        }
    }

    invalidateTile(tileX, tileY) {
        if (this._cacheCtx && !this._cacheDirty) {
            this._renderTileToCache(tileX, tileY);
        }
    }

    invalidate() {
        this._cacheDirty = true;
    }

    draw(ctx) {
        this._ensureCache();
        ctx.drawImage(this._cacheCanvas, 0, 0);
    }

    // ==========================================
    // DISPATCHERS
    // ==========================================

    drawGround(ctx, x, y) {
        switch (this.theme.style) {
            case 'classic': this.drawGrassGround(ctx, x, y); break;
            case 'desert': this.drawSandGround(ctx, x, y); break;
            case 'ice': this.drawSnowGround(ctx, x, y); break;
            case 'dungeon': this.drawCobblestoneGround(ctx, x, y); break;
            case 'hell': this.drawMagmaCrustGround(ctx, x, y); break;
            case 'temple': this.drawTempleGround(ctx, x, y); break;
            case 'factory': this.drawFactoryGround(ctx, x, y); break;
            case 'sewer': this.drawSewerGround(ctx, x, y); break;
            case 'reef': this.drawReefGround(ctx, x, y); break;
            case 'mine': this.drawMineGround(ctx, x, y); break;
            case 'lab': this.drawLabGround(ctx, x, y); break;
            case 'japan': this.drawJapanGround(ctx, x, y); break;
            case 'city': this.drawCityGround(ctx, x, y); break;
            case 'vault': this.drawVaultGround(ctx, x, y); break;
            case 'beehive': this.drawBeehiveGround(ctx, x, y); break;
            case 'ship': this.drawShipGround(ctx, x, y); break;
            case 'western':
            case 'mushroom':
            case 'airship': this.drawWesternGround(ctx, x, y); break;
            case 'clockwork': this.drawClockworkGround(ctx, x, y); break;
            case 'vampire': this.drawVampireGround(ctx, x, y); break;
            case 'space':
            case 'toyland': this.drawSpaceGround(ctx, x, y); break;
            case 'nuclear': this.drawNuclearGround(ctx, x, y); break;
            case 'casino': this.drawCasinoGround(ctx, x, y); break;
            case 'zen':
            case 'library': this.drawZenGround(ctx, x, y); break;
            case 'celestial': this.drawCelestialGround(ctx, x, y); break;
            case 'palace': this.drawPalaceGround(ctx, x, y); break;
            default: this.drawGrassGround(ctx, x, y); break;
        }
    }

    drawWall(ctx, x, y) {
        switch (this.theme.style) {
            case 'classic': this.drawStoneWall(ctx, x, y); break;
            case 'desert': this.drawSandstonePillar(ctx, x, y); break;
            case 'ice': this.drawCrystalWall(ctx, x, y); break;
            case 'dungeon': this.drawObsidianWall(ctx, x, y); break;
            case 'hell': this.drawDarkBasaltPillar(ctx, x, y); break;
            case 'temple': this.drawTempleTotem(ctx, x, y); break;
            case 'factory': this.drawSteelBlockWall(ctx, x, y); break;
            case 'sewer': this.drawSewerExhaustFan(ctx, x, y); break;
            case 'reef': this.drawReefColumn(ctx, x, y); break;
            case 'mine': this.drawMineSupport(ctx, x, y); break;
            case 'lab': this.drawServerComputers(ctx, x, y); break;
            case 'japan': this.drawJapanPagoda(ctx, x, y); break;
            case 'city': this.drawManholeCover(ctx, x, y); break; // Manhole as indestructible wall
            case 'vault': this.drawVaultObelisk(ctx, x, y); break;
            case 'beehive': this.drawHoneycombWall(ctx, x, y); break;
            case 'ship': this.drawShipBulkhead(ctx, x, y); break;
            case 'western':
            case 'mushroom':
            case 'airship': this.drawWesternWall(ctx, x, y); break;
            case 'clockwork': this.drawSteamBoiler(ctx, x, y); break;
            case 'vampire': this.drawHalloweenHead(ctx, x, y); break;
            case 'space':
            case 'toyland': this.drawSpaceBlastDoor(ctx, x, y); break;
            case 'nuclear': this.drawNuclearBlastShield(ctx, x, y); break;
            case 'casino': this.drawCasinoDice(ctx, x, y); break;
            case 'zen':
            case 'library': this.drawZenBrickWall(ctx, x, y); break; // Terracotta brick wall
            case 'celestial': this.drawCelestialColumn(ctx, x, y); break;
            case 'palace': this.drawPalaceColossus(ctx, x, y); break;
            default: this.drawStoneWall(ctx, x, y); break;
        }
    }

    drawBlock(ctx, x, y) {
        switch (this.theme.style) {
            case 'classic': this.drawWoodCrate(ctx, x, y); break;
            case 'desert': this.drawClayVase(ctx, x, y); break;
            case 'ice': this.drawIceBlock(ctx, x, y); break;
            case 'dungeon': this.drawIronCrate(ctx, x, y); break;
            case 'hell': this.drawRubyBlock(ctx, x, y); break;
            case 'temple': this.drawAztecCoin(ctx, x, y); break;
            case 'factory': this.drawHazardCrate(ctx, x, y); break;
            case 'sewer': this.drawBiohazardBarrel(ctx, x, y); break;
            case 'reef': this.drawCoralCluster(ctx, x, y); break;
            case 'mine': this.drawOreVeinRock(ctx, x, y); break;
            case 'lab': this.drawGaugeConsole(ctx, x, y); break;
            case 'japan': this.drawSushiPiece(ctx, x, y); break;
            case 'city': this.drawSpeedCamera(ctx, x, y); break; // Speed camera as destructible block
            case 'vault': this.drawGildedCoffer(ctx, x, y); break;
            case 'beehive': this.drawHoneyFlower(ctx, x, y); break;
            case 'ship': this.drawRumBarrel(ctx, x, y); break;
            case 'western':
            case 'mushroom':
            case 'airship': this.drawWesternBlock(ctx, x, y); break;
            case 'clockwork': this.drawClockworkGears(ctx, x, y); break;
            case 'vampire': this.drawFramedCrossTile(ctx, x, y); break;
            case 'space':
            case 'toyland': this.drawPlasmaBattery(ctx, x, y); break;
            case 'nuclear': this.drawNuclearDrum(ctx, x, y); break;
            case 'casino': this.drawOneDollarChip(ctx, x, y); break;
            case 'zen':
            case 'library': this.drawZenLantern(ctx, x, y); break;
            case 'celestial': this.drawCelestialSunstone(ctx, x, y); break;
            case 'palace': this.drawDiamondJewel(ctx, x, y); break;
            default: this.drawWoodCrate(ctx, x, y); break;
        }
    }

    // ==========================================
    // 1. CLASSIC MEADOW
    // ==========================================
    drawGrassGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundDark;
        ctx.fillRect(x + 4, y + 6, 2, 4);
        ctx.fillRect(x + 6, y + 8, 2, 2);
        ctx.fillRect(x + 18, y + 14, 2, 4);
        ctx.fillRect(x + 20, y + 16, 2, 2);
        ctx.fillRect(x + 10, y + 24, 2, 4);
        ctx.fillRect(x + 26, y + 4, 2, 3);
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x + 4, y + 10, 2, 2);
        ctx.fillRect(x + 18, y + 18, 2, 2);
        ctx.fillRect(x + 10, y + 28, 2, 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 14, y + 6, 2, 2);
        ctx.fillRect(x + 24, y + 22, 2, 2);
    }

    drawStoneWall(ctx, x, y) {
        // Complete solid chiseled stone block - no empty grey top area!
        ctx.fillStyle = this.theme.wallEdge; // #263238
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Capstone blocks (top layer y+2 to y+10)
        // Left capstone (x+2 to x+15)
        ctx.fillStyle = this.theme.wallBase; // #546E7A
        ctx.fillRect(x + 2, y + 2, 13, 8);
        ctx.fillStyle = this.theme.wallLight; // #78909C
        ctx.fillRect(x + 2, y + 2, 13, 2);
        ctx.fillStyle = this.theme.wallHighlight; // #90A4AE
        ctx.fillRect(x + 2, y + 2, 13, 1);
        ctx.fillRect(x + 2, y + 2, 1, 8);
        ctx.fillStyle = this.theme.wallDark; // #37474F
        ctx.fillRect(x + 2, y + 9, 13, 1);
        ctx.fillRect(x + 14, y + 2, 1, 8);

        // Right capstone (x+17 to x+29)
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 17, y + 2, 13, 8);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 17, y + 2, 13, 2);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 17, y + 2, 13, 1);
        ctx.fillRect(x + 17, y + 2, 1, 8);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 17, y + 9, 13, 1);
        ctx.fillRect(x + 29, y + 2, 1, 8);

        // Middle stone layer (y+11 to y+19)
        // Left middle block (x+2 to x+8)
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 2, y + 11, 7, 9);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 2, y + 11, 7, 1);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 2, y + 19, 7, 1);

        // Center middle block (x+11 to x+21)
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 11, y + 11, 11, 9);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 11, y + 11, 11, 1);
        ctx.fillRect(x + 11, y + 11, 1, 9);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 11, y + 19, 11, 1);
        ctx.fillRect(x + 21, y + 11, 1, 9);

        // Right middle block (x+24 to x+29)
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 24, y + 11, 6, 9);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 24, y + 11, 6, 1);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 24, y + 19, 6, 1);

        // Bottom stone layer (y+21 to y+29)
        // Left bottom block (x+2 to x+14)
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 2, y + 21, 13, 9);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 2, y + 21, 13, 1);
        ctx.fillRect(x + 2, y + 21, 1, 9);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 2, y + 29, 13, 1);
        ctx.fillRect(x + 14, y + 21, 1, 9);

        // Right bottom block (x+17 to x+29)
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 17, y + 21, 13, 9);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 17, y + 21, 13, 1);
        ctx.fillRect(x + 17, y + 21, 1, 9);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 17, y + 29, 13, 1);
        ctx.fillRect(x + 29, y + 21, 1, 9);

        // Chiseled rock texture specks
        ctx.fillStyle = this.theme.wallAccent; // #455A64
        ctx.fillRect(x + 5, y + 5, 2, 2);
        ctx.fillRect(x + 22, y + 5, 2, 2);
        ctx.fillRect(x + 15, y + 15, 2, 2);
        ctx.fillRect(x + 6, y + 25, 2, 2);
        ctx.fillRect(x + 23, y + 25, 2, 2);
    }

    drawWoodCrate(ctx, x, y) {
        // Darker Rustic Wooden Crate with Deep Grain & Textures
        ctx.fillStyle = this.theme.woodShadow; // #361A05
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Warm dark timber body
        ctx.fillStyle = this.theme.woodBase; // #A0672F
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Beveled outer timber frame
        ctx.fillStyle = this.theme.woodLight; // #B87B3E
        ctx.fillRect(x + 2, y + 2, 28, 2);
        ctx.fillRect(x + 2, y + 2, 2, 28);
        ctx.fillStyle = this.theme.woodDark; // #754316
        ctx.fillRect(x + 2, y + 28, 28, 2);
        ctx.fillRect(x + 28, y + 2, 2, 28);

        // 3 Horizontal wooden planks with dark recessed seams
        ctx.fillStyle = this.theme.woodEdge; // #4E290B
        ctx.fillRect(x + 2, y + 10, 28, 2);
        ctx.fillRect(x + 2, y + 20, 28, 2);

        // Plank highlights & shadow grooves
        ctx.fillStyle = this.theme.woodHighlight; // #CF9255
        ctx.fillRect(x + 3, y + 12, 26, 1);
        ctx.fillRect(x + 3, y + 22, 26, 1);

        // Authentic wood grain texture lines
        ctx.fillStyle = this.theme.woodDark; // #754316
        ctx.fillRect(x + 5, y + 5, 14, 1);
        ctx.fillRect(x + 12, y + 7, 15, 1);
        ctx.fillRect(x + 4, y + 15, 18, 1);
        ctx.fillRect(x + 15, y + 17, 13, 1);
        ctx.fillRect(x + 6, y + 24, 12, 1);
        ctx.fillRect(x + 10, y + 26, 17, 1);

        // Natural wood knots
        ctx.fillStyle = this.theme.woodAccent; // #5C310C
        ctx.fillRect(x + 7, y + 6, 3, 2);
        ctx.fillRect(x + 22, y + 16, 3, 2);
        ctx.fillRect(x + 8, y + 25, 2, 2);

        // Reinforced corner iron/steel brackets
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 1, 5, 5);
        ctx.fillRect(x + 26, y + 1, 5, 5);
        ctx.fillRect(x + 1, y + 26, 5, 5);
        ctx.fillRect(x + 26, y + 26, 5, 5);

        // Steel bracket corner rivets
        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + 28, y + 2, 2, 2);
        ctx.fillRect(x + 2, y + 28, 2, 2);
        ctx.fillRect(x + 28, y + 28, 2, 2);
    }

    // ==========================================
    // 2. DESERT DUNES (Terracotta Urn 2.5D Detailed)
    // ==========================================
    drawSandGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundDark;
        ctx.fillRect(x + 2, y + 6, 8, 2);
        ctx.fillRect(x + 14, y + 8, 10, 2);
        ctx.fillRect(x + 28, y + 6, 4, 2);
        ctx.fillRect(x + 6, y + 20, 12, 2);
        ctx.fillRect(x + 22, y + 22, 8, 2);
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x + 8, y + 8, 2, 2);
        ctx.fillRect(x + 24, y + 24, 2, 2);
        ctx.fillStyle = '#E8CCA0';
        ctx.fillRect(x + 8, y + 4, 1, 1);
        ctx.fillRect(x + 20, y + 18, 1, 1);
    }

    drawSandstonePillar(ctx, x, y) {
        // Complete solid sandstone monolith pillar - no empty upper space!
        ctx.fillStyle = this.theme.wallEdge; // #3E2B14
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Solid sandstone block body
        ctx.fillStyle = this.theme.wallBase; // #8D6A3E
        ctx.fillRect(x + 2, y + 1, 28, 30);

        // Heavy carved stone capital at top (full coverage, no empty space!)
        ctx.fillStyle = this.theme.wallLight; // #B08B57
        ctx.fillRect(x + 2, y + 1, 28, 7);
        ctx.fillStyle = this.theme.wallHighlight; // #D4AF77
        ctx.fillRect(x + 2, y + 1, 28, 2);
        ctx.fillRect(x + 2, y + 1, 2, 30);

        // Stepped carved cornice
        ctx.fillStyle = this.theme.wallDark; // #5E4322
        ctx.fillRect(x + 2, y + 7, 28, 2);
        ctx.fillRect(x + 2, y + 27, 28, 4);

        // Fluted column reliefs
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 6, y + 9, 2, 18);
        ctx.fillRect(x + 12, y + 9, 2, 18);
        ctx.fillRect(x + 18, y + 9, 2, 18);
        ctx.fillRect(x + 24, y + 9, 2, 18);

        // Center sacred hieroglyph cartouche
        ctx.fillStyle = this.theme.wallAccent; // #4A351B
        ctx.fillRect(x + 13, y + 12, 6, 12);
        ctx.fillStyle = this.theme.wallHighlight; // #D4AF77
        ctx.fillRect(x + 14, y + 14, 4, 3);
        ctx.fillRect(x + 15, y + 19, 2, 3);

        // Base & right shadow
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x + 28, y + 1, 2, 30);
        ctx.fillRect(x + 2, y + 29, 28, 2);
    }

    drawClayVase(ctx, x, y) {
        // Detailed 2.5D Curvy Ancient Terracotta Amphora Urn
        // 1. Soft 2.5D ground contact drop shadow
        ctx.fillStyle = this.theme.woodShadow; // #3B1405
        ctx.fillRect(x + 8, y + 28, 16, 3);
        ctx.fillRect(x + 10, y + 27, 12, 1);

        // 2. Curvy Amphora Outer Silhouette Outline
        ctx.fillStyle = this.theme.woodEdge; // #59230E
        // Flared Rim: y+2..4
        ctx.fillRect(x + 9, y + 2, 14, 1);
        ctx.fillRect(x + 8, y + 3, 16, 2);

        // Graceful Slender Neck: y+5..8
        ctx.fillRect(x + 11, y + 5, 10, 1);
        ctx.fillRect(x + 12, y + 6, 8, 3);

        // Voluptuous Swelling Shoulders: y+9..12
        ctx.fillRect(x + 9, y + 9, 14, 1);
        ctx.fillRect(x + 6, y + 10, 20, 1);
        ctx.fillRect(x + 4, y + 11, 24, 1);
        ctx.fillRect(x + 4, y + 12, 24, 1);

        // Full Round Belly: y+13..17
        ctx.fillRect(x + 3, y + 13, 26, 4);
        ctx.fillRect(x + 4, y + 17, 24, 1);

        // Graceful Tapering Lower Body (S-curve): y+18..22
        ctx.fillRect(x + 5, y + 18, 22, 1);
        ctx.fillRect(x + 7, y + 19, 18, 1);
        ctx.fillRect(x + 9, y + 20, 14, 1);
        ctx.fillRect(x + 10, y + 21, 12, 1);
        ctx.fillRect(x + 11, y + 22, 10, 2);

        // Flaring Pedestal Foot: y+24..27
        ctx.fillRect(x + 9, y + 24, 14, 1);
        ctx.fillRect(x + 8, y + 25, 16, 2);
        ctx.fillRect(x + 9, y + 27, 14, 1);

        // 3D Curving Loop Handles:
        // Left handle
        ctx.fillRect(x + 2, y + 8, 3, 7);
        ctx.fillRect(x + 3, y + 7, 3, 2);
        ctx.fillRect(x + 4, y + 14, 2, 2);
        // Right handle
        ctx.fillRect(x + 27, y + 8, 3, 7);
        ctx.fillRect(x + 26, y + 7, 3, 2);
        ctx.fillRect(x + 26, y + 14, 2, 2);

        // 3. Terracotta Body Fill (Layered inside silhouette)
        ctx.fillStyle = this.theme.woodBase; // #B85D38
        // Neck
        ctx.fillRect(x + 13, y + 5, 6, 4);
        // Shoulders & Belly
        ctx.fillRect(x + 10, y + 9, 12, 1);
        ctx.fillRect(x + 7, y + 10, 18, 1);
        ctx.fillRect(x + 5, y + 11, 22, 2);
        ctx.fillRect(x + 4, y + 13, 24, 4);
        ctx.fillRect(x + 5, y + 17, 22, 1);
        // Lower body
        ctx.fillRect(x + 6, y + 18, 20, 1);
        ctx.fillRect(x + 8, y + 19, 16, 1);
        ctx.fillRect(x + 10, y + 20, 12, 1);
        ctx.fillRect(x + 11, y + 21, 10, 1);
        ctx.fillRect(x + 12, y + 22, 8, 2);
        // Foot
        ctx.fillRect(x + 10, y + 24, 12, 1);
        ctx.fillRect(x + 9, y + 25, 14, 2);

        // 4. Handle Negative Space (See-through to desert sand)
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x + 4, y + 9, 2, 5);
        ctx.fillRect(x + 26, y + 9, 2, 5);

        // Handle 2.5D Shading
        ctx.fillStyle = this.theme.woodLight;
        ctx.fillRect(x + 2, y + 9, 1, 5);
        ctx.fillRect(x + 3, y + 7, 2, 1);
        ctx.fillStyle = this.theme.woodDark;
        ctx.fillRect(x + 29, y + 9, 1, 5);

        // 5. Volumetric 2.5D Body Curvature Shading (Spherical & Cylindrical highlights)
        // Left sunlit curvature
        ctx.fillStyle = this.theme.woodLight; // #D9774E
        ctx.fillRect(x + 13, y + 5, 2, 4);
        ctx.fillRect(x + 10, y + 9, 3, 1);
        ctx.fillRect(x + 7, y + 10, 4, 1);
        ctx.fillRect(x + 5, y + 11, 5, 2);
        ctx.fillRect(x + 4, y + 13, 6, 4);
        ctx.fillRect(x + 5, y + 17, 5, 1);
        ctx.fillRect(x + 6, y + 18, 4, 1);
        ctx.fillRect(x + 8, y + 19, 3, 1);
        ctx.fillRect(x + 10, y + 20, 3, 1);
        ctx.fillRect(x + 9, y + 25, 3, 2);

        // Curving Specular Highlights
        ctx.fillStyle = this.theme.woodHighlight; // #F2C1A7
        ctx.fillRect(x + 7, y + 11, 2, 1);
        ctx.fillRect(x + 6, y + 12, 2, 4);
        ctx.fillRect(x + 7, y + 16, 2, 1);
        ctx.fillRect(x + 13, y + 6, 1, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 7, y + 13, 1, 3);

        // Right shadow curvature
        ctx.fillStyle = this.theme.woodDark; // #8C3B1A
        ctx.fillRect(x + 17, y + 5, 2, 4);
        ctx.fillRect(x + 19, y + 10, 3, 1);
        ctx.fillRect(x + 22, y + 11, 5, 2);
        ctx.fillRect(x + 23, y + 13, 5, 4);
        ctx.fillRect(x + 21, y + 17, 5, 1);
        ctx.fillRect(x + 19, y + 18, 4, 1);
        ctx.fillRect(x + 17, y + 19, 4, 1);
        ctx.fillRect(x + 15, y + 20, 3, 1);
        ctx.fillRect(x + 17, y + 25, 4, 2);

        // Deepest contour shadow on right edge
        ctx.fillStyle = '#66250E';
        ctx.fillRect(x + 26, y + 13, 2, 3);

        // 6. 2.5D Elliptical Flared Rim & Opening Cavity
        ctx.fillStyle = this.theme.woodLight;
        ctx.fillRect(x + 9, y + 3, 14, 1);
        ctx.fillStyle = '#260A02'; // Dark cavity
        ctx.fillRect(x + 11, y + 3, 10, 1);
        ctx.fillStyle = '#110401'; // Blackest interior
        ctx.fillRect(x + 12, y + 3, 8, 1);
        ctx.fillStyle = this.theme.woodBase; // Front lip
        ctx.fillRect(x + 9, y + 4, 14, 1);
        ctx.fillStyle = this.theme.woodHighlight; // Lip highlight
        ctx.fillRect(x + 9, y + 4, 6, 1);
        ctx.fillStyle = this.theme.woodDark; // Lip shadow
        ctx.fillRect(x + 17, y + 4, 6, 1);

        // 7. Curving Glazed Ceramic Frieze (Follows belly curvature)
        ctx.fillStyle = '#D97706'; // Glazed amber band
        ctx.fillRect(x + 5, y + 14, 22, 2);
        ctx.fillStyle = '#FEF08A'; // Glazed highlight
        ctx.fillRect(x + 6, y + 14, 6, 1);
        ctx.fillStyle = this.theme.woodDark;
        ctx.fillRect(x + 21, y + 14, 6, 2);
        // Frieze geometric diamond marks
        ctx.fillStyle = this.theme.woodEdge;
        ctx.fillRect(x + 7, y + 14, 2, 2);
        ctx.fillRect(x + 12, y + 14, 2, 2);
        ctx.fillRect(x + 17, y + 14, 2, 2);
        ctx.fillRect(x + 22, y + 14, 2, 2);
    }

    // ==========================================
    // 3. GLACIAL CAVERN
    // ==========================================
    drawSnowGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundDark;
        ctx.fillRect(x + 2, y + 4, 8, 2);
        ctx.fillRect(x + 4, y + 6, 4, 2);
        ctx.fillRect(x + 16, y + 14, 10, 2);
        ctx.fillRect(x + 18, y + 16, 6, 2);
        ctx.fillRect(x + 8, y + 24, 8, 2);
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x + 6, y + 18, 2, 2);
        ctx.fillRect(x + 26, y + 6, 2, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 12, y + 8, 2, 1);
        ctx.fillRect(x + 22, y + 16, 2, 1);
    }

    drawCrystalWall(ctx, x, y) {
        // Glacial Ice Brick Wall using royal blue / aquamarine ice palette
        ctx.fillStyle = this.theme.wallEdge; // #0A2B66 (Ice mortar seam)
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // 4 Staggered courses of glacial ice bricks
        const drawIceBrick = (bx, by, bw, bh) => {
            // Ice brick base
            ctx.fillStyle = this.theme.wallBase; // #1565C0
            ctx.fillRect(bx, by, bw, bh);

            // Top and left ice bevel highlight
            ctx.fillStyle = this.theme.wallLight; // #1E88E5
            ctx.fillRect(bx, by, bw, 1);
            ctx.fillRect(bx, by, 1, bh);

            // Specular glint
            ctx.fillStyle = this.theme.wallHighlight; // #90CAF9
            ctx.fillRect(bx + 1, by + 1, Math.min(bw - 2, 4), 1);

            // Bottom and right refractive shadow
            ctx.fillStyle = this.theme.wallDark; // #0D47A1
            ctx.fillRect(bx, by + bh - 1, bw, 1);
            ctx.fillRect(bx + bw - 1, by, 1, bh);
        };

        // Course 1 (y+2, h=6): Two large bricks (13px and 14px)
        drawIceBrick(x + 2, y + 2, 13, 6);
        drawIceBrick(x + 16, y + 2, 14, 6);

        // Course 2 (y+9, h=6): Staggered (7px, 13px, 7px)
        drawIceBrick(x + 2, y + 9, 6, 6);
        drawIceBrick(x + 9, y + 9, 13, 6);
        drawIceBrick(x + 23, y + 9, 7, 6);

        // Course 3 (y+16, h=6): Two large bricks (14px and 13px)
        drawIceBrick(x + 2, y + 16, 14, 6);
        drawIceBrick(x + 17, y + 16, 13, 6);

        // Course 4 (y+23, h=7): Staggered (7px, 13px, 7px)
        drawIceBrick(x + 2, y + 23, 6, 7);
        drawIceBrick(x + 9, y + 23, 13, 7);
        drawIceBrick(x + 23, y + 23, 7, 7);

        // Crystalline sparkle specks on brick surfaces
        ctx.fillStyle = this.theme.wallAccent; // #E3F2FD
        ctx.fillRect(x + 5, y + 4, 2, 2);
        ctx.fillRect(x + 15, y + 11, 2, 2);
        ctx.fillRect(x + 22, y + 18, 2, 2);
        ctx.fillRect(x + 14, y + 25, 2, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 5, y + 4, 1, 1);
        ctx.fillRect(x + 15, y + 11, 1, 1);
    }

    drawIceBlock(ctx, x, y) {
        // Multi-Spire Natural Glacial Ice Crystal
        const batches = [["#004D5A", [[21, 24, 1, 1]]], ["#072A40", [[5, 29, 23, 1], [6, 30, 21, 1]]], ["#E0F2FE", [[11, 9, 2, 1], [10, 10, 5, 1], [11, 11, 5, 1], [13, 12, 3, 1], [14, 13, 1, 1]]], ["#00363F", [[26, 9, 1, 1], [27, 11, 1, 1], [28, 13, 1, 1], [29, 15, 1, 13], [25, 28, 5, 1]]], ["#006064", [[23, 10, 1, 18], [26, 12, 1, 2], [26, 14, 2, 2], [26, 16, 3, 2], [25, 18, 4, 10]]], ["#E0F2FA", [[11, 17, 1, 1], [12, 18, 1, 1], [13, 19, 1, 2], [14, 21, 1, 1], [15, 22, 1, 1]]], ["#0097A7", [[19, 13, 1, 1], [18, 14, 2, 3], [17, 17, 1, 1], [19, 17, 1, 1], [17, 18, 2, 1], [17, 19, 3, 9]]], ["#00838F", [[22, 11, 1, 1], [20, 12, 3, 3], [21, 15, 2, 1], [20, 16, 3, 3], [21, 19, 2, 1], [20, 20, 1, 1], [22, 20, 1, 1], [20, 21, 3, 3], [20, 24, 1, 1], [22, 24, 1, 1], [20, 25, 3, 3]]], ["#80DEEA", [[17, 4, 1, 1], [18, 5, 1, 1], [19, 6, 1, 1], [20, 7, 1, 1], [21, 8, 1, 1], [22, 9, 1, 1], [25, 10, 1, 8], [13, 13, 1, 1], [13, 21, 1, 1], [15, 21, 1, 1], [13, 22, 2, 1], [14, 23, 2, 1], [13, 24, 3, 4]]], ["#B2EBF2", [[10, 11, 1, 1], [6, 12, 1, 2], [10, 12, 3, 2], [5, 14, 2, 2], [10, 14, 2, 2], [4, 16, 3, 1], [10, 16, 3, 1], [5, 17, 2, 4], [10, 17, 1, 1], [12, 17, 1, 1], [10, 18, 2, 1], [10, 19, 3, 9], [6, 21, 1, 4]]], ["#4DD0E1", [[17, 5, 1, 1], [17, 6, 2, 1], [17, 7, 3, 1], [17, 8, 4, 1], [17, 9, 5, 1], [17, 10, 6, 1], [17, 11, 5, 1], [17, 12, 3, 1], [18, 13, 1, 1], [17, 16, 1, 1], [18, 17, 1, 1], [19, 18, 1, 1], [20, 19, 1, 1], [21, 20, 1, 1]]], ["#00485C", [[14, 4, 1, 1], [18, 4, 1, 1], [13, 5, 1, 1], [19, 5, 1, 1], [11, 6, 2, 1], [20, 6, 2, 1], [10, 7, 2, 1], [21, 7, 2, 1], [6, 8, 1, 2], [8, 8, 3, 1], [22, 8, 2, 1], [8, 9, 2, 1], [23, 9, 3, 1], [5, 10, 1, 2], [8, 10, 1, 18], [24, 10, 1, 18], [26, 10, 1, 2], [4, 12, 1, 2], [27, 12, 1, 2], [3, 14, 1, 3], [28, 14, 1, 2], [3, 17, 2, 4], [3, 21, 3, 4], [3, 25, 4, 3], [3, 28, 22, 1]]], ["#FFFFFF", [[16, 0, 1, 1], [15, 1, 3, 1], [14, 2, 5, 1], [15, 3, 3, 1], [15, 4, 2, 1], [14, 5, 3, 1], [13, 6, 4, 1], [6, 7, 3, 1], [12, 7, 5, 1], [7, 8, 1, 2], [11, 8, 6, 1], [24, 8, 3, 1], [10, 9, 1, 1], [13, 9, 4, 1], [6, 10, 2, 2], [9, 10, 1, 18], [15, 10, 2, 1], [16, 11, 1, 2], [5, 12, 1, 2], [7, 12, 1, 16], [15, 13, 3, 1], [4, 14, 1, 2], [12, 14, 6, 2], [20, 15, 1, 1], [13, 16, 4, 3], [14, 19, 3, 2], [16, 21, 1, 7], [13, 23, 1, 1]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    // ==========================================
    // 4. CASTLE DUNGEON (Lighter Ground Color, Clean Walkable Floor)
    // ==========================================
    drawCobblestoneGround(ctx, x, y) {
        // Lighter mortar
        ctx.fillStyle = this.theme.groundDarker; // #37474F
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Lighter stone flagstones (clearly reads as ground!)
        ctx.fillStyle = this.theme.groundBase; // #546E7A
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillRect(x + 17, y + 1, 14, 14);
        ctx.fillRect(x + 1, y + 17, 14, 14);
        ctx.fillRect(x + 17, y + 17, 14, 14);

        // Stone bevel highlight
        ctx.fillStyle = '#78909C';
        ctx.fillRect(x + 2, y + 2, 12, 1); ctx.fillRect(x + 2, y + 2, 1, 12);
        ctx.fillRect(x + 18, y + 2, 12, 1); ctx.fillRect(x + 18, y + 2, 1, 12);
        ctx.fillRect(x + 2, y + 18, 12, 1); ctx.fillRect(x + 2, y + 18, 1, 12);
        ctx.fillRect(x + 18, y + 18, 12, 1); ctx.fillRect(x + 18, y + 18, 1, 12);

        // Fine stone speckles
        ctx.fillStyle = this.theme.groundDark; // #455A64
        ctx.fillRect(x + 6, y + 6, 2, 2);
        ctx.fillRect(x + 23, y + 8, 2, 2);
        ctx.fillRect(x + 8, y + 23, 2, 2);
    }

    drawObsidianWall(ctx, x, y) {
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 2, y + 2, 13, 13);
        ctx.fillRect(x + 17, y + 2, 13, 13);
        ctx.fillRect(x + 2, y + 17, 13, 13);
        ctx.fillRect(x + 17, y + 17, 13, 13);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 3, y + 3, 11, 2); ctx.fillRect(x + 3, y + 3, 2, 11);
        ctx.fillRect(x + 18, y + 3, 11, 2); ctx.fillRect(x + 18, y + 3, 2, 11);
        ctx.fillRect(x + 3, y + 18, 11, 2); ctx.fillRect(x + 3, y + 18, 2, 11);
        ctx.fillRect(x + 18, y + 18, 11, 2); ctx.fillRect(x + 18, y + 18, 2, 11);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 4, y + 4, 4, 1);
        ctx.fillRect(x + 19, y + 4, 4, 1);
        ctx.fillStyle = this.theme.wallAccent;
        ctx.fillRect(x + 4, y + 4, 2, 2); ctx.fillRect(x + 26, y + 4, 2, 2);
        ctx.fillRect(x + 4, y + 26, 2, 2); ctx.fillRect(x + 26, y + 26, 2, 2);
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    drawIronCrate(ctx, x, y) {
        // Medieval Dungeon Timber & Iron Vault Chest
        // Ground drop shadow
        ctx.fillStyle = '#171721';
        ctx.fillRect(x + 3, y + 27, 26, 3);

        // Heavy iron outer frame
        ctx.fillStyle = this.theme.woodEdge; // #21140A
        ctx.fillRect(x + 2, y + 4, 28, 24);

        // Arched timber lid (y+4 to y+12)
        ctx.fillStyle = this.theme.woodBase; // Dark oak #543D2B
        ctx.fillRect(x + 3, y + 5, 26, 7);
        ctx.fillStyle = this.theme.woodLight; // #73543C
        ctx.fillRect(x + 4, y + 5, 24, 2);

        // Lower timber chest body (y+13 to y+26)
        ctx.fillStyle = this.theme.woodBase;
        ctx.fillRect(x + 3, y + 13, 26, 13);
        ctx.fillStyle = this.theme.woodDark; // #362416
        ctx.fillRect(x + 3, y + 24, 26, 2);

        // Chest opening seam
        ctx.fillStyle = '#0D0D14';
        ctx.fillRect(x + 2, y + 12, 28, 2);

        // Heavy vertical reinforced iron bands (Black iron straps)
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 5, y + 4, 4, 23);
        ctx.fillRect(x + 23, y + 4, 4, 23);
        ctx.fillStyle = '#455A64'; // Iron band specular edge
        ctx.fillRect(x + 5, y + 4, 1, 23);
        ctx.fillRect(x + 23, y + 4, 1, 23);

        // Heavy corner angle brackets
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 2, y + 4, 3, 4);
        ctx.fillRect(x + 27, y + 4, 3, 4);
        ctx.fillRect(x + 2, y + 23, 3, 4);
        ctx.fillRect(x + 27, y + 23, 3, 4);

        // Silver steel rivets on bands and corners
        ctx.fillStyle = '#ECEFF1';
        ctx.fillRect(x + 6, y + 6, 2, 2);
        ctx.fillRect(x + 24, y + 6, 2, 2);
        ctx.fillRect(x + 6, y + 16, 2, 2);
        ctx.fillRect(x + 24, y + 16, 2, 2);
        ctx.fillRect(x + 6, y + 22, 2, 2);
        ctx.fillRect(x + 24, y + 22, 2, 2);

        // Massive brass padlock in center
        ctx.fillStyle = this.theme.woodAccent; // Brass gold #FFB300
        ctx.fillRect(x + 13, y + 11, 6, 8);
        ctx.fillStyle = this.theme.woodHighlight; // #FFE082
        ctx.fillRect(x + 14, y + 11, 4, 2);
        // Keyhole
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 15, y + 14, 2, 2);
        ctx.fillRect(x + 15, y + 16, 2, 2);
    }

    // ==========================================
    // 5. VOLCANIC HELL (Seamless Continuous Molten Magma Floor)
    // ==========================================
    drawMagmaCrustGround(ctx, x, y) {
        // Seamless Continuous Volcanic Magma Floor (Organic Cracked Basalt Crust & Flowing Magma Veins)
        // 1. Deep Basalt Maroon Bedrock Base (#620E26)
        ctx.fillStyle = "#620E26";
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // 2. Volcanic Red Crust (#B32E24)
        ctx.fillStyle = "#B32E24";
        const crust = [
            3, 0, 1, 1, 7, 0, 2, 2, 5, 1, 2, 1, 9, 1, 4, 1,
            15, 1, 2, 1, 6, 2, 2, 1, 16, 2, 3, 1, 28, 2, 3, 1,
            6, 3, 1, 4, 17, 3, 13, 1, 0, 4, 1, 3, 5, 4, 1, 4,
            14, 4, 1, 3, 18, 4, 10, 1, 31, 4, 1, 3, 7, 5, 1, 2,
            19, 5, 4, 1, 27, 5, 2, 1, 1, 6, 1, 5, 4, 6, 1, 3,
            8, 6, 2, 2, 18, 6, 4, 1, 28, 6, 2, 1, 2, 7, 2, 3,
            10, 7, 4, 1, 16, 7, 2, 4, 20, 7, 1, 1, 29, 7, 1, 2,
            12, 8, 1, 2, 15, 8, 1, 1, 18, 8, 2, 2, 2, 10, 1, 2,
            13, 10, 1, 1, 18, 10, 1, 5, 12, 11, 1, 4, 17, 11, 1, 4,
            27, 11, 4, 1, 0, 12, 1, 1, 19, 12, 1, 3, 26, 12, 2, 1,
            31, 12, 1, 1, 16, 13, 1, 2, 20, 13, 1, 2, 25, 13, 2, 1,
            13, 14, 3, 1, 21, 14, 2, 1, 25, 14, 1, 8, 15, 15, 1, 1,
            21, 15, 1, 1, 24, 15, 1, 7, 3, 16, 1, 2, 6, 16, 1, 4,
            11, 16, 1, 6, 2, 17, 1, 1, 5, 17, 1, 3, 7, 17, 4, 3,
            12, 17, 1, 5, 23, 17, 1, 1, 1, 18, 1, 1, 4, 18, 1, 2,
            0, 19, 1, 1, 3, 19, 1, 1, 26, 19, 1, 3, 31, 19, 1, 1,
            10, 20, 1, 1, 13, 20, 1, 4, 23, 20, 1, 3, 27, 20, 3, 2,
            14, 21, 2, 2, 22, 21, 1, 3, 21, 22, 1, 2, 28, 22, 2, 1,
            0, 23, 1, 3, 20, 23, 1, 1, 31, 23, 1, 3, 10, 25, 4, 1,
            15, 25, 3, 1, 1, 26, 1, 4, 6, 26, 6, 1, 15, 26, 2, 1,
            6, 27, 5, 1, 15, 27, 1, 1, 0, 28, 1, 2, 7, 28, 2, 1,
            14, 28, 1, 3, 19, 28, 5, 1, 31, 28, 1, 2, 8, 29, 2, 1,
            13, 29, 1, 2, 16, 29, 4, 1, 23, 29, 5, 1, 9, 30, 4, 1,
            15, 30, 1, 1, 25, 30, 5, 1, 3, 31, 1, 1, 7, 31, 2, 1
        ];
        for (let i = 0; i < crust.length; i += 4) {
            ctx.fillRect(x + crust[i], y + crust[i+1], crust[i+2], crust[i+3]);
        }

        // 3. Glowing Molten Orange Magma Veins (#EC7523)
        ctx.fillStyle = "#EC7523";
        const lava = [
            0, 0, 3, 1, 4, 0, 1, 1, 9, 0, 7, 1, 30, 0, 2, 2,
            0, 1, 2, 1, 13, 1, 1, 2, 0, 2, 1, 2, 14, 2, 1, 2,
            31, 2, 1, 2, 15, 4, 1, 2, 17, 6, 1, 1, 0, 7, 1, 5,
            14, 7, 2, 1, 18, 7, 2, 1, 31, 7, 1, 5, 13, 8, 2, 1,
            20, 8, 3, 1, 30, 8, 1, 1, 13, 9, 1, 1, 21, 9, 3, 1,
            28, 9, 2, 2, 11, 10, 2, 1, 22, 10, 2, 1, 25, 10, 3, 1,
            1, 11, 1, 3, 10, 11, 2, 1, 23, 11, 1, 1, 26, 11, 1, 1,
            2, 12, 9, 1, 24, 12, 2, 1, 2, 13, 1, 2, 6, 13, 1, 3,
            8, 13, 2, 2, 24, 13, 1, 2, 3, 14, 1, 2, 7, 14, 1, 1,
            10, 14, 2, 1, 23, 14, 1, 2, 4, 15, 1, 3, 11, 15, 4, 1,
            5, 16, 1, 1, 12, 16, 4, 1, 21, 16, 2, 1, 16, 17, 2, 1,
            19, 17, 2, 1, 2, 18, 2, 1, 16, 18, 1, 1, 19, 18, 1, 1,
            1, 19, 2, 1, 17, 19, 2, 1, 0, 20, 1, 3, 2, 20, 1, 1,
            17, 20, 1, 3, 31, 20, 1, 3, 16, 21, 1, 2, 30, 21, 1, 1,
            2, 22, 2, 2, 1, 23, 1, 1, 4, 23, 1, 3, 14, 23, 2, 2,
            18, 23, 2, 3, 29, 23, 2, 1, 3, 24, 1, 1, 5, 24, 1, 6,
            8, 24, 6, 1, 17, 24, 1, 1, 20, 24, 1, 2, 29, 24, 1, 2,
            6, 25, 4, 1, 21, 25, 1, 3, 28, 25, 1, 2, 19, 26, 1, 2,
            22, 26, 1, 2, 27, 26, 1, 1, 18, 27, 1, 2, 20, 27, 1, 1,
            23, 27, 4, 1, 6, 28, 1, 1, 17, 28, 1, 1, 24, 28, 2, 1,
            27, 28, 3, 1, 4, 29, 1, 3, 7, 29, 1, 1, 28, 29, 3, 1,
            0, 30, 4, 1, 8, 30, 1, 1, 30, 30, 2, 2, 0, 31, 3, 1,
            9, 31, 7, 1
        ];
        for (let i = 0; i < lava.length; i += 4) {
            ctx.fillRect(x + lava[i], y + lava[i+1], lava[i+2], lava[i+3]);
        }

        // 4. Radiant Yellow-Gold Vent Core Hotspots (#F9C442)
        ctx.fillStyle = "#F9C442";
        const vents = [
            14, 1, 1, 1, 16, 5, 1, 2, 15, 6, 1, 1, 30, 9, 1, 2,
            24, 10, 1, 2, 25, 11, 1, 1, 11, 12, 1, 2, 3, 13, 3, 1,
            7, 13, 1, 1, 10, 13, 1, 1, 4, 14, 2, 1, 5, 15, 1, 1,
            22, 15, 1, 1, 23, 16, 1, 1, 18, 17, 1, 2, 17, 18, 1, 1,
            1, 20, 1, 3, 2, 21, 1, 1, 30, 22, 1, 1, 16, 23, 2, 1,
            16, 24, 1, 1, 20, 26, 1, 1, 27, 27, 1, 1, 26, 28, 1, 1,
            6, 29, 1, 2, 5, 30, 1, 1, 7, 30, 1, 1
        ];
        for (let i = 0; i < vents.length; i += 4) {
            ctx.fillRect(x + vents[i], y + vents[i+1], vents[i+2], vents[i+3]);
        }
    }

    drawDarkBasaltPillar(ctx, x, y) {
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 2, y + 8, 28, 22);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 2, y + 2, 28, 6);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 2, y + 2, 28, 1);
        ctx.fillRect(x + 2, y + 2, 1, 28);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 2, y + 28, 28, 2);
        ctx.fillRect(x + 28, y + 2, 2, 28);
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x + 2, y + 7, 28, 2);
        ctx.fillStyle = this.theme.wallAccent;
        ctx.fillRect(x + 5, y + 4, 2, 2);
        ctx.fillRect(x + 25, y + 4, 2, 2);
        ctx.fillRect(x + 5, y + 24, 2, 2);
        ctx.fillRect(x + 25, y + 24, 2, 2);
        ctx.fillRect(x + 13, y + 15, 6, 6);
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 14, y + 16, 4, 4);
    }

    drawRubyBlock(ctx, x, y) {
        // Fragile Clear Crystal Yellow Gemstone with Fracture Fissures
        const batches = [["#1F0A00", [[4, 28, 6, 1], [23, 28, 6, 1]]], ["#120500", [[3, 29, 27, 1], [6, 30, 21, 1]]], ["#FFF9C4", [[6, 10, 2, 1], [6, 11, 4, 1], [6, 12, 3, 5], [6, 17, 2, 1], [6, 18, 1, 3]]], ["#B45309", [[27, 9, 1, 1], [24, 10, 4, 4], [25, 14, 3, 1], [24, 15, 4, 6], [20, 19, 1, 1], [19, 20, 1, 2], [18, 22, 1, 1]]], ["#92400E", [[20, 20, 4, 1], [20, 21, 8, 1], [19, 22, 8, 1], [19, 23, 7, 1], [19, 24, 6, 1], [20, 25, 4, 1], [20, 26, 3, 1], [21, 27, 1, 1]]], ["#FFD700", [[20, 10, 1, 1], [19, 11, 2, 3], [12, 13, 1, 1], [12, 14, 2, 1], [11, 15, 2, 1], [14, 15, 1, 1], [16, 15, 4, 1], [11, 16, 1, 1], [19, 16, 1, 1], [11, 18, 1, 2], [8, 19, 2, 1], [7, 20, 1, 1]]], ["#F59E0B", [[13, 16, 2, 1], [16, 16, 3, 1], [12, 17, 3, 1], [12, 18, 2, 2], [15, 18, 1, 1], [15, 19, 2, 1], [8, 20, 5, 1], [14, 20, 3, 2], [6, 21, 7, 1], [6, 22, 6, 1], [7, 23, 5, 1], [8, 24, 3, 2], [9, 26, 1, 1]]], ["#FEF08A", [[22, 5, 2, 1], [21, 6, 4, 1], [21, 7, 5, 1], [19, 8, 8, 1], [20, 9, 7, 1], [10, 11, 1, 1], [9, 12, 2, 3], [23, 14, 2, 1], [9, 15, 1, 2], [21, 15, 2, 1], [8, 17, 2, 1], [16, 17, 2, 1], [7, 19, 1, 1], [13, 21, 1, 1], [12, 22, 1, 2], [11, 24, 1, 2]]], ["#D97706", [[21, 10, 3, 4], [21, 14, 2, 1], [20, 15, 1, 1], [23, 15, 1, 1], [20, 16, 4, 1], [18, 17, 6, 1], [16, 18, 8, 1], [17, 19, 3, 1], [21, 19, 3, 1], [17, 20, 2, 2], [13, 22, 5, 1], [13, 23, 6, 1], [12, 24, 7, 1], [12, 25, 8, 1], [10, 26, 10, 1], [10, 27, 11, 1]]], ["#FFFFFF", [[10, 4, 13, 1], [11, 5, 11, 1], [11, 6, 10, 1], [8, 7, 1, 1], [12, 7, 9, 1], [9, 8, 1, 1], [12, 8, 1, 1], [14, 8, 1, 1], [5, 9, 3, 1], [10, 9, 6, 1], [5, 10, 1, 12], [8, 10, 10, 1], [11, 11, 1, 4], [13, 11, 5, 2], [14, 13, 4, 1], [14, 14, 5, 1], [10, 15, 1, 5], [13, 15, 1, 1], [15, 15, 1, 2], [12, 16, 1, 1]]], ["#FFFDE7", [[9, 5, 2, 1], [8, 6, 3, 1], [7, 7, 1, 1], [9, 7, 3, 1], [6, 8, 3, 1], [10, 8, 2, 1], [13, 8, 1, 1], [15, 8, 4, 1], [8, 9, 2, 1], [16, 9, 4, 1], [18, 10, 2, 1], [12, 11, 1, 2], [18, 11, 1, 3], [13, 13, 1, 1], [19, 14, 2, 1], [11, 17, 1, 1], [15, 17, 1, 1], [7, 18, 3, 1], [14, 18, 1, 2], [13, 20, 1, 1]]], ["#78350F", [[10, 3, 13, 1], [9, 4, 1, 1], [23, 4, 1, 1], [8, 5, 1, 1], [24, 5, 1, 1], [7, 6, 1, 1], [25, 6, 1, 1], [6, 7, 1, 1], [26, 7, 1, 1], [5, 8, 1, 1], [27, 8, 1, 1], [4, 9, 1, 13], [28, 9, 1, 13], [4, 22, 2, 1], [27, 22, 2, 1], [5, 23, 2, 1], [26, 23, 2, 1], [6, 24, 2, 1], [25, 24, 2, 1], [7, 25, 1, 1], [24, 25, 2, 1], [8, 26, 1, 1], [23, 26, 2, 1], [9, 27, 1, 1], [22, 27, 2, 1], [10, 28, 13, 1]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    // ==========================================
    // 6. MAYAN TEMPLE (Grey Round Aztec Coin Destructible)
    // ==========================================
    drawTempleGround(ctx, x, y) {
        // Mesoamerican lightened jade-moss stone pavers
        ctx.fillStyle = this.theme.groundDarker; // #283E34
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // #4A6B5D
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.fillStyle = this.theme.groundDark; // #385549
        ctx.fillRect(x + 3, y + 3, 5, 5);
        ctx.fillRect(x + 24, y + 3, 5, 5);
        ctx.fillRect(x + 3, y + 24, 5, 5);
        ctx.fillRect(x + 24, y + 24, 5, 5);
        ctx.fillRect(x + 12, y + 12, 8, 8);
        ctx.fillStyle = '#7E9F90'; // Lightened stone bevel highlight
        ctx.fillRect(x + 2, y + 2, 28, 1);
        ctx.fillRect(x + 2, y + 2, 1, 28);
        ctx.fillStyle = '#00BFA5'; // Glowing jade inlay glint
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    drawTempleTotem(ctx, x, y) {
        // Detailed 3D Mayan Stele Deity Totem with Jade Plumes, Snout, Fangs & Relief Plinth
        const batches = [["#B8860B", [[17, 9, 2, 5], [18, 14, 1, 1], [17, 15, 2, 1]]], ["#FFD700", [[19, 5, 11, 2], [16, 9, 1, 7], [8, 12, 1, 1], [23, 12, 1, 1]]], ["#D6AE58", [[8, 1, 2, 2], [14, 1, 2, 2], [20, 1, 2, 2], [26, 1, 2, 2], [1, 23, 30, 2], [0, 28, 32, 2]]], ["#004D40", [[7, 3, 1, 1], [13, 3, 1, 1], [19, 3, 1, 1], [25, 3, 1, 1], [25, 7, 2, 1], [27, 8, 2, 1]]], ["#241703", [[0, 0, 32, 1], [0, 1, 1, 27], [31, 1, 1, 27], [5, 25, 3, 2], [11, 25, 3, 2], [18, 25, 3, 2], [24, 25, 3, 2]]], ["#5E4413", [[1, 6, 1, 17], [30, 6, 1, 17], [14, 14, 1, 1], [17, 14, 1, 1], [6, 20, 2, 2], [24, 20, 2, 2], [6, 22, 20, 1]]], ["#FFE082", [[2, 5, 11, 2], [13, 9, 3, 1], [13, 10, 1, 1], [15, 10, 1, 1], [13, 11, 3, 3], [13, 14, 1, 1], [15, 14, 1, 1], [13, 15, 3, 1]]], ["#3B2907", [[28, 1, 3, 4], [30, 5, 1, 1], [27, 7, 3, 1], [29, 8, 1, 2], [28, 10, 2, 5], [27, 15, 3, 1], [28, 16, 2, 6], [27, 22, 3, 1], [28, 25, 3, 3], [0, 30, 32, 2]]], ["#B0883C", [[1, 1, 3, 4], [1, 5, 1, 1], [2, 7, 3, 1], [2, 8, 1, 2], [2, 10, 2, 5], [2, 15, 3, 1], [2, 16, 4, 1], [9, 16, 4, 1], [19, 16, 4, 1], [26, 16, 2, 1], [2, 17, 2, 5], [2, 22, 3, 1], [1, 25, 3, 3]]], ["#FFFFFF", [[5, 1, 1, 1], [11, 1, 1, 1], [17, 1, 1, 1], [23, 1, 1, 1], [15, 5, 1, 1], [14, 10, 1, 1], [8, 11, 1, 1], [23, 11, 1, 1], [6, 16, 3, 2], [13, 16, 6, 2], [23, 16, 3, 2], [7, 18, 1, 2], [14, 18, 1, 2], [17, 18, 1, 2], [24, 18, 1, 2]]], ["#1DE9B6", [[6, 1, 1, 1], [12, 1, 1, 1], [18, 1, 1, 1], [24, 1, 1, 1], [5, 2, 2, 2], [11, 2, 2, 2], [17, 2, 2, 2], [23, 2, 2, 2], [14, 5, 1, 1], [16, 5, 2, 1], [14, 6, 4, 1], [5, 8, 12, 1], [7, 11, 1, 2], [9, 11, 1, 2], [22, 11, 1, 2], [24, 11, 1, 2]]], ["#8C6826", [[8, 3, 2, 2], [14, 3, 2, 2], [20, 3, 2, 2], [26, 3, 2, 2], [7, 7, 18, 1], [5, 15, 8, 1], [19, 15, 8, 1], [8, 20, 16, 2], [5, 22, 1, 1], [26, 22, 1, 1], [4, 25, 1, 2], [8, 25, 3, 2], [14, 25, 4, 2], [21, 25, 3, 2], [27, 25, 1, 2], [4, 27, 24, 1]]], ["#180D00", [[4, 10, 9, 1], [19, 10, 9, 1], [4, 11, 2, 3], [11, 11, 2, 3], [19, 11, 2, 3], [26, 11, 2, 3], [4, 14, 9, 1], [19, 14, 9, 1], [4, 17, 2, 1], [9, 17, 4, 1], [19, 17, 4, 1], [26, 17, 2, 1], [4, 18, 3, 2], [8, 18, 6, 2], [15, 18, 2, 2], [18, 18, 6, 2], [25, 18, 3, 2], [4, 20, 2, 2], [26, 20, 2, 2]]], ["#00BFA5", [[4, 1, 1, 3], [7, 1, 1, 2], [10, 1, 1, 3], [13, 1, 1, 2], [16, 1, 1, 3], [19, 1, 1, 2], [22, 1, 1, 3], [25, 1, 1, 2], [4, 4, 4, 1], [10, 4, 4, 1], [16, 4, 4, 1], [22, 4, 4, 1], [13, 5, 1, 2], [18, 5, 1, 2], [5, 7, 2, 1], [3, 8, 2, 1], [17, 8, 10, 1], [3, 9, 10, 1], [19, 9, 10, 1], [6, 11, 1, 2], [10, 11, 1, 2], [21, 11, 1, 2], [25, 11, 1, 2], [6, 13, 5, 1], [21, 13, 5, 1]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    drawAztecCoin(ctx, x, y) {
        // Detailed 3D Round Aztec Stone Calendar Medallion with Extruded Cylinder & Jade Gems
        const batches = [["#FFFFFF", [[10, 4, 2, 1]]], ["#121212", [[14, 12, 4, 4]]], ["#1DE9B6", [[14, 7, 1, 1], [8, 12, 1, 1], [20, 12, 1, 1], [14, 17, 1, 1]]], ["#00BFA5", [[15, 8, 1, 1], [9, 13, 1, 1], [21, 13, 1, 1], [15, 18, 1, 1]]], ["#B8860B", [[16, 9, 1, 1], [10, 14, 1, 1], [22, 14, 1, 1], [16, 19, 1, 1]]], ["#101A14", [[9, 27, 1, 1], [22, 27, 1, 1], [5, 28, 7, 1], [20, 28, 7, 1], [5, 29, 22, 1], [9, 30, 14, 1]]], ["#1A2820", [[5, 27, 4, 1], [23, 27, 4, 1], [3, 28, 2, 2], [27, 28, 2, 2], [5, 30, 4, 1], [23, 30, 4, 1], [9, 31, 14, 1]]], ["#E0E0E0", [[13, 3, 6, 1], [12, 4, 1, 1], [19, 4, 3, 1], [9, 5, 1, 1], [22, 5, 1, 1], [7, 6, 2, 1], [6, 7, 1, 2], [5, 9, 1, 2], [4, 11, 1, 6], [5, 17, 1, 2], [6, 19, 1, 2]]], ["#616161", [[4, 17, 1, 1], [27, 17, 1, 1], [5, 19, 1, 1], [26, 19, 1, 1], [8, 22, 1, 1], [23, 22, 1, 1], [9, 23, 1, 1], [22, 23, 1, 1], [10, 24, 3, 1], [19, 24, 3, 1], [13, 25, 6, 1]]], ["#BDBDBD", [[15, 4, 2, 1], [7, 7, 1, 1], [23, 7, 1, 1], [8, 8, 1, 1], [24, 8, 1, 1], [18, 11, 1, 5], [5, 13, 1, 2], [26, 13, 1, 2], [13, 16, 6, 1], [7, 19, 1, 1], [23, 19, 1, 1], [8, 20, 1, 1], [24, 20, 1, 1], [15, 23, 2, 1]]], ["#9E9E9E", [[17, 8, 1, 1], [12, 9, 2, 1], [17, 9, 3, 1], [11, 10, 10, 1], [10, 11, 3, 1], [19, 11, 3, 1], [11, 12, 2, 3], [19, 12, 1, 3], [10, 15, 3, 1], [19, 15, 3, 1], [11, 16, 2, 1], [19, 16, 2, 1], [12, 17, 2, 1], [17, 17, 3, 1], [17, 18, 1, 1]]], ["#FFD700", [[15, 7, 2, 1], [14, 8, 1, 1], [16, 8, 1, 1], [14, 9, 2, 1], [9, 12, 2, 1], [21, 12, 2, 1], [8, 13, 1, 1], [10, 13, 1, 1], [20, 13, 1, 1], [22, 13, 1, 1], [8, 14, 2, 1], [20, 14, 2, 1], [15, 17, 2, 1], [14, 18, 1, 1], [16, 18, 1, 1], [14, 19, 2, 1]]], ["#303030", [[15, 5, 2, 1], [13, 6, 6, 1], [11, 7, 2, 1], [19, 7, 2, 1], [7, 8, 1, 1], [10, 8, 1, 1], [21, 8, 1, 1], [23, 8, 1, 1], [8, 9, 2, 1], [22, 9, 1, 1], [24, 9, 1, 1], [8, 10, 1, 2], [23, 10, 1, 2], [7, 12, 1, 4], [24, 12, 1, 4], [5, 15, 1, 1], [26, 15, 1, 1], [8, 16, 1, 2], [23, 16, 1, 2], [9, 18, 1, 1], [22, 18, 1, 1], [10, 19, 1, 1], [21, 19, 1, 1], [7, 20, 1, 1], [11, 20, 2, 1], [19, 20, 2, 1], [23, 20, 1, 1], [8, 21, 1, 1], [13, 21, 6, 1], [24, 21, 1, 1], [15, 24, 2, 1]]], ["#212121", [[23, 6, 2, 1], [25, 7, 1, 2], [26, 9, 1, 2], [13, 11, 5, 1], [27, 11, 1, 6], [13, 12, 1, 4], [26, 17, 1, 2], [3, 19, 1, 2], [25, 19, 1, 2], [28, 19, 1, 2], [4, 21, 1, 1], [7, 21, 1, 1], [23, 21, 1, 1], [27, 21, 1, 1], [4, 22, 2, 1], [9, 22, 1, 1], [22, 22, 1, 1], [26, 22, 2, 1], [5, 23, 2, 1], [10, 23, 3, 1], [19, 23, 3, 1], [25, 23, 2, 1], [6, 24, 2, 1], [13, 24, 2, 1], [17, 24, 2, 1], [24, 24, 2, 1], [7, 25, 3, 1], [22, 25, 3, 1], [8, 26, 4, 1], [20, 26, 4, 1], [10, 27, 12, 1], [12, 28, 8, 1]]], ["#424242", [[13, 7, 1, 1], [17, 7, 2, 1], [11, 8, 2, 1], [19, 8, 2, 1], [10, 9, 2, 1], [20, 9, 2, 1], [4, 10, 1, 1], [9, 10, 2, 1], [21, 10, 2, 1], [27, 10, 1, 1], [9, 11, 1, 1], [22, 11, 1, 1], [3, 12, 1, 6], [23, 12, 1, 4], [28, 12, 1, 6], [8, 15, 1, 1], [9, 16, 1, 1], [22, 16, 1, 1], [9, 17, 2, 1], [21, 17, 2, 1], [3, 18, 2, 1], [10, 18, 2, 1], [20, 18, 2, 1], [27, 18, 2, 1], [4, 19, 1, 1], [11, 19, 2, 1], [19, 19, 2, 1], [27, 19, 1, 1], [4, 20, 2, 1], [13, 20, 6, 1], [26, 20, 2, 1], [5, 21, 2, 1], [25, 21, 2, 1], [6, 22, 2, 1], [24, 22, 2, 1], [7, 23, 2, 1], [23, 23, 2, 1], [8, 24, 2, 1], [22, 24, 2, 1], [10, 25, 3, 1], [19, 25, 3, 1], [12, 26, 8, 1]]], ["#757575", [[13, 4, 2, 1], [17, 4, 2, 1], [10, 5, 5, 1], [17, 5, 5, 1], [9, 6, 4, 1], [19, 6, 4, 1], [8, 7, 3, 1], [21, 7, 2, 1], [24, 7, 1, 1], [9, 8, 1, 1], [13, 8, 1, 1], [18, 8, 1, 1], [22, 8, 1, 1], [6, 9, 2, 2], [23, 9, 1, 1], [25, 9, 1, 1], [24, 10, 2, 1], [5, 11, 3, 1], [24, 11, 3, 1], [5, 12, 2, 1], [25, 12, 2, 1], [6, 13, 1, 3], [25, 13, 1, 3], [9, 15, 1, 1], [22, 15, 1, 1], [5, 16, 3, 1], [10, 16, 1, 1], [21, 16, 1, 1], [24, 16, 3, 1], [6, 17, 2, 1], [11, 17, 1, 1], [20, 17, 1, 1], [24, 17, 2, 1], [6, 18, 3, 1], [12, 18, 2, 1], [18, 18, 2, 1], [23, 18, 3, 1], [8, 19, 2, 1], [13, 19, 1, 1], [17, 19, 2, 1], [22, 19, 1, 1], [24, 19, 1, 1], [9, 20, 2, 1], [21, 20, 2, 1], [9, 21, 4, 1], [19, 21, 4, 1], [10, 22, 12, 1], [13, 23, 2, 1], [17, 23, 2, 1]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    // ==========================================
    // 7. INDUSTRIAL FACTORY
    // ==========================================
    drawFactoryGround(ctx, x, y) {
        // Contrasting dark vulcanized industrial floor plates
        ctx.fillStyle = this.theme.groundDarker; // #14161A
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Dark industrial plate face (high contrast against steel walls)
        ctx.fillStyle = this.theme.groundBase; // #262A30
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Clean plate division seams
        ctx.fillStyle = this.theme.groundDark; // #1C1F24
        ctx.fillRect(x + 15, y + 1, 2, 30);
        ctx.fillRect(x + 1, y + 15, 30, 2);

        // Subtle plate highlight edges
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 2, y + 2, 13, 1); ctx.fillRect(x + 2, y + 2, 1, 13);
        ctx.fillRect(x + 18, y + 2, 12, 1); ctx.fillRect(x + 18, y + 2, 1, 13);
        ctx.fillRect(x + 2, y + 18, 13, 1); ctx.fillRect(x + 2, y + 18, 1, 12);
        ctx.fillRect(x + 18, y + 18, 12, 1); ctx.fillRect(x + 18, y + 18, 1, 12);

        // Corner steel bolts
        ctx.fillStyle = '#4B5563';
        ctx.fillRect(x + 3, y + 3, 2, 2);
        ctx.fillRect(x + 27, y + 3, 2, 2);
        ctx.fillRect(x + 3, y + 27, 2, 2);
        ctx.fillRect(x + 27, y + 27, 2, 2);
    }

    drawSteelBlockWall(ctx, x, y) {
        // Clean, Simple Monolithic 2.5D Steel Block Wall
        ctx.fillStyle = this.theme.wallEdge; // #1E293B
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Solid flat steel face
        ctx.fillStyle = this.theme.wallBase; // #475569
        ctx.fillRect(x + 2, y + 2, 28, 28);

        // Simple 2px top & left light bevel
        ctx.fillStyle = this.theme.wallLight; // #64748B
        ctx.fillRect(x + 2, y + 2, 28, 2);
        ctx.fillRect(x + 2, y + 2, 2, 28);
        ctx.fillStyle = this.theme.wallHighlight; // #94A3B8
        ctx.fillRect(x + 3, y + 3, 26, 1);
        ctx.fillRect(x + 3, y + 3, 1, 26);

        // Simple 2px bottom & right shadow bevel
        ctx.fillStyle = this.theme.wallDark; // #334155
        ctx.fillRect(x + 2, y + 28, 28, 2);
        ctx.fillRect(x + 28, y + 2, 2, 28);

        // 4 Clean corner steel rivets
        ctx.fillStyle = this.theme.wallAccent; // #CBD5E1
        ctx.fillRect(x + 5, y + 5, 2, 2);
        ctx.fillRect(x + 25, y + 5, 2, 2);
        ctx.fillRect(x + 5, y + 25, 2, 2);
        ctx.fillRect(x + 25, y + 25, 2, 2);

        // Rivet 1px drop shadow
        ctx.fillStyle = this.theme.wallEdge; // #1E293B
        ctx.fillRect(x + 6, y + 7, 1, 1);
        ctx.fillRect(x + 26, y + 7, 1, 1);
        ctx.fillRect(x + 6, y + 27, 1, 1);
        ctx.fillRect(x + 26, y + 27, 1, 1);
    }

    drawHazardCrate(ctx, x, y) {
        // High-Visibility Industrial Hazard Cargo Container with Stenciled HAZARD Label
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillStyle = '#FFB300';
        ctx.fillRect(x + 3, y + 3, 26, 26);

        // 1. Diagonal Safety Hazard Warning Stripes (Top section: y+4..16)
        ctx.fillStyle = '#111827';
        for (let i = -8; i < 30; i += 6) {
            for (let d = 0; d < 8; d++) {
                const px = x + 3 + i + d;
                const py = y + 4 + d;
                if (px >= x + 4 && px <= x + 27 && py >= y + 4 && py <= y + 16) {
                    ctx.fillRect(px, py, 2, 2);
                }
            }
        }

        // 2. High-Contrast Black Identification Badge Plate Underneath Stripes (y+18..25)
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 3, y + 18, 26, 8);
        ctx.fillStyle = '#374151'; // Top and bottom plate trim
        ctx.fillRect(x + 3, y + 18, 26, 1);
        ctx.fillRect(x + 3, y + 25, 26, 1);

        // 3. Crisp Pixel-Art Stenciled Word "HAZARD" (3x5 font at y+19..23)
        ctx.fillStyle = '#FBBF24'; // Vivid safety yellow text
        const letters = {
            'H': [0,0, 0,1, 0,2, 0,3, 0,4, 1,2, 2,0, 2,1, 2,2, 2,3, 2,4],
            'A': [0,1, 0,2, 0,3, 0,4, 1,0, 1,2, 2,1, 2,2, 2,3, 2,4],
            'Z': [0,0, 1,0, 2,0, 2,1, 1,2, 0,3, 0,4, 1,4, 2,4],
            'R': [0,0, 0,1, 0,2, 0,3, 0,4, 1,0, 1,2, 2,0, 2,1, 2,3, 2,4],
            'D': [0,0, 0,1, 0,2, 0,3, 0,4, 1,0, 1,4, 2,1, 2,2, 2,3]
        };
        const word = [['H', 4], ['A', 8], ['Z', 12], ['A', 16], ['R', 20], ['D', 24]];
        for (let w = 0; w < word.length; w++) {
            const char = word[w][0];
            const lx = word[w][1];
            const pts = letters[char];
            for (let p = 0; p < pts.length; p += 2) {
                ctx.fillRect(x + lx + pts[p], y + 19 + pts[p + 1], 1, 1);
            }
        }

        // 4. Corner Reinforcement Rivets
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(x + 4, y + 4, 1, 1);
        ctx.fillRect(x + 27, y + 4, 1, 1);
        ctx.fillRect(x + 4, y + 27, 1, 1);
        ctx.fillRect(x + 27, y + 27, 1, 1);
    }

    // ==========================================
    // 8. TOXIC SEWER (Exhaust Fan Wall + Light Bluish Grey Ground)
    // ==========================================
    drawSewerGround(ctx, x, y) {
        // Light bluish light grey concrete sewer floor
        ctx.fillStyle = this.theme.groundDarker; // #607D8B
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // Light bluish grey #90A4AE
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Mortar seam dividers
        ctx.fillStyle = this.theme.groundDark; // #78909C
        ctx.fillRect(x + 15, y + 1, 2, 30);
        ctx.fillRect(x + 1, y + 15, 30, 2);

        // Clean stone flagstone highlights
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(x + 2, y + 2, 13, 1);
        ctx.fillRect(x + 18, y + 2, 12, 1);
        ctx.fillRect(x + 2, y + 17, 13, 1);
        ctx.fillRect(x + 18, y + 17, 12, 1);

        // Subtle cool specks
        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(x + 6, y + 6, 2, 2);
        ctx.fillRect(x + 22, y + 22, 2, 2);
    }

    drawSewerExhaustFan(ctx, x, y) {
        // Heavy Industrial Sewer Ventilation Exhaust Fan (Thin sidewalls, massive fan)
        ctx.fillStyle = '#10171B'; // Outer shadow rim
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Thin outer steel frame (2px total wall thickness instead of 6-8px!)
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.fillStyle = '#546E7A'; // Frame highlight bevel
        ctx.fillRect(x + 1, y + 1, 30, 1);
        ctx.fillRect(x + 1, y + 1, 1, 30);
        ctx.fillStyle = '#1E293B'; // Frame shadow bevel
        ctx.fillRect(x + 1, y + 30, 30, 1);
        ctx.fillRect(x + 30, y + 1, 1, 30);

        // Warning yellow hazard tick marks at corners
        ctx.fillStyle = '#FBC02D';
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + 28, y + 2, 2, 2);
        ctx.fillRect(x + 2, y + 28, 2, 2);
        ctx.fillRect(x + 28, y + 28, 2, 2);

        // Massive circular ventilation duct opening (spans 26x26 from x+3, y+3 to x+28, y+28!)
        ctx.fillStyle = '#090D0E'; // Deep dark duct void
        ctx.fillRect(x + 5, y + 3, 22, 26);
        ctx.fillRect(x + 3, y + 5, 26, 22);

        // Duct circular cowling rim
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 6, y + 3, 20, 1);
        ctx.fillRect(x + 6, y + 28, 20, 1);
        ctx.fillRect(x + 3, y + 6, 1, 20);
        ctx.fillRect(x + 28, y + 6, 1, 20);
        ctx.fillStyle = '#455A64';
        ctx.fillRect(x + 7, y + 4, 18, 1);
        ctx.fillRect(x + 4, y + 7, 1, 18);

        // Massive 4-Blade Industrial Steel Fan (blades extend all the way to duct edge!)
        ctx.fillStyle = '#78909C'; // Steel blades
        // Top blade (spans y+4 to y+13)
        ctx.fillRect(x + 14, y + 4, 4, 10);
        ctx.fillRect(x + 13, y + 6, 6, 7);
        // Bottom blade (spans y+18 to y+28)
        ctx.fillRect(x + 14, y + 18, 4, 10);
        ctx.fillRect(x + 13, y + 19, 6, 7);
        // Left blade (spans x+4 to x+13)
        ctx.fillRect(x + 4, y + 14, 10, 4);
        ctx.fillRect(x + 6, y + 13, 7, 6);
        // Right blade (spans x+18 to x+28)
        ctx.fillRect(x + 18, y + 14, 10, 4);
        ctx.fillRect(x + 19, y + 13, 7, 6);

        // Blade aerodynamic highlights & bevels
        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(x + 14, y + 4, 1, 10);
        ctx.fillRect(x + 17, y + 18, 1, 10);
        ctx.fillRect(x + 4, y + 14, 10, 1);
        ctx.fillRect(x + 18, y + 17, 10, 1);

        // Large central rotor hub assembly
        ctx.fillStyle = '#1E293B'; // Hub outer ring
        ctx.fillRect(x + 12, y + 12, 8, 8);
        ctx.fillStyle = '#37474F'; // Hub face
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = '#CFD8DC'; // Chrome center nose cone
        ctx.fillRect(x + 14, y + 14, 4, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 15, y + 14, 2, 2);
    }

    drawBiohazardBarrel(ctx, x, y) {
        // Detailed 3D Biohazard Chemical Barrel with Chime Lid, Corrugated Hoops & Acid Drips
        const batches = [["#001202", [[14, 29, 11, 1]]], ["#4CAF50", [[11, 4, 1, 1], [19, 4, 1, 1]]], ["#050811", [[25, 29, 1, 1], [12, 30, 11, 1]]], ["#CCFF90", [[7, 6, 1, 1], [7, 14, 1, 1], [5, 28, 5, 2]]], ["#66BB6A", [[10, 10, 1, 4], [10, 18, 1, 3], [10, 25, 1, 2]]], ["#A5D6A7", [[11, 10, 1, 4], [11, 18, 1, 3], [11, 25, 1, 2]]], ["#000000", [[26, 29, 2, 1], [23, 30, 4, 1], [9, 31, 14, 1]]], ["#FFFFFF", [[10, 2, 2, 1], [10, 14, 2, 1], [10, 21, 2, 1], [5, 27, 1, 1]]], ["#002204", [[10, 4, 1, 1], [12, 4, 1, 1], [20, 4, 1, 1], [10, 5, 3, 1], [19, 5, 2, 1]]], ["#001A03", [[5, 17, 2, 1], [8, 17, 19, 1], [5, 24, 3, 1], [9, 24, 18, 1], [14, 28, 12, 1]]], ["#FFEE58", [[14, 9, 4, 1], [15, 10, 2, 2], [13, 11, 1, 1], [18, 11, 1, 1], [13, 12, 6, 1], [13, 13, 2, 1], [17, 13, 2, 1]]], ["#0D3811", [[5, 6, 1, 1], [26, 6, 1, 1], [24, 7, 1, 1], [19, 8, 3, 1], [22, 9, 2, 1], [19, 10, 5, 5], [19, 18, 5, 4], [19, 25, 5, 3]]], ["#00E676", [[8, 10, 1, 1], [9, 21, 1, 1], [6, 27, 6, 1], [3, 28, 2, 1], [10, 28, 4, 1], [3, 29, 1, 1], [12, 29, 2, 1], [5, 30, 1, 1], [10, 30, 2, 1]]], ["#81C784", [[12, 2, 10, 1], [7, 3, 3, 1], [22, 3, 3, 1], [6, 4, 1, 1], [25, 4, 1, 1], [5, 5, 1, 1], [26, 5, 1, 1], [9, 14, 1, 1], [12, 14, 2, 1], [12, 21, 2, 1]]], ["#76FF03", [[6, 5, 3, 1], [6, 6, 1, 1], [8, 6, 1, 1], [6, 7, 3, 1], [7, 8, 1, 6], [7, 15, 1, 4], [8, 19, 1, 7], [4, 29, 1, 1], [10, 29, 2, 1], [6, 30, 4, 1]]], ["#388E3C", [[10, 8, 4, 1], [9, 9, 1, 5], [12, 10, 2, 1], [12, 11, 1, 3], [6, 14, 1, 1], [8, 14, 1, 1], [9, 18, 1, 3], [12, 18, 2, 3], [6, 21, 2, 1], [9, 25, 1, 2], [12, 25, 2, 3]]], ["#2E7D32", [[10, 3, 1, 1], [21, 3, 1, 1], [7, 4, 1, 1], [24, 4, 1, 1], [6, 8, 1, 6], [8, 9, 1, 1], [8, 11, 1, 3], [14, 14, 5, 1], [6, 18, 1, 1], [8, 18, 1, 1], [6, 19, 2, 2], [14, 21, 5, 1], [6, 25, 2, 1], [6, 26, 3, 1]]], ["#061D09", [[25, 5, 1, 1], [24, 6, 2, 1], [5, 7, 1, 7], [9, 7, 2, 1], [21, 7, 3, 1], [25, 7, 2, 1], [8, 8, 2, 1], [22, 8, 5, 1], [10, 9, 4, 1], [18, 9, 4, 1], [24, 9, 3, 5], [24, 14, 2, 1], [5, 18, 1, 3], [24, 18, 3, 3], [24, 21, 2, 1], [5, 25, 1, 2], [24, 25, 3, 3], [26, 28, 1, 1]]], ["#1B5E20", [[11, 3, 10, 1], [8, 4, 2, 1], [13, 4, 6, 2], [21, 4, 3, 1], [9, 5, 1, 1], [21, 5, 4, 1], [9, 6, 15, 1], [11, 7, 10, 1], [14, 8, 5, 1], [14, 10, 1, 2], [17, 10, 2, 1], [17, 11, 1, 1], [15, 13, 2, 1], [5, 14, 1, 1], [26, 14, 1, 1], [5, 15, 2, 2], [8, 15, 19, 2], [14, 18, 5, 3], [5, 21, 1, 1], [26, 21, 1, 1], [5, 22, 3, 2], [9, 22, 18, 2], [14, 25, 5, 3]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    // ==========================================
    // 9. SUNKEN CORAL REEF
    // ==========================================
    drawReefGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.fillStyle = '#00897B';
        ctx.fillRect(x + 3, y + 8, 10, 2);
        ctx.fillRect(x + 18, y + 14, 11, 2);
        ctx.fillRect(x + 6, y + 22, 12, 2);
        ctx.fillStyle = '#80CBC4';
        ctx.fillRect(x + 6, y + 9, 4, 1);
        ctx.fillRect(x + 22, y + 15, 4, 1);
    }

    drawReefColumn(ctx, x, y) {
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 3, y + 2, 26, 28);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 3, y + 2, 26, 4);
        ctx.fillRect(x + 5, y + 6, 4, 20);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 21, y + 6, 6, 20);
        ctx.fillRect(x + 3, y + 26, 26, 4);
        ctx.fillStyle = '#00BFA5';
        ctx.fillRect(x + 7, y + 8, 3, 6);
        ctx.fillRect(x + 9, y + 13, 3, 5);
        ctx.fillRect(x + 17, y + 17, 3, 7);
    }

    drawCoralCluster(ctx, x, y) {
        ctx.fillStyle = this.theme.woodShadow;
        ctx.fillRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = this.theme.woodDark;
        ctx.fillRect(x + 6, y + 6, 20, 20);
        ctx.fillStyle = this.theme.woodBase;
        ctx.fillRect(x + 8, y + 10, 6, 12);
        ctx.fillRect(x + 16, y + 8, 8, 14);
        ctx.fillRect(x + 11, y + 5, 5, 8);
        ctx.fillStyle = this.theme.woodLight;
        ctx.fillRect(x + 9, y + 6, 3, 4);
        ctx.fillRect(x + 18, y + 6, 4, 4);
        ctx.fillRect(x + 12, y + 15, 3, 3);
        ctx.fillStyle = this.theme.woodHighlight;
        ctx.fillRect(x + 5, y + 8, 2, 2);
        ctx.fillRect(x + 25, y + 7, 2, 2);
        ctx.fillRect(x + 22, y + 22, 2, 2);
    }

    // ==========================================
    // 10. DEEP GEM MINE (Authentic Dirt Floor + Bedrock Wall with Crystal Veins)
    // ==========================================
    drawMineGround(ctx, x, y) {
        // Authentic Earthy Dirt Cavern Floor matching reference
        ctx.fillStyle = '#6A5137';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        const drawRects = (color, rects) => {
            ctx.fillStyle = color;
            for (let i = 0; i < rects.length; i += 4) {
                ctx.fillRect(x + rects[i], y + rects[i + 1], rects[i + 2], rects[i + 3]);
            }
        };
        drawRects('#503A26', [12, 0, 4, 2, 26, 0, 6, 2, 28, 2, 2, 2, 4, 6, 2, 2, 30, 6, 2, 2, 6, 8, 2, 2, 6, 10, 4, 2, 6, 12, 6, 2, 6, 14, 2, 2, 12, 14, 4, 2, 12, 16, 4, 2, 12, 18, 4, 2, 20, 22, 2, 2, 10, 24, 4, 2, 18, 24, 6, 2, 10, 26, 4, 2, 22, 26, 4, 2, 12, 28, 4, 2, 22, 28, 4, 2, 10, 30, 4, 2, 16, 30, 6, 2]);
        drawRects('#5E452E', [0, 0, 4, 2, 10, 0, 2, 2, 26, 2, 2, 2, 30, 2, 2, 2, 30, 4, 2, 2, 18, 6, 2, 2, 0, 8, 4, 2, 8, 8, 2, 2, 0, 10, 4, 2, 10, 10, 2, 2, 12, 12, 2, 2, 4, 14, 2, 2, 8, 14, 2, 2, 4, 16, 4, 2, 12, 20, 4, 2, 20, 20, 2, 2, 10, 22, 4, 2, 18, 22, 2, 2, 22, 22, 4, 2, 24, 24, 4, 2, 18, 26, 4, 2, 26, 26, 4, 2, 10, 28, 2, 2, 16, 28, 2, 2, 26, 28, 2, 2, 4, 30, 6, 2, 14, 30, 2, 2, 22, 30, 2, 2, 28, 30, 4, 2]);
        drawRects('#765C3E', [4, 0, 2, 2, 8, 0, 2, 2, 4, 2, 2, 2, 10, 2, 2, 2, 16, 2, 2, 2, 22, 2, 2, 2, 6, 4, 2, 2, 10, 4, 2, 2, 16, 4, 2, 2, 22, 4, 2, 2, 10, 6, 4, 2, 20, 6, 4, 2, 28, 8, 4, 2, 12, 10, 2, 2, 22, 10, 6, 2, 14, 12, 2, 2, 22, 12, 4, 2, 0, 14, 2, 2, 16, 14, 2, 2, 22, 14, 2, 2, 24, 16, 2, 2, 30, 16, 2, 2, 0, 18, 4, 2, 10, 18, 2, 2, 24, 18, 2, 2, 30, 18, 2, 2, 0, 20, 2, 2, 24, 20, 4, 2, 8, 22, 2, 2, 14, 22, 2, 2, 4, 26, 4, 2, 14, 26, 2, 2, 0, 28, 2, 2, 2, 30, 2, 2, 24, 30, 4, 2]);
        drawRects('#826645', [18, 0, 6, 2, 6, 2, 2, 2, 14, 2, 2, 2, 18, 2, 2, 2, 0, 4, 4, 2, 20, 4, 2, 2, 2, 6, 2, 2, 14, 6, 2, 2, 24, 6, 6, 2, 14, 8, 4, 2, 22, 8, 6, 2, 14, 10, 4, 2, 28, 10, 4, 2, 16, 12, 2, 2, 20, 12, 2, 2, 26, 12, 2, 2, 18, 14, 2, 2, 24, 14, 2, 2, 30, 14, 2, 2, 16, 16, 4, 2, 26, 16, 4, 2, 4, 18, 2, 2, 8, 18, 2, 2, 16, 18, 4, 2, 26, 18, 4, 2, 2, 20, 2, 2, 6, 20, 2, 2, 16, 20, 4, 2, 30, 20, 2, 2, 0, 22, 2, 2, 30, 22, 2, 2, 4, 24, 4, 2, 0, 26, 2, 2, 2, 28, 2, 2, 0, 30, 2, 2]);
        drawRects('#8F714E', [6, 0, 2, 2, 12, 2, 2, 2, 20, 2, 2, 2, 12, 4, 4, 2, 0, 6, 2, 2, 12, 8, 2, 2, 18, 8, 4, 2, 18, 10, 4, 2, 18, 12, 2, 2, 28, 12, 4, 2, 26, 14, 4, 2, 8, 16, 4, 2, 4, 20, 2, 2, 28, 20, 2, 2, 2, 22, 6, 2, 28, 22, 2, 2, 0, 24, 4, 2, 14, 24, 2, 2, 2, 26, 2, 2]);
    }

    drawMineSupport(ctx, x, y) {
        // Deep Gem Mine Cavern Bedrock Wall with Grey/Light-Black Dirt Texture inside Steel Girder
        ctx.fillStyle = '#111827';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Base fill in center (26x26: x+3..28, y+3..28)
        ctx.fillStyle = '#2A2E35';
        ctx.fillRect(x + 3, y + 3, 26, 26);

        // Exact floor dirt texture rects mapped to grey / light black palette
        const paletteGrey = {
            '#503A26': '#111418',
            '#5E452E': '#1C2026',
            '#765C3E': '#383E48',
            '#826645': '#464E5A',
            '#8F714E': '#5A6473'
        };
        const rectData = {
            '#503A26': [12, 0, 4, 2, 26, 0, 6, 2, 28, 2, 2, 2, 4, 6, 2, 2, 30, 6, 2, 2, 6, 8, 2, 2, 6, 10, 4, 2, 6, 12, 6, 2, 6, 14, 2, 2, 12, 14, 4, 2, 12, 16, 4, 2, 12, 18, 4, 2, 20, 22, 2, 2, 10, 24, 4, 2, 18, 24, 6, 2, 10, 26, 4, 2, 22, 26, 4, 2, 12, 28, 4, 2, 22, 28, 4, 2, 10, 30, 4, 2, 16, 30, 6, 2],
            '#5E452E': [0, 0, 4, 2, 10, 0, 2, 2, 26, 2, 2, 2, 30, 2, 2, 2, 30, 4, 2, 2, 18, 6, 2, 2, 0, 8, 4, 2, 8, 8, 2, 2, 0, 10, 4, 2, 10, 10, 2, 2, 12, 12, 2, 2, 4, 14, 2, 2, 8, 14, 2, 2, 4, 16, 4, 2, 12, 20, 4, 2, 20, 20, 2, 2, 10, 22, 4, 2, 18, 22, 2, 2, 22, 22, 4, 2, 24, 24, 4, 2, 18, 26, 4, 2, 26, 26, 4, 2, 10, 28, 2, 2, 16, 28, 2, 2, 26, 28, 2, 2, 4, 30, 6, 2, 14, 30, 2, 2, 22, 30, 2, 2, 28, 30, 4, 2],
            '#765C3E': [4, 0, 2, 2, 8, 0, 2, 2, 4, 2, 2, 2, 10, 2, 2, 2, 16, 2, 2, 2, 22, 2, 2, 2, 6, 4, 2, 2, 10, 4, 2, 2, 16, 4, 2, 2, 22, 4, 2, 2, 10, 6, 4, 2, 20, 6, 4, 2, 28, 8, 4, 2, 12, 10, 2, 2, 22, 10, 6, 2, 14, 12, 2, 2, 22, 12, 4, 2, 0, 14, 2, 2, 16, 14, 2, 2, 22, 14, 2, 2, 24, 16, 2, 2, 30, 16, 2, 2, 0, 18, 4, 2, 10, 18, 2, 2, 24, 18, 2, 2, 30, 18, 2, 2, 0, 20, 2, 2, 24, 20, 4, 2, 8, 22, 2, 2, 14, 22, 2, 2, 4, 26, 4, 2, 14, 26, 2, 2, 0, 28, 2, 2, 2, 30, 2, 2, 24, 30, 4, 2],
            '#826645': [18, 0, 6, 2, 6, 2, 2, 2, 14, 2, 2, 2, 18, 2, 2, 2, 0, 4, 4, 2, 20, 4, 2, 2, 2, 6, 2, 2, 14, 6, 2, 2, 24, 6, 6, 2, 14, 8, 4, 2, 22, 8, 6, 2, 14, 10, 4, 2, 28, 10, 4, 2, 16, 12, 2, 2, 20, 12, 2, 2, 26, 12, 2, 2, 18, 14, 2, 2, 24, 14, 2, 2, 30, 14, 2, 2, 16, 16, 4, 2, 26, 16, 4, 2, 4, 18, 2, 2, 8, 18, 2, 2, 16, 18, 4, 2, 26, 18, 4, 2, 2, 20, 2, 2, 6, 20, 2, 2, 16, 20, 4, 2, 30, 20, 2, 2, 0, 22, 2, 2, 30, 22, 2, 2, 4, 24, 4, 2, 0, 26, 2, 2, 2, 28, 2, 2, 0, 30, 2, 2],
            '#8F714E': [6, 0, 2, 2, 12, 2, 2, 2, 20, 2, 2, 2, 12, 4, 4, 2, 0, 6, 2, 2, 12, 8, 2, 2, 18, 8, 4, 2, 18, 10, 4, 2, 18, 12, 2, 2, 28, 12, 4, 2, 26, 14, 4, 2, 8, 16, 4, 2, 4, 20, 2, 2, 28, 20, 2, 2, 2, 22, 6, 2, 28, 22, 2, 2, 0, 24, 4, 2, 14, 24, 2, 2, 2, 26, 2, 2]
        };

        for (const [origCol, greyCol] of Object.entries(paletteGrey)) {
            ctx.fillStyle = greyCol;
            const rects = rectData[origCol];
            for (let i = 0; i < rects.length; i += 4) {
                const rx = rects[i], ry = rects[i + 1], rw = rects[i + 2], rh = rects[i + 3];
                const cx1 = Math.max(3, rx);
                const cy1 = Math.max(3, ry);
                const cx2 = Math.min(28, rx + rw);
                const cy2 = Math.min(28, ry + rh);
                if (cx2 > cx1 && cy2 > cy1) {
                    ctx.fillRect(x + cx1, y + cy1, cx2 - cx1 + 1, cy2 - cy1 + 1);
                }
            }
        }

        // Sleek Structural Steel Girder Frame (3px Beams)
        // Top girder beam (y+1..3)
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 1, 30, 3);
        ctx.fillStyle = '#78909C'; // Top bevel
        ctx.fillRect(x + 1, y + 1, 30, 1);
        ctx.fillStyle = '#1B2327'; // Underside shadow
        ctx.fillRect(x + 1, y + 3, 30, 1);

        // Bottom girder beam (y+28..30)
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 28, 30, 3);
        ctx.fillStyle = '#546E7A'; // Inward lip
        ctx.fillRect(x + 1, y + 28, 30, 1);
        ctx.fillStyle = '#1B2327'; // Shadow
        ctx.fillRect(x + 1, y + 30, 30, 1);

        // Left vertical column (x+1..3)
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 1, 3, 30);
        ctx.fillStyle = '#78909C'; // Highlight
        ctx.fillRect(x + 1, y + 1, 1, 30);
        ctx.fillStyle = '#1B2327';
        ctx.fillRect(x + 3, y + 1, 1, 30);

        // Right vertical column (x+28..30)
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 28, y + 1, 3, 30);
        ctx.fillStyle = '#546E7A';
        ctx.fillRect(x + 28, y + 1, 1, 30);
        ctx.fillStyle = '#1B2327';
        ctx.fillRect(x + 30, y + 1, 1, 30);

        // 4x4 Corner Gusset Reinforcement Plates with Rivets
        const gussets = [[1, 1], [27, 1], [1, 27], [27, 27]];
        ctx.fillStyle = '#455A64';
        for (let g = 0; g < gussets.length; g++) {
            ctx.fillRect(x + gussets[g][0], y + gussets[g][1], 4, 4);
        }
        ctx.fillStyle = '#CFD8DC';
        for (let g = 0; g < gussets.length; g++) {
            ctx.fillRect(x + gussets[g][0] + 1, y + gussets[g][1] + 1, 1, 1);
        }

        // Mid-girder rivets
        ctx.fillRect(x + 15, y + 2, 2, 1);  // Top mid
        ctx.fillRect(x + 15, y + 29, 2, 1); // Bottom mid
        ctx.fillRect(x + 2, y + 15, 1, 2);  // Left mid
        ctx.fillRect(x + 29, y + 15, 1, 2); // Right mid
    }

    drawOreVeinRock(ctx, x, y) {
        // One Big Monolithic Block of Orange Shiny Gem (Topaz / Amber)
        ctx.fillStyle = this.theme.woodShadow; // #431407
        ctx.fillRect(x + 2, y + 2, 28, 28);

        // Dark amber gem facet border outline
        ctx.fillStyle = this.theme.woodEdge; // #7C2D12
        ctx.fillRect(x + 3, y + 3, 26, 26);

        // Radiant orange gemstone body
        ctx.fillStyle = this.theme.woodBase; // #F97316
        ctx.fillRect(x + 4, y + 4, 24, 24);

        // Top and left crystalline highlight facets
        ctx.fillStyle = this.theme.woodLight; // #FB923C
        ctx.fillRect(x + 5, y + 5, 22, 5);
        ctx.fillRect(x + 5, y + 5, 5, 22);

        // Central table facet (rich golden amber)
        ctx.fillStyle = this.theme.woodAccent; // #FACC15
        ctx.fillRect(x + 9, y + 9, 14, 14);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x + 10, y + 10, 12, 12);

        // Bottom and right refractive shadow facets
        ctx.fillStyle = this.theme.woodDark; // #C2410C
        ctx.fillRect(x + 19, y + 9, 4, 14);
        ctx.fillRect(x + 9, y + 19, 14, 4);

        // Brilliant diamond white glints & star sparkle
        ctx.fillStyle = this.theme.woodHighlight; // #FEF08A
        ctx.fillRect(x + 6, y + 6, 4, 2);
        ctx.fillRect(x + 6, y + 6, 2, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 7, y + 7, 2, 2);
        ctx.fillRect(x + 18, y + 14, 2, 2);
        ctx.fillRect(x + 12, y + 18, 1, 1);
    }

    // ==========================================
    // 11. CYBER LAB (Server Computers Wall + Analog Dial Gauge Destructible)
    // ==========================================
    drawLabGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.fillStyle = '#ECEFF1'; // One tone lighter than groundBase #CFD8DC
        ctx.fillRect(x + 1, y + 15, 30, 1);
        ctx.fillRect(x + 15, y + 1, 1, 30);
        ctx.fillRect(x + 14, y + 14, 3, 3);
    }

    drawServerComputers(ctx, x, y) {
        // High-Tech Server Computer Rack - Lighter Titanium/Silver Finish
        ctx.fillStyle = this.theme.wallEdge; // #1E293B
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.wallBase; // Titanium Grey #475569
        ctx.fillRect(x + 2, y + 2, 28, 28);

        // Bevel highlight
        ctx.fillStyle = this.theme.wallLight; // #64748B
        ctx.fillRect(x + 2, y + 2, 28, 1);
        ctx.fillRect(x + 2, y + 2, 1, 28);

        // Rack Unit 1 (Upper blade server)
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 4, y + 4, 24, 7);
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(x + 5, y + 5, 22, 1);
        // Blinking LEDs
        ctx.fillStyle = this.theme.wallHighlight; // Cyan LED #00E5FF
        ctx.fillRect(x + 6, y + 7, 2, 2); ctx.fillRect(x + 10, y + 7, 2, 2);
        ctx.fillStyle = this.theme.wallAccent; // Green LED #76FF03
        ctx.fillRect(x + 14, y + 7, 2, 2); ctx.fillRect(x + 18, y + 7, 2, 2);
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(x + 22, y + 7, 4, 2);

        // Rack Unit 2 (Mid switch blade)
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 4, y + 13, 24, 7);
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(x + 5, y + 14, 22, 1);
        // Status indicator LEDs
        ctx.fillStyle = '#EF4444'; // Red alert LED
        ctx.fillRect(x + 6, y + 16, 2, 2);
        ctx.fillStyle = '#F59E0B'; // Amber LED
        ctx.fillRect(x + 10, y + 16, 2, 2);
        ctx.fillStyle = this.theme.wallHighlight; // Cyan data bus
        ctx.fillRect(x + 14, y + 16, 12, 2);

        // Rack Unit 3 (Lower cooling intake & fans)
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 4, y + 22, 24, 6);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(x + 6, y + 23, 20, 1);
        ctx.fillRect(x + 6, y + 25, 20, 1);
    }

    drawGaugeConsole(ctx, x, y) {
        // Analog Pressure Monitor / Dial Gauge Console
        ctx.fillStyle = this.theme.woodEdge;
        ctx.fillRect(x + 3, y + 3, 26, 26);
        ctx.fillStyle = this.theme.woodBase; // Metallic body #37474F
        ctx.fillRect(x + 4, y + 4, 24, 24);

        // Circular dial bezel
        ctx.fillStyle = this.theme.woodHighlight; // Brass rim #FFB300
        ctx.fillRect(x + 7, y + 6, 18, 18);
        ctx.fillRect(x + 6, y + 7, 20, 16);

        // White gauge face
        ctx.fillStyle = this.theme.woodShadow; // White face #ECEFF1
        ctx.fillRect(x + 8, y + 8, 16, 14);

        // Colored meter arcs (Green safe zone, Red danger zone)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 10, y + 9, 6, 2);
        ctx.fillStyle = this.theme.woodAccent; // Red danger #D50000
        ctx.fillRect(x + 16, y + 9, 6, 2);

        // Indicator needle
        ctx.fillStyle = '#212121';
        ctx.fillRect(x + 15, y + 15, 2, 2); // Center hub
        ctx.fillStyle = '#D50000'; // Red needle pointing to danger
        ctx.fillRect(x + 16, y + 11, 2, 5);

        // Corner mounting screws
        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(x + 5, y + 5, 1, 1);
        ctx.fillRect(x + 26, y + 5, 1, 1);
        ctx.fillRect(x + 5, y + 26, 1, 1);
        ctx.fillRect(x + 26, y + 26, 1, 1);
    }

    // ==========================================
    // 12. FEUDAL JAPAN (Japanese Wood Floor + Traditional Pagoda Wall + Nigiri Sushi Piece)
    // ==========================================
    drawJapanGround(ctx, x, y) {
        // Polished Japanese Cypress/Cedar Wood Floor Planks
        ctx.fillStyle = this.theme.groundDarker; // Dark seam #8C6534
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Horizontal wooden floor planks
        ctx.fillStyle = this.theme.groundBase; // Warm cedar #C59B63
        ctx.fillRect(x, y + 1, 32, 9);
        ctx.fillRect(x, y + 11, 32, 9);
        ctx.fillRect(x, y + 21, 32, 10);

        // Subtle wood grain sheen
        ctx.fillStyle = this.theme.groundDark; // #B0854E
        ctx.fillRect(x + 4, y + 4, 16, 1);
        ctx.fillRect(x + 14, y + 14, 14, 1);
        ctx.fillRect(x + 8, y + 25, 18, 1);
    }

    drawJapanPagoda(ctx, x, y) {
        // Traditional Japanese Castle Ishigaki Grey Stone Brick Wall
        ctx.fillStyle = '#1E293B'; // Dark slate mortar
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        const drawStone = (sx, sy, sw, sh) => {
            ctx.fillStyle = '#475569'; // Base grey stone
            ctx.fillRect(sx, sy, sw, sh);
            // Top and left bevel highlight
            ctx.fillStyle = '#64748B';
            ctx.fillRect(sx, sy, sw, 1);
            ctx.fillRect(sx, sy, 1, sh);
            ctx.fillStyle = '#94A3B8'; // Specular stone highlight
            ctx.fillRect(sx + 1, sy + 1, Math.min(sw - 2, 5), 1);
            // Bottom and right shadow
            ctx.fillStyle = '#334155';
            ctx.fillRect(sx, sy + sh - 1, sw, 1);
            ctx.fillRect(sx + sw - 1, sy, 1, sh);
        };

        // Course 1 (y+2, h=6): Staggered blocks
        drawStone(x + 2, y + 2, 13, 6);
        drawStone(x + 16, y + 2, 14, 6);

        // Course 2 (y+9, h=6):
        drawStone(x + 2, y + 9, 8, 6);
        drawStone(x + 11, y + 9, 11, 6);
        drawStone(x + 23, y + 9, 7, 6);

        // Course 3 (y+16, h=6):
        drawStone(x + 2, y + 16, 14, 6);
        drawStone(x + 17, y + 16, 13, 6);

        // Course 4 (y+23, h=7):
        drawStone(x + 2, y + 23, 7, 7);
        drawStone(x + 10, y + 23, 12, 7);
        drawStone(x + 23, y + 23, 7, 7);

        // Natural rock texture chiseling
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 6, y + 5, 2, 1);
        ctx.fillRect(x + 22, y + 4, 2, 1);
        ctx.fillRect(x + 15, y + 12, 2, 1);
        ctx.fillRect(x + 7, y + 19, 2, 1);
        ctx.fillRect(x + 24, y + 19, 2, 1);
        ctx.fillRect(x + 14, y + 26, 2, 1);
    }

    drawSushiPiece(ctx, x, y) {
        // Detailed 2.5D Nigiri Sushi (Pillowy rice bed, draped salmon fillet & nori seaweed belt)
        // 1. Soft 2.5D floor shadow
        ctx.fillStyle = '#4E2A0A'; // Warm cedar drop shadow
        ctx.fillRect(x + 4, y + 25, 24, 4);
        ctx.fillStyle = '#2E1505';
        ctx.fillRect(x + 6, y + 27, 20, 3);

        // 2. Rice Bed (Shari) - 2.5D Oblong Pillow
        ctx.fillStyle = this.theme.woodShadow; // #CFD8DC
        ctx.fillRect(x + 6, y + 15, 20, 10);
        ctx.fillRect(x + 5, y + 17, 22, 7);
        ctx.fillStyle = this.theme.woodBase;   // Pure white rice #FFFFFF
        ctx.fillRect(x + 6, y + 15, 20, 8);
        ctx.fillRect(x + 5, y + 17, 22, 5);

        // Rice grain texture and 3D underside shading
        ctx.fillStyle = this.theme.woodShadow;
        ctx.fillRect(x + 6, y + 23, 20, 2);
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(x + 7, y + 24, 18, 1);
        // Individual rice grains
        ctx.fillStyle = this.theme.woodShadow;
        ctx.fillRect(x + 6, y + 20, 2, 2);
        ctx.fillRect(x + 10, y + 21, 2, 2);
        ctx.fillRect(x + 20, y + 21, 2, 2);
        ctx.fillRect(x + 24, y + 19, 2, 2);

        // Wasabi dab peeking out
        ctx.fillStyle = '#64DD17';
        ctx.fillRect(x + 4, y + 15, 2, 2);

        // 3. Fresh Salmon Slice (Neta) - 2.5D Draped Fillet
        // Outer silhouette of curved salmon fillet
        ctx.fillStyle = this.theme.woodAccent; // #FF5722 Fresh salmon orange
        ctx.fillRect(x + 5, y + 7, 22, 2);
        ctx.fillRect(x + 4, y + 8, 24, 6);
        ctx.fillRect(x + 3, y + 10, 26, 5);

        // Sunlit top facet
        ctx.fillStyle = this.theme.woodLight;  // #FF7043
        ctx.fillRect(x + 5, y + 7, 22, 2);
        ctx.fillRect(x + 4, y + 8, 24, 3);

        // Under-lip shadow of draped fish
        ctx.fillStyle = '#D84315';
        ctx.fillRect(x + 3, y + 14, 26, 1);
        ctx.fillRect(x + 4, y + 14, 24, 2);
        ctx.fillStyle = '#BF360C';
        ctx.fillRect(x + 4, y + 15, 24, 1);

        // Diagonal Salmon Marbling Fat Lines (2.5D curved diagonal grain)
        ctx.fillStyle = '#FFCCBC';
        // Stripe 1
        ctx.fillRect(x + 7, y + 8, 2, 2);
        ctx.fillRect(x + 6, y + 10, 2, 3);
        ctx.fillRect(x + 5, y + 13, 2, 2);
        // Stripe 2
        ctx.fillRect(x + 11, y + 7, 2, 2);
        ctx.fillRect(x + 10, y + 9, 2, 3);
        ctx.fillRect(x + 9, y + 12, 2, 3);
        // Stripe 3
        ctx.fillRect(x + 19, y + 7, 2, 2);
        ctx.fillRect(x + 18, y + 9, 2, 3);
        ctx.fillRect(x + 17, y + 12, 2, 3);
        // Stripe 4
        ctx.fillRect(x + 23, y + 8, 2, 2);
        ctx.fillRect(x + 22, y + 10, 2, 3);
        ctx.fillRect(x + 21, y + 13, 2, 2);

        // Glistening fish oil specular glint
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 7, y + 8, 3, 1);
        ctx.fillRect(x + 14, y + 7, 4, 1);
        ctx.fillRect(x + 8, y + 9, 1, 1);

        // 4. Nori (Seaweed Belt) - 3D Wrap around center
        ctx.fillStyle = this.theme.woodDark;   // #1B3B1B Seaweed
        ctx.fillRect(x + 13, y + 6, 6, 19);
        ctx.fillStyle = '#0D1F0D';
        ctx.fillRect(x + 13, y + 15, 6, 10);
        ctx.fillStyle = '#2E7D32';             // Seaweed sheen
        ctx.fillRect(x + 14, y + 6, 2, 18);
        ctx.fillStyle = '#0D1F0D';
        ctx.fillRect(x + 18, y + 7, 1, 17);
    }

    // ==========================================
    // 13. CITY STREETS (Asphalt Road + Reinforced Bollard Wall + Metal Manhole)
    // ==========================================
    drawCityGround(ctx, x, y) {
        // Authentic Aggregate Asphalt Road Texture matching reference
        ctx.fillStyle = '#888A8E';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        const drawRects = (color, rects) => {
            ctx.fillStyle = color;
            for (let i = 0; i < rects.length; i += 4) {
                ctx.fillRect(x + rects[i], y + rects[i + 1], rects[i + 2], rects[i + 3]);
            }
        };
        drawRects('#585A5E', [14, 2, 6, 2, 4, 4, 2, 2, 14, 4, 2, 2, 24, 4, 2, 2, 28, 4, 2, 2, 8, 6, 2, 2, 24, 6, 2, 2, 30, 8, 2, 2, 8, 12, 4, 2, 22, 12, 2, 2, 6, 14, 4, 2, 22, 14, 4, 2, 28, 14, 2, 2, 14, 16, 2, 2, 26, 16, 2, 2, 0, 18, 4, 2, 18, 18, 4, 2, 2, 24, 2, 2, 10, 24, 2, 2, 28, 24, 4, 2, 16, 26, 2, 2, 10, 28, 8, 2, 8, 30, 2, 2, 16, 30, 2, 2, 24, 30, 2, 2]);
        drawRects('#696B6F', [2, 0, 2, 2, 18, 0, 2, 2, 2, 2, 4, 2, 28, 2, 4, 2, 2, 4, 2, 2, 22, 4, 2, 2, 22, 6, 2, 2, 2, 8, 2, 2, 0, 10, 4, 2, 30, 10, 2, 2, 6, 12, 2, 2, 30, 12, 2, 2, 26, 14, 2, 2, 30, 14, 2, 2, 2, 16, 2, 2, 16, 16, 6, 2, 28, 16, 2, 2, 26, 20, 6, 2, 10, 22, 2, 2, 28, 22, 4, 2, 0, 24, 2, 2, 8, 28, 2, 2, 24, 28, 2, 2, 18, 30, 2, 2, 22, 30, 2, 2, 26, 30, 4, 2]);
        drawRects('#7A7C80', [0, 0, 2, 2, 12, 2, 2, 2, 0, 4, 2, 2, 20, 4, 2, 2, 2, 6, 6, 2, 10, 6, 2, 2, 20, 6, 2, 2, 26, 6, 6, 2, 6, 8, 2, 2, 12, 8, 2, 2, 4, 10, 2, 2, 2, 12, 4, 2, 16, 12, 2, 2, 24, 12, 2, 2, 2, 14, 2, 2, 12, 14, 6, 2, 12, 16, 2, 2, 8, 18, 2, 2, 28, 18, 4, 2, 8, 20, 4, 2, 20, 20, 4, 2, 4, 22, 2, 2, 8, 22, 2, 2, 12, 22, 4, 2, 20, 22, 4, 2, 26, 22, 2, 2, 8, 24, 2, 2, 12, 24, 4, 2, 20, 24, 4, 2, 14, 26, 2, 2, 18, 26, 10, 2, 22, 28, 2, 2, 26, 28, 2, 2, 20, 30, 2, 2, 30, 30, 2, 2]);
        drawRects('#9C9EA2', [16, 0, 2, 2, 22, 0, 2, 2, 28, 0, 2, 2, 6, 2, 2, 2, 10, 2, 2, 2, 20, 2, 2, 2, 26, 2, 2, 2, 8, 4, 2, 2, 12, 4, 2, 2, 30, 4, 2, 2, 0, 6, 2, 2, 12, 6, 4, 2, 0, 8, 2, 2, 4, 8, 2, 2, 20, 8, 2, 2, 28, 8, 2, 2, 18, 10, 2, 2, 0, 12, 2, 2, 12, 12, 2, 2, 18, 12, 2, 2, 26, 12, 2, 2, 0, 14, 2, 2, 10, 14, 2, 2, 10, 16, 2, 2, 30, 16, 2, 2, 12, 18, 2, 2, 22, 18, 2, 2, 6, 20, 2, 2, 24, 20, 2, 2, 18, 22, 2, 2, 24, 22, 2, 2, 16, 24, 2, 2, 26, 24, 2, 2, 8, 26, 2, 2, 18, 28, 4, 2, 28, 28, 2, 2, 10, 30, 2, 2, 14, 30, 2, 2]);
        drawRects('#B8BABC', [4, 0, 2, 2, 10, 0, 2, 2, 20, 0, 2, 2, 24, 0, 4, 2, 0, 2, 2, 2, 6, 4, 2, 2, 16, 4, 4, 2, 8, 8, 2, 2, 16, 8, 2, 2, 26, 8, 2, 2, 4, 16, 6, 2, 22, 16, 4, 2, 24, 18, 4, 2, 0, 20, 4, 2, 0, 22, 2, 2, 30, 26, 2, 2, 0, 28, 2, 2, 2, 30, 6, 2, 12, 30, 2, 2]);
    }

    drawSpeedCamera(ctx, x, y) {
        // Monolithic Urban Speed Enforcement Camera Box (One Solid Device Filling Tile, No Neck)
        // Soft road shadow
        ctx.fillStyle = '#18191C';
        ctx.fillRect(x + 2, y + 29, 28, 2);

        // Armored Steel Outer Housing Shell (28x27 solid box, x+2..29, y+2..28)
        ctx.fillStyle = '#111827'; // Dark industrial outline
        ctx.fillRect(x + 2, y + 1, 28, 28);

        // High-Visibility Traffic Yellow Body
        ctx.fillStyle = '#FBBF24';
        ctx.fillRect(x + 3, y + 2, 26, 26);

        // 3D Housing Bevels
        ctx.fillStyle = '#FEF08A'; // Top highlight
        ctx.fillRect(x + 3, y + 2, 26, 1);
        ctx.fillStyle = '#FDE047'; // Left highlight
        ctx.fillRect(x + 3, y + 2, 1, 26);
        ctx.fillStyle = '#D97706'; // Right shadow
        ctx.fillRect(x + 28, y + 2, 1, 26);
        ctx.fillStyle = '#B45309'; // Bottom shadow
        ctx.fillRect(x + 3, y + 27, 26, 1);

        // Protective Dark Slate Side Bumper Panels
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 3, y + 3, 2, 24);
        ctx.fillRect(x + 27, y + 3, 2, 24);

        // Recessed Matte Dark Sensor & Camera Plate (x+5 to x+26, y+4 to y+19)
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 5, y + 4, 22, 16);
        ctx.fillStyle = '#0F172A'; // Recess inner shadow
        ctx.fillRect(x + 5, y + 4, 22, 1);
        ctx.fillRect(x + 5, y + 4, 1, 16);

        // Large Camera Lens Aperture (Left side)
        ctx.fillStyle = '#0F172A'; // Outer bezel
        ctx.fillRect(x + 7, y + 6, 11, 11);
        ctx.fillStyle = '#334155'; // Lens retaining ring
        ctx.fillRect(x + 8, y + 7, 9, 9);
        ctx.fillStyle = '#0284C7'; // Deep blue coated lens glass
        ctx.fillRect(x + 9, y + 8, 7, 7);
        ctx.fillStyle = '#00E5FF'; // High-index cyan optic reflection
        ctx.fillRect(x + 10, y + 9, 5, 5);
        ctx.fillStyle = '#FFFFFF'; // Specular glint
        ctx.fillRect(x + 10, y + 8, 2, 2);
        ctx.fillRect(x + 11, y + 10, 1, 1);

        // Strobe Flash Diffuser Unit (Top-right)
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 19, y + 6, 7, 5);
        ctx.fillStyle = '#FFF9C4'; // Frosted flash diffuser
        ctx.fillRect(x + 20, y + 7, 5, 3);
        ctx.fillStyle = '#FFE082'; // Strobe element grid
        ctx.fillRect(x + 22, y + 7, 1, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 20, y + 7, 2, 1);

        // Radar/Lidar Speed Emitter Array (Mid-right)
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 19, y + 12, 7, 3);
        ctx.fillStyle = '#EF4444'; // Infrared Doppler emitter diode
        ctx.fillRect(x + 21, y + 13, 3, 1);

        // Dual Active Status LEDs (Lower-right of sensor plate)
        ctx.fillStyle = '#EF4444'; // Armed Red LED
        ctx.fillRect(x + 20, y + 16, 2, 2);
        ctx.fillStyle = '#FCA5A5';
        ctx.fillRect(x + 20, y + 16, 1, 1);
        ctx.fillStyle = '#22C55E'; // Ready Green LED
        ctx.fillRect(x + 23, y + 16, 2, 2);
        ctx.fillStyle = '#86EFAC';
        ctx.fillRect(x + 23, y + 16, 1, 1);

        // Lower Industrial Hazard Safety Warning Section (y+21 to y+26)
        ctx.fillStyle = '#18181B'; // Black warning band
        ctx.fillRect(x + 5, y + 21, 22, 6);
        ctx.fillStyle = '#FBBF24'; // Diagonal yellow hazard stripes
        ctx.fillRect(x + 7, y + 21, 3, 6);
        ctx.fillRect(x + 13, y + 21, 3, 6);
        ctx.fillRect(x + 19, y + 21, 3, 6);

        // 4 Corner Tamper-Proof Security Hex Bolts
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(x + 3, y + 3, 2, 2);
        ctx.fillRect(x + 27, y + 3, 2, 2);
        ctx.fillRect(x + 3, y + 26, 2, 2);
        ctx.fillRect(x + 27, y + 26, 2, 2);
    }

    drawStreetBollard(ctx, x, y) {
        this.drawSpeedCamera(ctx, x, y);
    }

    drawManholeCover(ctx, x, y) {
        // Heavy Urban Cast-Iron Manhole Cover (Authentic Weathered Iron Metal)
        ctx.fillStyle = '#18191B'; // Road bedding shadow
        ctx.fillRect(x + 4, y + 27, 24, 4);

        // Heavy Cast-Iron Outer Frame Ring (embedded in asphalt)
        ctx.fillStyle = this.theme.wallEdge; // #18191B
        ctx.fillRect(x + 5, y + 2, 22, 28);
        ctx.fillRect(x + 2, y + 5, 28, 22);

        // Outer flange rim - Weathered cast-iron
        ctx.fillStyle = this.theme.wallDark; // #282A2E
        ctx.fillRect(x + 6, y + 3, 20, 26);
        ctx.fillRect(x + 3, y + 6, 26, 20);

        // Circular beveled metal edge highlight (top-left tire wear)
        ctx.fillStyle = this.theme.wallLight; // #52565E
        ctx.fillRect(x + 7, y + 3, 16, 2);
        ctx.fillRect(x + 3, y + 7, 2, 16);
        ctx.fillStyle = this.theme.wallHighlight; // #686E78
        ctx.fillRect(x + 9, y + 4, 12, 1);
        ctx.fillRect(x + 4, y + 9, 1, 12);

        // Bottom-right cast-iron recessed shadow
        ctx.fillStyle = this.theme.wallEdge; // #18191B
        ctx.fillRect(x + 7, y + 27, 16, 2);
        ctx.fillRect(x + 27, y + 7, 2, 16);

        // Manhole lid main face plate
        ctx.fillStyle = this.theme.wallBase; // #373A40
        ctx.fillRect(x + 6, y + 5, 20, 22);
        ctx.fillRect(x + 5, y + 6, 22, 20);

        // Concentric raised traction ring
        ctx.fillStyle = this.theme.wallDark; // #282A2E
        ctx.fillRect(x + 7, y + 7, 18, 18);
        ctx.fillStyle = this.theme.wallBase; // #373A40
        ctx.fillRect(x + 8, y + 8, 16, 16);

        // Heavy industrial cross-spoke reinforcement ribs
        ctx.fillStyle = this.theme.wallEdge; // #18191B
        ctx.fillRect(x + 15, y + 5, 2, 22);
        ctx.fillRect(x + 5, y + 15, 22, 2);

        // Anti-slip raised waffle/diamond tread studs
        ctx.fillStyle = this.theme.wallHighlight; // #686E78 (worn steel studs)
        ctx.fillRect(x + 9, y + 9, 3, 2);
        ctx.fillRect(x + 20, y + 9, 3, 2);
        ctx.fillRect(x + 9, y + 21, 3, 2);
        ctx.fillRect(x + 20, y + 21, 3, 2);
        ctx.fillRect(x + 10, y + 12, 2, 2);
        ctx.fillRect(x + 20, y + 12, 2, 2);
        ctx.fillRect(x + 10, y + 18, 2, 2);
        ctx.fillRect(x + 20, y + 18, 2, 2);

        // 2 Slotted Pry/Pick Holes for lifting hook
        ctx.fillStyle = '#111214'; // Deep through-hole
        ctx.fillRect(x + 8, y + 14, 4, 4);
        ctx.fillRect(x + 20, y + 14, 4, 4);
        ctx.fillStyle = this.theme.wallHighlight; // Upper lip glint
        ctx.fillRect(x + 8, y + 14, 4, 1);
        ctx.fillRect(x + 20, y + 14, 4, 1);

        // Center utility medallion stamp
        ctx.fillStyle = this.theme.wallDark; // #282A2E
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = this.theme.wallHighlight; // #686E78
        ctx.fillRect(x + 14, y + 14, 4, 4);
        ctx.fillStyle = '#18191B'; // Center drain bolt
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    // ==========================================
    // 14. PHARAOH'S VAULT (Gilded Egyptian Treasure Chest)
    // ==========================================
    drawVaultGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.fillStyle = '#D6C49F';
        ctx.fillRect(x + 3, y + 3, 26, 1);
        ctx.fillRect(x + 3, y + 28, 26, 1);
        ctx.fillRect(x + 3, y + 3, 1, 26);
        ctx.fillRect(x + 28, y + 3, 1, 26);
        ctx.fillStyle = '#0288D1';
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 11, y + 14, 2, 1); ctx.fillRect(x + 19, y + 14, 2, 1);
        ctx.fillRect(x + 11, y + 17, 2, 1); ctx.fillRect(x + 19, y + 17, 2, 1);
    }

    drawVaultObelisk(ctx, x, y) {
        // Majestic Royal Cobalt Lapis Lazuli Egyptian Obelisk Monolith
        // Ground drop shadow
        ctx.fillStyle = '#0A1128';
        ctx.fillRect(x + 2, y + 28, 28, 4);

        // Carved Sandstone & Gold Plinth Base (y+24 to y+29)
        ctx.fillStyle = '#8D5B28'; // Sandstone base
        ctx.fillRect(x + 3, y + 24, 26, 6);
        ctx.fillStyle = '#D6C49F'; // Sandstone bevel
        ctx.fillRect(x + 4, y + 24, 24, 1);
        ctx.fillStyle = '#F59E0B'; // Gold base molding band
        ctx.fillRect(x + 2, y + 27, 28, 2);
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(x + 3, y + 27, 26, 1);

        // Solid Royal Cobalt Lapis Lazuli Monolith Shaft (tapers upward from x+5..27 to x+7..25)
        // Dark midnight base stone outline
        ctx.fillStyle = '#0B132B';
        ctx.fillRect(x + 5, y + 6, 22, 19);

        // Left Facet (Light caught sapphire lapis)
        ctx.fillStyle = '#2563EB'; // Royal cobalt blue
        ctx.fillRect(x + 6, y + 6, 10, 18);
        ctx.fillStyle = '#3B82F6'; // Left bevel highlight
        ctx.fillRect(x + 6, y + 6, 3, 18);

        // Right Facet (Deep lapis lazuli shadow)
        ctx.fillStyle = '#1E3A8A'; // Deep midnight cobalt
        ctx.fillRect(x + 16, y + 6, 10, 18);
        ctx.fillStyle = '#0F172A'; // Far right shadow
        ctx.fillRect(x + 24, y + 6, 2, 18);

        // Solid Electroplated Pure Gold Pyramidion Peak at top (y+0 to y+6)
        ctx.fillStyle = '#C79A00'; // Dark gold outline
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 13, y + 1, 6, 3);
        ctx.fillRect(x + 15, y + 0, 2, 2);

        ctx.fillStyle = '#FFD700'; // Pure polished gold pyramidion
        ctx.fillRect(x + 11, y + 3, 10, 3);
        ctx.fillRect(x + 14, y + 1, 4, 3);
        ctx.fillRect(x + 15, y + 0, 2, 1);

        // Gold pyramidion left highlight glint
        ctx.fillStyle = '#FFF59D';
        ctx.fillRect(x + 11, y + 3, 4, 3);
        ctx.fillRect(x + 14, y + 1, 2, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 15, y + 0, 1, 1);

        // Inlaid Sacred Golden Hieroglyphs down the center shaft
        ctx.fillStyle = '#F59E0B'; // Gold inlay

        // Winged Solar Disc of Horus at top of shaft
        ctx.fillRect(x + 13, y + 7, 6, 3);
        ctx.fillRect(x + 9, y + 8, 4, 1);
        ctx.fillRect(x + 19, y + 8, 4, 1);
        ctx.fillStyle = '#DC2626'; // Red solar core
        ctx.fillRect(x + 15, y + 7, 2, 2);

        // Sacred Ankh of Eternal Life
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 14, y + 12, 4, 2); // Ankh loop
        ctx.fillStyle = '#2563EB';
        ctx.fillRect(x + 15, y + 13, 2, 1); // Ankh eye hole
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 13, y + 14, 6, 1); // Ankh crossbar
        ctx.fillRect(x + 15, y + 14, 2, 4); // Ankh stem

        // Eye of Horus (Wedjat)
        ctx.fillRect(x + 13, y + 19, 6, 2);
        ctx.fillRect(x + 15, y + 18, 2, 3);
        ctx.fillStyle = '#00E5FF'; // Turquoise pupil
        ctx.fillRect(x + 15, y + 19, 2, 1);

        // Golden Scarab beetle emblem at base of shaft
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 14, y + 22, 4, 2);
    }

    drawGildedCoffer(ctx, x, y) {
        // Gilded Tutankhamun Treasure Chest (100% Bright Gold & Carnelian Ruby)
        ctx.fillStyle = this.theme.woodShadow; // #451A03
        ctx.fillRect(x + 3, y + 26, 26, 4); // Drop shadow

        // Outer chest outline
        ctx.fillStyle = this.theme.woodEdge; // Antique bronze #78350F
        ctx.fillRect(x + 3, y + 3, 26, 24);

        // Radiant antique gold chest body
        ctx.fillStyle = this.theme.woodBase; // Rich gold #F59E0B
        ctx.fillRect(x + 4, y + 4, 24, 22);

        // Arched coffer lid top with gold highlights
        ctx.fillStyle = this.theme.woodLight; // #FBBF24
        ctx.fillRect(x + 5, y + 4, 22, 7);
        ctx.fillStyle = this.theme.woodHighlight; // Shimmering gold sheen #FEF08A
        ctx.fillRect(x + 6, y + 5, 20, 2);
        ctx.fillRect(x + 5, y + 5, 2, 6);

        // Dark lid hinge seam
        ctx.fillStyle = this.theme.woodDark; // #B45309
        ctx.fillRect(x + 3, y + 12, 26, 2);

        // Royal carnelian ruby red enamel straps
        ctx.fillStyle = this.theme.woodAccent; // Ruby red #DC2626
        ctx.fillRect(x + 7, y + 4, 3, 22);
        ctx.fillRect(x + 22, y + 4, 3, 22);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(x + 8, y + 5, 1, 20);

        // Turquoise scarab lock clasp in center
        ctx.fillStyle = '#06B6D4'; // Turquoise
        ctx.fillRect(x + 13, y + 11, 6, 7);
        ctx.fillStyle = '#22D3EE';
        ctx.fillRect(x + 14, y + 12, 4, 5);
        ctx.fillStyle = '#0E7490'; // Keyhole
        ctx.fillRect(x + 15, y + 14, 2, 2);
    }

    // ==========================================
    // 15. BEE HIVE (Honey Floor + Hexagon Honeycomb Wax Wall + Blooming Pink Flower)
    // ==========================================
    drawBeehiveGround(ctx, x, y) {
        // Warm golden honey floor
        ctx.fillStyle = this.theme.groundDarker; // #FF8F00
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // Honey #FFC107
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Honeycomb cell outlines
        ctx.fillStyle = this.theme.groundDark; // #FFA000
        ctx.fillRect(x + 6, y + 4, 8, 1);
        ctx.fillRect(x + 6, y + 14, 8, 1);
        ctx.fillRect(x + 4, y + 7, 1, 4);
        ctx.fillRect(x + 15, y + 7, 1, 4);

        ctx.fillRect(x + 20, y + 16, 8, 1);
        ctx.fillRect(x + 20, y + 26, 8, 1);
    }

    drawHoneycombWall(ctx, x, y) {
        // Continuous Hexagonal Honeycomb Wax Cells (Seamless Tiling, Strictly Within Tile Borders)
        ctx.fillStyle = '#92400E'; // Deep honey foundation base
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Pre-computed rectangle decomposition for continuous seamless honeycomb cells across adjacent tiles
        const rectData = [
            ['#B45309', [17, 2, 15, 2, 18, 4, 13, 2, 19, 6, 11, 1, 1, 10, 15, 2, 2, 12, 13, 2, 3, 14, 11, 1, 17, 18, 15, 2, 18, 20, 13, 2, 19, 22, 11, 1, 1, 26, 15, 2, 2, 28, 13, 2, 3, 30, 11, 1]],
            ['#D97706', [2, 0, 13, 1, 1, 1, 3, 1, 13, 1, 3, 1, 1, 2, 1, 2, 15, 2, 1, 2, 0, 3, 1, 3, 16, 3, 1, 3, 17, 5, 1, 3, 31, 5, 1, 3, 18, 7, 2, 3, 29, 7, 2, 3, 20, 8, 9, 1, 17, 9, 1, 3, 31, 9, 1, 3, 0, 11, 1, 3, 16, 11, 1, 3, 1, 13, 1, 3, 15, 13, 1, 3, 2, 15, 2, 3, 13, 15, 2, 3, 4, 16, 9, 1, 1, 17, 1, 3, 15, 17, 1, 3, 0, 19, 1, 3, 16, 19, 1, 3, 17, 21, 1, 3, 31, 21, 1, 3, 18, 23, 2, 3, 29, 23, 2, 3, 20, 24, 9, 1, 17, 25, 1, 3, 31, 25, 1, 3, 0, 27, 1, 3, 16, 27, 1, 3, 1, 29, 1, 3, 15, 29, 1, 3, 2, 31, 2, 1, 13, 31, 2, 1]],
            ['#451A03', [4, 1, 9, 1, 2, 2, 1, 1, 14, 2, 1, 1, 1, 4, 1, 1, 15, 4, 1, 1, 0, 6, 1, 1, 16, 6, 1, 1, 20, 9, 9, 1, 18, 10, 1, 1, 30, 10, 1, 1, 17, 12, 1, 1, 31, 12, 1, 1, 0, 14, 1, 1, 16, 14, 1, 1, 4, 17, 9, 1, 2, 18, 1, 1, 14, 18, 1, 1, 1, 20, 1, 1, 15, 20, 1, 1, 0, 22, 1, 1, 16, 22, 1, 1, 20, 25, 9, 1, 18, 26, 1, 1, 30, 26, 1, 1, 17, 28, 1, 1, 31, 28, 1, 1, 0, 30, 1, 1, 16, 30, 1, 1]],
            ['#F59E0B', [0, 2, 1, 1, 16, 2, 1, 1, 17, 4, 1, 1, 31, 4, 1, 1, 18, 6, 1, 1, 30, 6, 1, 1, 20, 7, 9, 1, 0, 10, 1, 1, 16, 10, 1, 1, 1, 12, 1, 1, 15, 12, 1, 1, 2, 14, 1, 1, 14, 14, 1, 1, 4, 15, 9, 1, 0, 18, 1, 1, 16, 18, 1, 1, 17, 20, 1, 1, 31, 20, 1, 1, 18, 22, 1, 1, 30, 22, 1, 1, 20, 23, 9, 1, 0, 26, 1, 1, 16, 26, 1, 1, 1, 28, 1, 1, 15, 28, 1, 1, 2, 30, 1, 1, 14, 30, 1, 1, 4, 31, 9, 1]],
            ['#FEF08A', [6, 6, 2, 2, 22, 14, 2, 2, 6, 22, 2, 2, 22, 30, 2, 2]]
        ];

        for (let c = 0; c < rectData.length; c++) {
            ctx.fillStyle = rectData[c][0];
            const r = rectData[c][1];
            for (let i = 0; i < r.length; i += 4) {
                ctx.fillRect(x + r[i], y + r[i + 1], r[i + 2], r[i + 3]);
            }
        }
    }

    drawHoneyFlower(ctx, x, y) {
        // Big Blooming 4-Petal Pink Flower (no side green leaves, no drop line, bigger & better)
        const C_OUTLINE = '#880E4F';
        const C_PETAL_DARK = '#C2185B';
        const C_PETAL_BASE = this.theme.woodBase;   // #E91E63
        const C_PETAL_LIGHT = this.theme.woodLight; // #FF4081
        const C_PETAL_HI = '#F48FB1';
        const C_CORE_GOLD = this.theme.woodAccent;  // #FFEE58
        const C_CORE_AMBER = '#FFB300';

        // 1. Petal Outlines
        ctx.fillStyle = C_OUTLINE;
        // Top Petal
        ctx.fillRect(x + 11, y + 2, 10, 1);
        ctx.fillRect(x + 9, y + 3, 14, 8);
        // Bottom Petal
        ctx.fillRect(x + 9, y + 21, 14, 8);
        ctx.fillRect(x + 11, y + 29, 10, 1);
        // Left Petal
        ctx.fillRect(x + 2, y + 11, 1, 10);
        ctx.fillRect(x + 3, y + 9, 8, 14);
        // Right Petal
        ctx.fillRect(x + 21, y + 9, 8, 14);
        ctx.fillRect(x + 29, y + 11, 1, 10);
        // Center body
        ctx.fillRect(x + 8, y + 8, 16, 16);

        // 2. Petal Base Fills
        ctx.fillStyle = C_PETAL_BASE;
        // Top
        ctx.fillRect(x + 11, y + 3, 10, 1);
        ctx.fillRect(x + 10, y + 4, 12, 7);
        // Bottom
        ctx.fillRect(x + 10, y + 21, 12, 7);
        ctx.fillRect(x + 11, y + 28, 10, 1);
        // Left
        ctx.fillRect(x + 3, y + 11, 1, 10);
        ctx.fillRect(x + 4, y + 10, 7, 12);
        // Right
        ctx.fillRect(x + 21, y + 10, 7, 12);
        ctx.fillRect(x + 28, y + 11, 1, 10);
        // Center junction
        ctx.fillRect(x + 9, y + 9, 14, 14);

        // 3. 3D Shading on Bottom and Right Petals
        ctx.fillStyle = C_PETAL_DARK;
        ctx.fillRect(x + 10, y + 23, 12, 5);
        ctx.fillRect(x + 11, y + 28, 10, 1);
        ctx.fillRect(x + 23, y + 10, 5, 12);
        ctx.fillRect(x + 28, y + 11, 1, 10);

        // 4. Sunlit Highlights on Top and Left Petals
        ctx.fillStyle = C_PETAL_LIGHT;
        ctx.fillRect(x + 11, y + 3, 10, 2);
        ctx.fillRect(x + 10, y + 5, 12, 2);
        ctx.fillRect(x + 3, y + 11, 2, 10);
        ctx.fillRect(x + 5, y + 10, 2, 12);

        ctx.fillStyle = C_PETAL_HI;
        ctx.fillRect(x + 12, y + 4, 8, 1);
        ctx.fillRect(x + 4, y + 12, 1, 8);

        // Dewdrop glints
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 14, y + 3, 4, 1);
        ctx.fillRect(x + 3, y + 14, 1, 4);

        // 5. Golden Stamen Pollen Center
        ctx.fillStyle = C_CORE_AMBER;
        ctx.fillRect(x + 10, y + 10, 12, 12);
        ctx.fillStyle = C_CORE_GOLD;
        ctx.fillRect(x + 11, y + 11, 10, 10);
        ctx.fillStyle = '#FFF9C4';
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 14, y + 14, 4, 4);
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    // ==========================================
    // 16. PIRATE GALLEON
    // ==========================================
    drawShipGround(ctx, x, y) {
        ctx.fillStyle = this.theme.groundDarker;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundDark;
        ctx.fillRect(x, y + 7, 32, 2);
        ctx.fillRect(x, y + 15, 32, 2);
        ctx.fillRect(x, y + 23, 32, 2);
        ctx.fillRect(x, y + 31, 32, 1);
        ctx.fillStyle = '#D7CCC8';
        ctx.fillRect(x + 4, y + 4, 1, 1);
        ctx.fillRect(x + 20, y + 12, 1, 1);
        ctx.fillRect(x + 10, y + 20, 1, 1);
    }

    drawShipBulkhead(ctx, x, y) {
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 4, y + 4, 24, 4);
        ctx.fillRect(x + 4, y + 24, 24, 4);
        ctx.fillStyle = '#0E0E12';
        ctx.fillRect(x + 8, y + 8, 16, 16);
        ctx.fillStyle = '#212124';
        ctx.fillRect(x + 11, y + 11, 10, 10);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = this.theme.wallAccent;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        ctx.fillRect(x + 26, y + 2, 4, 4);
        ctx.fillRect(x + 2, y + 26, 4, 4);
        ctx.fillRect(x + 26, y + 26, 4, 4);
    }

    drawRumBarrel(ctx, x, y) {
        // Pirate Oak Rum Cask with Crisp Dark Outer Border Outline (Distinct from Floor)
        // Floor contact drop shadow
        ctx.fillStyle = '#1D120B';
        ctx.fillRect(x + 3, y + 28, 26, 4);

        // Solid dark ironwood outer border outline (clearly silhouettes cask from deck planks)
        ctx.fillStyle = '#150D0A';
        ctx.fillRect(x + 5, y + 1, 22, 28);
        ctx.fillRect(x + 4, y + 4, 24, 23);
        ctx.fillRect(x + 3, y + 8, 26, 15);

        // Rich oak wood body inside border
        ctx.fillStyle = this.theme.woodBase; // #795548
        ctx.fillRect(x + 6, y + 2, 20, 26);
        ctx.fillRect(x + 5, y + 5, 22, 21);
        ctx.fillRect(x + 4, y + 9, 24, 13);

        // Curved stave lighting & shadow gradients
        ctx.fillStyle = this.theme.woodLight; // #8D6E63 (sunlit staves)
        ctx.fillRect(x + 7, y + 2, 6, 26);
        ctx.fillRect(x + 6, y + 5, 6, 21);
        ctx.fillStyle = this.theme.woodDark; // #5D4037 (shaded staves)
        ctx.fillRect(x + 21, y + 2, 4, 26);
        ctx.fillRect(x + 22, y + 5, 4, 21);

        // Forged iron barrel hoops (with bevels)
        ctx.fillStyle = '#263238'; // Dark iron hoop body
        ctx.fillRect(x + 5, y + 4, 22, 3);
        ctx.fillRect(x + 4, y + 11, 24, 3);
        ctx.fillRect(x + 4, y + 18, 24, 3);
        ctx.fillRect(x + 5, y + 24, 22, 3);

        // Iron hoop metallic sheen & steel rivets
        ctx.fillStyle = '#78909C'; // Hoop light reflection
        ctx.fillRect(x + 7, y + 5, 5, 1);
        ctx.fillRect(x + 6, y + 12, 5, 1);
        ctx.fillRect(x + 6, y + 19, 5, 1);
        ctx.fillRect(x + 7, y + 25, 5, 1);
        ctx.fillStyle = '#CFD8DC'; // Rivet glints
        ctx.fillRect(x + 6, y + 5, 1, 1); ctx.fillRect(x + 25, y + 5, 1, 1);
        ctx.fillRect(x + 5, y + 12, 1, 1); ctx.fillRect(x + 26, y + 12, 1, 1);
        ctx.fillRect(x + 5, y + 19, 1, 1); ctx.fillRect(x + 26, y + 19, 1, 1);
        ctx.fillRect(x + 6, y + 25, 1, 1); ctx.fillRect(x + 25, y + 25, 1, 1);

        // Oak tap bunghole & wooden spigot plug
        ctx.fillStyle = '#211208'; // Bunghole cavity
        ctx.fillRect(x + 14, y + 14, 4, 3);
        ctx.fillStyle = '#100804';
        ctx.fillRect(x + 15, y + 15, 2, 1);
        ctx.fillStyle = this.theme.woodHighlight; // Golden amber spigot head
        ctx.fillRect(x + 15, y + 16, 2, 2);
    }

    // ==========================================
    // 17. WILD WEST OUTPOST (Frontier Trail + Fort Log Palisade + Red TNT Dynamite Crate)
    // ==========================================
    drawWesternGround(ctx, x, y) {
        // Frontier Trail & Weathered Saloon Wood Boardwalk
        ctx.fillStyle = this.theme.groundDarker; // #7A5528
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Dusty ochre boardwalk timber planks
        ctx.fillStyle = this.theme.groundBase; // #C19A6B
        ctx.fillRect(x, y + 1, 32, 9);
        ctx.fillRect(x, y + 11, 32, 10);
        ctx.fillRect(x, y + 22, 32, 9);

        // Plank plank seams & shadow lines
        ctx.fillStyle = this.theme.groundDarker; // #7A5528
        ctx.fillRect(x, y + 10, 32, 1);
        ctx.fillRect(x, y + 21, 32, 1);

        // Weathered wood plank grain lines
        ctx.fillStyle = this.theme.groundDark; // #A07848
        ctx.fillRect(x + 4, y + 4, 12, 1);
        ctx.fillRect(x + 20, y + 6, 9, 1);
        ctx.fillRect(x + 2, y + 14, 16, 1);
        ctx.fillRect(x + 22, y + 17, 8, 1);
        ctx.fillRect(x + 6, y + 25, 14, 1);

        // Forged iron deck nails
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(x + 2, y + 3, 2, 2);
        ctx.fillRect(x + 29, y + 3, 2, 2);
        ctx.fillRect(x + 2, y + 13, 2, 2);
        ctx.fillRect(x + 29, y + 13, 2, 2);
        ctx.fillRect(x + 2, y + 24, 2, 2);
        ctx.fillRect(x + 29, y + 24, 2, 2);
    }

    drawWesternWall(ctx, x, y) {
        // Heavy Frontier Fort Vertical Log Palisade Wall (Indestructible)
        ctx.fillStyle = '#271612'; // Deep timber drop shadow
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // 3 Vertical Heavy Pine Fort Logs (widths: 9px, 10px, 9px)
        // Log 1 (Left: x+2 to x+10)
        ctx.fillStyle = this.theme.wallDark; // #3E2723
        ctx.fillRect(x + 2, y + 3, 9, 27);
        ctx.fillStyle = this.theme.wallBase; // #5D4037
        ctx.fillRect(x + 3, y + 3, 7, 26);
        ctx.fillStyle = this.theme.wallLight; // #795548
        ctx.fillRect(x + 3, y + 3, 2, 26);
        // Rounded log top cap
        ctx.fillStyle = this.theme.wallHighlight; // #D7CCC8
        ctx.fillRect(x + 3, y + 1, 7, 3);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 4, y + 2, 5, 2);

        // Log 2 (Center: x+11 to x+20)
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 11, y + 2, 10, 28);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 12, y + 2, 8, 27);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 12, y + 2, 2, 27);
        // Rounded log top cap (taller center log)
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 12, y + 0, 8, 3);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 13, y + 1, 6, 2);

        // Log 3 (Right: x+21 to x+29)
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 21, y + 3, 9, 27);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 22, y + 3, 7, 26);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 22, y + 3, 2, 26);
        // Rounded log top cap
        ctx.fillStyle = this.theme.wallHighlight;
        ctx.fillRect(x + 22, y + 1, 7, 3);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 23, y + 2, 5, 2);

        // Natural wood bark knots
        ctx.fillStyle = '#271612';
        ctx.fillRect(x + 5, y + 14, 3, 3);
        ctx.fillRect(x + 15, y + 19, 3, 3);
        ctx.fillRect(x + 24, y + 11, 3, 3);

        // Heavy horizontal forged iron bracing band across center
        ctx.fillStyle = '#18181B'; // Iron strap
        ctx.fillRect(x + 1, y + 21, 30, 4);
        ctx.fillStyle = '#52525B'; // Iron bevel
        ctx.fillRect(x + 1, y + 21, 30, 1);
        // Square iron rivets on band
        ctx.fillStyle = '#E4E4E7';
        ctx.fillRect(x + 6, y + 22, 2, 2);
        ctx.fillRect(x + 15, y + 22, 2, 2);
        ctx.fillRect(x + 24, y + 22, 2, 2);
    }

    drawWesternBlock(ctx, x, y) {
        // Red TNT Dynamite Explosives Crate (Destructible)
        ctx.fillStyle = this.theme.woodShadow; // #450A0A
        ctx.fillRect(x + 3, y + 27, 26, 4); // Drop shadow

        // Outer wooden crate frame (x+2 to x+29, y+3 to x+27)
        ctx.fillStyle = '#3E2723'; // Dark timber frame
        ctx.fillRect(x + 2, y + 4, 28, 24);
        ctx.fillStyle = '#8D6E63'; // Crate wood
        ctx.fillRect(x + 3, y + 5, 26, 22);

        // 3 Packed Red Cylindrical TNT Dynamite Sticks
        ctx.fillStyle = this.theme.woodEdge; // #7F1D1D
        ctx.fillRect(x + 4, y + 6, 24, 18);
        ctx.fillStyle = this.theme.woodBase; // Vibrant red #DC2626
        ctx.fillRect(x + 5, y + 7, 22, 16);

        // Dynamite stick separation lines
        ctx.fillStyle = this.theme.woodDark; // #B91C1C
        ctx.fillRect(x + 5, y + 12, 22, 1);
        ctx.fillRect(x + 5, y + 17, 22, 1);

        // Cylindrical light highlights on sticks
        ctx.fillStyle = this.theme.woodLight; // #EF4444
        ctx.fillRect(x + 5, y + 7, 22, 1);
        ctx.fillRect(x + 5, y + 13, 22, 1);
        ctx.fillRect(x + 5, y + 18, 22, 1);

        // Prominent Yellow Stenciled "TNT" Warning Label in Center
        ctx.fillStyle = '#18181B'; // Black stencil backing
        ctx.fillRect(x + 7, y + 10, 18, 8);
        ctx.fillStyle = this.theme.woodAccent; // Bright yellow #F59E0B
        ctx.fillRect(x + 8, y + 11, 16, 6);

        // "TNT" Letters:
        // 'T'
        ctx.fillStyle = '#18181B';
        ctx.fillRect(x + 9, y + 12, 4, 1);
        ctx.fillRect(x + 10, y + 12, 2, 4);
        // 'N'
        ctx.fillRect(x + 14, y + 12, 1, 4);
        ctx.fillRect(x + 15, y + 13, 1, 2);
        ctx.fillRect(x + 16, y + 12, 1, 4);
        // 'T'
        ctx.fillRect(x + 18, y + 12, 4, 1);
        ctx.fillRect(x + 19, y + 12, 2, 4);

        // Braided hemp fuse cord leading out from top of crate
        ctx.fillStyle = '#78350F';
        ctx.fillRect(x + 14, y + 2, 2, 4);
        ctx.fillRect(x + 16, y + 1, 3, 2);

        // Burning Fiery Fuse Spark!
        ctx.fillStyle = '#FF9100';
        ctx.fillRect(x + 18, y + 0, 4, 4);
        ctx.fillStyle = '#FFD54F';
        ctx.fillRect(x + 19, y + 1, 2, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 19, y + 1, 1, 1);

        // Corner steel bracing brackets on crate
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 2, y + 4, 4, 4);
        ctx.fillRect(x + 26, y + 4, 4, 4);
        ctx.fillRect(x + 2, y + 24, 4, 4);
        ctx.fillRect(x + 26, y + 24, 4, 4);
        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(x + 3, y + 5, 2, 2);
        ctx.fillRect(x + 27, y + 5, 2, 2);
        ctx.fillRect(x + 3, y + 25, 2, 2);
        ctx.fillRect(x + 27, y + 25, 2, 2);
    }

    drawMushroomGround(ctx, x, y) { this.drawWesternGround(ctx, x, y); }
    drawMushroomWall(ctx, x, y) { this.drawWesternWall(ctx, x, y); }
    drawMushroomBlock(ctx, x, y) { this.drawWesternBlock(ctx, x, y); }

    // ==========================================
    // 18. CLOCKWORK STEAMWORKS (Cancelled Middle Squares, Clean Brass Floor)
    // ==========================================
    drawClockworkGround(ctx, x, y) {
        // Clean simple warm bronze floor plate without busy middle squares
        ctx.fillStyle = this.theme.groundDarker; // #5D4037
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // Solid bronze #8D6E63
        ctx.fillRect(x + 1, y + 1, 30, 30);
        // Subtle clean edge highlight
        ctx.fillStyle = this.theme.groundDark;
        ctx.fillRect(x + 2, y + 2, 28, 1);
        ctx.fillRect(x + 2, y + 2, 1, 28);
    }

    drawSteamBoiler(ctx, x, y) {
        ctx.fillStyle = this.theme.wallEdge;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.wallBase;
        ctx.fillRect(x + 3, y + 2, 26, 28);
        ctx.fillStyle = this.theme.wallLight;
        ctx.fillRect(x + 5, y + 4, 6, 24);
        ctx.fillStyle = this.theme.wallDark;
        ctx.fillRect(x + 3, y + 8, 26, 3);
        ctx.fillRect(x + 3, y + 21, 26, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 12, y + 12, 8, 8);
        ctx.fillStyle = '#D50000';
        ctx.fillRect(x + 15, y + 13, 2, 4);
    }

    drawClockworkGears(ctx, x, y) {
        ctx.fillStyle = this.theme.woodEdge;
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillStyle = this.theme.woodBase;
        ctx.fillRect(x + 3, y + 3, 26, 26);
        ctx.fillStyle = this.theme.woodLight;
        ctx.fillRect(x + 7, y + 7, 18, 18);
        ctx.fillStyle = this.theme.woodDark;
        ctx.fillRect(x + 10, y + 10, 12, 12);
        ctx.fillStyle = this.theme.woodAccent;
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = '#FFF8E1';
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    // ==========================================
    // 19. VAMPIRE CATHEDRAL (Checkered Marble + Halloween Head Wall + Framed Cross Tile)
    // ==========================================
    drawVampireGround(ctx, x, y) {
        // Lighter Gothic Checkered Marble Floor
        ctx.fillStyle = this.theme.groundDarker; // Mortar seam #1A1119
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Dark plum marble flagstones (lightened from old black!)
        ctx.fillStyle = this.theme.groundBase; // #2D1F2A
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillRect(x + 17, y + 17, 14, 14);
        ctx.fillStyle = '#43303F'; // Plum marble bevel
        ctx.fillRect(x + 2, y + 2, 12, 1); ctx.fillRect(x + 2, y + 2, 1, 12);
        ctx.fillRect(x + 18, y + 18, 12, 1); ctx.fillRect(x + 18, y + 18, 1, 12);

        // Wine-red marble flagstones (lightened and rich!)
        ctx.fillStyle = this.theme.groundDark; // #7E2235
        ctx.fillRect(x + 17, y + 1, 14, 14);
        ctx.fillRect(x + 1, y + 17, 14, 14);
        ctx.fillStyle = '#A3364D'; // Wine marble bevel
        ctx.fillRect(x + 18, y + 2, 12, 1); ctx.fillRect(x + 18, y + 2, 1, 12);
        ctx.fillRect(x + 2, y + 18, 12, 1); ctx.fillRect(x + 2, y + 18, 1, 12);
    }

    drawHalloweenHead(ctx, x, y) {
        // Detailed 3D Sculpted Jack-o'-Lantern Pumpkin Head with Glowing Eye Sockets & Maw
        const batches = [["#2E7D32", [[17, 4, 1, 1]]], ["#FFE0B2", [[14, 8, 1, 10]]], ["#FFA726", [[9, 7, 1, 3], [9, 14, 1, 4]]], ["#81C784", [[15, 1, 1, 1], [16, 2, 2, 1], [13, 5, 1, 1]]], ["#4CAF50", [[15, 2, 1, 1], [15, 3, 3, 1], [14, 4, 3, 2]]], ["#1B5E20", [[18, 2, 1, 2], [17, 5, 1, 1], [14, 6, 4, 1]]], ["#B71C1C", [[12, 6, 1, 4], [12, 11, 1, 7], [12, 25, 1, 2]]], ["#5D1005", [[23, 6, 1, 4], [23, 11, 1, 7], [23, 25, 1, 1]]], ["#FFD54F", [[9, 19, 2, 2], [13, 19, 6, 1], [21, 19, 2, 2]]], ["#FFB74D", [[13, 7, 1, 11], [7, 18, 4, 1], [13, 18, 6, 1], [21, 18, 4, 1]]], ["#0D0400", [[9, 28, 3, 1], [20, 28, 3, 1], [5, 29, 22, 1], [9, 30, 14, 1]]], ["#FFFFFF", [[10, 12, 1, 1], [21, 12, 1, 1], [16, 14, 1, 1], [13, 20, 6, 1], [13, 21, 2, 1], [17, 21, 2, 1]]], ["#3E0A00", [[7, 19, 2, 2], [23, 19, 2, 2], [8, 21, 1, 3], [23, 21, 1, 3], [11, 23, 4, 1], [17, 23, 4, 1]]], ["#F57C00", [[12, 5, 1, 1], [11, 6, 1, 1], [13, 6, 1, 1], [10, 7, 2, 3], [10, 15, 1, 3], [10, 25, 2, 1], [11, 26, 1, 1], [12, 27, 2, 1]]], ["#FFEE58", [[9, 11, 3, 1], [20, 11, 3, 1], [10, 13, 1, 1], [21, 13, 1, 1], [15, 15, 1, 1], [11, 21, 2, 1], [19, 21, 2, 1], [11, 22, 4, 1], [17, 22, 4, 1]]], ["#1A0800", [[8, 27, 2, 1], [22, 27, 2, 1], [4, 28, 5, 1], [23, 28, 5, 1], [3, 29, 2, 1], [27, 29, 2, 1], [4, 30, 5, 1], [23, 30, 5, 1], [8, 31, 16, 1]]], ["#7F1D1D", [[8, 6, 1, 4], [19, 6, 1, 4], [8, 10, 5, 1], [19, 10, 5, 1], [8, 12, 1, 6], [19, 12, 1, 6], [15, 14, 1, 1], [15, 16, 1, 1], [8, 25, 1, 1], [19, 25, 1, 2]]], ["#BF360C", [[23, 5, 2, 1], [10, 6, 1, 1], [22, 6, 1, 1], [24, 6, 2, 2], [24, 8, 3, 3], [24, 11, 4, 1], [25, 12, 3, 9], [24, 21, 3, 3], [24, 24, 2, 2], [10, 26, 1, 1], [23, 26, 2, 1]]], ["#FFE082", [[8, 11, 1, 1], [19, 11, 1, 1], [9, 12, 1, 2], [11, 12, 1, 1], [20, 12, 1, 2], [22, 12, 1, 1], [10, 14, 1, 1], [21, 14, 1, 1], [11, 19, 1, 1], [19, 19, 1, 1], [15, 22, 1, 1]]], ["#3E1500", [[12, 4, 2, 1], [18, 4, 2, 1], [10, 5, 2, 1], [21, 5, 1, 1], [3, 13, 1, 7], [28, 13, 1, 7], [4, 21, 1, 1], [27, 21, 1, 1], [9, 26, 1, 1], [22, 26, 1, 1], [10, 27, 2, 1], [21, 27, 1, 1], [12, 28, 3, 1], [18, 28, 2, 1]]], ["#FF9800", [[18, 6, 1, 1], [14, 7, 5, 1], [15, 8, 4, 6], [20, 9, 1, 1], [11, 13, 1, 5], [17, 14, 2, 1], [20, 14, 1, 1], [16, 15, 3, 2], [20, 15, 2, 3], [15, 17, 4, 1], [11, 18, 2, 1], [12, 19, 1, 1], [11, 20, 2, 1], [9, 21, 2, 3], [15, 21, 2, 1], [16, 22, 1, 1], [15, 23, 2, 1], [13, 25, 6, 2], [14, 27, 5, 1], [15, 28, 3, 1]]], ["#E65100", [[7, 5, 2, 1], [18, 5, 3, 1], [6, 6, 2, 2], [9, 6, 1, 1], [20, 6, 2, 1], [20, 7, 3, 2], [5, 8, 3, 3], [21, 9, 2, 1], [4, 11, 4, 7], [24, 12, 1, 6], [22, 13, 1, 5], [4, 18, 3, 3], [19, 18, 2, 1], [20, 19, 1, 1], [19, 20, 2, 1], [5, 21, 3, 3], [21, 21, 2, 3], [6, 24, 18, 1], [6, 25, 2, 1], [9, 25, 1, 1], [20, 25, 3, 1], [7, 26, 2, 1], [20, 26, 2, 1], [19, 27, 2, 1]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    drawFramedCrossTile(ctx, x, y) {
        // Framed Stone Tile with Carved Crucifix Cross Inside
        ctx.fillStyle = this.theme.woodEdge;
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillStyle = this.theme.woodBase; // Stone frame #2B2B36
        ctx.fillRect(x + 3, y + 3, 26, 26);
        ctx.fillStyle = this.theme.woodLight; // #424254
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillRect(x + 4, y + 4, 2, 24);

        // Recessed inner tile
        ctx.fillStyle = this.theme.woodDark; // #171721
        ctx.fillRect(x + 6, y + 6, 20, 20);

        // Carved stone crucifix cross
        ctx.fillStyle = this.theme.woodAccent; // Marble white #ECEFF1
        ctx.fillRect(x + 14, y + 8, 4, 16); // Vertical bar
        ctx.fillRect(x + 9, y + 12, 14, 4); // Horizontal bar

        // 3D cross highlight
        ctx.fillStyle = this.theme.woodHighlight; // Pure white #FFFFFF
        ctx.fillRect(x + 14, y + 8, 1, 16);
        ctx.fillRect(x + 9, y + 12, 14, 1);
    }

    // ==========================================
    // 20. SPACE STATION (Pressurized Hull Deck + Airlock Blast Bulkhead + Plasma Battery)
    // ==========================================
    drawSpaceGround(ctx, x, y) {
        // Pressurized titanium space station deck plating
        ctx.fillStyle = this.theme.groundDarker; // #0B0D12
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // Titanium deck #1E222D
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Deck plate seams
        ctx.fillStyle = this.theme.groundDark; // #141720
        ctx.fillRect(x + 15, y + 1, 2, 30);
        ctx.fillRect(x + 1, y + 15, 30, 2);

        // Glowing cyan micro-circuit lines in deck seams
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(x + 6, y + 15, 6, 1);
        ctx.fillRect(x + 20, y + 15, 6, 1);
        ctx.fillRect(x + 15, y + 6, 1, 6);
        ctx.fillRect(x + 15, y + 20, 1, 6);
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(x + 8, y + 15, 2, 1);
        ctx.fillRect(x + 22, y + 15, 2, 1);

        // Non-slip metallic tread bolts
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 3, y + 3, 2, 2);
        ctx.fillRect(x + 27, y + 3, 2, 2);
        ctx.fillRect(x + 3, y + 27, 2, 2);
        ctx.fillRect(x + 27, y + 27, 2, 2);
    }

    drawSpaceBlastDoor(ctx, x, y) {
        // Clean, simple Sci-Fi Bulkhead Wall Panel
        ctx.fillStyle = this.theme.wallEdge; // Dark border #0F172A
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Main titanium bulkhead plate
        ctx.fillStyle = this.theme.wallBase; // #334155
        ctx.fillRect(x + 2, y + 2, 28, 28);

        // Top and left bevel highlight
        ctx.fillStyle = this.theme.wallLight; // #475569
        ctx.fillRect(x + 2, y + 2, 28, 2);
        ctx.fillRect(x + 2, y + 2, 2, 28);

        // Bottom and right shadow bevel
        ctx.fillStyle = this.theme.wallDark; // #1E293B
        ctx.fillRect(x + 2, y + 28, 28, 2);
        ctx.fillRect(x + 28, y + 2, 2, 28);

        // Recessed center square
        ctx.fillStyle = this.theme.wallDark; // #1E293B
        ctx.fillRect(x + 6, y + 6, 20, 20);
        ctx.fillStyle = this.theme.wallBase; // #334155
        ctx.fillRect(x + 8, y + 8, 16, 16);

        // Simple cross seam
        ctx.fillStyle = this.theme.wallDark; // #1E293B
        ctx.fillRect(x + 15, y + 8, 2, 16);
        ctx.fillRect(x + 8, y + 15, 16, 2);

        // 4 Clean corner steel rivets
        ctx.fillStyle = this.theme.wallHighlight; // #94A3B8
        ctx.fillRect(x + 4, y + 4, 2, 2);
        ctx.fillRect(x + 26, y + 4, 2, 2);
        ctx.fillRect(x + 4, y + 26, 2, 2);
        ctx.fillRect(x + 26, y + 26, 2, 2);

        // Center cyan indicator light
        ctx.fillStyle = this.theme.wallAccent; // #00E5FF
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    drawPlasmaBattery(ctx, x, y) {
        // Clean, simple Sci-Fi Modular Tech Crate
        ctx.fillStyle = this.theme.woodShadow; // Drop shadow #082F49
        ctx.fillRect(x + 4, y + 27, 24, 4);

        // Crate dark outer border
        ctx.fillStyle = this.theme.woodEdge; // #0C4A6E
        ctx.fillRect(x + 3, y + 3, 26, 25);

        // Crate solid body
        ctx.fillStyle = this.theme.woodBase; // #0284C7
        ctx.fillRect(x + 4, y + 4, 24, 23);

        // Top & left bevel highlights
        ctx.fillStyle = this.theme.woodLight; // #38BDF8
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillRect(x + 4, y + 4, 2, 23);

        // Bottom & right bevel shadows
        ctx.fillStyle = this.theme.woodDark; // #0369A1
        ctx.fillRect(x + 4, y + 25, 24, 2);
        ctx.fillRect(x + 26, y + 4, 2, 23);

        // Center reinforced horizontal band
        ctx.fillStyle = this.theme.woodDark; // #0369A1
        ctx.fillRect(x + 4, y + 14, 24, 4);

        // Steel protective corner caps (4 corners)
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 4, y + 4, 4, 4);
        ctx.fillRect(x + 24, y + 4, 4, 4);
        ctx.fillRect(x + 4, y + 23, 4, 4);
        ctx.fillRect(x + 24, y + 23, 4, 4);

        // Golden center security latch
        ctx.fillStyle = this.theme.woodAccent; // Gold #FACC15
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 15, y + 15, 2, 2);

        // Top specular shine
        ctx.fillStyle = this.theme.woodHighlight; // #E0F2FE
        ctx.fillRect(x + 9, y + 5, 8, 1);
    }

    // ==========================================
    // 21. NUCLEAR SILO (Simple Grayish Concrete Floor + Safety Hazard Blast Wall)
    // ==========================================
    drawNuclearGround(ctx, x, y) {
        // Simple grayish concrete floor
        ctx.fillStyle = this.theme.groundDarker; // #37474F
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // Gray concrete #546E7A
        ctx.fillRect(x + 1, y + 1, 30, 30);
        ctx.fillStyle = this.theme.groundDark;
        ctx.fillRect(x + 2, y + 2, 28, 1);
        ctx.fillRect(x + 2, y + 2, 1, 28);
    }

    drawNuclearBlastShield(ctx, x, y) {
        // Reinforced Yellow & Black Safety Hazard Blast Wall with Hazard Stripes & Warning Sign
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(x + 2, y + 2, 28, 28);

        // 1. Black diagonal hazard warning stripes on UPPER section (y+4..14)
        ctx.fillStyle = '#111827';
        for (let i = -8; i < 30; i += 6) {
            for (let step = 0; step < 8; step++) {
                const px = x + 3 + i + step;
                const py = y + 4 + step;
                if (px >= x + 3 && px <= x + 28 && py >= y + 4 && py <= y + 14) {
                    ctx.fillRect(px, py, 3, 3);
                }
            }
        }

        // 2. Steel Divider bar between lines and warning sign (y+15..16)
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 2, y + 15, 28, 1);
        ctx.fillStyle = '#FDD835';
        ctx.fillRect(x + 2, y + 16, 28, 1);

        // 3. Stamped Warning Triangle directly on the continuous yellow blast wall (No black paint around it!)
        const triangleArt = [
            [18, [['B', 15, 2]]],
            [19, [['B', 14, 1], ['Y', 15, 2], ['B', 17, 1]]],
            [20, [['B', 13, 1], ['Y', 14, 1], ['B', 15, 2], ['Y', 17, 1], ['B', 18, 1]]],
            [21, [['B', 12, 1], ['Y', 13, 2], ['B', 15, 2], ['Y', 17, 2], ['B', 19, 1]]],
            [22, [['B', 11, 1], ['Y', 12, 3], ['B', 15, 2], ['Y', 17, 3], ['B', 20, 1]]],
            [23, [['B', 10, 1], ['Y', 11, 4], ['Y', 15, 2], ['Y', 17, 4], ['B', 21, 1]]],
            [24, [['B', 9, 1], ['Y', 10, 5], ['B', 15, 2], ['Y', 17, 5], ['B', 22, 1]]],
            [25, [['B', 8, 16]]]
        ];
        for (let r = 0; r < triangleArt.length; r++) {
            const rowY = triangleArt[r][0];
            const spans = triangleArt[r][1];
            for (let s = 0; s < spans.length; s++) {
                ctx.fillStyle = spans[s][0] === 'B' ? '#111827' : '#FFEB3B';
                ctx.fillRect(x + spans[s][1], y + rowY, spans[s][2], 1);
            }
        }

        // 5. Heavy Outer Steel Perimeter Armor Frame (3px) with corner bolts
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 1, 30, 3);
        ctx.fillStyle = '#78909C';
        ctx.fillRect(x + 1, y + 1, 30, 1);

        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 28, 30, 3);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 1, y + 30, 30, 1);

        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 1, y + 1, 3, 30);
        ctx.fillStyle = '#78909C';
        ctx.fillRect(x + 1, y + 1, 1, 30);

        ctx.fillStyle = '#37474F';
        ctx.fillRect(x + 28, y + 1, 3, 30);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 30, y + 1, 1, 30);

        // Corner hex bolts
        ctx.fillStyle = '#CFD8DC';
        const bolts = [[2, 2], [28, 2], [2, 28], [28, 28]];
        for (let b = 0; b < bolts.length; b++) {
            ctx.fillRect(x + bolts[b][0], y + bolts[b][1], 2, 2);
        }
    }

    drawNuclearDrum(ctx, x, y) {
        // Detailed 2.5D Radioactive Corrugated Drum with Correct Perspective Chime Lid
        const batches = [["#94A3B8", [[11, 4, 1, 1], [19, 4, 1, 1]]], ["#00E676", [[8, 10, 1, 1], [9, 21, 1, 1]]], ["#050811", [[25, 29, 1, 1], [12, 30, 11, 1]]], ["#37474F", [[5, 6, 1, 1], [26, 6, 1, 1], [24, 7, 1, 1]]], ["#FFE0B2", [[11, 10, 1, 4], [11, 18, 1, 3], [11, 25, 1, 2]]], ["#0F172A", [[26, 29, 2, 1], [23, 30, 4, 1], [9, 31, 14, 1]]], ["#FFFFFF", [[10, 2, 2, 1], [10, 14, 2, 1], [10, 21, 2, 1], [5, 27, 1, 1]]], ["#78909C", [[10, 3, 1, 1], [21, 3, 1, 1], [7, 4, 1, 1], [24, 4, 1, 1]]], ["#263238", [[25, 5, 1, 1], [24, 6, 2, 1], [9, 7, 2, 1], [21, 7, 3, 1]]], ["#BF360C", [[25, 8, 1, 1], [24, 9, 2, 6], [24, 18, 2, 4], [24, 25, 2, 3]]], ["#CCFF90", [[7, 6, 1, 1], [7, 14, 1, 1], [8, 22, 1, 1], [5, 28, 6, 1], [5, 29, 5, 1]]], ["#E65100", [[19, 8, 3, 1], [22, 9, 2, 1], [19, 10, 5, 4], [19, 18, 5, 3], [19, 25, 5, 3]]], ["#3E1500", [[5, 17, 2, 1], [8, 17, 19, 1], [5, 24, 3, 1], [9, 24, 18, 1], [14, 28, 12, 1]]], ["#1E293B", [[10, 4, 1, 1], [12, 4, 1, 1], [20, 4, 1, 1], [10, 5, 3, 1], [19, 5, 2, 1], [14, 29, 11, 1]]], ["#76FF03", [[6, 5, 3, 1], [6, 6, 1, 1], [8, 6, 1, 1], [6, 7, 3, 1], [7, 15, 1, 1], [8, 26, 1, 1]]], ["#FFCC80", [[10, 10, 1, 4], [9, 14, 1, 1], [12, 14, 2, 1], [10, 18, 1, 3], [12, 21, 2, 1], [10, 25, 1, 2]]], ["#ECEFF1", [[12, 2, 10, 1], [7, 3, 3, 1], [22, 3, 3, 1], [6, 4, 1, 1], [25, 4, 1, 1], [5, 5, 1, 1], [26, 5, 1, 1]]], ["#39FF14", [[7, 8, 1, 6], [7, 16, 1, 3], [8, 19, 1, 3], [8, 23, 1, 3], [4, 29, 1, 1], [10, 29, 2, 1], [6, 30, 4, 1]]], ["#F57C00", [[14, 8, 5, 1], [14, 10, 1, 2], [17, 10, 2, 1], [17, 11, 1, 1], [15, 13, 2, 1], [14, 18, 5, 3], [14, 25, 5, 3]]], ["#111827", [[14, 9, 4, 1], [15, 10, 2, 2], [13, 11, 1, 1], [18, 11, 1, 1], [13, 12, 6, 1], [13, 13, 2, 1], [17, 13, 2, 1]]], ["#00C853", [[6, 27, 6, 1], [3, 28, 2, 1], [11, 28, 3, 1], [3, 29, 1, 1], [12, 29, 2, 1], [5, 30, 1, 1], [10, 30, 2, 1]]], ["#455A64", [[11, 3, 10, 1], [8, 4, 2, 1], [13, 4, 6, 2], [21, 4, 3, 1], [9, 5, 1, 1], [21, 5, 4, 1], [9, 6, 15, 1], [11, 7, 10, 1]]], ["#FF9800", [[6, 8, 1, 6], [8, 9, 1, 1], [8, 11, 1, 3], [14, 14, 5, 1], [6, 18, 1, 1], [8, 18, 1, 1], [6, 19, 2, 2], [14, 21, 5, 1], [6, 25, 2, 2]]], ["#D84315", [[5, 14, 1, 1], [19, 14, 5, 1], [26, 14, 1, 1], [5, 15, 2, 2], [8, 15, 19, 2], [5, 21, 1, 1], [19, 21, 5, 1], [26, 21, 1, 1], [5, 22, 3, 2], [9, 22, 18, 2]]], ["#2E1000", [[5, 7, 1, 7], [25, 7, 2, 1], [8, 8, 2, 1], [22, 8, 3, 1], [26, 8, 1, 6], [10, 9, 4, 1], [18, 9, 4, 1], [5, 18, 1, 3], [26, 18, 1, 3], [5, 25, 1, 2], [26, 25, 1, 4]]], ["#FFA726", [[10, 8, 4, 1], [9, 9, 1, 5], [12, 10, 2, 1], [12, 11, 1, 3], [6, 14, 1, 1], [8, 14, 1, 1], [9, 18, 1, 3], [12, 18, 2, 3], [6, 21, 2, 1], [9, 25, 1, 2], [12, 25, 2, 3]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    // ==========================================
    // 22. CASINO ROYALE (Replaces Amethyst: Green Felt Floor + Slot Machine + Poker Chips)
    // ==========================================
    drawCasinoGround(ctx, x, y) {
        // Classic Green Felt Card Table Floor
        ctx.fillStyle = this.theme.groundDarker; // #0D3811
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // Green felt #2E7D32
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Gold felt edge border
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 3, y + 3, 26, 1);
        ctx.fillRect(x + 3, y + 28, 26, 1);
        ctx.fillRect(x + 3, y + 3, 1, 26);
        ctx.fillRect(x + 28, y + 3, 1, 26);
    }

    drawCasinoDice(ctx, x, y) {
        // 3D Ivory Casino Die showing face value 5 with crimson pips
        // Drop shadow
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(x + 3, y + 29, 26, 2);
        ctx.fillRect(x + 4, y + 30, 24, 1);

        // Die outer border / rounded silhouette (26x26)
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 4, y + 2, 24, 26);
        ctx.fillRect(x + 2, y + 4, 28, 22);
        ctx.fillRect(x + 3, y + 3, 26, 24);

        // Die body (Ivory white)
        ctx.fillStyle = this.theme.wallBase; // #FFFFFF
        ctx.fillRect(x + 4, y + 3, 24, 24);
        ctx.fillRect(x + 3, y + 4, 26, 22);

        // Top and Left 3D highlight
        ctx.fillStyle = this.theme.wallLight; // #F8FAFC
        ctx.fillRect(x + 4, y + 3, 23, 2);
        ctx.fillRect(x + 3, y + 4, 2, 23);

        // Bottom and Right 3D beveled shading
        ctx.fillStyle = this.theme.wallDark; // #CBD5E1
        ctx.fillRect(x + 5, y + 26, 22, 2);
        ctx.fillRect(x + 26, y + 5, 2, 22);
        ctx.fillStyle = this.theme.wallEdge; // #94A3B8
        ctx.fillRect(x + 6, y + 27, 20, 1);
        ctx.fillRect(x + 27, y + 6, 1, 20);

        // Helper to draw a crisp 5x5 recessed crimson pip with 3D shadow and specular gloss
        const drawPip = (px, py) => {
            // Recessed socket shadow
            ctx.fillStyle = '#7F1D1D';
            ctx.fillRect(px - 1, py - 2, 3, 5);
            ctx.fillRect(px - 2, py - 1, 5, 3);
            // Rich crimson fill
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(px - 1, py - 2, 3, 4);
            ctx.fillRect(px - 2, py - 1, 4, 3);
            // Highlight specular speck
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(px - 1, py - 1, 1, 1);
        };

        // Standard casino 5-pip quincunx pattern
        // Center pip
        drawPip(x + 16, y + 16);
        // Top-left pip
        drawPip(x + 9, y + 9);
        // Top-right pip
        drawPip(x + 23, y + 9);
        // Bottom-left pip
        drawPip(x + 9, y + 23);
        // Bottom-right pip
        drawPip(x + 23, y + 23);
    }

    drawOneDollarChip(ctx, x, y) {
        // Authentic Round Royal Blue $1 Casino Token Chip
        // Drop shadow
        ctx.fillStyle = this.theme.woodShadow; // #0F172A
        ctx.fillRect(x + 8, y + 29, 16, 2);
        ctx.fillRect(x + 10, y + 30, 12, 1);

        // Circular token silhouette (approx 28px diameter)
        ctx.fillStyle = this.theme.woodEdge; // #172554
        ctx.fillRect(x + 10, y + 2, 12, 26);
        ctx.fillRect(x + 7, y + 3, 18, 24);
        ctx.fillRect(x + 5, y + 4, 22, 22);
        ctx.fillRect(x + 4, y + 5, 24, 20);
        ctx.fillRect(x + 3, y + 7, 26, 16);
        ctx.fillRect(x + 2, y + 9, 28, 12);

        // Blue chip base fill
        ctx.fillStyle = this.theme.woodBase; // #1D4ED8
        ctx.fillRect(x + 10, y + 3, 12, 24);
        ctx.fillRect(x + 7, y + 4, 18, 22);
        ctx.fillRect(x + 5, y + 5, 22, 20);
        ctx.fillRect(x + 4, y + 7, 24, 16);
        ctx.fillRect(x + 3, y + 9, 26, 12);

        // Top-left rim highlight
        ctx.fillStyle = this.theme.woodLight; // #3B82F6
        ctx.fillRect(x + 10, y + 3, 12, 2);
        ctx.fillRect(x + 6, y + 5, 5, 2);
        ctx.fillRect(x + 4, y + 8, 2, 6);

        // Bottom-right rim shadow
        ctx.fillStyle = this.theme.woodDark; // #1E40AF
        ctx.fillRect(x + 10, y + 25, 12, 2);
        ctx.fillRect(x + 21, y + 23, 5, 2);
        ctx.fillRect(x + 26, y + 16, 2, 6);

        // 4 White Edge Spot Inserts (Classic casino clay chip rim markings)
        ctx.fillStyle = '#FFFFFF';
        // Top edge insert
        ctx.fillRect(x + 14, y + 2, 4, 5);
        // Bottom edge insert
        ctx.fillRect(x + 14, y + 23, 4, 5);
        // Left edge insert
        ctx.fillRect(x + 2, y + 14, 5, 4);
        // Right edge insert
        ctx.fillRect(x + 23, y + 14, 5, 4);

        // Molded inner dashed ring / accent circle
        ctx.fillStyle = '#93C5FD';
        ctx.fillRect(x + 10, y + 8, 12, 1);
        ctx.fillRect(x + 10, y + 21, 12, 1);
        ctx.fillRect(x + 7, y + 11, 1, 8);
        ctx.fillRect(x + 24, y + 11, 1, 8);

        // Center Inlay Medallion (White circle)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 12, y + 10, 8, 10);
        ctx.fillRect(x + 11, y + 11, 10, 8);
        ctx.fillRect(x + 10, y + 12, 12, 6);

        // Golden circular border around medallion
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x + 12, y + 9, 8, 1);
        ctx.fillRect(x + 12, y + 20, 8, 1);
        ctx.fillRect(x + 9, y + 12, 1, 6);
        ctx.fillRect(x + 22, y + 12, 1, 6);

        // Crisp stamped "$1" in deep casino blue (#1E3A8A)
        ctx.fillStyle = '#1E3A8A';
        // Dollar sign ($)
        ctx.fillRect(x + 13, y + 11, 1, 8); // Vertical dollar bar
        ctx.fillRect(x + 12, y + 12, 3, 1); // Top horizontal
        ctx.fillRect(x + 11, y + 13, 1, 1); // Left upper hook
        ctx.fillRect(x + 12, y + 14, 2, 1); // Middle crossbar
        ctx.fillRect(x + 14, y + 15, 1, 1); // Right lower hook
        ctx.fillRect(x + 11, y + 16, 3, 1); // Bottom horizontal

        // Number 1
        ctx.fillRect(x + 17, y + 12, 1, 1); // Top left hook
        ctx.fillRect(x + 18, y + 11, 1, 6); // Main vertical stem
        ctx.fillRect(x + 16, y + 17, 4, 1); // Bottom base pedestal
    }

    // ==========================================
    // 23. ZEN GARDEN (Simple Clean Raked Sand + Green Bamboo Stalks + Stone Pagoda Lantern)
    // ==========================================
    drawZenGround(ctx, x, y) {
        // Peaceful raked sand / fine gravel ground
        ctx.fillStyle = this.theme.groundBase; // Sand #D7CCC8
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Neat horizontal raked furrow lines
        ctx.fillStyle = this.theme.groundDark; // #BCAAA4
        ctx.fillRect(x, y + 5, 32, 1);
        ctx.fillRect(x, y + 11, 32, 1);
        ctx.fillRect(x, y + 17, 32, 1);
        ctx.fillRect(x, y + 23, 32, 1);
        ctx.fillRect(x, y + 29, 32, 1);

        // Subtle combed furrow highlight specks
        ctx.fillStyle = '#EFEBE9';
        ctx.fillRect(x + 4, y + 6, 6, 1);
        ctx.fillRect(x + 18, y + 6, 6, 1);
        ctx.fillRect(x + 10, y + 18, 8, 1);
        ctx.fillRect(x + 2, y + 24, 6, 1);

        // Small smooth garden pebbles
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 7, y + 13, 3, 2);
        ctx.fillRect(x + 23, y + 20, 4, 2);
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + 7, y + 15, 3, 1);
        ctx.fillRect(x + 23, y + 22, 4, 1);
        ctx.fillStyle = '#D7CCC8';
        ctx.fillRect(x + 8, y + 13, 1, 1);
        ctx.fillRect(x + 25, y + 20, 1, 1);
    }

    drawZenBrickWall(ctx, x, y) {
        // Authentic Terracotta Brick Wall matching reference image
        ctx.fillStyle = '#2A0502'; // Dark mortar joints
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // 4 Running-Bond Brick Courses (y: 1..7, 9..15, 17..23, 25..31)
        const courses = [
            [1, 7, [[1, 14], [17, 14]]],
            [9, 15, [[0, 7], [9, 14], [25, 7]]],
            [17, 23, [[1, 14], [17, 14]]],
            [25, 31, [[0, 7], [9, 14], [25, 7]]]
        ];

        for (let c = 0; c < courses.length; c++) {
            const y1 = courses[c][0];
            const y2 = courses[c][1];
            const bricks = courses[c][2];
            for (let b = 0; b < bricks.length; b++) {
                const bx = bricks[b][0];
                const bw = bricks[b][1];

                // Brick face body
                ctx.fillStyle = '#8F310E';
                ctx.fillRect(x + bx, y + y1, bw, y2 - y1 + 1);

                // Golden amber top highlight bevel
                ctx.fillStyle = '#C05915';
                ctx.fillRect(x + bx, y + y1, bw, 1);

                // Warm terracotta left highlight bevel
                if (bx !== 0 || bw === 14) {
                    ctx.fillStyle = '#B8531A';
                    ctx.fillRect(x + bx, y + y1, 1, y2 - y1 + 1);
                }

                // Deep maroon shadow on bottom and right edges
                ctx.fillStyle = '#5A0D05';
                ctx.fillRect(x + bx + bw - 1, y + y1, 1, y2 - y1 + 1); // Right
                ctx.fillRect(x + bx, y + y2, bw, 1); // Bottom

                // Subtle ceramic brick grain flecks
                if (bw === 14) {
                    ctx.fillStyle = '#A84518';
                    ctx.fillRect(x + bx + 4, y + y1 + 3, 1, 1);
                    ctx.fillRect(x + bx + 11, y + y1 + 2, 1, 1);
                    ctx.fillStyle = '#75220A';
                    ctx.fillRect(x + bx + 9, y + y1 + 4, 1, 1);
                } else if (bw === 7 && bx === 0) {
                    ctx.fillStyle = '#A84518';
                    ctx.fillRect(x + bx + 3, y + y1 + 3, 1, 1);
                } else if (bw === 7 && bx === 25) {
                    ctx.fillStyle = '#75220A';
                    ctx.fillRect(x + bx + 3, y + y1 + 4, 1, 1);
                }
            }
        }
    }

    drawZenWaterWall(ctx, x, y) {
        this.drawZenBrickWall(ctx, x, y);
    }

    drawLotusLeafWall(ctx, x, y) {
        this.drawZenBrickWall(ctx, x, y);
    }

    drawZenLantern(ctx, x, y) {
        // Carved Granite Pagoda Lantern (Toro) with Glowing Golden Light
        ctx.fillStyle = this.theme.woodShadow; // #1B2327
        ctx.fillRect(x + 5, y + 27, 22, 4);

        // Pedestal base (Kiso)
        ctx.fillStyle = this.theme.woodEdge; // #263238
        ctx.fillRect(x + 6, y + 23, 20, 6);
        ctx.fillStyle = this.theme.woodDark; // #455A64
        ctx.fillRect(x + 7, y + 24, 18, 4);
        ctx.fillStyle = this.theme.woodLight; // #78909C
        ctx.fillRect(x + 7, y + 23, 18, 1);

        // Center column (Sao)
        ctx.fillStyle = this.theme.woodDark;
        ctx.fillRect(x + 11, y + 17, 10, 6);
        ctx.fillStyle = this.theme.woodBase; // #607D8B
        ctx.fillRect(x + 12, y + 17, 8, 6);

        // Mid-platform (Chudai)
        ctx.fillStyle = this.theme.woodEdge;
        ctx.fillRect(x + 5, y + 14, 22, 3);
        ctx.fillStyle = this.theme.woodDark;
        ctx.fillRect(x + 6, y + 14, 20, 2);
        ctx.fillStyle = this.theme.woodLight;
        ctx.fillRect(x + 6, y + 14, 20, 1);

        // Light chamber (Hibukuro) with glowing window
        ctx.fillStyle = this.theme.woodEdge; // Stone frame
        ctx.fillRect(x + 7, y + 7, 18, 7);
        ctx.fillStyle = this.theme.woodAccent; // Glowing amber #FFB300
        ctx.fillRect(x + 10, y + 8, 12, 5);
        ctx.fillStyle = '#FFF59D'; // Hot flame center
        ctx.fillRect(x + 12, y + 9, 8, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 14, y + 10, 4, 1);

        // Pagoda roof (Kasa) with curved flared eaves
        ctx.fillStyle = this.theme.woodEdge;
        ctx.fillRect(x + 3, y + 4, 26, 3);
        ctx.fillRect(x + 2, y + 3, 2, 2); // Upturned left tip
        ctx.fillRect(x + 28, y + 3, 2, 2); // Upturned right tip
        ctx.fillStyle = this.theme.woodBase;
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillStyle = this.theme.woodLight;
        ctx.fillRect(x + 8, y + 2, 16, 2);

        // Jewel finial at top (Hoju)
        ctx.fillStyle = this.theme.woodHighlight; // #CFD8DC
        ctx.fillRect(x + 14, y + 0, 4, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 15, y + 0, 2, 1);
    }

    // ==========================================
    // 24. CELESTIAL TEMPLE (Solid Black Floor + 1px White Star Dots + Astral Prism Block)
    // ==========================================
    drawCelestialGround(ctx, x, y) {
        // Pure solid black floor
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Balanced single-pixel white star dots distributed across the tile
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 5, y + 7, 1, 1);
        ctx.fillRect(x + 24, y + 4, 1, 1);
        ctx.fillRect(x + 12, y + 16, 1, 1);
        ctx.fillRect(x + 27, y + 20, 1, 1);
        ctx.fillRect(x + 8, y + 25, 1, 1);
        ctx.fillRect(x + 19, y + 28, 1, 1);
    }

    drawCelestialColumn(ctx, x, y) {
        // Pure black space background around column (seamlessly blending with starry sky)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Winged Alabaster Temple Column
        ctx.fillStyle = this.theme.wallBase; // #FFFFFF
        ctx.fillRect(x + 3, y + 2, 26, 28);
        ctx.fillStyle = this.theme.wallDark; // #CFD8DC
        ctx.fillRect(x + 6, y + 6, 2, 20);
        ctx.fillRect(x + 24, y + 6, 2, 20);

        // Golden angelic wings
        ctx.fillStyle = this.theme.wallHighlight; // #FFD700
        ctx.fillRect(x + 2, y + 4, 4, 8);
        ctx.fillRect(x + 26, y + 4, 4, 8);

        // Solar disc crest
        ctx.fillRect(x + 11, y + 11, 10, 10);
        ctx.fillStyle = this.theme.wallAccent; // #00E5FF
        ctx.fillRect(x + 13, y + 13, 6, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 15, y + 15, 2, 2);
    }

    drawCelestialSunstone(ctx, x, y) {
        // Radiant Celestial Solar Relic / Radiant Sunstone Block
        ctx.fillStyle = this.theme.woodShadow; // #78350F
        ctx.fillRect(x + 5, y + 27, 22, 4);

        // 4 Cardinal Star Points
        ctx.fillStyle = this.theme.woodEdge; // Amber-gold outline #B45309
        ctx.fillRect(x + 14, y + 1, 4, 4);  // Top point
        ctx.fillRect(x + 14, y + 27, 4, 4); // Bottom point
        ctx.fillRect(x + 1, y + 14, 4, 4);  // Left point
        ctx.fillRect(x + 27, y + 14, 4, 4); // Right point

        // 4 Diagonal Points
        ctx.fillRect(x + 4, y + 4, 4, 4);
        ctx.fillRect(x + 24, y + 4, 4, 4);
        ctx.fillRect(x + 4, y + 24, 4, 4);
        ctx.fillRect(x + 24, y + 24, 4, 4);

        // Main circular solar frame
        ctx.fillRect(x + 3, y + 5, 26, 22);
        ctx.fillRect(x + 5, y + 3, 22, 26);

        // Radiant gold solar body
        ctx.fillStyle = this.theme.woodBase; // #F59E0B
        ctx.fillRect(x + 5, y + 5, 22, 22);

        // Corona layer
        ctx.fillStyle = this.theme.woodLight; // #FBBF24
        ctx.fillRect(x + 7, y + 7, 18, 18);

        // Inner fire ring
        ctx.fillStyle = this.theme.woodDark; // #D97706
        ctx.fillRect(x + 10, y + 10, 12, 12);

        // Blazing white-hot core
        ctx.fillStyle = this.theme.woodAccent; // #FEF08A
        ctx.fillRect(x + 12, y + 12, 8, 8);

        // Diamond star sparkle in core
        ctx.fillStyle = this.theme.woodHighlight; // Pure white #FFFFFF
        ctx.fillRect(x + 14, y + 13, 4, 2);
        ctx.fillRect(x + 15, y + 12, 2, 4);
    }

    // ==========================================
    // 25. GOLDEN EMPEROR'S PALACE (Replaces Inferno: Royal Marble + Fluted Gilded Pillar + Diamond Jewel)
    // ==========================================
    drawPalaceGround(ctx, x, y) {
        // Polished royal white palace marble floor
        ctx.fillStyle = this.theme.groundDarker; // #B0BEC5
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = this.theme.groundBase; // White marble #ECEFF1
        ctx.fillRect(x + 1, y + 1, 30, 30);

        // Gold inlay floor trim
        ctx.fillStyle = '#FFD54F';
        ctx.fillRect(x + 3, y + 3, 26, 1);
        ctx.fillRect(x + 3, y + 28, 26, 1);
        ctx.fillRect(x + 3, y + 3, 1, 26);
        ctx.fillRect(x + 28, y + 3, 1, 26);

        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(x + 14, y + 14, 4, 4);
    }

    drawPalaceColossus(ctx, x, y) {
        // Imperial Gilded Obsidian Column (Contrasts sharply with Royal White Marble Floor!)
        // Fill area around the column with floor base color (#ECEFF1)
        ctx.fillStyle = this.theme.groundBase; // #ECEFF1 (Palace floor base color)
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Column drop shadow onto white marble
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(x + 2, y + 28, 28, 4);

        // --- Bottom Tiered Gilded Plinth Base (y+23 to y+30) ---
        ctx.fillStyle = '#0F172A'; // Obsidian base step
        ctx.fillRect(x + 3, y + 23, 26, 3);
        ctx.fillStyle = '#C79A00'; // Dark gold molding
        ctx.fillRect(x + 2, y + 26, 28, 4);
        ctx.fillStyle = '#FFD700'; // Pure polished gold band
        ctx.fillRect(x + 3, y + 26, 26, 2);
        ctx.fillStyle = '#FFF59D'; // Plinth highlight
        ctx.fillRect(x + 4, y + 26, 24, 1);
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(x + 2, y + 29, 28, 2);

        // --- Central Fluted Obsidian Black Marble Shaft (y+8 to y+23) ---
        // Deep Obsidian Black Marble core
        ctx.fillStyle = '#030712'; // Black shadow outline
        ctx.fillRect(x + 3, y + 8, 26, 15);
        ctx.fillStyle = '#0F172A'; // Deep obsidian marble shaft
        ctx.fillRect(x + 4, y + 8, 24, 15);

        // Shaft left facet (metallic slate obsidian highlight)
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x + 4, y + 8, 3, 15);

        // Shaft right facet (midnight shadow)
        ctx.fillStyle = '#030712';
        ctx.fillRect(x + 25, y + 8, 3, 15);

        // 4 Vertical Polished Gold Fluted Grooves down the dark shaft
        ctx.fillStyle = '#FFD700'; // Polished gold fluting
        ctx.fillRect(x + 7, y + 8, 2, 15);
        ctx.fillRect(x + 12, y + 8, 2, 15);
        ctx.fillRect(x + 18, y + 8, 2, 15);
        ctx.fillRect(x + 23, y + 8, 2, 15);

        // Fluting highlights & depth
        ctx.fillStyle = '#FFF9C4';
        ctx.fillRect(x + 7, y + 8, 1, 15);
        ctx.fillRect(x + 12, y + 8, 1, 15);
        ctx.fillStyle = '#C79A00';
        ctx.fillRect(x + 19, y + 8, 1, 15);
        ctx.fillRect(x + 24, y + 8, 1, 15);

        // --- Top Ornate Gilded Corinthian Capital (y+1 to y+8) ---
        ctx.fillStyle = '#C79A00'; // Gold border
        ctx.fillRect(x + 2, y + 1, 28, 7);
        ctx.fillStyle = '#FFD700'; // Pure polished gold capital
        ctx.fillRect(x + 3, y + 2, 26, 5);
        ctx.fillStyle = '#FFF9C4'; // Top gold highlight
        ctx.fillRect(x + 3, y + 2, 26, 1);

        // Corinthian Acanthus volute scroll accents
        ctx.fillStyle = '#FFA000';
        ctx.fillRect(x + 3, y + 5, 5, 2);
        ctx.fillRect(x + 24, y + 5, 5, 2);
        ctx.fillRect(x + 13, y + 4, 6, 2);
        ctx.fillStyle = '#FFF59D';
        ctx.fillRect(x + 4, y + 5, 2, 1);
        ctx.fillRect(x + 26, y + 5, 2, 1);

        // --- Royal Imperial Ruby Medallion Crest in Center ---
        ctx.fillStyle = '#B45309'; // Gold medallion border
        ctx.fillRect(x + 10, y + 11, 12, 10);
        ctx.fillStyle = '#FFD700'; // Gold shield
        ctx.fillRect(x + 11, y + 12, 10, 8);
        ctx.fillStyle = '#FFF59D';
        ctx.fillRect(x + 12, y + 12, 8, 1);

        // Faceted Imperial Ruby Jewel
        ctx.fillStyle = '#7F1D1D'; // Ruby bezel
        ctx.fillRect(x + 12, y + 13, 8, 6);
        ctx.fillStyle = '#DC2626'; // Radiant crimson ruby
        ctx.fillRect(x + 13, y + 14, 6, 4);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(x + 14, y + 14, 4, 2);
        ctx.fillStyle = '#FFFFFF'; // Diamond specular glint
        ctx.fillRect(x + 14, y + 14, 2, 1);
    }

    drawDiamondJewel(ctx, x, y) {
        // Fragile Celestial Diamond Crystal Block with Crystalline Fissures
        const batches = [["#64748B", [[4, 28, 6, 1], [23, 28, 6, 1]]], ["#334155", [[3, 29, 27, 1], [6, 30, 21, 1]]], ["#38BDF8", [[8, 19, 2, 1], [7, 20, 5, 1], [6, 21, 6, 2], [7, 23, 5, 1], [8, 24, 3, 2], [9, 26, 1, 1]]], ["#F0F9FF", [[9, 5, 2, 1], [8, 6, 3, 1], [7, 7, 1, 1], [9, 7, 3, 1], [6, 8, 3, 1], [10, 8, 2, 1], [8, 9, 2, 1]]], ["#7DD3FC", [[20, 10, 1, 1], [19, 11, 2, 3], [12, 13, 1, 1], [12, 14, 2, 1], [11, 15, 2, 1], [14, 15, 1, 1], [16, 15, 4, 1], [11, 16, 1, 1], [19, 16, 1, 1], [11, 18, 1, 2]]], ["#0369A1", [[27, 9, 1, 1], [24, 10, 4, 4], [25, 14, 3, 1], [24, 15, 4, 6], [18, 17, 2, 1], [16, 18, 2, 1], [19, 18, 1, 1], [17, 19, 1, 2], [19, 19, 2, 1], [19, 20, 1, 1], [18, 21, 2, 1], [18, 22, 1, 1]]], ["#BAE6FD", [[22, 5, 2, 1], [21, 6, 4, 1], [21, 7, 5, 1], [19, 8, 8, 1], [20, 9, 7, 1], [10, 11, 1, 1], [9, 12, 2, 3], [23, 14, 2, 1], [9, 15, 1, 2], [21, 15, 2, 1], [8, 17, 2, 1], [16, 17, 2, 1], [7, 19, 1, 1], [13, 21, 1, 1], [12, 22, 1, 2], [11, 24, 1, 2]]], ["#E0F2FE", [[13, 8, 1, 1], [15, 8, 4, 1], [16, 9, 4, 1], [6, 10, 2, 1], [18, 10, 2, 1], [6, 11, 4, 1], [12, 11, 1, 2], [18, 11, 1, 3], [6, 12, 3, 5], [13, 13, 1, 1], [19, 14, 2, 1], [6, 17, 2, 1], [11, 17, 1, 1], [15, 17, 1, 1], [6, 18, 4, 1], [14, 18, 1, 2], [6, 19, 1, 2], [13, 20, 1, 1]]], ["#FFFFFF", [[10, 4, 13, 1], [11, 5, 11, 1], [11, 6, 10, 1], [8, 7, 1, 1], [12, 7, 9, 1], [9, 8, 1, 1], [12, 8, 1, 1], [14, 8, 1, 1], [5, 9, 3, 1], [10, 9, 6, 1], [5, 10, 1, 12], [8, 10, 10, 1], [11, 11, 1, 4], [13, 11, 5, 2], [14, 13, 4, 1], [14, 14, 5, 1], [10, 15, 1, 5], [13, 15, 1, 1], [15, 15, 1, 2], [12, 16, 1, 1]]], ["#0284C7", [[21, 10, 3, 4], [21, 14, 2, 1], [20, 15, 1, 1], [23, 15, 1, 1], [13, 16, 2, 1], [16, 16, 3, 1], [20, 16, 4, 3], [12, 17, 3, 1], [12, 18, 2, 2], [15, 18, 1, 1], [18, 18, 1, 3], [15, 19, 2, 1], [21, 19, 3, 1], [12, 20, 1, 2], [14, 20, 3, 1], [14, 21, 4, 1], [13, 22, 5, 1], [13, 23, 6, 1], [12, 24, 7, 1], [12, 25, 8, 1], [10, 26, 10, 1], [10, 27, 11, 1]]], ["#075985", [[10, 3, 13, 1], [9, 4, 1, 1], [23, 4, 1, 1], [8, 5, 1, 1], [24, 5, 1, 1], [7, 6, 1, 1], [25, 6, 1, 1], [6, 7, 1, 1], [26, 7, 1, 1], [5, 8, 1, 1], [27, 8, 1, 1], [4, 9, 1, 13], [28, 9, 1, 12], [20, 20, 4, 1], [20, 21, 9, 1], [4, 22, 2, 1], [19, 22, 10, 1], [5, 23, 2, 1], [19, 23, 9, 1], [6, 24, 2, 1], [19, 24, 8, 1], [7, 25, 1, 1], [20, 25, 6, 1], [8, 26, 1, 1], [20, 26, 5, 1], [9, 27, 1, 1], [21, 27, 3, 1], [10, 28, 13, 1]]]];
        for (let b = 0; b < batches.length; b++) {
            ctx.fillStyle = batches[b][0];
            const rects = batches[b][1];
            for (let i = 0; i < rects.length; i++) {
                const r = rects[i];
                ctx.fillRect(x + r[0], y + r[1], r[2], r[3]);
            }
        }
    }

    // ==========================================
    // BLOCK INTERACTION METHODS
    // ==========================================
    destroyBlock(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX >= 0 && tileX < this.cols && tileY >= 0 && tileY < this.rows) {
            if (this.grid[tileY][tileX] === 2) {
                this.grid[tileY][tileX] = 0;
                this.invalidateTile(tileX, tileY);
                if (this.onBlockChanged) this.onBlockChanged(tileX, tileY, 0);
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
                this.invalidateTile(tileX, tileY);
                if (this.onBlockChanged) this.onBlockChanged(tileX, tileY, 3);
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
                this.invalidateTile(tileX, tileY);
                if (this.onBlockChanged) this.onBlockChanged(tileX, tileY, 0);
                return true;
            }
        }
        return false;
    }
}
