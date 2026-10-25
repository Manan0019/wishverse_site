// Human-authored interface copy and short wishes. We do not automatically translate personal text.
export const LANGUAGES = Object.freeze([
  { id: 'en', name: 'English', short: 'EN' },
  { id: 'hi', name: 'हिन्दी', short: 'हि' },
  { id: 'gu', name: 'ગુજરાતી', short: 'ગુ' }
]);
export const safeLocale = value => LANGUAGES.some(item => item.id === value) ? value : 'en';

export const OCCASION_LABELS = {
  en: { birthday:'Birthday', anniversary:'Anniversary', diwali:'Diwali', rakhi:'Raksha Bandhan', newyear:'New Year', christmas:'Christmas' },
  hi: { birthday:'जन्मदिन', anniversary:'सालगिरह', diwali:'दिवाली', rakhi:'रक्षाबंधन', newyear:'नववर्ष', christmas:'क्रिसमस' },
  gu: { birthday:'જન્મદિવસ', anniversary:'વર્ષગાંઠ', diwali:'દિવાળી', rakhi:'રક્ષાબંધન', newyear:'નવું વર્ષ', christmas:'ક્રિસમસ' }
};
export const GREETINGS = {
  en: { birthday:'Happy Birthday', anniversary:'Happy Anniversary', diwali:'Happy Diwali', rakhi:'Happy Raksha Bandhan', newyear:'Happy New Year', christmas:'Merry Christmas' },
  hi: { birthday:'जन्मदिन मुबारक', anniversary:'सालगिरह मुबारक', diwali:'शुभ दीपावली', rakhi:'रक्षाबंधन की शुभकामनाएँ', newyear:'नववर्ष की शुभकामनाएँ', christmas:'क्रिसमस की शुभकामनाएँ' },
  gu: { birthday:'જન્મદિવસની શુભેચ્છાઓ', anniversary:'વર્ષગાંઠની શુભેચ્છાઓ', diwali:'શુભ દિવાળી', rakhi:'રક્ષાબંધનની શુભેચ્છાઓ', newyear:'નવા વર્ષની શુભેચ્છાઓ', christmas:'મેરી ક્રિસમસ' }
};
export const SAMPLE_MESSAGES = {
  hi: {
    birthday: 'आपके जीवन का नया साल खुशियों, नई उम्मीदों और उन खूबसूरत पलों से भरा हो जिन्हें आप हमेशा संजोकर रखें।',
    anniversary: 'आप दोनों का साथ यूँ ही प्यार, सम्मान और छोटी-छोटी खुशियों से और भी गहरा होता रहे।',
    diwali: 'इस दीपावली आपके घर में उजाला, मन में शांति और जीवन में नई संभावनाओं का स्वागत हो।',
    rakhi: 'नोकझोंक के बीच छिपा हमारा स्नेह हमेशा बना रहे। रक्षाबंधन पर ढेर सारा प्यार।',
    newyear: 'नया साल नई उम्मीदें, साहस और यादगार खुशियाँ लेकर आए। हर कदम शुभ हो।',
    christmas: 'क्रिसमस की रोशनी आपके घर को अपनापन, सुकून और खुशियों से भर दे।'
  },
  gu: {
    birthday: 'તમારા જીવનનું નવું વર્ષ આનંદ, નવા સપનાં અને યાદગાર પળોથી ભરેલું રહે. જન્મદિવસની ખૂબ શુભેચ્છાઓ!',
    anniversary: 'તમારા સાથમાં પ્રેમ, સન્માન અને નાની નાની ખુશીઓ હંમેશાં ખીલતી રહે. વર્ષગાંઠની શુભેચ્છાઓ!',
    diwali: 'આ દિવાળીએ તમારા ઘરમાં પ્રકાશ, હૃદયમાં શાંતિ અને જીવનમાં નવી આશાઓ છવાઈ રહે.',
    rakhi: 'મીઠી નોકઝોક અને અખૂટ પ્રેમનો આપણો સંબંધ હંમેશાં એવો જ રહે. રક્ષાબંધનની શુભેચ્છાઓ!',
    newyear: 'નવું વર્ષ નવી આશા, હિંમત અને અનમોલ સ્મૃતિઓ લઈને આવે. સાલ મુબારક!',
    christmas: 'ક્રિસમસની ઉજાસ તમારા ઘરે આનંદ, હૂંફ અને પ્રેમના સુંદર પળો લઈને આવે.'
  }
};
// Distinct tone-aware suggestions for Hindi/Gujarati; heartfelt suggestions live above.
const TONE_VARIANTS = {
  hi: {
    birthday: { playful:'आज कैलेंडर का सबसे मज़ेदार दिन है — केक खाओ, हँसो और अपने अंदाज़ में जश्न मनाओ!', elegant:'आपकी नई उम्र सुंदर अवसरों, आत्मविश्वास और यादगार उपलब्धियों से भरी हो।' },
    anniversary: { playful:'आप दोनों की जोड़ी आज भी कमाल की है! हँसी, नोकझोंक और प्यार यूँ ही चलता रहे।', elegant:'आपके रिश्ते की गरिमा, भरोसा और स्नेह हर नए वर्ष में और निखरते रहें।' },
    diwali: { playful:'दीयों की रोशनी, मिठाइयों की मिठास और अपनों की हँसी — दिवाली धूमधाम से मनाइए!', elegant:'दीपों का यह पर्व आपके जीवन में सौम्यता, समृद्धि और उज्ज्वल संभावनाएँ लेकर आए।' },
    rakhi: { playful:'कितना भी झगड़ लें, मिठाई में मेरा हिस्सा मत भूलना! रक्षाबंधन की ढेर सारी शुभकामनाएँ।', elegant:'स्नेह और विश्वास का यह पवित्र बंधन समय के साथ और भी मजबूत होता रहे।' },
    newyear: { playful:'नए साल में नई मस्ती, नई यादें और पुराने दोस्तों के साथ ढेर सारी हँसी मिले!', elegant:'आने वाला वर्ष नए अवसरों, संतुलन और अर्थपूर्ण सफलताओं से सुशोभित हो।' },
    christmas: { playful:'ढेर सारी खुशियाँ, गरम चॉकलेट और अच्छे सरप्राइज़ — क्रिसमस शानदार हो!', elegant:'यह पावन मौसम आपके जीवन में शांति, करुणा और मधुर यादों की रोशनी बिखेरे।' }
  },
  gu: {
    birthday: { playful:'આજે તમારો દિવસ છે — કેક ખાઓ, મસ્તી કરો અને દિલથી ઉજવણી કરો!', elegant:'જીવનનું નવું વર્ષ સુંદર તકો, આત્મવિશ્વાસ અને યાદગાર સફળતાઓથી ભરેલું રહે.' },
    anniversary: { playful:'તમારી જોડી હંમેશાં એવી જ મસ્ત રહે! પ્રેમ, મજાક અને મીઠા ઝઘડા ચાલતા રહે.', elegant:'તમારા સંબંધનું ગૌરવ, વિશ્વાસ અને સ્નેહ દરેક વર્ષે વધુ ખીલે.' },
    diwali: { playful:'દીવા ઝગમગે, મીઠાઈ મળે અને ઘરમાં હાસ્ય ગુંજે — દિવાળી ધમાકેદાર ઉજવો!', elegant:'પ્રકાશનો આ પર્વ જીવનમાં સૌમ્યતા, સમૃદ્ધિ અને ઉજ્જવળ તકો લઈને આવે.' },
    rakhi: { playful:'ગમે એટલા ઝઘડા કરીએ, મીઠાઈમાં મારો ભાગ ભૂલતા નહીં! રક્ષાબંધનની શુભેચ્છાઓ.', elegant:'સ્નેહ અને વિશ્વાસનો આ પવિત્ર બંધન સમય સાથે વધુ મજબૂત બનતો રહે.' },
    newyear: { playful:'નવા વર્ષે નવી મસ્તી, નવી યાદો અને જૂના મિત્રો સાથે ઢગલાબંધ હાસ્ય મળે!', elegant:'આવનારું વર્ષ સંતુલન, સુંદર તકો અને અર્થપૂર્ણ સફળતાઓથી શોભે.' },
    christmas: { playful:'ઘણી ખુશીઓ, ગરમ ચોકલેટ અને મજાના સરપ્રાઇઝ — ક્રિસમસ શાનદાર જાય!', elegant:'આ પવિત્ર ઋતુ જીવનમાં શાંતિ, કરુણા અને મીઠી યાદોની રોશની ફેલાવે.' }
  }
};

