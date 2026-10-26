"""Isolated, in-memory browser check. Does not prove production DNS/PWA install."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, json, re

ROOT=Path(__file__).resolve().parents[1]
ART={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
html=(ROOT/'index.html').read_text();css=(ROOT/'src/styles.css').read_text()
for name,url in ART.items():html=html.replace(f'/assets/art/{name}.svg',url)
parts=[]
for filename in ['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/main.js']:
    code=(ROOT/filename).read_text()
    code=re.sub(r'^import\s+.*?;\s*$', '', code,flags=re.M)
    code=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '', code)
    parts.append(code)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(ART)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>', lambda _: '<style>'+css+'</style>', html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>', lambda _: '<script>'+js.replace('</script>','<\\/script>')+'</script>', html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width, height, label in [(1440,960,'desktop'),(390,844,'mobile'),(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.goto('about:blank')
        page.evaluate("() => {const data=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},configurable:true});}")
        page.set_content(html,wait_until='load',timeout=30000)
        page.locator('#studio').scroll_into_view_if_needed()
        assert 'Aarohi' in page.locator('#sharingReviewSummary').inner_text()
        page.locator('#toInput').fill('જય રાધે ✨')
        assert 'જય રાધે' in page.locator('#sharingReviewSummary').inner_text()
        page.evaluate("() => {media.photo='data:image/jpeg;base64,aGVsbG8=';setPhotoUI();}")
        assert 'NOT go through the link' in page.locator('#sharingMediaWarning').inner_text()
        if label=='desktop':
            page.locator('.sharing-review').screenshot(path='/mnt/data/wishverse_phase8_sharing_clarity.png',animations='disabled')
            page.locator('.hero').screenshot(path='/mnt/data/wishverse_phase8_home_preview.png',animations='disabled')
        page.locator('[data-theme-pill="diwali"]').click()
        page.locator('#previewWish').click()
        assert page.locator('#recipientView').is_visible()
        page.locator('#unwrapAction').click()
        assert page.locator('#recipientRitual').is_visible()
        page.locator('#ritualSkip').click()
        assert page.locator('#recipientOpened').is_visible()
        page.locator('#viewerBrand').click()
        assert not page.locator('#recipientView').is_visible()
        assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
        assert not errors, errors
        print(label, 'PASS', 'JS errors:',len(errors))
        page.close()
    page=browser.new_page(viewport={'width':1060,'height':920})
    help=(ROOT/'help.html').read_text().replace('<link rel="stylesheet" href="/src/styles.css">','<style>'+css+'</style>')
    page.set_content(help,wait_until='load')
    assert page.locator('details').count()>=11
    page.locator('main').screenshot(path='/mnt/data/wishverse_phase8_help_preview.png',animations='disabled')
    assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
    browser.close()
