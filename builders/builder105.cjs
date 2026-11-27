// builder105.cjs — LB Lite r105: lane robustness (full-pool chain walk + advance on wasm assertion)
// Base: r104 (md5 0d9f99f61d958e05315106ffeb3e7f49, 5,994,261 bytes)
'use strict';
const fs = require('fs');
const crypto = require('crypto');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r104.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r105.html';
const BASE_MD5 = '0d9f99f61d958e05315106ffeb3e7f49';
const BASE_SIZE = 5994261;

const NOTE_R105 =
  "r105 (LANE ROBUSTNESS, crash lane continuation: the pair swap did not stop the crash because the trigger is not the engine pair at all. Live tests of the shipped artifact in a real browser cleared the new pair on every voice and every relay, so the crash class lives in the session, most likely a relay that opens and then feeds the engine something it cannot survive. Two lane changes close that hole: the in-page engine now walks the entire relay pool instead of only the probe winner plus one, and a wasm assertion failure now counts as a dead relay and advances the lane instead of bricking every fetch behind the same error. A relay that crashes the engine gets one try, then the lane moves on. The TLS voice setting, the engine pair and the ready log witness carry over unchanged. Honest bounds: the root cause of the assertion itself is not proven, only fenced, and the diagnostic export from a crashing session is the fastest way to pin it.)";

const CHAIN_OLD =
  "    if (list.indexOf('wss://anura.pro/') < 0) list.push('wss://anura.pro/');\n" +
  "    if (activeRelay && list.indexOf(activeRelay) < 0) list.push(activeRelay);\n" +
  "    return list;";
const CHAIN_NEW =
  "    if (list.indexOf('wss://anura.pro/') < 0) list.push('wss://anura.pro/');\n" +
  "    if (activeRelay && list.indexOf(activeRelay) < 0) list.push(activeRelay);\n" +
  "    /* r105: walk the whole relay pool, not just the probe winner: one poisoned relay can no longer brick the lane */\n" +
  "    try { relayCandidates().forEach(function (u) { if (u && list.indexOf(u) < 0) list.push(u); }); } catch (eR105a) {}\n" +
  "    return list;";

const ADV_OLD = "if (epTry < epChain.length - 1 && /connect|refus|tls|handshake|socket|protocol|clos|auth|status/i.test(epMsg)) {";
const ADV_NEW = "if (epTry < epChain.length - 1 && /connect|refus|tls|handshake|socket|protocol|clos|auth|status|null pointer|assert/i.test(epMsg)) {";

const EXH_OLD =
  "        zlLog('epoxy', 'lane exhausted: ' + epMsg.slice(0, 120) + ' :: ' + String(url).slice(0, 110));\n" +
  "      }";
