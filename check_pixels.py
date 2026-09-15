from PIL import Image
img = Image.open('img/logo_banner.png')
pixels = img.load()
w, h = img.size
opaque = 0
for x in range(w):
    for y in range(h):
        if pixels[x, y][3] > 0:
            opaque += 1
print(f"Opaque pixels: {opaque}")
