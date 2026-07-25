/**
 * Formant Speech Synthesizer — Character-Based Speech Audio Generator
 *
 * Generates downloadable speech audio by analyzing each Hindi (Devanagari)
 * and English character and mapping it to proper vocal formant frequencies.
 *
 * Works on ALL devices (mobile + desktop), no network needed, no permissions needed.
 *
 * How it works:
 * 1. Splits text into characters
 * 2. Each character maps to specific formant frequencies (F1, F2, F3)
 * 3. Vowels produce voiced formant patterns
 * 4. Consonants produce noise bursts or transitions
 * 5. Spaces create natural word pauses
 * 6. Output is a 16-bit PCM WAV blob
 */

// ─── HINDI VOWEL FORMANT TABLE (Devanagari) ───
// Each vowel maps to fundamental formant frequencies (F1, F2, F3 in Hz)
const HINDI_VOWEL_FORMANTS = {
  // Standalone vowels
  'अ': { f1: 710, f2: 1100, f3: 2550, dur: 110 },
  'आ': { f1: 710, f2: 1100, f3: 2550, dur: 180 },
  'इ': { f1: 280, f2: 2250, f3: 2890, dur: 100 },
  'ई': { f1: 280, f2: 2250, f3: 2890, dur: 170 },
  'उ': { f1: 310, f2: 870, f3: 2250, dur: 100 },
  'ऊ': { f1: 310, f2: 870, f3: 2250, dur: 170 },
  'ए': { f1: 400, f2: 2050, f3: 2650, dur: 120 },
  'ऐ': { f1: 600, f2: 1800, f3: 2550, dur: 140 },
  'ओ': { f1: 450, f2: 800, f3: 2550, dur: 120 },
  'औ': { f1: 600, f2: 900, f3: 2550, dur: 140 },
  'ऋ': { f1: 350, f2: 1300, f3: 2500, dur: 120 },

  // Vowel matras (combining marks)
  'ा': { f1: 710, f2: 1100, f3: 2550, dur: 150 },  // aa
  'ि': { f1: 280, f2: 2250, f3: 2890, dur: 90 },   // i
  'ी': { f1: 280, f2: 2250, f3: 2890, dur: 150 },   // ii
  'ु': { f1: 310, f2: 870, f3: 2250, dur: 90 },    // u
  'ू': { f1: 310, f2: 870, f3: 2250, dur: 150 },   // uu
  'े': { f1: 400, f2: 2050, f3: 2650, dur: 110 },   // e
  'ै': { f1: 600, f2: 1800, f3: 2550, dur: 130 },   // ai
  'ो': { f1: 450, f2: 800, f3: 2550, dur: 110 },    // o
  'ौ': { f1: 600, f2: 900, f3: 2550, dur: 130 },    // au
  'ृ': { f1: 350, f2: 1300, f3: 2500, dur: 100 },   // ri
};

// Default inherent 'a' vowel (schwa) for Hindi consonants
const SCHWA = { f1: 500, f2: 1500, f3: 2500, dur: 70 };

// ─── HINDI CONSONANT TABLE ───
// type: 'stop' | 'fricative' | 'nasal' | 'approximant' | 'tap'
// voiced: true/false — affects whether F0 buzzing is present during consonant
const HINDI_CONSONANTS = {
  'क': { type: 'stop', voiced: false },
  'ख': { type: 'stop', voiced: false },
  'ग': { type: 'stop', voiced: true },
  'घ': { type: 'stop', voiced: true },
  'ङ': { type: 'nasal', voiced: true },
  'च': { type: 'stop', voiced: false },
  'छ': { type: 'stop', voiced: false },
  'ज': { type: 'stop', voiced: true },
  'झ': { type: 'stop', voiced: true },
  'ञ': { type: 'nasal', voiced: true },
  'ट': { type: 'stop', voiced: false },
  'ठ': { type: 'stop', voiced: false },
  'ड': { type: 'stop', voiced: true },
  'ढ': { type: 'stop', voiced: true },
  'ण': { type: 'nasal', voiced: true },
  'त': { type: 'stop', voiced: false },
  'थ': { type: 'stop', voiced: false },
  'द': { type: 'stop', voiced: true },
  'ध': { type: 'stop', voiced: true },
  'न': { type: 'nasal', voiced: true },
  'प': { type: 'stop', voiced: false },
  'फ': { type: 'fricative', voiced: false },
  'ब': { type: 'stop', voiced: true },
  'भ': { type: 'stop', voiced: true },
  'म': { type: 'nasal', voiced: true },
  'य': { type: 'approximant', voiced: true },
  'र': { type: 'tap', voiced: true },
  'ल': { type: 'approximant', voiced: true },
  'व': { type: 'approximant', voiced: true },
  'श': { type: 'fricative', voiced: false },
  'ष': { type: 'fricative', voiced: false },
  'स': { type: 'fricative', voiced: false },
  'ह': { type: 'fricative', voiced: true },
  'ड़': { type: 'tap', voiced: true },
  'ढ़': { type: 'tap', voiced: true },
};

