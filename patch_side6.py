import re

with open('js/player.js', 'r') as f:
    content = f.read()

new_side = """// The side profile keeps the helmet, face, shoulders, gloves, belt, pants,
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
    '......kksssssssskkbbbbbbbk......',
    '.......kksxxsssskkbbbbbbk.......',
    '........kkkkkkkkkkkkkkkk........',
    '.........kkbbbbbbbbbbkk.........',
    '........kkbbkssssskkbbkk........',
    '........kkbbkbbbbbbkbbkk........',
    '........kkbbkbbbbbbkbbkk........',
    '.........kbbkbbbbbbkbbk.........',
    '.........kbbkbbbbbbkbbk.........'
];

const SIDE_PROFILE_LEGS_A = [
    '.........kkykrrrrrrkykk.........',
    '.........kkbkrrrrrrkbkk.........',
    '.........kkbkrrrrrrkbkk.........',
    '.........kkkkkkkkkkkkkk.........',
    '..........kkbbk..kkbbk..........',
    '........kkrwwwrkkwwwrrkk........',
    '........kkrhhhrkkhhhrrkk........',
    '........kkrrrrrkkrrrrrkk........'
];

const SIDE_PROFILE_LEGS_B = [
    '.........kkykrrrrrrkykk.........',
    '.........kkbkrrrrrrkbkk.........',
    '.........kkbkrrrrrrkbkk.........',
    '.........kkkkkkkkkkkkkk.........',
    '..........kkbbk..kkbbk..........',
    '......kkrwwwrk....kwwwrrkk......',
    '......kkrhhhrk....khhhrrkk......',
    '......kkrrrrrk....krrrrrkk......'
];"""

# Replace the SIDE_PROFILE blocks
pattern = re.compile(r'// The side profile keeps.*?(?=const PLAYER_SPRITES =)', re.DOTALL)
content = pattern.sub(new_side + '\n', content)

with open('js/player.js', 'w') as f:
    f.write(content)
print("Patched player.js with rounder back, bigger hands, and barrel chest")
