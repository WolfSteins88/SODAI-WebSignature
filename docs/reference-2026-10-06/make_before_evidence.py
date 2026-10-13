"""Number the rejected recording's chronological states; these are not matched layouts."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
out = root / "before"
out.mkdir(exist_ok=True)
for number, second in enumerate([0, 2, 4, 7, 9, 12, 15, 18, 21, 24, 27], 1):
    source = Image.open(root / "rejected-frames" / f"{second + 1:03d}.jpg").convert("RGB")
    canvas = Image.new("RGB", (source.width, source.height + 60), "white")
    canvas.paste(source, (0, 60))
    ImageDraw.Draw(canvas).text((20, 15), f"BEFORE {number:02d} | rejected recording {second:02d}s | chronological state, not a matching reference composition", fill="black")
    canvas.save(out / f"{number:02d}-rejected-{second:02d}s.jpg", quality=92)
