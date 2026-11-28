#!/usr/bin/env node
/* builder117: r116 -> r117. Doc-write lane: the follow-up fragment insert is host-first now. */
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');
const PIN_BASE_MD5 = '2d8fd8013df64c8c5001aa9bdf0f000a';
const PIN_OUT_MD5 = process.env.PIN_OUT_MD5 || null;
function md5(buf) { return crypto.createHash('md5').update(buf).digest('hex'); }
let pass = 0;
function gate(ok, msg) { if (!ok) { console.error('GATE FAIL: ' + msg); process.exit(1); } pass++; console.log('gate ok: ' + msg); }
const base = fs.readFileSync('/tmp/lb/r116.html', 'utf8');
gate(md5(base) === PIN_BASE_MD5, 'base md5 pin ' + PIN_BASE_MD5);
const PATCHES = [
  ["        if (t.isConnected && __dwFill(__dwListScope(__dwScope) || __dwScope, t)) { t.remove(); return; }\n        if (host && host !== t && !t.contains(host)) host.appendChild(t);\n        else if (!host && t.isConnected) __dwPend.push(t);",
   "        /* r117: host-first: the container host wins over the marker fill (r99.50 recorded the fill for bodies with NO container in their reply; on the AI Mode page the chip markers stole the thread footer into the first suggestion chip) */\n        if (host && host !== t && !t.contains(host)) host.appendChild(t);\n        else if (t.isConnected && __dwFill(__dwListScope(__dwScope) || __dwScope, t)) { t.remove(); return; }\n        else if (!host && t.isConnected) __dwPend.push(t);"],
  ["build rv-r116",
   "build rv-r117"],
  ["var ZL_VERSION = 'zl-ship99';",
   "var ZL_VERSION = 'zl-ship100';"],
  ["r116 (COOKIE LANE plus BOOT LANE: the r115 export proves the widget solves and google accepts the token twice, but the search never lands because the glue builds every fetch response with the script Response constructor and the browser strips set-cookie from script-built responses per the fetch spec, so the cookie harvest lane has been dead the whole epoxy era, the jar stayed nearly empty, the post-solve search arrived cookie-less and google bounced it back to a fresh sorry in a loop; the glue now copies set-cookie out of the response init headers before construction and the raw header reader surfaces those pairs so the jar fills again; and boot stops burning thirteen seconds of v2 probe dance against a relay that only speaks v1: the working relay is remembered per host and validated with one tiny warm fetch during the loading screen, the md3e component suite and all four fonts ride embedded instead of the CDN, the adblock engine warms in parallel inside the loading screen, and the panic intro opens the moment the overlay lifts; next export read the cknew and setc lines first, NID should mint on the first google fetch)",
   "r117 (DOC-WRITE LANE: the r116 field export convicts the AI Mode layout break: the whole AI Mode page streams through the document-write lane and every follow-up fragment with data-sn-op and target container 5 (the thread footer with the double-check disclaimer and the copy, feedback and share buttons, plus hidden metadata divs, an xsrf script and a style block) was spliced by the marker-fill pass into the first free TgQPHd placeholder inside the first suggestion chip, because the fill ran before the container host move even though the host existed in the document, so the footer and buttons landed in the middle of the chip list; the r99.50 comment already recorded the real semantics, the marker fill is for streamed bodies with no container in their reply, so the priority was simply inverted and the host move now wins, the fill runs only when no usable host exists, the footer lands as the last child of the container 5 host under the greeting and chips where real Chrome has it, and the chip markers stay empty like the real stream leaves them; the same export proves the cookie lane lives, NID mints on the first google fetch and the search lands after one extra wall round (a 429 sorry refresh, not a cookie failure, watch only if solves reach three); next export read the doc-write-fill lines first, they should be absent or say no placeholder for the tcid 5 fragments, then the outline, the DBd2Wb footer must sit under the chips and not inside li Z1qcYe, and the chat thread must still stream its turns, the fill remains the only path for fragments with no host, so a chat regression would show as turn content landing at the thread root)"]
];
let out = base;
for (let i = 0; i < PATCHES.length; i++) {
  const n = out.split(PATCHES[i][0]).length - 1;
  gate(n === 1, 'anchor ' + i + ' unique in base (n=' + n + ')');
  out = out.replace(PATCHES[i][0], PATCHES[i][1]);
}
let rev = out;
for (let i = PATCHES.length - 1; i >= 0; i--) {
  const n = rev.split(PATCHES[i][1]).length - 1;
  gate(n === 1, 'new anchor ' + i + ' unique (n=' + n + ')');
  rev = rev.replace(PATCHES[i][1], PATCHES[i][0]);
}
gate(rev === base, 'reverse byte-exact reconstruction');
function failSet(t) {
  const res = []; let i = 0; let idx = 0;
  while (true) {
    const s = t.indexOf('<script', i); if (s === -1) break;
    const e = t.indexOf('</script>', s);
    const bdy = e === -1 ? t.slice(s) : t.slice(s, e);
    const m = bdy.match(/<script[^>]*>([\s\S]*)$/);
    try { new vm.Script(m ? m[1] : bdy); } catch (er) { res.push(idx); }
    if (e === -1) break;
    i = e + 9; idx++;
  }
  return res.join(',');
}
gate(failSet(out) === failSet(base), 'EVERY-BLOCK-PARSES fail-set parity: base [' + failSet(base) + '] out [' + failSet(out) + ']');
const tk = (s) => out.split(s).length - 1;
gate(tk('r117: host-first') === 1, 'token r117 comment=1');
gate(tk('return; }\n        if (host') === 0, 'token old fill-first sequence=0');
gate(tk('host.appendChild(t);\n        else if (t.isConnected && __dwFill') === 1, 'token new host-first sequence=1');
gate(tk('if (host && host !== t && !t.contains(host)) host.appendChild(t);') === 1, 'token host line still exactly 1');
gate(tk('else if (t.isConnected && __dwFill(') === 1, 'token fill line in else position=1');
gate(tk('rv-r117') === 1, 'token rv-r117=1');
gate(tk('rv-r116') === 0, 'token rv-r116=0');
gate(tk('zl-ship100') === 1, 'token zl-ship100=1');
gate(tk('zl-ship99') === 0, 'token zl-ship99=0');
gate(tk('the marker-fill pass into the first free TgQPHd placeholder') === 1, 'token note r117 prose=1');
gate(tk('NID mints on the first google fetch and the search lands after one extra wall round') === 1, 'token note r117 cookie prose=1');
/* decision-table mock: prove the shipped chain moves to the host before filling, and that the old chain did not */
function mockChain(codeText, hostOn, fillRet, tConn) {
  const calls = [];
  const sandbox = {
    t: { isConnected: tConn, contains: function () { return false; }, remove: function () { calls.push('remove'); } },
    host: hostOn ? { appendChild: function () { calls.push('host'); } } : null,
    __dwFill: function () { calls.push('fill'); return fillRet; },
    __dwListScope: function () { return null; },
    __dwScope: null,
    __dwPend: { push: function () { calls.push('pend'); } }
  };
  vm.createContext(sandbox);
  const fn = vm.runInContext('(function (t, host) {' + codeText + '})', sandbox);
  fn(sandbox.t, sandbox.host);
  return calls.join(',');
}
const oldChain = PATCHES[0][0];
const newChain = PATCHES[0][1];
gate(mockChain(newChain, true, false, true) === 'host', 'mock A: host wins now (got ' + mockChain(newChain, true, false, true) + ')');
gate(mockChain(oldChain, true, false, true) === 'fill,host', 'mock B: old chain filled first, the convicted bug (got ' + mockChain(oldChain, true, false, true) + ')');
gate(mockChain(newChain, false, true, true) === 'fill,remove', 'mock C: hostless fragment still fills');
gate(mockChain(newChain, false, false, true) === 'fill,pend', 'mock D: hostless markerless fragment attempts fill then pends');
gate(mockChain(oldChain, false, false, true) === 'fill,pend', 'mock D-old: pend path unchanged vs old chain');
gate(mockChain(newChain, false, true, false) === '', 'mock E: disconnected fragment untouched');
const NOTE = PATCHES[PATCHES.length - 1][1];
gate(NOTE.indexOf(String.fromCharCode(10)) === -1, 'note single line');
gate(!/['\\\u0024\u0060]/.test(NOTE), 'note quote hygiene');
gate(NOTE.indexOf('</') === -1, 'note no closing-tag leak');
fs.mkdirSync('/tmp/lb', { recursive: true });
fs.writeFileSync('/tmp/lb/r117.html', out);
console.log('OUTMD5 ' + md5(out));
console.log('BYTES ' + Buffer.byteLength(out));
if (PIN_OUT_MD5) gate(md5(out) === PIN_OUT_MD5, 'pinned out md5 ' + PIN_OUT_MD5);
console.log('ALL ' + pass + ' GATES PASS');
