from PIL import Image, ImageFilter

original_path = '/Users/safa/.gemini/antigravity-ide/brain/69c7d8e6-0850-4c0c-988b-e77e6a89a877/retro_cover_art_1789471073625.jpg'
img = Image.open(original_path)
width, height = img.size

# We want to cover the top ~70 pixels where the text is (Nintendo, Action Series, etc.)
# We will grab a horizontal slice of the maze from below the logo (e.g. y=300 to y=370)
# The logo is probably around y=100 to y=250. Let's take from y=250 to y=320.
bg_slice = img.crop((0, 250, width, 320))

# Resize slightly if needed, but it's already full width. Let's make it 75px high.
patch = bg_slice.resize((width, 75))

# Paste the patch over the top 75 pixels
img.paste(patch, (0, 0))

img.save('img/cover.jpg')
print("Cover patched.")
