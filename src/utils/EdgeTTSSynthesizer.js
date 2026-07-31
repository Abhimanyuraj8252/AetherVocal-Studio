import { CloudSpeechSynthesizer } from './CloudSpeechSynthesizer';

/**
 * A browser-side Text-to-Speech synthesizer using the Microsoft Edge TTS WebSocket API.
 */
export default class EdgeTTSSynthesizer {
  /**
   * Main synthesis method that splits text into chunks, synthesizes them, and stitches the audio.
   *
   * @param {string} text - The text to synthesize.
   * @param {Object} options - Synthesis options.
   * @param {string} options.voice - The Edge TTS voice name (e.g., 'en-US-JennyNeural').
   * @param {string} options.lang - The language code (e.g., 'en-US').
   * @param {number} [options.pitch=1.0] - Pitch multiplier (e.g., 1.0 is default).
   * @param {number} [options.rate=1.0] - Rate multiplier (e.g., 1.0 is default).
   * @param {function} [options.onProgress] - Callback for progress updates.
   * @param {number} [options.startIndex=0] - Starting chunk index.
   * @param {number} [options.maxChunks=20] - Maximum number of chunks to process.
   * @returns {Promise<Object>} An object containing { wavBlob, endIndex, isComplete }.
   */
  static async synthesize(text, options = {}) {
    const {
      voice = 'en-US-AriaNeural',
      lang = 'en-US',
      pitch = 1.0,
      rate = 1.0,
      onProgress,
      startIndex = 0,
      maxChunks = 20,
    } = options;

    // Split text into chunks using CloudSpeechSynthesizer's smart chunking
    const allChunks = CloudSpeechSynthesizer.smartChunkText(text, 180);
    const totalChunks = allChunks.length;
    
    // Slice chunks for the current processing batch
    const endIndex = Math.min(startIndex + maxChunks, totalChunks);
    const chunksToProcess = allChunks.slice(startIndex, endIndex);

    const audioBuffers = [];
    const totalToProcess = chunksToProcess.length;

    for (let i = 0; i < totalToProcess; i++) {
      const chunk = chunksToProcess[i];
      const currentIndex = startIndex + i;
      
      try {
        // Synthesize the individual chunk
        const buffer = await this.synthesizeChunk(chunk, voice, lang, rate, pitch);
        if (buffer) {
          audioBuffers.push(buffer);
        }

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: totalToProcess,
            percent: Math.round(((i + 1) / totalToProcess) * 100),
            statusText: `Synthesizing chunk ${currentIndex + 1} of ${totalChunks}`,
          });
        }

