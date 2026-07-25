export function openSpeechPlaybackPopup() {
  const popup = window.open('', 'AetherVocalPlayback', 'width=420,height=520');

  if (!popup) {
    throw new Error('Popup blocked. Allow popups for AetherVocal Studio and try again.');
  }

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AetherVocal Playback</title>
        <style>
          body {
            margin: 0;
            font-family: system-ui, sans-serif;
            background: #0b1120;
            color: #e2e8f0;
            display: grid;
            place-items: center;
            min-height: 100vh;
          }
          .card {
            width: min(360px, calc(100vw - 32px));
            border: 1px solid rgba(56, 189, 248, 0.25);
            background: rgba(15, 23, 42, 0.92);
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 20px 80px rgba(2, 6, 23, 0.45);
          }
          .title {
            font-size: 22px;
            margin: 0 0 8px;
          }
          .status {
            margin: 12px 0 0;
            color: #94a3b8;
            line-height: 1.5;
          }
          .pill {
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(14, 165, 233, 0.14);
            color: #67e8f9;
            font-size: 12px;
            margin-bottom: 14px;
          }
          code {
            color: #fbbf24;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="pill">Playback Tab</div>
          <h1 class="title">AetherVocal Playback</h1>
          <p class="status" id="status">Ready. When you start capture, this tab will speak the script.</p>
          <p class="status">Share this tab from the Chrome picker and keep it open while the audio is generated.</p>
        </div>
        <script>
          const statusNode = document.getElementById('status');
          window.__AETHERVOCAL_READY__ = false;

          function setStatus(message) {
            statusNode.textContent = message;
          }

          function waitForVoices() {
            return new Promise((resolve) => {
              const voices = window.speechSynthesis.getVoices();
              if (voices && voices.length > 0) {
                resolve(voices);
                return;
              }

              const handleVoicesChanged = () => {
                const latest = window.speechSynthesis.getVoices();
                if (latest && latest.length > 0) {
                  window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
                  resolve(latest);
                }
              };

              window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
              setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
            });
          }

          function resolveVoice(voices, voiceName, voiceURI, lang) {
            return voices.find((voice) => voice.voiceURI === voiceURI)
              || voices.find((voice) => voice.name === voiceName)
              || voices.find((voice) => (voice.lang || '').toLowerCase().startsWith((lang || '').slice(0, 2).toLowerCase()))
              || voices[0]
              || null;
          }

          async function speakChunks(payload) {
            const voices = await waitForVoices();
            const matchedVoice = resolveVoice(voices, payload.voiceName, payload.voiceURI, payload.lang);
            const chunks = Array.isArray(payload.chunks) ? payload.chunks : [];

            if (!chunks.length) {
              throw new Error('No chunks to speak.');
            }

            for (let index = 0; index < chunks.length; index++) {
              const chunk = chunks[index];
              const utterance = new SpeechSynthesisUtterance(chunk);
              if (matchedVoice) utterance.voice = matchedVoice;
              if (payload.lang) utterance.lang = payload.lang;
              utterance.rate = payload.rate || 1;
              utterance.pitch = payload.pitch || 1;

              window.speechSynthesis.cancel();
              window.speechSynthesis.resume();

              setStatus('Speaking chunk ' + (index + 1) + ' of ' + chunks.length + '...');

              await new Promise((resolve, reject) => {
                utterance.onend = resolve;
                utterance.onerror = reject;
                window.speechSynthesis.speak(utterance);
              });
            }
          }

          window.addEventListener('message', async (event) => {
            if (!event.data || event.data.type !== 'AETHERVOCAL_SPEAK') return;

            try {
              setStatus('Preparing speech voices...');
              await speakChunks(event.data.payload || {});
              setStatus('Done. You can stop sharing now.');
              if (window.opener) {
                window.opener.postMessage({ type: 'AETHERVOCAL_DONE' }, window.location.origin);
              }
            } catch (error) {
              setStatus('Speech failed: ' + (error && error.message ? error.message : 'Unknown error'));
              if (window.opener) {
                window.opener.postMessage({
                  type: 'AETHERVOCAL_ERROR',
                  message: error && error.message ? error.message : 'Unknown error'
                }, window.location.origin);
              }
            }
          });

          if (window.opener) {
            window.__AETHERVOCAL_READY__ = true;
            window.opener.postMessage({ type: 'AETHERVOCAL_POPUP_READY' }, window.location.origin);
          }
        </script>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();

  return popup;
}

export function speakInPlaybackPopup(popup, payload) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for playback popup.'));
    }, 30000);

    let sent = false;
    let readyIntervalId = null;
    const sendPayload = () => {
      if (!popup || popup.closed) {
        cleanup();
        reject(new Error('Playback popup was closed before speech started.'));
        return;
      }

      if (sent) return;
      sent = true;
      popup.postMessage({ type: 'AETHERVOCAL_SPEAK', payload }, window.location.origin);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
      if (readyIntervalId) clearInterval(readyIntervalId);
    };

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data) return;

      if (event.data.type === 'AETHERVOCAL_POPUP_READY') {
        sendPayload();
        return;
      }

      if (event.data.type === 'AETHERVOCAL_DONE') {
        cleanup();
        resolve();
      }

      if (event.data.type === 'AETHERVOCAL_ERROR') {
        cleanup();
        reject(new Error(event.data.message || 'Speech playback failed.'));
      }
    };

    window.addEventListener('message', handleMessage);

    readyIntervalId = setInterval(() => {
      try {
        if (popup && !popup.closed && popup.__AETHERVOCAL_READY__) {
          sendPayload();
        }
      } catch (error) {
        // Ignore cross-window access jitter while the popup finishes loading.
      }
    }, 100);
  });
}