import os
import math
from PIL import Image, ImageDraw

SVG_CONTENT = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a164d"/>
      <stop offset="100%" stop-color="#120a26"/>
    </linearGradient>
    <linearGradient id="beanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b1f66"/>
      <stop offset="100%" stop-color="#241142"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="116" height="116" rx="34" fill="url(#bgGrad)" stroke="#a855f7" stroke-width="4"/>
  <rect x="18" y="18" width="42" height="42" rx="14" fill="url(#cellGrad)" stroke="#7e22ce" stroke-width="3"/>
  <rect x="68" y="18" width="42" height="42" rx="14" fill="url(#cellGrad)" stroke="#7e22ce" stroke-width="3"/>
  <rect x="18" y="68" width="42" height="42" rx="14" fill="url(#cellGrad)" stroke="#7e22ce" stroke-width="3"/>
  <rect x="68" y="68" width="42" height="42" rx="14" fill="url(#cellGrad)" stroke="#7e22ce" stroke-width="3"/>
  <path d="M 46 82 C 40 70, 52 56, 64 62 C 76 56, 88 70, 82 82 C 78 90, 50 90, 46 82 Z" fill="url(#beanGrad)" stroke="#fdf4ff" stroke-width="3"/>
  <ellipse cx="40" cy="50" rx="8" ry="11" transform="rotate(-20 40 50)" fill="url(#beanGrad)" stroke="#fdf4ff" stroke-width="2.5"/>
  <ellipse cx="56" cy="40" rx="8.5" ry="12" fill="url(#beanGrad)" stroke="#fdf4ff" stroke-width="2.5"/>
  <ellipse cx="72" cy="40" rx="8.5" ry="12" fill="url(#beanGrad)" stroke="#fdf4ff" stroke-width="2.5"/>
  <ellipse cx="88" cy="50" rx="8" ry="11" transform="rotate(20 88 50)" fill="url(#beanGrad)" stroke="#fdf4ff" stroke-width="2.5"/>
  <ellipse cx="64" cy="70" rx="8" ry="4" fill="#ffffff" opacity="0.6"/>
  <ellipse cx="56" cy="36" rx="3.5" ry="5" fill="#ffffff" opacity="0.7"/>
  <ellipse cx="72" cy="36" rx="3.5" ry="5" fill="#ffffff" opacity="0.7"/>
  <ellipse cx="40" cy="46" rx="3" ry="4.5" transform="rotate(-20 40 46)" fill="#ffffff" opacity="0.7"/>
  <ellipse cx="88" cy="46" rx="3" ry="4.5" transform="rotate(20 88 46)" fill="#ffffff" opacity="0.7"/>
</svg>"""

def render_plump_bitmap(size=512):
    """Generates a high-res, pillow-soft squishy bean matrix bitmap via PIL."""
    scale = size / 128.0
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Squircle
    draw.rounded_rectangle(
        [(int(6 * scale), int(6 * scale)), (int(122 * scale), int(122 * scale))],
        radius=int(34 * scale),
        fill="#1e1038",
        outline="#a855f7",
        width=int(4 * scale)
    )

    # 2. Four Puffy Mochi Spreadsheet Cells
    cell_coords = [
        (18, 18, 60, 60),
        (68, 18, 110, 60),
        (18, 68, 60, 110),
        (68, 68, 110, 110)
    ]
    for x1, y1, x2, y2 in cell_coords:
        draw.rounded_rectangle(
            [(int(x1 * scale), int(y1 * scale)), (int(x2 * scale), int(y2 * scale))],
            radius=int(14 * scale),
            fill="#321657",
            outline="#7e22ce",
            width=int(3 * scale)
        )

    # 3. Big Chubby Center Palm Pad
    draw.ellipse(
        [(int(44 * scale), int(58 * scale)), (int(84 * scale), int(90 * scale))],
        fill="#e879f9",
        outline="#fdf4ff",
        width=int(3 * scale)
    )
    # Palm Glossy Highlight
    draw.ellipse(
        [(int(56 * scale), int(64 * scale)), (int(72 * scale), int(74 * scale))],
        fill=(255, 255, 255, 180)
    )

    # 4. Plump Toe Beans
    beans = [
        (40, 48, 8, 11),
        (56, 38, 8.5, 12),
        (72, 38, 8.5, 12),
        (88, 48, 8, 11)
    ]
    for bx, by, rx, ry in beans:
        draw.ellipse(
            [
                (int((bx - rx) * scale), int((by - ry) * scale)),
                (int((bx + rx) * scale), int((by + ry) * scale))
            ],
            fill="#f472b6",
            outline="#fdf4ff",
            width=int(2.5 * scale)
        )
        # Toe Bean Jelly Gloss
        draw.ellipse(
            [
                (int((bx - 3) * scale), int((by - ry + 2) * scale)),
                (int((bx + 3) * scale), int((by - ry + 7) * scale))
            ],
            fill=(255, 255, 255, 200)
        )

    return img

def main():
    root = r"c:\Users\lorik\.gemini\antigravity\scratch\anymd"
    public_dir = os.path.join(root, "public")
    os.makedirs(public_dir, exist_ok=True)

    # 1. Write Web SVG Assets
    svg_path = os.path.join(public_dir, "anymd-icon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(SVG_CONTENT)
    print(f"[OK] Web SVG generated: {svg_path}")
    favicon_svg_path = os.path.join(public_dir, "favicon.svg")
    with open(favicon_svg_path, "w", encoding="utf-8") as f:
        f.write(SVG_CONTENT)

    # 2. Render Favicon & Web Bitmaps
    icon_512 = render_plump_bitmap(512)
    icon_512.save(os.path.join(public_dir, "icon-512.png"))
    icon_512.save(os.path.join(public_dir, "anymd-icon-512.png"))
    icon_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "icon-192.png"))
    icon_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "anymd-icon-192.png"))
    icon_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.ico"))
    icon_512.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.png"))
    print("[OK] Web PNG icons & favicon generated.")

    # 3. Android Mipmap Generation
    android_res_paths = [
        os.path.join(root, "android", "app", "src", "main", "res"),
        os.path.join(root, "01_applications_and_tools", "n8n-android-local", "android", "app", "src", "main", "res")
    ]
    for android_res in android_res_paths:
        if os.path.exists(android_res):
            mipmaps = {
                "mipmap-mdpi": 48,
                "mipmap-hdpi": 72,
                "mipmap-xhdpi": 96,
                "mipmap-xxhdpi": 144,
                "mipmap-xxxhdpi": 192
            }
            for folder, sz in mipmaps.items():
                target_folder = os.path.join(android_res, folder)
                os.makedirs(target_folder, exist_ok=True)
                resized = icon_512.resize((sz, sz), Image.Resampling.LANCZOS)
                resized.save(os.path.join(target_folder, "ic_launcher.png"))
                resized.save(os.path.join(target_folder, "ic_launcher_round.png"))
            print(f"[OK] Android multi-density mipmaps rendered to: {android_res}")

if __name__ == "__main__":
    main()
