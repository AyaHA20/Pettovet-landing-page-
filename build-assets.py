# -*- coding: utf-8 -*-
"""Prepare landing/assets : copie les images de l'application, en
   allegeant celles qui sont beaucoup trop lourdes pour un telephone.

   La page vitrine se partage sur Instagram et WhatsApp : elle s'ouvre
   en 4G, sur un forfait algerien. 2,4 Mo de heros en PNG, c'est
   plusieurs secondes d'ecran blanc — donc des visiteurs perdus avant
   d'avoir rien lu."""
import os, shutil
from PIL import Image, ImageDraw, ImageFont

SRC = "frontend2/src/assets"
PUB = "frontend2/public"
OUT = "landing/assets"
os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------
#  Images heros : redimensionnees et reencodees.
# ------------------------------------------------------------------
HERO_MAX_W = 760          # affichees a 50 % de 1200 px, soit 600 px max
                          # 760 laisse de la marge aux ecrans 2x sans
                          # payer le prix d'une image de 1800 px.


def shrink(src_name, out_name, max_w):
    """Redimensionne, puis reencode en JPEG.

    CE SONT DES PHOTOGRAPHIES, PAS DES ILLUSTRATIONS.
    Le PNG d'origine les stockait sans perte : 1,2 Mo chacune. Une
    quantification en 200 couleurs les ramenait bien a 60 ko, mais avec
    un ciel en aplats et des degrades en marches d'escalier.
    Le JPEG fait mieux sur les deux tableaux ici, et sans compromis :
    les deux images sont opaques a 100 % (verifie), donc rien a perdre
    du cote de la transparence."""
    src = os.path.join(SRC, src_name)
    dst = os.path.join(OUT, out_name)
    before = os.path.getsize(src)
    img = Image.open(src).convert("RGB")
    if img.width > max_w:
        h = round(img.height * max_w / img.width)
        img = img.resize((max_w, h), Image.LANCZOS)
    img.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    after = os.path.getsize(dst)
    print("  %-22s %7.0f ko -> %6.0f ko  (%d x %d)"
          % (out_name, before / 1024, after / 1024, img.width, img.height))


print("Images heros :")
shrink("homepage-icon/dog-home.png", "dog-home.jpg", HERO_MAX_W)
shrink("homepage-icon/doctor-home.png", "doctor-home.jpg", HERO_MAX_W)

# ------------------------------------------------------------------
#  Le reste : copie conforme. Ces fichiers sont deja legers, et les
#  retoucher ferait diverger la vitrine de l'application.
# ------------------------------------------------------------------
print("Copies telles quelles :")
COPIES = [
    (os.path.join(SRC, "footer-icons/bg.png"), "footer-bg.png"),
    (os.path.join(SRC, "footer-icons/dog-footer.gif"), "dog-footer.gif"),
    (os.path.join(SRC, "footer-icons/email-icon.png"), "email-icon.png"),
    (os.path.join(SRC, "footer-icons/fb-icon.png"), "fb-icon.png"),
    (os.path.join(SRC, "footer-icons/ig-icon.png"), "ig-icon.png"),
    (os.path.join(SRC, "footer-icons/linkedin-icon.png"), "linkedin-icon.png"),
    (os.path.join(SRC, "img/logo.png"), "logo.png"),
]
for src, name in COPIES:
    shutil.copyfile(src, os.path.join(OUT, name))
    print("  %-22s %7.0f ko" % (name, os.path.getsize(src) / 1024))

# ------------------------------------------------------------------
#  L'image d'apercu des partages (Open Graph).
# ------------------------------------------------------------------
print("Apercu de partage :")
OG = os.path.join(OUT, "og-image.jpg")
W, H = 1200, 630
NAVY = (22, 51, 76)
TEAL = (42, 183, 188)

canvas = Image.new("RGB", (W, H), (255, 255, 255))

# --- Le chien, a droite, recadre plutot que deforme ---------------
dog = Image.open(os.path.join(SRC, "homepage-icon/dog-home.png")).convert("RGB")
panel_w = 560
ratio = max(panel_w / dog.width, H / dog.height)
dog = dog.resize((round(dog.width * ratio), round(dog.height * ratio)), Image.LANCZOS)
left = (dog.width - panel_w) // 2
top = (dog.height - H) // 2
dog = dog.crop((left, top, left + panel_w, top + H))
canvas.paste(dog, (W - panel_w, 0))

# --- Le logo, a gauche --------------------------------------------
logo = Image.open(os.path.join(SRC, "img/logo.png")).convert("RGBA")
ratio = 300 / logo.width
logo = logo.resize((300, round(logo.height * ratio)), Image.LANCZOS)
canvas.paste(logo, (72, 74), logo)

# --- La phrase ------------------------------------------------------
#  Poppins n'est pas installee sur ce poste ; on prend la sans-serif
#  systeme la plus proche. L'apercu n'est pas l'interface : personne ne
#  comparera les deux cote a cote.
def font(size, bold=False):
    for name in (("segoeuib.ttf", "arialbd.ttf") if bold else ("segoeui.ttf", "arial.ttf")):
        path = os.path.join(os.environ.get("SystemRoot", r"C:\Windows"), "Fonts", name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

draw = ImageDraw.Draw(canvas)
# Le bloc de texte est ancre sur le BAS de l'image, pas sur le haut :
# sa hauteur depend de celle du logo, et la derniere ligne se retrouvait
# coupee hors du cadre.
lines = [
    ("Le logiciel du cabinet", font(44, True), NAVY, 60),
    ("vétérinaire", font(44, True), TEAL, 78),
    ("Dossiers · Vaccins · Rendez-vous", font(25), (109, 122, 136), 38),
    ("Facturation · Stock · Hors ligne", font(25), (109, 122, 136), 0),
]
block = sum(step for _, _, _, step in lines) + 34
y = H - 96 - block
for text, fnt, fill, step in lines:
    draw.text((72, y), text, font=fnt, fill=fill)
    y += step

canvas.save(OG, "JPEG", quality=86, optimize=True, progressive=True)
print("og-image.jpg : %.0f ko" % (os.path.getsize(OG) / 1024))


# Favicon : le logo de l'application, tel quel.
shutil.copyfile(os.path.join(PUB, "logo.png"), os.path.join(OUT, "favicon.png"))

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(chr(10) + "Total landing/assets : %.0f ko" % (total / 1024))
