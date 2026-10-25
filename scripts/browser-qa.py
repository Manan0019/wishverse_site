"""Visual and functional browser QA without requiring local-network navigation.
Production code is not altered; source modules are concatenated in dependency order
and the local SVG artwork is inlined for an isolated about:blank preview.
"""
from pathlib import Path
import base64, json, re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
html=(ROOT/'index.html').read_text()
css=(ROOT/'src/styles.css').read_text()
art={file.stem: 'data:image/svg+xml;base64,'+base64.b64encode(file.read_bytes()).decode() for file in (ROOT/'assets/art').glob('*.svg')}
for name,url in art.items():
    html=html.replace(f'/assets/art/{name}.svg',url)

parts=[]
for file in ['src/data/themes.js','src/lib/share.js','src/lib/download.js','src/main.js']:
    source=(ROOT/file).read_text()
    source=re.sub(r'^import\s+.*?;\s*$', '', source, flags=re.M)
    source=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '', source)
    parts.append(source)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(art)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>',lambda m:'<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>',lambda m:'<script>'+js.replace('</script>','<\\/script>')+'</script>',html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    results=[]
    for width,height,label in [(1440,960,'desktop'),(390,844,'mobile'),(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load',timeout=30000)
        page.locator('#studio').scroll_into_view_if_needed()
        if label=='desktop':
            page.locator('#studio').screenshot(path=str(OUT/'wishverse_phase3_studio_desktop.png'),animations='disabled',timeout=30000)
            page.locator('#occasionGrid').screenshot(path=str(OUT/'wishverse_phase3_occasions.png'),animations='disabled')
        else:
            page.locator('#studio').screenshot(path=str(OUT/f'wishverse_phase3_studio_{label}.png'),animations='disabled')
        assert page.locator('[data-theme]').count()==6
        assert page.locator('[data-tone]').count()==3
        assert page.locator('.finish-pill[data-finish]').count()==3
        page.locator('[data-theme-pill="diwali"]').click()
        page.locator('[data-finish="heirloom"]').click()
        page.locator('#toInput').fill('Aarohi 🌼')
        page.locator('#fromInput').fill('Manan')
        page.locator('#memoryInput').fill('You make every celebration brighter.')
        page.locator('[data-tone="playful"]').click()
        assert page.locator('#cardRecipient').inner_text()=='Aarohi 🌼'
        assert page.locator('#cardTitle').inner_text()=='Happy Diwali'
        assert page.locator('#wishCard').get_attribute('data-finish')=='heirloom'
        assert 'celebration' in page.locator('#cardMemory').inner_text().lower()
        if label=='desktop':
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase3_diwali_heirloom.png'),animations='disabled')
            page.locator('[data-theme-pill="birthday"]').click()
            page.locator('[data-finish="radiance"]').click()
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase3_birthday_radiance.png'),animations='disabled')
            page.locator('[data-theme-pill="anniversary"]').click()
            page.locator('[data-finish="velvet"]').click()
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase3_anniversary_velvet.png'),animations='disabled')
            page.locator('[data-theme-pill="diwali"]').click()
            page.locator('[data-finish="heirloom"]').click()
            with page.expect_download(timeout=20000) as wait:
                page.locator('#downloadPng').click()
            download=wait.value
            download.save_as(str(OUT/'wishverse_phase3_export_test.png'))
            print('PNG downloaded:',download.suggested_filename)
        page.locator('#previewWish').click()
        assert page.locator('#recipientView').is_visible()
        page.locator('#unwrapAction').click()
        assert page.locator('#recipientOpened').is_visible()
        assert page.locator('#memoryReveal').get_attribute('aria-expanded')=='false'
        page.locator('#memoryReveal').click()
        assert page.locator('#memoryReveal').get_attribute('aria-expanded')=='true'
        if label=='desktop':
            page.locator('#openedCard').screenshot(path=str(OUT/'wishverse_phase3_recipient.png'),animations='disabled')
        page.locator('#makeOneBack').click()
        assert not page.locator('#recipientView').is_visible()
        page.locator('#copyLink').click()
        if page.locator('#shareFallback').is_visible():
            url=page.locator('#fallbackUrl').input_value()
            assert 'wish=' in url
            page.locator('#fallbackClose').click()
        overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
        results.append({'view':label,'console_errors':errors,'horizontal_overflow':overflow})
        assert not errors,errors
        assert not overflow, f'horizontal overflow at {width}'
        page.close()
    browser.close()
    print(json.dumps(results,indent=2))
