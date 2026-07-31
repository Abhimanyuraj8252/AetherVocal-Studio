/**
 * Ambient BGM Soundscapes & Web Audio Mixer Utility for AetherVocal Studio
 */

export const BGM_PRESETS = [
  { id: 'none', label: 'Off (Speech Only)', icon: '🔇', category: 'General' },
  { id: 'news', label: '📰 Breaking News Pulse', icon: '📡', category: 'Broadcast' },
  { id: 'story', label: '📖 Cinematic Storytelling', icon: '🌌', category: 'Story' },
  { id: 'explainer', label: '💡 Tech & Explainer Video', icon: '⚡', category: 'YouTube' },
  { id: 'drama', label: '🎭 Dramatic Suspense & Thriller', icon: '🔥', category: 'Drama' },
  { id: 'podcast', label: '🎙️ Podcast Studio Warmth', icon: '🎧', category: 'Podcast' },
  { id: 'lofi', label: '☕ Cyberpunk Chill Lo-Fi', icon: '🌆', category: 'Lo-Fi' },
  { id: 'rain', label: '🌧️ Peaceful Rain & Nature', icon: '🌿', category: 'Nature' },
  { id: 'corporate', label: '💼 Corporate Business Pad', icon: '✨', category: 'Corporate' },
  { id: 'meditation', label: '🧘 Zen Meditation & Calm', icon: '🕉️', category: 'Relax' },
  { id: 'space', label: '🛸 Ethereal Deep Space', icon: '🪐', category: 'Space' }
];

/**
 * Synthesizes ambient BGM audio buffer in OfflineAudioContext.
 */
function createBGMBuffer(offlineCtx, bgmType, durationSeconds) {
  const sampleRate = offlineCtx.sampleRate;
  const length = Math.ceil(durationSeconds * sampleRate);
  const buffer = offlineCtx.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  if (bgmType === 'none') return buffer;

  if (bgmType === 'rain') {
    // Pink noise + lowpass filter for gentle rain soundscape
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      const val = pink * 0.028;
      left[i] = val;
      right[i] = val;
    }
  } else if (bgmType === 'news') {
    // Rhythmic 130 Hz news pulse synth + subtle sub bass ticker
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const pulse = Math.pow(Math.abs(Math.sin(2 * Math.PI * 2.5 * t)), 8);
      const bass = 0.03 * Math.sin(2 * Math.PI * 110 * t) * (1 + 0.3 * pulse);
      const ticker = 0.015 * Math.sin(2 * Math.PI * 440 * t) * pulse;
      const sub = 0.02 * Math.sin(2 * Math.PI * 55 * t);
      left[i] = bass + ticker + sub;
      right[i] = bass + ticker * 0.8 + sub;
    }
  } else if (bgmType === 'story') {
    // Cinematic mystery D-minor ambient swell (D2 73.4Hz, A2 110Hz, F3 174.6Hz, C4 261.6Hz)
    const freqs = [73.41, 110.0, 174.61, 261.63];
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sampleL = 0;
      let sampleR = 0;
      freqs.forEach((freq, idx) => {
        const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t + idx * 0.5);
        const pan = Math.sin(2 * Math.PI * 0.1 * t + idx);
        const s = 0.02 * Math.sin(2 * Math.PI * freq * t) * lfo;
        sampleL += s * (1 - 0.2 * pan);
        sampleR += s * (1 + 0.2 * pan);
      });
      left[i] = sampleL;
      right[i] = sampleR;
    }
  } else if (bgmType === 'explainer') {
    // Upbeat C Major tech synth pad (C3 130.8Hz, E3 164.8Hz, G3 196Hz, B3 246.9Hz)
    const freqs = [130.81, 164.81, 196.00, 246.94];
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      freqs.forEach((freq, idx) => {
        const shimmer = 1 + 0.12 * Math.sin(2 * Math.PI * 3 * t + idx);
        sample += 0.02 * Math.sin(2 * Math.PI * freq * t) * shimmer;
      });
      left[i] = sample;
      right[i] = sample;
    }
  } else if (bgmType === 'drama') {
    // Deep dark suspense tension drone (F1 43.65Hz sub + detuned sawtooth pad)
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const tensionLfo = 0.4 + 0.6 * Math.abs(Math.sin(2 * Math.PI * 0.05 * t));
      const sub = 0.04 * Math.sin(2 * Math.PI * 43.65 * t);
      const detune1 = 0.02 * Math.sin(2 * Math.PI * 87.31 * t);
      const detune2 = 0.018 * Math.sin(2 * Math.PI * 87.85 * t);
      const highWail = 0.008 * Math.sin(2 * Math.PI * 349.23 * t) * tensionLfo;
      left[i] = (sub + detune1 + highWail) * tensionLfo;
      right[i] = (sub + detune2 + highWail * 0.8) * tensionLfo;
    }
  } else if (bgmType === 'podcast') {
    // Warm analog tube studio soundscape (subtle 100Hz warmth + smooth analog tape air)
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const tubeWarmth = 0.02 * Math.sin(2 * Math.PI * 100 * t) + 0.01 * Math.sin(2 * Math.PI * 200 * t);
      const airNoise = (Math.random() * 2 - 1) * 0.004;
      left[i] = tubeWarmth + airNoise;
      right[i] = tubeWarmth + airNoise;
    }
  } else if (bgmType === 'meditation') {
    // 432 Hz Solfeggio meditation singing bowl synth
    const f1 = 432.0;
    const f2 = 216.0;
    const f3 = 108.0;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.04 * t);
      const val = (0.025 * Math.sin(2 * Math.PI * f1 * t) +
                   0.03 * Math.sin(2 * Math.PI * f2 * t) +
                   0.035 * Math.sin(2 * Math.PI * f3 * t)) * lfo;
      left[i] = val;
      right[i] = val;
    }
  } else if (bgmType === 'lofi') {
    // Warm A-minor synth pad (220Hz, 261.6Hz, 329.6Hz, 392Hz)
    const freqs = [220, 261.63, 329.63, 392.00];
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      freqs.forEach((freq, idx) => {
        const lfo = 1 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t + idx);
        sample += 0.03 * Math.sin(2 * Math.PI * freq * t) * lfo;
      });
      left[i] = sample;
      right[i] = sample;
    }
  } else if (bgmType === 'corporate' || bgmType === 'space') {
    // Ethereal drone (55Hz sub + 110Hz + 164Hz)
    const baseFreq = bgmType === 'space' ? 65.41 : 110.0;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t);
      const val = 0.035 * Math.sin(2 * Math.PI * baseFreq * t) * lfo +
                  0.02 * Math.sin(2 * Math.PI * (baseFreq * 1.5) * t);
      left[i] = val;
      right[i] = val;
    }
  }

  return buffer;
}

