/**
 * Edge TTS V2 DRM Token Generator (CS64 + SHA-256)
 * Implements Microsoft Edge Read Aloud DRM handshake v2 protocol.
 * Cross-platform: Works in modern browsers and Node.js.
 */

const _U32_MASK = 0xFFFFFFFFn;

function _rol16(v) {
  v = BigInt(v) & _U32_MASK;
  return ((v << 16n) | (v >> 16n)) & _U32_MASK;
}

const _SHA256_INITIAL = [
  0x6A09E667n, 0xBB67AE85n, 0x3C6EF372n, 0xA54FF53An,
  0x510E527Fn, 0x9B05688Cn, 0x1F83D9ABn, 0x5BE0CD19n
];
const _SHA256_STATE = [
  0xFD9FBEA2n, 0x91243CE7n, 0xBE499094n, 0xCD2E1E0An,
  0x6C006F49n, 0x04BD35ABn, 0xFEB0A7E4n, 0x03EFFBD2n
];
const _SHA256_SCHEDULE = [
  0xEB24BF9En, 0x1558691Fn, 0xA0C09EE2n, 0x0CFA32BAn,
  0xA622EE8Cn, 0xD1DD9491n, 0xC0DD25A0n, 0xF9E70AB6n,
  0xF0C31573n, 0x7058CE4En, 0x7188E606n, 0x00E5AB33n,
  0xD258B060n, 0x72766564n
];
const _SHA256_ROUND_CONSTANTS = [
  0x428A2F98n, 0x71374491n, 0xB5C0FBCFn, 0xE9B5DBA5n, 0x3956C25Bn, 0x59F111F1n, 0x923F82A4n, 0xAB1C5ED5n,
  0xD807AA98n, 0x12835B01n, 0x243185BEn, 0x550C7DC3n, 0x72BE5D74n, 0x80DEB1FEn, 0x9BDC06A7n, 0xC19BF174n,
  0xE49B69C1n, 0xEFBE4786n, 0x0FC19DC6n, 0x240CA1CCn, 0x2DE92C6Fn, 0x4A7484AAn, 0x5CB0A9DCn, 0x76F988DAn,
  0x983E5152n, 0xA831C66Dn, 0xB00327C8n, 0xBF597FC7n, 0xC6E00BF3n, 0xD5A79147n, 0x06CA6351n, 0x14292967n,
  0x27B70A85n, 0x2E1B2138n, 0x4D2C6DFCn, 0x53380D13n, 0x650A7354n, 0x766A0ABBn, 0x81C2C92En, 0x92722C85n,
  0xA2BFE8A1n, 0xA81A664Bn, 0xC24B8B70n, 0xC76C51A3n, 0xD192E819n, 0xD6990624n, 0xF40E3585n, 0x106AA070n,
  0x19A4C116n, 0x1E376C08n, 0x2748774Cn, 0x34B0BCB5n, 0x391C0CB3n, 0x4ED8AA4An, 0x5B9CCA4Fn, 0x682E6FF3n,
  0x748F82EEn, 0x78A5636Fn, 0x84C87814n, 0x8CC70208n, 0x90BEFFFAn, 0xA4506CEBn, 0xBEF9A3F7n, 0xC67178F2n
];
const _SHA256_ADJUSTMENT = 0xC9DC06A7n;
const _SHA256_BLOCK_CONSTANTS = [
  ..._SHA256_ROUND_CONSTANTS.slice(0, 14),
  _SHA256_ADJUSTMENT,
  ..._SHA256_ROUND_CONSTANTS.slice(15)
];
const _SHA256_SIGMA0_ADJUSTMENT = 0x059C0B80n;
const _SHA256_SIGMA1_ADJUSTMENT = 0x000B92C0n;

