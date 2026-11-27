#!/usr/bin/env node
/* builder111: LobsterBrowse Lite r110 -> r111
 * WIDGET LANE fix: worker-side WebCrypto digest shim (sha256/sha384/sha512 real)
 * inside zlWorkerPrelude + zlWkBridge wlog witness + badge/version/note bumps.
 * Gates: base md5, anchor uniqueness, size math, byte-exact reverse reconstruction,
 * script-block parse with pinned fail-set, changed-block set, token counts,
 * note hygiene, wasm region pin, vm mocks (digest byte-exact vs node crypto),
 * bridge wlog mock. */
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');

const BASE_MD5 = '31ebf38eb2e185c7a59a4b7fb5e3ec44';
const BASE_BYTES = 5997860;
/* the three engine wasm b64 runs (char len, sha256 of the run) */
const WASM_RUNS = [
  { at: 0, len: 1748, sha: '02959a44c497a8ebd7c9e2457401f801a6a67536e1c3c2d704880aa956f2a484' },
  { at: 0, len: 1115880, sha: '8f3739de91c13bd5e05cb7e4c71279de47cae6bf0976f73901c86193f0455a92' },
  { at: 0, len: 2710068, sha: '7790ffd4fd6480e7ec43bf79ac31e9b9eeb482a863a05516243fc8073bdf6280' },
];
const PIN_FAILSET = '7,11,14'; /* known naive </script split artifact blocks */

