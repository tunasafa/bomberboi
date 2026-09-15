from PIL import Image
img = Image.open('img/logo_banner_nobg.png')
alpha = img.split()[-1]
bbox = alpha.point(lambda p: 255 if p > 10 else 0).getbbox()
print("Tight bbox (>10 alpha):", bbox)
bbox2 = alpha.point(lambda p: 255 if p > 50 else 0).getbbox()
print("Tighter bbox (>50 alpha):", bbox2)
