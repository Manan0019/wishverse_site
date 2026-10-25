"""Generate SEO-friendly, hand-written localized occasion guides (no runtime backend)."""
from pathlib import Path
from html import escape
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://greetings.mananbhayani.online'

DATA = {
 'birthday': {
  'art':'birthday', 'emoji':'✦',
  'en': ('Birthday wishes with a personal touch', 'Birthdays deserve more than a copied sentence. Write a wish that celebrates who the person is today and gives them something lovely to carry into the coming year.', 'Try referencing one shared memory, then add one heartfelt hope for the year ahead.', [
    'Another year, another chance to discover how wonderful life can be. Happy birthday — keep being gloriously you!',
    'I hope this year gives you courage when you need it, quiet when you want it, and laughter every single day.',
    'There are so many reasons the world is brighter with you in it. Today is a good day to celebrate all of them.',
    'Here’s to tiny surprises, big dreams, and the people who make every ordinary day worth remembering.' ]),
  'hi': ('दिल से जन्मदिन की शुभकामनाएँ', 'जन्मदिन पर सबसे प्यारा संदेश वही होता है जिसमें आपकी अपनी कोई याद या भावना हो। सिर्फ शुभकामना नहीं, उनके व्यक्तित्व की भी सराहना करें।', 'एक पुरानी याद जोड़ें और आने वाले साल के लिए एक खूबसूरत कामना लिखें।', [
    'आपके हर सपने को नई उड़ान मिले और हर सुबह एक नई मुस्कान लेकर आए। जन्मदिन मुबारक!',
    'आप जैसे हैं, वैसे ही बेहद खास हैं। आने वाला साल ढेर सारी अच्छी यादें दे।',
    'आज आपकी हँसी सबसे ज़्यादा गूँजे और दिल में हमेशा अपनापन बना रहे।',
    'आपके साथ बिताए छोटे-छोटे पल ही सबसे बड़ी खुशियाँ हैं। जन्मदिन की बहुत शुभकामनाएँ!' ]),
  'gu': ('જન્મદિવસની હૃદયપૂર્વક શુભેચ્છાઓ', 'જન્મદિવસે માત્ર શબ્દો નહીં, તમારા સંબંધની હૂંફ મોકલો. કોઈ જૂની સુંદર યાદ ઉમેરીને શુભેચ્છાને વધુ ખાસ બનાવો.', 'સાથે વિતાવેલી એક યાદ અને આવનારા વર્ષ માટે એક સુંદર આશા લખો.', [
    'તમારા દરેક સપનાને નવી પાંખ મળે અને દરેક સવાર નવી ખુશી લઈને આવે. જન્મદિવસની શુભેચ્છાઓ!',
    'તમે જેવા છો એવા જ અનોખા છો. નવું વર્ષ અઢળક સારા પ્રસંગોથી ભરેલું રહે.',
    'આજે તમારું સ્મિત સૌથી વધુ ઝળકે અને હૃદયમાં હંમેશાં આનંદ રહે.',
    'તમારી સાથેની નાની નાની યાદો અમૂલ્ય છે. જન્મદિવસે ખૂબ પ્રેમ અને શુભકામનાઓ!' ])
 },
 'anniversary': {
  'art':'anniversary','emoji':'♡',
  'en': ('Anniversary wishes that celebrate the journey', 'An anniversary is about the little choices behind a lasting bond. A meaningful message celebrates both the big milestones and the daily acts of care.', 'Mention what you admire about their partnership rather than relying on a generic line.', [
    'May your shared story grow softer where it needs patience and brighter wherever joy finds you.',
    'Here’s to the love in ordinary mornings, unexpected adventures, and all the chapters still unwritten.',
    'The most beautiful part of your story is how you keep choosing each other. Happy anniversary!',
    'Wishing you another year of shared laughter, honest conversations, and wonderfully simple moments.' ]),
  'hi': ('सालगिरह पर प्यार भरी शुभकामनाएँ', 'सालगिरह केवल तारीख नहीं, साथ निभाने की छोटी-बड़ी कोशिशों का उत्सव है। संदेश में आपके रिश्ते की एक खास बात जोड़ें।', 'प्यार और साथ की वह बात लिखें जो आप सचमुच महसूस करते हैं।', [
    'आपका साथ हर आने वाले साल में और भी गहरा और खूबसूरत होता रहे। सालगिरह मुबारक!',
    'जीवन की साधारण सुबहें भी साथ हों तो त्योहार बन जाती हैं। हमेशा यूँ ही मुस्कुराते रहें।',
    'प्यार का सबसे सुंदर रूप है हर दिन एक-दूसरे को फिर से चुनना। आपकी जोड़ी सलामत रहे।',
    'नई यादें, हँसी के पल और एक-दूसरे का भरोसा — यही उपहार हर वर्ष मिलता रहे।' ]),
  'gu': ('વર્ષગાંઠ માટે પ્રેમભરી શુભેચ્છાઓ', 'વર્ષગાંઠ એટલે સાથે જીવેલી નાની-મોટી પળોની ઉજવણી. સાચી લાગણી વ્યક્ત કરતો સંદેશ આ પ્રસંગને યાદગાર બનાવી શકે છે.', 'તમારા સંબંધની એક સુંદર વાત અથવા સાથે વિતાવેલી યાદ ઉમેરો.', [
    'તમારો સાથ દરેક નવા વર્ષે વધુ પ્રેમાળ અને સુંદર બનતો રહે. વર્ષગાંઠની શુભેચ્છાઓ!',
    'સામાન્ય દિવસ પણ સાથે હોઈએ તો ખાસ બની જાય છે. હંમેશાં આમ જ હસતાં રહો.',
    'પ્રેમનો સાચો અર્થ છે રોજ એકબીજાને ફરી પસંદ કરવું. તમારો સંબંધ સદા ખીલે.',
    'નવી યાદો, હાસ્ય અને પરસ્પર વિશ્વાસનો ખજાનો દર વર્ષે વધતો રહે.' ])
 },
 'diwali': {
  'art':'diwali','emoji':'✺',
  'en': ('Diwali greetings full of light and warmth', 'Diwali brings together homes, people and the hope of fresh beginnings. Make your greeting personal with a wish for peace, togetherness and a light-filled year.', 'For family, write about being together; for friends, add a happy shared festive memory.', [
    'May each diya remind you of the warmth you bring to everyone around you. Wishing you a beautiful Diwali.',
    'Let the lights of Diwali brighten your home, strengthen your hopes, and make space for new possibilities.',
    'May this festive season be sweet with togetherness and gentle with everyone who needs a fresh start.',
    'Here’s to glowing evenings, generous hearts, and memories that shine long after the celebrations.' ]),
  'hi': ('रोशनी और अपनापन लिए दिवाली की शुभकामनाएँ', 'दिवाली का सुंदर अर्थ है उम्मीद, परिवार और नई शुरुआत का उजाला। किसी अपने को संदेश लिखते समय उनकी खुशियों और शांति की कामना करें।', 'अपने परिवार की एक दिवाली की याद जोड़कर संदेश को व्यक्तिगत बनाएँ।', [
    'हर दीपक आपके जीवन में एक नई उम्मीद जगाए। शुभ दीपावली!',
    'आपके घर में हँसी, रिश्तों में मिठास और मन में शांति बनी रहे।',
    'दीयों की रोशनी आपके सपनों का रास्ता उज्ज्वल करे और हर नई सुबह मंगलमय हो।',
    'मिठाइयों, रंगोली और अपनों की हँसी से सजी दिवाली का आनंद लें।' ]),
  'gu': ('ઉજાસ અને લાગણીભરી દિવાળીની શુભેચ્છાઓ', 'દિવાળી ઉજાસ, પરિવાર અને નવી શરૂઆતનો સુંદર ઉત્સવ છે. તમારી શુભેચ્છામાં પ્રેમ, શાંતિ અને સાથે વિતાવેલી પળોની વાત ઉમેરો.', 'પરિવાર કે મિત્રોની દિવાળીની એક યાદ લખીને સંદેશને પોતાનો બનાવો.', [
    'દરેક દીવો તમારા જીવનમાં નવી આશા જગાવે. શુભ દિવાળી!',
    'તમારા ઘરમાં હાસ્ય, સંબંધોમાં મીઠાશ અને મનમાં શાંતિ છવાઈ રહે.',
    'દિવાળીની રોશની તમારા સપનાનો માર્ગ પ્રકાશિત કરે અને દરેક સવાર શુભ રહે.',
    'મીઠાઈ, રંગોળી અને પરિવારના પ્રેમથી ભરેલી દિવાળી ખૂબ આનંદમય બને.' ])
 },
 'rakhi': {
  'art':'rakhi','emoji':'❁',
  'en': ('Raksha Bandhan wishes for an unbreakable bond', 'Raksha Bandhan honours sibling relationships in all their forms — the jokes, the little arguments, and the feeling of having someone in your corner.', 'Write a playful sibling memory, then say what you may not say out loud often enough.', [
    'Through every silly argument and every big change, you will always be one of my favourite people.',
    'A thread is small, but the memories and love it represents are enormous. Happy Raksha Bandhan!',
    'Thank you for growing with me, laughing with me, and being there when it matters most.',
    'Here’s to the sibling bond that needs no daily conversation to remain strong and close.' ]),
  'hi': ('भाई-बहन के रिश्ते के लिए रक्षाबंधन संदेश', 'रक्षाबंधन रिश्ते में छिपी शरारत, भरोसे और अपनापन की याद दिलाता है। एक बचपन की याद इसे और खास बना सकती है।', 'हल्की-फुल्की नोकझोंक के साथ एक सच्चा धन्यवाद लिखें।', [
    'हमारी छोटी-छोटी लड़ाइयाँ भी प्यार की ही कहानी हैं। रक्षाबंधन मुबारक!',
    'यह धागा उस भरोसे की याद है जो समय और दूरी से कभी कम नहीं होता।',
    'बचपन की हँसी से आज तक साथ निभाने के लिए दिल से धन्यवाद।',
    'चाहे रोज़ बात न हो, दिल का रिश्ता हमेशा उतना ही अपना रहेगा।' ]),
  'gu': ('ભાઈ-બહેનના પ્રેમ માટે રક્ષાબંધનની શુભેચ્છાઓ', 'રક્ષાબંધન આપણા મીઠા ઝઘડા, વિશ્વાસ અને સ્નેહની યાદ અપાવે છે. બાળપણની એક યાદ સંદેશને વધુ ખાસ બનાવે છે.', 'થોડી મસ્તી સાથે દિલથી આભાર વ્યક્ત કરો.', [
    'આપણા નાના ઝઘડા પણ પ્રેમની જ વાર્તા છે. રક્ષાબંધનની શુભેચ્છાઓ!',
    'રાખડીનો આ દોરો એવો વિશ્વાસ યાદ અપાવે છે જે અંતરથી કદી ઓછો થતો નથી.',
    'બાળપણના હાસ્યથી આજ સુધી સાથ આપવા બદલ દિલથી આભાર.',
    'રોજ વાત ન થાય તો પણ હૃદયનો સંબંધ હંમેશાં એટલો જ નજીક રહેશે.' ])
 },
 'newyear': {
  'art':'newyear','emoji':'✳',
  'en': ('New Year wishes for everything ahead', 'The best New Year greetings balance optimism with real kindness. Offer wishes for courage, connection and ordinary good days — not just spectacular milestones.', 'Instead of promising a perfect year, wish them confidence and supportive people through it.', [
    'Here’s to a year that feels lighter, kinder, and full of small wins worth celebrating.',
    'May you find brave beginnings, familiar comforts, and many moments that feel like home.',
    'A fresh chapter begins — I hope you fill it with things that truly matter to you.',
    'May the coming months surprise you with beautiful friendships, meaningful progress and peace.' ]),
  'hi': ('नववर्ष के लिए आशा से भरे संदेश', 'नया साल नई शुरुआत का अवसर देता है। अच्छी शुभकामना में केवल सफलता नहीं, सुकून और साथ देने वाले लोगों की कामना भी होनी चाहिए।', 'एक सच्ची आशा लिखें जो आने वाले वर्ष में उनके काम आए।', [
    'नया साल आपके लिए सुकून, साहस और छोटी-छोटी सफलताएँ लेकर आए।',
    'नई शुरुआत के साथ पुराने रिश्तों की गर्माहट हमेशा बनी रहे। नववर्ष शुभ हो!',
    'इस वर्ष आप अपने मन की बात सुनें और अपने सपनों को समय दें।',
    'आने वाले दिनों में अच्छे दोस्त, नई सीख और दिल को छू लेने वाली खुशियाँ मिलें।' ]),
  'gu': ('નવા વર્ષ માટે આશાભર્યા સંદેશા', 'નવું વર્ષ નવી શરૂઆતનો અવસર છે. શુભેચ્છામાં માત્ર સફળતા નહીં, શાંતિ, હિંમત અને સારા સંબંધોની કામના પણ ઉમેરો.', 'આવનારા વર્ષ માટે એક સાચી અને વ્યક્તિગત આશા લખો.', [
    'નવું વર્ષ તમારા માટે શાંતિ, હિંમત અને નાની નાની સફળતાઓ લઈને આવે.',
    'નવી શરૂઆત સાથે જૂના સંબંધોની હૂંફ હંમેશાં ટકી રહે. સાલ મુબારક!',
    'આ વર્ષે પોતાના મનની વાત સાંભળો અને સપનાઓને સમય આપો.',
    'આવતા દિવસોમાં સારા મિત્રો, નવું શીખવા મળે અને હૃદયસ્પર્શી ખુશીઓ મળે.' ])
 },
 'christmas': {
  'art':'christmas','emoji':'❄',
  'en': ('Christmas messages for a season of warmth', 'Christmas wishes feel most special when they make someone feel remembered. Think of small acts of kindness, shared meals and the comfort of being together.', 'Make your note cozy and specific — a quiet memory beats an elaborate generic rhyme.', [
    'May this Christmas give you slow mornings, warm company and reasons to smile long after the decorations come down.',
    'Wishing you a home full of laughter, a peaceful heart and the simple joy of being together.',
    'Some of the best gifts are time, kindness and a familiar voice. Merry Christmas to you and yours.',
    'Here’s to soft lights, happy memories and a season that leaves your heart a little fuller.' ]),
  'hi': ('क्रिसमस की स्नेहभरी शुभकामनाएँ', 'क्रिसमस के संदेश में अपनापन और याद किए जाने की खुशी सबसे खास होती है। छोटी-छोटी साझा खुशियों को शब्द दें।', 'अपने किसी प्रिय के साथ बिताए एक सुकून भरे पल का ज़िक्र करें।', [
    'क्रिसमस की रोशनी आपके घर में अपनापन और दिल में सुकून लेकर आए।',
    'हँसी, गर्मजोशी और साथ बिताए पलों से आपका त्योहार यादगार बने।',
    'समय, दया और प्यार से बढ़कर कोई उपहार नहीं। मेरी क्रिसमस!',
    'नरम रोशनी और मीठी यादों से यह मौसम आपके मन को खुशियों से भर दे।' ]),
  'gu': ('ક્રિસમસની હૂંફભરી શુભેચ્છાઓ', 'ક્રિસમસના સંદેશમાં પ્રેમ અને યાદ કર્યાનો આનંદ સૌથી ખાસ છે. સાથેની નાની ખુશીઓને શબ્દોમાં ઉતારો.', 'પ્રિય વ્યક્તિ સાથે વિતાવેલી એક શાંતિભરી પળની વાત ઉમેરો.', [
    'ક્રિસમસની રોશની તમારા ઘરમાં હૂંફ અને હૃદયમાં શાંતિ લઈને આવે.',
    'હાસ્ય, પ્રેમ અને સાથે વિતાવેલી પળોથી તમારો ઉત્સવ યાદગાર બને.',
    'સમય, દયા અને સ્નેહથી મોટું કોઈ ભેટ નથી. મેરી ક્રિસમસ!',
    'મંદ રોશની અને મીઠી યાદોથી આ ઋતુ તમારું મન ખુશીઓથી ભરી દે.' ])
 }
}

