// builder104.cjs — LB Lite r104: epoxy pair swap (crash fix for native voice)
// Base: r103 (md5 85a8957eecc36ee2f8a2c1306067f97a, 9,726,783 bytes)
// Splices: badge, ZL_VERSION, note, zl-epoxy-src content, zl-epoxy-wasm-b64 content.
'use strict';
const fs = require('fs');
const crypto = require('crypto');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r103.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r104.html';
const BASE_MD5 = '85a8957eecc36ee2f8a2c1306067f97a';
const BASE_SIZE = 9726783;
const NEW_WASM_SHA256 = '6938320f271dd266e36a49dba5d43fba82e5797bae5a1589ecc4ba39b1f85ec6';
const OLD_WASM_SHA256_PREFIX = 'c263b955';

const NOTE_R104 =
  "r104 (EPOXY PAIR SWAP, lane continuation: the native voice test crashed the old embedded engine with a null pointer assertion inside its wasm, so the toggle never reached the wire. Diagnosis: the artifact embeds a custom engine pair from the original port, not one of the pinned release pairs, and its plain native path was never exercised before this lane. Change: the artifact now embeds the current pinned release pair, the same byte-verified pair the live origins serve, with its glue inlined the way the original embed did, helper module inlined, export markers stripped, module path branch replaced with a plain fallback. Live smoke test before shipping: both voices fetched the search page clean through the public relay, and the native voice no longer crashes. The TLS voice setting and the ready log witness carry over unchanged. All else byte-identical to the previous ship. Honest bounds: a cold single fetch passes with either voice, so the wall lives in the full session pattern rather than a first-contact fingerprint check, and if the plain voice still draws the wall across a real session the trigger sits deeper than the handshake shape and the parity wave is the remaining lane.)";

// ---- browser-exact block scanner: close only on "</script" + [>\t\n\r /] ----
function scanBlocks(raw) {
  const blocks = [];
  let p = 0;
  for (;;) {
    const s = raw.indexOf('<script', p);
    if (s < 0) break;
    const gt = raw.indexOf('>', s);
    if (gt < 0) throw new Error('script open tag without >');
    const attrs = raw.slice(s, gt);
    let i = gt + 1;
    let close = -1;
    for (;;) {
      const c = raw.indexOf('</script', i);
      if (c < 0) break;
      const nxt = raw[c + 8];
      if (nxt === '>' || nxt === '/' || nxt === ' ' || nxt === '\t' || nxt === '\n' || nxt === '\r') { close = c; break; }
      i = c + 8;
    }
    if (close < 0) throw new Error('unclosed script block at ' + s);
    const type = /type="([^"]*)"/.exec(attrs);
    const id = /id="([^"]*)"/.exec(attrs);
    blocks.push({ start: s, gt, close, end: close + 9, type: type ? type[1] : '', id: id ? id[1] : null, content: raw.slice(gt + 1, close) });
    p = close + 9;
  }
  return blocks;
}

function count(hay, needle) {
  let n = 0, p = 0;
  for (;;) { const i = hay.indexOf(needle, p); if (i < 0) return n; n++; p = i + needle.length; }
}
function spliceOnce(hay, oldStr, newStr, label) {
  const n = count(hay, oldStr);
  if (n !== 1) throw new Error('SPLICE ' + label + ' expected 1 occurrence, found ' + n);
  return hay.replace(oldStr, newStr);
}