// ─── ENGLISH VOWEL FORMANTS ───
const ENGLISH_VOWELS = {
  'a': { f1: 660, f2: 1720, f3: 2410, dur: 100 },
  'e': { f1: 530, f2: 1840, f3: 2480, dur: 100 },
  'i': { f1: 390, f2: 1990, f3: 2550, dur: 90 },
  'o': { f1: 570, f2: 840, f3: 2410, dur: 100 },
  'u': { f1: 640, f2: 1190, f3: 2390, dur: 90 },
  'y': { f1: 300, f2: 2200, f3: 2800, dur: 80 },
};

// ─── ENGLISH CONSONANT TABLE ───
const ENGLISH_CONSONANTS = {
  'b': { type: 'stop', voiced: true },
  'c': { type: 'stop', voiced: false },
  'd': { type: 'stop', voiced: true },
  'f': { type: 'fricative', voiced: false },
  'g': { type: 'stop', voiced: true },
  'h': { type: 'fricative', voiced: true },
  'j': { type: 'stop', voiced: true },
  'k': { type: 'stop', voiced: false },
  'l': { type: 'approximant', voiced: true },
  'm': { type: 'nasal', voiced: true },
  'n': { type: 'nasal', voiced: true },
  'p': { type: 'stop', voiced: false },
  'q': { type: 'stop', voiced: false },
  'r': { type: 'approximant', voiced: true },
  's': { type: 'fricative', voiced: false },
  't': { type: 'stop', voiced: false },
  'v': { type: 'fricative', voiced: true },
  'w': { type: 'approximant', voiced: true },
  'x': { type: 'fricative', voiced: false },
  'z': { type: 'fricative', voiced: true },
};

// ─── SPECIAL CHARACTERS ───
const ANUSVARA = 'ं';   // Nasalization
const VISARGA = 'ः';    // Aspiration
const VIRAMA = '्';     // Halant — suppresses inherent vowel
const CHANDRABINDU = 'ँ'; // Nasal vowel

/**
 * Analyze text into a sequence of synthesis segments
 */
