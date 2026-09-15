import re

with open('js/player.js', 'r') as f:
    content = f.read()

new_side = """// The side profile keeps the helmet, face, shoulders, gloves, belt, pants,
// and boots in one continuous silhouette. Right-facing art is mirrored below.
const SIDE_PROFILE_BODY = [
    '............kkkkkkkk............',
    '..........kkbbbbbbbbkk..........',
    '........kkbbhhhhhbbbbbkk........',
    '.......kkbhhhhhhbbbbbbbbkk......',
    '......kkyyhhhhbbbbbbbbbbbbk.....',
    '.....kkyyxxbbbbbbbbbbbbbbbbk....',
    '....kkkyyxxbbbbbbbbbbbbbbbbbk...',
    '....kkbbbbbbbbkkrrrrkkbbbbbk....',
    '....kkbbbbbbbbkrrrrrrrrkbbbbk...',
    '....kksssssssskrrrrrrrrrrkbbbk..',
    '....kssssssssskrrrrrrrrrrkbbbk..',
    '....ksssxxxssskrrrrrrrrrrkbbbk..',
    '....ksssxxwssskrrrrrrrrkbbbhhk..',
    '....ksssssssssskkrrrrkkbbbhhbk..',
    '.....kksssssssssskkkkkbbbbbhhbk.',
    '......kksssssssskkbbbbbbbbbbbk..',
    '.......kksxxsssskkbbbbbbbbbbbk..',
    '........kkkkkkkkkkkkkkkkkkkkkk..',
    '........kkbbbbbbbbbbbbbbkk......',
    '........kkbbbbkksskkkbbbkk......',
    '........kkbbbkssssskkbbbkk......',
    '........kkbbbbkbbbkkbbbbkk......',
    '........kkbbbbkbbbkkbbbbkk......',
    '........kkbbbbkbbbkkbbbbkk......'
];

const SIDE_PROFILE_LEGS_A = [
    '........kkyyyykrrrkyyyyykk......',
    '........kkbbbbkrrrkkbbbbkk......',
    '........kkbbbbkrrrkkbbbbkk......',
    '........kkkkkkkkkkkkkkkkkk......',
    '.........kkbbbk..kkbbbk.........',
    '........kkrwwwrkkrwwwrkk........',
    '........kkrhhhrkkrhhhrkk........',
    '........kkrrrrrkkrrrrrkk........'
];

const SIDE_PROFILE_LEGS_B = [
    '........kkyyyykrrrkyyyyykk......',
    '........kkbbbbkrrrkkbbbbkk......',
    '........kkbbbbkrrrkkbbbbkk......',
    '........kkkkkkkkkkkkkkkkkk......',
    '.........kkbbbk..kkbbbk.........',
    '......kkrwwwrk....kwwwrrkk......',
    '......kkrhhhrk....khhhrrkk......',
    '......kkrrrrrk....krrrrrkk......'
];"""

# Replace the SIDE_PROFILE blocks
pattern = re.compile(r'// The side profile keeps.*?(?=const PLAYER_SPRITES =)', re.DOTALL)
content = pattern.sub(new_side + '\n', content)

with open('js/player.js', 'w') as f:
    f.write(content)
print("Patched player.js with perfect spherical face")
