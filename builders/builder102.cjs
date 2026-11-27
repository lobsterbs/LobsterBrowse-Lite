#!/usr/bin/env node
/* builder102: r101 -> r102 (recaptcha wall fix 2: secure-context surface)
 * Lane: operator recaptcha-sorry-fix lane (continued).
 * Splices (5): badge, ZL_VERSION, KDL note, realm-boot secure-context spoof,
 * worker-prelude secure-context spoof. All else byte-identical.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r101.html';
const OUT_PATH = '/home/user/work/LobsterBrowse-Lite-r102.html';
const BASE_MD5 = 'e1710b634944c85d655b6886563daea8';
const BASE_SIZE = 9725099;

let pass = 0, fail = 0;
function gate(name, ok, detail) {
  if (ok) { pass++; console.log('GATE OK   ' + name + (detail ? '  [' + detail + ']' : '')); }
  else { fail++; console.log('GATE FAIL ' + name + '  ' + (detail || '')); }
}
function md5(s) { return crypto.createHash('md5').update(s).digest('hex'); }
function count(h, s) { let n = 0, i = 0; while ((i = h.indexOf(s, i)) !== -1) { n++; i += s.length; } return n; }

const base = fs.readFileSync(BASE_PATH, 'utf8');

/* G1 base identity (byte-exact) */
const baseBytes = Buffer.byteLength(base, 'utf8');
gate('G1 base md5', md5(base) === BASE_MD5, md5(base));
gate('G1 base size', baseBytes === BASE_SIZE, String(baseBytes));

/* ---------- splice definitions ---------- */

const NOTE_NEW = 'r102 (RECAPTCHA WALL FIX 2, operator lane: the sorry page recaptcha still dies after the first fix. Round 2 KDL diagnosis: the engine, styles, images and worker all load through the tunnel, the virtual machine boots and polls in both the page vessel and the worker, yet the session call never fires, so the widget times out into the fallback page that carries the connect fail message. The vessel export shows the two hard persona mismatches left are secure context surface: every realm reports secure context false and device memory undefined, while a real Chrome on the site over https always reports true and a number, and a Chrome that cannot read device memory does not exist. Change: every instrumented realm and the worker prelude now affirm secure context true and device memory eight, guarded so an unforgeable surface changes nothing. All else byte-identical to the previous ship. Honest bounds: cross realm integrity reads inside the null origin vessel class stay hostile, so if the virtual machine samples deeper than these cheap tells the wall persists and the honest lane is importing a passing cookie session from a real browser.)';

const SPLICES = [
  {
    name: 'S1 badge',
    old: 'build rv-r101',
    nw: 'build rv-r102'
  },
  {
    name: 'S2 ZL_VERSION',
    old: "var ZL_VERSION = 'zl-ship84';",
    nw: "var ZL_VERSION = 'zl-ship85';"
  }
];

/* S3 note: replace the whole single out += build line */
const noteRe = /^.*'r101 \(RECAPTCHA WALL FIX.*' \+ Q \+ NL;$/m;
const noteMatches = base.match(noteRe);
gate('G2 note anchor unique', noteMatches !== null && noteMatches.length === 1, noteMatches ? String(noteMatches.length) : '0');
const oldNoteLine = noteMatches[0];
const newNoteLine = "    out += '  build=' + Q + '" + NOTE_NEW + "' + Q + NL;";

/* S4 realm-boot secure-context spoof */
const A4 = "\n  /* framework asset-path hints: webpack/Next resolve against the real origin */\n  try { window.__webpack_public_path__ = ORIGIN + '/'; } catch (e) {}";
const R4 = "\n  /* r102 recaptcha lane: blob vessels are insecure origins, so the secure-context surface must match the https persona */\n  try { Object.defineProperty(window, 'isSecureContext', { get: function () { return true; }, configurable: true }); } catch (eSc102) {}\n  try { Object.defineProperty(navigator, 'deviceMemory', { get: function () { return 8; }, configurable: true }); } catch (eDm102) {}\n\n  /* framework asset-path hints: webpack/Next resolve against the real origin */\n  try { window.__webpack_public_path__ = ORIGIN + '/'; } catch (e) {}";

/* S5 worker-prelude secure-context spoof */
const A5 = "      if (self.__zlwf) return;\n      self.__zlwf = 1;\n      var seq = 0, pend = new Map();";
const R5 = "      if (self.__zlwf) return;\n      self.__zlwf = 1;\n      /* r102 recaptcha lane: the worker realm is an insecure blob origin, so affirm the https persona secure-context surface */\n      try { Object.defineProperty(self, 'isSecureContext', { get: function () { return true; }, configurable: true }); } catch (eWsc102) {}\n      try { Object.defineProperty(navigator, 'deviceMemory', { get: function () { return 8; }, configurable: true }); } catch (eWdm102) {}\n      var seq = 0, pend = new Map();";

