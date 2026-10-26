"""Phase 5: browser QA through isolated in-memory preview, no network/local file navigation."""
from pathlib import Path
import base64, json, re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path('/mnt/data')
html = (ROOT / 'index.html').read_text()
css = (ROOT / 'src/styles.css').read_text()
art = {p.stem: 'data:image/svg+xml;base64,' + base64.b64encode(p.read_bytes()).decode() for p in (ROOT / 'assets/art').glob('*.svg')}
for name,url in art.items():
    html = html.replace(f'/assets/art/{name}.svg',url)

parts=[]
for filename in ['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/motion.js','src/lib/storybook.js','src/lib/vault.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/lib/qr-vendor.js','src/lib/share-studio.js','src/main.js']:
    src=(ROOT/filename).read_text()
    src=re.sub(r'^import\s+.*?;\s*$', '', src, flags=re.M)
    src=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '', src)
    parts.append(src)
js = 'globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(art)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>', lambda _: '<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>', lambda _: '<script>'+js.replace('</script>','<\\/script>')+'</script>',html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    results=[]
    for width,height,label in [(1440,980,'desktop'),(390,844,'mobile'),(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,accept_downloads=True)
        page.set_default_timeout(8000)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        # safe stub: isolated HTML cannot normally use real localStorage due to opaque origin.
        page.goto('about:blank')
        page.evaluate('''() => {const store = new Map(); Object.defineProperty(window,'localStorage',{value:{getItem:(k)=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},configurable:true});}''')
        page.set_content(html,wait_until='load',timeout=30000)
        page.locator('#studio').scroll_into_view_if_needed()
        assert page.locator('[data-theme]').count()==6
        assert page.locator('[data-template]').count()==4
        assert page.locator('[data-tone]').count()==3
        assert page.locator('.finish-pill').count()==3
        if label=='desktop':
            page.locator('#templateGallery').screenshot(path=str(OUT/'wishverse_phase5_template_gallery.png'),animations='disabled')
            page.locator('#studio').screenshot(path=str(OUT/'wishverse_phase5_studio_desktop.png'),animations='disabled')
        else:
            page.locator('#studio').screenshot(path=str(OUT/f'wishverse_phase5_studio_{label}.png'),animations='disabled')

        # template and occasion switching
        page.locator('[data-template="birthday-3"]').click()
        assert page.locator('#wishCard').get_attribute('data-layout')=='minimal'
        assert page.locator('#previewTemplate').inner_text()=='SUNDAY CAKE'
        if label=='desktop':
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase5_card_minimal.png'),animations='disabled')
        page.locator('[data-template="birthday-2"]').click()
        assert page.locator('#wishCard').get_attribute('data-layout')=='editorial'
        if label=='desktop':
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase5_card_editorial.png'),animations='disabled')
        page.locator('[data-theme-pill="diwali"]').click()
        assert page.locator('[data-template]').count()==4
        page.locator('[data-template="diwali-4"]').click()
        assert page.locator('#wishCard').get_attribute('data-layout')=='celestial'
        if label=='desktop':
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase5_card_diwali_celestial.png'),animations='disabled')
        page.locator('#toInput').fill('Anaya 🌼')
        page.locator('#fromInput').fill('Manan')
        page.locator('#memoryInput').fill('You make every celebration brighter.')
        assert 'Anaya' in page.locator('#cardRecipient').inner_text()
        assert page.locator('#cardMemory').inner_text()=='You make every celebration brighter.'

        # saving, loading, and deleting drafts; restore template and personalized fields
        page.locator('#draftName').fill('Diwali with Anaya')
        page.locator('#saveDraft').click()
        assert page.locator('.draft-row').count()==1
        page.locator('[data-theme-pill="christmas"]').click()
        page.locator('#toInput').fill('Someone else')
        page.locator('.draft-row-actions button').first.click()
        assert page.locator('#toInput').input_value()=='Anaya 🌼'
        assert page.locator('#wishCard').get_attribute('data-layout')=='celestial'
        assert page.locator('#cardTitle').inner_text()=='Happy Diwali'
        page.locator('.draft-remove').click()
        assert page.locator('.draft-row').count()==0

        # share backward/forward link and unicode
        page.locator('#copyLink').click()
        if page.locator('#shareFallback').is_visible():
            assert 'wish=' in page.locator('#fallbackUrl').input_value()
            page.locator('#fallbackClose').click()
        if label=='desktop':
            with page.expect_download(timeout=20000) as d:
                page.locator('#downloadPng').click()
            download=d.value
            assert 'diwali-4' in download.suggested_filename
            download.save_as(str(OUT/'wishverse_phase5_export_diwali.png'))

        # recipient ritual stays working from Phase 4
        page.locator('#previewWish').click()
        assert page.locator('#recipientView').is_visible()
        page.locator('#unwrapAction').click()
        assert page.locator('#recipientRitual').is_visible()
        assert page.locator('.ritual-diya').count()==4
        if label=='desktop':
            page.locator('.ritual-panel').screenshot(path=str(OUT/'wishverse_phase5_ritual_diwali.png'),animations='disabled')
        for i in range(1,5):
            page.locator(f'[data-diya="{i}"]').click()
        page.wait_for_timeout(550)
        assert page.locator('#recipientOpened').is_visible()
        assert page.locator('#openedCard').get_attribute('data-layout')=='celestial'
        assert 'MIDNIGHT DIYAS' in page.locator('#openedOverline').inner_text()
        if label=='desktop':
            page.locator('#openedCard').screenshot(path=str(OUT/'wishverse_phase5_recipient_card.png'),animations='disabled')
        page.locator('#memoryReveal').click()
        assert page.locator('#memoryReveal').get_attribute('aria-expanded')=='true'
        page.locator('#makeOneBack').click()
        assert not page.locator('#recipientView').is_visible()


        overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
        results.append({'size':label,'javascript_errors':errors,'horizontal_overflow':overflow})
        assert not errors, errors
        assert not overflow, f'Horizontal overflow at {width}px'
        page.close()
    browser.close()
    print(json.dumps(results,indent=2))
