from PIL import Image

original_path = '/Users/safa/.gemini/antigravity-ide/brain/69c7d8e6-0850-4c0c-988b-e77e6a89a877/retro_cover_art_1789471073625.jpg'
img = Image.open(original_path)
width, height = img.size

# Check the top 100 pixels for red color (e.g. R > 150, G < 50, B < 50)
pixels = img.load()

red_bounds = []
for y in range(0, 100):
    for x in range(0, width):
        r, g, b = pixels[x, y]
        if r > 150 and g < 70 and b < 70:
            red_bounds.append((x, y))

if red_bounds:
    min_x = min([p[0] for p in red_bounds])
    max_x = max([p[0] for p in red_bounds])
    min_y = min([p[1] for p in red_bounds])
    max_y = max([p[1] for p in red_bounds])
    print(f"Red banner found at: X({min_x} to {max_x}), Y({min_y} to {max_y})")
else:
    print("No prominent red banner found.")
