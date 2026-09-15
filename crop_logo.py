from PIL import Image
img = Image.open('img/logo_banner_nobg.png')
alpha = img.split()[-1]
bbox = alpha.getbbox()
if bbox:
    cropped = img.crop(bbox)
    cropped.save('img/logo_banner_nobg.png')
    print("Cropped successfully to", bbox)
else:
    print("Could not find bounding box.")
