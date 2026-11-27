'use strict';
const fs = require('fs');
const crypto = require('crypto');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r105.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r106.html';
const BASE_MD5 = '595dfcb526780a23b01b35bb105162a8';
const BASE_SIZE = 5994528;
const WANT_WASM_SHA = '6938320f271dd266e36a49dba5d43fba82e5797bae5a1589ecc4ba39b1f85ec6';

let fails = 0;
function gate(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' :: ' + detail : ''));
  if (!ok) fails++;
}

let src = fs.readFileSync(BASE_PATH, 'utf8');
const baseIsBuf = Buffer.from(src, 'utf8');

// G1 base identity
gate('G1 base md5', crypto.createHash('md5').update(baseIsBuf).digest('hex') === BASE_MD5);
gate('G1 base size', baseIsBuf.length === BASE_SIZE, String(baseIsBuf.length));

// ---- block scanner (browser-exact close rule) ----
function scanBlocks(s) {
  const blocks = [];
  const re = /<script\b[^>]*>/ig;
  let m;
  while ((m = re.exec(s)) !== null) {
    const openEnd = m.index + m[0].length;
    let i = openEnd;
    let close = -1;
    for (;;) {
      const j = s.indexOf('</script', i);
      if (j === -1) break;
      if (j + 8 < s.length && '>/ \t\n\r'.includes(s[j + 8])) { close = j; break; }
      i = j + 8;
    }
    if (close === -1) { blocks.push({ bad: true, open: m.index }); break; }
    blocks.push({ open: m.index, openEnd, close, content: s.slice(openEnd, close), attrs: m[0] });
    re.lastIndex = close + 9;
  }
  return blocks;
}
const baseBlocks = scanBlocks(src);
const baseJsBlocks = baseBlocks.filter(b => !b.bad && /type\s*=\s*"text\/plain"/i.test(b.attrs) === false && !/id="zl-epoxy-(src|wasm-b64)"/.test(b.attrs)).length;
const basePlainBlocks = baseBlocks.filter(b => !b.bad && /type\s*=\s*"text\/plain"/i.test(b.attrs)).length;
const baseBad = baseBlocks.filter(b => b.bad).length;
console.log('base blocks: total=' + baseBlocks.length + ' js=' + baseJsBlocks + ' plain=' + basePlainBlocks + ' bad=' + baseBad);

// zlRuntime block content (for unchanged gate)
function blockById(s, id) {
  const re = new RegExp('<script\\b[^>]*\\bid="' + id + '"[^>]*>', 'i');
  const m = re.exec(s);
  if (!m) return null;
  let i = m.index + m[0].length;
  for (;;) {
    const j = s.indexOf('</script', i);
    if (j === -1) return null;
    if (j + 8 < s.length && '>/ \t\n\r'.includes(s[j + 8])) return s.slice(i, j);
    i = j + 8;
  }
}
const baseZlRuntime = blockById(src, 'zl-runtime') || blockById(src, 'zlRuntime') || '';
console.log('zlRuntime block bytes: ' + baseZlRuntime.length);

function countOf(s, needle) { let n = 0, i = 0; for (;;) { const j = s.indexOf(needle, i); if (j === -1) return n; n++; i = j + needle.length; } }

// ---- splices ----
const counts0 = {
  ship: countOf(src, "zl-ship88"),
  rv: countOf(src, 'rv-r105'),
  tlsGet: countOf(src, "getS('tlsVoice'"),
  tlsSet: countOf(src, "setS('tlsVoice'"),
  setTlsId: countOf(src, 'id="setTlsVoice"'),
  voiceW: countOf(src, 'voice='),
  nullPtr: countOf(src, 'null pointer'),
  dataInit: countOf(src, "module_or_path: 'data:application/wasm;base64,' + b64"),
};
console.log('base counts:', JSON.stringify(counts0));
gate('G2 anchors present', counts0.ship === 1 && counts0.rv === 1 && counts0.dataInit === 1 && src.indexOf('  function zlEpoxyReady() {') !== -1 && src.indexOf("'r105 (") !== -1);

// S1 badge
src = src.replace('<span id="ntBuild">build rv-r105</span>', '<span id="ntBuild">build rv-r106</span>');

// S2 version
src = src.replace("var ZL_VERSION = 'zl-ship88';", "var ZL_VERSION = 'zl-ship89';");