const EXH_NEW =
  "        zlLog('epoxy', 'lane exhausted: ' + epMsg.slice(0, 120) + ' :: ' + String(url).slice(0, 110));\n" +
  "        /* r105: an assertion means the engine object may be dead: drop it so the next fetch builds a fresh one */\n" +
  "        if (/null pointer|assert/i.test(epMsg)) { try { zlEpoxy.client = null; zlEpoxy.initP = null; zlEpoxy.url = null; } catch (eR105b) {} }\n" +
  "      }";

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
    blocks.push({ start: s, close, end: close + 9, type: type ? type[1] : '', id: id ? id[1] : null, content: raw.slice(gt + 1, close) });
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

  // G5 pre census + zlRuntime hash
  const blocksPre = scanBlocks(raw);
  const jsPre = blocksPre.filter(b => b.type === '' || b.type === 'module' || b.type === 'text/javascript');
  const rtPre = blocksPre.find(b => b.id === 'zlRuntime');
  if (!rtPre) throw new Error('G5b FAIL no zlRuntime');
  const rtHashPre = crypto.createHash('sha256').update(rtPre.content).digest('hex');
  try { new Function(rtPre.content); } catch (e) { throw new Error('G5b FAIL zlRuntime base parse: ' + e.message); }
  if (blocksPre.length !== 15 || jsPre.length !== 9) throw new Error('G5 FAIL pre census ' + blocksPre.length + '/' + jsPre.length);
  let fails = 0;
  for (const b of jsPre) { try { new Function(b.content); } catch (e) { fails++; } }
  if (fails !== 0) throw new Error('G5 FAIL base parse failures ' + fails);
  const jsHashPre = jsPre.map(b => crypto.createHash('sha256').update(b.content).digest('hex'));
  console.log('G5 pre ok: 15 blocks, 9 js, 0 fails');

  // G2/G3 badge + version
  let out = spliceOnce(raw, 'build rv-r104', 'build rv-r105', 'badge');
  out = spliceOnce(out, "var ZL_VERSION = 'zl-ship87';", "var ZL_VERSION = 'zl-ship88';", 'version');
  console.log('G2/G3 badge+version ok');

  // G4 note
  const noteOld = /r104 \(EPOXY PAIR SWAP[^']*?\)/;
  const m = noteOld.exec(out);
  if (!m || count(out, m[0]) !== 1) throw new Error('G4 FAIL note anchor');
  out = spliceOnce(out, m[0], NOTE_R105, 'note');
  for (const bad of ["'", '\\', '$', '`', '</script']) if (NOTE_R105.includes(bad)) throw new Error('G4 FAIL note forbidden ' + JSON.stringify(bad));
  for (const stale of ['r104', 'r103', 'r102', 'r101', 'zl-ship', 'rv-r']) if (NOTE_R105.includes(stale)) throw new Error('G4 FAIL note stale ' + stale);
  if (/\d\.\d/.test(NOTE_R105)) throw new Error('G4 FAIL note decimal');
  console.log('G4 note ok (' + NOTE_R105.length + ' chars)');

  // Splices D/E/F
  out = spliceOnce(out, CHAIN_OLD, CHAIN_NEW, 'chain');
  out = spliceOnce(out, ADV_OLD, ADV_NEW, 'advance-regex');
  out = spliceOnce(out, EXH_OLD, EXH_NEW, 'exhausted-reset');
  console.log('G-splices chain+regex+reset ok');

  // G10 carry-over seams
  const c_get = count(out, "getS('tlsVoice', 'ua')");
  const c_set = count(out, "setS('tlsVoice'");
  const c_id = count(out, 'id="setTlsVoice"');
  const c_nat = count(out, "'native' ? 0");
  if (c_get !== 2 || c_set !== 1 || c_id !== 1 || c_nat !== 1) throw new Error('G10 FAIL tlsVoice ' + c_get + '/' + c_set + '/' + c_id + '/' + c_nat);
  const c_wasm_sha = count(out, '6938320f'); // not in artifact; real check below via block decode
  // epoxy pair unchanged: src + wasm blocks byte-identical to base
  const srcPre = blocksPre.find(b => b.id === 'zl-epoxy-src').content;
  const bPre = blocksPre.find(b => b.id === 'zl-epoxy-wasm-b64').content;
  const blocksMid = scanBlocks(out);
  if (blocksMid.find(b => b.id === 'zl-epoxy-src').content !== srcPre) throw new Error('G10 FAIL epoxy src changed');
  if (blocksMid.find(b => b.id === 'zl-epoxy-wasm-b64').content !== bPre) throw new Error('G10 FAIL epoxy wasm changed');
  const wsha = crypto.createHash('sha256').update(Buffer.from(bPre.trim(), 'base64')).digest('hex');
  if (wsha !== '6938320f271dd266e36a49dba5d43fba82e5797bae5a1589ecc4ba39b1f85ec6') throw new Error('G10 FAIL wasm sha');
  console.log('G10 seams + pair unchanged ok');

  // new-feature gates
  if (count(out, 'null pointer|assert') !== 2) throw new Error('GF FAIL assert patterns != 2');
  if (count(out, 'relayCandidates().forEach') !== 1) throw new Error('GF FAIL pool walk != 1');
  if (count(out, 'walk the whole relay pool') !== 1) throw new Error('GF FAIL walk comment != 1');
  console.log('GF feature gates ok');

  // G5 post
  const blocksPost = scanBlocks(out);
  const jsPost = blocksPost.filter(b => b.type === '' || b.type === 'module' || b.type === 'text/javascript');
  if (blocksPost.length !== 15 || jsPost.length !== 9) throw new Error('G5 FAIL post census');
  const rtPost = blocksPost.find(b => b.id === 'zlRuntime');
  if (crypto.createHash('sha256').update(rtPost.content).digest('hex') !== rtHashPre) throw new Error('G5b FAIL zlRuntime changed');
  try { new Function(rtPost.content); } catch (e) { throw new Error('G5b FAIL zlRuntime post parse'); }
  let failsPost = 0;
  for (const b of jsPost) { try { new Function(b.content); } catch (e) { failsPost++; console.log('  post-fail @' + b.start + ': ' + e.message); } }
  if (failsPost !== 0) throw new Error('G5 FAIL post parse failures ' + failsPost);
  const jsHashPost = jsPost.map(b => crypto.createHash('sha256').update(b.content).digest('hex'));
  let changed = 0;
  for (let i = 0; i < 9; i++) if (jsHashPre[i] !== jsHashPost[i]) changed++;
  if (changed !== 1) throw new Error('G5 FAIL expected 1 changed js block, got ' + changed);
  const rtBlock = jsPost.find(b => b.content.includes("var ZL_VERSION = 'zl-ship88';"));
  if (!rtBlock || !rtBlock.content.includes(NOTE_R105)) throw new Error('G5 FAIL changed block must be runtime+note');
  if (count(out, 'build rv-r105') !== 1) throw new Error('G5 FAIL badge count');
  console.log('G5 post ok: 15 blocks, 9 js, 0 fails, 1 changed js block');

  // size math
  const expected = BASE_SIZE
    + (NOTE_R105.length - m[0].length)
    + (CHAIN_NEW.length - CHAIN_OLD.length)
    + (ADV_NEW.length - ADV_OLD.length)
    + (EXH_NEW.length - EXH_OLD.length);
  const outSize = Buffer.byteLength(out, 'utf8');
  if (outSize !== expected) throw new Error('SIZE FAIL expected ' + expected + ' got ' + outSize);
  console.log('G-size ok ' + outSize + ' (delta ' + (outSize - BASE_SIZE) + ')');

  // publish
  fs.writeFileSync(OUT_PATH, out, 'utf8');
  const rb = fs.readFileSync(OUT_PATH);
  const rmd5 = crypto.createHash('md5').update(rb).digest('hex');
  if (rmd5 === BASE_MD5 || rb.length !== outSize) throw new Error('FAIL output verification');
  console.log('PUBLISHED ' + OUT_PATH);
  console.log('md5 ' + rmd5);
  console.log('bytes ' + rb.length);
  console.log('RESULT OK');
}

main();
