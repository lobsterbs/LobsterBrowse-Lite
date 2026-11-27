// builder110.cjs - CHAIN LANE over r109 (epoxy chain honors shell custom relay + fence gate reads body onload attr)
const fs = require('fs'), crypto = require('crypto');
const BASE_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r109.html';
const OUT_PATH = '/home/user/artifacts/LobsterBrowse-Lite-r110.html';
const BASE_MD5 = 'a71f9157a22b35a4808a5a5ff5498e48';
const BASE_SIZE = 5997590;
const GLUE_LEN = 52748, B64_LEN = 2710068;
const WASM_SHA256 = '6938320f271dd266e36a49dba5d43fba82e5797bae5a1589ecc4ba39b1f85ec6';
const base = fs.readFileSync(BASE_PATH, 'utf8');
let fails = 0, passes = 0;
function gate(name, ok, info) { if (ok) { passes++; console.log('PASS ' + name); } else { fails++; console.log('FAIL ' + name + (info ? ' ' + info : '')); } }
function md5(s) { return crypto.createHash('md5').update(Buffer.from(s, 'utf8')).digest('hex'); }

gate('G1 base md5', md5(base) === BASE_MD5, md5(base));
gate('G1b base size', Buffer.byteLength(base) === BASE_SIZE, 'bytes=' + Buffer.byteLength(base));

const NOTE_OLD = "build=' + Q + 'r109 (SOLVE GATE LANE: the operator export proves the r107 solve fence never fired, its gate read location href and in the vessel that is a blob null address; the fence now reads the page own html for the onload attribute that names the solver, then polls and makes the exact call; the same export shows the defining script lands plus 335ms after onload threw, so the poll will find it; a fallback-body witness line lands for the recaptcha fallback page; the voice ladder and wisp v1 retry from r108 stand; set the custom wisp relay to mercurywork to leave the shared relay IP)";
const NOTE_NEW = "build=' + Q + 'r110 (CHAIN LANE: the operator export proves the epoxy lane read only the epoxy wisp field, found it empty and rode the shared anura ip while the shell custom relay they set sat unused in the page pool, so the chain now honors the shell custom relay ahead of anura and the v1 retry carries the lane onto mercurywork; a live sorry fetch proves no variant defines the solver the onload names, so the fence gate now reads the body onload attribute and the no definition line is the honest witness; set the custom relay to mercurywork and retry the search)";
const FENCE_OLD = "/* r109: sorry auto-solve: the r107 gate read location href, but the vessel location is a blob null address, proven by the r108 field export, so it never fired. The gate now reads the page own html for the onload attribute that names the solver, then polls and makes the exact call the onload wanted, once. */\n    try {\n      var ssN = 0, ssDone = false, ssPage = false;\n      var ssIv = setInterval(function () {\n        if (ssDone) return;\n        ssN++;\n        if (!ssPage) {\n          try {\n            var hs = document.documentElement && document.documentElement.innerHTML ? String(document.documentElement.innerHTML) : '';\n            ssPage = /onload=[^>]*solveSimpleChallenge/.test(hs.slice(0, 9000)) || /google\\.com\\/sorry/i.test(String(location.href));\n          } catch (eG) {}\n        }\n        if (!ssPage) { if (ssN >= 100) clearInterval(ssIv); return; }\n        if (typeof window.solveSimpleChallenge === 'function') {\n          ssDone = true; clearInterval(ssIv);\n          L('solve', 'found after ' + ssN + ' polls, calling');\n          try { window.solveSimpleChallenge(0, 0); } catch (eS) { L('solve', 'call failed ' + String((eS && eS.message) || eS).slice(0, 120)); }\n        } else if (ssN >= 100) {\n          ssDone = true; clearInterval(ssIv);\n          L('solve', 'no global definition after 100 polls');\n        } else if (ssN === 1 || ssN % 10 === 0) {\n          L('solve', 'poll ' + ssN + ' no definition yet');\n        }\n      }, 300);\n    } catch (eSS) {}";
const FENCE_NEW = "    /* r110: sorry auto-solve: a live sorry fetch proves the variant defines no solver anywhere, the onload names a function nothing defines, so this poll only wins if some future variant defines it. The gate reads the body onload attribute, page html slices miss the body in the transformed doc. */\n    try {\n      var ssN = 0, ssDone = false, ssPage = false;\n      var ssIv = setInterval(function () {\n        if (ssDone) return;\n        ssN++;\n        if (!ssPage) {\n          try {\n            var sb = document.body;\n            var sol = sb ? String(sb.getAttribute('onload') || '') : '';\n            ssPage = /solveSimpleChallenge/i.test(sol) || /google\\.com\\/sorry/i.test(String(location.href));\n          } catch (eG) {}\n        }\n        if (!ssPage) { if (ssN >= 100) clearInterval(ssIv); return; }\n        if (typeof window.solveSimpleChallenge === 'function') {\n          ssDone = true; clearInterval(ssIv);\n          L('solve', 'found after ' + ssN + ' polls, calling');\n          try { window.solveSimpleChallenge(0, 0); } catch (eS) { L('solve', 'call failed ' + String((eS && eS.message) || eS).slice(0, 120)); }\n        } else if (ssN >= 100) {\n          ssDone = true; clearInterval(ssIv);\n          L('solve', 'no global definition after 100 polls');\n        } else if (ssN === 1 || ssN % 10 === 0) {\n          L('solve', 'poll ' + ssN + ' no definition yet');\n        }\n      }, 300);\n    } catch (eSS) {}";
const CHAIN_OLD = "    var cust = String(getS('epoxyWisp', '')).trim();\n    if (cust) list.push(cust);\n    if (list.indexOf('wss://anura.pro/') < 0) list.push('wss://anura.pro/');";
const CHAIN_NEW = "    var cust = String(getS('epoxyWisp', '')).trim();\n    if (cust) list.push(cust);\n    /* r110: honor the shell custom relay ahead of the shared anura: the operator export shows the epoxy lane read only the epoxy field, found it empty and rode the shared anura ip while the shell custom relay sat unused in the page pool */\n    var wc110 = String(getS('wisp', '') || '').trim();\n    if (wc110 && list.indexOf(wc110) < 0) list.push(wc110);\n    if (list.indexOf('wss://anura.pro/') < 0) list.push('wss://anura.pro/');";