LABELS={
 'en': {'home':'Home','browse':'Browse wishes','tip':'Make it personal','wishes':'Original wishes to make your own','copy':'Copy wish','start':'Personalize this occasion','steps':'Make a greeting that feels truly yours','stepbody':'Choose a template, add their name and a personal note, then preview the surprise before sharing. Text-only greetings travel as a link; photos and voice use the downloadable keepsake file.','about':'About','privacy':'Privacy','language':'Language','explore':'Explore more occasions','suggest':'Use the editor to turn any message into a beautiful personalized card.'},
 'hi': {'home':'होम','browse':'शुभकामनाएँ देखें','tip':'इसे अपना बनाएँ','wishes':'दिल से लिखी शुभकामनाएँ','copy':'संदेश कॉपी करें','start':'इस अवसर के लिए कार्ड बनाएँ','steps':'अपनी भावनाओं का सुंदर कार्ड बनाएँ','stepbody':'कार्ड का डिज़ाइन चुनें, नाम और अपनी याद लिखें और भेजने से पहले देख लें। केवल लिखित शुभकामना लिंक से जा सकती है; फ़ोटो और आवाज़ के लिए डाउनलोड की गई यादगार फ़ाइल भेजें।','about':'हमारे बारे में','privacy':'गोपनीयता','language':'भाषा','explore':'अन्य अवसर','suggest':'किसी भी संदेश को अपनी पसंद के खूबसूरत कार्ड में बदलें।'},
 'gu': {'home':'હોમ','browse':'શુભેચ્છાઓ જુઓ','tip':'પોતાનું બનાવો','wishes':'હૃદયથી લખેલી શુભેચ્છાઓ','copy':'સંદેશ કૉપી કરો','start':'આ પ્રસંગ માટે કાર્ડ બનાવો','steps':'તમારી લાગણીનું સુંદર કાર્ડ બનાવો','stepbody':'ડિઝાઇન પસંદ કરો, નામ અને ખાસ યાદ ઉમેરો અને મોકલતાં પહેલાં પ્રિવ્યૂ જુઓ. માત્ર લખાણવાળી શુભેચ્છા લિંકથી મોકલી શકાય છે; ફોટો અને અવાજ માટે ડાઉનલોડ કરેલી યાદગાર ફાઇલ મોકલો.','about':'અમારા વિશે','privacy':'ગોપનીયતા','language':'ભાષા','explore':'વધુ પ્રસંગો','suggest':'કોઈ પણ સંદેશને પોતાના સુંદર કાર્ડમાં ફેરવો.'}
}
OCCASION_NAMES={
 'en':dict(zip(DATA, ['Birthday','Anniversary','Diwali','Raksha Bandhan','New Year','Christmas'])),
 'hi':dict(zip(DATA, ['जन्मदिन','सालगिरह','दिवाली','रक्षाबंधन','नववर्ष','क्रिसमस'])),
 'gu':dict(zip(DATA, ['જન્મદિવસ','વર્ષગાંઠ','દિવાળી','રક્ષાબંધન','નવું વર્ષ','ક્રિસમસ']))
}

