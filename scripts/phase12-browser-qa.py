"""Phase 12 isolated browser integration QA: no public network or DNS access."""
from pathlib import Path
import base64,json,re,sys
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

def run(width,height,label):
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
  page.set_default_timeout(16000)
  errors=[];page.on('pageerror',lambda err: errors.append(str(err)))
  page.goto('about:blank')
  page.evaluate("""() => {const d=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.get(k)||null,setItem:(k,v)=>d.set(k,v),removeItem:k=>d.delete(k)}})}""")
  page.set_content(html,wait_until='load',timeout=30000)
  assert page.locator('#toInput').input_value()=='Anaya'
  page.locator('#vaultEnabled').check()
  assert page.locator('#vaultFields').is_visible()
  page.locator('#vaultAdmire').fill('Your kindness makes ordinary days brighter. ✨')
  page.locator('#vaultMoment').fill('Our tea conversations and the laughter after.')
  page.locator('#vaultHope').fill('Keep dreaming boldly — the world is yours.')
  assert page.locator('#vaultCounter').inner_text().startswith('3 of 3')
  assert page.evaluate("""() => decodeWish(encodeWish(wish)).vaultHope === 'Keep dreaming boldly — the world is yours.'""")
  page.locator('#vaultFields').scroll_into_view_if_needed()
  page.wait_for_timeout(140)
  if width >= 961:
    box=page.locator('#wishCard').bounding_box()
    assert box and box['y']<height and box['y']+box['height']>0,box
  else:
    box=page.locator('#wishCard').bounding_box()
    assert page.locator('#mobilePreviewDock').is_visible() or (box and box['y']<height and box['y']+box['height']>0)
  if label=='desktop':
   page.locator('.vault-studio').screenshot(path=str(OUT/'Wishverse_Phase12_Vault_Editor.png'),animations='disabled')
  if label=='mobile':
   page.locator('.vault-studio').screenshot(path=str(OUT/'Wishverse_Phase12_Vault_Mobile.png'),animations='disabled')
  page.locator('#previewWish').scroll_into_view_if_needed()
  page.wait_for_timeout(110)
  if width >= 961:
    box=page.locator('#wishCard').bounding_box()
    assert box and box['y']<height and box['y']+box['height']>0,box
  page.locator('#previewWish').click()
  assert page.locator('#recipientClosed').is_visible()
  page.locator('#unwrapAction').click()
  page.locator('#ritualSkip').click()
  assert page.locator('#recipientOpened').is_visible()
  assert page.locator('#recipientVault').is_visible()
  assert page.locator('.vault-gift').count()==3
  if label=='desktop':
   page.locator('#recipientVault').screenshot(path=str(OUT/'Wishverse_Phase12_Vault_Unopened.png'),animations='disabled')
  page.locator('.vault-gift').first.click()
  assert 'kindness' in page.locator('.vault-gift').first.locator('.vault-gift-message').inner_text()
  assert '1 of 3' in page.locator('#vaultProgress').inner_text()
  page.locator('#vaultOpenAll').click()
  assert '3 of 3' in page.locator('#vaultProgress').inner_text()
  if label=='desktop':
   page.locator('#recipientVault').screenshot(path=str(OUT/'Wishverse_Phase12_Vault_Opened.png'),animations='disabled')
  page.locator('#viewerBrand').click()
  assert not page.locator('#recipientView').is_visible()
  page.locator('#vaultEnabled').uncheck()
  page.locator('#previewWish').click();page.locator('#unwrapAction').click();page.locator('#ritualSkip').click()
  assert page.locator('#recipientVault').is_hidden()
  page.locator('#viewerBrand').click()
  assert not errors,errors
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),'Horizontal overflow'
  print(json.dumps({'device':label,'width':width,'vault':True,'legacy_greeting':True,'preview_follow':True,'errors':errors}),flush=True)
  page.close();browser.close()

if __name__=='__main__':
 kind=sys.argv[1] if len(sys.argv)>1 else 'desktop'
 lookup={'desktop':(1440,900),'mobile':(390,844),'small':(320,720)}
 w,h=lookup[kind];run(w,h,kind)