/**
 * Mixes a voice audio Blob with selected BGM Soundscape into a single audio Blob.
 */
export async function mixAudioBlobWithBGM(voiceBlob, bgmType = 'none', bgmVolumeRatio = 0.15) {
  if (!voiceBlob || bgmType === 'none' || bgmVolumeRatio <= 0) {
    return voiceBlob; // No mix needed
  }

  try {
    const arrayBuffer = await voiceBlob.arrayBuffer();
    const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
    const voiceBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    await tempCtx.close();

    const duration = voiceBuffer.duration;
    const sampleRate = voiceBuffer.sampleRate;
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);

    // Voice Source Node
    const voiceSource = offlineCtx.createBufferSource();
    voiceSource.buffer = voiceBuffer;
    const voiceGain = offlineCtx.createGain();
    voiceGain.gain.value = 1.0;
    voiceSource.connect(voiceGain);
    voiceGain.connect(offlineCtx.destination);

    // BGM Source Node
    const bgmBuffer = createBGMBuffer(offlineCtx, bgmType, duration);
    const bgmSource = offlineCtx.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    bgmSource.loop = true;
    const bgmGain = offlineCtx.createGain();
    bgmGain.gain.value = bgmVolumeRatio;
    bgmSource.connect(bgmGain);
    bgmGain.connect(offlineCtx.destination);

    voiceSource.start(0);
    bgmSource.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    // Convert rendered AudioBuffer back to WAV Blob
    return audioBufferToWavBlob(renderedBuffer);
  } catch (err) {
    console.warn("BGM Audio Mixing failed, returning original voice blob:", err);
    return voiceBlob;
  }
}

/**
 * Helper to encode AudioBuffer to WAV Blob
 */
function audioBufferToWavBlob(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new DataView(new ArrayBuffer(length));
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data) {
    outBuffer.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    outBuffer.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT header
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  // Data header
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      outBuffer.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });
}
