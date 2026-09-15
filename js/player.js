const PLAYER_PALETTE = [
    'transparent', // 0
    '#172033',     // 1: dark outline / navy
    '#1677D2',     // 2: main blue
    '#49B9FF',     // 3: blue highlight
    '#FFD43B',     // 4: yellow helmet badge / belt
    '#FFD0A6',     // 5: skin
    '#E84646',     // 6: red gloves / boots
    '#FFFFFF',     // 7: eye highlight
    '#101218'      // 8: almost black
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
    'x': 8
};

function makeSprite(rows) {
    return {
        pattern: rows.map((row) => {
            const fixedRow = row.padEnd(16, '.').slice(0, 16);
            return [...fixedRow].map(pixel => PIXEL_KEY[pixel] ?? 0);
        }),
        colors: PLAYER_PALETTE
    };
}

function mirrorSprite(rows) {
    return rows.map(row => [...row].reverse().join(''));
}

const DOWN_BODY = [
    '................',
    '.....kkkkkk.....',
    '....kbhhhbk.....',
    '...kbhyyyyhbk...',
    '...kbhbyybhbk...',
    '...kbsssssbk...',
    '...kbsxssxsbk...',
    '...kbssssssbk...',
    '...krksssskrk...',
    '....kbbkkbbk....',
    '...krbbbybbrk...',
    '...kbbbbbbbbk...'
];

const DOWN_LEGS_A = [
    '....kbbbkkbbk...',
    '....kbbk..kbbk..',
    '...krrrk..krrrk.',
    '...krrrk..krrrk.'
];

const DOWN_LEGS_B = [
    '....kbbbkkbbk...',
    '....kbbk..kbbk..',
    '..krrrk....krrrk',
    '..krrrk....krrrk'
];

const UP_BODY = [
    '................',
    '.....kkkkkk.....',
    '....kbhhhbk.....',
    '...kbbbbbbbbk...',
    '...kbbbbbbbbk...',
    '...kbbhhhhbbk...',
    '...kbbbbbbbbk...',
    '...kbbbbbbbbk...',
    '...krkbbbbkrk...',
    '....kbbkkbbk....',
    '...krbbbybbrk...',
    '...kbbbbbbbbk...'
];

const UP_LEGS_A = [
    '....kbbbkkbbk...',
    '....kbbk..kbbk..',
    '...krrrk..krrrk.',
    '...krrrk..krrrk.'
];

const UP_LEGS_B = [
    '....kbbbkkbbk...',
    '....kbbk..kbbk..',
    '..krrrk....krrrk',
    '..krrrk....krrrk'
];

const LEFT_BODY = [
    '................',
    '......kkkkkk....',
    '.....kbhhhbk....',
    '....kbhyyyybk...',
    '....kbbbsssbk...',
    '....kbbxs.ssbk..',
    '....kbbssssbk...',
    '....kbbbbbkk....',
    '...krkbbbbbk....',
    '....kbbbbbbk....',
    '..krrkbbbybk....',
    '...kbbbbbbbk....'
];

const LEFT_LEGS_A = [
    '.....kbbkkbbk...',
    '.....kbk..kbk...',
    '....krrk..krrk..',
    '....krrk..krrk..'
];

const LEFT_LEGS_B = [
    '.....kbbkkbbk...',
    '.....kbk..kbk...',
    '...krrk....krrk.',
    '...krrk....krrk.'
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
        makeSprite([...LEFT_BODY, ...LEFT_LEGS_A]),
        makeSprite([...LEFT_BODY, ...LEFT_LEGS_B])
    ],
    right: [
        makeSprite(mirrorSprite([...LEFT_BODY, ...LEFT_LEGS_A])),
        makeSprite(mirrorSprite([...LEFT_BODY, ...LEFT_LEGS_B]))
    ]
};

class Player {
    constructor(game) {
        this.game = game;
        this.width = 32;
        this.height = 32;
        this.x = 32;
        this.y = 32;
        this.bombs = [];
        this.maxBombs = 3;
        this.bombRange = 2;
        this.baseSpeed = 2;
        this.lives = 0;
        this.invincible = 0;
        this.targetX = 32;
        this.targetY = 32;
        this.moving = false;
        
        
        this.direction = 'down'; 
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.walkCycle = 0; 
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
        
        
        if (this.game.input.getKey(' ') && this.bombs.length < this.maxBombs) {
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
    }
    
    drawPixelArt(ctx, x, y) {
        const sprites = PLAYER_SPRITES[this.direction];
        const currentSprite = sprites[this.animationFrame];
        const { pattern, colors } = currentSprite;

        // 16 source pixels × 2 canvas pixels = 32×32 final character.
        const pixelSize = 2;

        // Keep the sprite on whole canvas pixels: important for sharp pixel art.
        const drawX = Math.round(x);
        let drawY = Math.round(y);

        // Very subtle walk bounce.
        if (this.moving) {
            drawY += Math.round(Math.sin(this.animationTimer * 0.35));
        }

        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                const colorIndex = pattern[row][col];

                if (colorIndex === 0) continue;

                ctx.fillStyle = colors[colorIndex];
                ctx.fillRect(
                    drawX + col * pixelSize,
                    drawY + row * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        }
    }draw(ctx) {
        
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