const _CS64_COEFFICIENTS = [
  [0xE82E91B1n, 0xB32700D0n], [0x44DE24C6n, 0x88DFF51Dn], [0x3BEB65BCn, 0x29514038n],
  [0xC89C5933n, 0xB328CBDFn], [0x8D1EC211n, 0xD405B4D5n], [0x314EF5D5n, 0x26E55F3Cn],
  [0xE92491B1n, 0x607801C6n], [0xF0A5B9D5n, 0x82B2C1FBn], [0x06064CF3n, 0xFA51A3DAn],
  [0xDA79FA60n, 0x207CC464n], [0xBED20560n, 0x3C3C74F3n], [0x89F9C9F8n, 0xD2D14B61n],
  [0x35FA38C6n, 0xBB04A2C1n], [0xCB49E3C6n, 0xC5626167n]
];
const _CS64_FACTOR = 0x82893933n;
const _CS64_ADJUSTMENT0 = 0xF2F90B1An;
const _CS64_ADJUSTMENT1 = 0x0B1A0000n;

function _words_le4_even(data) {
  const padLen = (4 - (data.length % 4)) % 4;
  const totalLen = data.length + padLen;
  const padded = new Uint8Array(totalLen);
  padded.set(data, 0);

  const words = [];
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  for (let i = 0; i < totalLen; i += 4) {
    words.push(BigInt(view.getUint32(i, true)));
  }
  if (words.length % 2 !== 0) words.push(0n);
  return words;
}

function _sigma0(v) {
  v = BigInt(v) & _U32_MASK;
  return ((v >> 7n) ^ (v << 25n) ^ (v >> 18n) ^ (v << 14n) ^ (v >> 3n)) & _U32_MASK;
}

function _sigma1(v) {
  v = BigInt(v) & _U32_MASK;
  return ((v >> 17n) ^ (v << 15n) ^ (v >> 19n) ^ (v << 13n) ^ (v >> 10n)) & _U32_MASK;
}

function _sha256_rounds(state, words, first_round = 0) {
  let [a, b, c, d, e, f, g, h] = state.map(BigInt);
  const mask = _U32_MASK;
  const constants = first_round === 14 ? _SHA256_BLOCK_CONSTANTS : _SHA256_ROUND_CONSTANTS;
  const aligned = Math.min(64, Math.floor((first_round + 7) / 8) * 8);

  for (let index = first_round; index < aligned; index++) {
    const rot_e = e * 0x100000001n;
    const rot_a = a * 0x100000001n;
    const t1 = (h + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (g ^ (e & (f ^ g))) + constants[index] + words[index]) & mask;
    const t2 = (((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((a & b) | (c & (a | b)))) & mask;
    [a, b, c, d, e, f, g, h] = [(t1 + t2) & mask, a, b, c, (d + t1) & mask, e, f, g];
  }

  for (let index = aligned; index < 64; index += 8) {
    let rot_e = e * 0x100000001n, rot_a = a * 0x100000001n;
    let t1 = (h + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (g ^ (e & (f ^ g))) + constants[index] + words[index]) & mask;
    d = (d + t1) & mask; h = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((a & b) | (c & (a | b)))) & mask;
    rot_e = d * 0x100000001n; rot_a = h * 0x100000001n;
    t1 = (g + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (f ^ (d & (e ^ f))) + constants[index + 1] + words[index + 1]) & mask;
    c = (c + t1) & mask; g = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((h & a) | (b & (h | a)))) & mask;
    rot_e = c * 0x100000001n; rot_a = g * 0x100000001n;
    t1 = (f + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (e ^ (c & (d ^ e))) + constants[index + 2] + words[index + 2]) & mask;
    b = (b + t1) & mask; f = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((g & h) | (a & (g | h)))) & mask;
    rot_e = b * 0x100000001n; rot_a = f * 0x100000001n;
    t1 = (e + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (d ^ (b & (c ^ d))) + constants[index + 3] + words[index + 3]) & mask;
    a = (a + t1) & mask; e = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((f & g) | (h & (f | g)))) & mask;
    rot_e = a * 0x100000001n; rot_a = e * 0x100000001n;
    t1 = (d + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (c ^ (a & (b ^ c))) + constants[index + 4] + words[index + 4]) & mask;
    h = (h + t1) & mask; d = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((e & f) | (g & (e | f)))) & mask;
    rot_e = h * 0x100000001n; rot_a = d * 0x100000001n;
    t1 = (c + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (b ^ (h & (a ^ b))) + constants[index + 5] + words[index + 5]) & mask;
    g = (g + t1) & mask; c = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((d & e) | (f & (d | e)))) & mask;
    rot_e = g * 0x100000001n; rot_a = c * 0x100000001n;
    t1 = (b + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (a ^ (g & (h ^ a))) + constants[index + 6] + words[index + 6]) & mask;
    f = (f + t1) & mask; b = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((c & d) | (e & (c | d)))) & mask;
    rot_e = f * 0x100000001n; rot_a = b * 0x100000001n;
    t1 = (a + ((rot_e >> 6n) ^ (rot_e >> 11n) ^ (rot_e >> 25n)) + (h ^ (f & (g ^ h))) + constants[index + 7] + words[index + 7]) & mask;
    e = (e + t1) & mask; a = (t1 + ((rot_a >> 2n) ^ (rot_a >> 13n) ^ (rot_a >> 22n)) + ((b & c) | (d & (b | c)))) & mask;
  }
  return [a, b, c, d, e, f, g, h];
}

