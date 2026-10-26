"""Isolated in-memory Playwright QA: Phase 9 Share Studio + gratitude flow.
Actual DNS and real phone sharing must be tested by the owner after deployment.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,base64
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
ART={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
html=(ROOT/'index.html').read_text();css=(ROOT/'src/styles.css').read_text()
for name,url in ART.items(): html=html.replace(f'/assets/art/{name}.svg',url)
filenames=['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/motion.js','src/lib/storybook.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/lib/qr-vendor.js','src/lib/share-studio.js','src/main.js']
parts=[]
for filename in filenames:
    code=(ROOT/filename).read_text()
    code=re.sub(r'^import\s+.*?;\s*$', '', code,flags=re.M)
    code=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '', code)
    code=re.sub(r'^export\s+\{[^}]+\};\s*$', '', code,flags=re.M)
    parts.append(code)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(ART)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>', lambda _: '<style>'+css+'</style>', html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>', lambda _: '<script>'+js.replace('</script>','<\\/script>')+'</script>', html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    records=[]
    for width,height,label in [(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
        page.set_default_timeout(15000)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('about:blank')
        page.evaluate("""() => {const d=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,v)},configurable:true});}""")
        page.set_content(html,wait_until='load',timeout=30000)
        print('Loaded',label,flush=True)
        page.locator('#toInput').fill('Aarohi')
        page.locator('#fromInput').fill('Manan')
        (page.evaluate('openShareStudio()') if label=='small-mobile' else page.locator('#openShareStudio').click())
        print('Opened Share Studio',label,flush=True)
        assert page.locator('#shareStudio').is_visible()
        assert page.locator('#shareQrCanvas').is_visible()
        url=page.locator('#shareUrlText').input_value()
        assert url.startswith('https://greetings.mananbhayani.online/#wish=')
        assert page.locator('#shareMiniTitle').inner_text()=='For Aarohi'
        count=page.locator('#shareQrCanvas').evaluate('(el)=>{const a=el.getContext("2d").getImageData(0,0,el.width,el.height).data;let dark=0;for(let i=0;i<a.length;i+=4){if(a[i]<80)dark++}return dark}')
        assert count>1000, count
        if label=='desktop':
            page.locator('.share-studio-panel').screenshot(path=str(OUT/'wishverse_phase9_share_studio.png'),animations='disabled')
            with page.expect_download() as d: page.locator('#downloadQRPoster').click()
            download=d.value;assert 'qr-birthday' in download.suggested_filename
            download.save_as(str(OUT/'wishverse_phase9_qr_poster.png'))
        elif label=='mobile':
            page.locator('.share-studio-panel').screenshot(path=str(OUT/'wishverse_phase9_share_mobile.png'),animations='disabled')
        page.locator('#shareNative').click(timeout=8000)
        assert page.locator('#shareStudio').is_visible()
        print('Native share control tested',label,flush=True)
        page.keyboard.press('Escape')
        assert not page.locator('#shareStudio').is_visible()
        assert page.locator('#openShareStudio').is_visible()
        print('Modal closed',label,flush=True)
        page.locator('#previewWish').click()
        page.locator('#unwrapAction').click()
        page.locator('#ritualSkip').click()
        assert page.locator('#recipientOpened').is_visible()
        assert page.locator('#sendReaction').is_disabled()
        page.locator('[data-reaction="Loved it"]').click()
        assert page.locator('#sendReaction').is_enabled()
        assert page.locator('[data-reaction="Loved it"]').get_attribute('aria-pressed')=='true'
        if label=='desktop': page.locator('#reactionNote').screenshot(path=str(OUT/'wishverse_phase9_recipient_reactions.png'),animations='disabled')
        page.locator('#viewerBrand').click()
        assert not page.locator('#recipientView').is_visible()
        overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth+1')
        assert not errors, errors
        assert not overflow, f'horizontal overflow at {width}px'
        records.append({'viewport':label,'errors':len(errors),'overflow':overflow,'qr_dark_modules':count,'recipient_reactions':True})
        print('Passed',label,flush=True)
        page.close()
    browser.close()
    print(json.dumps(records,indent=2))
