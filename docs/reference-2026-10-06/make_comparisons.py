from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
panels = [
    ('01-opener', '00–02 s'), ('02-intro', '02–08 s'),
    ('03a-timeline', '08–14 s, first entries'), ('03b-timeline', '08–14 s, later entries'),
    ('04-founding', '14–26 s'), ('05-red-intimacy', '26–32 s'),
    ('06-architecture', '32–40 s'), ('07-red-culture', '40–45 s'),
    ('08-later-history', '45–49 s'), ('09-book-closing', '49–52 s'),
    ('10-documentary', '52–55 s, static demo'), ('11-next-page', '55–58 s'),
]
for start in range(0, len(panels), 4):
    sheet = Image.new('RGB', (1224, 4 * 390), '#ffffff')
    draw = ImageDraw.Draw(sheet)
    for row, (name, time) in enumerate(panels[start:start + 4]):
        y = row * 390
        draw.text((12, y + 8), f'{name} | recording {time} | 1223 x 699 CSS px', fill='#111111')
        draw.text((12, y + 26), 'LIVE REFERENCE', fill='#111111')
        draw.text((624, y + 26), 'REBUILT SIGNATURE', fill='#111111')
        for col, folder in enumerate(['live-reference', 'after']):
            im = Image.open(root / folder / (name + '.jpg')).convert('RGB')
            im.thumbnail((612, 350))
            sheet.paste(im, (col * 612, y + 42))
    sheet.save(root / f'comparison-{start // 4 + 1:02d}.jpg', quality=92)

mobile = ['01-opener', '02-intro', '03-timeline', '04-founding', '05-red-intimacy', '06-architecture', '07-red-culture', '08-later-history', '09-book-closing']
for start in range(0, len(mobile), 3):
    sheet = Image.new('RGB', (780, 3 * 880), 'white')
    draw = ImageDraw.Draw(sheet)
    for row, name in enumerate(mobile[start:start + 3]):
        y = row * 880
        draw.text((8, y + 5), f'{name} | 390 x 844 CSS px | reference / rebuilt', fill='black')
        for col, folder in enumerate(['live-reference', 'after']):
            im = Image.open(root / folder / f'mobile-{name}.jpg').convert('RGB')
            im.thumbnail((390, 844))
            sheet.paste(im, (390 * col, y + 28))
    sheet.save(root / f'mobile-comparison-{start // 3 + 1:02d}.jpg', quality=92)
