'use strict';
const fs = require('fs');
const crypto = require('crypto');

const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r106.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r107.html';
const BASE_MD5 = '9dbbc1d0cd1fb52f475fa189636601d0';
const BASE_SIZE = 5995257;
const WANT_WASM_SHA = '6938320f271dd266e36a49dba5d43fba82e5797bae5a1589ecc4ba39b1f85ec6';

let fails = 0;
function gate(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' :: ' + detail : ''));
  if (!ok) fails++;
}

let src = fs.readFileSync(BASE_PATH, 'utf8');
const baseBuf = Buffer.from(src, 'utf8');

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
function blockByContent(s, marker) {
  const re = /<script\b[^>]*>/ig;
  let m;
  while ((m = re.exec(s)) !== null) {
    let i = m.index + m[0].length, close = -1;
    for (;;) {
      const j = s.indexOf('</script', i);
      if (j === -1) break;
      if (j + 8 < s.length && '>/ \t\n\r'.includes(s[j + 8])) { close = j; break; }
      i = j + 8;
    }
    if (close === -1) continue;
    if (s.slice(i, close).includes(marker)) return s.slice(i, close);
    re.lastIndex = close + 9;
  }
  return null;
}
function scanBlocks(s) {
  const blocks = [];
  const re = /<script\b[^>]*>/ig;
  let m;
  while ((m = re.exec(s)) !== null) {
    const openEnd = m.index + m[0].length;
    let i = openEnd, close = -1;
    for (;;) {
      const j = s.indexOf('</script', i);
      if (j === -1) break;
      if (j + 8 < s.length && '>/ \t\n\r'.includes(s[j + 8])) { close = j; break; }
      i = j + 8;
    }
    if (close === -1) { blocks.push({ bad: true }); break; }
    blocks.push({ attrs: m[0] });
    re.lastIndex = close + 9;
  }
  return blocks;
}
function countOf(s, needle) { let n = 0, i = 0; for (;;) { const j = s.indexOf(needle, i); if (j === -1) return n; n++; i = j + needle.length; } }

gate('G1 base md5', crypto.createHash('md5').update(baseBuf).digest('hex') === BASE_MD5);
gate('G1 base size', baseBuf.length === BASE_SIZE, String(baseBuf.length));
const baseBlocks = scanBlocks(src);
const baseEngine = blockByContent(src, 'zlEpoxyReady');
const baseVessel = blockByContent(src, 'r80 captcha watch on');

// G2 anchors
const CONNECT_RX = '/connect|refus|tls|handshake|socket|protocol|clos|auth|status|null pointer|assert/i';
const counts0 = {
  ship: countOf(src, 'zl-ship89'),
  rv: countOf(src, 'rv-r106'),
  rx: countOf(src, CONNECT_RX),
  wispv2true: countOf(src, 'options.wisp_v2 = true;'),
  capBoot: countOf(src, "L('boot', 'r80 captcha watch on');"),
  zlEpoxyLit: countOf(src, 'var zlEpoxy = { client: null, initP: null, url: null, ok: 0, fail: 0, t0: 0, wsIdx: 0 };'),
  witness: countOf(src, "+ (vi106 ? ' fallback' : ''));"),
  solve: countOf(src, 'solveSimpleChallenge'),
};
console.log('base counts:', JSON.stringify(counts0));
gate('G2 anchors', counts0.ship === 1 && counts0.rv === 1 && counts0.rx === 1 && counts0.wispv2true === 1 && counts0.capBoot === 1 && counts0.zlEpoxyLit === 1 && counts0.witness === 1 && counts0.solve === 1);

// S1 badge
src = src.replace('<span id="ntBuild">build rv-r106</span>', '<span id="ntBuild">build rv-r107</span>');

// S2 version
src = src.replace("var ZL_VERSION = 'zl-ship89';", "var ZL_VERSION = 'zl-ship90';");