/* G2 anchor counts on base */
for (const sp of SPLICES) gate('G2 ' + sp.name + ' anchor unique', count(base, sp.old) === 1, String(count(base, sp.old)));
gate('G2 A4 anchor unique', count(base, A4) === 1, String(count(base, A4)));
gate('G2 A5 anchor unique', count(base, A5) === 1, String(count(base, A5)));

/* G4 note hygiene */
gate('G4 note no apostrophe', NOTE_NEW.indexOf("'") === -1);
gate('G4 note no backslash', NOTE_NEW.indexOf('\\') === -1);
gate('G4 note no dollar', NOTE_NEW.indexOf('$') === -1);
gate('G4 note no backtick', NOTE_NEW.indexOf('`') === -1);
gate('G4 note no script close', NOTE_NEW.indexOf('</script') === -1);
gate('G4 note no decimal version', !/\d\.\d/.test(NOTE_NEW));
gate('G4 note no ship literal', NOTE_NEW.indexOf('zl-ship') === -1 && NOTE_NEW.indexOf('rv-r102') === -1);
gate('G4 note single line', NOTE_NEW.indexOf('\n') === -1);

/* ---------- apply splices ---------- */
let out = base;
for (const sp of SPLICES) {
  if (out.split(sp.old).length !== 2) { gate('SPLICE ' + sp.name, false, 'anchor not unique at apply'); process.exit(1); }
  out = out.replace(sp.old, sp.nw);
}
if (out.split(oldNoteLine).length !== 2) { gate('SPLICE S3 note', false, 'not unique'); process.exit(1); }
out = out.replace(oldNoteLine, newNoteLine);
if (out.split(A4).length !== 2) { gate('SPLICE S4', false, 'not unique'); process.exit(1); }
out = out.replace(A4, R4);
if (out.split(A5).length !== 2) { gate('SPLICE S5', false, 'not unique'); process.exit(1); }
out = out.replace(A5, R5);

/* ---------- G3 version literal counts ---------- */
gate('G3 rv-r102 == 1', count(out, 'rv-r102') === 1, String(count(out, 'rv-r102')));
gate('G3 rv-r101 == 0', count(out, 'rv-r101') === 0, String(count(out, 'rv-r101')));
gate('G3 zl-ship85 == 1', count(out, 'zl-ship85') === 1, String(count(out, 'zl-ship85')));
gate('G3 zl-ship84 == 0', count(out, 'zl-ship84') === 0, String(count(out, 'zl-ship84')));
gate('G3 old note gone', count(out, 'r101 (RECAPTCHA WALL FIX') === 0, String(count(out, 'r101 (RECAPTCHA WALL FIX')));
gate('G3 new note == 1', count(out, 'r102 (RECAPTCHA WALL FIX 2') === 1, String(count(out, 'r102 (RECAPTCHA WALL FIX 2')));

/* G10 spoof sites (indentation distinguishes realm 4-space vs prelude 6-space) */
gate('G10 window isSecureContext spoof == 1', count(out, "Object.defineProperty(window, 'isSecureContext'") === 1);
gate('G10 self isSecureContext spoof == 1', count(out, "Object.defineProperty(self, 'isSecureContext'") === 1);
gate('G10 realm deviceMemory spoof == 1 (4sp)', count(out, "    try { Object.defineProperty(navigator, 'deviceMemory'") === 1);
gate('G10 worker deviceMemory spoof == 1 (6sp)', count(out, "      try { Object.defineProperty(navigator, 'deviceMemory'") === 1);

/* G8 order: realm spoof must precede capWatch env dump */
const iSpoof = out.indexOf("Object.defineProperty(navigator, 'deviceMemory'");
const iEnv = out.indexOf("' mem=' + navigator.deviceMemory");
gate('G8 spoof before capWatch env dump', iSpoof > 0 && iSpoof < iEnv, iSpoof + ' < ' + iEnv);

/* ---------- G5 browser-exact sequential script-block parse ---------- */
/* end tag is only real when </script is followed by whitespace, / or > (HTML tokenizer rule);
 * a raw </script inside a JS string (zlRuntime has one) does NOT close the block. */
