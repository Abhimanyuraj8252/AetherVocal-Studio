/**
 * Curated Premium Voice Profiles for Hindi & English TTS Synthesis
 * Default speaking rate is strictly set to 1.0 (1x speed).
 */

export const PREMIUM_VOICE_PROFILES = [
  {
    id: 'hindi_female_nisha',
    name: 'Nisha (निशा) • Hindi Female',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '🎙️',
    description: 'Warm, clear & expressive Hindi female voice',
    voiceRole: 'news',
    keywords: ['hi-in', 'hindi', 'female', 'nisha', 'google हिन्दी', 'swara', 'kalpana'],
    sampleText: 'नमस्ते! ऐथरवोकल स्टूडियो में आपका स्वागत है।',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'hindi_male_rohit',
    name: 'Rohit (रोहित) • Hindi Male',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '👨‍🎤',
    description: 'Deep, confident & professional Hindi male voice',
    voiceRole: 'news',
    keywords: ['hi-in', 'hindi', 'male', 'rohit', 'google हिन्दी', 'hemant', 'madhav'],
    sampleText: 'नमस्कार! मैं रोहित हूँ। आज हम एक नया ऑडियो प्रोजेक्ट बना रहे हैं।',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'english_female_aria',
    name: 'Aria • English US Female',
    lang: 'en-US',
    gender: 'Female',
    avatar: '👩‍💼',
    description: 'Crisp, natural & polished US English female voice',
    voiceRole: 'story',
    keywords: ['en-us', 'english', 'female', 'aria', 'zira', 'samantha', 'jenny'],
    sampleText: 'Welcome to AetherVocal Studio! Experience high quality speech synthesis.',
    defaultPitch: 1.10,
    defaultRate: 1.0
  },
  {
    id: 'english_male_alex',
    name: 'Alex • English US Male',
    lang: 'en-US',
    gender: 'Male',
    avatar: '👨‍💼',
    description: 'Smooth, resonant & authoritative US English male voice',
    voiceRole: 'tech',
    keywords: ['en-us', 'english', 'male', 'alex', 'david', 'guy', 'natural male'],
    sampleText: 'Hello there! Alex here. Ready to convert your script into studio audio.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'hindi_female_kavya',
    name: 'Kavya (काव्या) • Storyteller Female',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '📖',
    description: 'Soft, melodious & dramatic storytelling voice',
    voiceRole: 'story',
    keywords: ['hi-in', 'hindi', 'story', 'kavya', 'female'],
    sampleText: 'एक समय की बात है, जब जंगलों में एक जादुई झरना बहता था।',
    defaultPitch: 1.20,
    defaultRate: 1.0
  },
  {
    id: 'hindi_male_kabir',
    name: 'Kabir (कबीर) • Documentary Male',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '🎙️',
    description: 'Heavy, rich & engaging documentary narrator',
    voiceRole: 'story',
    keywords: ['hi-in', 'hindi', 'kabir', 'documentary', 'male'],
    sampleText: 'ब्रह्मांड के इस विशाल विस्तार में कई रहस्य छिपे हुए हैं।',
    defaultPitch: 0.80,
    defaultRate: 1.0
  },
  {
    id: 'english_uk_emma',
    name: 'Emma • English UK Female',
    lang: 'en-GB',
    gender: 'Female',
    avatar: '👑',
    description: 'Elegant British English female voice',
    voiceRole: 'news',
    keywords: ['en-gb', 'uk', 'english', 'female', 'emma', 'hazel', 'sonia'],
    sampleText: 'Good day! I am delighted to help you create your narration.',
    defaultPitch: 1.12,
    defaultRate: 1.0
  },
  {
    id: 'english_uk_oliver',
    name: 'Oliver • English UK Male',
    lang: 'en-GB',
    gender: 'Male',
    avatar: '🎩',
    description: 'Classic British English male voice',
    voiceRole: 'story',
    keywords: ['en-gb', 'uk', 'english', 'male', 'oliver', 'george', 'ryan'],
    sampleText: 'Greetings. Let us produce an exceptional voiceover for your script.',
    defaultPitch: 0.88,
    defaultRate: 1.0
  },
  {
    id: 'hinglish_female_riya',
    name: 'Riya (रिया) • Hinglish Conversational',
    lang: 'hi-IN',
    gender: 'Female',
    avatar: '🎧',
    description: 'Casual, modern Indian Hinglish female tone',
    voiceRole: 'conversational',
    keywords: ['hi-in', 'en-in', 'hinglish', 'riya', 'female'],
    sampleText: 'Hey guys! Aaj hum aek super cool video topic cover karne wale hain.',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'hinglish_male_arjun',
    name: 'Arjun (अर्जुन) • Hinglish Tech/Vlog',
    lang: 'hi-IN',
    gender: 'Male',
    avatar: '📱',
    description: 'Energetic Tech & Gaming Vlogger Hinglish male tone',
    voiceRole: 'tech',
    keywords: ['hi-in', 'en-in', 'hinglish', 'arjun', 'male'],
    sampleText: 'What is up everyone! Tech review video me aapka welcome hai.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  },
  {
    id: 'english_in_priya',
    name: 'Priya • Indian English Female',
    lang: 'en-IN',
    gender: 'Female',
    avatar: '👩‍🏫',
    description: 'Clear, formal Indian English female voice',
    voiceRole: 'news',
    keywords: ['en-in', 'indian english', 'female', 'priya', 'neerja'],
    sampleText: 'Welcome to today\'s presentation. Let us begin the overview.',
    defaultPitch: 1.15,
    defaultRate: 1.0
  },
  {
    id: 'english_in_vikram',
    name: 'Vikram • Indian English Male',
    lang: 'en-IN',
    gender: 'Male',
    avatar: '💼',
    description: 'Professional Indian English male corporate voice',
    voiceRole: 'news',
    keywords: ['en-in', 'indian english', 'male', 'vikram', 'prabhat'],
    sampleText: 'Hello team. Here is the summary of our quarterly metrics.',
    defaultPitch: 0.85,
    defaultRate: 1.0
  }
];

const STORY_KEYWORDS = ['story', 'storyteller', 'once upon', 'एक समय', 'कहानी', 'narrate', 'narration', 'novel', 'poem', 'documentary'];
const NEWS_KEYWORDS = ['news', 'headline', 'headlines', 'breaking', 'update', 'bulletin', 'report', 'reporter', 'newsroom', 'समाचार', 'खबर', 'ताज़ा'];
const TECH_KEYWORDS = ['tech', 'technology', 'software', 'code', 'coding', 'app', 'ai', 'api', 'tutorial', 'guide', 'product', 'feature', 'bug', 'dev', 'developer', 'system'];
const CONVERSATIONAL_KEYWORDS = ['hello', 'hey', 'vlog', 'conversation', 'chat', 'casual', 'intro', 'welcome', 'friends', 'guys', 'दोस्तों'];

export function inferScriptRole(text = '') {
  const content = (text || '').toLowerCase();

  const counts = {
    story: STORY_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase())).length,
    news: NEWS_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase())).length,
    tech: TECH_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase())).length,
    conversational: CONVERSATIONAL_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase())).length
  };

  const ordered = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  if (!ordered.length || ordered[0][1] === 0) return 'general';
  return ordered[0][0];
}

