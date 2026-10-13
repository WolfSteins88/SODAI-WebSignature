"""Build labeled contact sheets from the one-frame-per-second recording samples."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
FONT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 25)

for name in ("reference", "rejected"):
    paths = sorted((ROOT / f"{name}-frames").glob("*.jpg"))
    for page, start in enumerate(range(0, len(paths), 12), start=1):
        batch = paths[start : start + 12]
        sheet = Image.new("RGB", (2240, 1800), "#ececec")
        draw = ImageDraw.Draw(sheet)
        for idx, path in enumerate(batch):
            image = Image.open(path)
            x = (idx % 3) * 745
            y = (idx // 3) * 450
            sheet.paste(image, (x, y + 35))
            draw.text((x + 8, y + 3), f"{name} {int(path.stem) - 1:02d}s", font=FONT, fill="#111111")
        sheet.save(ROOT / f"{name}-sheet-{page:02d}.jpg", quality=90)
