from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).parent
for name in ['reference','current','mobile']:
    frames=sorted((root/f'{name}-frames').glob('*.jpg'))
    columns=4 if name!='mobile' else 6
    width=640 if name!='mobile' else 240
    height=400 if name!='mobile' else 460
    page_size=12 if name!='mobile' else 18
    for start in range(0,len(frames),page_size):
        sheet=Image.new('RGB',(columns*width,((page_size+columns-1)//columns)*height),'white')
        draw=ImageDraw.Draw(sheet)
        for i,p in enumerate(frames[start:start+page_size]):
            x=(i%columns)*width; y=(i//columns)*height
            im=Image.open(p); im.thumbnail((width,height-25)); sheet.paste(im,(x,y+25))
            draw.text((x+6,y+5),f'{name} {(int(p.stem)-1)/5:.1f}s',fill='black')
        sheet.save(root/f'{name}-sheet-{start//page_size+1:02d}.jpg',quality=93)
