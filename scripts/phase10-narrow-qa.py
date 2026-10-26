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
    reports=[]
    for width,height,label in [(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,accept_downloads=True)
        page.set_default_timeout(10000)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('about:blank')
        page.evaluate("""() => {const data=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:(k)=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},configurable:true});} """)
        page.set_content(html,wait_until='load',timeout=30000)
        print('loaded',label,flush=True)
        page.locator('#toInput').fill('Aarohi')
        page.locator('#fromInput').fill('Manan')
        page.locator('[data-motion-preset="celebrate"]').click()
        assert page.locator('#wishCard').get_attribute('data-motion')=='celebrate'
        page.locator('[data-seal-preset="heart"]').click()
        assert page.locator('#cardGiftSeal').inner_text()=='♥'
        page.locator('#previewSparkles').click()
        assert page.locator('.card-spark').count()>0
        # Motion + seal survive a share-link round trip.
        assert page.evaluate("""() => {const d=decodeWish(encodeWish(wish));return d.motion==='celebrate'&&d.seal==='heart'}""")
        page.locator('#toInput').fill('Aarohi ✨')
        print('styles done',label,flush=True)
        if width>=961:
            # 3 checkpoints: top, middle, last controls
            positions=[]
            for selector in ['#toInput','#messageInput','#downloadKeepsake']:
                page.locator(selector).scroll_into_view_if_needed()
                page.wait_for_timeout(150)
                pos=page.locator('#previewPanel').bounding_box()
                rect=page.locator('#wishCard').bounding_box()
                positions.append({'checkpoint':selector,'panelTop':round(pos['y']), 'cardTop':round(rect['y']), 'cardBottom':round(rect['y']+rect['height'])})
                assert rect['y'] < height and rect['y']+rect['height']>0,positions
                assert rect['y']+rect['height'] < height+20,positions
            page.locator('#studio').screenshot(path=str(OUT/'wishverse_phase10_sticky_studio.png'),animations='disabled')
        else:
            positions=[]
            for selector in ['#toInput','#messageInput','#downloadKeepsake']:
                page.locator(selector).scroll_into_view_if_needed()
                page.wait_for_timeout(120)
                dock=page.locator('#mobilePreviewDock')
                visible=dock.is_visible()
                actual=page.locator('#previewPanel').bounding_box()
                positions.append({'checkpoint':selector,'dock':visible,'previewTop':round(actual['y'])})
                assert visible or (actual['y'] < height-100 and actual['y']+actual['height']>120),positions
                if label=='mobile' and selector=='#messageInput':
                    dock.screenshot(path=str(OUT/'wishverse_phase10_mobile_dock.png'),animations='disabled')
                    page.screenshot(path=str(OUT/'wishverse_phase10_mobile_editor.png'),animations='disabled')
        print('scroll done',label,positions,flush=True)
        # Focus preview shows exactly one actual card, then returns it.
        if width < 961:
            page.locator('#dockOpen').click() if page.locator('#mobilePreviewDock').is_visible() else page.evaluate('openFocusMode()')
        else: page.locator('#openFocusPreview').click()
        assert page.locator('#focusPreview').is_visible()
        assert page.locator('#focusCardStage #wishCard').count()==1
        assert page.locator('#cardRecipient').inner_text()=='Aarohi ✨'
        if label=='desktop': page.locator('.focus-panel').screenshot(path=str(OUT/'wishverse_phase10_focus_preview.png'),animations='disabled')
        page.locator('#focusBurst').click()
        page.locator('#closeFocusPreview').click()
        assert not page.locator('#focusPreview').is_visible()
        assert page.locator('#previewOuter #wishCard').count()==1
        print('focus done',label,flush=True)
        # Previous features still work.
        page.locator('#previewWish').click()
        assert page.locator('#recipientView').is_visible()
        page.locator('#unwrapAction').click()
        page.locator('#ritualSkip').click()
        assert page.locator('#recipientOpened').is_visible()
        assert page.locator('#openedGiftSeal').inner_text()=='♥'
        page.locator('#viewerBrand').click()
        assert not page.locator('#recipientView').is_visible()
        assert not errors, errors
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth+1'),f'Horizontal overflow at {width}'
        reports.append({'viewport':label,'viewportSize':f'{width}x{height}','checkpoints':positions,'errors':errors,'horizontalOverflow':False})
        print('PASS',label, positions, flush=True)
        page.close()
    browser.close()
    report_path=OUT/'wishverse_phase10_browser_results.json'
    report_path.write_text(json.dumps(reports,indent=2,ensure_ascii=False))
