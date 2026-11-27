#!/usr/bin/env node
/* builder101: LobsterBrowse Lite r101 (RECAPTCHA WALL FIX)
 * Base: r100 md5 2d524fb91e5d4c7984e355c728d0a33d, 9725164 bytes.
 * Splices (exactly six edits):
 *   S1 badge        build rv-r100 -> build rv-r101                     (delta 0)
 *   S2 ZL_VERSION   zl-ship83 -> zl-ship84                              (delta 0)
 *   S3 note         r100 KDL build-note inner text -> r101 inner text   (delta = len diff)
 *   S4 ua key x4    getS('ua', DEFAULT_UA) -> getS('ua2', DEFAULT_UA)   (delta +4)
 *   S5 ua key save  setS('ua', String( -> setS('ua2', String(           (delta +1)
 * Gate discipline per the lb-lite recipe: anchor count-1s, note one line with no
 * apostrophes/backslash/$/backtick/</script/decimal versions, exact size math,
 * sequential script-block parse identical to base, publish + md5 record.
 */
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r100.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r101.html';
const BASE_MD5 = '2d524fb91e5d4c7984e355c728d0a33d';
const BASE_SIZE = 9725164;

const NOTE_NEW =
  'r101 (RECAPTCHA WALL FIX, operator order: fix the sorry-page recaptcha. KDL diagnosis: the stored user agent claim said an older Chrome than the real host browser and than the PQ epoxy tunnel advertises, so headers, realm reads and transport identity disagreed, and the current recaptcha build flags the conflict and silently kills its session calls, so the widget spins and resets forever. Change: the user agent setting migrates to a fresh storage key so the stale claim falls back to the live host user agent, making header, realm and tunnel identity agree. All else byte-identical to the previous ship. Honest bounds: the null-origin session class draws whatever verdict it drew before, ciphers and PQ epoxy carry over unchanged.)';

let gateN = 0;
function gate(name, ok, detail) {
  gateN++;
  const tag = (ok ? 'PASS' : 'FAIL');
  console.log(`G${gateN} ${tag} ${name}${detail ? ' :: ' + detail : ''}`);
  if (!ok) { console.error('GATE FAILURE, aborting build'); process.exit(1); }
}