function analyzeText(text, isMale = false) {
  const segments = [];
  const chars = [...text]; // Handle multi-byte unicode properly

  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    const next = i + 1 < chars.length ? chars[i + 1] : null;
    const code = ch.codePointAt(0);

    // Space → word pause
    if (ch === ' ' || ch === '\t') {
      segments.push({ type: 'pause', dur: 80 });
      i++;
      continue;
    }

    // Newline → longer pause
    if (ch === '\n' || ch === '\r') {
      segments.push({ type: 'pause', dur: 200 });
      i++;
      continue;
    }

    // Punctuation → sentence pause
    if ('.?!।'.includes(ch)) {
      segments.push({ type: 'pause', dur: 250 });
      i++;
      continue;
    }

    // Comma → short pause
    if (',;:'.includes(ch)) {
      segments.push({ type: 'pause', dur: 120 });
      i++;
      continue;
    }

    // Hindi standalone vowel
    if (HINDI_VOWEL_FORMANTS[ch] && !HINDI_CONSONANTS[ch]) {
      segments.push({ type: 'vowel', formants: HINDI_VOWEL_FORMANTS[ch] });
      i++;
      // Skip following anusvara/visarga (add nasalization marker)
      if (i < chars.length && (chars[i] === ANUSVARA || chars[i] === CHANDRABINDU)) {
        segments[segments.length - 1].nasal = true;
        i++;
      }
      continue;
    }

    // Hindi consonant
    if (HINDI_CONSONANTS[ch]) {
      const consInfo = HINDI_CONSONANTS[ch];

      // Add consonant onset
      segments.push({ type: 'consonant', info: consInfo, dur: 35 });

      // Check for virama (halant) — no vowel follows
      if (next === VIRAMA) {
        i += 2; // skip consonant + virama
        continue;
      }

      // Check for vowel matra
      if (next && HINDI_VOWEL_FORMANTS[next] && !HINDI_CONSONANTS[next]) {
        segments.push({ type: 'vowel', formants: HINDI_VOWEL_FORMANTS[next] });
        i += 2;
      } else {
        // Inherent schwa vowel (short 'a')
        segments.push({ type: 'vowel', formants: SCHWA });
        i++;
      }

      // Handle anusvara/chandrabindu after vowel
      if (i < chars.length && (chars[i] === ANUSVARA || chars[i] === CHANDRABINDU)) {
        segments[segments.length - 1].nasal = true;
        i++;
      }
      continue;
    }

    // Anusvara/Visarga standalone
    if (ch === ANUSVARA || ch === CHANDRABINDU || ch === VISARGA) {
      segments.push({ type: 'nasal_coda', dur: 50 });
      i++;
      continue;
    }

    // English vowel
    const lc = ch.toLowerCase();
    if (ENGLISH_VOWELS[lc]) {
      segments.push({ type: 'vowel', formants: ENGLISH_VOWELS[lc] });
      i++;
      continue;
    }

    // English consonant
    if (ENGLISH_CONSONANTS[lc]) {
      const consInfo = ENGLISH_CONSONANTS[lc];
      segments.push({ type: 'consonant', info: consInfo, dur: 30 });

      // If next char is a vowel, it will be handled in next iteration
      // If next char is another consonant (cluster), just continue
      i++;
      continue;
    }

    // Digits — speak as-is with neutral formant
    if (code >= 48 && code <= 57) {
      // Map digit to a vowel-like sound
      const digitFormants = [
        { f1: 450, f2: 800, f3: 2550, dur: 120 },  // 0 → 'o' like
        { f1: 640, f2: 1190, f3: 2390, dur: 100 },  // 1 → 'u' like
        { f1: 310, f2: 870, f3: 2250, dur: 100 },   // 2
        { f1: 390, f2: 1990, f3: 2550, dur: 100 },  // 3
        { f1: 450, f2: 800, f3: 2550, dur: 100 },   // 4
        { f1: 660, f2: 1720, f3: 2410, dur: 100 },  // 5
        { f1: 530, f2: 1840, f3: 2480, dur: 100 },  // 6
        { f1: 280, f2: 2250, f3: 2890, dur: 100 },  // 7
        { f1: 400, f2: 2050, f3: 2650, dur: 100 },  // 8
        { f1: 710, f2: 1100, f3: 2550, dur: 100 },  // 9
      ];
      segments.push({ type: 'vowel', formants: digitFormants[code - 48] });
      i++;
      continue;
    }

    // Hindi digit range (०-९)
    if (code >= 0x0966 && code <= 0x096F) {
      segments.push({ type: 'vowel', formants: SCHWA });
      i++;
      continue;
    }

    // Skip any other characters (symbols, emoji, etc.)
    i++;
  }

  return segments;
}

/**
 * Render analysis segments into Float32 audio samples
 */
