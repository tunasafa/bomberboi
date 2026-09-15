import json

palette = {
    '.': 0, # transparent
    'b': 1, # blue
    'f': 2, # face
    'x': 3, # black
    'r': 4, # red
    'y': 5, # yellow
    'w': 6, # white
}

# 16x16 down 1
d1 = """
....bbbbbbbb....
...bbbbbbbbbb...
..bbbbbbbbbbbb..
..byyyyyyyyyyb..
..byffffffffyb..
..byffxffxffyb..
..byffffffffyb..
..byffffffffyb..
..bbffffffffbb..
.rrbbbbyybbbbrr.
.rrbbbbbbbbbbrr.
.rrrrbbbbbbrrrr.
..r..bbbbbb..r..
.....bb..bb.....
....rrrr.rrrr...
....rrrr.rrrr...
"""

# 16x16 down 2 (walking)
d2 = """
....bbbbbbbb....
...bbbbbbbbbb...
..bbbbbbbbbbbb..
..byyyyyyyyyyb..
..byffffffffyb..
..byffxffxffyb..
..byffffffffyb..
..byffffffffyb..
..bbffffffffbb..
.rrbbbbyybbbbrr.
.rrbbbbbbbbbbrr.
.rrrrbbbbbbrrrr.
..r..bbbbbb..r..
.....bb..bbrr...
....rrrr.rrrr...
....rrrr.rrrr...
"""

# 16x16 up 1
u1 = """
....bbbbbbbb....
...bbbbbbbbbb...
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
.rrbbbbyybbbbrr.
.rrbbbbbbbbbbrr.
.rrrrbbbbbbrrrr.
..r..bbbbbb..r..
.....bb..bb.....
....rrrr.rrrr...
....rrrr.rrrr...
"""

# 16x16 up 2
u2 = """
....bbbbbbbb....
...bbbbbbbbbb...
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
..bbbbbbbbbbbb..
.rrbbbbyybbbbrr.
.rrbbbbbbbbbbrr.
.rrrrbbbbbbrrrr.
..r..bbbbbb..r..
.....bbrrbb.....
....rrrrrrrr....
....rrrrrrrr....
"""

# 16x16 left 1
l1 = """
......bbbbbbbb..
.....bbbbbbbbbb.
....byyyyyybbbb.
....byffffybbbb.
....byffxxybbbb.
....byffffybbbb.
....byffffybbbb.
....byffffbbbbb.
...rrffffbbbbb..
...rrbbbbybbbbb.
..rrrbbbbbbbbbb.
..rr..bbbbbbbb..
......bb..bb....
.....rrrrrrrr...
.....rrrr.rrrr..
.....rrrr.rrrr..
"""

# 16x16 left 2
l2 = """
......bbbbbbbb..
.....bbbbbbbbbb.
....byyyyyybbbb.
....byffffybbbb.
....byffxxybbbb.
....byffffybbbb.
....byffffybbbb.
....byffffbbbbb.
...rrffffbbbbb..
...rrbbbbybbbbb.
..rrrbbbbbbbbbb.
..rr..bbbbbbbb..
......bb..bb....
.....rrrr.rr....
.....rrrr.......
.....rrrr.......
"""

# 16x16 right 1
r1 = """
..bbbbbbbb......
.bbbbbbbbbb.....
.bbbbyyyyyyb....
.bbbbyffffyb....
.bbbbyxxffyb....
.bbbbyffffyb....
.bbbbyffffyb....
.bbbbbffffyb....
..bbbbbffffrr...
.bbbbbybbbbrr...
.bbbbbbbbbbrrr..
..bbbbbbbb..rr..
....bb..bb......
...rrrrrrrr.....
..rrrr.rrrr.....
..rrrr.rrrr.....
"""

# 16x16 right 2
r2 = """
..bbbbbbbb......
.bbbbbbbbbb.....
.bbbbyyyyyyb....
.bbbbyffffyb....
.bbbbyxxffyb....
.bbbbyffffyb....
.bbbbyffffyb....
.bbbbbffffyb....
..bbbbbffffrr...
.bbbbbybbbbrr...
.bbbbbbbbbbrrr..
..bbbbbbbb..rr..
....bb..bb......
....rr.rrrr.....
.......rrrr.....
.......rrrr.....
"""

def parse(art):
    return [[palette[char] for char in line.strip()] for line in art.strip().split('\n')]

output = f"""const PLAYER_SPRITES = {{
  down: [
    {{
      pattern: {json.dumps(parse(d1))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }},
    {{
      pattern: {json.dumps(parse(d2))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }}
  ],
  up: [
    {{
      pattern: {json.dumps(parse(u1))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }},
    {{
      pattern: {json.dumps(parse(u2))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }}
  ],
  left: [
    {{
      pattern: {json.dumps(parse(l1))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }},
    {{
      pattern: {json.dumps(parse(l2))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }}
  ],
  right: [
    {{
      pattern: {json.dumps(parse(r1))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }},
    {{
      pattern: {json.dumps(parse(r2))},
      colors: ['transparent', '#1E90FF', '#FFDBAC', '#000000', '#FF0000', '#FFD700', '#FFFFFF']
    }}
  ]
}};"""

with open('new_sprites.js', 'w') as f:
    f.write(output)

print("Generated new_sprites.js")
