/**
 * Text Sanitizer & Timestamp Stripper Utility for AetherVocal Studio
 */

/**
 * Detects and removes timestamps from script text.
 * Handles formats like:
 * - YouTube/Podcast timecodes: [01:23], (12:34), 01:23:45, 05:12
 * - SRT/VTT subtitle timecodes: 00:00:12,000 --> 00:00:15,000
 * - Timestamp lines at start of paragraphs: 01:23 - Hello world
 */
export function stripTimestamps(text) {
  if (!text) return '';

  return text
    // Remove SRT / VTT subtitle header & timestamps
    .replace(/^WEBVTT.*$/gm, '')
    .replace(/^\d+\s*\r?\n\d\d:\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d:\d\d[.,]\d{3}.*$/gm, '')
    .replace(/\d\d:\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d:\d\d[.,]\d{3}/g, '')
    .replace(/\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d[.,]\d{3}/g, '')
    // Remove Bracketed Timecodes: [00:12], [01:23:45], (12:34)
    .replace(/\[\s*\d{1,2}:\d{2}(?::\d{2})?\s*\]/g, '')
    .replace(/\(\s*\d{1,2}:\d{2}(?::\d{2})?\s*\)/g, '')
    // Remove standalone timecodes at start of line or before hyphen/colon (e.g. "01:23 -", "12:34:")
    .replace(/^\s*\d{1,2}:\d{2}(?::\d{2})?\s*[-:]?\s*/gm, '')
    // Remove inline standalone HH:MM:SS or MM:SS timecodes surrounded by spaces
    .replace(/\s\d{1,2}:\d{2}(?::\d{2})?\b/g, '')
    // Remove HTML tags in subtitles like <i>, <b>
    .replace(/<[^>]*>/g, '')
    // Clean excessive empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generates a safe, descriptive filename based on script text for cross-platform support (Android, iOS, Windows, macOS, Linux).
 */
export function generateSafeFilename(text, tag = '', ext = 'mp3') {
  let cleanTitle = 'AetherVocal';
  if (text && typeof text === 'string') {
    // Strip timestamps, markdown, pause tags, code blocks
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[\s*pause=\d+(?:\.\d+)?s\s*\]/gi, '')
      .replace(/\[\s*\d{1,2}:\d{2}(?::\d{2})?\s*\]/g, '')
      .replace(/[#*~_`^|\\{}[\]$%&=+<>?/\\:*"<>|.,!?;:()]/g, ' ')
      .replace(/\s+/g, '_')
      .trim();

    // Take first 30 chars
    const snippet = cleanText.slice(0, 30).replace(/^_+|_+$/g, '');
    if (snippet.length > 0) {
      cleanTitle = `AetherVocal_${snippet}`;
    }
  }

  // Remove any remaining characters illegal in OS filenames (\ / : * ? " < > |)
  cleanTitle = cleanTitle.replace(/[\\/:*?"<>|]/g, '_').replace(/_+/g, '_');
  const safeTag = tag ? `_${tag}` : '';
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;

  return `${cleanTitle}${safeTag}${cleanExt}`;
}


/**
 * Counts detected timestamps in the text.
 */
export function countTimestamps(text) {
  if (!text) return 0;
  const timestampRegex = /(?:\[\s*\d{1,2}:\d{2}(?::\d{2})?\s*\]|\(\s*\d{1,2}:\d{2}(?::\d{2})?\s*\)|\b\d{1,2}:\d{2}(?::\d{2})?\b|\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d[.,]\d{3})/g;
  const matches = text.match(timestampRegex);
  return matches ? matches.length : 0;
}

/**
 * Sanitizes markdown tags, code blocks, and weird symbols while preserving Devanagari/English text & standard punctuation.
 */
export function sanitizeScript(text) {
  if (!text) return '';

  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove markdown headers #, bold/italic *, _, ~, backticks `, braces {}, brackets [], angle brackets <>
    .replace(/[#*~_`^|\\{}[\]$%&=+<>]/g, ' ')
    // Replace multiple spaces or tabs with single space
    .replace(/[ \t]+/g, ' ')
    // Fix multiple empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
