/**
 * Script Analyzer & Jargon Phonetic Expander Utility for AetherVocal Studio
 */

const ACRONYM_DICTIONARY = {
  'AI': 'ए आई',
  'A.I.': 'ए आई',
  'API': 'ए पी आई',
  'A.P.I.': 'ए पी आई',
  'PDF': 'पी डी एफ',
  'URL': 'यू आर एल',
  'HTTP': 'एच टी टी पी',
  'HTTPS': 'एच टी टी पी एस',
  'HQ': 'एच क्यू',
  'HD': 'एच डी',
  'TTS': 'टी टी एस',
  'UI': 'यू आई',
  'UX': 'यू एक्स',
  'SEO': 'एस ई ओ',
  'CEO': 'सी ई ओ',
  'CTO': 'सी टी ओ',
  'IT': 'आई टी',
  'IQ': 'आई क्यू',
  'IP': 'आई पी',
  'GPS': 'जी पी एस',
  'SIM': 'सिम',
  'CPU': 'सी पी यू',
  'GPU': 'जी पी यू',
  'RAM': 'रैम',
  'ROM': 'रोम',
  'SSD': 'एस एस डी',
  'Wi-Fi': 'वाई फ़ाई',
  'WiFi': 'वाई फ़ाई',
  'USB': 'यू एस बी',
  'SMS': 'एस एम एस',
  'OTP': 'ओ टी पी'
};

/**
 * Calculates script WPM (Words Per Minute), Estimated Reading Time, and Clarity Index.
 */
export function analyzeScriptMetrics(text, speechRate = 1.0) {
  if (!text || !text.trim()) {
    return {
      wordCount: 0,
      charCount: 0,
      estimatedWpm: 0,
      clarityScore: 100,
      pacingTag: 'Normal'
    };
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;

  // Average speaking pace: ~130 WPM at 1.0x rate
  const estimatedWpm = Math.round(130 * speechRate);
  const totalMinutes = wordCount / estimatedWpm;

  let pacingTag = 'Optimal Pace';
  if (estimatedWpm < 100) pacingTag = 'Slow & Relaxed';
  else if (estimatedWpm > 170) pacingTag = 'Fast & Energetic';

  // Clarity Index calculation based on sentence length variation
  const sentences = text.split(/[.!?।]/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  let clarityScore = 95;
  if (avgSentenceLength > 25) clarityScore -= 15;
  if (avgSentenceLength > 35) clarityScore -= 20;

  return {
    wordCount,
    charCount,
    estimatedWpm,
    totalMinutes,
    avgSentenceLength: Math.round(avgSentenceLength),
    clarityScore: Math.max(60, clarityScore),
    pacingTag
  };
}

/**
 * Detects technical acronyms and jargon in script text.
 */
export function detectJargonAcronyms(text) {
  if (!text) return [];

  const detected = [];
  Object.keys(ACRONYM_DICTIONARY).forEach(acronym => {
    const regex = new RegExp(`\\b${acronym.replace('.', '\\.')}\\b`, 'g');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      detected.push({
        acronym,
        phonetic: ACRONYM_DICTIONARY[acronym],
        count: matches.length
      });
    }
  });

  return detected;
}

/**
 * Expands all technical acronyms in text to their phonetic pronunciation (e.g. AI -> ए आई).
 */
export function expandJargonAcronyms(text) {
  if (!text) return '';

  let updatedText = text;
  Object.keys(ACRONYM_DICTIONARY).forEach(acronym => {
    const regex = new RegExp(`\\b${acronym.replace('.', '\\.')}\\b`, 'g');
    updatedText = updatedText.replace(regex, ACRONYM_DICTIONARY[acronym]);
  });

  return updatedText;
}
