/**
 * Voice Profiles & Multi-Voice Engine v3
 * Defines curated Hindi & English Male & Female voice profiles
 * with automatic pitch, rate, and gender formant bindings.
 */

export const PREMIUM_VOICE_PROFILES = [
  // 🇮🇳 HINDI FEMALE VOICES
  {
    id: 'hi_female_swara',
    name: 'Hindi Female — Swara (कहानीकार)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Female',
    avatar: '👩‍💼',
    style: 'Warm & Expressive Storyteller',
    sampleText: 'नमस्ते! मैं स्वरा हूँ। मेरी आवाज़ कहानियों और पॉडकास्ट के लिए बहुत सुरीली और सहज है।',
    matchingNames: ['swara', 'google हिन्दी', 'google hindi', 'kalpana', 'veena', 'female'],
    defaultPitch: 1.1,
    defaultRate: 0.95
  },
  {
    id: 'hi_female_neerja',
    name: 'Hindi Female — Neerja (समाचार वाचक)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Female',
    avatar: '👩‍💻',
    style: 'Professional & Clear News Anchor',
    sampleText: 'मुख्य समाचारों में आपका स्वागत है। आज की प्रमुख खबरें और ताजा अपडेट्स ध्यान से सुनें।',
    matchingNames: ['neerja', 'shruti', 'pooja', 'kavya', 'female'],
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'hi_female_priya',
    name: 'Hindi Female — Priya (मधुर & शांत)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Female',
    avatar: '👩‍🏫',
    style: 'Calm, Soft & Educational',
    sampleText: 'नमस्ते! मैं प्रिया हूँ। मैं शिक्षात्मक वीडियो और ट्यूटोरियल के लिए सबसे बेहतरीन हूँ।',
    matchingNames: ['priya', 'ananya', 'aditi', 'female'],
    defaultPitch: 1.2,
    defaultRate: 0.9
  },

  // 🇮🇳 HINDI MALE VOICES
  {
    id: 'hi_male_hemant',
    name: 'Hindi Male — Hemant (गंभीर सूत्रधार)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Male',
    avatar: '👨‍💼',
    style: 'Deep, Rich & Commandive Narrator',
    sampleText: 'नमस्कार! मैं हेमंत हूँ। मेरी गंभीर और प्रभावशाली आवाज़ डॉक्यूमेन्ट्री और किताबों के लिए बेस्ट है।',
    matchingNames: ['hemant', 'rishi', 'arjun', 'kabir', 'male', 'guy', 'man'],
    defaultPitch: 0.82,
    defaultRate: 0.95
  },
  {
    id: 'hi_male_madhur',
    name: 'Hindi Male — Madhur (ऊर्जावान)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Male',
    avatar: '👨‍🎤',
    style: 'Energetic & Modern Tech Host',
    sampleText: 'हेलो दोस्तों! मैं मधुर हूँ। आज हम टेक और नए गैजेट्स के बारे में विस्तार से जानेंगे।',
    matchingNames: ['madhur', 'amit', 'ravi', 'male', 'guy'],
    defaultPitch: 0.88,
    defaultRate: 1.05
  },
  {
    id: 'hi_male_kabir',
    name: 'Hindi Male — Kabir (साहित्यिक)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Male',
    avatar: '👨‍🎨',
    style: 'Poetic & Cinematic Voice',
    sampleText: 'जिंदगी एक खूबसूरत सफर है, जहाँ हर मोड़ पर एक नई कहानी इंतज़ार करती है।',
    matchingNames: ['kabir', 'arjun', 'rishi', 'male'],
    defaultPitch: 0.85,
    defaultRate: 0.9
  },

  // 🇬🇧 ENGLISH FEMALE VOICES
  {
    id: 'en_female_aria',
    name: 'English Female — Aria (Natural Studio)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Female',
    avatar: '🎙️',
    style: 'Smooth, Natural & Friendly Studio Voice',
    sampleText: 'Hello there! I am Aria. I deliver crystal clear speech for podcasts, audiobooks, and courses.',
    matchingNames: ['aria', 'zira', 'catherine', 'susan', 'samantha', 'jenny', 'female'],
    defaultPitch: 1.1,
    defaultRate: 1.0
  },
  {
    id: 'en_female_zira',
    name: 'English Female — Zira (Executive)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Female',
    avatar: '💼',
    style: 'Articulate & Crisp Presentation Voice',
    sampleText: 'Welcome to our product presentation. Let us explore the groundbreaking features built for you.',
    matchingNames: ['zira', 'victoria', 'karen', 'fiona', 'hazel', 'female'],
    defaultPitch: 1.15,
    defaultRate: 1.05
  },
  {
    id: 'en_female_sonia',
    name: 'English Female — Sonia (Indian Accent)',
    langGroup: 'en',
    langLabel: 'English (India)',
    gender: 'Female',
    avatar: '🇮🇳',
    style: 'Warm Indian Accent Accentuated Speech',
    sampleText: 'Hello! I am Sonia. I provide clear Indian-accented English speech for tutorials and explanations.',
    matchingNames: ['sonia', 'veena', 'heera', 'female'],
    defaultPitch: 1.1,
    defaultRate: 0.95
  },

  // 🇬🇧 ENGLISH MALE VOICES
  {
    id: 'en_male_guy',
    name: 'English Male — Guy (Deep Cinematic)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Male',
    avatar: '📻',
    style: 'Deep, Resonant & Authority Voice',
    sampleText: 'In a world of constant evolution, technology bridges the gap between imagination and reality.',
    matchingNames: ['guy', 'david', 'mark', 'george', 'richard', 'alex', 'male', 'man'],
    defaultPitch: 0.8,
    defaultRate: 0.95
  },
  {
    id: 'en_male_david',
    name: 'English Male — David (Tech Narrator)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Male',
    avatar: '💻',
    style: 'Clean, Modern & Confident Voice',
    sampleText: 'Welcome to the future of offline text-to-speech synthesis with zero character limits.',
    matchingNames: ['david', 'james', 'daniel', 'male', 'man'],
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'en_male_rishi',
    name: 'English Male — Rishi (Indian Accent)',
    langGroup: 'en',
    langLabel: 'English (India)',
    gender: 'Male',
    avatar: '👨‍💼',
    style: 'Professional Indian English Voice',
    sampleText: 'Good day! I am Rishi. I am tailored for delivering technical tutorials and Indian English content.',
    matchingNames: ['rishi', 'prabhat', 'male', 'man'],
    defaultPitch: 0.82,
    defaultRate: 0.95
  }
];

