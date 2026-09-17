// Hand-authored native 32×32 player art. Each character is one crisp canvas
// pixel, so the silhouette and highlights stay readable at game scale.
const PLAYER_PALETTE = [
    'transparent', // 0
    '#172033',     // 1: dark outline / navy
    '#1677D2',     // 2: main blue
    '#49B9FF',     // 3: blue highlight
    '#FFD43B',     // 4: yellow helmet badge / belt
    '#FFD0A6',     // 5: skin
    '#E84646',     // 6: red gloves / boots
    '#FFFFFF',     // 7: eye highlight
    '#101218',     // 8: almost black
    '#0C4A8F',     // 9: blue shadow
    '#D89572',     // 10: skin shadow
    '#A72E38',     // 11: red shadow
    '#C99620',     // 12: gold shadow
    '#FFE7C7'      // 13: skin highlight
];

const PIXEL_KEY = {
    '.': 0,
    'k': 1,
    'b': 2,
    'h': 3,
    'y': 4,
    's': 5,
    'r': 6,
    'w': 7,
    'x': 8,
    'd': 9,
    'a': 10,
    'q': 11,
    'g': 12,
    'f': 13
};

function makeSprite(rows) {
    return {
        pattern: rows.map((row) => {
            const fixedRow = row.padEnd(32, '.').slice(0, 32);
            return [...fixedRow].map(pixel => PIXEL_KEY[pixel] ?? 0);
        }),
        colors: PLAYER_PALETTE
    };
}

function mirrorSprite(rows) {
    return rows.map(row => [...row].reverse().join(''));
}

const DOWN_BODY = [
    '............kkkkkkkk............',
    '.........kkbhhhhhhbbbkk.........',
    '.......kkbhhhhhhbbbbbbbkk.......',
    '......kkbhhhhhyyggbbbbbbkk......',
    '.....ddbhhhhbyyxxyybbbbbddd.....',
    '....kddhhhbbbyyxxxybbbbbdddk....',
    '....kddbbbbbbyyxxyybbbbbdddk....',
    '...kkddbbbbbbyyxxxybbbbbdddkk...',
    '...kkddbbbbbbyyxxyybbbbbdddkk...',
    '...kkddbbksffffffffffskbbddkk...',
    '.krrrddbbaasssssssssffsbbddrrrk.',
    '.kqhhddbbaasssssssssffsbbddhhqk.',
    '.kqqrddbbaaxwxssssxwxfsbbddrqqk.',
    '.kqqrddbbaaxxxssssxxxfsbbddrqqk.',
    '.kqqrddbbaasssssssssffsbbddrqqk.',
    '.kqqrddbbaassssaasssffkbbddrqqk.',
    '.krrrddbbkkssxxffxxsskkbbddrrrk.',
    '..........kkaaxxxxaakk..........',
    '..........kkksaaaaskkk..........',
    '.....kssskbbbbbbbbbbbbksssk.....',
    '.....ksskkbhhhbbbbbbbbkkssk.....',
    '.....bbbkkbhhbbbbbbbbbkkbbb.....',
    '..kqhhhrkkbbbbbbbbbbddkkrhhhqk..',
    '..kqrrrrkkbbbbbbbbbbddkkrrrqqk..'
];

const DOWN_LEGS_A = [
    '..kqqrrrkkyyyyygwgyyyykkrrrqqk..',
    '..kqqrrrkkbbbbbbxbbbbbkkrrrqqk..',
    '..kqqrrrkkkbbbk..kbbbkkkrrrqqk..',
    '.........kkbbbk..kbbbkk.........',
    '.........kkbbbk..kbbbkk.........',
    '......kkrwwwrrrk.krrwwwqqkk.....',
    '......kkrhhhrrrk.krrhhhqqkk.....',
    '......kkrqqqrrrk.krrrrqqqkk.....'
];

const DOWN_LEGS_B = [
    '..kqqrrrkkyyyyygwgyyyykkrrrqqk..',
    '..kqqrrrkkbbbbbbxbbbbbkkrrrqqk..',
    '..kqqrrrk.kkbbbkkbbbkk.krrrqqk..',
    '..........kkbbbkkbbbkk..........',
    '..........kkbbbkkbbbkk..........',
    '........kwwwqqrrkrrrwwwqkk......',
    '........khhhqqrrkrrrhhhqkk......',
    '........kkrqqqrrkrrrrqqqkk......'
];

