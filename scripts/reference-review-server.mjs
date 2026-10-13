// Isolated analysis viewer. Never imported by the villa app or included in its public assets.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
const files = {
  gallery: 'C:/Users/Dio/Downloads/Gallery.mp4',
  terms: 'C:/Users/Dio/Downloads/Term & Condition.mp4',
  location: 'C:/Users/Dio/Downloads/Getting Here.mp4',
  packages: 'C:/Users/Dio/Downloads/Package & Activities.mp4',
  foundation: 'C:/Users/Dio/Downloads/The Foundation.mp4',
  dining: 'C:/Users/Dio/Downloads/Dining Panel Refrence.mp4',
  culture: 'D:/FFOutput/Culture Panel.mp4',
  rooms: 'C:/Users/Dio/Downloads/Bungalow Room Panel Refrence.mp4',
  reference: 'C:/Users/Dio/Downloads/Recording 2026-10-06 204140.mp4',
  current: 'C:/Users/Dio/Downloads/Recording 2026-10-06 204351.mp4',
  mobile: 'C:/Users/Dio/Downloads/UI Mobile panel.mp4',
};
createServer(async (req, res) => {
  const key = new URL(req.url, 'http://localhost').pathname.slice(1);
  if (!key) {
    res.setHeader('content-type', 'text/html');
    res.end(`<!doctype html><title>Supplied recording review</title><style>body{font:16px Arial;background:#222;color:white}video{display:block;max-width:100%;height:80vh}button{padding:10px;margin:8px}</style><h1>Supplied recording review — separate from demo</h1><button onclick="player.src='/gallery'">Gallery</button><button onclick="player.src='/terms'">Terms & Conditions</button><button onclick="player.src='/location'">Getting Here</button><button onclick="player.src='/packages'">Packages & Activities</button><button onclick="player.src='/foundation'">Foundation</button><button onclick="player.src='/dining'">Dining</button><button onclick="player.src='/culture'">Culture</button><button onclick="player.src='/rooms'">Bungalow rooms</button><button onclick="player.src='/reference'">Reference desktop</button><button onclick="player.src='/current'">Current desktop</button><button onclick="player.src='/mobile'">Authoritative mobile</button><video id="player" src="/dining" controls preload="metadata"></video><button onclick="player.play()">Play recording</button><button onclick="player.pause()">Pause recording</button><label>Seek seconds <input type="number" min="0" step="0.1" id="seek"></label><button onclick="player.currentTime=Number(seek.value)">Seek</button><button onclick="snapshot.width=player.videoWidth;snapshot.height=player.videoHeight;snapshot.getContext('2d').drawImage(player,0,0);frameData.textContent=snapshot.toDataURL('image/jpeg',.95)">Capture frame</button><canvas id="snapshot" hidden></canvas><script id="frameData" type="application/json"></script>`);
    return;
  }
  if (!files[key]) { res.writeHead(404).end(); return; }
  const { size } = await stat(files[key]);
  const match = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  const start = match ? Number(match[1]) : 0;
  const end = match?.[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  res.writeHead(match ? 206 : 200, { 'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-length': end-start+1, ...(match ? {'content-range':`bytes ${start}-${end}/${size}`} : {}) });
  createReadStream(files[key], { start, end }).pipe(res);
}).listen(3118, '127.0.0.1', () => console.log('Isolated supplied-recording viewer: http://127.0.0.1:3118'));