function _expand_sha256_schedule(words, first_word = 16) {
  const mask = _U32_MASK;
  for (let index = first_word; index < 64; index++) {
    const x = words[index - 2], y = words[index - 15];
    const sigma1 = ((x >> 17n) ^ (x << 15n) ^ (x >> 19n) ^ (x << 13n) ^ (x >> 10n)) & mask;
    const sigma0 = ((y >> 7n) ^ (y << 25n) ^ (y >> 18n) ^ (y << 14n) ^ (y >> 3n)) & mask;
    words.push((sigma1 + words[index - 7] + sigma0 + words[index - 16]) & mask);
  }
}

function _sha256_init(data) {
  const mask = _U32_MASK;
  const words = Array(14).fill(0n);
  const d3 = (BigInt(data[0]) << 16n) | (BigInt(data[1]) << 8n) | BigInt(data[2]);
  words.push(d3);
  const d4 = (BigInt(data[3]) << 24n) | (BigInt(data[4]) << 16n) | (BigInt(data[5]) << 8n) | BigInt(data[6]);
  words.push(d4);

  for (let index = 16; index < 30; index++) {
    let value = _SHA256_SCHEDULE[index - 16];
    if (index - 2 >= 14) {
      value += (index === 16 ? (_sigma1(words[index - 2]) ^ _SHA256_SIGMA1_ADJUSTMENT) : _sigma1(words[index - 2])) & mask;
    }
    if (index - 7 >= 14) {
      value += words[index - 7];
    }
    if (index - 15 >= 14) {
      value += (index === 29 ? (_sigma0(words[index - 15]) ^ _SHA256_SIGMA0_ADJUSTMENT) : _sigma0(words[index - 15])) & mask;
    }
    words.push(value & mask);
  }
  words.push((_sigma1(words[28]) + words[23] + _sigma0(words[15]) + words[14] + _SHA256_ADJUSTMENT - _SHA256_ROUND_CONSTANTS[14]) & mask);
  _expand_sha256_schedule(words, 31);
  const working = _sha256_rounds(_SHA256_STATE, words, 14);
  return _SHA256_INITIAL.map((x, i) => (x + working[i]) & mask);
}

function _sha256_digest(data) {
  if (data.length < 7) throw new Error('Data too short');
  const mask = _U32_MASK;
  const length = 57 + data.length;
  const padZeroCount = (55 - (length % 64) + 64) % 64;
  
  const padded = new Uint8Array(data.length - 7 + 1 + padZeroCount + 8);
  padded.set(data.subarray(7), 0);
  let offset = data.length - 7;
  padded[offset++] = 0x80;
  offset += padZeroCount;

  const lenBits = BigInt(length) * 8n;
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  view.setBigUint64(offset, lenBits, false);

  let state = _sha256_init(data.subarray(0, 7));
  for (let o = 0; o < padded.length; o += 64) {
    const chunkView = new DataView(padded.buffer, padded.byteOffset + o, 64);
    const words = [];
    for (let i = 0; i < 64; i += 4) {
      words.push(BigInt(chunkView.getUint32(i, false)));
    }
    _expand_sha256_schedule(words);
    const working = _sha256_rounds(state, words);
    state = state.map((x, i) => (x + working[i]) & mask);
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer, out.byteOffset, 32);
  for (let i = 0; i < 8; i++) {
    outView.setUint32(i * 4, Number(state[i]), false);
  }
  return out;
}

