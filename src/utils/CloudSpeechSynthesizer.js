/**
 * Cloud Speech Synthesizer — High Quality AI Voice Engine
 * 
 * Uses Lingva Translate (Google TTS Engine) to generate high-quality
 * natural speech. Works on all devices including Mobile Safari/Chrome.
 * 
 * Features:
 * 1. Automatic text chunking for long text support.
 * 2. MP3 audio byte array streaming and compilation.
 * 3. Perfect fallback for browsers that block native recording.
 */

export class CloudSpeechSynthesizer {
  /**
   * Generates high quality speech and returns an MP3 Blob.
   * @param {string} text - The text to synthesize
   * @param {Object} options - voice options (gender, pitch, rate)
   * @returns {Promise<Blob>} MP3 Audio Blob
   */
  static async synthesize(text, options = {}) {
    // Determine language based on selected profile or text content
    // 'hi' for Hindi, 'en' for English
    const isHindi = /[\u0900-\u097F]/.test(text);
    const lang = isHindi ? 'hi' : 'en';

    // Split text into chunks to prevent URL length limits (Max ~200 chars per chunk)
    const chunks = this.chunkText(text, 200);
    const audioBuffers = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (!chunk) continue;

      try {
        const url = `https://lingva.ml/api/v1/audio/${lang}/${encodeURIComponent(chunk)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Cloud TTS API failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.audio && Array.isArray(data.audio)) {
          // Convert byte array to Uint8Array
          const uint8Array = new Uint8Array(data.audio);
          audioBuffers.push(uint8Array);
        }
      } catch (err) {
        console.error(`Error generating chunk ${i + 1}:`, err);
        // Continue with other chunks if one fails, or break
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error("Failed to generate any audio data from the cloud engine.");
    }

    // Combine all Uint8Array chunks into one single array
    const totalLength = audioBuffers.reduce((acc, val) => acc + val.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const buffer of audioBuffers) {
      combinedArray.set(buffer, offset);
      offset += buffer.length;
    }

    // Return the combined array as an MP3 Blob
    return new Blob([combinedArray], { type: 'audio/mpeg' });
  }

  /**
   * Splits text into smaller chunks at natural sentence boundaries
   */
  static chunkText(text, maxLength) {
    const chunks = [];
    // Split by common punctuation marks
    const sentences = text.match(/[^.!?।]+[.!?।]+/g) || [text];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += ' ' + sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        
        // If a single sentence is still too long, chunk by words
        if (sentence.length > maxLength) {
          const words = sentence.split(' ');
          let tempChunk = '';
          for (const word of words) {
            if ((tempChunk + ' ' + word).length <= maxLength) {
              tempChunk += ' ' + word;
            } else {
              if (tempChunk) chunks.push(tempChunk.trim());
              tempChunk = word;
            }
          }
          currentChunk = tempChunk;
        } else {
          currentChunk = sentence;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}