const SPLICES = [
  ['badge', 'rv-r109', 'rv-r110'],
  ['version', 'zl-ship92', 'zl-ship93'],
  ['note', NOTE_OLD, NOTE_NEW],
  ['fence', FENCE_OLD, FENCE_NEW],
  ['chain', CHAIN_OLD, CHAIN_NEW],
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

gate('G5a rv-r110 once', out.split('rv-r110').length - 1 === 1);
gate('G5b zl-ship93 once', out.split('zl-ship93').length - 1 === 1);
gate('G5c rv-r109 gone', !out.includes('rv-r109'));
gate('G5d zl-ship92 gone', !out.includes('zl-ship92'));
gate('G5e note once', out.split('r110 (CHAIN LANE').length - 1 === 1);
gate('G5f old note gone', !out.includes('r109 (SOLVE GATE LANE'));
gate('G5g old fence gone', !out.includes('r109: sorry auto-solve'));
gate('G5h new fence present once', out.split('r110: sorry auto-solve').length - 1 === 1);
gate('G5i chain comment once', out.split('r110: honor the shell custom relay').length - 1 === 1);
gate('G5j wc110 count 4', out.split('wc110').length - 1 === 4, 'count=' + (out.split('wc110').length - 1));
gate('G5k solveSimpleChallenge count 4', (out.split('solveSimpleChallenge').length - 1) === 4, 'count=' + (out.split('solveSimpleChallenge').length - 1));
gate('G5l L solve count 4', (out.split("L('solve'").length - 1) === 4);
gate('G5m String location href kept twice', (out.split('String(location.href)').length - 1) === 2, 'count=' + (out.split('String(location.href)').length - 1));
gate('G5n body onload attr read once', (out.split("getAttribute('onload')").length - 1) === 1);
gate('G5o fallback witness kept', (out.split('fallback-body bytes=').length - 1) === 1);
gate('G5p onload regex slice gone', !out.includes('hs.slice(0, 9000)'));

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
    const o = src.indexOf('<script', i); if (o < 0) break;
    let j = o + 7; while (j < src.length && !'/> \t\n\r'.includes(src[j])) j++;
    const c = src.indexOf('</script', j);
    if (c < 0) { res.push(src.slice(o)); break; }
    res.push(src.slice(o, c + 8)); i = c + 8;
  }
  return res;
}
const baseBlocks = blocks(base), outBlocks = blocks(out);
gate('G7a block count 15', outBlocks.length === 15, 'count=' + outBlocks.length);
const changed = [];
for (let b = 0; b < Math.min(outBlocks.length, baseBlocks.length); b++) if (outBlocks[b] !== baseBlocks[b]) changed.push(b);
gate('G7b exactly one changed naive block (shell main 10)', JSON.stringify(changed) === JSON.stringify([10]), 'changed=' + JSON.stringify(changed));
// G7d: the fence lives in the naive gap between blocks 7 and 8; prove the gap differs by exactly the fence splice
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

