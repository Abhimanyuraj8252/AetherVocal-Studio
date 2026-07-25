/**
 * Intelligent Text Chunker & Stats Utility
 * Splits arbitrary length text into optimal sentence-level chunks for SpeechSynthesis.
 * Prevents browser speech synthesis cutoff bugs on long utterances.
 */

export function chunkText(text, maxChunkLength = 200) {
  if (!text || typeof text !== 'string') return [];

  // Normalize newlines
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  // Sentence split regex supporting both English (. ? !) and Hindi (। ? !)
  const sentenceDelimiterRegex = /([.?!।]\s+|\n+)/;
  const rawParts = cleaned.split(sentenceDelimiterRegex);

  const sentences = [];
  let currentSentence = '';

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (!part) continue;

    // Check if this part is a delimiter
    if (/^[.?!।]\s*$/.test(part) || /^\n+$/.test(part)) {
      currentSentence += part;
      sentences.push(currentSentence.trim());
      currentSentence = '';
    } else {
      if (currentSentence) {
        currentSentence += ' ' + part;
      } else {
        currentSentence = part;
      }
    }
  }

  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  // Combine small sentences into chunks up to maxChunkLength
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (!sentence) continue;

    // If a single sentence is exceptionally long, hard break it by words
    if (sentence.length > maxChunkLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      const wordChunks = splitLongSentence(sentence, maxChunkLength);
      chunks.push(...wordChunks);
      continue;
    }

    if ((currentChunk + ' ' + sentence).length <= maxChunkLength) {
      currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 0);
}

function splitLongSentence(sentence, maxLength) {
  const words = sentence.split(/\s+/);
  const result = [];
  let temp = '';

  for (const word of words) {
    if ((temp + ' ' + word).length <= maxLength) {
      temp = temp ? `${temp} ${word}` : word;
    } else {
      if (temp) result.push(temp);
      temp = word;
    }
  }
  if (temp) result.push(temp);
  return result;
}

export function calculateTextStats(text, rate = 1.0) {
  if (!text) {
    return { charCount: 0, wordCount: 0, estimatedSeconds: 0, formattedTime: '00:00' };
  }

  const charCount = text.length;
  // Word count split handling spaces and devanagari script
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Average speaking rate: ~140 words per minute at 1.0x rate
  const wordsPerMinute = 140 * rate;
  const estimatedSeconds = Math.ceil((wordCount / (wordsPerMinute || 140)) * 60);

  const mins = Math.floor(estimatedSeconds / 60);
  const secs = estimatedSeconds % 60;
  
  let formattedTime = '';
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    formattedTime = `${hours}h ${remMins}m ${secs}s`;
  } else if (mins > 0) {
    formattedTime = `${mins}m ${secs}s`;
  } else {
    formattedTime = `${secs}s`;
  }

  return {
    charCount,
    wordCount,
    estimatedSeconds,
    formattedTime
  };
}
