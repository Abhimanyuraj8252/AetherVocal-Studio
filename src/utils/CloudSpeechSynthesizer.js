/**
 * Cloud & Sherpa-ONNX Speech Synthesizer — Long-Form Audio Engine
 *
 * Implements:
 * 1. Smart Text Chunker (Max 180 chars per chunk, breaks at punctuation/newlines without cutting words).
 * 2. Batched Fetch & Web Audio Decoding Pipeline (fetches chunks with rate-limiting & fallback).
 * 3. Web Audio Buffer Stitcher (merges AudioBuffers seamlessly into a single long AudioBuffer).
 * 4. Full Length Audio Export (Converts AudioBuffer to 16-bit PCM WAV Blob).
 * 5. Real-time Progress Tracking Callback (onProgress).
 */

export class CloudSpeechSynthesizer {
  /**
   * Smart Text Chunker
   * Splits long input scripts into logical text chunks (Max 180 chars).
   * Respects sentence boundaries (Full Stop `.`, Hindi Purna Viram `।`, `?`, `!`, `\n`, `,`, `;`).
   * 
   * @param {string} text - Input text
   * @param {number} maxChars - Maximum characters per chunk (default: 180)
   * @returns {string[]} Array of clean text chunks
   */
  static smartChunkText(text, maxChars = 180) {
    if (!text || typeof text !== 'string') return [];

    // Normalize line endings
    const normalized = text.replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    // Split text by sentence punctuation marks or newlines, keeping delimiters
    const sentenceRegex = /[^.!?।\n;,]+[.!?।\n;,]*/g;
    const rawSentences = normalized.match(sentenceRegex) || [normalized];

    const chunks = [];
    let currentChunk = '';

    for (let sentence of rawSentences) {
      sentence = sentence.trim();
      if (!sentence) continue;

      // If single sentence fits within maxChars
      if ((currentChunk + ' ' + sentence).trim().length <= maxChars) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        // If a single sentence exceeds maxChars, split by words
        if (sentence.length > maxChars) {
          const words = sentence.split(/\s+/);
          let wordBuffer = '';

          for (const word of words) {
            if ((wordBuffer + ' ' + word).trim().length <= maxChars) {
              wordBuffer = (wordBuffer + ' ' + word).trim();
            } else {
              if (wordBuffer) chunks.push(wordBuffer);
              wordBuffer = word;
            }
          }
          currentChunk = wordBuffer;
        } else {
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Primary Long-Form Speech Synthesizer
   * 
   * @param {string} text - Input text script
   * @param {Object} options - Synthesizer options
   * @param {string} [options.lang='hi'] - Target language code ('hi' or 'en')
   * @param {number} [options.pitch=1.0] - Pitch multiplier (e.g. 0.85 for male)
   * @param {number} [options.rate=1.0] - Speed multiplier
   * @param {Function} [options.onProgress] - Callback function: onProgress({ current, total, percent, statusText })
   * @returns {Promise<Blob>} Combined 16-bit PCM WAV Audio Blob
   */
  static async synthesize(text, options = {}) {
    const { onProgress, startIndex = 0, maxChunks = 20, pitch = 1.0, rate = 1.0 } = options;
    const isHindi = /[\u0900-\u097F]/.test(text);
    const lang = options.lang || (isHindi ? 'hi' : 'en');

    // 1. SMART TEXT CHUNKER
    const allChunks = this.smartChunkText(text, 180);

    if (allChunks.length === 0) {
      throw new Error("Text input is empty or contains no valid characters.");
    }

    const endIndex = Math.min(startIndex + maxChunks, allChunks.length);
    const chunks = allChunks.slice(startIndex, endIndex);
    
    if (chunks.length === 0) {
      return { wavBlob: null, endIndex: allChunks.length, isComplete: true };
    }

    if (onProgress) {
      onProgress({
        current: 0,
        total: chunks.length,
        percent: 0,
        statusText: `Preparing chunks ${startIndex + 1} to ${endIndex}...`
      });
    }

    // Prepare Web Audio Context for decoding
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio API is not supported in this browser environment.");
    }
    const audioCtx = new AudioContextClass();

    const decodedAudioBuffers = [];

    // 2. BATCHED FETCH & DECODE PIPELINE
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const progressPercent = Math.round(((i + 1) / chunks.length) * 100);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: chunks.length,
          percent: progressPercent,
          statusText: `Synthesizing chunk ${i + 1} of ${chunks.length} (${progressPercent}%)...`
        });
      }

