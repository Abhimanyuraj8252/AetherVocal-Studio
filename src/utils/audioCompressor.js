/**
 * AudioCompressor — Client-side audio compression for AetherVocal Studio
 * Supports WAV downsampling and WebM/Opus encoding via MediaRecorder API.
 */
export class AudioCompressor {

  /**
   * Compress a WAV blob by downsampling and converting to mono.
   * Achieves ~4x size reduction (48kHz stereo → 22kHz mono).
   * @param {Blob} wavBlob - Input WAV audio blob
   * @param {Object} options - { targetSampleRate: 22050, mono: true }
   * @returns {Promise<Blob>} Compressed WAV blob
   */
  static async compressWavBlob(wavBlob, options = {}) {
    const { targetSampleRate = 22050, mono = true } = options;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const arrayBuffer = await wavBlob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // If already at target quality, return as-is
      if (audioBuffer.sampleRate <= targetSampleRate && (audioBuffer.numberOfChannels === 1 || !mono)) {
        return wavBlob;
      }

      const numChannels = mono ? 1 : audioBuffer.numberOfChannels;
      const duration = audioBuffer.duration;
      const offlineCtx = new OfflineAudioContext(
        numChannels,
        Math.ceil(duration * targetSampleRate),
        targetSampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      return AudioCompressor.audioBufferToWavBlob(renderedBuffer);
    } finally {
      await audioCtx.close();
    }
  }

  /**
   * Encode a WAV blob to compressed WebM/Opus format using MediaRecorder API.
   * Achieves ~10-15x size reduction vs raw WAV.
   * Falls back to WAV compression if MediaRecorder doesn't support Opus.
   * @param {Blob} wavBlob - Input WAV audio blob
   * @param {Object} options - { audioBitsPerSecond: 64000 }
   * @returns {Promise<Blob>} Compressed WebM/Opus blob
   */
  static async encodeToCompressedFormat(wavBlob, options = {}) {
    const { audioBitsPerSecond = 64000 } = options;
    const mimeType = 'audio/webm;codecs=opus';

    // Fallback if MediaRecorder doesn't support opus
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported(mimeType)) {
      console.warn('MediaRecorder opus not supported, falling back to WAV compression');
      return AudioCompressor.compressWavBlob(wavBlob);
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const arrayBuffer = await wavBlob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Create MediaStream from AudioBuffer
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(dest);

      return new Promise((resolve, reject) => {
        const recorder = new MediaRecorder(dest.stream, {
          mimeType,
          audioBitsPerSecond
        });

        const recordedChunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunks.push(e.data);
        };

        recorder.onstop = () => {
          const compressedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
          resolve(compressedBlob);
        };

        recorder.onerror = (e) => {
          console.warn('MediaRecorder error, falling back:', e);
          AudioCompressor.compressWavBlob(wavBlob).then(resolve).catch(reject);
        };

        source.onended = () => {
          // Small delay to ensure all audio data is captured
          setTimeout(() => {
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }, 150);
        };

        recorder.start();
        source.start(0);
      });
    } catch (err) {
      console.warn('Opus encoding failed, falling back to WAV compression:', err);
      return AudioCompressor.compressWavBlob(wavBlob);
    } finally {
      // Note: audioCtx.close() is handled after the promise resolves implicitly
      // We don't close it here because the MediaRecorder may still be using it
    }
  }

  /**
   * Convert an AudioBuffer to a 16-bit PCM WAV Blob.
   * @param {AudioBuffer} audioBuffer
   * @returns {Blob}
   */
  static audioBufferToWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = audioBuffer.length * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const buffer = new ArrayBuffer(totalLength);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true);  // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Interleave channels and write PCM samples
    const channels = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(audioBuffer.getChannelData(c));
    }

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const sample = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Get human-readable compression statistics.
   * @param {number} originalSize - Original size in bytes
   * @param {number} compressedSize - Compressed size in bytes
   * @returns {{ originalFormatted: string, compressedFormatted: string, reductionPercent: number, summary: string }}
   */
  static getCompressionStats(originalSize, compressedSize) {
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    const formatSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    };
    return {
      originalFormatted: formatSize(originalSize),
      compressedFormatted: formatSize(compressedSize),
      reductionPercent: parseFloat(reduction),
      summary: `${formatSize(originalSize)} → ${formatSize(compressedSize)} (${reduction}% smaller)`
    };
  }
}

/** Helper to write ASCII string into DataView */
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