function findClose(html, from) {
  let i = from;
  for (;;) {
    const c = html.indexOf('</script', i);
    if (c < 0) return -1;
    const n = html[c + 8];
    if (n === undefined || n === ' ' || n === '\t' || n === '\n' || n === '\r' || n === '/' || n === '>') return c;
    i = c + 8;
  }
}
function parseBlocks(html) {
  const blocks = [];
  let i = 0;
  for (;;) {
    const open = html.indexOf('<script', i);
    if (open < 0) break;
    const c = html[open + 7];
    if (c !== ' ' && c !== '>' && c !== '\n' && c !== '\t') { i = open + 7; continue; }
    const gt = html.indexOf('>', open);
    if (gt < 0) break;
    const close = findClose(html, gt + 1);
    if (close < 0) break;
    const head = html.slice(open, gt);
    const m = /type\s*=\s*["']?([^"'\s>]+)/i.exec(head);
    const type = m ? m[1].toLowerCase() : '';
    const src = html.slice(gt + 1, close);
    i = close + 9;
    if (type.indexOf('text/plain') !== -1) { blocks.push({ kind: 'plain', ok: true, err: '', id: (/id\s*=\s*"([^"]+)"/.exec(head) || [])[1] || '' }); continue; }
    let ok = true, err = '';
    try { new Function(src); } catch (e) { ok = false; err = e.message; }
    blocks.push({ kind: 'js', ok: ok, err: err, id: '' });
  }
  return blocks;
}
const baseBlocks = parseBlocks(base);
const outBlocks = parseBlocks(out);
const baseJs = baseBlocks.filter(b => b.kind === 'js');
const outJs = outBlocks.filter(b => b.kind === 'js');
const baseFails = baseJs.map((b, i) => b.ok ? null : i + ':' + b.err).filter(Boolean);
const outFails = outJs.map((b, i) => b.ok ? null : i + ':' + b.err).filter(Boolean);
gate('G5 base 15 total blocks', baseBlocks.length === 15, String(baseBlocks.length));
gate('G5 base js block count', baseJs.length === 9, String(baseJs.length));
gate('G5 base 0 fails', baseFails.length === 0, JSON.stringify(baseFails.slice(0, 3)));
gate('G5 out 15 total blocks', outBlocks.length === baseBlocks.length, String(outBlocks.length));
gate('G5 out js block count matches base', outJs.length === baseJs.length, String(outJs.length));
gate('G5 out fail-set identical to base', JSON.stringify(outFails) === JSON.stringify(baseFails), JSON.stringify(outFails.slice(0, 3)));
gate('G5 out 0 fails', outFails.length === 0);

/* ---------- G5b zlRuntime text/plain block full syntax check (S4+S5 edits live inside it) ---------- */
function plainBlockSrc(html, id) {
  const marker = 'id="' + id + '"';
  const mIdx = html.indexOf(marker);
  if (mIdx < 0) return null;
  const gt = html.indexOf('>', mIdx);
  const close = findClose(html, gt + 1);
  if (gt < 0 || close < 0) return null;
  return html.slice(gt + 1, close);
}
const baseRt = plainBlockSrc(base, 'zlRuntime');
const outRt = plainBlockSrc(out, 'zlRuntime');
gate('G5b zlRuntime found on base', baseRt !== null && baseRt.length > 200000, baseRt ? String(baseRt.length) : 'missing');
let baseRtOk = true, baseRtErr = '';
try { new Function(baseRt); } catch (e) { baseRtOk = false; baseRtErr = e.message; }
gate('G5b zlRuntime parses on base', baseRtOk, baseRtErr);
let outRtOk = true, outRtErr = '';
try { new Function(outRt); } catch (e) { outRtOk = false; outRtErr = e.message; }
gate('G5b zlRuntime parses on output', outRtOk, outRtErr);

/* ---------- G6 vm syntax check on every changed/inserted line ---------- */
const changedLines = [
  "    try { Object.defineProperty(window, 'isSecureContext', { get: function () { return true; }, configurable: true }); } catch (eSc102) {}",
  "    try { Object.defineProperty(navigator, 'deviceMemory', { get: function () { return 8; }, configurable: true }); } catch (eDm102) {}",
  "      try { Object.defineProperty(self, 'isSecureContext', { get: function () { return true; }, configurable: true }); } catch (eWsc102) {}",
  "      try { Object.defineProperty(navigator, 'deviceMemory', { get: function () { return 8; }, configurable: true }); } catch (eWdm102) {}",
  newNoteLine,
  "  var ZL_VERSION = 'zl-ship85';"
];
let vmAllOk = true, vmErr = '';
for (const ln of changedLines) {
  try { vm.compileFunction(ln); } catch (e) { vmAllOk = false; vmErr = ln.slice(0, 60) + ' => ' + e.message; break; }
}
gate('G6 vm.compileFunction changed lines', vmAllOk, vmErr);

/* ---------- G7 exact size math (bytes; all splice deltas are pure ASCII) ---------- */
let expected = BASE_SIZE;
expected += 'rv-r102'.length - 'rv-r101'.length;
expected += 'zl-ship85'.length - 'zl-ship84'.length;
expected += Buffer.byteLength(newNoteLine, 'utf8') - Buffer.byteLength(oldNoteLine, 'utf8');
expected += R4.length - A4.length;
expected += R5.length - A5.length;
const outBytes = Buffer.byteLength(out, 'utf8');
gate('G7 exact size math', outBytes === expected, outBytes + ' vs ' + expected);

/* ---------- write + record ---------- */
fs.writeFileSync(OUT_PATH, out);
console.log('----');
console.log('output: ' + OUT_PATH);
console.log('md5: ' + md5(out));
console.log('bytes: ' + outBytes);
console.log('gates: ' + pass + ' ok, ' + fail + ' fail');
process.exit(fail === 0 ? 0 : 1);
