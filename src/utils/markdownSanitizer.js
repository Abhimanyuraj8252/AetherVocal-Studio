/**
 * Markdown & Special Symbol Sanitizer Utility
 * Completely removes Markdown formatting symbols (#, *, _, ~, `, >, -, +, links, code blocks, emojis)
 * to guarantee that speech synthesis reads only pure clean spoken words.
 */

export function sanitizeMarkdown(input) {
  if (!input) return '';

  let text = input;

  // 1. Remove code blocks (```code``` and `code`)
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 2. Convert markdown headers (# Title -> Title.)
  text = text.replace(/^(?:#+)\s*(.*?)$/gm, '$1.');

  // 3. Remove images ![alt](url) -> alt
  text = text.replace(/!\[(.*?)\]\(.*?\)/g, '$1');

  // 4. Convert links [text](url) -> text
  text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // 5. Remove bold & italics (***text***, **text**, *text*, ___text___, __text__, _text_)
  text = text.replace(/(\*\*|__|[*_])(.*?)\1/g, '$2');

  // 6. Remove strikethrough (~~text~~)
  text = text.replace(/~~(.*?)~~/g, '$1');

  // 7. Replace blockquotes (> text)
  text = text.replace(/^\s*>\s*(.*?)$/gm, '$1.');

  // 8. Replace bullet lists (* item, - item, + item)
  text = text.replace(/^\s*[*+-]\s+/gm, '');

  // 9. Replace numbered lists (1. item -> item)
  text = text.replace(/^\s*\d+\.\s+/gm, '');

  // 10. Replace horizontal rules (---, ***, ___)
  text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, ' ');

  // 11. Remove HTML tags (<p>, <b>, etc.)
  text = text.replace(/<[^>]*>/g, ' ');

  // 12. Strict symbol cleanup: remove all non-alphanumeric punctuation symbols except basic sentence breaks (. , ? ! ।)
  text = text.replace(/[#*~_`^|\\{}[\]@$%&=+<>/]/g, ' ');

  // 13. Remove decorative emojis that might cause speech hiccups
  text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

  // 14. Normalize multiple spaces and line breaks
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{2,}/g, '\n\n');
  return text.trim();
}

/**
 * Ultra-strict Speech Cleaner: Pre-processes text right before synthesis.
 * Strips any residual markdown or special characters so audio engine reads 0 symbols!
 */
export function strictSpeechClean(input) {
  if (!input) return '';
  let cleaned = sanitizeMarkdown(input);
  // Strip any remaining rogue punctuation that speech engines pronounce literally
  cleaned = cleaned.replace(/[*_#~`\\/^{}<>]/g, '');
  return cleaned.trim();
}

export function detectMarkdownSymbols(text) {
  if (!text) return false;
  const markdownRegex = /(^#+\s|[*_~`#>]|\[.*?\]\(.*?\)|```)/m;
  return markdownRegex.test(text);
}