const UP_BODY = [
    '............kkkkkkkk............',
    '.........kkbhhhhhhhbbkk.........',
    '.......kkbhhhbbbbbbbbbbkk.......',
    '......kkhhhhbbbbbbbbbbbddd......',
    '.....kkhhhhbbbbbbbbbbbbdddk.....',
    '....kkhhhhbbbbbbbbbbbbbdddkk....',
    '....kkbbbbbbbbbbbbbbbbbdddkk....',
    '...kkbbbbbbbbbbbbbbbbbbdddbkk...',
    '...kkbbbddddddddddddddddddbkk...',
    '...kkbbkkbbbbbbbbbbbbbbkkdbkk...',
    '...kkbbkkbbbbbbbbbbbbbbkkbbkk...',
    '...kkbkkbbbbbyyyyyybbbbbkkbkk...',
    '......kkbbbbbyyxxyybbbbbkk......',
    '......kkdddddggxxggdddddkk......',
    '......kkbbbbbyyyyyybbbbbkk......',
    '......kkbbbbbbbbbbbbbbbbkk......',
    '.......kkbbbbbbbbbbbbbbkk.......',
    '........kkbbbbbbbbbbbbkk........',
    '..........kkkkkkkkkkkk..........',
    '.....kkbbbkkkkkkkkkkkkbbbkk.....',
    '.....kkbbb............bbbkk.....',
    '.....kkbbkbhhbbbbbbbbbkbbkk.....',
    '..krrrrkkkbhbbbbbbbbbbkkkrrrrk..',
    '..krrrrkkkbbbbbbbbbbddkkkrrrrk..'
];

const UP_LEGS_A = [
    '..krrrrkkkyyyyywwyyyyykkkrrrrk..',
    '..krrrrkbkyyyyyxxyyyyykbkrrrrk..',
    '..krrrrkkbbbbbk..kbbbbbkkrrrrk..',
    '.......kkbbbbbk..kbbbbbkk.......',
    '.......kkbbbbbk..kbbbbbkk.......',
    '.....kkrrrrrrrk..krrrrrrrkk.....',
    '.....kkrrrrrrrk..krrrrrrrkk.....',
    '.....kkrrrrrrrk..krrrrrrrkk.....'
];

const UP_LEGS_B = [
    '..krrrrkkkyyyyywwyyyyykkkrrrrk..',
    '..krrrrkbkyyyyyxxyyyyykbkrrrrk..',
    '..krrrrkkkbbbbbkkbbbbbkkkrrrrk..',
    '........kkbbbbbkkbbbbbkk........',
    '........kkbbbbbkkbbbbbkk........',
    '.......kkrrrrrrkkrrrrrrkk.......',
    '.......kkrrrrrrkkrrrrrrkk.......',
    '.......kkrrrrrrkkrrrrrrkk.......'
];

const LEFT_BODY = [
    '.............kkkkkkk............',
    '..........kkbhhhhhhbbkk.........',
    '........kkbhhhhhbbbbbbbkk.......',
    '.......kkhhhhhbbbbbbbbbbkk......',
    '......kkhhhhbbbbbyyyybbbbkk.....',
    '.....kkhhhhbbbbbbyyxxybbbbkk....',
    '....kkddbbbbbbbbbyxxxybbbbdkk...',
    '....kkddbbbbbbbbbyyxxybbbbdkk...',
    '....kkddbbbbbbbbbbyybbbbbbdkk...',
    '....kbbbbkksssssssssskkbbddkk...',
    '...kbbbbkkffffssssssssskkkk.....',
    '...khhbbkssxwxsssssssskk........',
    '..kkhhbksssxxxsssssssskk........',
    '..kkhhbksssssssssssssskk........',
    '...kkbbaassssssssssssskk........',
    '....kkksssxfffxssssssskk........',
    '.....kkkssffffssssssskk.........',
    '......kkkkssssssssskkk..........',
    '........kkksssssskkk............',
    '.........kkbbbbbbbbbkk..........',
    '.......kkhhhbbbbbbbbddkk........',
    '.......kkhkbhhhbbbbbbkdk........',
    '......kkkkkbhhbbbbbbbbkk........',
    '.....kqqrrrbbbbbbbbbddkk........'
];

const LEFT_LEGS_A = [
    '....kqqrrrkyyyyygwgyyykk........',
    '....kqqrrrbkyyyyyyxyyyykb.......',
    '....kqqrrrbbbbk..kbbbbkk........',
    '.....kkkkkbbbbk..kbbbbkk........',
    '........kkbbbbk..kbbbbkk........',
    '......kkrwwwrrrk.krrwwwqqkk.....',
    '......kkrhhhrrrk.krrhhhqqkk.....',
    '......kkrqqqrrrk.krrrrqqqkk.....'
];

