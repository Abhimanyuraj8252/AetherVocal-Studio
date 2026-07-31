/**
 * Free Script Translator Utility for AetherVocal Studio
 * Uses free public translation endpoint (No API Key required)
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' }
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
  // Structure of data: [[["translated_text", "original_text", ...], ...]]
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map(item => item[0]).join('');
  }
  
  throw new Error('Unexpected translation response format.');
}

/**
 * Translates full script text into target language with progress callbacks.
 * 
 * @param {string} text Full script text
 * @param {string} targetLangCode Target language code (e.g. 'hi', 'en')
 * @param {function} onProgress Progress callback ({ current, total, percent })
 * @returns {Promise<string>} Translated text
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
      translatedChunks.push(chunk); // Fallback to original text if fetch fails
    }

    // Small throttle delay between requests to prevent rate limiting
    if (chunks.length > 1 && i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return translatedChunks.join('\n\n');
}
