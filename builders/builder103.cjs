#!/usr/bin/env node
/* builder103: r102 -> r103 (TLS voice lane: native voice setting + export witness)
 * Lane: operator order "Both: r103 now, parity wave next".
 * Splices (8): badge, ZL_VERSION, KDL note, settings HTML field,
 * settings load, settings save, epoxy identity seam, epoxy ready-log voice witness.
 * All else byte-identical to r102.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r102.html';
const OUT_PATH = '/home/user/work/LobsterBrowse-Lite-r103.html';
const BASE_MD5 = 'f0f842f105a3a1b5a2865b20b504c475';
const BASE_SIZE = 9726313;

let pass = 0, fail = 0;
function gate(name, ok, detail) {
  if (ok) { pass++; console.log('GATE OK   ' + name + (detail ? '  [' + detail + ']' : '')); }
  else { fail++; console.log('GATE FAIL ' + name + '  ' + (detail || '')); }
}
function md5(s) { return crypto.createHash('md5').update(s).digest('hex'); }
function count(h, s) { let n = 0, i = 0; while ((i = h.indexOf(s, i)) !== -1) { n++; i += s.length; } return n; }

const base = fs.readFileSync(BASE_PATH, 'utf8');
const baseBytes = Buffer.byteLength(base, 'utf8');
gate('G1 base md5', md5(base) === BASE_MD5, md5(base));
gate('G1 base size', baseBytes === BASE_SIZE, String(baseBytes));

/* ---------- splice definitions ---------- */

const NOTE_NEW = 'r103 (TLS VOICE LANE, operator order: fix the Google wall, both lanes approved, this is the quick one. Conviction: the wall trigger is the shaped almost-Chrome handshake the in-browser TLS engine presents while the user agent claims Chrome, a combination no real browser produces, so the edge scores the session as a spoofed client and walls the whole search flow behind the enterprise recaptcha page. The same relay egress passed on the older libcurl artifact whose generic handshake never claimed to be Chrome. Change: a TLS voice setting in Settings beside the in-browser TLS fields. The default ua keeps the browser-shaped handshake, native makes the engine speak its plain unshaped voice, the generic class the old libcurl wire spoke. The client ready log line now records which voice is live so the export proves it. Reload applies a change. All else byte-identical to the previous ship. Honest bounds: if the plain voice still draws the wall the trigger sits deeper than the handshake shape and the parity wave is the remaining lane.)';

const A_HTML = '            <md-text-field id="setEpoxyRelay" label="In-browser TLS relay" type="url" single-line spellcheck="false" supporting-text="Optional relay for in-browser TLS, for example wss://host/. Leave empty for automatic."></md-text-field>';
const R_HTML = A_HTML + '\n            <md-text-field id="setTlsVoice" label="TLS voice" single-line spellcheck="false" supporting-text="How the in-browser TLS engine signs its handshake. ua shapes the wire like the claimed browser, native speaks the plain engine voice with no browser shaping. Changes apply after reload."></md-text-field>';

const A_LOAD = "    $('#setEpoxyRelay').value = String(getS('epoxyWisp', ''));";
const R_LOAD = A_LOAD + "\n    $('#setTlsVoice').value = String(getS('tlsVoice', 'ua'));";

const A_SAVE = "    setS('epoxyWisp', String($('#setEpoxyRelay').value || '').trim());";
const R_SAVE = A_SAVE + "\n    setS('tlsVoice', String($('#setTlsVoice').value || 'ua').trim().toLowerCase() || 'ua');";

const A_SEAM = '      options.identity = zlEpoxyVoice(ua);';
const R_SEAM = "      options.identity = String(getS('tlsVoice', 'ua')) === 'native' ? 0 : zlEpoxyVoice(ua);";

const A_LOG = "      zlLog('epoxy', 'client ready on ' + hostOf(ws) + ' in ' + (Date.now() - zlEpoxy.t0) + 'ms wasm=' + Math.round(b64.length * 0.75 / 1024) + 'KB');";
const R_LOG = "      zlLog('epoxy', 'client ready on ' + hostOf(ws) + ' in ' + (Date.now() - zlEpoxy.t0) + 'ms wasm=' + Math.round(b64.length * 0.75 / 1024) + 'KB voice=' + (options.identity === 0 ? 'native' : 'shaped'));";

const SPLICES = [
  { name: 'S1 badge', old: 'build rv-r102', nw: 'build rv-r103' },
  { name: 'S2 ZL_VERSION', old: "var ZL_VERSION = 'zl-ship85';", nw: "var ZL_VERSION = 'zl-ship86';" },
  { name: 'S4 settings field', old: A_HTML, nw: R_HTML },
  { name: 'S5 settings load', old: A_LOAD, nw: R_LOAD },
  { name: 'S6 settings save', old: A_SAVE, nw: R_SAVE },
  { name: 'S7 identity seam', old: A_SEAM, nw: R_SEAM },
  { name: 'S8 ready-log voice', old: A_LOG, nw: R_LOG }
];

/* S3 note: replace the whole single out += build line */
const noteRe = /^.*'r102 \(RECAPTCHA WALL FIX 2.*' \+ Q \+ NL;$/m;
const noteMatches = base.match(noteRe);
gate('G2 note anchor unique', noteMatches !== null && noteMatches.length === 1, noteMatches ? String(noteMatches.length) : '0');
const oldNoteLine = noteMatches[0];
const newNoteLine = "    out += '  build=' + Q + '" + NOTE_NEW + "' + Q + NL;";

