#!/usr/bin/env node
// builder109.cjs - SOLVE GATE LANE over r108 (fence gate fix + fallback witness)
const fs = require('fs'), crypto = require('crypto');
const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r108.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r109.html';
const BASE_MD5 = '904899e0c06c34a91e8133cc033a3edd';
const BASE_SIZE = 5996975;
const WASM_SHA256 = '6938320f271dd266e36a49dba5d43fba82e5797bae5a1589ecc4ba39b1f85ec6';
const B64_LEN = 2710068;
const GLUE_LEN = 52748;

const base = fs.readFileSync(BASE_PATH, 'utf8');
let fails = 0;
function gate(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' ' + detail : ''));
  if (!ok) fails++;
}
const md5 = (b) => crypto.createHash('md5').update(b).digest('hex');

gate('G1 base md5', md5(base) === BASE_MD5, md5(base));
gate('G1b base size', Buffer.byteLength(base) === BASE_SIZE, String(Buffer.byteLength(base)));

const NOTE_OLD = "build=' + Q + 'r108 (VOICE LANE: the r106 export shows the session rode the plain native hello, which is bot-class wire for google and the likeliest trigger of the sorry wall, so the voice ladder now tries both shaped voices before native and the ready log names the live identity as chromium one, firefox two, native zero; when native is active with a Chromium UA the engine logs a wall warning; the wisp v1 same-relay retry and the sorry auto-solve fence from r107 are preserved unchanged; set TLS voice to ua to ride the shaped hello)";
const NOTE_NEW = "build=' + Q + 'r109 (SOLVE GATE LANE: the operator export proves the r107 solve fence never fired, its gate read location href and in the vessel that is a blob null address; the fence now reads the page own html for the onload attribute that names the solver, then polls and makes the exact call; the same export shows the defining script lands plus 335ms after onload threw, so the poll will find it; a fallback-body witness line lands for the recaptcha fallback page; the voice ladder and wisp v1 retry from r108 stand; set the custom wisp relay to mercurywork to leave the shared relay IP)";

const FENCE_OLD = "/* r107: sorry auto-solve: the defining script lands through the tunnel after the onload already fired, so the guarded call never runs. Poll and make the exact call the onload wanted, once. */\n    try {\n      if (/google\\.com\\/sorry/i.test(String(location.href))) {\n        var ssN = 0, ssDone = false;\n        var ssIv = setInterval(function () {\n          if (ssDone) return;\n          ssN++;\n          if (typeof window.solveSimpleChallenge === 'function') {\n            ssDone = true; clearInterval(ssIv);\n            L('solve', 'found after ' + ssN + ' polls, calling');\n            try { window.solveSimpleChallenge(0, 0); } catch (eS) { L('solve', 'call failed ' + String((eS && eS.message) || eS).slice(0, 120)); }\n          } else if (ssN >= 100) {\n            ssDone = true; clearInterval(ssIv);\n            L('solve', 'no global definition after 100 polls');\n          } else if (ssN === 1 || ssN % 10 === 0) {\n            L('solve', 'poll ' + ssN + ' no definition yet');\n          }\n        }, 300);\n      }\n    } catch (eSS) {}";
const FENCE_NEW = "/* r109: sorry auto-solve: the r107 gate read location href, but the vessel location is a blob null address, proven by the r108 field export, so it never fired. The gate now reads the page own html for the onload attribute that names the solver, then polls and makes the exact call the onload wanted, once. */\n    try {\n      var ssN = 0, ssDone = false, ssPage = false;\n      var ssIv = setInterval(function () {\n        if (ssDone) return;\n        ssN++;\n        if (!ssPage) {\n          try {\n            var hs = document.documentElement && document.documentElement.innerHTML ? String(document.documentElement.innerHTML) : '';\n            ssPage = /onload=[^>]*solveSimpleChallenge/.test(hs.slice(0, 9000)) || /google\\.com\\/sorry/i.test(String(location.href));\n          } catch (eG) {}\n        }\n        if (!ssPage) { if (ssN >= 100) clearInterval(ssIv); return; }\n        if (typeof window.solveSimpleChallenge === 'function') {\n          ssDone = true; clearInterval(ssIv);\n          L('solve', 'found after ' + ssN + ' polls, calling');\n          try { window.solveSimpleChallenge(0, 0); } catch (eS) { L('solve', 'call failed ' + String((eS && eS.message) || eS).slice(0, 120)); }\n        } else if (ssN >= 100) {\n          ssDone = true; clearInterval(ssIv);\n          L('solve', 'no global definition after 100 polls');\n        } else if (ssN === 1 || ssN % 10 === 0) {\n          L('solve', 'poll ' + ssN + ' no definition yet');\n        }\n      }, 300);\n    } catch (eSS) {}";

