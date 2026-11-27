#!/usr/bin/env node
// builder108.cjs - VOICE LANE over r107 (byte-exact splices + full gate chain)
const fs = require('fs'), crypto = require('crypto');
const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r107.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r108.html';
const BASE_MD5 = '8ec0c4017569d87f7ab7be2db91b1759';
const BASE_SIZE = 5996888;
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

// G1 base identity
gate('G1 base md5', md5(base) === BASE_MD5, md5(base));
gate('G1b base size', Buffer.byteLength(base) === BASE_SIZE, String(Buffer.byteLength(base)));

// ---- splices (each old must occur exactly once) ----
const NOTE_OLD = "build=' + Q + 'r107 (WALL LANE: the crash is fixed on the real machine, the export shows the engine brings up in 31ms on native voice, and the wall that remains is server-side. Two changes. First, the engine falls back to wisp v1 on the same relay before walking the chain, so a relay that rejects wisp v2 stays usable and traffic can ride a private IP instead of the shared default. Second, the sorry auto-solve race is fenced: the vessel polls for the solve function and makes the exact call the onload attribute wanted, logging whether the definition lands, so a walled session can still solve its way out and the next export names the scope. Honest bounds: the sorry wall itself is Google-side rate limiting on the shared relay IP; the durable fix is the parity wave, this build buys a private relay and a working challenge.))";
const NOTE_NEW = "build=' + Q + 'r108 (VOICE LANE: the r106 export shows the session rode the plain native hello, which is bot-class wire for google and the likeliest trigger of the sorry wall, so the voice ladder now tries both shaped voices before native and the ready log names the live identity as chromium one, firefox two, native zero; when native is active with a Chromium UA the engine logs a wall warning; the wisp v1 same-relay retry and the sorry auto-solve fence from r107 are preserved unchanged; set TLS voice to ua to ride the shaped hello)";
const LADDER_OLD = "      var voices106 = String(getS('tlsVoice', 'ua')) === 'native' ? [0, zlEpoxyVoice(ua)] : [zlEpoxyVoice(ua), 0];\n";
const LADDER_NEW = "      var sv108 = zlEpoxyVoice(ua); var ov108 = sv108 === 2 ? 1 : 2; var ntv108 = String(getS('tlsVoice', 'ua')) === 'native';\n      var voices106 = ntv108 ? [0, sv108, ov108] : [sv108, ov108, 0];\n";
const READY_OLD = "          zlLog('epoxy', 'client ready on ' + hostOf(ws) + ' in ' + (Date.now() - zlEpoxy.t0) + 'ms wasm=' + Math.round(b64.length * 0.75 / 1024) + 'KB voice=' + (voices106[vi106] === 0 ? 'native' : 'shaped') + (vi106 ? ' fallback' : '') + ' wisp=' + (zlEpoxy.v1 ? 'v1' : 'v2'));\n";
const READY_NEW = "          zlLog('epoxy', 'client ready on ' + hostOf(ws) + ' in ' + (Date.now() - zlEpoxy.t0) + 'ms wasm=' + Math.round(b64.length * 0.75 / 1024) + 'KB voice=' + (voices106[vi106] === 0 ? 'native(0)' : voices106[vi106] === 2 ? 'firefox(2)' : 'chromium(1)') + (vi106 ? ' fallback' : '') + ' wisp=' + (zlEpoxy.v1 ? 'v1' : 'v2'));\n          if (voices106[vi106] === 0 && /chrome|chromium|crios|edg/i.test(ua)) { try { zlLog('epoxy', 'native(0) hello is bot-class for google, walls likely: set TLS voice to ua'); } catch (eW108) {} }\n";
const CF_OLD = "zlLog('epoxy', 'construct failed voice=' + (voices106[vi106] === 0 ? 'native' : 'shaped') + ': ' + String((eC106 && eC106.message) || eC106).slice(0, 110));";
const CF_NEW = "zlLog('epoxy', 'construct failed voice=' + (voices106[vi106] === 0 ? 'native(0)' : voices106[vi106] === 2 ? 'firefox(2)' : 'chromium(1)') + ': ' + String((eC106 && eC106.message) || eC106).slice(0, 110));";

const SPLICES = [
  ['badge', 'rv-r107', 'rv-r108'],
  ['version', 'zl-ship90', 'zl-ship91'],
  ['note', NOTE_OLD, NOTE_NEW],
  ['ladder', LADDER_OLD, LADDER_NEW],
  ['readylog', READY_OLD, READY_NEW],
  ['constructfailed', CF_OLD, CF_NEW],
];

// G2 anchor uniqueness in base
for (const [name, oldS] of SPLICES) {
  const c = base.split(oldS).length - 1;
  gate('G2 anchor once ' + name, c === 1, 'count=' + c);
}

// apply
let out = base;
for (const [name, oldS, newS] of SPLICES) {
  if (out.split(oldS).length - 1 !== 1) { gate('G3 apply ' + name, false); continue; }
  out = out.replace(oldS, newS);
  gate('G3 apply ' + name, true);
}

// G4 exact reconstruction: out == base with exactly these splices
let recon = base;
for (const [name, oldS, newS] of SPLICES) recon = recon.replace(oldS, newS);
gate('G4 reconstruction byte-exact', recon === out);

