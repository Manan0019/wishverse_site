from PIL import Image,ImageDraw,ImageFont,ImageFilter
from pathlib import Path
W,H=1200,630
base=Image.new('RGBA',(W,H),(13,10,29,255))
d=ImageDraw.Draw(base)
for x in range(W):
 t=x/W
 d.line((x,0,x,H),fill=(int(13+34*t),int(10+12*t),int(29+48*t),255))
glow=Image.new('RGBA',(W,H),(0,0,0,0));gd=ImageDraw.Draw(glow)
gd.ellipse((350,-200,1120,600),fill=(166,81,182,60)); glow=glow.filter(ImageFilter.GaussianBlur(120))
base.alpha_composite(glow)
font_dir='/usr/share/fonts/truetype/dejavu/'
d=ImageDraw.Draw(base)
logo=ImageFont.truetype(font_dir+'DejaVuSans-Bold.ttf',34)
title=ImageFont.truetype(font_dir+'DejaVuSans-Bold.ttf',56)
sub=ImageFont.truetype(font_dir+'DejaVuSans.ttf',23)
small=ImageFont.truetype(font_dir+'DejaVuSans.ttf',19)
d.rounded_rectangle((55,48,105,98),radius=15,fill='#edb6e9')
d.text((68,55),'✦',font=ImageFont.truetype(font_dir+'DejaVuSans.ttf',29),fill='#331744')
d.text((117,54),'wishverse.',font=logo,fill='#fff8ff')
d.text((62,196),'Make every wish',font=title,fill='#ffffff')
d.text((62,278),'feel magical.',font=title,fill='#f0aade')
d.text((62,398),'Beautifully personal greetings',font=ImageFont.truetype(font_dir+'DejaVuSans-Bold.ttf',27),fill='#fff0fe')
d.text((62,448),'Six occasions. Original illustrations.',font=sub,fill='#d5c7dc')
d.text((62,486),'Unwrap, reveal, and share the feeling.',font=sub,fill='#d5c7dc')
d.rounded_rectangle((62,552,415,595),radius=22,outline='#bd91c5',width=1)
d.text((82,564),'18 premium card combinations',font=small,fill='#f5dbef')
# Right-side floating card mosaics only, no text collisions
src=Image.open('/mnt/data/wishverse_phase3_occasions.png').convert('RGB')
for i,(sx,x,y,a) in enumerate([(0,604,150,6),(434,798,218,-5),(866,988,155,6)]):
    card=src.crop((sx,0,sx+413,375)).resize((195,238),Image.Resampling.LANCZOS)
    card=card.convert('RGBA')
    mask=Image.new('L',card.size,0); md=ImageDraw.Draw(mask)
    md.rounded_rectangle((1,1,card.width-2,card.height-2),radius=16,fill=255)
    card.putalpha(mask)
    card=card.rotate(a,expand=True,resample=Image.Resampling.BICUBIC)
    base.alpha_composite(card,(x,y))
base.convert('RGB').save(Path(__file__).resolve().parents[1]/'og-preview.png',optimize=True)
