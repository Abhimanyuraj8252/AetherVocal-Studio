import crypto from 'crypto';
import WebSocket from 'ws';

// Generates Sec-MS-GEC authentication token required by Microsoft Edge Speech service
async function generateSecMsGec() {
  const WIN_EPOCH = 11644473600;
  const S_TO_NS = 1e9;
  let ticks = Date.now() / 1000;
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;
  const strToHash = `${Math.floor(ticks)}6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
  return crypto.createHash('sha256').update(strToHash).digest('hex').toUpperCase();
}

function generateUUID() {
  return crypto.randomUUID().replace(/-/g, '');
}

function getTimestamp() {
  return new Date().toISOString();
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { text, voice = 'en-US-AriaNeural', lang = 'en-US', pitch = 1.0, rate = 1.0 } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" parameter.' });
    }

    const secGec = await generateSecMsGec();
    const secGecVer = '1-143.0.3644.0';
    const connectionId = generateUUID();

    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}&Sec-MS-GEC=${secGec}&Sec-MS-GEC-Version=${secGecVer}`;

    const mp3Buffer = await new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl, {
        headers: {
          'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
          'Cookie': 'muid=A1B2C3D4E5F67890123456789ABCDEF0;'
        }
      });

      const audioChunks = [];

      const timeoutId = setTimeout(() => {
        try { ws.close(); } catch (e) {}
        reject(new Error('TTS WebSocket request timed out (25 seconds).'));
      }, 25000);

      ws.on('open', () => {
        // Send speech config
        const configMsg =
          "Content-Type:application/json; charset=utf-8\r\n" +
          "Path:speech.config\r\n\r\n" +
          '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}';
        ws.send(configMsg);

        // Escape SSML text
        const escapedText = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        const requestId = generateUUID();
        const timestamp = getTimestamp();

        // Calculate rate & pitch strings
        const ratePercent = Math.round((rate - 1) * 100);
        const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        
        const pitchHz = Math.round((pitch - 1) * 10);
        const pitchStr = pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`;

        const ssmlMsg =
          `X-RequestId:${requestId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${timestamp}\r\n` +
          `Path:ssml\r\n\r\n` +
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'>` +
          `<voice name='${voice}'>` +
          `<prosody pitch='${pitchStr}' rate='${rateStr}' volume='+0%'>${escapedText}</prosody>` +
          `</voice></speak>`;

        ws.send(ssmlMsg);
      });

      ws.on('message', (data, isBinary) => {
        if (isBinary) {
          const buffer = Buffer.from(data);
          if (buffer.length >= 2) {
            const headerLength = (buffer[0] << 8) | buffer[1];
            if (buffer.length >= 2 + headerLength) {
              const audioData = buffer.slice(2 + headerLength);
              if (audioData.length > 0) {
                audioChunks.push(audioData);
              }
            }
          }
        } else {
          const msgText = data.toString();
          if (msgText.includes('Path:turn.end')) {
            clearTimeout(timeoutId);
            try { ws.close(); } catch (e) {}
            const fullBuffer = Buffer.concat(audioChunks);
            resolve(fullBuffer);
          }
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      ws.on('close', (code) => {
        clearTimeout(timeoutId);
        if (audioChunks.length === 0 && code !== 1000) {
          reject(new Error(`WebSocket closed unexpectedly (code: ${code}).`));
        } else if (audioChunks.length > 0) {
          resolve(Buffer.concat(audioChunks));
        }
      });
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', mp3Buffer.length);
    return res.status(200).send(mp3Buffer);

  } catch (error) {
    console.error('Vercel Serverless Edge TTS Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Serverless TTS Error' });
  }
}
