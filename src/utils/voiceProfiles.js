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

  const scoredCandidates = systemVoices.map((voice, index) => {
    const vName = (voice.name || '').toLowerCase();
    const vLang = (voice.lang || '').toLowerCase();
    const langMatches = targetLangGroup === 'hi'
      ? (vLang.startsWith('hi') || vName.includes('hindi'))
      : targetLangGroup === 'en'
        ? vLang.startsWith('en')
        : true;

    const isMale = vName.includes('male') || vName.includes('man') || vName.includes('hemant') || vName.includes('david') || vName.includes('guy') || vName.includes('rishi');
    const isFemale = vName.includes('female') || vName.includes('woman') || vName.includes('zira') || vName.includes('aria') || vName.includes('swara') || vName.includes('neerja') || vName.includes('priya');

    let score = 0;
    if (langMatches) score += 10;
    if (targetGenderLower === 'male' && isMale) score += 8;
    if (targetGenderLower === 'female' && isFemale) score += 8;
    if (voice.localService) score += 2;
    if (vName.includes('google') || vName.includes('natural') || vName.includes('neural')) score += 1;

    for (const matchName of profile.matchingNames || []) {
      if (vName.includes(matchName.toLowerCase())) {
        score += 12;
        break;
      }
    }

    return { voice, score, index };
  });

  const sortedCandidates = scoredCandidates
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (sortedCandidates.length > 0) {
    console.log('[AetherVocal] resolved system voice', {
      profile: profile.name,
      selectedVoice: sortedCandidates[0].voice.name,
      language: sortedCandidates[0].voice.lang,
      score: sortedCandidates[0].score
    });
    return sortedCandidates[0].voice;
  }

  const languageFallback = systemVoices.find(voice => {
    const vName = (voice.name || '').toLowerCase();
    const vLang = (voice.lang || '').toLowerCase();
    if (profile.langGroup === 'hi') return vLang.startsWith('hi') || vName.includes('hindi');
    if (profile.langGroup === 'en') return vLang.startsWith('en');
    return true;
  });

  return languageFallback || systemVoices[0];
}
