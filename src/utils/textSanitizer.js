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