const UI = {
  en: {
    navExplore:'Explore occasions', navHow:'How it works', navMagic:'The experience', navCreate:'Create a wish', navGuides:'Wishes & ideas',
    toLabel:'WHO IS THIS FOR?', fromLabel:'WHO IS IT FROM?', relationLabel:'THEIR PLACE IN YOUR LIFE', memoryLabel:'A SPECIAL DETAIL',
    occasionLabel:'CHOOSE THE OCCASION', toneLabel:'CHOOSE THE MESSAGE FEEL', finishLabel:'CHOOSE THE CARD FINISH',
    messageLabel:'YOUR MAIN MESSAGE', copyLink:'Copy magic link', whatsapp:'Share on WhatsApp', preview:'Preview the surprise', download:'Save premium PNG', keepsake:'Download keepsake',
    refresh:'Refresh suggestion', shareNote:'Links share text and design, not attached photos or voice. Anyone with the link can read its message.',
    previewKicker:'YOUR OCCASION WORLD', creatorTitle:'Make it deeply personal.', creatorDesc:'Add their name, your feelings, and a detail only you two share.',
    langLabel:'Website language', occasionGuide:'Explore greeting ideas for each occasion', guidesDesc:'Browse original wishes, meaningful ideas, and beautiful greeting templates.',
    recipientGreeting:'A greeting crafted for you', openMoment:'Begin the moment', revealNow:'Reveal card now', returnWish:'Make one in return',
    sounds:'Sound on / off', msgPlaceholder:'Write something unforgettable…', memoPlaceholder:'A memory or what makes them special',
    happy:'With love,', studio:'Go to the studio', chooseWorld:'Choose a world', home:'Home', custom:'Create your own greeting',
    namesNote:'Names and messages remain in the URL. Do not include sensitive information.'
  },
  hi: {
    navExplore:'अवसर चुनें', navHow:'कैसे काम करता है', navMagic:'खास अनुभव', navCreate:'शुभकामना बनाएँ', navGuides:'संदेश और विचार',
    toLabel:'किसके लिए है?', fromLabel:'किसकी ओर से?', relationLabel:'आपका रिश्ता', memoryLabel:'एक खास याद',
    occasionLabel:'अवसर चुनें', toneLabel:'संदेश का अंदाज़', finishLabel:'कार्ड की शैली चुनें', messageLabel:'आपका संदेश',
    copyLink:'लिंक कॉपी करें', whatsapp:'WhatsApp पर भेजें', preview:'प्रीव्यू देखें', download:'PNG कार्ड सहेजें', keepsake:'यादगार फ़ाइल डाउनलोड करें',
    refresh:'नया सुझाव', shareNote:'लिंक में संदेश और डिज़ाइन होते हैं, फ़ोटो/आवाज़ नहीं। लिंक पाने वाला संदेश पढ़ सकता है।',
    previewKicker:'आपकी शुभकामना', creatorTitle:'अपनी भावनाओं को शब्द दें।', creatorDesc:'नाम, अपना संदेश और एक खास याद जोड़ें।',
    langLabel:'वेबसाइट भाषा', occasionGuide:'हर अवसर के लिए शुभकामना विचार', guidesDesc:'मौलिक संदेश, उपयोगी सुझाव और खूबसूरत कार्ड देखें।',
    recipientGreeting:'सिर्फ आपके लिए एक शुभकामना', openMoment:'खास पल शुरू करें', revealNow:'अभी कार्ड खोलें', returnWish:'जवाब में कार्ड बनाएँ',
    sounds:'ध्वनि चालू / बंद', msgPlaceholder:'दिल से कुछ लिखें…', memoPlaceholder:'एक प्यारी याद या खास बात',
    happy:'स्नेह सहित,', studio:'स्टूडियो में जाएँ', chooseWorld:'एक अवसर चुनें', home:'होम', custom:'अपना कार्ड बनाएँ',
    namesNote:'नाम और संदेश लिंक में हैं। संवेदनशील जानकारी साझा न करें।'
  },
  gu: {
    navExplore:'પ્રસંગ પસંદ કરો', navHow:'કેવી રીતે કામ કરે છે', navMagic:'ખાસ અનુભવ', navCreate:'શુભેચ્છા બનાવો', navGuides:'શુભેચ્છા અને વિચારો',
    toLabel:'કોના માટે છે?', fromLabel:'કોના તરફથી?', relationLabel:'તમારો સંબંધ', memoryLabel:'એક ખાસ યાદ',
    occasionLabel:'પ્રસંગ પસંદ કરો', toneLabel:'સંદેશનો અંદાજ', finishLabel:'કાર્ડની શૈલી', messageLabel:'તમારો સંદેશ',
    copyLink:'લિંક કૉપી કરો', whatsapp:'WhatsApp પર મોકલો', preview:'પ્રિવ્યૂ જુઓ', download:'PNG કાર્ડ સાચવો', keepsake:'યાદગાર ફાઇલ ડાઉનલોડ કરો',
    refresh:'નવો વિચાર', shareNote:'લિંકમાં લખાણ અને ડિઝાઇન હોય છે, ફોટો કે અવાજ નહીં. લિંક ધરાવનાર સંદેશ વાંચી શકે છે.',
    previewKicker:'તમારી શુભેચ્છા', creatorTitle:'તમારી લાગણીને ખાસ બનાવો.', creatorDesc:'નામ, સંદેશ અને એક સુંદર યાદ ઉમેરો.',
    langLabel:'વેબસાઇટની ભાષા', occasionGuide:'દરેક પ્રસંગ માટે શુભેચ્છાના વિચારો', guidesDesc:'મૌલિક સંદેશા, ઉપયોગી વિચારો અને સુંદર કાર્ડ જુઓ.',
    recipientGreeting:'ખાસ તમારા માટે શુભેચ્છા', openMoment:'ખાસ પળ શરૂ કરો', revealNow:'હમણાં કાર્ડ ખોલો', returnWish:'જવાબમાં કાર્ડ બનાવો',
    sounds:'અવાજ ચાલુ / બંધ', msgPlaceholder:'હૃદયથી કંઈક લખો…', memoPlaceholder:'એક ખાસ યાદ કે લાગણી',
    happy:'સ્નેહ સાથે,', studio:'સ્ટુડિયોમાં જાઓ', chooseWorld:'પ્રસંગ પસંદ કરો', home:'હોમ', custom:'પોતાનું કાર્ડ બનાવો',
    namesNote:'નામ અને સંદેશ લિંકમાં છે. સંવેદનશીલ માહિતી લખશો નહીં.'
  }
};

export const tr = (lang, key) => (UI[safeLocale(lang)][key] ?? UI.en[key] ?? key);
export const occasionLabel = (themeId, lang) => OCCASION_LABELS[safeLocale(lang)][themeId] ?? OCCASION_LABELS.en[themeId];
export const greetingFor = (themeId, lang) => GREETINGS[safeLocale(lang)][themeId] ?? GREETINGS.en[themeId];
export const suggestedMessageFor = (theme, tone, lang) => safeLocale(lang) === 'en'
  ? (theme.messages[tone] || theme.messages.heartfelt)
  : (TONE_VARIANTS[safeLocale(lang)]?.[theme.id]?.[tone] || SAMPLE_MESSAGES[safeLocale(lang)][theme.id]);
export const isSuggestedMessage = (theme, text) => Object.values(theme.messages).includes(text) || ['hi','gu'].some(l => SAMPLE_MESSAGES[l][theme.id] === text || Object.values(TONE_VARIANTS[l][theme.id]).includes(text));