function _cs64_digest(data, digest) {
  const mask = _U32_MASK;
  const dView = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
  let key_a = BigInt(dView.getUint32(0, true)) | 1n;
  let key_b = BigInt(dView.getUint32(4, true)) | 1n;

  const factors = [(key_a * _CS64_FACTOR) & mask, (key_b * _CS64_FACTOR) & mask];
  const terms = _CS64_COEFFICIENTS.map(([coeff], idx) => (coeff * factors[idx % 2]) & mask);
  const offsets = _CS64_COEFFICIENTS.map(([_, off]) => off);

  const prefixed = new Uint8Array(data.length + 1);
  prefixed[0] = 0;
  prefixed.set(data, 1);
  const words = _words_le4_even(prefixed);

  words.forEach((word, index) => {
    let term = (word * (index % 2 === 0 ? key_a : key_b)) & mask;
    let offset = (_rol16(word) * (index % 2 === 0 ? 0xEF0569FBn : 0xC31713DBn)) & mask;
    if (index === 0) {
      term = (term + _CS64_ADJUSTMENT0 * factors[0]) & mask;
      offset = (offset + _CS64_ADJUSTMENT1) & mask;
    }
    terms.push(term);
    offsets.push(offset);
  });

  let swap_acc = 0n, swap_last = 0n, state = 0n, acc = 0n;
  for (let index = 0; index < terms.length; index += 2) {
    const x = terms[index], y = terms[index + 1];
    let t = _rol16((offsets[index] + x) & mask);
    let q = (t * 0x76F50F34n) & mask;
    swap_acc = (swap_acc + ((_rol16(q) * 0xC3EFEA97n + q) & mask)) & mask;

    t = _rol16((offsets[index + 1] + y) & mask);
    q = (t * 0x1881CE3Cn) & mask;
    swap_last = ((_rol16(q) * 0x35BD1EC9n + q) & mask);
    swap_acc = (swap_acc + swap_last) & mask;

    state = (state * key_a + x) & mask;
    state = (_rol16(state) * 0xCF98B111n) & mask;
    state = (_rol16(state) * 0x87085B9Fn) & mask;
    state = (_rol16(state) * 0x12CEB96Dn) & mask;
    state = (_rol16(state) * 0x257E1D83n) & mask;
    acc = (acc + state) & mask;

    t = (state * key_b + y) & mask;
    t = (_rol16(t) * 0xA27416F5n) & mask;
    t = (_rol16(t) * 0xD38396FFn) & mask;
    state = (_rol16((_rol16(t) * 0x7C932B89n) & mask) * 0xBFA49F69n) & mask;
    acc = (acc + state) & mask;
  }
  return [(swap_last ^ state) & mask, (swap_acc ^ acc) & mask];
}

function bytesToHex(uint8Array) {
  let hex = '';
  for (let i = 0; i < uint8Array.length; i++) {
    hex += uint8Array[i].toString(16).padStart(2, '0');
  }
  return hex.toUpperCase();
}

/**
 * Generates Microsoft Edge TTS v2 Sec-MS-GEC DRM token.
 * Format: "<16 hex cs64>-<64 hex sha256>"
 */
export function generateSecMsGecV2(unixTimestamp) {
  const WIN_EPOCH = 11644473600;
  const S_TO_NS = 1e9;
  let ticks = (unixTimestamp !== undefined ? unixTimestamp : Date.now() / 1000);
  ticks += WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;

  const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  const str = Math.floor(ticks) + TRUSTED_CLIENT_TOKEN;
  const strToHash = new TextEncoder().encode(str);

  const digest = _sha256_digest(strToHash);
  const [cs0, cs1] = _cs64_digest(strToHash, digest);

  const csBuf = new Uint8Array(8);
  const csView = new DataView(csBuf.buffer);
  csView.setUint32(0, Number(cs0), true);
  csView.setUint32(4, Number(cs1), true);

  const cs64 = bytesToHex(csBuf);
  const sha256 = bytesToHex(digest);
  return `${cs64}-${sha256}`;
}

export const SEC_MS_GEC_VERSION = '2-143.0.3650.75';
export const EDGE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0';

export default {
  generateSecMsGecV2,
  SEC_MS_GEC_VERSION,
  EDGE_USER_AGENT
};