export function findMatchingSystemVoice(systemVoices, profile) {
  if (!systemVoices || systemVoices.length === 0) return null;

  const targetGenderLower = (profile.gender || '').toLowerCase();
  const targetLangGroup = profile.langGroup;

  // 1. First priority: match exact profile keywords AND gender
  for (const matchName of profile.matchingNames) {
    const found = systemVoices.find(v => {
      const vName = (v.name || '').toLowerCase();
      const vLang = (v.lang || '').toLowerCase();
      const langMatches = targetLangGroup === 'hi' ? (vLang.startsWith('hi') || vName.includes('hindi')) : vLang.startsWith('en');
      return langMatches && vName.includes(matchName);
    });
    if (found) return found;
  }

  // 2. Gender specific fallback search in system voices
  const genderMatch = systemVoices.find(v => {
    const vName = (v.name || '').toLowerCase();
    const vLang = (v.lang || '').toLowerCase();
    const langMatches = targetLangGroup === 'hi' ? (vLang.startsWith('hi') || vName.includes('hindi')) : vLang.startsWith('en');
    const isMale = vName.includes('male') || vName.includes('man') || vName.includes('hemant') || vName.includes('david') || vName.includes('guy');
    const isFemale = vName.includes('female') || vName.includes('woman') || vName.includes('zira') || vName.includes('aria') || vName.includes('swara');

    if (targetGenderLower === 'male') return langMatches && isMale;
    if (targetGenderLower === 'female') return langMatches && isFemale;
    return langMatches;
  });

  if (genderMatch) return genderMatch;

  // 3. Language group match fallback
  const langMatch = systemVoices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    if (profile.langGroup === 'hi') return lang.startsWith('hi') || (v.name || '').toLowerCase().includes('hindi');
    if (profile.langGroup === 'en') return lang.startsWith('en');
    return false;
  });

  return langMatch || systemVoices[0];
}
