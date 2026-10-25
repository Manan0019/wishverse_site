"""Automated isolated-browser QA for Phase 7. Does not use external websites."""
from pathlib import Path
import base64, json, re, io
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
html=(ROOT/'index.html').read_text()
css=(ROOT/'src/styles.css').read_text()
art={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
for name,url in art.items(): html=html.replace(f'/assets/art/{name}.svg',url)
parts=[]
for filename in ['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/main.js']:
    src=(ROOT/filename).read_text()
    src=re.sub(r'^import\s+.*?;\s*$', '', src, flags=re.M)
    src=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '', src)
    parts.append(src)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(art)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>',lambda _:'<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>',lambda _:'<script>'+js.replace('</script>','<\\/script>')+'</script>',html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '',html)

with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    summary=[]
    for width,height,label in [(1440,960,'desktop'),(390,844,'mobile'),(320,720,'small-mobile')]:
        page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
        page.set_default_timeout(12000)
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto('about:blank')
        page.evaluate("() => {const store=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},configurable:true});}")
        page.set_content(html, wait_until='load',timeout=30000)
        assert page.locator('#guideLinks a').count()==6
        page.locator('#studio').scroll_into_view_if_needed()
        page.locator('#languageSelect').select_option('gu')
        assert page.locator('#cardTitle').inner_text()=='જન્મદિવસની શુભેચ્છાઓ'
        assert 'તમારા' in page.locator('#messageInput').input_value()
        page.locator('[data-theme-pill="diwali"]').click()
        assert page.locator('#cardTitle').inner_text()=='શુભ દિવાળી'
        assert '/gu/occasions/diwali/' in page.locator('#guideLinks a').nth(2).get_attribute('href')
        page.locator('#languageSelect').select_option('hi')
        assert page.locator('#cardTitle').inner_text()=='शुभ दीपावली'
        assert 'दीपावली' in page.locator('#messageInput').input_value()
        page.locator('#toInput').fill('मीरा ✨')
        page.locator('#messageInput').fill('आज तुम मेरे लिए बहुत खास हो।')
        page.locator('#languageSelect').select_option('gu')
        assert page.locator('#messageInput').input_value()=='आज तुम मेरे लिए बहुत खास हो।', 'Custom text should never be automatically translated or erased'
        assert page.locator('#cardTitle').inner_text()=='શુભ દિવાળી'
        encoded=page.evaluate('encodeWish({...wish})')
        assert page.evaluate('(v)=>decodeWish(v).lang', encoded)=='gu'
        link=page.evaluate('makeShareUrl(wish)')
        assert '/#wish=' in link and '?' not in link.split('#')[0]
        assert page.evaluate("decodeWish('bad~value')") is None
        if label=='desktop':
            page.locator('#guideLinks').screenshot(path=str(OUT/'wishverse_phase7_guide_links.png'),animations='disabled')
            page.locator('.language-field').screenshot(path=str(OUT/'wishverse_phase7_language_picker.png'),animations='disabled')
            page.locator('#wishCard').screenshot(path=str(OUT/'wishverse_phase7_gujarati_card.png'),animations='disabled')
            with page.expect_download(timeout=25000) as info:page.locator('#downloadPng').click()
            info.value.save_as(str(OUT/'wishverse_phase7_gujarati_png.png'))
            from PIL import Image
            assert Image.open(OUT/'wishverse_phase7_gujarati_png.png').size==(1080,1350)
        page.locator('#previewWish').click()
        assert page.locator('#recipientView').is_visible()
        page.locator('#unwrapAction').click()
        assert page.locator('#recipientRitual').is_visible()
        page.locator('#ritualSkip').click()
        assert page.locator('#recipientOpened').is_visible()
        assert page.locator('#openedGreeting').inner_text()=='શુભ દિવાળી'
        page.locator('#viewerBrand').click()
        assert not page.locator('#recipientView').is_visible()
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
        assert not errors,errors
        summary.append({'viewport':label,'js_errors':len(errors),'guide_links':6,'localized_greeting':'PASS','recipient_reveal':'PASS','horizontal_overflow':False})
        page.close()
    # Static localized guide screenshot and copy behavior.
    guide=(ROOT/'gu/occasions/diwali/index.html').read_text()
    guide=guide.replace('<link rel="stylesheet" href="/assets/occasion.css"/>','<style>'+ (ROOT/'assets/occasion.css').read_text()+'</style>')
    guide=guide.replace('<script src="/assets/occasion.js" defer></script>','<script>'+(ROOT/'assets/occasion.js').read_text()+'</script>')
    for name,url in art.items():guide=guide.replace(f'/assets/art/{name}.svg',url)
    guide_page=browser.new_page(viewport={'width':1380,'height':980})
    guide_page.set_content(guide,wait_until='load')
    assert guide_page.locator('.wish-suggestion').count()==4
    assert guide_page.locator('html').get_attribute('lang')=='gu'
    assert guide_page.locator('link[rel="canonical"]').get_attribute('href').endswith('/gu/occasions/diwali/')
    guide_page.locator('.guide-hero').screenshot(path=str(OUT/'wishverse_phase7_diwali_guide.png'),animations='disabled')
    assert not guide_page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
    browser.close()
    print(json.dumps(summary,ensure_ascii=False,indent=2))