def path(locale, occasion):
    return f'/occasions/{occasion}/' if locale == 'en' else f'/{locale}/occasions/{occasion}/'

def page(locale, occasion):
    h=escape
    title,intro,tip,messages=DATA[occasion][locale]; labels=LABELS[locale]
    heading=h(title); current=BASE+path(locale,occasion)
    alt=''.join(f'<link rel="alternate" hreflang="{l}" href="{BASE+path(l,occasion)}" />' for l in ['en','hi','gu'])
    alt+=f'<link rel="alternate" hreflang="x-default" href="{BASE+path("en",occasion)}" />'
    language_links=''.join(f'<a href="{path(l,occasion)}" lang="{l}" hreflang="{l}" {"aria-current=page" if locale==l else ""}>{l.upper() if l=="en" else ("हिन्दी" if l=="hi" else "ગુજરાતી")}</a>' for l in ('en','hi','gu'))
    cards=''.join(f'<article class="wish-suggestion"><div class="wish-count">{i:02d} / WISHVERSE ORIGINAL</div><blockquote>{h(text)}</blockquote><button class="copy-wish" type="button" data-copy="{h(text)}">{h(labels["copy"])} <span aria-hidden="true">↗</span></button></article>' for i,text in enumerate(messages,1))
    others=''.join(f'<a href="{path(locale,k)}"><img src="/assets/art/{k}.svg" alt="" loading="lazy"/><span>{h(OCCASION_NAMES[locale][k])}</span><span aria-hidden="true">↗</span></a>' for k in DATA if k!=occasion)
    editor_url=f'/?occasion={occasion}&lang={locale}#studio'
    description=h(intro[:155])
    return f'''<!doctype html>
<html lang="{locale}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{heading} | Wishverse</title><meta name="description" content="{description}"/><meta name="theme-color" content="#0a0919"/>
<link rel="canonical" href="{current}"/>{alt}
<meta property="og:type" content="article"/><meta property="og:title" content="{heading} — Wishverse"/><meta property="og:description" content="{description}"/>
<meta property="og:url" content="{current}"/><meta property="og:image" content="{BASE}/og-preview.png"/><meta name="twitter:card" content="summary_large_image"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/><link rel="stylesheet" href="/assets/occasion.css"/>
</head><body data-occasion="{occasion}"><div class="ambient"></div>
<header class="guide-header"><div class="guide-shell guide-nav"><a href="/" class="brand">✦ <strong>wishverse<span>.</span></strong></a>
<nav aria-label="Navigation"><a href="/">{h(labels['home'])}</a><a href="/#guides">{h(labels['browse'])}</a></nav>
<div class="locale-nav" aria-label="{h(labels['language'])}">{language_links}</div></div></header>
<main id="main"><section class="guide-hero guide-shell"><div class="guide-copy">
<div class="eyebrow">✦ WISHVERSE / {h(OCCASION_NAMES[locale][occasion])}</div><h1>{heading}<em>.</em></h1>
<p class="hero-lead">{h(intro)}</p><a href="{editor_url}" class="primary-action">{h(labels['start'])}<span aria-hidden="true"> ↗</span></a>
<div class="guide-breadcrumb">{h(labels['home'])} / {h(OCCASION_NAMES[locale][occasion])}</div>
</div><div class="hero-art"><div class="hero-aura"></div><img src="/assets/art/{occasion}.svg" alt="" /></div></section>
<section class="guide-shell tip-section"><div><div class="eyebrow">02 / {h(labels['tip'])}</div><h2>{h(labels['tip'])}</h2></div><p>{h(tip)}</p></section>
<section class="guide-shell"><div class="eyebrow">03 / {h(labels['wishes'])}</div><h2 class="section-title">{h(labels['wishes'])}</h2>
<p class="section-sub">{h(labels['suggest'])}</p><div class="suggestion-grid">{cards}</div></section>
<section class="guide-shell guide-cta"><span class="cta-deco" aria-hidden="true">✳</span><div class="eyebrow">✦ WISHVERSE STUDIO</div><h2>{h(labels['steps'])}</h2>
<p>{h(labels['stepbody'])}</p><a class="primary-action" href="{editor_url}">{h(labels['start'])} <span aria-hidden="true">↗</span></a></section>
<section class="guide-shell more-guides"><div class="eyebrow">04 / WISHVERSE</div><h2>{h(labels['explore'])}</h2><div class="more-grid">{others}</div></section></main>
<footer class="guide-footer"><div class="guide-shell"><a href="/" class="brand">✦ <strong>wishverse.</strong></a><nav><a href="/about.html">{h(labels['about'])}</a><a href="/privacy.html">{h(labels['privacy'])}</a></nav></div></footer>
<div id="copied" role="status" aria-live="polite"></div>
<script src="/assets/occasion.js" defer></script></body></html>'''


def main():
    for occ in DATA:
        for locale in ('en','hi','gu'):
            out=ROOT/path(locale,occ).lstrip('/')/'index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(page(locale,occ),encoding='utf-8')
    # sitemap only indexes public evergreen pages; personal ?wish= pages deliberately excluded
    ns='http://www.sitemaps.org/schemas/sitemap/0.9'
    root=ET.Element('urlset',{'xmlns':ns})
    for address in ['/', '/about.html', '/privacy.html']+[path(l,o) for o in DATA for l in ('en','hi','gu')]:
        ET.SubElement(ET.SubElement(root,'url'),'loc').text=BASE+address
    ET.indent(root, space='  ')
    ET.ElementTree(root).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
    print('Generated 18 localized occasion guides plus sitemap')

if __name__=='__main__':main()