function renderSegments(segments, sampleRate, basePitchHz, speechRate) {
  // Estimate total samples needed
  let totalDurMs = 0;
  for (const seg of segments) {
    if (seg.type === 'pause') {
      totalDurMs += seg.dur / speechRate;
    } else if (seg.type === 'consonant') {
      totalDurMs += (seg.dur || 35) / speechRate;
    } else if (seg.type === 'vowel') {
      totalDurMs += (seg.formants.dur || 100) / speechRate;
    } else if (seg.type === 'nasal_coda') {
      totalDurMs += (seg.dur || 50) / speechRate;
    }
  }

  // Minimum 1 second
  totalDurMs = Math.max(1000, totalDurMs);

  const totalSamples = Math.ceil((totalDurMs / 1000) * sampleRate);
  const samples = new Float32Array(totalSamples);

  let sampleIdx = 0;
  let phase0 = 0, phase1 = 0, phase2 = 0, phase3 = 0;
  let globalTime = 0;

  // Random noise generator (deterministic for consistency)
  let noiseSeed = 12345;
  function noise() {
    noiseSeed = (noiseSeed * 16807) % 2147483647;
    return (noiseSeed / 2147483647) * 2 - 1;
  }

  for (const seg of segments) {
    if (seg.type === 'pause') {
      const pauseSamples = Math.floor(((seg.dur || 80) / speechRate / 1000) * sampleRate);
      // Write near-silence (tiny noise to avoid DC offset clicks)
      for (let j = 0; j < pauseSamples && sampleIdx < totalSamples; j++, sampleIdx++) {
        samples[sampleIdx] = noise() * 0.001;
        globalTime += 1 / sampleRate;
      }
      continue;
    }

    if (seg.type === 'consonant') {
      const info = seg.info;
      const durMs = (seg.dur || 35) / speechRate;
      const numSamples = Math.floor((durMs / 1000) * sampleRate);

      for (let j = 0; j < numSamples && sampleIdx < totalSamples; j++, sampleIdx++) {
        const t = j / numSamples; // 0..1 progress
        const env = Math.sin(t * Math.PI); // Bell-shaped envelope

        let sample = 0;

        if (info.type === 'stop') {
          // Stop consonant: short silence then burst
          if (t < 0.3) {
            sample = info.voiced ? Math.sin(phase0) * 0.05 : 0;
          } else {
            // Burst
            sample = noise() * 0.3 * env;
            if (info.voiced) {
              sample += Math.sin(phase0) * 0.1;
            }
          }
        } else if (info.type === 'fricative') {
          // Fricative: continuous noise
          sample = noise() * 0.2 * env;
          if (info.voiced) {
            sample += Math.sin(phase0) * 0.08;
          }
        } else if (info.type === 'nasal') {
          // Nasal: low-frequency voiced with nasal resonance
          sample = Math.sin(phase0) * 0.15 * env;
          sample += Math.sin(phase0 * 2.7) * 0.05 * env; // Nasal resonance ~270 Hz
        } else if (info.type === 'approximant') {
          // Approximant: smooth glide with formants
          sample = Math.sin(phase0) * 0.12 * env;
          sample += Math.sin(phase1) * 0.06 * env;
        } else if (info.type === 'tap') {
          // Tap/trill: brief voiced burst
          const tapRate = 25; // Hz
          const tapMod = Math.sin(2 * Math.PI * tapRate * globalTime);
          sample = Math.sin(phase0) * 0.1 * env * Math.abs(tapMod);
        }

        samples[sampleIdx] = sample;

        // Advance phases
        // Natural pitch variation (micro-prosody)
        const pitchVar = basePitchHz + Math.sin(globalTime * 4.5) * 8;
        phase0 += (2 * Math.PI * pitchVar) / sampleRate;
        phase1 += (2 * Math.PI * pitchVar * 2.3) / sampleRate;
        globalTime += 1 / sampleRate;
      }
      continue;
    }

    if (seg.type === 'vowel') {
      const fm = seg.formants;
      const durMs = (fm.dur || 100) / speechRate;
      const numSamples = Math.floor((durMs / 1000) * sampleRate);

      for (let j = 0; j < numSamples && sampleIdx < totalSamples; j++, sampleIdx++) {
        const t = j / numSamples; // 0..1 progress

        // Smooth onset/offset envelope (prevents clicks)
        let env;
        if (t < 0.08) {
          env = t / 0.08; // Fast attack
        } else if (t > 0.85) {
          env = (1 - t) / 0.15; // Gradual release
        } else {
          env = 1.0;
        }
        env *= 0.28; // Overall volume

        // Natural pitch variation (intonation)
        const pitchVar = basePitchHz + Math.sin(globalTime * 4.5) * 8 + Math.cos(globalTime * 1.8) * 4;
        const f0 = pitchVar;

        // Glottal source (voice) — pulse-like wave, not pure sine
        const glottalPhase = (phase0 % (2 * Math.PI)) / (2 * Math.PI);
        // LF model approximation: sharper closing, smoother opening
        const glottal = glottalPhase < 0.6
          ? Math.sin(glottalPhase / 0.6 * Math.PI)
          : -Math.sin((glottalPhase - 0.6) / 0.4 * Math.PI) * 0.5;

        // Formant resonances
        const r1 = Math.sin(2 * Math.PI * fm.f1 * globalTime) * 0.35;
        const r2 = Math.sin(2 * Math.PI * fm.f2 * globalTime) * 0.20;
        const r3 = Math.sin(2 * Math.PI * fm.f3 * globalTime) * 0.08;

        // Combine glottal source with formant resonances
        let sample = glottal * 0.4 + r1 + r2 + r3;

        // Add nasalization if marked
        if (seg.nasal) {
          sample += Math.sin(2 * Math.PI * 270 * globalTime) * 0.06;
        }

        // Add subtle breathiness
        sample += noise() * 0.012;

        samples[sampleIdx] = sample * env;

        // Advance fundamental frequency phase
        phase0 += (2 * Math.PI * f0) / sampleRate;
        phase1 += (2 * Math.PI * f0 * 2.3) / sampleRate;
        phase2 += (2 * Math.PI * f0 * 4.0) / sampleRate;
        phase3 += (2 * Math.PI * f0 * 5.6) / sampleRate;
        globalTime += 1 / sampleRate;
      }
      continue;
    }

    if (seg.type === 'nasal_coda') {
      const durMs = (seg.dur || 50) / speechRate;
      const numSamples = Math.floor((durMs / 1000) * sampleRate);

      for (let j = 0; j < numSamples && sampleIdx < totalSamples; j++, sampleIdx++) {
        const t = j / numSamples;
        const env = Math.sin(t * Math.PI) * 0.12;
        samples[sampleIdx] = Math.sin(phase0) * env + Math.sin(2 * Math.PI * 270 * globalTime) * env * 0.3;

        const pitchVar = basePitchHz + Math.sin(globalTime * 4.5) * 8;
        phase0 += (2 * Math.PI * pitchVar) / sampleRate;
        globalTime += 1 / sampleRate;
      }
      continue;
    }
  }

  // Trim to actual used length
  return samples.subarray(0, sampleIdx);
}

