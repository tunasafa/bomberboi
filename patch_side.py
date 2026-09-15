import re

with open('js/player.js', 'r') as f:
    content = f.read()

new_side = """// The side profile keeps the helmet, face, shoulders, gloves, belt, pants,
// and boots in one continuous silhouette. Right-facing art is mirrored below.
const SIDE_PROFILE_BODY = [
    '............kkkkkkkk............',
    '.........kkbhhhhhhbbbkk.........',
    '.......kkbhhhhhhbbbbbbbkk.......',
    '......kkyyhhhhbbbbbbbbbbkk......',
    '.....kkyyxxbbbbbbbbbbbbbbbkk....',
    '....kkyyxxbbbbbbbbbbbbbbbbbbk...',
    '....kkyyxbbbbbbbbbbbbbbbbbbbk...',
    '...kkkyybbbbbbbbbbbbbbbbbbbbk...',
    '...kkssssssssskkbbbbbbbbbbbk....',
    '...ksssssssssssskkbbbbbbbbbk....',
    '..kkssxwxssssssskkbbbbbbbbbk....',
    '..kkssxxxssssssskkbbbbbbhhbk....',
    '..kksssssssssssskkbbbbbbhhbk....',
    '...kkssssssssssskkbbbbbbhhbk....',
    '....kksssxxxxssskkbbbbbbbbbk....',
    '.....kksssssssskkkbbbbbbbbbk....',
    '......kkkksssskkkbbbbbbbbbkk....',
    '........kkkkkkkkkkbbbbbbbkk.....',
    '.........kkbbbbbbbbbbbbkkk......',
    '.......kssshhhhbbbbbbbbkk.......',
    '......ksssbhhhbbbbbbbbbkk.......',
    '......kssskbbbbbbbbbbbbkk.......',
    '.....kbbbkkbbbbbbbbbbbbkk.......',
    '.....krrrk.bbbbbbbbbbbbkk.......'
];

const SIDE_PROFILE_LEGS_A = [
    '.....krrrrrkkkyyyyywwyyykkkkrrkk',
    '.....krrrrrkkkbbbbbxbbbbkkkkrrkk',
    '.....krrrrrk.kkbbbk.kbbbkk..rrkk',
    '.............kkbbbk.kbbbkk......',
    '.............kkbbbk.kbbbkk......',
    '..........kkrwwwrrk.krwwwrrkk...',
    '..........kkrhhhrrk.krhhhrrkk...',
    '..........kkrrrrrrk.krrrrrrkk...'
];

const SIDE_PROFILE_LEGS_B = [
    '.....krrrrrkkkyyyyywwyyykkkkrrkk',
    '.....krrrrrkkkbbbbbxbbbbkkkkrrkk',
    '.....krrrrrk..kkbbbkkbbbkk..rrkk',
    '..............kkbbbkkbbbkk......',
    '..............kkbbbkkbbbkk......',
    '............kwwwrrrrkrrrrwwwrk..',
    '............khhhrrrrkrrrrhhhrk..',
    '............kkrrrrrrkrrrrrrrrk..'
];"""

# Replace the SIDE_PROFILE blocks
pattern = re.compile(r'// The side profile keeps.*?(?=const PLAYER_SPRITES =)', re.DOTALL)
content = pattern.sub(new_side + '\n', content)

with open('js/player.js', 'w') as f:
    f.write(content)
print("Patched player.js")
