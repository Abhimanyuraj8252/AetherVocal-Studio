const crypto = require('crypto');
const WebSocket = require('ws');

async function generateSecMsGec() {
  const WIN_EPOCH = 11644473600;
  const S_TO_NS = 1e9;
  let ticks = Date.now() / 1000;
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;
  const strToHash = `${Math.floor(ticks)}6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
  const hash = crypto.createHash('sha256').update(strToHash).digest('hex').toUpperCase();
  return hash;
}

async function synthesize(text, voice, lang) {
  const secGec = await generateSecMsGec();
  const secGecVer = '1-143.0.3644.0';
  return new Promise((resolve, reject) => {
    const connectionId = crypto.randomUUID().replace(/-/g, '');
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}&Sec-MS-GEC=${secGec}&Sec-MS-GEC-Version=${secGecVer}`;
    
    const ws = new WebSocket(wsUrl, {
      headers: {
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Cookie': 'muid=A1B2C3D4E5F67890123456789ABCDEF0;'
      }
    });
    ws.onopen = () => {
      const configMessage = "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n" +
        '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}';
      ws.send(configMessage);

      const requestId = crypto.randomUUID().replace(/-/g, '');
      const timestamp = new Date().toISOString();
      const ssmlMessage = 
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}\r\n` +
        `Path:ssml\r\n\r\n` +
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'>` +
        `<voice name='${voice}'>${text}</voice></speak>`;
        
      ws.send(ssmlMessage);
    };

    let chunks = 0;
    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        chunks++;
      } else {
        const text = event.data;
        if (text.includes('Path:turn.end')) {
          ws.close();
          resolve(chunks);
        } else if (text.includes('Path:turn.start')) {
          console.log('Started synthesis');
        } else {
          console.log('Text message:', text);
        }
      }
    };

    ws.onerror = reject;
  });
}

synthesize('Hello world', 'en-US-AriaNeural', 'en-US')
  .then(chunks => console.log('Success, chunks received:', chunks))
  .catch(err => console.error('Error:', err));