function main() {
  const raw = fs.readFileSync(BASE_PATH, 'utf8');
  const md5 = crypto.createHash('md5').update(Buffer.from(raw, 'utf8')).digest('hex');
  const size = Buffer.byteLength(raw, 'utf8');
  if (md5 !== BASE_MD5) throw new Error('G1 FAIL base md5 ' + md5);
  if (size !== BASE_SIZE) throw new Error('G1 FAIL base size ' + size);
  console.log('G1 base md5+size ok');

  // ---- G5 pre: block census on base ----
  const blocksPre = scanBlocks(raw);
  const jsPre = blocksPre.filter(b => b.type === '' || b.type === 'module' || b.type === 'text/javascript');
  const rtPre = blocksPre.find(b => b.id === 'zlRuntime');
  if (!rtPre) throw new Error('G5b FAIL no zlRuntime block');
  const rtHashPre = crypto.createHash('sha256').update(rtPre.content).digest('hex');
  try { new Function(rtPre.content); } catch (e) { throw new Error('G5b FAIL zlRuntime base parse: ' + e.message); }
  console.log('G5 pre blocks=' + blocksPre.length + ' js=' + jsPre.length);
  if (blocksPre.length !== 15) throw new Error('G5 FAIL expected 15 blocks, got ' + blocksPre.length);
  if (jsPre.length !== 9) throw new Error('G5 FAIL expected 9 js blocks, got ' + jsPre.length);
  let fails = 0;
  for (const b of jsPre) { try { new Function(b.content); } catch (e) { fails++; console.log('  pre-parse-fail @' + b.start + ': ' + e.message); } }
  if (fails !== 0) throw new Error('G5 FAIL base has ' + fails + ' parse failures');
  const jsHashPre = jsPre.map(b => crypto.createHash('sha256').update(b.content).digest('hex'));
  const runtimeIdx = jsPre.findIndex(b => b.content.includes('ZL_VERSION'));
  if (runtimeIdx < 0) throw new Error('G5 FAIL no ZL_VERSION js block');

  // ---- G2/G3: badge + version ----
  let out = spliceOnce(raw, 'build rv-r103', 'build rv-r104', 'badge');
  out = spliceOnce(out, "var ZL_VERSION = 'zl-ship86';", "var ZL_VERSION = 'zl-ship87';", 'version');
  console.log('G2/G3 badge+version ok');

  // ---- G4: note ----
  const noteOld = /r103 \(TLS VOICE LANE[^']*?\)/;
  const m = noteOld.exec(out);
  if (!m || count(out, m[0]) !== 1) throw new Error('G4 FAIL note anchor not unique');
  out = spliceOnce(out, m[0], NOTE_R104, 'note');
  for (const bad of ["'", '\\', '$', '`', '</script']) if (NOTE_R104.includes(bad)) throw new Error('G4 FAIL note contains forbidden: ' + JSON.stringify(bad));
  for (const stale of ['r103', 'r102', 'r101', 'zl-ship', 'rv-r']) if (NOTE_R104.includes(stale)) throw new Error('G4 FAIL note contains stale literal: ' + stale);
  if (/\d\.\d/.test(NOTE_R104)) throw new Error('G4 FAIL note contains decimal version');
  console.log('G4 note ok (' + NOTE_R104.length + ' chars)');

  // ---- G-epoxy-src: block content swap ----
  const glue = fs.readFileSync('/tmp/epoxy-new-glue.js', 'utf8');
  const glueTrim = glue.replace(/\n$/, '');
  const blocksMid = scanBlocks(out);
  const srcB = blocksMid.find(b => b.id === 'zl-epoxy-src');
  if (!srcB) throw new Error('FAIL no zl-epoxy-src block');
  const oldSrcRaw = srcB.content;
  if (oldSrcRaw.length !== 56434) throw new Error('FAIL old src raw len ' + oldSrcRaw.length);
  const newSrcRaw = '\n' + glueTrim + '\n';
  out = spliceOnce(out, oldSrcRaw, newSrcRaw, 'epoxy-src');
  // parse new glue under the EXACT artifact runtime harness (zlEpoxyReady)
  const mod = new Function(glueTrim + "\nreturn { init: typeof __wbg_init === 'function' ? __wbg_init : undefined, EpoxyClient: EpoxyClient, EpoxyClientOptions: EpoxyClientOptions };")();
  if (typeof mod.init !== 'function' || typeof mod.EpoxyClient !== 'function' || typeof mod.EpoxyClientOptions !== 'function') throw new Error('FAIL new glue runtime harness exports missing');
  if (glueTrim.includes('</script')) throw new Error('FAIL new glue contains </script');
  console.log('G-src swap ok old=' + oldSrcRaw.length + ' new=' + newSrcRaw.length + ' glue=' + glueTrim.length);

  // ---- G-epoxy-wasm-b64: block content swap + sha gate ----
  const b64 = fs.readFileSync('/tmp/wasm-b64.txt', 'utf8').replace(/\n$/, '');
  const wasmBuf = Buffer.from(b64, 'base64');
  const wsha = crypto.createHash('sha256').update(wasmBuf).digest('hex');
  if (wsha !== NEW_WASM_SHA256) throw new Error('FAIL new wasm sha ' + wsha);
  const b64B = blocksMid.find(b => b.id === 'zl-epoxy-wasm-b64');
  const oldB64Raw = b64B.content;
  const oldWasmBuf = Buffer.from(oldB64Raw.trim(), 'base64');
  const oldSha = crypto.createHash('sha256').update(oldWasmBuf).digest('hex');
  if (!oldSha.startsWith(OLD_WASM_SHA256_PREFIX)) throw new Error('FAIL old wasm sha unexpected ' + oldSha.slice(0, 8));
  if (oldB64Raw.length !== 6439061) throw new Error('FAIL old b64 raw len ' + oldB64Raw.length);
  const newB64Raw = '\n' + b64;
  out = spliceOnce(out, oldB64Raw, newB64Raw, 'epoxy-wasm-b64');
  console.log('G-wasm swap ok old=' + oldB64Raw.length + ' new=' + newB64Raw.length + ' wasm=' + wasmBuf.length + ' sha ok');

  // ---- G10: tlsVoice seam carry-over ----
  const c_get = count(out, "getS('tlsVoice', 'ua')");
  const c_set = count(out, "setS('tlsVoice'");
  const c_id = count(out, 'id="setTlsVoice"');
  const c_nat = count(out, "'native' ? 0");
  if (c_get !== 2 || c_set !== 1 || c_id !== 1 || c_nat !== 1) throw new Error('G10 FAIL tlsVoice seams ' + c_get + '/' + c_set + '/' + c_id + '/' + c_nat);
  console.log('G10 tlsVoice seams ok');

  // ---- G5 post ----
  const blocksPost = scanBlocks(out);
  const jsPost = blocksPost.filter(b => b.type === '' || b.type === 'module' || b.type === 'text/javascript');
  if (blocksPost.length !== 15 || jsPost.length !== 9) throw new Error('G5 FAIL post census ' + blocksPost.length + '/' + jsPost.length);
  const rtPost = blocksPost.find(b => b.id === 'zlRuntime');
  const rtHashPost = crypto.createHash('sha256').update(rtPost.content).digest('hex');
  if (rtHashPost !== rtHashPre) throw new Error('G5b FAIL zlRuntime changed');
  try { new Function(rtPost.content); } catch (e) { throw new Error('G5b FAIL zlRuntime post parse: ' + e.message); }
  console.log('G5b zlRuntime unchanged + parses ok');
  let failsPost = 0;
  for (const b of jsPost) { try { new Function(b.content); } catch (e) { failsPost++; console.log('  post-parse-fail @' + b.start + ': ' + e.message); } }
  if (failsPost !== 0) throw new Error('G5 FAIL output has parse failures: ' + failsPost);
  const jsHashPost = jsPost.map(b => crypto.createHash('sha256').update(b.content).digest('hex'));
  let changed = 0;
  for (let i = 0; i < 9; i++) if (jsHashPre[i] !== jsHashPost[i]) { changed++; console.log('  changed js block idx ' + i + ' starts ' + jsPost[i].start); }
  if (changed !== 1) throw new Error('G5 FAIL expected exactly 1 changed js block, got ' + changed);
  const rtBlock = jsPost.find(b => b.content.includes("var ZL_VERSION = 'zl-ship87';"));
  if (!rtBlock) throw new Error('G5 FAIL changed block must contain ZL_VERSION');
  if (!rtBlock.content.includes(NOTE_R104)) throw new Error('G5 FAIL changed block must carry note');
  if (count(out, 'build rv-r104') !== 1) throw new Error('G5 FAIL badge count != 1 in output');
  console.log('G5 post ok: 15 blocks, 9 js, 0 fails, 1 changed js block');

  // ---- size math ----
  const expectedSize = BASE_SIZE
    - oldSrcRaw.length + newSrcRaw.length
    - oldB64Raw.length + newB64Raw.length
    + (NOTE_R104.length - m[0].length);
  const outSize = Buffer.byteLength(out, 'utf8');
  if (outSize !== expectedSize) throw new Error('SIZE FAIL expected ' + expectedSize + ' got ' + outSize);
  console.log('G-size ok ' + outSize + ' (delta ' + (outSize - BASE_SIZE) + ')');

  // ---- publish ----
  fs.writeFileSync(OUT_PATH, out, 'utf8');
  const rb = fs.readFileSync(OUT_PATH);
  const rmd5 = crypto.createHash('md5').update(rb).digest('hex');
  if (rmd5 === BASE_MD5) throw new Error('FAIL output identical to base');
  if (rb.length !== outSize) throw new Error('FAIL re-read size mismatch');
  console.log('PUBLISHED ' + OUT_PATH);
  console.log('md5 ' + rmd5);
  console.log('bytes ' + rb.length);
  console.log('RESULT OK');
}

main();