const LEFT_LEGS_B = [
    '....kqqrrrkyyyyygwgyyykk........',
    '....kqqrrrbkyyyyyyxyyyykb.......',
    '....kqqrrrbbbbkkbbbbkk..........',
    '.....kkkkkbbbbkkbbbbkk..........',
    '.........kkbbbbkkbbbbkk.........',
    '........kwwwqqrrkrrrwwwqkk......',
    '........khhhqqrrkrrrhhhqkk......',
    '........kkrqqqrrkrrrrqqqkk......'
];

// The side profile keeps the helmet, face, shoulders, gloves, belt, pants,
// and boots in one continuous silhouette. Right-facing art is mirrored below.
const SIDE_PROFILE_BODY = [
    '............kkkkkkkk............',
    '..........kkbbbbbbbbkk..........',
    '........kkbbhhhhhbbbbbkk........',
    '.......kkbhhhhhhbbbbbbbkk.......',
    '......kkyyhhhhbbbbbbbbbbbk......',
    '.....kkyyxxbbbbbbbbbbbbbbbk.....',
    '....kkkyyxxbbbbbbbbbbbbbbbbk....',
    '....kkbbbbbbbbkkrrrrkkbbbbbk....',
    '....kkbbbbbbbbkrrrrrrrrkbbbk....',
    '....kksssssssskrrrrrrrrrrkbk....',
    '....kssssssssskrrrrrrrrrrkbk....',
    '....ksssxxxssskrrrrrrrrrrkbk....',
    '....ksssxxwssskrrrrrrrrkbbhk....',
    '....ksssssssssskkrrrrkkbbhhk....',
    '.....kkssssssssskkkkkbbbbbk.....',
    '......kksssxxssskkbbbbbbbk......',
    '.......kkssssssskkbbbbbbk.......',
    '........kkkkkkkkkkkkkkkk........',
    '.........kkbbbbbbbbbbkk.........',
    '........kkbbbbkssskkbbkk........',
    '........kkbbbbkbbbk.bbkk........',
    '........kkbbbbkbbbk.bbkk........',
    '.........kbbkkrrrrkkbbk.........',
    '.........kbbkrrrrrrkbbk.........'
];

const SIDE_PROFILE_LEGS_A = [
    '.........kkykrrrrrrkykk.........',
    '.........kkbkrrrrrrkbkk.........',
    '.........kkbkkrrrrkkbkk.........',
    '.........kkkkkkkkkkkkkk.........',
    '..........kkbbk..kkbbk..........',
    '........kkrwwwrkkwwwrrkk........',
    '........kkrhhhrkkhhhrrkk........',
    '........kkrrrrrkkrrrrrkk........'
];

const SIDE_PROFILE_LEGS_B = [
    '.........kkykrrrrrrkykk.........',
    '.........kkbkrrrrrrkbkk.........',
    '.........kkbkkrrrrkkbkk.........',
    '.........kkkkkkkkkkkkkk.........',
    '..........kkbbk..kkbbk..........',
    '......kkrwwwrk....kwwwrrkk......',
    '......kkrhhhrk....khhhrrkk......',
    '......kkrrrrrk....krrrrrkk......'
];
const PLAYER_SPRITES = {
    down: [
        makeSprite([...DOWN_BODY, ...DOWN_LEGS_A]),
        makeSprite([...DOWN_BODY, ...DOWN_LEGS_B])
    ],
    up: [
        makeSprite([...UP_BODY, ...UP_LEGS_A]),
        makeSprite([...UP_BODY, ...UP_LEGS_B])
    ],
    left: [
        makeSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_A]),
        makeSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_B])
    ],
    right: [
        makeSprite(mirrorSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_A])),
        makeSprite(mirrorSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_B]))
    ]
};

// Multiplayer color palettes for each player slot
const MP_PLAYER_PALETTES = [
    PLAYER_PALETTE, // P1: default blue
    [ // P2: Red
        'transparent', '#331017', '#D21616', '#FF4949',
        '#FFD43B', '#FFD0A6', '#46E8E8', '#FFFFFF',
        '#101218', '#8F0C0C', '#D89572', '#2EA7A7',
        '#C99620', '#FFE7C7'
    ],
    [ // P3: Green
        'transparent', '#0B3317', '#16D233', '#49FF6B',
        '#FFD43B', '#FFD0A6', '#E846E8', '#FFFFFF',
        '#101218', '#0C8F1A', '#D89572', '#A72EA7',
        '#C99620', '#FFE7C7'
    ],
    [ // P4: Purple
        'transparent', '#2B1033', '#8B16D2', '#B849FF',
        '#FFD43B', '#FFD0A6', '#E8E846', '#FFFFFF',
        '#101218', '#5A0C8F', '#D89572', '#A7A72E',
        '#C99620', '#FFE7C7'
    ]
];