function md5(buf) { return crypto.createHash('md5').update(buf).digest('hex'); }
function count(hay, needle) {
  let n = 0, i = 0;
  while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

/* ---------- read + base identity ---------- */
const baseBuf = fs.readFileSync(BASE_PATH);
gate('base md5', md5(baseBuf) === BASE_MD5, md5(baseBuf));
gate('base size', baseBuf.length === BASE_SIZE, String(baseBuf.length));
let out = baseBuf.toString('utf8');
gate('base roundtrip byte-exact', Buffer.from(out, 'utf8').equals(baseBuf));

/* ---------- note: extract old inner text ---------- */
const noteAnchor = "out += '  build=' + Q + '";
const noteAnchorAt = out.indexOf(noteAnchor);
gate('note anchor present', noteAnchorAt !== -1);
const noteOpen = noteAnchorAt + noteAnchor.length;            // first char of old note text
const noteClose = out.indexOf("' + Q + NL;", noteOpen);      // end of old note text
gate('note close present', noteClose !== -1);
const noteOld = out.slice(noteOpen, noteClose);
gate('note old starts with r100', noteOld.startsWith('r100 (RELEASE VERSIONING,'), noteOld.slice(0, 40));
gate('note old single line', !noteOld.includes('\n'));
gate('note new single line', !NOTE_NEW.includes('\n'));
gate('note new has no apostrophe', !NOTE_NEW.includes("'"));
gate('note new has no backslash', !NOTE_NEW.includes('\\'));
gate('note new has no dollar', !NOTE_NEW.includes('$'));
gate('note new has no backtick', !NOTE_NEW.includes('`'));
gate('note new has no script closer', !NOTE_NEW.toLowerCase().includes('</script'));
gate('note new has no decimal version', !/r\d+\.\d+/.test(NOTE_NEW));
gate('note new mentions the fix', NOTE_NEW.startsWith('r101 (RECAPTCHA WALL FIX,'));

/* ---------- anchor counts in base ---------- */
const A_BADGE = 'build rv-r100';
const A_VER = "var ZL_VERSION = 'zl-ship83';";
const A_GET = "getS('ua', DEFAULT_UA)";
const A_SET = "setS('ua', String(";
gate('badge anchor count-1', count(out, A_BADGE) === 1, String(count(out, A_BADGE)));
gate('version anchor count-1', count(out, A_VER) === 1);
gate('getS ua anchor count-4', count(out, A_GET) === 4, String(count(out, A_GET)));
gate('setS ua anchor count-1', count(out, A_SET) === 1);

/* ---------- splices (replace only text between original anchors, no extra bytes) ---------- */
out = out.replace(A_BADGE, 'build rv-r101');
out = out.replace(A_VER, "var ZL_VERSION = 'zl-ship84';");
out = out.slice(0, noteOpen) + NOTE_NEW + out.slice(noteClose);
out = out.split(A_GET).join("getS('ua2', DEFAULT_UA)");
out = out.replace(A_SET, "setS('ua2', String(");

/* ---------- post-splice identity gates ---------- */
gate('badge new count-1', count(out, 'build rv-r101') === 1);
gate('badge old gone', count(out, 'rv-r100') === 0);
gate('version new count-1', count(out, "var ZL_VERSION = 'zl-ship84';") === 1);
gate('version old gone', count(out, 'zl-ship83') === 0);
gate('getS ua2 count-4', count(out, "getS('ua2', DEFAULT_UA)") === 4);
gate('getS ua old gone', count(out, A_GET) === 0);
gate('setS ua2 count-1', count(out, "setS('ua2', String(") === 1);
gate('setS ua old gone', count(out, A_SET) === 0);
gate('note new present once', count(out, NOTE_NEW) === 1);
gate('note old gone', count(out, 'r100 (RELEASE VERSIONING') === 0);
gate('storage key ua2 count-5 total', count(out, "'ua2'") === 5, String(count(out, "'ua2'")));

/* ---------- exact size math ---------- */
const expectedSize = BASE_SIZE - noteOld.length + NOTE_NEW.length + 4 + 1;
const outBuf = Buffer.from(out, 'utf8');
gate('size math exact', outBuf.length === expectedSize,
  `expected ${expectedSize} got ${outBuf.length}`);

/* ---------- sequential script-block parse harness (r100 recipe) ----------
 * Browser-exact semantics: while inside a script block we do NOT scan for
 * openers (string-embedded pseudo <script tags are skipped naturally), and the
 * block ends at the FIRST literal </script after the opener, which is exactly
 * how the HTML parser closes a block (an unescaped closer inside a JS string
 * would break real browsers, and the note gate forbids it). type=text/plain
 * blocks are counted but not parsed. Syntax check = new Function(body).
 * Gate: block list and fail-set identical to the base run. */
function parseBlocks(src) {
  const blocks = [];
  let i = 0, n = src.length;
  while (i < n) {
    const t = src.indexOf('<script', i);
    if (t === -1) break;
    let p = t + 7, attr = '';
    while (p < n && src[p] !== '>') { attr += src[p]; p++; }
    const openerEnd = p + 1;
    if (openerEnd > n) break;
    const low = attr.toLowerCase();
    const c = src.indexOf('</script', openerEnd);
    const bodyEnd = c === -1 ? n : c;
    const body = src.slice(openerEnd, bodyEnd);
    if (low.includes('text/plain')) {
      blocks.push({ type: 'text/plain', len: body.length, fail: null });
    } else {
      let fail = null;
      try { new Function(body); } catch (e) { fail = String(e.message).slice(0, 120); }
      blocks.push({ type: 'js', len: body.length, fail });
    }
    i = c === -1 ? n : (src.indexOf('>', c) + 1);
  }
  return blocks;
}

const baseBlocks = parseBlocks(baseBuf.toString('utf8'));
const outBlocks = parseBlocks(out);
const baseFails = baseBlocks.map(b => b.fail ? 1 : 0).join(',');
const outFails = outBlocks.map(b => b.fail ? 1 : 0).join(',');
gate('block count matches base', outBlocks.length === baseBlocks.length,
  `base ${baseBlocks.length} out ${outBlocks.length}`);
gate('block types match base',
  JSON.stringify(outBlocks.map(b => b.type)) === JSON.stringify(baseBlocks.map(b => b.type)));
gate('fail set identical to base', baseFails === outFails,
  `base [${baseFails}] out [${outFails}]`);
gate('base zero parse fails (r100 reference)', baseFails.split(',').every(x => x === '0'),
  `blocks=${baseBlocks.length} sizes=${baseBlocks.map(b => b.len).join(',')}`);

/* ---------- vm-run the changed executable lines ---------- */
function vmLine(label, line, params) {
  let ok = false, err = '';
  try { vm.compileFunction(line, params || []); ok = true; } catch (e) { err = String(e.message).slice(0, 120); }
  gate('vm ' + label, ok, err);
}
// extract the lines containing each change from the output
function lineOf(substr) {
  const k = out.indexOf(substr);
  if (k === -1) return null;
  const s = out.lastIndexOf('\n', k) + 1;
  const e = out.indexOf('\n', k);
  return out.slice(s, e);
}
const verLine = lineOf("var ZL_VERSION = 'zl-ship84'");
gate('version line extracted', !!verLine);
vmLine('ZL_VERSION line', verLine);
const noteLine = lineOf('r101 (RECAPTCHA WALL FIX');
gate('note line extracted', !!noteLine);
vmLine('note line', noteLine, ['Q', 'NL', 'out']);
const getLine = lineOf("getS('ua2', DEFAULT_UA)");
gate('getS line extracted', !!getLine);
vmLine('getS line (first site)', getLine, ['getS', 'DEFAULT_UA', 'EMB156']);
const setLine = lineOf("setS('ua2', String(");
gate('setS line extracted', !!setLine);
vmLine('setS line', setLine, ['setS', 'DEFAULT_UA']);

/* ---------- trailing byte preserved ---------- */
gate('trailing byte preserved', outBuf[outBuf.length - 1] === baseBuf[baseBuf.length - 1],
  `0x${outBuf[outBuf.length - 1].toString(16)}`);

/* ---------- publish ---------- */
fs.writeFileSync(OUT_PATH, outBuf);
const pubBuf = fs.readFileSync(OUT_PATH);
gate('published md5 matches output', md5(pubBuf) === md5(outBuf));
gate('published size', pubBuf.length === expectedSize, String(pubBuf.length));
console.log(`\nSHIP r101: md5 ${md5(pubBuf)} size ${pubBuf.length} bytes, gates ${gateN}/${gateN}`);
