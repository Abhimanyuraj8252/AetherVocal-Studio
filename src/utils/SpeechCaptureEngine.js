/**
 * Speech Capture Engine — Real Browser Speech Audio Recorder
 *
 * Records actual speech synthesis audio output from the browser tab
 * using the Screen Capture API (getDisplayMedia with audio).
 *
 * This replaces the old Math.sin() oscillator approach that produced
 * robotic laser/buzzing sounds instead of real speech.
 *
 * Flow:
 *   1. Request tab audio capture via getDisplayMedia
 *   2. Start MediaRecorder on the audio stream
 *   3. Speak text via SpeechSynthesis API
 *   4. When speech ends → stop recording → return audio blob
 *
 * Browser Support:
 *   ✅ Chrome/Edge 109+ (desktop) — full support with preferCurrentTab
 *   ⚠️ Firefox — partial (may not capture tab audio)
 *   ❌ Safari / Mobile browsers — not supported
 */

export class SpeechCaptureEngine {
  /**
   * Check if tab audio capture is supported in this browser
   */
  static isSupported() {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === 'function' &&
      typeof MediaRecorder !== 'undefined' &&
      typeof window !== 'undefined' &&
      window.speechSynthesis
    );
  }

  /**
   * Records actual speech synthesis audio and returns a downloadable blob.
   *
   * @param {string} text — The text to speak and record
   * @param {SpeechSynthesisVoice|null} voice — Browser speech voice to use
   * @param {number} pitch — Speech pitch (0.1 to 2.0)
   * @param {number} rate — Speech rate (0.1 to 2.0)
   * @returns {Promise<{blob: Blob, mimeType: string, extension: string}>}
   */
  static async captureSpokenAudio(text, voice = null, pitch = 1.0, rate = 1.0) {
    if (!text || !text.trim()) {
      throw new Error('EMPTY_TEXT');
    }

    // Step 1: Request tab audio capture
    let displayStream;
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,           // Required by spec (some browsers need a video track)
        audio: true,           // Capture tab audio
        preferCurrentTab: true, // Chrome 109+: auto-select current tab
        selfBrowserSurface: 'include' // Chrome 116+: include current tab in picker
      });
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw new Error('PERMISSION_DENIED');
      }
      throw new Error('CAPTURE_FAILED');
    }

    // Step 2: Remove video tracks (we only want audio)
    displayStream.getVideoTracks().forEach(track => track.stop());
    const audioTracks = displayStream.getAudioTracks();

    if (audioTracks.length === 0) {
      displayStream.getTracks().forEach(t => t.stop());
      throw new Error('NO_AUDIO_TRACK');
    }

    const audioStream = new MediaStream(audioTracks);

    // Step 3: Setup MediaRecorder with best available codec
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else {
        mimeType = ''; // Let browser decide
      }
    }

    const recorderOptions = mimeType ? { mimeType } : {};
    const recorder = new MediaRecorder(audioStream, recorderOptions);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    // Step 4: Start recording
    recorder.start(100); // Collect data every 100ms

    // Step 5: Speak the text via SpeechSynthesis
    try {
      await new Promise((resolve, reject) => {
        // Ensure synthesis is ready
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        utterance.pitch = Math.max(0.1, Math.min(2.0, pitch));
        utterance.rate = Math.max(0.1, Math.min(2.0, rate));

        utterance.onend = () => {
          // Small delay to capture trailing audio
          setTimeout(resolve, 400);
        };

        utterance.onerror = (event) => {
          // Still resolve — we might have partial audio
          console.warn('SpeechSynthesis error during capture:', event.error);
          setTimeout(resolve, 400);
        };

        window.speechSynthesis.speak(utterance);

        // Safety timeout: max 5 minutes of recording
        setTimeout(() => {
          resolve();
        }, 5 * 60 * 1000);
      });
    } catch (speechErr) {
      console.warn('Speech error during capture:', speechErr);
    }

    // Step 6: Stop recording and collect the blob
    const blob = await new Promise((resolve) => {
      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || mimeType || 'audio/webm';
        resolve(new Blob(chunks, { type: finalMimeType }));
      };

      if (recorder.state !== 'inactive') {
        recorder.stop();
      } else {
        const finalMimeType = recorder.mimeType || mimeType || 'audio/webm';
        resolve(new Blob(chunks, { type: finalMimeType }));
      }
    });

    // Step 7: Clean up all tracks
    audioStream.getTracks().forEach(track => track.stop());

    // Determine file extension from MIME type
    let extension = 'webm';
    const blobType = blob.type || '';
    if (blobType.includes('mp4') || blobType.includes('m4a')) {
      extension = 'm4a';
    } else if (blobType.includes('ogg')) {
      extension = 'ogg';
    }

    return {
      blob,
      mimeType: blob.type || 'audio/webm',
      extension
    };
  }

  /**
   * Get a user-friendly error message from an error code
   */
  static getErrorMessage(error) {
    const msg = error?.message || error || '';

    switch (msg) {
      case 'EMPTY_TEXT':
        return 'कोई टेक्स्ट नहीं है। कृपया पहले टेक्स्ट लिखें।';

      case 'PERMISSION_DENIED':
        return 'Tab audio sharing denied हो गया। Save करने के लिए:\n' +
               '1. Save button दबाएं\n' +
               '2. "This Tab" (यह Tab) चुनें\n' +
               '3. "Share tab audio" checkbox ON करें\n' +
               '4. "Share" पर click करें';

      case 'CAPTURE_FAILED':
        return 'Audio capture failed। कृपया Chrome Desktop browser use करें।';

      case 'NO_AUDIO_TRACK':
        return 'Audio track नहीं मिला। "Share tab audio" checkbox ON करके दोबारा try करें।';

      case 'EMPTY_RECORDING':
        return 'Recording empty है। "Share tab audio" checkbox ON करना ज़रूरी है।';

      default:
        return 'Audio save नहीं हो सका। Chrome Desktop पर try करें या screen recorder use करें।';
    }
  }
}
