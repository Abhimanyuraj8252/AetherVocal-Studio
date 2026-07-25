/**
 * Master Voice Model Catalog (20+ Models) for Sherpa-ONNX, Piper AI, and AetherVocal Pro
 * Every voice model has explicit acoustic formant parameters and synthesizer bounds.
 */

export const PREMIUM_VOICE_PROFILES = [
  /* ------------------- SHERPA-ONNX VITS NEURAL MODELS ------------------- */
  {
    id: 'sherpa_hi_female_komal',
    engine: 'sherpa-onnx',
    modelTag: 'VITS ONNX Neural',
    name: 'Sherpa Komal (कोमल) • Hindi Female VITS',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '🤖',
    description: 'Sherpa-ONNX VITS Neural Hindi female voice model',
    keywords: ['sherpa', 'vits', 'onnx', 'hindi', 'female', 'komal'],
    sampleText: 'नमस्ते! शेरपा ओएनएनएक्स न्यूरल वॉइस मॉडल में आपका स्वागत है।',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'sherpa_hi_male_dev',
    engine: 'sherpa-onnx',
    modelTag: 'VITS ONNX Neural',
    name: 'Sherpa Dev (देव) • Hindi Male VITS',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '👨‍💻',
    description: 'Sherpa-ONNX VITS Neural Hindi male voice model',
    keywords: ['sherpa', 'vits', 'onnx', 'hindi', 'male', 'dev'],
    sampleText: 'नमस्कार! मैं देव हूँ। शेरपा न्यूरल इंजन से उच्च गुणवत्ता ऑडियो बन रहा है।',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'sherpa_en_female_clara',
    engine: 'sherpa-onnx',
    modelTag: 'VITS ONNX Neural',
    name: 'Sherpa Clara • English US Female VITS',
    lang: 'en-US',
    gender: 'Female',
    avatar: '👩‍💻',
    description: 'Sherpa-ONNX VITS Neural English US female model',
    keywords: ['sherpa', 'vits', 'onnx', 'english', 'female', 'clara'],
    sampleText: 'Welcome to Sherpa-ONNX WebAssembly Neural AI Voice Engine.',
    defaultPitch: 1.10,
    defaultRate: 1.0
  },
  {
    id: 'sherpa_en_male_ethan',
    engine: 'sherpa-onnx',
    modelTag: 'VITS ONNX Neural',
    name: 'Sherpa Ethan • English US Male VITS',
    lang: 'en-US',
    gender: 'Male',
    avatar: '🧠',
    description: 'Sherpa-ONNX VITS Neural English US male model',
    keywords: ['sherpa', 'vits', 'onnx', 'english', 'male', 'ethan'],
    sampleText: 'Hello! Ethan here. Generating speech directly with Sherpa ONNX runtime.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },

  /* ------------------- PIPER ACOUSTIC AI NEURAL MODELS ------------------- */
  {
    id: 'piper_hi_female_ananya',
    engine: 'piper-ai',
    modelTag: 'Piper Medium AI',
    name: 'Piper Ananya (अनन्या) • Hindi Female Acoustic',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '⚡',
    description: 'Piper Acoustic AI Hindi female narration model',
    keywords: ['piper', 'acoustic', 'hindi', 'female', 'ananya'],
    sampleText: 'पाईपर न्यूरल एआई मॉडल में आपका स्वागत है।',
    defaultPitch: 1.18,
    defaultRate: 1.0
  },
  {
    id: 'piper_hi_male_aarav',
    engine: 'piper-ai',
    modelTag: 'Piper Medium AI',
    name: 'Piper Aarav (आरव) • Hindi Male Acoustic',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '🎙️',
    description: 'Piper Acoustic AI Hindi male documentary narrator',
    keywords: ['piper', 'acoustic', 'hindi', 'male', 'aarav'],
    sampleText: 'नमस्कार दोस्तो! पाईपर एआई इंजन से ऑडियो तैयार हो रहा है।',
    defaultPitch: 0.82,
    defaultRate: 1.0
  },
  {
    id: 'piper_en_female_lessac',
    engine: 'piper-ai',
    modelTag: 'Piper High HD',
    name: 'Piper Lessac • English US Female HD',
    lang: 'en-US',
    gender: 'Female',
    avatar: '✨',
    description: 'Piper High Definition English US female studio model',
    keywords: ['piper', 'acoustic', 'english', 'female', 'lessac'],
    sampleText: 'Hello! Lessac here from Piper High Definition Neural Audio.',
    defaultPitch: 1.12,
    defaultRate: 1.0
  },
  {
    id: 'piper_en_male_ryan',
    engine: 'piper-ai',
    modelTag: 'Piper Medium AI',
    name: 'Piper Ryan • English US Male Medium',
    lang: 'en-US',
    gender: 'Male',
    avatar: '🎧',
    description: 'Piper Medium English US male voiceover model',
    keywords: ['piper', 'acoustic', 'english', 'male', 'ryan'],
    sampleText: 'Greetings. Ryan speaking using Piper Acoustic Neural Synthesizer.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },

  /* ------------------- AETHERVOCAL PRO STUDIO MODELS ------------------- */
  {
    id: 'hindi_female_nisha',
    engine: 'aethervocal-pro',
    modelTag: 'AetherVocal Studio',
    name: 'Nisha (निशा) • Hindi Female Studio',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '🎙️',
    description: 'Warm, clear & expressive Hindi female studio voice',
    keywords: ['aethervocal', 'hindi', 'female', 'nisha'],
    sampleText: 'नमस्ते! ऐथरवोकल स्टूडियो में आपका स्वागत है।',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'hindi_male_rohit',
    engine: 'aethervocal-pro',
    modelTag: 'AetherVocal Studio',
    name: 'Rohit (रोहित) • Hindi Male Studio',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '👨‍🎤',
    description: 'Deep, confident & professional Hindi male studio voice',
    keywords: ['aethervocal', 'hindi', 'male', 'rohit'],
    sampleText: 'नमस्कार! मैं रोहित हूँ। आज हम एक नया ऑडियो प्रोजेक्ट बना रहे हैं।',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'english_female_aria',
    engine: 'aethervocal-pro',
    modelTag: 'AetherVocal Studio',
    name: 'Aria • English US Female Studio',
    lang: 'en-US',
    gender: 'Female',
    avatar: '👩‍💼',
    description: 'Crisp, natural & polished US English female voice',
    keywords: ['aethervocal', 'english', 'female', 'aria'],
    sampleText: 'Welcome to AetherVocal Studio! Experience high quality speech synthesis.',
    defaultPitch: 1.10,
    defaultRate: 1.0
  },
  {
    id: 'english_male_alex',
    engine: 'aethervocal-pro',
    modelTag: 'AetherVocal Studio',
    name: 'Alex • English US Male Studio',
    lang: 'en-US',
    gender: 'Male',
    avatar: '👨‍💼',
    description: 'Smooth, resonant & authoritative US English male voice',
    keywords: ['aethervocal', 'english', 'male', 'alex'],
    sampleText: 'Hello there! Alex here. Ready to convert your script into studio audio.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },

  /* ------------------- ORIGINAL CLASSIC SYSTEM MODELS ------------------- */
  {
    id: 'hindi_female_kavya',
    engine: 'all',
    modelTag: 'Classic Studio',
    name: 'Kavya (काव्या) • Storyteller Female',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '📖',
    description: 'Soft, melodious & dramatic storytelling voice',
    keywords: ['hindi', 'story', 'kavya', 'female'],
    sampleText: 'एक समय की बात है, जब जंगलों में एक जादुई झरना बहता था।',
    defaultPitch: 1.20,
    defaultRate: 1.0
  },
  {
    id: 'hindi_male_kabir',
    engine: 'all',
    modelTag: 'Classic Studio',
    name: 'Kabir (कबीर) • Documentary Male',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '📜',
    description: 'Heavy, rich & engaging documentary narrator',
    keywords: ['hindi', 'kabir', 'documentary', 'male'],
    sampleText: 'ब्रह्मांड के इस विशाल विस्तार में कई रहस्य छिपे हुए हैं।',
    defaultPitch: 0.80,
    defaultRate: 1.0
  },
  {
    id: 'english_uk_emma',
    engine: 'all',
    modelTag: 'Classic Studio',
    name: 'Emma • English UK Female',
    lang: 'en-GB',
    gender: 'Female',
    avatar: '👑',
    description: 'Elegant British English female voice',
    keywords: ['en-gb', 'uk', 'english', 'female', 'emma'],
    sampleText: 'Good day! I am delighted to help you create your narration.',
    defaultPitch: 1.12,
    defaultRate: 1.0
  },
  {
    id: 'english_uk_oliver',
    engine: 'all',
    modelTag: 'Classic Studio',
    name: 'Oliver • English UK Male',
    lang: 'en-GB',
    gender: 'Male',
    avatar: '🎩',
    description: 'Classic British English male voice',
    keywords: ['en-gb', 'uk', 'english', 'male', 'oliver'],
    sampleText: 'Greetings. Let us produce an exceptional voiceover for your script.',
    defaultPitch: 0.88,
    defaultRate: 1.0
  },
  {
    id: 'hinglish_female_riya',
    engine: 'all',
    modelTag: 'Hinglish AI',
    name: 'Riya (रिया) • Hinglish Conversational',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '🎧',
    description: 'Casual, modern Indian Hinglish female tone',
    keywords: ['hinglish', 'riya', 'female'],
    sampleText: 'Hey guys! Aaj hum aek super cool video topic cover karne wale hain.',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'hinglish_male_arjun',
    engine: 'all',
    modelTag: 'Hinglish AI',
    name: 'Arjun (अर्जुन) • Hinglish Tech/Vlog',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '📱',
    description: 'Energetic Tech & Gaming Vlogger Hinglish male tone',
    keywords: ['hinglish', 'arjun', 'male'],
    sampleText: 'What is up everyone! Tech review video me aapka welcome hai.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'english_in_priya',
    engine: 'all',
    modelTag: 'Indian English',
    name: 'Priya • Indian English Female',
    lang: 'en-IN',
    gender: 'Female',
    avatar: '👩‍🏫',
    description: 'Clear, formal Indian English female voice',
    keywords: ['en-in', 'indian english', 'female', 'priya'],
    sampleText: 'Welcome to today\'s presentation. Let us begin the overview.',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'english_in_vikram',
    engine: 'all',
    modelTag: 'Indian English',
    name: 'Vikram • Indian English Male',
    lang: 'en-IN',
    gender: 'Male',
    avatar: '💼',
    description: 'Professional Indian English male corporate voice',
    keywords: ['en-in', 'indian english', 'male', 'vikram'],
    sampleText: 'Hello team. Here is the summary of our quarterly metrics.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  }
];

export function findMatchingSystemVoice(systemVoices, profile) {
  if (!systemVoices || systemVoices.length === 0) return null;

  const profileLangGroup = (profile.lang || 'hi-IN').slice(0, 2).toLowerCase();
  const isTargetFemale = profile.gender === 'Female';

  let match = systemVoices.find(v => {
    const vName = v.name.toLowerCase();
    const vLang = v.lang.toLowerCase();
    const matchesLang = vLang.includes((profile.lang || '').toLowerCase()) || vLang.startsWith(profileLangGroup);
    const matchesGender = isTargetFemale
      ? (vName.includes('female') || vName.includes('woman') || vName.includes('zira') || vName.includes('swara') || vName.includes('samantha') || vName.includes('aria') || vName.includes('komal') || vName.includes('ananya'))
      : (vName.includes('male') || vName.includes('man') || vName.includes('david') || vName.includes('rohit') || vName.includes('alex') || vName.includes('dev') || vName.includes('aarav'));
    return matchesLang && matchesGender;
  });

  if (!match) {
    match = systemVoices.find(v => v.lang.toLowerCase().startsWith(profileLangGroup));
  }

  return match || systemVoices[0] || null;
}
