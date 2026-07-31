const WebSocket = require('ws');
const crypto = require('crypto');

function synthesize(text, voice, lang) {
  return new Promise((resolve, reject) => {
    const connectionId = crypto.randomUUID().replace(/-/g, '');
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}`;
    
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => {
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
    });

    let chunks = 0;
    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        chunks++;
      } else {
        const text = data.toString();
        if (text.includes('Path:turn.end')) {
          ws.close();
          resolve(chunks);
        } else if (text.includes('Path:turn.start')) {
          console.log('Started synthesis');
        } else {
            console.log('Text message:', text);
        }
      }
    });

    ws.on('error', reject);
  });
}

synthesize('Hello world', 'en-US-AriaNeural', 'en-US')
  .then(chunks => console.log('Success, chunks received:', chunks))
  .catch(err => console.error('Error:', err));
