/**
 * Free Script Translator Utility for AetherVocal Studio
 * Uses free public translation endpoint (No API Key required)
 * Supports 50+ Global Languages with Search Filtering
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
  { code: 'ne', name: 'Nepali (नेपाली)', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala (සිංහල)', flag: '🇱🇰' },

  // International Languages
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese Simplified (简体中文)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese Traditional (繁體中文)', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch (Nederlands)', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)', flag: '🇮🇩' },
  { code: 'th', name: 'Thai (ไทย)', flag: '🇹🇭' },
  { code: 'tl', name: 'Filipino (Tagalog)', flag: '🇵🇭' },
  { code: 'pl', name: 'Polish (Polski)', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian (Українська)', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech (Čeština)', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian (Română)', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian (Magyar)', flag: '🇭🇺' },
  { code: 'el', name: 'Greek (Ελληνικά)', flag: '🇬🇷' },
  { code: 'sv', name: 'Swedish (Svenska)', flag: '🇸🇪' },
  { code: 'da', name: 'Danish (Dansk)', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish (Suomi)', flag: '🇫🇮' },
  { code: 'no', name: 'Norwegian (Norsk)', flag: '🇳🇴' },
  { code: 'he', name: 'Hebrew (עברית)', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian (فارسی)', flag: '🇮🇷' },
  { code: 'sw', name: 'Swahili (Kiswahili)', flag: '🇰🇪' },
  { code: 'am', name: 'Amharic (አማርኛ)', flag: '🇪🇹' },
  { code: 'my', name: 'Burmese (မြန်မာစာ)', flag: '🇲🇲' },
  { code: 'km', name: 'Khmer (ភាសាខ្មែរ)', flag: '🇰🇭' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)', flag: '🇲🇾' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian (Shqip)', flag: '🇦🇱' },
  { code: 'hr', name: 'Croatian (Hrvatski)', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak (Slovenčina)', flag: '🇸🇰' },
  { code: 'sr', name: 'Serbian (Српски)', flag: '🇷🇸' }
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