/* G2 anchor counts on base */
for (const sp of SPLICES) gate('G2 ' + sp.name + ' anchor unique', count(base, sp.old) === 1, String(count(base, sp.old)));

/* G4 note hygiene */
gate('G4 note no apostrophe', NOTE_NEW.indexOf("'") === -1);
gate('G4 note no backslash', NOTE_NEW.indexOf('\\') === -1);
gate('G4 note no dollar', NOTE_NEW.indexOf('$') === -1);
gate('G4 note no backtick', NOTE_NEW.indexOf('`') === -1);
gate('G4 note no script close', NOTE_NEW.indexOf('</script') === -1);
gate('G4 note no decimal version', !/\d\.\d/.test(NOTE_NEW));
gate('G4 note no ship literal', NOTE_NEW.indexOf('zl-ship') === -1 && NOTE_NEW.indexOf('rv-r103') === -1);
gate('G4 note single line', NOTE_NEW.indexOf('\n') === -1);

/* ---------- apply splices ---------- */
let out = base;
for (const sp of SPLICES) {
  if (out.split(sp.old).length !== 2) { gate('SPLICE ' + sp.name, false, 'anchor not unique at apply'); process.exit(1); }
  out = out.replace(sp.old, sp.nw);
}
if (out.split(oldNoteLine).length !== 2) { gate('SPLICE S3 note', false, 'not unique'); process.exit(1); }
out = out.replace(oldNoteLine, newNoteLine);

/* ---------- G3 version literal counts ---------- */
gate('G3 rv-r103 == 1', count(out, 'rv-r103') === 1, String(count(out, 'rv-r103')));
gate('G3 rv-r102 == 0', count(out, 'rv-r102') === 0, String(count(out, 'rv-r102')));
gate('G3 zl-ship86 == 1', count(out, 'zl-ship86') === 1, String(count(out, 'zl-ship86')));
gate('G3 zl-ship85 == 0', count(out, 'zl-ship85') === 0, String(count(out, 'zl-ship85')));
gate('G3 old note gone', count(out, 'r102 (RECAPTCHA WALL FIX 2') === 0, String(count(out, 'r102 (RECAPTCHA WALL FIX 2')));
gate('G3 new note == 1', count(out, 'r103 (TLS VOICE LANE') === 1, String(count(out, 'r103 (TLS VOICE LANE')));

/* G10 new-seam counts */
gate('G10 tlsVoice read sites == 2', count(out, "getS('tlsVoice'") === 2, String(count(out, "getS('tlsVoice'")));
gate('G10 tlsVoice write site == 1', count(out, "setS('tlsVoice'") === 1, String(count(out, "setS('tlsVoice'")));
gate('G10 settings field id == 1', count(out, 'id="setTlsVoice"') === 1);
gate('G10 native branch == 1', count(out, "=== 'native' ? 0 : zlEpoxyVoice(ua)") === 1);
gate('G10 voice witness == 1', count(out, "'KB voice=' + (options.identity === 0") === 1);
gate('G10 zlEpoxyVoice call survives == 1', count(out, 'zlEpoxyVoice(ua);') === 1);

/* G10 carry-over from r102 (base splices must survive untouched) */
gate('G10 carry window isSecureContext spoof', count(out, "Object.defineProperty(window, 'isSecureContext'") === 1);
gate('G10 carry self isSecureContext spoof', count(out, "Object.defineProperty(self, 'isSecureContext'") === 1);
gate('G10 carry realm deviceMemory spoof', count(out, "    try { Object.defineProperty(navigator, 'deviceMemory'") === 1);
gate('G10 carry worker deviceMemory spoof', count(out, "      try { Object.defineProperty(navigator, 'deviceMemory'") === 1);

/* ---------- G5 browser-exact sequential script-block parse ---------- */
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
    if (type.indexOf('text/plain') !== -1) { blocks.push({ kind: 'plain', ok: true, err: '' }); continue; }
    let ok = true, err = '';
    try { new Function(src); } catch (e) { ok = false; err = e.message; }
    blocks.push({ kind: 'js', ok: ok, err: err });
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

/* ---------- G5b zlRuntime text/plain block full syntax check ---------- */
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
gate('G5b zlRuntime unchanged by r103', baseRt === outRt);

/* ---------- G6 vm syntax check on every changed/inserted line ---------- */
const changedLines = [
  R_SEAM,
  R_LOG,
  R_LOAD.split('\n')[1],
  R_SAVE.split('\n')[1],
  newNoteLine,
  "  var ZL_VERSION = 'zl-ship86';"
];
let vmAllOk = true, vmErr = '';
for (const ln of changedLines) {
  try { vm.compileFunction(ln); } catch (e) { vmAllOk = false; vmErr = ln.slice(0, 60) + ' => ' + e.message; break; }
}
gate('G6 vm.compileFunction changed lines', vmAllOk, vmErr);

/* ---------- G7 exact size math (bytes; all splice deltas are pure ASCII) ---------- */
let expected = BASE_SIZE;
expected += 'rv-r103'.length - 'rv-r102'.length;
expected += 'zl-ship86'.length - 'zl-ship85'.length;
expected += Buffer.byteLength(newNoteLine, 'utf8') - Buffer.byteLength(oldNoteLine, 'utf8');
for (const sp of SPLICES.slice(2)) expected += sp.nw.length - sp.old.length;
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