export function getRecommendedProfileForText(text, { langGroup = 'all', gender = 'all', fallbackProfile = null } = {}) {
  const scriptRole = inferScriptRole(text);
  const candidates = PREMIUM_VOICE_PROFILES.filter(profile => {
    if (langGroup !== 'all' && profile.lang.slice(0, 2).toLowerCase() !== langGroup) return false;
    if (gender !== 'all' && profile.gender.toLowerCase() !== gender.toLowerCase()) return false;
    return true;
  });

  const roleMatches = candidates.filter(profile => {
    if (scriptRole === 'general') return true;
    return profile.voiceRole === scriptRole;
  });

  return roleMatches[0] || candidates[0] || fallbackProfile || PREMIUM_VOICE_PROFILES[0];
}

export function findMatchingSystemVoice(systemVoices, profile) {
  if (!systemVoices || systemVoices.length === 0) return null;

  const profileLangGroup = profile.lang.slice(0, 2).toLowerCase();
  const isTargetFemale = profile.gender === 'Female';

  let match = systemVoices.find(v => {
    const vName = v.name.toLowerCase();
    const vLang = v.lang.toLowerCase();
    const matchesLang = vLang.includes(profile.lang.toLowerCase()) || vLang.startsWith(profileLangGroup);
    const matchesGender = isTargetFemale
      ? (vName.includes('female') || vName.includes('woman') || vName.includes('zira') || vName.includes('swara') || vName.includes('samantha') || vName.includes('aria') || vName.includes('nisha'))
      : (vName.includes('male') || vName.includes('man') || vName.includes('david') || vName.includes('rohit') || vName.includes('alex') || vName.includes('kabir') || vName.includes('arjun'));
    return matchesLang && matchesGender;
  });

  if (!match) {
    match = systemVoices.find(v => v.lang.toLowerCase().startsWith(profileLangGroup));
  }

  return match || systemVoices[0] || null;
}
