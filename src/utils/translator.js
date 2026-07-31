/**
 * Free Script Translator Utility for AetherVocal Studio
 * Uses free public translation endpoint (No API Key required)
 * Supports 135+ Complete Google Translate Global Languages
 */

export const SUPPORTED_LANGUAGES = [
  // Indian Languages
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇵🇰' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese (অসমীয়া)', flag: '🇮🇳' },
  { code: 'bho', name: 'Bhojpuri (भोजपुरी)', flag: '🇮🇳' },
  { code: 'doi', name: 'Dogri (डोगरी)', flag: '🇮🇳' },
  { code: 'gom', name: 'Konkani (कोंकणी)', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili (मैथिली)', flag: '🇮🇳' },
  { code: 'mni-Mtei', name: 'Meiteilon / Manipuri', flag: '🇮🇳' },
  { code: 'lus', name: 'Mizo', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)', flag: '🇮🇳' },
  { code: 'sd', name: 'Sindhi (सिन्धी)', flag: '🇵🇰' },
  { code: 'ne', name: 'Nepali (नेपाली)', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala (සිංහල)', flag: '🇱🇰' },
  { code: 'dv', name: 'Dhivehi (ދިވެހި)', flag: '🇲🇻' },

  // International Languages (A-Z)
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian (Shqip)', flag: '🇦🇱' },
  { code: 'am', name: 'Amharic (አማርኛ)', flag: '🇪🇹' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'hy', name: 'Armenian (Հայերեն)', flag: '🇦🇲' },
  { code: 'ay', name: 'Aymara', flag: '🇧🇴' },
  { code: 'az', name: 'Azerbaijani (Azərbaycan)', flag: '🇦🇿' },
  { code: 'bm', name: 'Bambara', flag: '🇲🇱' },
  { code: 'eu', name: 'Basque (Euskara)', flag: '🇪🇸' },
  { code: 'be', name: 'Belarusian (Беларуская)', flag: '🇧🇾' },
  { code: 'bs', name: 'Bosnian (Bosanski)', flag: '🇧🇦' },
  { code: 'bg', name: 'Bulgarian (Български)', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan (Català)', flag: '🇪🇸' },
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭' },
  { code: 'ny', name: 'Chichewa / Nyanja', flag: '🇲🇼' },
  { code: 'zh-CN', name: 'Chinese Simplified (简体中文)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese Traditional (繁體中文)', flag: '🇨🇳' },
  { code: 'co', name: 'Corsican', flag: '🇫🇷' },
  { code: 'hr', name: 'Croatian (Hrvatski)', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech (Čeština)', flag: '🇨🇿' },
  { code: 'da', name: 'Danish (Dansk)', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch (Nederlands)', flag: '🇳🇱' },
  { code: 'eo', name: 'Esperanto', flag: '🌐' },
  { code: 'et', name: 'Estonian (Eesti)', flag: '🇪🇪' },
  { code: 'ee', name: 'Ewe', flag: '🇬🇭' },
  { code: 'tl', name: 'Filipino (Tagalog)', flag: '🇵🇭' },
  { code: 'fi', name: 'Finnish (Suomi)', flag: '🇫🇮' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'fy', name: 'Frisian', flag: '🇳🇱' },
  { code: 'gl', name: 'Galician (Galego)', flag: '🇪🇸' },
  { code: 'ka', name: 'Georgian (ქართული)', flag: '🇬🇪' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'el', name: 'Greek (Ελληνικά)', flag: '🇬🇷' },
  { code: 'gn', name: 'Guarani', flag: '🇵🇾' },
  { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'haw', name: 'Hawaiian', flag: '🇺🇸' },
  { code: 'he', name: 'Hebrew (עברית)', flag: '🇮🇱' },
  { code: 'hmn', name: 'Hmong', flag: '🇱🇦' },
  { code: 'hu', name: 'Hungarian (Magyar)', flag: '🇭🇺' },
  { code: 'is', name: 'Icelandic (Íslenska)', flag: '🇮🇸' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'ilo', name: 'Ilocano', flag: '🇵🇭' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)', flag: '🇮🇩' },
  { code: 'ga', name: 'Irish (Gaeilge)', flag: '🇮🇪' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'jw', name: 'Javanese', flag: '🇮🇩' },
  { code: 'kk', name: 'Kazakh (Қазақ)', flag: '🇰🇿' },
  { code: 'km', name: 'Khmer (ភាសាខ្មែរ)', flag: '🇰🇭' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'kri', name: 'Krio', flag: '🇸🇱' },
  { code: 'ku', name: 'Kurdish (Kurmanji)', flag: '🇮🇶' },
  { code: 'ky', name: 'Kyrgyz (Кыргызча)', flag: '🇰🇬' },
  { code: 'lo', name: 'Lao (ລາວ)', flag: '🇱🇦' },
  { code: 'la', name: 'Latin', flag: '🇻🇦' },
  { code: 'lv', name: 'Latvian (Latviešu)', flag: '🇱🇻' },
  { code: 'ln', name: 'Lingala', flag: '🇨🇩' },
  { code: 'lt', name: 'Lithuanian (Lietuvių)', flag: '🇱🇹' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
  { code: 'lb', name: 'Luxembourgish', flag: '🇱🇺' },
  { code: 'mk', name: 'Macedonian (Македонски)', flag: '🇲🇰' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)', flag: '🇲🇾' },
  { code: 'mt', name: 'Maltese (Malti)', flag: '🇲🇹' },
  { code: 'mi', name: 'Maori', flag: '🇳🇿' },
  { code: 'mn', name: 'Mongolian (Монгол)', flag: '🇲🇳' },
  { code: 'my', name: 'Burmese (မြန်မာစာ)', flag: '🇲🇲' },
  { code: 'no', name: 'Norwegian (Norsk)', flag: '🇳🇴' },
  { code: 'om', name: 'Oromo', flag: '🇪🇹' },
  { code: 'ps', name: 'Pashto (پښتو)', flag: '🇦🇫' },
  { code: 'fa', name: 'Persian (فارسی)', flag: '🇮🇷' },
  { code: 'pl', name: 'Polish (Polski)', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'qu', name: 'Quechua', flag: '🇵🇪' },
  { code: 'ro', name: 'Romanian (Română)', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'sm', name: 'Samoan', flag: '🇼🇸' },
  { code: 'gd', name: 'Scots Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'nso', name: 'Sepedi', flag: '🇿🇦' },
  { code: 'sr', name: 'Serbian (Српски)', flag: '🇷🇸' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'sk', name: 'Slovak (Slovenčina)', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian (Slovenščina)', flag: '🇸🇮' },
  { code: 'so', name: 'Somali (Soomaali)', flag: '🇸🇴' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'su', name: 'Sundanese', flag: '🇮🇩' },
  { code: 'sw', name: 'Swahili (Kiswahili)', flag: '🇰🇪' },
  { code: 'sv', name: 'Swedish (Svenska)', flag: '🇸🇪' },
  { code: 'tg', name: 'Tajik (Тоҷикӣ)', flag: '🇹🇯' },
  { code: 'tt', name: 'Tatar', flag: '🇷🇺' },
  { code: 'th', name: 'Thai (ไทย)', flag: '🇹🇭' },
  { code: 'ti', name: 'Tigrinya', flag: '🇪🇷' },
  { code: 'ts', name: 'Tsonga', flag: '🇿🇦' },
  { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷' },
  { code: 'tk', name: 'Turkmen', flag: '🇹🇲' },
  { code: 'tw', name: 'Twi (Akan)', flag: '🇬🇭' },
  { code: 'uk', name: 'Ukrainian (Українська)', flag: '🇺🇦' },
  { code: 'ug', name: 'Uyghur', flag: '🇨🇳' },
  { code: 'uz', name: 'Uzbek (Oʻzbek)', flag: '🇺🇿' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳' },
  { code: 'cy', name: 'Welsh (Cymraeg)', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'yi', name: 'Yiddish', flag: '🇮🇱' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' }
];

/**
 * Splits text into chunks appropriate for translation URLs (~800 characters per chunk).
 */
function chunkTextForTranslation(text, maxLength = 800) {
  if (!text || text.length <= maxLength) return [text];

  const paragraphs = text.split('\n');
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + '\n' + para).length > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n' + para : para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Translates a single text chunk using free GTX endpoint.
 */
async function translateChunk(chunkText, targetLangCode) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(chunkText)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map(item => item[0]).join('');
  }
  
  throw new Error('Unexpected translation response format.');
}

/**
 * Translates full script text into target language with progress callbacks.
 */
export async function translateScript(text, targetLangCode, onProgress = null) {
  if (!text || !text.trim()) return '';

  const chunks = chunkTextForTranslation(text);
  const translatedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: chunks.length,
        percent: Math.round(((i + 1) / chunks.length) * 100)
      });
    }

    try {
      const translated = await translateChunk(chunk, targetLangCode);
      translatedChunks.push(translated);
    } catch (err) {
      console.warn(`Translation failed for chunk ${i + 1}, using original chunk`, err);
      translatedChunks.push(chunk);
    }

    if (chunks.length > 1 && i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return translatedChunks.join('\n\n');
}