let fails = 0;
function gate(ok, name, extra) {
  if (ok) console.log('PASS ' + name + (extra ? '  [' + extra + ']' : ''));
  else { console.log('FAIL ' + name + (extra ? '  [' + extra + ']' : '')); fails++; }
}
function md5(b) { return crypto.createHash('md5').update(b).digest('hex'); }
function sha256s(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function nFail(e) { return e && e.name === 'NotSupportedError'; }

const base = fs.readFileSync('/tmp/lb/r110.html', 'utf8');
gate(md5(base) === BASE_MD5, 'base md5', md5(base));
gate(Buffer.byteLength(base, 'utf8') === BASE_BYTES, 'base size bytes', String(Buffer.byteLength(base, 'utf8')));

/* ---------- splice payloads ---------- */

const K256 = '428a2f9871374491b5c0fbcfe9b5dba53956c25b59f111f1923f82a4ab1c5ed5d807aa9812835b01243185be550c7dc372be5d7480deb1fe9bdc06a7c19bf174e49b69c1efbe47860fc19dc6240ca1cc2de92c6f4a7484aa5cb0a9dc76f988da983e5152a831c66db00327c8bf597fc7c6e00bf3d5a7914706ca63511429296727b70a852e1b21384d2c6dfc53380d13650a7354766a0abb81c2c92e92722c85a2bfe8a1a81a664bc24b8b70c76c51a3d192e819d6990624f40e3585106aa07019a4c1161e376c082748774c34b0bcb5391c0cb34ed8aa4a5b9cca4f682e6ff3748f82ee78a5636f84c878148cc7020890befffaa4506cebbef9a3f7c67178f2';
const K512 = '428a2f98d728ae227137449123ef65cdb5c0fbcfec4d3b2fe9b5dba58189dbbc3956c25bf348b53859f111f1b605d019923f82a4af194f9bab1c5ed5da6d8118d807aa98a303024212835b0145706fbe243185be4ee4b28c550c7dc3d5ffb4e272be5d74f27b896f80deb1fe3b1696b19bdc06a725c71235c19bf174cf692694e49b69c19ef14ad2efbe4786384f25e30fc19dc68b8cd5b5240ca1cc77ac9c652de92c6f592b02754a7484aa6ea6e4835cb0a9dcbd41fbd476f988da831153b5983e5152ee66dfaba831c66d2db43210b00327c898fb213fbf597fc7beef0ee4c6e00bf33da88fc2d5a79147930aa72506ca6351e003826f142929670a0e6e7027b70a8546d22ffc2e1b21385c26c9264d2c6dfc5ac42aed53380d139d95b3df650a73548baf63de766a0abb3c77b2a881c2c92e47edaee692722c851482353ba2bfe8a14cf10364a81a664bbc423001c24b8b70d0f89791c76c51a30654be30d192e819d6ef5218d69906245565a910f40e35855771202a106aa07032bbd1b819a4c116b8d2d0c81e376c085141ab532748774cdf8eeb9934b0bcb5e19b48a8391c0cb3c5c95a634ed8aa4ae3418acb5b9cca4f7763e373682e6ff3d6b2b8a3748f82ee5defb2fc78a5636f43172f6084c87814a1f0ab728cc702081a6439ec90befffa23631e28a4506cebde82bde9bef9a3f7b2c67915c67178f2e372532bca273eceea26619cd186b8c721c0c207eada7dd6cde0eb1ef57d4f7fee6ed17806f067aa72176fba0a637dc5a2c898a6113f9804bef90dae1b710b35131c471b28db77f523047d8432caab7b40c724933c9ebe0a15c9bebc431d67c49c100d4c4cc5d4becb3e42b6597f299cfc657e2a5fcb6fab3ad6faec6c44198c4a475817';
const IV512 = '6a09e667f3bcc908bb67ae8584caa73b3c6ef372fe94f82ba54ff53a5f1d36f1510e527fade682d19b05688c2b3e6c1f1f83d9abfb41bd6b5be0cd19137e2179';
const IV384 = 'cbbb9d5dc1059ed8629a292a367cd5079159015a3070dd17152fecd8f70e593967332667ffc00b318eb44a8768581511db0c2e0d64f98fa747b5481dbefa4fa4';
const B64U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const shim = [
"      /* r111 recaptcha lane: the vessel worker is an opaque-origin blob realm, natively non-secure, so crypto.subtle is absent and the r102 isSecureContext persona cannot create it; the enterprise attestation digest dies silently in that worker, the page retries commands forever and the widget stalls at the hello; ship a real digest shim (sha256 mirrors the zlfix21 page engine, sha384 and sha512 real, other algs reject honestly) plus a capped wlog witness so the next export shows the worker lane */",
"      try {",
"        if (!(self.crypto && self.crypto.subtle)) {",
"          var __zcReal = self.crypto;",
"          var __zcWN = 0;",
"          var __zcWL = function (m) { try { if (__zcWN < 24) { __zcWN++; self.postMessage({ __zlwf: 1, k: 'wlog', m: String(m).slice(0, 100) }); } } catch (eWl111) {} };",
"          var __zcG = function (a) { try { if (__zcReal && __zcReal.getRandomValues) return __zcReal.getRandomValues(a); } catch (eGr111) {} for (var i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; };",
"          var __zcRotr = function (x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; };",
"          var __zcK256 = '" + K256 + "';",
"          var __zcSha256 = function (bytes) { var K = []; for (var i0 = 0; i0 < 64; i0++) K[i0] = parseInt(__zcK256.substr(i0 * 8, 8), 16); var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]; var l = bytes.length; var padded = []; for (var p = 0; p < l; p++) padded.push(bytes[p] & 255); padded.push(0x80); while (padded.length % 64 !== 56) padded.push(0); var lo = (l << 3) >>> 0; var hi = Math.floor(l / 536870912); padded.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255); var w = new Array(64); for (var off = 0; off < padded.length; off += 64) { for (var t = 0; t < 16; t++) { var j = off + t * 4; w[t] = (((padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3]) & 4294967295) >>> 0; } for (var t2 = 16; t2 < 64; t2++) { var x15 = w[t2 - 15]; var x2 = w[t2 - 2]; var s0 = (__zcRotr(x15, 7) ^ __zcRotr(x15, 18) ^ (x15 >>> 3)) >>> 0; var s1 = (__zcRotr(x2, 17) ^ __zcRotr(x2, 19) ^ (x2 >>> 10)) >>> 0; w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) >>> 0; } var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7]; for (var t3 = 0; t3 < 64; t3++) { var S1 = (__zcRotr(e, 6) ^ __zcRotr(e, 11) ^ __zcRotr(e, 25)) >>> 0; var ch = ((e & f) ^ (~e & g)) >>> 0; var t1 = (h + S1 + ch + K[t3] + w[t3]) >>> 0; var S0 = (__zcRotr(a, 2) ^ __zcRotr(a, 13) ^ __zcRotr(a, 22)) >>> 0; var maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0; var t2b = (S0 + maj) >>> 0; h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2b) >>> 0; } H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0; H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0; } var out = []; for (var q = 0; q < 8; q++) { out.push((H[q] >>> 24) & 255, (H[q] >>> 16) & 255, (H[q] >>> 8) & 255, H[q] & 255); } return new Uint8Array(out); };",
"          var __zcK512 = '" + K512 + "';",
"          var __zcIv512 = '" + IV512 + "';",
"          var __zcIv384 = '" + IV384 + "';",
"          var __zcP = function (s) { var o = []; for (var i2 = 0; i2 < s.length; i2 += 16) o.push([parseInt(s.substr(i2, 8), 16), parseInt(s.substr(i2 + 8, 8), 16)]); return o; };",
"          var __zcX = function (a, b) { return [(a[0] ^ b[0]) >>> 0, (a[1] ^ b[1]) >>> 0]; };",
"          var __zcAdd = function (a, b) { var l = a[1] + b[1]; var h = a[0] + b[0]; if (l > 4294967295) { l -= 4294967296; h += 1; } return [h % 4294967296, l % 4294967296]; };",
"          var __zcRot = function (a, n) { if (n === 0) return [a[0], a[1]]; if (n === 32) return [a[1], a[0]]; if (n < 32) return [((a[0] >>> n) | (a[1] << (32 - n))) >>> 0, ((a[1] >>> n) | (a[0] << (32 - n))) >>> 0]; var m = n - 32; return [((a[1] >>> m) | (a[0] << (32 - m))) >>> 0, ((a[0] >>> m) | (a[1] << (32 - m))) >>> 0]; };",
"          var __zcShr = function (a, n) { if (n === 0) return [a[0], a[1]]; if (n < 32) return [a[0] >>> n, ((a[1] >>> n) | (a[0] << (32 - n))) >>> 0]; if (n === 32) return [0, a[0]]; return [0, a[0] >>> (n - 32)]; };",
"          var __zcSha512 = function (bytes, ivstr) { var K = __zcP(__zcK512), H = __zcP(ivstr); var l = bytes.length; var padded = []; for (var p = 0; p < l; p++) padded.push(bytes[p] & 255); padded.push(0x80); while (padded.length % 128 !== 112) padded.push(0); var bits = l * 8; var hi = Math.floor(bits / 4294967296), lo = bits % 4294967296; padded.push(0, 0, 0, 0, 0, 0, 0, 0, (hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255); var w = new Array(80); for (var off = 0; off < padded.length; off += 128) { for (var t = 0; t < 16; t++) { var j = off + t * 8; w[t] = [(((padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3]) & 4294967295) >>> 0, (((padded[j + 4] << 24) | (padded[j + 5] << 16) | (padded[j + 6] << 8) | padded[j + 7]) & 4294967295) >>> 0]; } for (var t2 = 16; t2 < 80; t2++) { var x15 = w[t2 - 15], x2 = w[t2 - 2]; var s0 = __zcX(__zcX(__zcRot(x15, 1), __zcRot(x15, 8)), __zcShr(x15, 7)); var s1 = __zcX(__zcX(__zcRot(x2, 19), __zcRot(x2, 61)), __zcShr(x2, 6)); w[t2] = __zcAdd(__zcAdd(__zcAdd(w[t2 - 16], s0), w[t2 - 7]), s1); } var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7]; for (var t3 = 0; t3 < 80; t3++) { var S1 = __zcX(__zcX(__zcRot(e, 14), __zcRot(e, 18)), __zcRot(e, 41)); var ch = [((e[0] & f[0]) ^ (~e[0] & g[0])) >>> 0, ((e[1] & f[1]) ^ (~e[1] & g[1])) >>> 0]; var t1 = __zcAdd(__zcAdd(__zcAdd(__zcAdd(h, S1), ch), K[t3]), w[t3]); var S0 = __zcX(__zcX(__zcRot(a, 28), __zcRot(a, 34)), __zcRot(a, 39)); var maj = [((a[0] & b[0]) ^ (a[0] & c[0]) ^ (b[0] & c[0])) >>> 0, ((a[1] & b[1]) ^ (a[1] & c[1]) ^ (b[1] & c[1])) >>> 0]; var t2b = __zcAdd(S0, maj); h = g; g = f; f = e; e = __zcAdd(d, t1); d = c; c = b; b = a; a = __zcAdd(t1, t2b); } H[0] = __zcAdd(H[0], a); H[1] = __zcAdd(H[1], b); H[2] = __zcAdd(H[2], c); H[3] = __zcAdd(H[3], d); H[4] = __zcAdd(H[4], e); H[5] = __zcAdd(H[5], f); H[6] = __zcAdd(H[6], g); H[7] = __zcAdd(H[7], h); } var out = []; for (var q = 0; q < 8; q++) { out.push((H[q][0] >>> 24) & 255, (H[q][0] >>> 16) & 255, (H[q][0] >>> 8) & 255, H[q][0] & 255, (H[q][1] >>> 24) & 255, (H[q][1] >>> 16) & 255, (H[q][1] >>> 8) & 255, H[q][1] & 255); } return new Uint8Array(out); };",
"          var __zcB64U = '" + B64U + "';",
"          var __zcB64FromBytes = function (b) { var o = ''; for (var i = 0; i < b.length; i += 3) { var b0 = b[i], b1 = i + 1 < b.length ? b[i + 1] : 0, b2 = i + 2 < b.length ? b[i + 2] : 0; o += __zcB64U[b0 >> 2] + __zcB64U[((b0 & 3) << 4) | (b1 >> 4)]; if (i + 1 < b.length) o += __zcB64U[((b1 & 15) << 2) | (b2 >> 6)]; if (i + 2 < b.length) o += __zcB64U[b2 & 63]; } return o; };",
"          var __zcMkKey = function (k, alg, ext, usages) { return { zlFake: true, zlK: k, type: 'secret', extractable: ext !== false, algorithm: alg || { name: 'AES-GCM', length: 256 }, usages: usages || [] }; };",
"          var __zcSubtle = {",
"            digest: function (alg, data) { var nm = typeof alg === 'string' ? alg : (alg && alg.name ? alg.name : 'SHA-256'); var u; try { u = data instanceof Uint8Array ? data : (data && data.buffer ? new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength) : new Uint8Array(data)); } catch (eD111) { return Promise.reject(new TypeError('digest input')); } __zcWL('zc digest ' + nm + ' ' + u.length + 'B'); try { if (nm === 'SHA-256') return Promise.resolve(__zcSha256(u).buffer); if (nm === 'SHA-512') return Promise.resolve(__zcSha512(u, __zcIv512).buffer); if (nm === 'SHA-384') return Promise.resolve(__zcSha512(u, __zcIv384).slice(0, 48).buffer); } catch (eD211) { __zcWL('zc digest err ' + String(eD211 && eD211.message).slice(0, 60)); return Promise.reject(eD211); } return Promise.reject(new DOMException('digest algorithm not supported in this worker: ' + nm, 'NotSupportedError')); },",
"            generateKey: function (alg, ext, usages) { var b = new Uint8Array(32); __zcG(b); return Promise.resolve(__zcMkKey(__zcB64FromBytes(b), alg, ext, usages)); },",
"            exportKey: function (fmt, key) { var k = key && key.zlK ? key.zlK : __zcB64FromBytes(__zcG(new Uint8Array(32))); if (fmt === 'jwk') return Promise.resolve({ kty: 'oct', k: k, alg: 'A256GCM', key_ops: ['encrypt', 'decrypt'], ext: true }); var rev = {}; for (var q = 0; q < 64; q++) rev[__zcB64U.charAt(q)] = q; var out = []; var full = k.length - (k.length % 4); for (var i = 0; i < full; i += 4) { var n = (rev[k.charAt(i)] << 18) | (rev[k.charAt(i + 1)] << 12) | (rev[k.charAt(i + 2)] << 6) | rev[k.charAt(i + 3)]; out.push((n >> 16) & 255, (n >> 8) & 255, n & 255); } var rem = k.length - full; if (rem === 2) { var n2 = (rev[k.charAt(full)] << 18) | (rev[k.charAt(full + 1)] << 12); out.push((n2 >> 16) & 255); } else if (rem === 3) { var n3 = (rev[k.charAt(full)] << 18) | (rev[k.charAt(full + 1)] << 12) | (rev[k.charAt(full + 2)] << 6); out.push((n3 >> 16) & 255, (n3 >> 8) & 255); } return Promise.resolve(new Uint8Array(out)); },",
"            importKey: function (fmt, data, alg, ext, usages) { var k = null; try { if (fmt === 'jwk' && data && data.k) k = String(data.k); else if (fmt === 'raw') k = __zcB64FromBytes(data instanceof Uint8Array ? data : (data && data.buffer ? new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength) : new Uint8Array(data))); } catch (eI111) {} var b2 = new Uint8Array(32); __zcG(b2); return Promise.resolve(__zcMkKey(k || __zcB64FromBytes(b2), alg, ext, usages)); },",
"            encrypt: function () { return Promise.reject(new DOMException('AES encryption is not available in this worker', 'NotSupportedError')); },",
"            decrypt: function () { return Promise.reject(new DOMException('AES decryption is not available in this worker', 'NotSupportedError')); },",
"            sign: function () { return Promise.reject(new DOMException('Signing is not available in this worker', 'NotSupportedError')); },",
"            verify: function () { return Promise.reject(new DOMException('Verification is not available in this worker', 'NotSupportedError')); },",
"            deriveBits: function (alg, key, len) { var n = Math.ceil((len || 256) / 8); var b = new Uint8Array(n); __zcG(b); return Promise.resolve(b.buffer); },",
"            deriveKey: function (alg, key, fmt, ext, usages) { var b = new Uint8Array(32); __zcG(b); return Promise.resolve(__zcMkKey(__zcB64FromBytes(b), fmt, ext, usages)); }",
"          };",
"          var __zcShim = {",
"            getRandomValues: __zcG,",
"            subtle: __zcSubtle,",
"            randomUUID: function () { var b = new Uint8Array(16); __zcG(b); var h = ''; var hx = '0123456789abcdef'; for (var i3 = 0; i3 < 16; i3++) { h += hx[(b[i3] >> 4) & 15]; h += hx[b[i3] & 15]; } return h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-8' + h.slice(17, 20) + '-' + h.slice(20, 32); }",
"          };",
"          try { Object.defineProperty(self, 'crypto', { value: __zcShim, configurable: true, writable: true }); } catch (eS111) { try { Object.defineProperty(__zcReal, 'subtle', { value: __zcSubtle, configurable: true, writable: true }); } catch (eS211) {} }",
"          if (self.crypto && self.crypto.subtle) __zcWL('zc subtle shim installed sha256 sha384 sha512');",
"        }",
"      } catch (eZc111) {}",
].join('\n');

const S1old = "catch (eWdm102) {}\n      var seq = 0, pend = new Map();";
const S1new = "catch (eWdm102) {}\n" + shim + "\n      var seq = 0, pend = new Map();";

const S2old = "    if (d.k !== 'req') return;";
const S2new = "    if (d.k === 'wlog') { try { flog('worker', 'wl ' + String(d.m || '').slice(0, 120)); } catch (eWl111) {} return; }\n" + S2old;

const S3old = "build rv-r110";
const S3new = "build rv-r111";

const S4old = "var ZL_VERSION = 'zl-ship93';";
const S4new = "var ZL_VERSION = 'zl-ship94';";

const S5old = "r110 (CHAIN LANE: the operator export proves the epoxy lane read only the epoxy wisp field, found it empty and rode the shared anura ip while the shell custom relay they set sat unused in the page pool, so the chain now honors the shell custom relay ahead of anura and the v1 retry carries the lane onto mercurywork; a live sorry fetch proves no variant defines the solver the onload names, so the fence gate now reads the body onload attribute and the no definition line is the honest witness; set the custom relay to mercurywork and retry the search)";
const S5new = "r111 (WIDGET LANE: the r110 export proves the enterprise widget stall is the worker attestation: the vessel worker is an opaque-origin blob realm with no native crypto.subtle, the r102 isSecureContext persona cannot create it, the sdk sha512 digest dies silently there and the page retries commands forever while the worker never answers, so the prelude now ships a real digest shim sha256 sha384 sha512 with a wlog witness and the bridge logs it; set the custom relay to mercurywork and retry the search, then click the recaptcha checkbox)";

/* ---------- anchor uniqueness ---------- */
for (const [nm, s] of [['S1', S1old], ['S2', S2old], ['S3', S3old], ['S4', S4old], ['S5', S5old]]) {
  gate(base.split(s).length === 2, 'anchor ' + nm + ' unique', String(base.split(s).length - 1));
}

/* ---------- apply ---------- */
let out = base;
out = out.replace(S1old, S1new);
out = out.replace(S2old, S2new);
out = out.replace(S3old, S3new);
out = out.replace(S4old, S4new);
out = out.replace(S5old, S5new);

/* ---------- size math ---------- */
const expectSize = base.length + S1new.length - S1old.length + S2new.length - S2old.length + S5new.length - S5old.length;
gate(out.length === expectSize, 'size math', out.length + ' vs ' + expectSize);

/* ---------- byte-exact reverse reconstruction ---------- */
let rev = out;
rev = rev.replace(S1new, S1old);
rev = rev.replace(S2new, S2old);
rev = rev.replace(S3new, S3old);
rev = rev.replace(S4new, S4old);
rev = rev.replace(S5new, S5old);
gate(md5(rev) === BASE_MD5, 'reverse reconstruction', md5(rev));

/* ---------- script-block parse gate ---------- */
function blocks(txt) {
  const res = [];
  const re = /<script([^>]*)>/gi;
  let m, idx = 0;
  while ((m = re.exec(txt))) {
    const open = m.index + m[0].length;
    const close = txt.toLowerCase().indexOf('</script', open);
    const attrs = m[1] || '';
    const exec = !/type\s*=\s*["']?(application\/(json|ld\+json)|text\/template|text\/x-template)/i.test(attrs);
    res.push({ idx: idx++, attrs, exec, body: txt.slice(open, close < 0 ? txt.length : close) });
    re.lastIndex = close < 0 ? txt.length : close + 8;
  }
  return res;
}
function parseBlocks(txt) {
  const bs = blocks(txt);
  const fail = [];
  bs.forEach((b, i) => {
    if (!b.exec) return;
    try { new vm.Script(b.body); } catch (e) { fail.push(i); }
  });
  return { bs, fail };
}
const pb = parseBlocks(base);
const po = parseBlocks(out);
gate(pb.fail.join(',') === po.fail.join(','), 'script fail-set identical', 'base[' + pb.fail.join(',') + '] out[' + po.fail.join(',') + '] n=' + pb.bs.length);

/* ---------- changed-block set ---------- */
const changed = [];
const n = Math.max(pb.bs.length, po.bs.length);
for (let i = 0; i < n; i++) {
  const a = pb.bs[i] ? pb.bs[i].body : null;
  const b = po.bs[i] ? po.bs[i].body : null;
  if (a !== b) changed.push(i);
}
const changedOk = changed.every(i => {
  const b = po.bs[i].body;
  return /r111 recaptcha lane|k: 'wlog'|rv-r111|zl-ship94|WIDGET LANE/.test(b);
});
gate(changed.length >= 1 && changed.length <= 4 && changedOk, 'changed-block set', 'idx=' + changed.join(',') + ' totalBlocks=' + pb.bs.length);
const changedParsed = changed.every(i => {
  if (po.fail.includes(i)) return true; /* naive-split artifact, covered by fail-set identity */
  try { new vm.Script(po.bs[i].body); return true; } catch (e) { return false; }
});
gate(pb.fail.join(',') === PIN_FAILSET, 'naive fail-set shape pinned', pb.fail.join(','));
gate(changedParsed, 'changed blocks parse (or pinned artifact)', 'idx=' + changed.join(','));

/* ---------- token counts ---------- */
function cnt(txt, s) { return txt.split(s).length - 1; }
const tokens = [
  ['rv-r110', 0], ['rv-r111', 1], ['zl-ship93', 0], ['zl-ship94', 1],
  ['r111 recaptcha lane', 1], ['r110 (CHAIN LANE', 0],
  ['zlWorkerPrelude', 3], ['zlWkBridge', 2],
];
for (const [t, want] of tokens) gate(cnt(out, t) === want, "token '" + t + "'=" + want, String(cnt(out, t)));

/* ---------- note hygiene ---------- */
gate(S5new.indexOf("\n") === -1 && !/['\\$`]|<\/script/.test(S5new), 'note hygiene', '');

/* ---------- wasm region pin: the three engine b64 runs ---------- */
function wasmRuns(txt) {
  const runs = [];
  let i = 0;
  while (true) {
    i = txt.indexOf('AGFzbQ', i);
    if (i < 0) break;
    let e = i;
    while (e < txt.length && /[A-Za-z0-9+/_=-]/.test(txt[e])) e++;
    runs.push({ at: i, len: e - i, sha: sha256s(txt.slice(i, e)) });
    i = e;
  }
  return runs;
}
const wrB = wasmRuns(base), wrO = wasmRuns(out);
gate(wrB.length === 3 && wrB.every((r, k) => r.len === WASM_RUNS[k].len && r.sha === WASM_RUNS[k].sha), 'wasm runs pinned in base', wrB.map(r => r.len + ':' + r.sha.slice(0, 8)).join(' '));
gate(wrO.length === 3 && wrO.every((r, k) => r.len === wrB[k].len && r.sha === wrB[k].sha), 'wasm runs byte-identical in out', wrO.map(r => r.len + ':' + r.sha.slice(0, 8)).join(' '));

/* ---------- mock: prelude in vm ---------- */
function extractPrelude(txt) {
  const head = "return '(' + function (BASEURL) {";
  const hs = txt.indexOf(head);
  if (hs < 0) return null;
  const bodyStart = hs + head.length;
  const tail = "}.toString() + ')(' + JSON.stringify(BASE) + ');';";
  const te = txt.indexOf(tail, bodyStart);
  const fnStart = hs + head.length - "function (BASEURL) {".length;
  if (te < 0) return null;
  return txt.slice(fnStart, te + 1);
}
const preludeFn = extractPrelude(out);
gate(!!preludeFn, 'prelude extracted', 'len=' + (preludeFn ? preludeFn.length : 0));
if (preludeFn) {
  const BASE = 'https://page.example/base/';
  const code = '(' + preludeFn + ')(' + JSON.stringify(BASE) + ');';
  function makeWorkerSandbox(withSubtle) {
    const posted = [];
    const listeners = [];
    const realSubtle = withSubtle ? { marker: 'real' } : undefined;
    const sandbox = {
      URL, TextDecoder, AbortController, DOMException,
      addEventListener: function (t, f) { listeners.push(f); },
      postMessage: function (m) { posted.push(m); },
      navigator: {},
      console: { log: function () {} },
    };
    sandbox.crypto = { getRandomValues: function (a) { for (let i = 0; i < a.length; i++) a[i] = (i * 7 + 3) & 255; return a; } };
    if (withSubtle) sandbox.crypto.subtle = realSubtle;
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    return { sandbox, posted, listeners, realSubtle };
  }
  const w1 = makeWorkerSandbox(false);
  try { vm.runInContext(code, w1.sandbox); } catch (e) { console.log('vm run1 threw: ' + e.message); }
  gate(w1.sandbox.__zlwf === 1, 'mock1 __zlwf set');
  gate(w1.sandbox.isSecureContext === true, 'mock1 isSecureContext persona');
  gate(w1.sandbox.navigator.deviceMemory === 8, 'mock1 deviceMemory persona');
  gate(!!(w1.sandbox.crypto && w1.sandbox.crypto.subtle), 'mock1 subtle shim installed');
  const inst = w1.posted.filter(m => m && m.k === 'wlog' && /installed/.test(String(m.m)));
  gate(inst.length === 1, 'mock1 wlog install witness', JSON.stringify(inst[0] || null));
  gate(typeof w1.sandbox.fetch === 'function', 'mock1 fetch relay present');

  (async () => {
    const S = w1.sandbox.crypto.subtle;
    const enc = s => Array.from(Buffer.from(s, 'utf8'));
    const hex = b => Buffer.from(b).toString('hex');
    const nodeHex = (alg, bytes) => crypto.createHash(alg).update(Buffer.from(bytes)).digest('hex');
    const vectors = {
      'SHA-256': [enc(''), enc('abc'), enc('a').concat(Array(54).fill(0x61)), Array.from({ length: 64 }, (_, i) => i), Array.from({ length: 1000 }, (_, i) => (i * 13) & 255)],
      'SHA-512': [enc(''), enc('abc'), enc('hello world'), Array.from({ length: 128 }, (_, i) => i), Array.from({ length: 1000 }, (_, i) => (i * 13) & 255)],
      'SHA-384': [enc(''), enc('abc'), enc('hello world'), Array.from({ length: 128 }, (_, i) => i), Array.from({ length: 1000 }, (_, i) => (i * 13) & 255)],
    };
    let digOk = true, digDetail = '';
    for (const alg of Object.keys(vectors)) {
      for (const v of vectors[alg]) {
        try {
          const buf = await S.digest(alg, v);
          const got = Buffer.from(buf).toString('hex');
          if (got !== nodeHex(alg === 'SHA-256' ? 'sha256' : alg === 'SHA-512' ? 'sha512' : 'sha384', v)) { digOk = false; digDetail += alg + '/' + v.length + ' '; }
        } catch (e) { digOk = false; digDetail += alg + ' threw ' + e.message + ' '; }
      }
    }
    gate(digOk, 'mock1 digest battery vs node crypto', digDetail || '15 vectors byte-exact');
    const abc = enc('abc');
    const bigBuf = new Uint8Array([9, 9, 97, 98, 99, 9, 9]);
    const view = new Uint8Array(bigBuf.buffer, bigBuf.byteOffset + 2, 3);
    const formAb = new Uint8Array(abc).buffer;
    let fOk = true, fD = '';
    try {
      const a1 = hex(await S.digest('SHA-256', formAb));
      const a2 = hex(await S.digest('SHA-256', view));
      const a3 = hex(await S.digest({ name: 'SHA-256' }, abc));
      const want = nodeHex('sha256', abc);
      fOk = a1 === want && a2 === want && a3 === want;
      fD = a1.slice(0, 8) + ' ' + a2.slice(0, 8) + ' ' + a3.slice(0, 8);
    } catch (e) { fOk = false; fD = e.message; }
    gate(fOk, 'mock1 digest input forms (ArrayBuffer, offset view, alg object)', fD);
    let rej = null;
    try { await S.digest('SHA-1', abc); } catch (e) { rej = e; }
    gate(nFail(rej), 'mock1 unsupported alg rejects NotSupportedError', rej && rej.message);
    const dlog = w1.posted.filter(m => m && m.k === 'wlog' && /zc digest SHA-512 3B/.test(String(m.m)));
    gate(dlog.length === 1, 'mock1 digest wlog witness', JSON.stringify(w1.posted.filter(m => m && m.k === 'wlog').map(m => m.m)));
    try {
      const k = await S.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
      gate(k && k.zlFake === true && typeof k.zlK === 'string' && k.zlK.length > 20, 'mock1 generateKey stub shape');
      const jwk = await S.exportKey('jwk', k);
      gate(jwk && jwk.kty === 'oct' && jwk.k === k.zlK, 'mock1 exportKey jwk round-trip');
      const k2 = await S.importKey('jwk', jwk, { name: 'AES-GCM' }, true, ['encrypt']);
      gate(k2 && k2.zlK === jwk.k, 'mock1 importKey round-trip');
      const raw = await S.exportKey('raw', k);
      gate(!!raw && raw.length === 32, 'mock1 exportKey raw b64 decode', 'len=' + (raw && raw.length));
      let eR = null; try { await S.encrypt({ name: 'AES-GCM' }, k, new Uint8Array(4)); } catch (e) { eR = e; }
      gate(nFail(eR), 'mock1 encrypt rejects honestly');
      const db = await S.deriveBits({ name: 'HKDF' }, k, 64);
      gate(db && db.byteLength === 8, 'mock1 deriveBits length');
      const uuid = w1.sandbox.crypto.randomUUID();
      gate(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid), 'mock1 randomUUID v4 shape', uuid);
      const rv = new Uint8Array(8); const rr = w1.sandbox.crypto.getRandomValues(rv);
      gate(rr === rv, 'mock1 getRandomValues passthrough');
    } catch (e) { gate(false, 'mock1 key stubs', e.message); }
    try {
      const p = w1.sandbox.fetch('rel/x.js');
      gate(p && typeof p.then === 'function', 'mock1 fetch returns Promise');
      await new Promise(r => setImmediate(r));
      const req = w1.posted.filter(m => m && m.k === 'req').pop();
      gate(!!req && req.url === BASE + 'rel/x.js' && req.method === 'GET' && req.__zlwf === 1, 'mock1 fetch relay req shape', JSON.stringify(req || null));
    } catch (e) { gate(false, 'mock1 fetch relay', e.message); }

    const w2 = makeWorkerSandbox(true);
    try { vm.runInContext(code, w2.sandbox); } catch (e) { console.log('vm run2 threw: ' + e.message); }
    gate(w2.sandbox.crypto.subtle === w2.realSubtle, 'mock2 no-install when subtle present');
    gate(w2.posted.filter(m => m && m.k === 'wlog' && /installed/.test(String(m.m))).length === 0, 'mock2 no install wlog');
    gate(w2.sandbox.__zlwf === 1, 'mock2 prelude still runs');

    /* ---------- mock: bridge wlog handler ---------- */
    const bstart = out.indexOf('function zlWkBridge(real, d, ctl) {');
    gate(bstart > 0, 'bridge located');
    if (bstart > 0) {
      let depth = 0, i = out.indexOf('{', bstart), bend = -1, inStr = null, escp = false;
      for (; i < out.length; i++) {
        const c = out[i];
        if (inStr) {
          if (escp) { escp = false; continue; }
          if (c === '\\') { escp = true; continue; }
          if (c === inStr) inStr = null;
          continue;
        }
        if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { bend = i; break; } }
      }
      gate(bend > 0, 'bridge brace-balanced');
      if (bend > 0) {
        const bsrc = out.slice(bstart, bend + 1);
        const flogs = [];
        const sent = [];
        const ctlM = new Map();
        const ctx = {
          real: { postMessage: function (m) { sent.push(m); } },
          flog: function (tag, msg) { flogs.push([tag, msg]); },
          window: { fetch: function () { return Promise.resolve({}); } },
          AbortController, Promise, Map, Uint8Array, TextDecoder, URL, JSON, String, Object, Array, ctl: ctlM,
        };
        try {
          vm.createContext(ctx);
          const fn = vm.runInContext('(' + bsrc + ')', ctx);
          fn(ctx.real, { __zlwf: 1, k: 'wlog', m: 'zc subtle shim installed sha256 sha384 sha512' }, ctlM);
          gate(flogs.length === 1 && flogs[0][0] === 'worker' && /^wl zc subtle shim installed/.test(flogs[0][1]), 'bridge wlog -> flog', JSON.stringify(flogs));
          gate(sent.length === 0, 'bridge wlog no postMessage');
          flogs.length = 0;
          fn(ctx.real, { __zlwf: 1, k: 'weird', m: 'x' }, ctlM);
          gate(flogs.length === 0 && sent.length === 0, 'bridge unknown k early-return');
        } catch (e) { gate(false, 'bridge mock', e.message); }
      }
    }

    console.log(fails === 0 ? 'ALL GATES PASS' : 'GATE FAILURES: ' + fails);
    if (fails === 0) {
      fs.writeFileSync('/tmp/lb/out.html', out);
      console.log('WROTE /tmp/lb/out.html');
      console.log('md5=' + md5(out));
      console.log('size=' + out.length);
    } else {
      console.log('NOT WRITING out.html');
      process.exitCode = 1;
    }
  })().catch(e => { console.log('async gate crash: ' + (e && e.stack)); process.exitCode = 1; });
}