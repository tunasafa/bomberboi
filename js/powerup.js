// Shared 16×16 icon language for the game world and the HUD scoreboard.
const POWERUP_PALETTE = {
    '.': 'transparent',
    'k': '#101827', // deep navy outline
    'K': '#25344A', // dark surface
    'm': '#6C7A8C', // metal shadow
    'c': '#C8D3E0', // metal highlight
    'b': '#1677D2', // blue
    'h': '#49B9FF', // blue highlight
    'd': '#0C4A8F', // blue shadow
    'y': '#FFD43B', // gold
    'g': '#C99620', // gold shadow
    'o': '#FF8A1E', // orange
    'O': '#FFE052', // bright flame
    'r': '#E84646', // red
    'q': '#A72E38', // red shadow
    'w': '#FFFFFF', // highlight
    'f': '#8B4A23'  // fuse
};

const POWERUP_SPRITES = {
    bombUp: [
        '.......kk.......',
        '......kOOk......',
        '......kook......',
        '.......ff.......',
        '......kffk......',
        '.....kKKKKk.....',
        '....kKmmmKKk....',
        '...kKcccKKKKk...',
        '...kKcwcKKKKk...',
        '...kKmmKKKKKk...',
        '...kKmmmmKKKk...',
        '....kKmmmKKk....',
        '.....kKKKKk.....',
        '......kkkk......',
        '......kkkk......',
        '......dddd......'
    ],
    rangeUp: [
        '.......kk.......',
        '......kook......',
        '......oooo......',
        '.....koOOok.....',
        '....koOOOOok....',
        '...koOOOOOOok...',
        '.kooOOOOOOOOook.',
        'koyyyyywwyyyyyok',
        'kkyyyyyyyyyyyykk',
        '.kkkOOOOOOOOkkk.',
        '...kkOOOOOOkk...',
        '....kkooookk....',
        '.....kooook.....',
        '......kook......',
        '......kook......',
        '.......kk.......'
    ],
    speedUp: [
        '................',
        '.......kk.......',
        '......kOOk......',
        '.....kOOOOk.....',
        '....kOOOOOkk....',
        '...h.kOOOOOkk...',
        '..kOOOOOkk......',
        '.hh.kOOOkk......',
        '.kOOOyyyyyyk....',
        '..kkOOOOOOk.....',
        '....kOOOOk......',
        '...h.kOOOk......',
        '....kOOOk.......',
        '...kOkk.........',
        '...kk...........',
        '................'
    ],
    extraLife: [
        '................',
        '..krrk....krrk..',
        '.krrrrk..krrrrk.',
        'kqqwwrrrrrrrrrrk',
        'kqwwrrrrrrrrrrrk',
        'krqqqrrrrrrrrrrk',
        '.kqqqrrrrrrrrrk.',
        '.krqqqrrrrrrrrk.',
        '..krqqqrrrrrrk..',
        '...krqqqrrrrk...',
        '....krqqrrrk....',
        '.....krrrrk.....',
        '......krrk......',
        '.......kk.......',
        '................',
        '................'
    ]
};

// Shrink the 16px source icons to the nearest whole-pixel 14px version. This
// keeps the requested smaller silhouette sharp at both 1x HUD and 2x world
// scale instead of introducing blurry fractional canvas pixels.
const POWERUP_RENDER_SIZE = 14;

function shrinkPowerupSprite(sprite, targetSize = POWERUP_RENDER_SIZE) {
    return Array.from({ length: targetSize }, (_, row) => {
        const sourceRow = Math.round(row * (sprite.length - 1) / (targetSize - 1));

        return Array.from({ length: targetSize }, (_, col) => {
            const sourceCol = Math.round(col * (sprite[sourceRow].length - 1) / (targetSize - 1));
            return sprite[sourceRow][sourceCol];
        }).join('');
    });
}

const POWERUP_RENDER_SPRITES = {};
Object.keys(POWERUP_SPRITES).forEach(type => {
    POWERUP_RENDER_SPRITES[type] = shrinkPowerupSprite(POWERUP_SPRITES[type]);
});

class Powerup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type; // 'bombUp', 'rangeUp', 'speedUp', or 'extraLife'
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
        
        if (window.updatePowerupsDisplay) {
            window.updatePowerupsDisplay(this.game.player);
        }
    }

    draw(ctx) {
        if (!this.active) return;
        
        const floatY = Math.round(Math.sin(this.animationTimer * 0.1) * 3);
        const drawY = this.y + floatY;
        
        Powerup.drawIcon(ctx, this.type, this.x, drawY, 2);
    }
    
    static drawIcon(ctx, type, x, y, scale = 1) {
        const sprite = POWERUP_RENDER_SPRITES[type];
        if (!sprite) return;
        
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        const offset = (16 - sprite.length) * scale / 2;
        for (let row = 0; row < sprite.length; row++) {
            for (let col = 0; col < sprite[row].length; col++) {
                const char = sprite[row][col];
                if (char !== '.') {
                    ctx.fillStyle = POWERUP_PALETTE[char];
                    ctx.fillRect(
                        x + offset + col * scale,
                        y + offset + row * scale,
                        scale,
                        scale
                    );
                }
            }
        }
        ctx.restore();
    }
}