// G5 token counts
gate('G5a rv-r108 once', out.split('rv-r108').length - 1 === 1);
gate('G5b zl-ship91 once', out.split('zl-ship91').length - 1 === 1);
gate('G5c r107 badge gone', !out.includes('rv-r107'));
gate('G5d zl-ship90 gone', !out.includes('zl-ship90'));
gate('G5e old ladder gone', !out.includes("? [0, zlEpoxyVoice(ua)] : [zlEpoxyVoice(ua), 0]"));
gate('G5f note once', out.split('r108 (VOICE LANE').length - 1 === 1);
gate('G5g old note gone', !out.includes('r107 (WALL LANE'));
gate('G5h native(0) count 3', (out.split('native(0)').length - 1) === 3, 'count=' + (out.split('native(0)').length - 1));
gate('G5i chromium(1) count 2', (out.split('chromium(1)').length - 1) === 2);
gate('G5j firefox(2) count 2', (out.split('firefox(2)').length - 1) === 2);

// G6 note hygiene: single line, no banned tokens
const noteLit = NOTE_NEW.slice("build=' + Q + '".length);
gate('G6a note single line', !noteLit.includes('\n'));
gate('G6b note no apostrophe', !noteLit.includes("'"));
gate('G6c note no backslash', !noteLit.includes('\\'));
gate('G6d note no dollar', !noteLit.includes('$'));
gate('G6e note no backtick', !noteLit.includes('`'));
gate('G6f note no script closer', !noteLit.includes('</script'));
gate('G6g note no decimal', !/\d\.\d/.test(noteLit));
gate('G6h note no zl-ship', !noteLit.includes('zl-ship'));

// G7 script block scan (browser-exact: close only on "</script" + [>/ \t\n\r])
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
gate('G7b block count same as base', outBlocks.length === baseBlocks.length);
const changed = [];
for (let b = 0; b < Math.min(outBlocks.length, baseBlocks.length); b++) if (outBlocks[b] !== baseBlocks[b]) changed.push(b);
gate('G7c exactly one changed block', changed.length === 1, 'changed=' + JSON.stringify(changed));

// G8 parse gates: fail-set identical to base; changed block parses same-class
function tryParse(code) { try { new Function(code); return true; } catch (e) { return false; } }
function blockBody(blk) {
  const m = blk.match(/<script[^>]*>([\s\S]*)<\/script/);
  return m ? m[1] : blk;
}
const baseParse = baseBlocks.map(b => tryParse(blockBody(b)));
const outParse = outBlocks.map(b => tryParse(blockBody(b)));
gate('G8a parse fail-set identical', JSON.stringify(baseParse.map((p,i)=>p?null:i).filter(x=>x!==null)) === JSON.stringify(outParse.map((p,i)=>p?null:i).filter(x=>x!==null), ), JSON.stringify(outParse.map((p,i)=>p?null:i).filter(x=>x!==null)));
if (changed.length === 1) {
  const cb = blockBody(outBlocks[changed[0]]);
  gate('G8b changed block parses', tryParse(cb));
}

// G9 construct-region parse: extract the whole init promise from OUT and parse it
const ci = out.indexOf('zlEpoxy.initP = mod.init');
const cj = out.indexOf('return zlEpoxy.initP;', ci);
gate('G9a construct region found', ci > 0 && cj > ci);
if (ci > 0 && cj > ci) {
  const region = out.slice(ci, cj + 'return zlEpoxy.initP;'.length);
  try {
    new Function('mod','ws','b64','zlLog','hostOf','Date','getS','zlEpoxyVoice','DEFAULT_UA','window','zlEpoxy','Math', region);
    gate('G9b construct region parses', true);
  } catch (e) { gate('G9b construct region parses', false, String(e).slice(0,120)); }
}

// G10 wasm + glue unchanged: extract the real payload elements from each file
function payload(src, id) {
  const a = src.indexOf('id="' + id + '"');
  if (a < 0) return null;
  const o = src.indexOf('>', a);
  const c = src.indexOf('</script', o);
  if (o < 0 || c < 0) return null;
  return src.slice(o + 1, c);
}
const glueB = payload(base, 'zl-epoxy-src'), glueO = payload(out, 'zl-epoxy-src');
gate('G10a glue extracted', glueB !== null && glueO !== null);
if (glueB && glueO) {
  gate('G10b glue byte-identical', glueB === glueO);
  gate('G10c glue len 52748 raw', glueB.length === GLUE_LEN, 'len=' + glueB.length);
}
const b64B = payload(base, 'zl-epoxy-wasm-b64'), b64O = payload(out, 'zl-epoxy-wasm-b64');
gate('G10d wasm b64 extracted', b64B !== null && b64O !== null);
if (b64B && b64O) {
  gate('G10e wasm b64 byte-identical', b64B === b64O);
  const b64 = b64B.replace(/^\s+|\s+$/g, '');
  gate('G10f wasm b64 len', b64.length === B64_LEN, 'len=' + b64.length);
  const wasm = Buffer.from(b64, 'base64');
  const sha = crypto.createHash('sha256').update(wasm).digest('hex');
  gate('G10g wasm sha256', sha === WASM_SHA256, sha);
}

// G11 size math: delta must equal the summed splice deltas
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
