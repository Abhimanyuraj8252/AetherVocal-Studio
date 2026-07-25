const FORMAT_TO_MIME = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
  m4a: 'audio/mp4'
};

const MIME_TO_EXT = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/oga': 'ogg',
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/aac': 'm4a'
};

function normalizeMimeType(mimeType = '') {
  return mimeType.split(';')[0].trim().toLowerCase();
}

function detectErrorMessageFromText(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 'TTS service returned an empty response instead of audio.';

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed.error || parsed.message || parsed.detail || JSON.stringify(parsed);
    } catch (error) {
      return trimmed.slice(0, 300);
    }
  }

  if (/<html|<!doctype/i.test(trimmed)) {
    return 'TTS service returned HTML instead of audio.';
  }

  return trimmed.slice(0, 300);
}

async function coerceToAudioBlob(source, { preferredFormat = 'webm' } = {}) {
  if (!source) {
    throw new Error('No audio payload was returned.');
  }

  if (typeof Response !== 'undefined' && source instanceof Response) {
    const contentType = normalizeMimeType(source.headers.get('content-type') || '');
    console.log('[AetherVocal] TTS response', {
      ok: source.ok,
      status: source.status,
      statusText: source.statusText,
      contentType
    });

    if (!source.ok) {
      const text = await source.text();
      throw new Error(`TTS request failed (${source.status} ${source.statusText}): ${detectErrorMessageFromText(text)}`);
    }

    if (contentType && !contentType.startsWith('audio/')) {
      const bodyText = await source.text();
      throw new Error(`Expected audio response but received ${contentType || 'unknown content type'}: ${detectErrorMessageFromText(bodyText)}`);
    }

    const arrayBuffer = await source.arrayBuffer();
    const mimeType = contentType || FORMAT_TO_MIME[preferredFormat] || 'audio/webm';
    return new Blob([arrayBuffer], { type: mimeType });
  }

  if (source instanceof Blob) {
    const mimeType = normalizeMimeType(source.type || '');
    console.log('[AetherVocal] Audio blob received', { size: source.size, type: mimeType || source.type || 'unknown' });

    if (source.size === 0) {
      throw new Error('The recorded audio blob is empty.');
    }

    if (mimeType && !mimeType.startsWith('audio/')) {
      const preview = await source.slice(0, 512).text().catch(() => '');
      throw new Error(`Expected audio blob but received ${mimeType}: ${detectErrorMessageFromText(preview)}`);
    }

    return source;
  }

  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
    const mimeType = FORMAT_TO_MIME[preferredFormat] || 'audio/webm';
    return new Blob([source], { type: mimeType });
  }

  if (typeof source === 'string') {
    const dataUrlMatch = source.match(/^data:([^;]+);base64,(.*)$/i);
    if (dataUrlMatch) {
      const mimeType = normalizeMimeType(dataUrlMatch[1] || FORMAT_TO_MIME[preferredFormat] || 'audio/webm');
      const binary = atob(dataUrlMatch[2]);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
      }
      return new Blob([bytes], { type: mimeType });
    }

    try {
      const binary = atob(source.replace(/\s+/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
      }
      return new Blob([bytes], { type: FORMAT_TO_MIME[preferredFormat] || 'audio/webm' });
    } catch (error) {
      throw new Error('Unsupported string payload for audio export.');
    }
  }

  throw new Error(`Unsupported audio payload type: ${Object.prototype.toString.call(source)}`);
}

export function getAudioExtensionFromMimeType(mimeType = '') {
  const normalized = normalizeMimeType(mimeType);
  return MIME_TO_EXT[normalized] || 'webm';
}

export function downloadAudioBlob(blob, filename = 'aethervocal_speech.webm') {
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('downloadAudioBlob expected a Blob.');
  }

  console.log('[AetherVocal] downloading audio blob', {
    size: blob.size,
    type: blob.type || 'unknown',
    filename
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1200);
}

/**
 * Export captured audio when available.
 * If capture is empty, fail clearly instead of fabricating tone audio.
 */
export async function convertAndExportAudio({ chunksBlob, text = '', pitch = 1.0, rate = 1.0, estimatedSeconds = 5, format = 'webm', profile = null }) {
  const sourceBlob = await coerceToAudioBlob(chunksBlob, { preferredFormat: format });

  if (!sourceBlob || sourceBlob.size === 0) {
    throw new Error('No audio was captured. Use the AetherVocal Playback tab for export, then share that tab with audio enabled.');
  }

  const actualMimeType = normalizeMimeType(sourceBlob.type || FORMAT_TO_MIME[format] || 'audio/webm');
  const resolvedFormat = getAudioExtensionFromMimeType(actualMimeType);
  const desiredMimeType = FORMAT_TO_MIME[format] || actualMimeType;

  if (desiredMimeType !== actualMimeType) {
    console.warn('[AetherVocal] Requested format does not match the captured audio format. Using the recorded audio type instead.', {
      requestedFormat: format,
      desiredMimeType,
      actualMimeType,
      resolvedFormat
    });
  }

  return {
    blob: sourceBlob,
    filename: `AetherVocal_Speech.${resolvedFormat}`,
    format: resolvedFormat,
    mimeType: actualMimeType,
    requestedFormat: format,
    warning: desiredMimeType !== actualMimeType
      ? `Captured audio was saved as ${resolvedFormat.toUpperCase()} because the browser recorded ${actualMimeType}.`
      : ''
  };
}
