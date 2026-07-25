/**
 * Voice Helper Utility
 * Filters and categorizes system voices for Hindi and English,
 * assigns estimated gender tags, quality ratings, and sample audio phrases.
 */

export const SAMPLE_TEXTS = {
  hi: {
    story: `एक समय की बात है, एक हरे-भरे गाँव में सूरज की किरणें नई उम्मीद लेकर आती थीं। सभी लोग प्रेम से एक साथ मिलकर रहते थे।`,
    tech: `नमस्ते! वॉइसवर्स एआई में आपका स्वागत है। अब आप बिना किसी सीमा के असीमित टेक्स्ट को उच्च गुणवत्ता वाले ऑडियो में बदल सकते हैं।`,
    short: `नमस्ते, यह मेरी हिंदी आवाज़ का एक नमूना है।`
  },
  en: {
    story: `Once upon a time in a tranquil valley, the morning sun rose over crystal streams, breathing life into a brand new journey.`,
    tech: `Welcome to VoiceVerse AI. Experience high quality offline text-to-speech synthesis with unlimited character support and instant audio exports.`,
    short: `Hello! This is a preview sample of my English voice.`
  }
};

const FEMALE_NAMES = [
  'swara', 'neerja', 'priya', 'ananya', 'shruti', 'pooja', 'aditi', 'kavya',
  'zira', 'catherine', 'susan', 'victoria', 'samantha', 'karen', 'fiona',
  'hazel', 'aria', 'jenny', 'sonia', 'veena', 'kalpana', 'female', 'woman',
  'google हिन्दी', 'google hindi'
];

const MALE_NAMES = [
  'hemant', 'madhur', 'rishi', 'ravi', 'amit', 'arjun', 'kabir',
  'david', 'mark', 'george', 'richard', 'james', 'alex', 'daniel',
  'male', 'man', 'guy', 'guy'
];

export function categorizeVoice(voice) {
  const lang = (voice.lang || '').toLowerCase();
  const name = (voice.name || '').toLowerCase();

  let languageGroup = 'other';
  let languageLabel = voice.lang || 'Unknown';

  if (lang.startsWith('hi') || name.includes('hindi') || name.includes('हिन्दी')) {
    languageGroup = 'hi';
    languageLabel = 'Hindi (हिंदी)';
  } else if (lang.startsWith('en')) {
    if (lang.includes('in')) languageLabel = 'English (India)';
    else if (lang.includes('us')) languageLabel = 'English (US)';
    else if (lang.includes('gb') || lang.includes('uk')) languageLabel = 'English (UK)';
    else languageLabel = 'English';
    languageGroup = 'en';
  }

  let gender = 'Neutral';
  if (FEMALE_NAMES.some(fn => name.includes(fn))) {
    gender = 'Female';
  } else if (MALE_NAMES.some(mn => name.includes(mn))) {
    gender = 'Male';
  } else if (name.includes('female') || name.includes('woman') || name.includes('girl')) {
    gender = 'Female';
  } else if (name.includes('male') || name.includes('man') || name.includes('boy')) {
    gender = 'Male';
  } else {
    // Standard browser fallback heuristics based on voice index/name hash
    gender = (voice.name.length % 2 === 0) ? 'Female' : 'Male';
  }

  // Quality score estimation (Local vs Remote, Google vs Default)
  let isHighQuality = false;
  if (name.includes('google') || name.includes('natural') || name.includes('neural') || name.includes('online') || name.includes('enhanced')) {
    isHighQuality = true;
  }

  return {
    voice,
    name: voice.name,
    lang: voice.lang,
    languageGroup,
    languageLabel,
    gender,
    isLocal: voice.localService,
    isHighQuality
  };
}

export function getFilteredVoices(voices, targetLang = 'all', targetGender = 'all') {
  if (!voices || voices.length === 0) return [];

  const categorized = voices.map(categorizeVoice);

  return categorized.filter(item => {
    // Language filter
    if (targetLang !== 'all') {
      if (targetLang === 'hi' && item.languageGroup !== 'hi') return false;
      if (targetLang === 'en' && item.languageGroup !== 'en') return false;
    }

    // Gender filter
    if (targetGender !== 'all') {
      if (targetGender.toLowerCase() !== item.gender.toLowerCase()) return false;
    }

    return true;
  });
}
