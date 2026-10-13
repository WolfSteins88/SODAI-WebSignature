from PIL import Image, ImageDraw
from pathlib import Path
for kind, step, columns, batch, width in [('desktop',5,4,20,320),('mobile',2,7,21,170)]:
    files=sorted(Path('docs/reference',kind).glob('*.jpg'))
    for offset in range(0,len(files),batch):
        group=files[offset:offset+batch]
        height=round(width*(360/640 if kind=='desktop' else 556/256))+24
        sheet=Image.new('RGB',(width*columns,height*((len(group)+columns-1)//columns)), '#eee8de')
        draw=ImageDraw.Draw(sheet)
        for j,p in enumerate(group):
            x=(j%columns)*width;y=(j//columns)*height
            im=Image.open(p);im.thumbnail((width,height-24));sheet.paste(im,(x,y+24))
            draw.text((x+5,y+5),f'{kind} {(offset+j)*step:03d}s',fill='black')
        sheet.save(f'docs/reference/{kind}-{offset//batch+1}.jpg')
