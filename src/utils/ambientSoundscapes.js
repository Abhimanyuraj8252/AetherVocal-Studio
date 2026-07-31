/**
 * Ambient BGM Soundscapes & Web Audio Mixer Utility for AetherVocal Studio
 */

export const BGM_PRESETS = [
  { id: 'none', label: 'Off (Speech Only)', icon: '🔇' },
  { id: 'lofi', label: '🎧 Cyberpunk Lo-Fi Drone', icon: '🌌' },
  { id: 'rain', label: '🌧️ Peaceful Rain & Nature', icon: '🌧️' },
  { id: 'corporate', label: '💼 Corporate Tech Pad', icon: '✨' },
  { id: 'space', label: '🛸 Ethereal Space Ambient', icon: '🪐' }
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
    // Pink noise + lowpass filter for gentle rain
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
      const val = pink * 0.03;
      left[i] = val;
      right[i] = val;
    }
  } else if (bgmType === 'lofi') {
    // Warm chords (A minor synth pad: 220Hz, 261Hz, 329Hz, 392Hz)
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
