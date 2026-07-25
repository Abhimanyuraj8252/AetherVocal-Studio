/**
 * Voice Profiles & Multi-Voice Engine v3
 * Defines curated Hindi & English Male & Female voice profiles
 * with automatic pitch, rate, and gender formant bindings.
 */

export const PREMIUM_VOICE_PROFILES = [
  // 🇮🇳 HINDI FEMALE VOICES
  {
    id: 'hi_female_swara',
    name: 'Hindi Female — Swara (Storyteller)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Female',
    avatar: '👩‍💼',
    voiceRole: 'story',
    style: 'Warm & Expressive Storyteller',
    sampleText: 'नमस्ते! मैं स्वरा हूँ। मेरी आवाज़ हिंदी कहानियों, ऑडियोबुक और भावनात्मक narration के लिए बहुत सहज है।',
    matchingNames: ['swara', 'google हिन्दी', 'google hindi', 'kalpana', 'veena', 'female', 'story', 'narrator'],
    defaultPitch: 1.1,
    defaultRate: 0.95
  },
  {
    id: 'hi_female_neerja',
    name: 'Hindi Female — Neerja (News Anchor)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Female',
    avatar: '👩‍💻',
    voiceRole: 'news',
    style: 'Professional & Clear News Anchor',
    sampleText: 'मुख्य समाचारों में आपका स्वागत है। आज की प्रमुख खबरें और ताजा अपडेट्स स्पष्ट, भरोसेमंद और पेशेवर अंदाज़ में सुनिए।',
    matchingNames: ['neerja', 'shruti', 'pooja', 'kavya', 'female', 'news', 'anchor', 'reporter'],
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'hi_female_priya',
    name: 'Hindi Female — Priya (Tech Host)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Female',
    avatar: '👩‍🏫',
    voiceRole: 'tech',
    style: 'Calm, Soft & Educational',
    sampleText: 'नमस्ते! मैं प्रिया हूँ। मैं टेक explainers, tutorials, product walkthroughs और educational content के लिए उपयुक्त हूँ।',
    matchingNames: ['priya', 'ananya', 'aditi', 'female', 'tech', 'tutorial', 'guide'],
    defaultPitch: 1.2,
    defaultRate: 0.9
  },

  // 🇮🇳 HINDI MALE VOICES
  {
    id: 'hi_male_hemant',
    name: 'Hindi Male — Hemant (Storyteller)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Male',
    avatar: '👨‍💼',
    voiceRole: 'story',
    style: 'Deep, Rich & Commandive Narrator',
    sampleText: 'नमस्कार! मैं हेमंत हूँ। मेरी गहरी, स्पष्ट और प्रभावशाली आवाज़ हिंदी कहानियों, ऑडियोबुक और documentary narration के लिए उपयुक्त है।',
    matchingNames: ['hemant', 'rishi', 'arjun', 'kabir', 'male', 'guy', 'man', 'story', 'narrator'],
    defaultPitch: 0.82,
    defaultRate: 0.95
  },
  {
    id: 'hi_male_madhur',
    name: 'Hindi Male — Madhur (News Anchor)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Male',
    avatar: '👨‍🎤',
    voiceRole: 'news',
    style: 'Energetic & Modern News Presenter',
    sampleText: 'नमस्कार! मैं मधुर हूँ। आज की प्रमुख खबरें, ताज़ा अपडेट्स और important headlines अब सुनिए साफ़, तेज़ और भरोसेमंद अंदाज़ में।',
    matchingNames: ['madhur', 'amit', 'ravi', 'male', 'guy', 'news', 'anchor', 'reporter'],
    defaultPitch: 0.88,
    defaultRate: 1.05
  },
  {
    id: 'hi_male_kabir',
    name: 'Hindi Male — Kabir (Tech Host)',
    langGroup: 'hi',
    langLabel: 'Hindi (हिंदी)',
    gender: 'Male',
    avatar: '👨‍🎨',
    voiceRole: 'tech',
    style: 'Poetic & Cinematic Voice',
    sampleText: 'आज हम एक आधुनिक टेक topic को आसान हिंदी में समझेंगे, step by step, ताकि हर listener को clear and practical explanation मिले।',
    matchingNames: ['kabir', 'arjun', 'rishi', 'male', 'tech', 'tutorial', 'guide'],
    defaultPitch: 0.85,
    defaultRate: 0.9
  },

  // 🇬🇧 ENGLISH FEMALE VOICES
  {
    id: 'en_female_aria',
    name: 'English Female — Aria (Storyteller)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Female',
    avatar: '🎙️',
    voiceRole: 'story',
    style: 'Smooth, Natural & Friendly Studio Voice',
    sampleText: 'Hello there! I am Aria. I deliver warm storytelling for audiobooks, podcasts, and immersive scripts.',
    matchingNames: ['aria', 'zira', 'catherine', 'susan', 'samantha', 'jenny', 'female', 'story', 'narrator'],
    defaultPitch: 1.1,
    defaultRate: 1.0
  },
  {
    id: 'en_female_zira',
    name: 'English Female — Zira (News Anchor)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Female',
    avatar: '💼',
    voiceRole: 'news',
    style: 'Articulate & Crisp Presentation Voice',
    sampleText: 'Welcome to our news update. Here are today’s headlines, delivered with clarity, pace, and authority.',
    matchingNames: ['zira', 'victoria', 'karen', 'fiona', 'hazel', 'female', 'news', 'anchor', 'reporter'],
    defaultPitch: 1.15,
    defaultRate: 1.05
  },
  {
    id: 'en_female_sonia',
    name: 'English Female — Sonia (Tech Host)',
    langGroup: 'en',
    langLabel: 'English (India)',
    gender: 'Female',
    avatar: '🇮🇳',
    voiceRole: 'tech',
    style: 'Warm Indian Accent Accentuated Speech',
    sampleText: 'Hello! I am Sonia. I provide clear Indian-accented English speech for tutorials, product walkthroughs, and explainers.',
    matchingNames: ['sonia', 'veena', 'heera', 'female', 'tech', 'tutorial', 'guide'],
    defaultPitch: 1.1,
    defaultRate: 0.95
  },

  // 🇬🇧 ENGLISH MALE VOICES
  {
    id: 'en_male_guy',
    name: 'English Male — Guy (Storyteller)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Male',
    avatar: '📻',
    voiceRole: 'story',
    style: 'Deep, Resonant & Authority Voice',
    sampleText: 'In a world of constant evolution, this narrator delivers cinematic storytelling with depth and presence.',
    matchingNames: ['guy', 'david', 'mark', 'george', 'richard', 'alex', 'male', 'man', 'story', 'narrator'],
    defaultPitch: 0.8,
    defaultRate: 0.95
  },
  {
    id: 'en_male_david',
    name: 'English Male — David (News Anchor)',
    langGroup: 'en',
    langLabel: 'English (US)',
    gender: 'Male',
    avatar: '💻',
    voiceRole: 'news',
    style: 'Clean, Modern & Confident Voice',
    sampleText: 'Welcome to the news desk. Today’s headlines are presented clearly, professionally, and with confident pacing.',
    matchingNames: ['david', 'james', 'daniel', 'male', 'man', 'news', 'anchor', 'reporter'],
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'en_male_rishi',
    name: 'English Male — Rishi (Tech Host)',
    langGroup: 'en',
    langLabel: 'English (India)',
    gender: 'Male',
    avatar: '👨‍💼',
    voiceRole: 'tech',
    style: 'Professional Indian English Voice',
    sampleText: 'Good day! I am Rishi. I’m tailored for technical tutorials, product walkthroughs, and practical English content.',
    matchingNames: ['rishi', 'prabhat', 'male', 'man', 'tech', 'tutorial', 'guide'],
    defaultPitch: 0.82,
    defaultRate: 0.95
  }
];