const FB_OLD = "      }\n      zlLog('cap', kind + ' s='";
const FB_NEW = "      }\n      if (u8 && /recaptcha\\/enterprise\\/fallback/i.test(u)) { zlLog('cap', 'fallback-body bytes=' + u8.length); }\n      zlLog('cap', kind + ' s='";

const SPLICES = [
  ['badge', 'rv-r108', 'rv-r109'],
  ['version', 'zl-ship91', 'zl-ship92'],
  ['note', NOTE_OLD, NOTE_NEW],
  ['fence', FENCE_OLD, FENCE_NEW],
  ['fallback', FB_OLD, FB_NEW],
];

for (const [name, oldS] of SPLICES) {
  const c = base.split(oldS).length - 1;
  gate('G2 anchor once ' + name, c === 1, 'count=' + c);
}
let out = base;
for (const [name, oldS, newS] of SPLICES) {
  if (out.split(oldS).length - 1 !== 1) { gate('G3 apply ' + name, false); continue; }
  out = out.replace(oldS, newS);
  gate('G3 apply ' + name, true);
}
let recon = base;
for (const [name, oldS, newS] of SPLICES) recon = recon.replace(oldS, newS);
gate('G4 reconstruction byte-exact', recon === out);

gate('G5a rv-r109 once', out.split('rv-r109').length - 1 === 1);
gate('G5b zl-ship92 once', out.split('zl-ship92').length - 1 === 1);
gate('G5c rv-r108 gone', !out.includes('rv-r108'));
gate('G5d zl-ship91 gone', !out.includes('zl-ship91'));
gate('G5e note once', out.split('r109 (SOLVE GATE LANE').length - 1 === 1);
gate('G5f old note gone', !out.includes('r108 (VOICE LANE'));
gate('G5g old fence gone', !out.includes('r107: sorry auto-solve'));
gate('G5h new gate present once', out.split('onload=[^>]*solveSimpleChallenge').length - 1 === 1);
gate('G5i solveSimpleChallenge count 4', (out.split('solveSimpleChallenge').length - 1) === 4, 'count=' + (out.split('solveSimpleChallenge').length - 1));
gate('G5j L solve count 4', (out.split("L('solve'").length - 1) === 4);
gate('G5k fallback witness once', out.split('fallback-body bytes=').length - 1 === 1);
gate('G5l String location href kept twice', (out.split('String(location.href)').length - 1) === 2, 'count=' + (out.split('String(location.href)').length - 1));

const noteLit = NOTE_NEW.slice("build=' + Q + '".length);
gate('G6a note single line', !noteLit.includes('\n'));
gate('G6b note no apostrophe', !noteLit.includes("'"));
gate('G6c note no backslash', !noteLit.includes('\\'));
gate('G6d note no dollar', !noteLit.includes('$'));
gate('G6e note no backtick', !noteLit.includes('`'));
gate('G6f note no script closer', !noteLit.includes('</script'));
gate('G6g note no decimal', !/\d\.\d/.test(noteLit));
gate('G6h note no zl-ship', !noteLit.includes('zl-ship'));

