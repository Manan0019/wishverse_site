"""Phase 6 independent browser smoke test. Works with set_content, no network navigation."""
from pathlib import Path
import base64, json, re, io, struct, wave
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
html=(ROOT/'index.html').read_text()
css=(ROOT/'src/styles.css').read_text()
art={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
for name,url in art.items():html=html.replace(f'/assets/art/{name}.svg',url)
parts=[]
for filename in ['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/motion.js','src/lib/storybook.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/lib/qr-vendor.js','src/lib/share-studio.js','src/main.js']:
    src=(ROOT/filename).read_text()
    src=re.sub(r'^import\s+.*?;\s*$', '', src, flags=re.M)
    src=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '', src)
    parts.append(src)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(art)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>', lambda _: '<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>',lambda _: '<script>'+js.replace('</script>','<\\/script>')+'</script>',html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

# Synthetic JPEG test asset
im=Image.new('RGB',(640,480),(116,80,170));d=ImageDraw.Draw(im)
d.ellipse((185,70,455,340),fill=(234,178,208));d.text((210,365),'WISHVERSE MEMORY',fill=(255,255,255))
pic=io.BytesIO();im.save(pic,'JPEG',quality=80)
# Synthetic valid wav audio sample
wav=io.BytesIO()
with wave.open(wav,'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(8000)
    import math
    w.writeframes(b''.join(struct.pack('<h',int(0.1*32767*math.sin(2*math.pi*440*i/8000))) for i in range(8000)))

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    results=[]
    for width,height,label in [(1440,900,'desktop'),(390,844,'mobile'),(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,accept_downloads=True)
        page.set_default_timeout(10000)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('about:blank')
        page.evaluate("() => {const store=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},configurable:true});}")
        page.set_content(html,wait_until='load',timeout=30000)
        assert page.locator('[data-template]').count()==4
        assert page.locator('[data-soundscape]').count()==4
        page.locator('#studio').scroll_into_view_if_needed()
        page.locator('[data-soundscape="warmth"]').click()
        assert page.locator('[data-soundscape="warmth"]').get_attribute('aria-pressed')=='true'
        page.locator('#photoInput').set_input_files({'name':'warm-memory.jpg','mimeType':'image/jpeg','buffer':pic.getvalue()})
        page.locator('#photoMini').wait_for(state='visible')
        assert page.locator('#photoStatus').inner_text().startswith('Photo added')
        page.locator('#voiceInput').set_input_files({'name':'wish.wav','mimeType':'audio/wav','buffer':wav.getvalue()})
        page.locator('#voicePreview').wait_for(state='visible')
        page.locator('#memoryPreviewPhoto').wait_for(state='visible')
        assert page.locator('#memoryPreview').is_visible()
        if label=='desktop':
            page.locator('#memory-studio-title').count() # not present; no-op
            page.locator('.memory-studio').screenshot(path=str(OUT/'wishverse_phase6_memory_studio.png'),animations='disabled')
        with page.expect_download() as download_info:
            page.locator('#downloadKeepsake').click()
        file=download_info.value
        saved=OUT/f'wishverse_phase6_keepsake_{label}.html'
        file.save_as(str(saved))
        content=saved.read_text()
        assert 'data:image/jpeg;base64,' in content
        assert 'data:audio/wav;base64,' in content
        assert 'Aarohi' in content
        assert 'connect-src \'none\'' in content
        assert '<script' not in content
        if label=='desktop':
            with page.expect_download(timeout=20000) as pi:
                page.locator('#downloadPng').click()
            pi.value.save_as(str(OUT/'wishverse_phase6_photo_card.png'))
            image=Image.open(OUT/'wishverse_phase6_photo_card.png')
            assert image.size==(1080,1350)
        page.locator('#previewWish').click()
        assert page.locator('#recipientView').is_visible()
        page.locator('#unwrapAction').click()
        assert page.locator('#recipientRitual').is_visible()
        page.locator('#ritualSkip').click()
        assert page.locator('#recipientOpened').is_visible()
        assert page.locator('#recipientMemoryPhoto').is_visible()
        assert page.locator('#recipientMemoryVoice').is_visible()
        if label=='desktop':
            page.locator('#recipientMemoryTheatre').screenshot(path=str(OUT/'wishverse_phase6_recipient_memory.png'),animations='disabled')
        page.locator('#viewerBrand').click()
        assert not page.locator('#recipientView').is_visible()
        page.locator('#removePhoto').click()
        page.locator('#removeVoice').click()
        assert not page.locator('#memoryPreview').is_visible()
        # saved link continues to omit binaries
        share=page.evaluate('makeShareUrl({...wish, soundscape:"warmth"})')
        from urllib.parse import urlparse,parse_qs
        obj=json.loads(base64.urlsafe_b64decode(parse_qs(urlparse(share).query)['wish'][0]+'==='))
        assert obj['soundscape']=='warmth' and 'photo' not in obj and 'voice' not in obj
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), f'Overflow at {width}'
        assert not errors,errors
        results.append({'viewport':label,'page_errors':len(errors),'keepsake_kb':round(saved.stat().st_size/1024),'photo_added':True,'audio_added':True,'no_overflow':True})
        page.close()
    browser.close()
    print(json.dumps(results,indent=2))
