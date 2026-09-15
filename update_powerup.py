import re

with open('js/powerup.js', 'r') as f:
    code = f.read()

# I want to add the sprites at the top, and modify draw() to use Powerup.drawIcon

new_code = """const POWERUP_PALETTE = {
    '.': 'transparent',
    'x': '#000000', // black outline / bomb body
    'X': '#333333', // dark grey
    'g': '#999999', // light grey (bomb highlight, metal)
    'b': '#1E90FF', // blue (boot)
    'B': '#49B9FF', // light blue (wings)
    'w': '#FFFFFF', // white (highlight)
    'r': '#E84646', // red (heart)
    'R': '#990000', // dark red
    'o': '#FF6600', // orange (fire)
    'y': '#FFD700', // yellow (fire)
    'f': '#8B4513'  // brown (fuse)
};

const POWERUP_SPRITES = {
    bombUp: [
        '................',
        '.......o........',
        '......yoy.......',
        '.......f........',
        '......Xxx.......',
        '....xxxxxxx.....',
        '...xxxgggxxx....',
        '...xxgggggxx....',
        '...xxggxxxxx....',
        '...xxxxxxxxx....',
        '...xxxxxxxxx....',
        '....xxxxxxx.....',
        '.....xxxxx......',
        '................',
        '................',
        '................'
    ],
    rangeUp: [
        '................',
        '.......o........',
        '......ooo.......',
        '.....ooooo......',
        '.....ooyoo......',
        '....ooyyyoo.....',
        '....oyyyyyo.....',
        '...oyyyyyyyo....',
        '...oyywwwyyo....',
        '...oyywwwyyo....',
        '...oyyyyyyyo....',
        '....oyyyyyo.....',
        '.....ooooo......',
        '......ooo.......',
        '................',
        '................'
    ],
    speedUp: [
        '................',
        '....B...........',
        '...BBB......bb..',
        '...B.B.....bbw..',
        '..B..B....bbbb..',
        '..BBBB...bbbbb..',
        '...BBBBBbbbbbb..',
        '.......bbbbbbb..',
        '.....bbbbbbbbb..',
        '....bbbbbbbbbb..',
        '...g.g.g.g.g.g..',
        '...xxxxxxxxxxx..',
        '...x.x.x.x.x.x..',
        '................',
        '................',
        '................'
    ],
    extraLife: [
        '................',
        '................',
        '..rrrr....rrrr..',
        '.rrrrrr..rrrrrr.',
        '.rrwwrr..rrrrrr.',
        '.rrwwrrrrrrrrrr.',
        '.rrrrrrrrrrrrrr.',
        '..rrrrrrrrrrrr..',
        '...rrrrrrrrrr...',
        '....rrrrrrrr....',
        '.....rrrrrr.....',
        '......rrrr......',
        '.......rr.......',
        '................',
        '................',
        '................'
    ]
};

"""

old_class = code[code.find("class Powerup {"):]

# Replace the draw method with the new one
draw_pattern = r'draw\(ctx\) \{.*?\}\s*\}'
new_draw = """draw(ctx) {
        if (!this.active) return;
        
        const floatY = Math.round(Math.sin(this.animationTimer * 0.1) * 3);
        const drawY = this.y + floatY;
        
        Powerup.drawIcon(ctx, this.type, this.x, drawY, 2);
    }
    
    static drawIcon(ctx, type, x, y, scale = 1) {
        const sprite = POWERUP_SPRITES[type];
        if (!sprite) return;
        
        ctx.save();
        for (let row = 0; row < sprite.length; row++) {
            for (let col = 0; col < sprite[row].length; col++) {
                const char = sprite[row][col];
                if (char !== '.') {
                    ctx.fillStyle = POWERUP_PALETTE[char];
                    ctx.fillRect(
                        x + col * scale,
                        y + row * scale,
                        scale,
                        scale
                    );
                }
            }
        }
        ctx.restore();
    }
}"""
old_class = re.sub(draw_pattern, new_draw, old_class, flags=re.DOTALL)

with open('js/powerup.js', 'w') as f:
    f.write(new_code + old_class)