// S3 note
{
  const a = src.indexOf("'r106 (");
  const b = src.indexOf(")' + Q + NL;", a);
  const note = "r107 (WALL LANE: the crash is fixed on the real machine, the export shows the engine brings up in 31ms on native voice, and the wall that remains is server-side. Two changes. First, the engine falls back to wisp v1 on the same relay before walking the chain, so a relay that rejects wisp v2 stays usable and traffic can ride a private IP instead of the shared default. Second, the sorry auto-solve race is fenced: the vessel polls for the solve function and makes the exact call the onload attribute wanted, logging whether the definition lands, so a walled session can still solve its way out and the next export names the scope. Honest bounds: the sorry wall itself is Google-side rate limiting on the shared relay IP; the durable fix is the parity wave, this build buys a private relay and a working challenge.)";
  src = src.slice(0, a) + "'" + note + src.slice(b);
  gate('G4 note hygiene', !/['\\$`]/.test(note) && !note.includes('</script') && !/\d\.\d/.test(note) && !note.includes('zl-ship') && !note.includes('\n'));
}

// S4a zlEpoxy state: add v1
src = src.replace('var zlEpoxy = { client: null, initP: null, url: null, ok: 0, fail: 0, t0: 0, wsIdx: 0 };',
                  'var zlEpoxy = { client: null, initP: null, url: null, ok: 0, fail: 0, t0: 0, wsIdx: 0, v1: false };');

// S4b wisp_v2 from state
src = src.replace('options.wisp_v2 = true;', 'options.wisp_v2 = !zlEpoxy.v1;');

// S4c witness line gains wisp marker
src = src.replace("+ (vi106 ? ' fallback' : ''));", "+ (vi106 ? ' fallback' : '') + ' wisp=' + (zlEpoxy.v1 ? 'v1' : 'v2'));");

// S4d rawFetch: same-relay v1 retry before advance
{
  const anchor = '          if (epTry < epChain.length - 1 && ' + CONNECT_RX.replace('/^', '') + '.test(epMsg)) {';
  // build the exact anchor line as it appears
  const exact = '        if (epTry < epChain.length - 1 && /connect|refus|tls|handshake|socket|protocol|clos|auth|status|null pointer|assert/i.test(epMsg)) {';
  const sa = src.indexOf(exact);
  gate('G2 advance anchor unique', sa !== -1 && src.indexOf(exact, sa + 1) === -1);
  const ins = [
    '        /* r107: a relay that rejects wisp v2 may still speak v1: retry the same relay once with v1 before walking on */',
    '        if (!zlEpoxy.v1 && /connect|refus|tls|handshake|socket|protocol|clos|auth|status|null pointer|assert/i.test(epMsg)) {',
    '          zlEpoxy.v1 = true;',
    '          zlEpoxy.client = null; zlEpoxy.initP = null; zlEpoxy.url = null;',
    "          zlLog('epoxy', 'wisp v1 retry on ' + hostOf(epChain[Math.min(zlEpoxy.wsIdx || 0, epChain.length - 1)]) + ' (' + epMsg.slice(0, 90) + ')');",
    '          continue;',
    '        }',
    '        zlEpoxy.v1 = false;',
    ''
  ].join('\n');
  src = src.slice(0, sa) + ins + src.slice(sa);
}

// S4e exhausted path: reset v1 too
{
  const exact = 'if (/null pointer|assert/i.test(epMsg)) { try { zlEpoxy.client = null; zlEpoxy.initP = null; zlEpoxy.url = null; } catch (eR105b) {} }';
  const sa = src.indexOf(exact);
  gate('G2 exhausted anchor', sa !== -1);
  src = src.replace(exact, 'if (/null pointer|assert/i.test(epMsg)) { try { zlEpoxy.client = null; zlEpoxy.initP = null; zlEpoxy.url = null; zlEpoxy.v1 = false; } catch (eR105b) {} }');
}

// S5 vessel sorry auto-solve
let SOLVE_BODY = null;
{
  const anchor = "    L('boot', 'r80 captcha watch on');";
  const sa = src.indexOf(anchor);
  gate('G2 capWatch anchor', sa !== -1 && src.indexOf(anchor, sa + 1) === -1);
  const body = [
    "    /* r107: sorry auto-solve: the defining script lands through the tunnel after the onload already fired, so the guarded call never runs. Poll and make the exact call the onload wanted, once. */",
    '    try {',
    "      if (/google\\.com\\/sorry/i.test(String(location.href))) {",
    '        var ssN = 0, ssDone = false;',
    '        var ssIv = setInterval(function () {',
    '          if (ssDone) return;',
    '          ssN++;',
    "          if (typeof window.solveSimpleChallenge === 'function') {",
    '            ssDone = true; clearInterval(ssIv);',
    "            L('solve', 'found after ' + ssN + ' polls, calling');",
    '            try { window.solveSimpleChallenge(0, 0); } catch (eS) { ' + "L('solve', 'call failed ' + String((eS && eS.message) || eS).slice(0, 120)); }",
    '          } else if (ssN >= 100) {',
    '            ssDone = true; clearInterval(ssIv);',
    "            L('solve', 'no global definition after 100 polls');",
    '          } else if (ssN === 1 || ssN % 10 === 0) {',
    "            L('solve', 'poll ' + ssN + ' no definition yet');",
    '          }',
    '        }, 300);',
    '      }',
    '    } catch (eSS) {}',
    ''
  ].join('\n');
  SOLVE_BODY = body;
  src = src.slice(0, sa + anchor.length) + '\n' + body + src.slice(sa + anchor.length);
}

// ---- post gates ----
gate('G3 ship', countOf(src, 'zl-ship90') === 1 && countOf(src, 'zl-ship89') === 0);
gate('G3 badge', countOf(src, 'rv-r107') === 1 && countOf(src, 'rv-r106') === 0);
gate('G3 note', countOf(src, "'r107 (") === 1 && countOf(src, "'r106 (") === 0);
gate('G10 rx count', countOf(src, CONNECT_RX) === counts0.rx + 1, String(countOf(src, CONNECT_RX)));
gate('G10 wisp v2 state', countOf(src, 'options.wisp_v2 = !zlEpoxy.v1;') === 1 && countOf(src, 'options.wisp_v2 = true;') === 0);
gate('G10 v1 retry', countOf(src, 'wisp v1 retry on ') === 1 && countOf(src, 'wsIdx: 0, v1: false }') === 1);
gate('G10 witness wisp', countOf(src, "wisp=' + (zlEpoxy.v1 ? 'v1' : 'v2')") === 1);
gate('G10 exhausted v1 reset', countOf(src, 'zlEpoxy.url = null; zlEpoxy.v1 = false;') === 1);
gate('G10 sorry solve', countOf(src, 'no global definition after 100 polls') === 1 && countOf(src, "typeof window.solveSimpleChallenge === 'function'") === 1);
gate('G10 solveSimple count', countOf(src, 'solveSimpleChallenge') === counts0.solve + 2, String(countOf(src, 'solveSimpleChallenge')));
gate('G10 tls seam', countOf(src, "getS('tlsVoice'") === 2 && countOf(src, "setS('tlsVoice'") === 1 && countOf(src, 'id="setTlsVoice"') === 1);
gate('G10 bytes init', countOf(src, 'module_or_path: zlEpoxyBytes(b64)') === 1);
gate('G10 voice fallback', countOf(src, 'construct failed voice=') === 1);

// blocks
const outBlocks = scanBlocks(src);
gate('G5 blocks', outBlocks.length === baseBlocks.length && outBlocks.every(b => !b.bad), 'total=' + outBlocks.length);

// wasm + glue unchanged
const baseB64 = blockById(src, 'zl-epoxy-wasm-b64');
const b64 = baseB64.split(/\s+/).join('');
const wasm = Buffer.from(b64, 'base64');
gate('G-wasm sha', crypto.createHash('sha256').update(wasm).digest('hex') === WANT_WASM_SHA, String(wasm.length));
gate('G-wasm b64 len', b64.length === 2710068, String(b64.length));
gate('G-wasm glue unchanged', blockById(src, 'zl-epoxy-src') === blockById(fs.readFileSync(BASE_PATH, 'utf8'), 'zl-epoxy-src'));
gate('G5b zlRuntime unchanged', blockById(src, 'zl-runtime') === blockById(fs.readFileSync(BASE_PATH, 'utf8'), 'zl-runtime'));

// parse gates
{
  const eng = blockByContent(src, 'zlEpoxyReady');
  let okE = false, e1 = '';
  try { new Function(eng); okE = true; } catch (e) { e1 = e.message; }
  gate('G5c engine script parses', okE, e1.slice(0, 110));
  // the vessel blob does not parse standalone; parse the inserted solve block in a harness instead
  const a = src.indexOf('/* r107: sorry auto-solve');
  const b = src.indexOf('} catch (eSS) {}', a);
  const block = src.slice(a, b + '} catch (eSS) {}'.length);
  let okV = false, e2 = '';
  try { new Function("var location = { href: 'https://www.google.com/sorry/index?x' }; function L() {}; var setInterval = function () {}; var clearInterval = function () {};" + block); okV = true; } catch (e) { e2 = e.message; }
  gate('G5c2 sorry solve block parses', okV && a !== -1 && b > a, e2.slice(0, 110));
  // and the whole zlRuntime block must be byte-identical except the insertion: length delta only
  const ves = blockByContent(src, 'r80 captcha watch on');
  const baseVes = blockByContent(fs.readFileSync(BASE_PATH, 'utf8'), 'r80 captcha watch on');
  const capAnchor = "    L('boot', 'r80 captcha watch on');";
  const expected = baseVes.replace(capAnchor, capAnchor + '\n' + SOLVE_BODY);
  gate('G5c3 vessel = base + one insertion', ves === expected && SOLVE_BODY, 'len ' + ves.length + ' vs ' + baseVes.length);
}

// G5d shape: rawFetch region contains v1 retry before advance
{
  const a = src.indexOf('async function rawFetch');
  const b = src.indexOf('epoxy lane exhausted', a);
  const body = src.slice(a, b);
  const ok = body.indexOf('wisp v1 retry on ') < body.indexOf('advancing to ') && body.indexOf('zlEpoxy.v1 = false;') > body.indexOf('wisp v1 retry on ');
  gate('G5d rawFetch order', ok);
}

const outBuf = Buffer.from(src, 'utf8');
console.log('out size: ' + outBuf.length + ' (base ' + BASE_SIZE + ', delta ' + (outBuf.length - BASE_SIZE) + ')');
console.log('out md5: ' + crypto.createHash('md5').update(outBuf).digest('hex'));

if (fails === 0) {
  fs.writeFileSync(OUT_PATH, outBuf);
  fs.writeFileSync('/home/user/plans/lb-lite-r107-builder-backup.cjs', fs.readFileSync(process.argv[1] || '/home/user/work/builder107.cjs'));
  console.log('WROTE ' + OUT_PATH + ' + builder backup');
} else {
  console.log('FAILED ' + fails + ' gates, no write');
  process.exit(1);
}
