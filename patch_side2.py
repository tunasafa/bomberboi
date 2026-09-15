import re

with open('js/player.js', 'r') as f:
    content = f.read()

new_side = """// The side profile keeps the helmet, face, shoulders, gloves, belt, pants,
// and boots in one continuous silhouette. Right-facing art is mirrored below.
const SIDE_PROFILE_BODY = [
    '...........kkkkkkkkk............',
    '........kkbbhhhhhbbbbbkk........',
    '.......kkbhhhhhhbbbbbbbbkk......',
    '......kkyyhhhhbbbbbbbbbbbbk.....',
    '.....kkyyxxbbbbbbbbbbbbbbbbk....',
    '.....kkyxxbbbbbbbbbbbbbbbbbk....',
    '....kkkyybbbbbbkkrrrrkkbbbbbk...',
    '....kkbbbbbbbbkrrrrrrrrkbbbbk...',
    '....kkssssssskrrrrrrrrrrkbbbk...',
    '...kssssssssskrrrrrrrrrrkbbbbk..',
    '...kssxwxsssskrrrrrrrrrrkbbbbk..',
    '..kkssxxxssssskrrrrrrrrkbbhhbk..',
    '..kkssssssssssskkrrrrkkbbbhhbk..',
    '...kkssssssssssskkkkkbbbbbhhbk..',
    '....kksssxxxxssskkbbbbbbbbbbbk..',
    '.....kksssssssskkbbbbbbbbbbbk...',
    '......kkkksssskkbbbbbbbbbbkk....',
    '........kkkkkkkkbbbbbbbbkk......',
    '.........kkbbbbbbbbbbbbkk.......',
    '........kkbbbbkkssskkbbkk.......',
    '........kkbbbbkssskkkbbkk.......',
    '........kkbbbbkbbbk.bbbkk.......',
    '........kkbbbbkbbbk.bbbkk.......',
    '........kkbbbbkbbbk.bbbkk.......'
];

const SIDE_PROFILE_LEGS_A = [
    '........kkyyyykrrrk.yyykk.......',
    '........kkbbbbkrrrk.bbbkk.......',
    '........kkbbbbkrrrk.bbbkk.......',
    '........kkkkkkkkkkkkkkkkk.......',
    '.........kkbbbk...kbbbkk........',
    '.......kkrwwwrk...kwwwrrkk......',
    '.......kkrhhhrk...khhhrrkk......',
    '.......kkrrrrrk...krrrrrkk......'
];

const SIDE_PROFILE_LEGS_B = [
    '........kkyyyykrrrk.yyykk.......',
    '........kkbbbbkrrrk.bbbkk.......',
    '........kkbbbbkrrrk.bbbkk.......',
    '........kkkkkkkkkkkkkkkkk.......',
    '.........kkbbbk...kbbbkk........',
    '........kwwwrrkk.kkrwwwrk.......',
    '........khhhrrkk.kkrhhhrk.......',
    '........krrrrrkk.kkrrrrrk.......'
];"""

# Replace the SIDE_PROFILE blocks
pattern = re.compile(r'// The side profile keeps.*?(?=const PLAYER_SPRITES =)', re.DOTALL)
content = pattern.sub(new_side + '\n', content)

with open('js/player.js', 'w') as f:
    f.write(content)
print("Patched player.js with straight body and earmuffs!")