        // Add a 1-second delay between chunks to avoid rate limiting
        if (i < totalToProcess - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to synthesize chunk ${currentIndex}:`, error);
        throw error;
      }
    }

    let wavBlob = null;
    if (audioBuffers.length > 0) {
      // Stitch audio buffers using a shared AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const stitchedBuffer = CloudSpeechSynthesizer.stitchAudioBuffers(audioBuffers, audioCtx);
      wavBlob = CloudSpeechSynthesizer.audioBufferToWavBlob(stitchedBuffer);
      try { if (audioCtx.state !== 'closed') audioCtx.close(); } catch(e) {}
    }

    const isComplete = endIndex >= totalChunks;

    return {
      wavBlob,
      endIndex,
      isComplete,
    };
  }

  /**
   * Synthesizes a single text chunk via the Edge TTS WebSocket API, with retries.
   */
  static async synthesizeChunk(text, voice, lang, rate, pitch, retryCount = 0) {
    const MAX_RETRIES = 2;
    
    try {
      return await this._synthesizeChunkAttempt(text, voice, lang, rate, pitch);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Retry ${retryCount + 1} for chunk synthesis:`, error);
        await new Promise((resolve) => setTimeout(resolve, 2000 * (retryCount + 1)));
        return this.synthesizeChunk(text, voice, lang, rate, pitch, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Internal method to attempt synthesizing a chunk once.
   */
  static async _synthesizeChunkAttempt(text, voice, lang, rate, pitch) {
    // 1. Try Vercel Serverless Function API endpoint first (/api/edge-tts)
    try {
      const response = await fetch('/api/edge-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, lang, rate, pitch }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContextClass();
          const decoded = await audioContext.decodeAudioData(arrayBuffer);
          try { if (audioContext.state !== 'closed') audioContext.close(); } catch(e) {}
          return decoded;
        }
      }
    } catch (apiErr) {
      console.warn('Serverless API /api/edge-tts unavailable, falling back to local WebSocket proxy:', apiErr.message);
    }

    // 2. Fallback to local Vite WebSocket proxy for dev environment
    const secGec = await this.generateSecMsGec();
    const secGecVer = '1-143.0.3644.0';

    return new Promise((resolve, reject) => {
      const connectionId = this.generateUUID();
      const isSecure = window.location.protocol === 'https:';
      const wsProtocol = isSecure ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/edge-tts/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}&Sec-MS-GEC=${secGec}&Sec-MS-GEC-Version=${secGecVer}`;
      
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';

      const timeoutId = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timed out after 30 seconds.'));
      }, 30000);

      const audioDataChunks = [];

      ws.onopen = () => {
        const configMessage = 
          "Content-Type:application/json; charset=utf-8\r\n" +
          "Path:speech.config\r\n\r\n" +
          '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}';
        ws.send(configMessage);

        const escapedText = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        const requestId = this.generateUUID();
        const timestamp = this.getTimestamp();

        const ssmlMessage = 
          `X-RequestId:${requestId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${timestamp}\r\n` +
          `Path:ssml\r\n\r\n` +
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'>` +
          `<voice name='${voice}'>` +
          `<prosody pitch='+0Hz' rate='+0%' volume='+0%'>${escapedText}</prosody>` +
          `</voice></speak>`;

        ws.send(ssmlMessage);
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) {
          const buffer = new Uint8Array(event.data);
          if (buffer.length >= 2) {
            const headerLength = (buffer[0] << 8) | buffer[1];
            if (buffer.length >= 2 + headerLength) {
              const audioData = buffer.slice(2 + headerLength);
              if (audioData.length > 0) {
                audioDataChunks.push(audioData);
              }
            }
          }
        } else if (typeof event.data === 'string') {
          if (event.data.includes('Path:turn.end')) {
            clearTimeout(timeoutId);
            ws.close();

            try {
              const totalLength = audioDataChunks.reduce((acc, val) => acc + val.length, 0);
              const combinedArray = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of audioDataChunks) {
                combinedArray.set(chunk, offset);
                offset += chunk.length;
              }

              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const audioBuffer = await audioContext.decodeAudioData(combinedArray.buffer);
              try { if (audioContext.state !== 'closed') audioContext.close(); } catch(e) {}
              resolve(audioBuffer);
            } catch (err) {
              reject(new Error('Failed to decode audio data: ' + err.message));
            }
          }
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeoutId);
        reject(new Error('WebSocket error occurred'));
      };
      
      ws.onclose = (event) => {
        clearTimeout(timeoutId);
        if (audioDataChunks.length === 0 && event.code !== 1000) {
          reject(new Error(`WebSocket closed prematurely (code: ${event.code})`));
        }
      };
    });
  }

  /**
   * Generates the Sec-MS-GEC token required by Microsoft Edge TTS endpoints.
   */
  static async generateSecMsGec() {
    const WIN_EPOCH = 11644473600;
    const S_TO_NS = 1e9;
    let ticks = Date.now() / 1000;
    ticks += WIN_EPOCH;
    ticks -= ticks % 300;
    ticks *= S_TO_NS / 100;
    const strToHash = `${Math.floor(ticks)}6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
    const encoder = new TextEncoder();
    const data = encoder.encode(strToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  /**
   * Generates a random UUID string without hyphens.
   *
   * @returns {string} The UUID string.
   */
  static generateUUID() {
    return crypto.randomUUID().replace(/-/g, '');
  }

  /**
   * Returns an ISO timestamp string in the format expected by Edge TTS.
   *
   * @returns {string} The timestamp string.
   */
  static getTimestamp() {
    return new Date().toISOString();
  }
}