function blocks(src) {
  const res = []; let i = 0;
  while (true) {
    const o = src.indexOf('<script', i);
    if (o < 0) break;
    let j = o + 7;
    while (j < src.length && !'/> \t\n\r'.includes(src[j])) j++;
    const c = src.indexOf('</script', j);
    if (c < 0) { res.push(src.slice(o)); break; }
    let k = c + 8;
    res.push(src.slice(o, k));
    i = k;
  }
  return res;
}
const baseBlocks = blocks(base), outBlocks = blocks(out);
gate('G7a block count 15', outBlocks.length === 15, 'count=' + outBlocks.length);
const changed = [];
for (let b = 0; b < Math.min(outBlocks.length, baseBlocks.length); b++) if (outBlocks[b] !== baseBlocks[b]) changed.push(b);
gate('G7b exactly one changed naive block (shell main 10)', JSON.stringify(changed) === JSON.stringify([10]), 'changed=' + JSON.stringify(changed));
// G7d: the fence lives in the naive GAP between blocks 7 and 8: the zlRuntime text/plain element carries an inner script-closer literal inside its own text, so the scanner cuts block 7 early at 980212 and the vessel tail (capWatch + fence, offset ~1045119) is gap territory no naive block covers. Prove the gap differs by exactly the S4 splice.
function blockOffsets(src) {
  const res = []; let i = 0;
  while (true) {
    const o = src.indexOf('<script', i); if (o < 0) break;
    let j = o + 7; while (j < src.length && !'/> \t\n\r'.includes(src[j])) j++;
    const c = src.indexOf('</script', j);
    if (c < 0) { res.push([o, src.length]); break; }
    res.push([o, c + 8]); i = c + 8;
  }
  return res;
}
const bo = blockOffsets(base), oo = blockOffsets(out);
const gapB = base.slice(bo[7][1], bo[8][0]);
const gapO = out.slice(oo[7][1], oo[8][0]);
gate('G7d naive gap differs by exactly the fence splice', gapB.includes(FENCE_OLD) && gapO === gapB.replace(FENCE_OLD, FENCE_NEW), 'gap ' + gapB.length + '->' + gapO.length);

function tryParse(code) { try { new Function(code); return true; } catch (e) { return false; } }
function blockBody(blk) {
  const m = blk.match(/<script[^>]*>([\s\S]*)<\/script/);
  return m ? m[1] : blk;
}
const baseParse = baseBlocks.map(b => tryParse(blockBody(b)));
const outParse = outBlocks.map(b => tryParse(blockBody(b)));
const fs1 = JSON.stringify(baseParse.map((p, i) => p ? null : i).filter(x => x !== null));
const fs2 = JSON.stringify(outParse.map((p, i) => p ? null : i).filter(x => x !== null));
gate('G8a parse fail-set identical', fs1 === fs2, fs2 + ' vs ' + fs1);

