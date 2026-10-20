import os
from pathlib import Path
from PIL import Image, ImageDraw

ROOT_DIR = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT_DIR / "src-tauri" / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)

def create_olympus_icon(size: int) -> Image.Image:
    # Create high quality Olympus lightning / crown icon
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = size * 0.08
    # Background rounded container
    # Draw dark purple/indigo circle
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(30, 27, 75, 255), outline=(99, 102, 241, 255), width=max(1, int(size * 0.04)))

    # Draw golden Greek letter Omega or Pillar/Crown in center
    # Center coordinates
    cx, cy = size / 2, size / 2
    r = size * 0.28

    # Simple geometric stylized golden emblem
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(234, 179, 8, 255), width=max(2, int(size * 0.06)))
    # Inner star / diamond
    d = r * 0.6
    draw.polygon([
        (cx, cy - d),
        (cx + d * 0.7, cy),
        (cx, cy + d),
        (cx - d * 0.7, cy)
    ], fill=(250, 204, 21, 255))

    return img

sizes = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 512,
}

base_img_512 = create_olympus_icon(512)

for filename, sz in sizes.items():
    resized = base_img_512.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(ICONS_DIR / filename)

# Also save ICO
base_img_512.save(
    ICONS_DIR / "icon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
)

# For MacOS/cross-platform fallback icns placeholder
with open(ICONS_DIR / "icon.icns", "wb") as f:
    base_img_512.save(f, format="PNG")

print("Generated Tauri icons in:", ICONS_DIR)
