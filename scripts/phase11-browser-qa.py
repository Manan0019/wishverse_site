"""Browser QA using in-memory HTML + bundled local JS/CSS (no external navigation)."""
from pathlib import Path
import base64, json, re, sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path('/mnt/data')
ART={p.stem:'data:image/svg+xml;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/art').glob('*.svg')}
html=(ROOT/'index.html').read_text(); css=(ROOT/'src/styles.css').read_text()
for k,v in ART.items():html=html.replace('/assets/art/'+k+'.svg',v)
files=['src/data/themes.js','src/data/templates.js','src/data/i18n.js','src/lib/soundscapes.js','src/lib/motion.js','src/lib/storybook.js','src/lib/vault.js','src/lib/share.js','src/lib/drafts.js','src/lib/memory.js','src/lib/download.js','src/lib/qr-vendor.js','src/lib/share-studio.js','src/main.js']
parts=[]
for name in files:
    code=(ROOT/name).read_text()
    code=re.sub(r'^import\s+.*?;\s*$', '',code,flags=re.M)
    code=re.sub(r'\bexport\s+(?=(const|function|async function|class|let)\b)', '',code)
    code=re.sub(r'^export\s+\{[^}]+\};\s*$', '',code,flags=re.M)
    parts.append(code)
js='globalThis.__WISHVERSE_PREVIEW_ART__='+json.dumps(ART)+';\n'+'\n'.join(parts)
html=re.sub(r'<link[^>]*href="/src/styles\.css"[^>]*>', lambda _: '<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]*src="/src/main\.js"[^>]*></script>',lambda _: '<script>'+js.replace('</script>','<\\/script>')+'</script>',html)
html=re.sub(r'<link[^>]*href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>', '', html)

def run(width,height,name):
  with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
    page.set_default_timeout(15000)
    errors=[];page.on('pageerror',lambda err: errors.append(str(err)))
    page.goto('about:blank')
    page.evaluate("""() => {const d=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.get(k)||null,setItem:(k,v)=>d.set(k,v),removeItem:k=>d.delete(k)}})}""")
    page.set_content(html,wait_until='load',timeout=30000)
    # Phase 10 sticky and the mobile dock survive Phase 11
    for target in ['#toInput','#storySpark','#downloadKeepsake']:
      if target=='#storySpark':
        page.locator('#storyEnabled').check()
      page.locator(target).scroll_into_view_if_needed()
      page.wait_for_timeout(100)
      if width >= 961:
        r=page.locator('#wishCard').bounding_box()
        assert r and r['y'] < height and r['y']+r['height'] > 0,(target,r)
      else:
        r=page.locator('#wishCard').bounding_box(); dock=page.locator('#mobilePreviewDock').is_visible()
        assert dock or (r['y']<height and r['y']+r['height']>0),target
    page.locator('#storySpark').fill('Your kindness lights up every room.')
    page.locator('#storyMoment').fill('Remember our favorite sunset together?')
    page.locator('#storyPromise').fill('More adventures and laughter await us.')
    page.locator('#toInput').fill('Anaya')
    assert page.locator('#storyCounter').inner_text().startswith('3 of 3')
    assert page.evaluate("""() => decodeWish(encodeWish(wish)).storyPromise === 'More adventures and laughter await us.'""")
    if name=='desktop':
      page.locator('#storybookStudio').screenshot(path=str(OUT/'Wishverse_Phase11_Story_Editor.png'),animations='disabled')
    page.locator('#previewWish').click()
    assert page.locator('#recipientClosed').is_visible()
    page.locator('#unwrapAction').click()
    page.locator('#ritualSkip').click()
    assert page.locator('#recipientStory').is_visible()
    assert page.locator('#storySceneMessage').inner_text()=='Your kindness lights up every room.'
    if name=='desktop':page.locator('#recipientStory').screenshot(path=str(OUT/'Wishverse_Phase11_Story_Recipient.png'),animations='disabled')
    if name=='mobile':page.locator('#recipientStory').screenshot(path=str(OUT/'Wishverse_Phase11_Story_Mobile.png'),animations='disabled')
    page.locator('#storyNext').click()
    assert 'sunset' in page.locator('#storySceneMessage').inner_text()
    page.locator('#storyPrevious').click()
    assert 'kindness' in page.locator('#storySceneMessage').inner_text()
    page.locator('#storyNext').click();page.locator('#storyNext').click()
    assert 'adventures' in page.locator('#storySceneMessage').inner_text()
    page.locator('#storyNext').click()
    assert page.locator('#recipientOpened').is_visible()
    page.locator('#viewerBrand').click()
    assert not page.locator('#recipientView').is_visible()
    # Legacy behavior: Storybook is optional and empty by default.
    page.locator('#storyEnabled').uncheck()
    page.locator('#previewWish').click()
    page.locator('#unwrapAction').click();page.locator('#ritualSkip').click()
    assert page.locator('#recipientOpened').is_visible()
    page.locator('#viewerBrand').click()
    assert not errors,errors
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),f'Overflow at {width}'
    print(json.dumps({'device':name,'width':width,'story_chapters':3,'sticky_preview':True,'legacy':True,'page_errors':errors}),flush=True)
    page.close();browser.close()

if __name__=='__main__':
  dev=sys.argv[1] if len(sys.argv)>1 else 'desktop'
  for args in ([(1440,900,'desktop')] if dev=='desktop' else [(390,844,'mobile')] if dev=='mobile' else [(320,720,'small-mobile')]):run(*args)