export function findMatchingSystemVoice(systemVoices, profile) {
  if (!systemVoices || systemVoices.length === 0) return null;

  const targetGenderLower = (profile.gender || '').toLowerCase();
  const targetLangGroup = profile.langGroup;
  const profileOrder = {
    hi_female_swara: 0,
    hi_female_neerja: 1,
    hi_female_priya: 2,
    hi_male_hemant: 0,
    hi_male_madhur: 1,
    hi_male_kabir: 2,
    en_female_aria: 0,
    en_female_zira: 1,
    en_female_sonia: 2,
    en_male_guy: 0,
    en_male_david: 1,
    en_male_rishi: 2
  };

  const exactLanguageTags = targetLangGroup === 'hi'
    ? ['hi', 'hi-in', 'hindi']
    : targetLangGroup === 'en'
      ? ['en', 'en-us', 'en-gb', 'en-in']
      : [];

  const scoredCandidates = systemVoices.map((voice, index) => {
    const vName = (voice.name || '').toLowerCase();
    const vLang = (voice.lang || '').toLowerCase();
    const langMatches = exactLanguageTags.length === 0
      ? true
      : exactLanguageTags.some(tag => vLang.startsWith(tag) || vName.includes(tag) || (tag === 'hindi' && vName.includes('hindi')));

    const isMale = vName.includes('male') || vName.includes('man') || vName.includes('hemant') || vName.includes('david') || vName.includes('guy') || vName.includes('rishi');
    const isFemale = vName.includes('female') || vName.includes('woman') || vName.includes('zira') || vName.includes('aria') || vName.includes('swara') || vName.includes('neerja') || vName.includes('priya');

    let score = 0;
    if (langMatches) score += 12;
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

  const languageCandidates = systemVoices.filter(voice => {
    const vName = (voice.name || '').toLowerCase();
    const vLang = (voice.lang || '').toLowerCase();
    if (profile.langGroup === 'hi') return vLang.startsWith('hi') || vName.includes('hindi');
    if (profile.langGroup === 'en') return vLang.startsWith('en');
    return true;
  });

  if (languageCandidates.length > 0) {
    const preferredIndex = profileOrder[profile.id] ?? 0;
    const fallbackVoice = languageCandidates[preferredIndex % languageCandidates.length];
    console.log('[AetherVocal] fallback system voice', {
      profile: profile.name,
      selectedVoice: fallbackVoice?.name,
      language: fallbackVoice?.lang,
      bucketIndex: preferredIndex,
      candidateCount: languageCandidates.length
    });
    return fallbackVoice;
  }

  return systemVoices[0];
}