// G9: fence harness (new gate reads document.body.getAttribute('onload'))
const fstart = out.indexOf('/* r110: sorry auto-solve');
const fend = out.indexOf('} catch (eSS) {}', fstart);
gate('G9a fence found', fstart > 0 && fend > fstart);
if (fstart > 0 && fend > fstart) {
  const fence = out.slice(fstart, fend + '} catch (eSS) {}'.length);
  try { new Function('L', 'window', 'document', 'setInterval', 'clearInterval', 'location', fence); gate('G9b fence parses', true); }
  catch (e) { gate('G9b fence parses', false, String(e).slice(0, 120)); }
  const vm = require('vm');
  function runFence(fenceCode, onloadAttr, docHtml, defineAfter, label) {
    const logs = [];
    let intervalFn = null, cleared = 0;
    const ctx = {
      L: (c, d) => logs.push(c + ' ' + d),
      window: {},
      document: {
        body: { getAttribute: (n) => (n === 'onload' ? onloadAttr : null) },
        documentElement: { innerHTML: docHtml },
      },
      location: { href: 'blob:null/deadbeef-0000' },
      setInterval: (fn) => { intervalFn = fn; return 7; },
      clearInterval: () => { cleared++; },
    };
    ctx.window.solveSimpleChallenge = undefined;
    vm.createContext(ctx);
    vm.runInContext(fenceCode, ctx);
    let called = 0, ticks = 0;
    while (intervalFn && ticks < 250) {
      ticks++;
      if (ticks === defineAfter) ctx.window.solveSimpleChallenge = function (a, b) { called++; ctx.__args = [a, b]; };
      try { intervalFn(); } catch (e) { logs.push('MOCKTHREW ' + String(e).slice(0, 80)); break; }
      if (cleared > 0 && (logs.some(l => l.startsWith('solve found')) || logs.some(l => l.includes('no global definition')))) break;
    }
    return { logs, called, ticks, cleared, args: ctx.__args || null };
  }
  const ONLOAD = "e=document.getElementById('captcha');if(e){e.focus();} if(solveSimpleChallenge) {solveSimpleChallenge(0,0);}";
  const BIGHEAD = '<head>' + 'a'.repeat(12000) + '</head><body onload="' + ONLOAD + '">x</body>';
  const m1 = runFence(fence, ONLOAD, BIGHEAD, 3, 'sorry late-solver');
  gate('G9c sorry: fires with big head', m1.logs.some(l => l.startsWith('solve poll')), JSON.stringify(m1.logs.slice(0, 3)));
  gate('G9d sorry: calls solver once exact 0,0', m1.called === 1 && JSON.stringify(m1.args) === '[0,0]', JSON.stringify(m1.args));
  const m2 = runFence(fence, ONLOAD, BIGHEAD, 999, 'never-defined');
  gate('G9e never-defined: no-global after 100 polls', m2.logs.some(l => l === 'solve no global definition after 100 polls'), JSON.stringify(m2.logs.filter(l => l.startsWith('solve')).slice(-2)));
  const m3 = runFence(fence, null, '<html><body>normal page</body></html>', 999, 'normal');
  gate('G9f normal page: silent', m3.logs.filter(l => l.startsWith('solve')).length === 0 && m3.called === 0, JSON.stringify(m3.logs.slice(0, 2)));
  // G9g ROOT-CAUSE DISCRIMINATOR: the r109 fence under the same big-head sorry page must stay silent (this is why r109 failed in the field)
  const old1 = runFence(FENCE_OLD, ONLOAD, BIGHEAD, 999, 'old fence big head');
  gate('G9g old fence silent under big head (root cause proven)', old1.logs.filter(l => l.startsWith('solve')).length === 0, JSON.stringify(old1.logs.filter(l => l.startsWith('solve'))));
}

// G9h: chain harness (zlEpoxyChain honors the shell custom relay ahead of anura)
{
  const cs = out.indexOf('function zlEpoxyChain()');
  const ce = out.indexOf('return list;', cs); const cend = out.indexOf('\n  }', ce);
  gate('G9h chain found', cs > 0 && ce > cs && cend > ce);
  if (cs > 0 && ce > cs && cend > ce) {
    const chainFn = out.slice(cs, cend + 4);
    try { new Function('getS', 'relayCandidates', 'activeRelay', 'WISP_POOL', chainFn + '; return zlEpoxyChain();'); gate('G9i chain parses', true); }
    catch (e) { gate('G9i chain parses', false, String(e).slice(0, 120)); }
    const vm = require('vm');
    function runChain(settings) {
      const ctx = {
        getS: (k, d) => (k in settings ? settings[k] : d),
        relayCandidates: () => ['wss://pool1.example/', 'wss://pool2.example/'],
        activeRelay: null,
        WISP_POOL: ['wss://anura.pro/', 'wss://pool1.example/'],
      };
      vm.createContext(ctx);
      vm.runInContext(chainFn + '\n__zlChainOut = zlEpoxyChain();', ctx);
      return ctx.__zlChainOut;
    }
    const mw = 'wss://wisp.mercurywork.shop/';
    const c1 = runChain({ wisp: mw });
    gate('G9j wisp set: mercurywork first, anura second', c1[0] === mw && c1[1] === 'wss://anura.pro/', JSON.stringify(c1.slice(0, 3)));
    const c2 = runChain({});
    gate('G9k nothing set: anura first', c2[0] === 'wss://anura.pro/', JSON.stringify(c2.slice(0, 2)));
    const c3 = runChain({ epoxyWisp: 'wss://custom.example/' });
    gate('G9l epoxyWisp set: epoxy field first', c3[0] === 'wss://custom.example/', JSON.stringify(c3.slice(0, 2)));
    const c4 = runChain({ epoxyWisp: 'wss://custom.example/', wisp: mw });
    gate('G9m both set: epoxy first then wisp then anura', c4[0] === 'wss://custom.example/' && c4[1] === mw && c4[2] === 'wss://anura.pro/', JSON.stringify(c4.slice(0, 3)));
  }
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
