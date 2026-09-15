import re

with open('js/player.js', 'r') as f:
    code = f.read()

new_left_body = """const LEFT_BODY = [
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
];"""

new_left_legs_a = """const LEFT_LEGS_A = [
    '....kqqrrrkyyyyygwgyyykk........',
    '....kqqrrrbkyyyyyyxyyyykb.......',
    '....kqqrrrbbbbk..kbbbbkk........',
    '.....kkkkkbbbbk..kbbbbkk........',
    '........kkbbbbk..kbbbbkk........',
    '......kkrwwwrrrk.krrwwwqqkk.....',
    '......kkrhhhrrrk.krrhhhqqkk.....',
    '......kkrqqqrrrk.krrrrqqqkk.....'
];"""

new_left_legs_b = """const LEFT_LEGS_B = [
    '....kqqrrrkyyyyygwgyyykk........',
    '....kqqrrrbkyyyyyyxyyyykb.......',
    '....kqqrrrbbbbkkbbbbkk..........',
    '.....kkkkkbbbbkkbbbbkk..........',
    '.........kkbbbbkkbbbbkk.........',
    '........kwwwqqrrkrrrwwwqkk......',
    '........khhhqqrrkrrrhhhqkk......',
    '........kkrqqqrrkrrrrqqqkk......'
];"""

# Replace LEFT_BODY
code = re.sub(r'const LEFT_BODY = \[.*?\];', new_left_body, code, flags=re.DOTALL)
# Replace LEFT_LEGS_A
code = re.sub(r'const LEFT_LEGS_A = \[.*?\];', new_left_legs_a, code, flags=re.DOTALL)
# Replace LEFT_LEGS_B
code = re.sub(r'const LEFT_LEGS_B = \[.*?\];', new_left_legs_b, code, flags=re.DOTALL)

with open('js/player.js', 'w') as f:
    f.write(code)

print("Updated player.js successfully.")
