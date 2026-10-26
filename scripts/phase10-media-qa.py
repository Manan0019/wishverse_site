"""Phase 10 in-memory browser QA; no network, no local navigation."""
from pathlib import Path
import base64, json, re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
ART={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
html=(ROOT/'index.html').read_text();css=(ROOT/'src/styles.css').read_text()
for k,v in ART.items(): html=html.replace('/assets/art/'+k+'.svg',v)
filenames=['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/motion.js','src/lib/storybook.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/lib/qr-vendor.js','src/lib/share-studio.js','src/main.js']
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
    page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
    page.goto('about:blank')
    page.evaluate("""() => {const d=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,v)},configurable:true});}""")
    page.set_content(html,wait_until='load',timeout=30000)
    page.locator('#toInput').fill('Aarohi')
    page.locator('[data-motion-preset="cinematic"]').click()
    page.locator('[data-seal-preset="heart"]').click()
    page.locator('.motion-lab').screenshot(path=str(OUT/'wishverse_phase10_motion_lab.png'),animations='disabled')
    page.locator('#messageInput').scroll_into_view_if_needed()
    print('POSITIONS',page.evaluate('''() => Object.fromEntries(['previewPanel','previewOuter','wishCard','openFocusPreview','cardMagicBurst'].map(id=>{const b=document.getElementById(id).getBoundingClientRect();return [id,{top:Math.round(b.top),bottom:Math.round(b.bottom),height:Math.round(b.height),zoom:document.getElementById(id).style.zoom}] }))'''),flush=True)
    page.locator('#previewPanel').screenshot(path=str(OUT/'wishverse_phase10_sticky_preview.png'),animations='disabled')
    page.locator('#openFocusPreview').click()
    page.locator('.focus-panel').screenshot(path=str(OUT/'wishverse_phase10_focus_preview.png'),animations='disabled')
    page.locator('#closeFocusPreview').click()
    with page.expect_download(timeout=12000) as info:
        page.locator('#downloadPng').click()
    d=info.value
    d.save_as(str(OUT/'wishverse_phase10_heart_seal_export.png'))
    print('PNG EXPORTED',d.suggested_filename,flush=True)
    page.close()
    browser.close()
