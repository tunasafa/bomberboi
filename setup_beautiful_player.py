import re

with open('js/player.js', 'r') as f:
    code = f.read()

sprites_code = """const PLAYER_PALETTE = [
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
"""

# Replace everything before `class Player`
class_start = code.find("class Player {")
if class_start != -1:
    old_class = code[class_start:]
    
    # ensure pixelSize is fully 2 (or dynamic) and uses Math.round
    draw_art_pattern = r'drawPixelArt\(ctx,\s*x,\s*y\)\s*\{.*?\}\s*(?=\s*draw\(ctx\))'
    new_draw_art = """drawPixelArt(ctx, x, y) {
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
    }"""
    old_class = re.sub(draw_art_pattern, new_draw_art, old_class, flags=re.DOTALL)
    
    with open('js/player.js', 'w') as f:
        f.write(sprites_code + "\n" + old_class)
    print("Updated player.js successfully.")
else:
    print("Failed to find class Player")
