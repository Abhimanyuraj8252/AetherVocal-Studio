import { WebSpeechAudioStreamCapturer } from './WebSpeechAudioStreamCapturer';

export function downloadAudioBlob(blob, filename = 'AetherVocal_Speech.mp3') {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {}
    }, 1200);
  } catch (err) {
    console.error('Download audio error:', err);
  }
}

/**
 * Universal Multi-Format Audio Exporter.
 * It only packages real captured audio. If capture is empty, it throws.
 */
export async function convertAndExportAudio({ chunksBlob, text, pitch = 1.0, rate = 1.0, estimatedSeconds = 5, format = 'mp3' }) {
  const ext = format === 'wav' ? 'wav' : format === 'ogg' ? 'ogg' : 'mp3';
  const mimeType = format === 'wav' ? 'audio/wav' : format === 'ogg' ? 'audio/ogg' : 'audio/mp3';

  if (chunksBlob && chunksBlob.size > 1500) {
    return {
      blob: new Blob([chunksBlob], { type: mimeType }),
      filename: `AetherVocal_Speech.${ext}`,
      format: ext
    };
  }

  throw new Error('No valid audio was captured. Open the playback popup on desktop and share that tab with audio enabled.');
}
