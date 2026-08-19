"""Generates the master source images for flutter_launcher_icons from the
official DILG logo: a full opaque icon (red brand background + centered
logo, used for iOS / legacy Android), an adaptive-icon foreground
(transparent background, logo kept inside the safe zone so it survives
circle/squircle/rounded-square masks), and an adaptive-icon background
(solid brand red). Run with: python scripts/generate_launcher_icon_sources.py
"""

from PIL import Image

BRAND_RED = (0xC8, 0x1E, 0x2C, 0xFF)  # AppColors.primary — 0xFFC81E2C
CANVAS = 1024

SOURCE_LOGO = "assets/images/DILG logo.png"
OUT_ICON = "assets/icon/icon.png"
OUT_FOREGROUND = "assets/icon/icon_foreground.png"
OUT_BACKGROUND = "assets/icon/icon_background.png"


def load_trimmed_logo():
    logo = Image.open(SOURCE_LOGO).convert("RGBA")
    bbox = logo.split()[3].getbbox()
    return logo.crop(bbox)


def scaled_logo(logo, target_width):
    w, h = logo.size
    scale = target_width / w
    new_size = (round(w * scale), round(h * scale))
    return logo.resize(new_size, Image.LANCZOS)


def paste_centered(canvas, layer):
    x = (canvas.width - layer.width) // 2
    y = (canvas.height - layer.height) // 2
    canvas.alpha_composite(layer, (x, y))


def main():
    logo = load_trimmed_logo()

    # Full opaque icon (iOS + legacy/round Android): red background, logo
    # centered with generous padding (~62% of canvas width) so it reads
    # clearly at small sizes without touching the edges.
    icon = Image.new("RGBA", (CANVAS, CANVAS), BRAND_RED)
    paste_centered(icon, scaled_logo(logo, round(CANVAS * 0.62)))
    icon.convert("RGB").save(OUT_ICON)

    # Adaptive icon foreground: transparent background, logo kept well
    # inside the ~66% "safe zone" every Android mask shape guarantees, so
    # nothing is clipped by circular, squircle, rounded-square, or
    # OEM-specific launcher masks.
    foreground = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    paste_centered(foreground, scaled_logo(logo, round(CANVAS * 0.55)))
    foreground.save(OUT_FOREGROUND)

    # Adaptive icon background: solid brand red, full bleed.
    background = Image.new("RGBA", (CANVAS, CANVAS), BRAND_RED)
    background.convert("RGB").save(OUT_BACKGROUND)

    print("Wrote", OUT_ICON, OUT_FOREGROUND, OUT_BACKGROUND)


if __name__ == "__main__":
    main()
