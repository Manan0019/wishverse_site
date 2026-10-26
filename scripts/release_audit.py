#!/usr/bin/env python3
"""Check a clean Wishverse Pages deployment directory for structural release errors.
The audit intentionally does not assert that a DNS name or Cloudflare account is active.
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
import argparse, json, sys, xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOMAIN='greetings.mananbhayani.online'
PUBLIC_REQUIRED=[
  'index.html','about.html','privacy.html','help.html','offline.html','404.html',
  'site.webmanifest','sw.js','icon-192.png','icon-512.png','robots.txt','sitemap.xml',
  'og-preview.png','favicon.svg','_headers','src/styles.css','src/main.js','src/lib/share-studio.js','src/lib/qr-vendor.js','src/lib/QR_LICENSE.txt'
]
OCCASIONS=['birthday','anniversary','diwali','rakhi','newyear','christmas']

def resolve_asset(base: Path, link: str, parent: Path):
    if not link or link.startswith(('http:','https:','mailto:','tel:','data:','blob:','javascript:','#','//')): return None
    u=urlparse(link)
    if u.scheme or u.netloc: return None
    path=unquote(u.path)
    if not path or path=='/': return base/'index.html'
    file = base/path.lstrip('/') if path.startswith('/') else parent.parent/path
    if file.is_dir() or path.endswith('/'): file=file/'index.html'
    return file

def audit(base:Path):
    failures=[]; warnings=[]
    for f in PUBLIC_REQUIRED:
        if not (base/f).is_file():failures.append(f'File missing: {f}')
    for f in ['README.md','QA_NOTES.md','DEPLOYMENT.md','package.json']:
        if (base/f).exists():failures.append(f'Private source-only file shipped: {f}')
    if (base/'scripts').exists():failures.append('Internal scripts folder shipped')
    if (base/'dist').exists():failures.append('Nested dist directory shipped')
    htmls=list(base.rglob('*.html'))
    guide_pages=[base / lang / 'occasions' / theme / 'index.html' for lang in ['', 'hi', 'gu'] for theme in OCCASIONS]
    for guide in guide_pages:
        if not guide.exists():failures.append('Missing guide: '+str(guide.relative_to(base)))
    internal_refs=0
    for f in htmls:
        soup=BeautifulSoup(f.read_text(encoding='utf-8'), 'html.parser')
        ids=[a.get('id') for a in soup.select('[id]')]
        if len(ids)!=len(set(ids)):failures.append(f'Duplicate IDs in {f.relative_to(base)}')
        for attr in [('a','href'),('link','href'),('script','src'),('img','src'),('audio','src')]:
            for tag in soup.find_all(attr[0]):
                link=tag.get(attr[1],'')
                resolved=resolve_asset(base,link,f)
                if resolved is None:continue
                internal_refs+=1
                if not resolved.exists():failures.append(f'Broken {attr[1]} in {f.relative_to(base)}: {link}')
        if f in guide_pages:
            if not soup.find('link',rel='canonical'): failures.append(f'Guide missing canonical: {f.relative_to(base)}')
            if not soup.find('html',lang=True): failures.append(f'Guide missing lang: {f.relative_to(base)}')
    try:
        manifest=json.loads((base/'site.webmanifest').read_text())
        for icon in manifest.get('icons',[]):
            f=resolve_asset(base,icon.get('src',''),base/'index.html')
            if not f or not f.exists():failures.append('Manifest icon missing: '+str(icon))
        for name in ['icon-192.png','icon-512.png']:
            with Image.open(base/name) as img:
                if img.size!=(int(name.split('-')[1].split('.')[0]),)*2:failures.append('Icon has incorrect dimensions: '+name)
    except Exception as error: failures.append('Manifest/icons invalid: '+str(error))
    try:
        with Image.open(base/'og-preview.png') as img:
            if img.size!=(1200,630):warnings.append(f'OG image is {img.size}; expected 1200x630')
    except Exception as error: failures.append('Open Graph image invalid: '+str(error))
    try:
        root=ET.parse(base/'sitemap.xml').getroot()
        urls=[(item.text or '').strip() for item in root.iter() if item.tag.endswith('loc')]
        for path in ['/', '/help.html', '/about.html', '/privacy.html'] + ['/'+('/'.join(x.relative_to(base).parts[:-1]))+'/' for x in guide_pages]:
            if f'https://{DOMAIN}{path}' not in urls:failures.append('Missing sitemap URL: '+path)
        if len(urls) < 22:failures.append(f'Unexpectedly small sitemap: {len(urls)} links')
    except Exception as error:failures.append('Sitemap invalid: '+str(error))
    try:
        headers=(base/'_headers').read_text()
        for h in ['Content-Security-Policy','X-Content-Type-Options','Referrer-Policy','Permissions-Policy']:
            if h not in headers:failures.append('Missing security header: '+h)
        if "script-src 'self'" not in headers:failures.append('CSP script-src self missing')
        sw=(base/'sw.js').read_text()
        if "url.searchParams.has('wish')" not in sw:failures.append('Service worker does not exclude legacy wish parameters')
        if 'localStorage' in sw or 'indexedDB' in sw:failures.append('Service worker should not handle private storage')
    except Exception as error:failures.append('Security file read failed: '+str(error))
    if not all('greetings.mananbhayani.online' in x for x in urls):failures.append('Wrong hostname in sitemap')
    # Known real-launch gaps are explicit and must not be advertised as completed.
    blockers=['Cloudflare project and domain/DNS are not verified', 'Real working support contact must be configured', 'Real-device microphone/WhatsApp/browser QA pending', 'Native-speaker proofreading pending', 'Legal/privacy operator review and AdSense readiness pending']
    return {'package_pass':not failures, 'errors':failures, 'warnings':warnings,
            'html_files':len(htmls),'guide_pages_found':sum(g.exists() for g in guide_pages),
            'internal_asset_links_checked':internal_refs,'sitemap_entries':len(urls),
            'launch_ready':False,'remaining_operator_gates':blockers}

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--dir',default=str(ROOT/'dist'))
    parser.add_argument('--json',default='')
    args=parser.parse_args()
    report=audit(Path(args.dir))
    output=json.dumps(report,indent=2,ensure_ascii=False)
    print(output)
    if args.json:Path(args.json).write_text(output+'\n')
    sys.exit(0 if report['package_pass'] else 1)