      try {
        const audioBuffer = await this.fetchAndDecodeChunk(chunk, lang, audioCtx);
        if (audioBuffer) {
          decodedAudioBuffers.push(audioBuffer);
        }
      } catch (err) {
        console.warn(`Warning: Failed to process chunk ${i + 1} ("${chunk.slice(0, 20)}..."):`, err);
      }

      // Add a healthy delay between requests to avoid Google/Lingva 429 Too Many Requests
      if (i < chunks.length - 1) {
        await new Promise(res => setTimeout(res, 1200));
      }
    }

    if (decodedAudioBuffers.length === 0) {
      throw new Error("Could not generate audio for any text chunk. Please check your internet connection.");
    }

    if (onProgress) {
      onProgress({
        current: chunks.length,
        total: chunks.length,
        percent: 98,
        statusText: "Stitching long-form audio buffers..."
      });
    }

    // 3. WEB AUDIO BUFFER STITCHER
    let combinedAudioBuffer = this.stitchAudioBuffers(decodedAudioBuffers, audioCtx);

    // Apply Acoustic Profile (Pitch for Male/Female, Speed)
    if (pitch !== 1.0 || rate !== 1.0) {
      if (onProgress) {
        onProgress({
          current: chunks.length,
          total: chunks.length,
          percent: 99,
          statusText: `Applying acoustic profile (Pitch: ${pitch}, Rate: ${rate})...`
        });
      }
      combinedAudioBuffer = await this.applyAcousticProfile(combinedAudioBuffer, pitch, rate);
    }

    if (onProgress) {
      onProgress({
        current: chunks.length,
        total: chunks.length,
        percent: 100,
        statusText: "Exporting WAV file..."
      });
    }

    // 4. FULL LENGTH FILE EXPORT
    const wavBlob = this.audioBufferToWavBlob(combinedAudioBuffer);

    // Clean up AudioContext
    try {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    } catch (e) {
      // Ignore cleanup error
    }

    return { 
      wavBlob, 
      endIndex, 
      isComplete: endIndex >= allChunks.length 
    };
  }

  /**
   * Combines multiple saved WAV blobs into a single continuous WAV blob.
   * High-performance stream merging that prevents WebAudio API buffer memory limits on 50+ part batches.
   * 
   * @param {Blob[]} blobs - Array of WAV blobs from IndexedDB
   * @param {Function} [onProgress] - Optional progress callback
   * @returns {Promise<Blob>} Merged WAV audio blob
   */
  static async combineSavedBlobs(blobs, onProgress) {
    if (!blobs || blobs.length === 0) throw new Error("No blobs to combine");
    if (blobs.length === 1) return blobs[0];

    try {
      return await this.combineWavBlobsBinary(blobs, onProgress);
    } catch (err) {
      console.warn("Direct binary WAV combine failed, attempting AudioContext fallback:", err);
      return await this.combineWavBlobsAudioContext(blobs, onProgress);
    }
  }

  /**
   * High-Performance Direct Binary WAV Merger
   * Merges PCM data chunks directly without allocating massive WebAudio AudioBuffers.
   */
  static async combineWavBlobsBinary(blobs, onProgress) {
    const audioPcmChunks = [];
    let totalPcmBytes = 0;
    let headerArrayBuffer = null;

    for (let i = 0; i < blobs.length; i++) {
      if (onProgress) {
        onProgress({ statusText: `Merging audio part ${i + 1} of ${blobs.length}...` });
      }

      const arrayBuffer = await blobs[i].arrayBuffer();
      const view = new DataView(arrayBuffer);

      if (view.byteLength < 44) {
        throw new Error(`Part ${i + 1} is invalid WAV (too small)`);
      }

      // Check RIFF & WAVE header
      const isRiff = view.getUint8(0) === 0x52 && view.getUint8(1) === 0x49 && view.getUint8(2) === 0x46 && view.getUint8(3) === 0x46;
      const isWave = view.getUint8(8) === 0x57 && view.getUint8(9) === 0x41 && view.getUint8(10) === 0x56 && view.getUint8(11) === 0x45;

      if (!isRiff || !isWave) {
        throw new Error(`Part ${i + 1} is missing standard RIFF/WAVE header`);
      }

      // Find 'data' chunk
      let dataOffset = 12;
      let pcmSize = 0;
      while (dataOffset <= view.byteLength - 8) {
        const c1 = view.getUint8(dataOffset);
        const c2 = view.getUint8(dataOffset + 1);
        const c3 = view.getUint8(dataOffset + 2);
        const c4 = view.getUint8(dataOffset + 3);
        const chunkSize = view.getUint32(dataOffset + 4, true);

        if (c1 === 0x64 && c2 === 0x61 && c3 === 0x74 && c4 === 0x61) { // 'data'
          pcmSize = chunkSize;
          dataOffset += 8;
          break;
        }
        dataOffset += 8 + chunkSize;
      }

      if (pcmSize === 0 || dataOffset > view.byteLength) {
        dataOffset = 44;
        pcmSize = view.byteLength - 44;
      }

      if (!headerArrayBuffer) {
        headerArrayBuffer = arrayBuffer.slice(0, dataOffset);
      }

      const pcmBytes = new Uint8Array(arrayBuffer, dataOffset, Math.min(pcmSize, view.byteLength - dataOffset));
      audioPcmChunks.push(pcmBytes);
      totalPcmBytes += pcmBytes.byteLength;
    }

    if (!headerArrayBuffer || audioPcmChunks.length === 0) {
      throw new Error("Could not extract audio data from parts");
    }

    // Clone header and update RIFF total size and data chunk size
    const newHeaderBuffer = headerArrayBuffer.slice(0);
    const headerView = new DataView(newHeaderBuffer);

    const riffTotalSize = newHeaderBuffer.byteLength - 8 + totalPcmBytes;
    headerView.setUint32(4, Math.min(riffTotalSize, 0xFFFFFFFF), true);
    headerView.setUint32(newHeaderBuffer.byteLength - 4, Math.min(totalPcmBytes, 0xFFFFFFFF), true);

    return new Blob([newHeaderBuffer, ...audioPcmChunks], { type: 'audio/wav' });
  }

  /**
   * Fallback Web Audio API stitcher
   */
  static async combineWavBlobsAudioContext(blobs, onProgress) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const audioBuffers = [];

    for (let i = 0; i < blobs.length; i++) {
      if (onProgress) {
        onProgress({ statusText: `Decoding audio block ${i + 1} of ${blobs.length}...` });
      }
      const arrayBuffer = await blobs[i].arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioBuffers.push(audioBuffer);
    }

    if (onProgress) {
      onProgress({ statusText: "Stitching blocks..." });
    }
    
    const combinedBuffer = this.stitchAudioBuffers(audioBuffers, audioCtx);
    const wavBlob = this.audioBufferToWavBlob(combinedBuffer);

    try {
      if (audioCtx.state !== 'closed') audioCtx.close();
    } catch(e) {}

    return wavBlob;
  }

  /**
   * Fetches audio for a single chunk and decodes into AudioBuffer
   */
  static async fetchAndDecodeChunk(chunk, lang, audioCtx, retries = 2) {
    // Check for natural pause tags (e.g. [pause=1.0s] or [pause=0.5])
    const pauseMatch = chunk.match(/\[pause=([\d.]+)s?\]/i);
    if (pauseMatch) {
      const pauseSecs = parseFloat(pauseMatch[1]) || 0.5;
      const sampleRate = audioCtx.sampleRate || 44100;
      const length = Math.max(1, Math.ceil(pauseSecs * sampleRate));
      const silentBuffer = audioCtx.createBuffer(1, length, sampleRate);
      return silentBuffer;
    }

    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const cleanChunk = chunk.replace(/\[pause=[\d.]+s?\]/gi, '').trim();
        if (!cleanChunk) {
          const silentBuffer = audioCtx.createBuffer(1, 22050, audioCtx.sampleRate || 44100);
          return silentBuffer;
        }

        const primaryUrl = `https://lingva.ml/api/v1/audio/${lang}/${encodeURIComponent(cleanChunk)}`;
        const response = await fetch(primaryUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.audio && Array.isArray(data.audio)) {
            const uint8Array = new Uint8Array(data.audio);
            const arrayBuffer = uint8Array.buffer;
            return await audioCtx.decodeAudioData(arrayBuffer);
          }
        }

        // Fallback: direct Google Translate TTS endpoint
        const fallbackUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&q=${encodeURIComponent(cleanChunk)}&tl=${lang}`;
        const res = await fetch(fallbackUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          return await audioCtx.decodeAudioData(arrayBuffer);
        }

        throw new Error(`Both APIs failed. Lingva: ${response.status}, Google: ${res.status}`);
      } catch (err) {
        lastErr = err;
        console.warn(`Chunk fetch attempt ${attempt + 1} failed, retrying...`, err);
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, 1500 * (attempt + 1))); // Exponential backoff
        }
      }
    }
    throw new Error(`Failed to fetch audio after ${retries} retries: ` + lastErr.message);
  }

  /**
   * WEB AUDIO BUFFER STITCHER
   * Merges multiple AudioBuffers into a single continuous AudioBuffer without gaps or pops.
   */
  static stitchAudioBuffers(audioBuffers, audioCtx) {
    if (audioBuffers.length === 1) return audioBuffers[0];

    const sampleRate = audioBuffers[0].sampleRate;
    const numberOfChannels = Math.max(...audioBuffers.map(b => b.numberOfChannels));
    
    // Calculate total sample length
    const totalSampleLength = audioBuffers.reduce((sum, b) => sum + b.length, 0);

    // Create single merged AudioBuffer
    const combinedBuffer = audioCtx.createBuffer(numberOfChannels, totalSampleLength, sampleRate);

    // Copy PCM channel data
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const combinedChannelData = combinedBuffer.getChannelData(channel);
      let offset = 0;

      for (const buffer of audioBuffers) {
        const sourceData = buffer.numberOfChannels > channel 
          ? buffer.getChannelData(channel) 
          : buffer.getChannelData(0);

        combinedChannelData.set(sourceData, offset);
        offset += buffer.length;
      }
    }

    return combinedBuffer;
  }

  /**
   * Applies Pitch and Rate via OfflineAudioContext to convert Female to Male etc.
   */
  static async applyAcousticProfile(audioBuffer, pitch = 1.0, rate = 1.0) {
    if (pitch === 1.0 && rate === 1.0) return audioBuffer;

    const playbackRate = pitch * rate;
    const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    
    // Create offline context with the new duration
    const newDuration = audioBuffer.duration / playbackRate;
    const offlineCtx = new OfflineCtx(
      audioBuffer.numberOfChannels,
      Math.ceil(audioBuffer.sampleRate * newDuration),
      audioBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    
    // Add EQ processing based on pitch to simulate different voice styles
    // If pitch is low (Male), boost bass slightly for "Documentary/Dramatic" feel
    const lowShelf = offlineCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    
    if (pitch < 0.95) {
      lowShelf.gain.value = 5; // Boost bass for male voices
    } else if (pitch > 1.05) {
      lowShelf.gain.value = -2; // Reduce bass for higher/female voices
    } else {
      lowShelf.gain.value = 0;
    }

    source.connect(lowShelf);
    lowShelf.connect(offlineCtx.destination);
    
    source.start(0);

    return await offlineCtx.startRendering();
  }

  /**
   * Converts Web Audio AudioBuffer into a 16-bit PCM WAV Blob
   */
  static audioBufferToWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // 1 = Uncompressed PCM
    const bitDepth = 16;

    const interleavedData = this.interleaveChannels(audioBuffer);
    const dataByteLength = interleavedData.length * 2;
    const headerByteLength = 44;
    const totalBufferLength = headerByteLength + dataByteLength;

    const buffer = new ArrayBuffer(totalBufferLength);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataByteLength, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, format, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
    view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
    view.setUint16(34, bitDepth, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataByteLength, true);

    // Write 16-bit PCM samples
    let offset = 44;
    for (let i = 0; i < interleavedData.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, interleavedData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  static writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  static interleaveChannels(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numChannels;
    const result = new Float32Array(length);

    if (numChannels === 1) {
      return audioBuffer.getChannelData(0);
    }

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    let index = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        result[index++] = channels[ch][i];
      }
    }
    return result;
  }
}