// G9: fence extraction parse + behavioral mock (the fence is the fix, gate it hard)
const fstart = out.indexOf('/* r109: sorry auto-solve');
const fend = out.indexOf('} catch (eSS) {}', fstart);
gate('G9a fence found', fstart > 0 && fend > fstart);
if (fstart > 0 && fend > fstart) {
  const fence = out.slice(fstart, fend + '} catch (eSS) {}'.length);
  // parse
  try { new Function('L', 'window', 'document', 'setInterval', 'clearInterval', 'location', fence); gate('G9b fence parses', true); }
  catch (e) { gate('G9b fence parses', false, String(e).slice(0, 120)); }
  // behavioral mock: controllable interval
  const vm = require('vm');
  function runMock(docHtml, defineAfter, defineGlobal, label) {
    const logs = [];
    let intervalFn = null, cleared = 0;
    const ctx = {
      L: (c, d) => logs.push(c + ' ' + d),
      window: {},
      document: { documentElement: { innerHTML: docHtml } },
      location: { href: 'blob:null/deadbeef-0000' },
      setInterval: (fn) => { intervalFn = fn; return 7; },
      clearInterval: () => { cleared++; },
    };
    ctx.window.solveSimpleChallenge = undefined;
    vm.createContext(ctx);
    vm.runInContext(fence, ctx);
    let called = 0;
    let ticks = 0;
    while (intervalFn && ticks < 250) {
      ticks++;
      if (ticks === defineAfter && defineGlobal) ctx.window.solveSimpleChallenge = function (a, b) { called++; ctx.__callArgs = [a, b]; };
      try { intervalFn(); } catch (e) { logs.push('MOCKTHREW ' + String(e).slice(0, 80)); break; }
      if (cleared > 0 && (logs.some(l => l.startsWith('solve found')) || logs.some(l => l.includes('no global definition')))) break;
    }
    return { logs, called, ticks, cleared, args: ctx.__callArgs || null };
  }
  const sorryHtml = '<html><head></head><body style="margin:0px; overscroll-behavior:contain;" onload="e=document.getElementById(\'captcha\');if(e){e.focus();} if(solveSimpleChallenge) {solveSimpleChallenge(0,0);}"><div>hi</div></body></html>';
  const m1 = runMock(sorryHtml, 2, true, 'sorry-page define@2');
  gate('G9c sorry page: fence fires and calls solver', m1.called === 1, JSON.stringify(m1.logs.slice(0, 4)));
  gate('G9d sorry page: found-log names poll count', m1.logs.some(l => l.startsWith('solve found after ') && l.includes('polls, calling')), JSON.stringify(m1.logs.filter(l => l.startsWith('solve'))));
  gate('G9e call args exact 0,0', JSON.stringify(m1.args) === '[0,0]', JSON.stringify(m1.args));
  const m2 = runMock(sorryHtml, 999, false, 'sorry-page never-defined');
  gate('G9f never-defined: logs no-global after 100 polls', m2.logs.some(l => l === 'solve no global definition after 100 polls'), JSON.stringify(m2.logs.filter(l => l.startsWith('solve'))));
  const m3 = runMock('<html><body>normal page</body></html>', 999, false, 'normal page');
  gate('G9g normal page: silent', m3.logs.filter(l => l.startsWith('solve')).length === 0 && m3.called === 0, JSON.stringify(m3.logs.slice(0, 3)));
  function vmRunArgs(m) { try { return JSON.stringify(m && m.called ? [0, 0] : null); } catch (e) { return 'err'; } }
}

// G10 payload regions unchanged
function payload(src, id) {
  const a = src.indexOf('id="' + id + '"');
  if (a < 0) return null;
  const o = src.indexOf('>', a);
  const c = src.indexOf('</script', o);
  if (o < 0 || c < 0) return null;
  return src.slice(o + 1, c);
}
const glueB = payload(base, 'zl-epoxy-src'), glueO = payload(out, 'zl-epoxy-src');
gate('G10a glue byte-identical', glueB === glueO && glueB !== null);
gate('G10b glue len 52748 raw', glueB.length === GLUE_LEN, 'len=' + glueB.length);
const b64B = payload(base, 'zl-epoxy-wasm-b64'), b64O = payload(out, 'zl-epoxy-wasm-b64');
gate('G10c wasm b64 byte-identical', b64B === b64O && b64B !== null);
const b64 = b64B.replace(/^\s+|\s+$/g, '');
gate('G10d wasm b64 len', b64.length === B64_LEN, 'len=' + b64.length);
const wasm = Buffer.from(b64, 'base64');
gate('G10e wasm sha256', crypto.createHash('sha256').update(wasm).digest('hex') === WASM_SHA256);

let delta = 0;
for (const [name, oldS, newS] of SPLICES) delta += Buffer.byteLength(newS) - Buffer.byteLength(oldS);
gate('G11 output size', Buffer.byteLength(out) === BASE_SIZE + delta, 'bytes=' + Buffer.byteLength(out) + ' expected=' + (BASE_SIZE + delta));

if (fails === 0) {
  fs.writeFileSync(OUT_PATH, out);
  console.log('WROTE ' + OUT_PATH + ' md5=' + md5(out) + ' size=' + Buffer.byteLength(out));
} else {
  console.log('FAILURES: ' + fails + ' - NOT WRITTEN');
  process.exit(1);
}
