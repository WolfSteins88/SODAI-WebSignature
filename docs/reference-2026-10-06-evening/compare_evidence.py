from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).parent

def compare(name, reference, after, left_label, right_label, chrome=0):
    actual = Image.open(root / after).convert("RGB")
    ref = Image.open(root / reference).convert("RGB")
    if chrome:
        ref = ref.crop((0, chrome, ref.width, ref.height))
    ref = ref.resize(actual.size, Image.Resampling.LANCZOS)
    result = Image.new("RGB", (actual.width * 2 + 12, actual.height + 32), "#222222")
    result.paste(ref, (0, 32))
    result.paste(actual, (actual.width + 12, 32))
    draw = ImageDraw.Draw(result)
    draw.text((10, 10), left_label, fill="white")
    draw.text((actual.width + 22, 10), right_label, fill="white")
    result.save(root / f"comparison-{name}.jpg", quality=95)

compare("00-before-after", "before-00-current-recording.jpg", "after-01-timeline.jpg",
        "Rejected 204351 / 4.4s: third entry + building missing", "Corrected: complete timeline / 1279 x 700", chrome=64)
compare("01-timeline", "desktop-reference-first.jpg", "after-01-timeline.jpg",
        "Reference 204140 / 0.0s", "Corrected: equivalent timeline position / 1279 x 700")
compare("02-building", "reference-02-building.jpg", "after-02-building.jpg",
        "Reference 204140 / 3.6s", "Corrected: equivalent building position / 1279 x 700")
compare("03-beach-airport", "reference-03-beach-airport.jpg", "after-03-beach-airport.jpg",
        "Reference 204140 / 10.0s", "Corrected: equivalent beach position / 1279 x 700")
compare("mobile-intro", "mobile-reference-02-intro.jpg", "mobile-after-02-intro.jpg",
        "Mobile reference / 4.1s", "Corrected: equivalent intro position / 386 x 684")
compare("mobile-hero", "mobile-reference-first.jpg", "mobile-after-01-hero.jpg",
        "Mobile reference / 0.0s", "Corrected: 386 x 684")

files = sorted(root.glob("mobile-after-*-*.jpg"))
files = [file for file in files if "full-timeline" not in file.name]
sheet = Image.new("RGB", (386 * 3, 718 * ((len(files) + 2) // 3)), "#222222")
draw = ImageDraw.Draw(sheet)
for index, file in enumerate(files):
    x, y = index % 3 * 386, index // 3 * 718
    image = Image.open(file).resize((386, 684), Image.Resampling.LANCZOS)
    draw.text((x + 8, y + 9), file.stem.replace("mobile-after-", ""), fill="white")
    sheet.paste(image, (x, y + 32))
sheet.save(root / "mobile-after-overview.jpg", quality=92)
