"""Phase 10 in-memory browser QA; no network, no local navigation."""
from pathlib import Path
import base64, json, re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
ART={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
html=(ROOT/'index.html').read_text();css=(ROOT/'src/styles.css').read_text()
for k,v in ART.items(): html=html.replace('/assets/art/'+k+'.svg',v)
filenames=['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/motion.js','src/lib/storybook.js','src/lib/vault.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/lib/qr-vendor.js','src/lib/share-studio.js','src/main.js']
parts=[]
for name in filenames:
    code=(ROOT/name).read_text()
    code=re.sub(r'^import\s+.*?;\s*$', '',code,flags=re.M)
    code=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '',code)
    code=re.sub(r'^export\s+\{[^}]+\};\s*$', '',code,flags=re.M)
    parts.append(code)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(ART)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>',lambda _: '<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>',lambda _: '<script>'+js.replace('</script>','<\\/script>')+'</script>',html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(1024,700),(1280,690),(1440,650)]:
        page=browser.new_page(viewport={'width':w,'height':h})
        page.goto('about:blank')
        page.evaluate("""() => {const d=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,v)},configurable:true});}""")
        page.set_content(html,wait_until='load',timeout=30000)
        page.locator('#toInput').fill('Supercalifragilistic Name')
        page.locator('#messageInput').fill('I hope your special day is wonderful, joyful, and full of many amazing and unforgettable moments. '*2)
        page.locator('#downloadKeepsake').scroll_into_view_if_needed()
        page.wait_for_timeout(150)
        card=page.locator('#wishCard').bounding_box()
        tools=page.locator('.motion-preview-tools').bounding_box()
        print(w,h,'card',round(card['y']),round(card['y']+card['height']),'tools',round(tools['y']),'zoom',page.locator('#wishCard').evaluate('(e)=>e.style.zoom'),flush=True)
        assert card['y']>=0 and card['y']+card['height']<=h+15
        assert card['y']+card['height']<=tools['y']+1
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
        page.close()
    browser.close()