/**
 * Encode Float32 samples to 16-bit PCM WAV Blob
 */
function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(view, 8, 'WAVE');

  // fmt subchunk
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);       // PCM subchunk size
  view.setUint16(20, 1, true);        // PCM format
  view.setUint16(22, 1, true);        // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true);        // BlockAlign
  view.setUint16(34, 16, true);       // BitsPerSample

  // data subchunk
  writeStr(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeStr(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ─── PUBLIC API ───

export class FormantSpeechSynthesizer {
  /**
   * Synthesize text into a WAV audio blob
   *
   * @param {string} text — Hindi or English text to synthesize
   * @param {object} options
   * @param {string} options.gender — 'Male' or 'Female'
   * @param {number} options.pitch — Pitch multiplier (0.5–2.0)
   * @param {number} options.rate — Speed multiplier (0.5–2.0)
   * @returns {Blob} — WAV audio blob
   */
  static synthesize(text, { gender = 'Female', pitch = 1.0, rate = 1.0 } = {}) {
    const cleanText = (text || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#*~_`^|\\{}[\]@$%&=+<>/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      // Return 1 second of silence
      const sampleRate = 22050;
      const samples = new Float32Array(sampleRate);
      return encodeWav(samples, sampleRate);
    }

    const sampleRate = 22050;
    const isMale = gender === 'Male';
    const basePitch = (isMale ? 115 : 200) * Math.max(0.5, Math.min(2.0, pitch));
    const speechRate = Math.max(0.5, Math.min(2.0, rate));

    // Analyze text into synthesis segments
    const segments = analyzeText(cleanText, isMale);

    // Render segments to audio samples
    const samples = renderSegments(segments, sampleRate, basePitch, speechRate);

    // Encode to WAV
    return encodeWav(samples, sampleRate);
  }

  /**
   * Synthesize and play audio directly (for preview)
   */
  static async play(text, options = {}, onEnd = () => {}) {
    const wavBlob = this.synthesize(text, options);
    const url = URL.createObjectURL(wavBlob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      onEnd();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      onEnd();
    };
    await audio.play();
    return audio;
  }
}