// S3 note
{
  const a = src.indexOf("'r105 (");
  if (a === -1) { gate('G2 note anchor', false); }
  else {
    const b = src.indexOf(")' + Q + NL;", a);
    const note = "r106 (CRASH SURVIVAL, lane continuation: the export from the crashing session shows the null pointer fires inside engine bring-up, not the relay, and far too fast for a cold compile, so the trigger sits at bring-up. The init path now hands the wasm to the engine as decoded bytes: no data fetch, no streaming, nothing left that depends on the file origin or the network. The construct stage logs its own line per voice so the next export names the failing stage outright, and a construct panic falls back to the other TLS voice before the lane dies. The relay walk and engine reset from the previous build carry over untouched. Honest bounds: the root cause on the Chromebook is still fenced, not proven, because it does not reproduce in cloud browsers or node on any voice or relay; the fallback plus the stage log is the fastest way to pin it from a real session.)";
    src = src.slice(0, a) + "'" + note + src.slice(b);
    // hygiene
    gate('G4 note hygiene', !/['\\$`]/.test(note) && !note.includes('</script') && !/\d\.\d/.test(note) && !note.includes('zl-ship') && !note.includes('\n'));
  }
}

// S4 helper before zlEpoxyReady
{
  const anchor = '  function zlEpoxyReady() {';
  const helper = [
    '  var zlEpoxyU8 = null;',
    '  function zlEpoxyBytes(b64) {',
    '    if (!zlEpoxyU8) {',
    '      var bin106 = atob(b64);',
    '      var u8106 = new Uint8Array(bin106.length);',
    '      for (var i106 = 0; i106 < bin106.length; i106++) u8106[i106] = bin106.charCodeAt(i106);',
    '      zlEpoxyU8 = u8106;',
    '    }',
    '    return zlEpoxyU8;',
    '  }',
    ''
  ].join('\n');
  src = src.replace(anchor, helper + anchor);
}

// S5 initP rework
{
  const startAnchor = "    zlEpoxy.initP = mod.init({ module_or_path: 'data:application/wasm;base64,' + b64 }).then(function () {\n";
  const sa = src.indexOf(startAnchor);
  gate('G2 initP start anchor unique', sa !== -1 && src.indexOf(startAnchor, sa + 1) === -1);
  const endAnchor = '    }).catch(function (e) {';
  const ea = src.indexOf(endAnchor, sa);
  gate('G2 initP end anchor', ea > sa);
  const mid = [
    "    zlEpoxy.initP = mod.init({ module_or_path: zlEpoxyBytes(b64) }).then(function () {",
    '      var ua = String(window.zlDefaultUA || getS(\'ua2\', DEFAULT_UA));',
    '      var voices106 = String(getS(\'tlsVoice\', \'ua\')) === \'native\' ? [0, zlEpoxyVoice(ua)] : [zlEpoxyVoice(ua), 0];',
    '      var lastE106 = null;',
    '      for (var vi106 = 0; vi106 < voices106.length; vi106++) {',
    '        try {',
    '          var options = new mod.EpoxyClientOptions();',
    '          options.wisp_v2 = true;',
    '          options.user_agent = ua;',
    '          options.identity = voices106[vi106];',
    '          zlEpoxy.client = new mod.EpoxyClient(ws, options);',
    "          zlLog('epoxy', 'client ready on ' + hostOf(ws) + ' in ' + (Date.now() - zlEpoxy.t0) + 'ms wasm=' + Math.round(b64.length * 0.75 / 1024) + 'KB voice=' + (voices106[vi106] === 0 ? 'native' : 'shaped') + (vi106 ? ' fallback' : ''));",
    '          return zlEpoxy.client;',
    '        } catch (eC106) {',
    '          lastE106 = eC106;',
    "          zlLog('epoxy', 'construct failed voice=' + (voices106[vi106] === 0 ? 'native' : 'shaped') + ': ' + String((eC106 && eC106.message) || eC106).slice(0, 110));",
    '        }',
    '      }',
    "      throw lastE106 || new Error('epoxy construct dead');",
    ''
  ].join('\n');
  src = src.slice(0, sa) + mid + src.slice(ea);
}

// ---- post gates ----
const outBuf = Buffer.from(src, 'utf8');
gate('G3 ship count', countOf(src, 'zl-ship89') === 1 && countOf(src, 'zl-ship88') === 0);
gate('G3 badge count', countOf(src, 'rv-r106') === 1 && countOf(src, 'rv-r105') === 0);
gate('G3 note count', countOf(src, "'r106 (") === 1 && countOf(src, "'r105 (") === 0);
gate('G10 tls seam', countOf(src, "getS('tlsVoice'") === counts0.tlsGet && countOf(src, "setS('tlsVoice'") === counts0.tlsSet && countOf(src, 'id="setTlsVoice"') === counts0.setTlsId);
gate('G10 voice lines', countOf(src, 'voice=') === counts0.voiceW + 1, String(countOf(src, 'voice=')));
gate('G10 null pointer walk', countOf(src, 'null pointer') === counts0.nullPtr + 1 && countOf(src, '/connect|refus|tls|handshake|socket|protocol|clos|auth|status|null pointer|assert/i') === 1, String(countOf(src, 'null pointer'))); /* +1 is the r106 note itself */
gate('G10 bytes init', countOf(src, 'module_or_path: zlEpoxyBytes(b64)') === 1 && countOf(src, "module_or_path: 'data:application/wasm;base64,' + b64") === 0);
gate('G10 construct fallback', countOf(src, 'construct failed voice=') === 1 && countOf(src, 'epoxy construct dead') === 1);

// blocks unchanged
const outBlocks = scanBlocks(src);
const outJsBlocks = outBlocks.filter(b => !b.bad && /type\s*=\s*"text\/plain"/i.test(b.attrs) === false && !/id="zl-epoxy-(src|wasm-b64)"/.test(b.attrs)).length;
const outPlainBlocks = outBlocks.filter(b => !b.bad && /type\s*=\s*"text\/plain"/i.test(b.attrs)).length;
gate('G5 blocks same', outBlocks.length === baseBlocks.length && outJsBlocks === baseJsBlocks && outPlainBlocks === basePlainBlocks && outBlocks.filter(b => b.bad).length === 0,
  'total=' + outBlocks.length + ' js=' + outJsBlocks + ' plain=' + outPlainBlocks);

// zlRuntime unchanged
const outZlRuntime = blockById(src, 'zl-runtime') || blockById(src, 'zlRuntime') || '';
gate('G5b zlRuntime unchanged', outZlRuntime === baseZlRuntime && outZlRuntime.length > 0, String(outZlRuntime.length));

// wasm pair unchanged + sha
const b64raw = blockById(src, 'zl-epoxy-wasm-b64');
const b64 = b64raw.split(/\s+/).join('');
const wasm = Buffer.from(b64, 'base64');
gate('G-wasm sha', crypto.createHash('sha256').update(wasm).digest('hex') === WANT_WASM_SHA, String(wasm.length));
const glue = blockById(src, 'zl-epoxy-src');
const baseGlue = blockById(fs.readFileSync(BASE_PATH, 'utf8'), 'zl-epoxy-src');
gate('G-wasm glue unchanged', glue === baseGlue, 'len=' + glue.length + ' base=' + baseGlue.length);
gate('G-wasm b64 len', b64.length === 2710068, String(b64.length));

// G5c: the main app script block (the one containing zlEpoxyReady) must parse
{
  const re = /<script\b[^>]*>/ig;
  let m, target = null;
  while ((m = re.exec(src)) !== null) {
    let i = m.index + m[0].length, close = -1;
    for (;;) {
      const j = src.indexOf('</script', i);
      if (j === -1) break;
      if (j + 8 < src.length && '>/ \t\n\r'.includes(src[j + 8])) { close = j; break; }
      i = j + 8;
    }
    if (close === -1) break;
    if (src.slice(m.index, close).includes('zlEpoxyReady')) { target = src.slice(i, close); break; }
    re.lastIndex = close + 9;
  }
  let ok = false, err = '';
  if (target) {
    try { new Function(target); ok = true; } catch (e) { err = e.message; }
  }
  gate('G5c engine script parses', ok, err.slice(0, 120));
}

// G5d: extract the new zlEpoxyReady body and sanity-check voice fallback shape
{
  const a = src.indexOf('function zlEpoxyReady() {');
  const b = src.indexOf('function zlEpoxyRawHeaders', a);
  const body = src.slice(a, b);
  const ok = body.includes('zlEpoxyBytes(b64)') && body.includes('voices106') && body.includes('construct failed voice=') && body.includes('lastE106') && !body.includes('data:application/wasm');
  gate('G5d zlEpoxyReady shape', ok);
}

console.log('out size: ' + outBuf.length + ' (base ' + BASE_SIZE + ', delta ' + (outBuf.length - BASE_SIZE) + ')');
console.log('out md5: ' + crypto.createHash('md5').update(outBuf).digest('hex'));

if (fails === 0) {
  fs.writeFileSync(OUT_PATH, outBuf);
  fs.writeFileSync('/home/user/plans/lb-lite-r106-builder-backup.cjs', fs.readFileSync(process.argv[1] || '/home/user/work/builder106.cjs'));
  console.log('WROTE ' + OUT_PATH + ' + builder backup');
} else {
  console.log('FAILED ' + fails + ' gates, no write');
  process.exit(1);
}