const MP_PLAYER_NAMES = ['BLUE', 'RED', 'GREEN', 'PURPLE'];
const MP_PLAYER_COLORS = ['#1677D2', '#D21616', '#16D233', '#8B16D2'];

// Generate recolored sprites for a given palette
function makeRecoloredSprites(palette) {
    function makeRecoloredSprite(rows, pal) {
        return {
            pattern: rows.map((row) => {
                const fixedRow = row.padEnd(32, '.').slice(0, 32);
                return [...fixedRow].map(pixel => PIXEL_KEY[pixel] ?? 0);
            }),
            colors: pal
        };
    }
    return {
        down: [
            makeRecoloredSprite([...DOWN_BODY, ...DOWN_LEGS_A], palette),
            makeRecoloredSprite([...DOWN_BODY, ...DOWN_LEGS_B], palette)
        ],
        up: [
            makeRecoloredSprite([...UP_BODY, ...UP_LEGS_A], palette),
            makeRecoloredSprite([...UP_BODY, ...UP_LEGS_B], palette)
        ],
        left: [
            makeRecoloredSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_A], palette),
            makeRecoloredSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_B], palette)
        ],
        right: [
            makeRecoloredSprite(mirrorSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_A]), palette),
            makeRecoloredSprite(mirrorSprite([...SIDE_PROFILE_BODY, ...SIDE_PROFILE_LEGS_B]), palette)
        ]
    };
}

// Pre-generate all recolored sprite sets
const MP_PLAYER_SPRITE_SETS = MP_PLAYER_PALETTES.map(pal => makeRecoloredSprites(pal));

class Player {
    constructor(game, colorSlot) {
        this.game = game;
        this.colorSlot = colorSlot || 0;
        this.width = 32;
        this.height = 32;
        this.x = 32;
        this.y = 32;
        this.bombs = [];
        this.maxBombs = 1;
        this.bombRange = 1;
        this.baseSpeed = 2;
        this.lives = 0;
        this.alive = true;
        this.invincible = 0;
        this.targetX = 32;
        this.targetY = 32;
        this.moving = false;
        
        
        this.direction = 'down'; 
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.walkCycle = 0; 
        this.bombKeyWasDown = false;
    }
    
    update() {
        this.animationTimer++;
        if (this.invincible > 0) this.invincible--;
        
        
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
            
            const speed = this.baseSpeed;
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
        
        
        const isSpaceDown = this.game.input.getKey(' ');
        if (isSpaceDown && !this.bombKeyWasDown && this.bombs.length < this.maxBombs) {
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
                this.game.sound.playSound('bomb');
            }
        }
        
        this.bombKeyWasDown = isSpaceDown;
    }
    
    drawPixelArt(ctx, x, y) {
        const spriteSet = (this.colorSlot > 0) ? MP_PLAYER_SPRITE_SETS[this.colorSlot] : PLAYER_SPRITES;
        const sprites = spriteSet[this.direction];
        const currentSprite = sprites[this.animationFrame];
        const { pattern, colors } = currentSprite;

        // Keep the sprite on whole canvas pixels: important for sharp pixel art.
        const drawX = Math.round(x);
        let drawY = Math.round(y);

        // Use cached offscreen canvas for this sprite frame
        const cacheKey = `${this.colorSlot}-${this.direction}-${this.animationFrame}`;
        if (!Player._spriteCache[cacheKey]) {
            const offscreen = document.createElement('canvas');
            offscreen.width = 32;
            offscreen.height = pattern.length;
            const offCtx = offscreen.getContext('2d');
            offCtx.imageSmoothingEnabled = false;

            for (let row = 0; row < pattern.length; row++) {
                for (let col = 0; col < pattern[row].length; col++) {
                    const colorIndex = pattern[row][col];
                    if (colorIndex === 0) continue;
                    offCtx.fillStyle = colors[colorIndex];
                    offCtx.fillRect(col, row, 1, 1);
                }
            }
            Player._spriteCache[cacheKey] = offscreen;
        }

        ctx.drawImage(Player._spriteCache[cacheKey], drawX, drawY);
    }

    draw(ctx) {
        
        ctx.save();
        
        
        ctx.imageSmoothingEnabled = false;
        
        
        if (this.invincible === 0 || Math.floor(this.animationTimer / 6) % 2 === 0) {
            this.drawPixelArt(ctx, this.x, this.y);
            
            if (this.game.settings && this.game.settings.retroEffects) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                for (let i = 0; i < this.height; i += 2) {
                    ctx.fillRect(this.x, this.y + i, this.width, 1);
                }
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

// Static cache shared across all Player instances — pre-rendered sprite canvases
Player._spriteCache = {};
