from PIL import Image

def flood_fill_transparency(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # We will do a BFS flood fill from the edges of the image.
    # We stop the flood fill when we hit the dark blue/black border of the logo.
    
    # The logo border is very dark (r<50, g<50, b<80).
    def is_border(c):
        r, g, b, a = c
        return r < 40 and g < 40 and b < 60
        
    visited = set()
    stack = []
    
    # Seed the edges
    for x in range(width):
        stack.append((x, 0))
        stack.append((x, height - 1))
    for y in range(height):
        stack.append((0, y))
        stack.append((width - 1, y))
        
    while stack:
        x, y = stack.pop()
        
        if (x, y) in visited:
            continue
            
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        visited.add((x, y))
        
        c = pixels[x, y]
        if is_border(c):
            # We hit the border, stop spreading from here
            continue
            
        # If it's not the border, it's background. Make it transparent.
        pixels[x, y] = (0, 0, 0, 0)
        
        # Spread to neighbors
        stack.append((x+1, y))
        stack.append((x-1, y))
        stack.append((x, y+1))
        stack.append((x, y-1))
        
    img.save(out_path)
    print("Done smart remove.")

flood_fill_transparency('/Users/safa/.gemini/antigravity-ide/brain/69c7d8e6-0850-4c0c-988b-e77e6a89a877/.tempmediaStorage/media_1789473423782.jpg', 'img/logo_banner.png')
