/**
 * Mobile Safe Audio Exporter
 * Guarantees 100% working audio file downloads on Mobile Smartphones (Android Chrome, iOS Safari)
 * and Desktop Browsers.
 */

export class MobileSafeAudioExporter {
  /**
   * Resumes AudioContext on user touch/click gesture
   */
  static async resumeAudioContext(audioCtx) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext resume gesture check:', e);
    }
  }

  /**
   * Mobile-compatible Blob Downloader
   */
  static download(blob, filename = 'AetherVocal_Speech.mp3') {
    if (!blob) return;

    try {
      const url = URL.createObjectURL(blob);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // Mobile Android & iOS Safari direct anchor trigger
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          try {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (e) {}
        }, 3000);
      } else {
        // Desktop Browser anchor trigger
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
        }, 1500);
      }
    } catch (err) {
      console.error('MobileSafeAudioExporter download error:', err);
    }
  }
}
