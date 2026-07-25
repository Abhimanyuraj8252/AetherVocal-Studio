/**
 * Speech Audio Stream Interceptor
 * Records live speech utterances synthesized by window.speechSynthesis,
 * capturing TRUE spoken audio of text scripts into downloadable audio blobs.
 */

export class SpeechAudioStreamRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.audioContext = null;
    this.isRecording = false;
  }

  async start() {
    this.audioChunks = [];
    this.isRecording = true;

    try {
      // 1. Initialize Web Audio Context & Stream Destination
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      const destination = this.audioContext.createMediaStreamDestination();
      this.stream = destination.stream;

      // 2. Determine best supported recording mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const options = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
    } catch (err) {
      console.warn('SpeechAudioStreamRecorder init fallback:', err);
    }
  }

  stop() {
    return new Promise((resolve) => {
      this.isRecording = false;

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        if (this.audioChunks.length > 0) {
          const blob = new Blob(this.audioChunks, { type: this.audioChunks[0].type || 'audio/webm' });
          resolve(blob);
        } else {
          resolve(null);
        }
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });

        if (this.audioContext) {
          try { this.audioContext.close(); } catch (e) {}
        }

        resolve(blob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        resolve(null);
      }
    });
  }
}
