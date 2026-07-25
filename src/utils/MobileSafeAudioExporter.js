/**
 * Mobile Safe Audio Exporter & Touch Gesture Resumer
 * 
 * Ensures 100% instant file downloads on Android Chrome, iOS Safari & Desktop browsers.
 */

export class MobileSafeAudioExporter {
  static sharedAudioContext = null;

  static resumeAudioContext() {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!this.sharedAudioContext) {
          this.sharedAudioContext = new AudioCtx();
        }
        if (this.sharedAudioContext.state === 'suspended') {
          this.sharedAudioContext.resume();
        }
      }
    } catch (e) {
      console.warn('AudioContext resume warn:', e);
    }
  }

  static download(blob, filename = 'AetherVocal_Speech.mp3') {
    this.resumeAudioContext();

    if (!blob) return;

    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      console.error('Direct download error:', e);
    }
  }
}
