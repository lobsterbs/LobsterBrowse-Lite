// builder115.cjs — LobsterBrowse Lite r115 over r114 (srcmap keyed by the early xpm facade instead of the
// raw child window: the r114 field export proves the offer reached the sorry rehost and was dropped by the
// sdk identity check because registration and lookup used two different keys; fix: save the native
// contentWindow getter before any patch and key the identity map by that raw window)
// Gates: base md5/size, anchor uniqueness, splice, reverse byte-exact reconstruction,
// token counts, note hygiene, EVERY-BLOCK-PARSES fail-set parity, output md5 byte gate, output size.
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');
const PIN_BASE_MD5 = 'e0929e738a6a6f8405d86bbbe60103bb';
let g = 0;
function gate(ok, name) { if (!ok) { console.log('FAIL ' + name); process.exit(1); } g++; console.log('PASS ' + name); }
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
const base = fs.readFileSync('/tmp/lb/r114.html', 'utf8');
gate(md5(base) === PIN_BASE_MD5, 'base md5 ' + md5(base));
gate(Buffer.byteLength(base) === 6020992, 'base bytes 6020992 got ' + Buffer.byteLength(base));
const PATCHES = [["try {\n      var cwd = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');", "try { window.__zlNatCW = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow'); } catch (e115a) {}\n    try {\n      var cwd = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');"], ["(window.__zlRealToPx = window.__zlRealToPx || new WeakMap()).set(raw, __cx119.px); } catch (e119b) {}", "(window.__zlRealToPx = window.__zlRealToPx || new WeakMap()).set((window.__zlNatCW && window.__zlNatCW.get) ? window.__zlNatCW.get.call(this) : raw, __cx119.px); } catch (e119b) {}"], ["(window.__zlRealToPx = window.__zlRealToPx || new WeakMap()).set(raw, __px119);", "(window.__zlRealToPx = window.__zlRealToPx || new WeakMap()).set((window.__zlNatCW && window.__zlNatCW.get) ? window.__zlNatCW.get.call(this) : raw, __px119);"], ["build rv-r114", "build rv-r115"], ["var ZL_VERSION = 'zl-ship97';", "var ZL_VERSION = 'zl-ship98';"], ["r114 (WIDGET LANE: r113 never booted because my r113 build-note splice was cut one sequence too wide and deleted live code from the shell script leaving an orphan paren, so this rebuild over r112 carries the same intended fix done right: the srcmap lookup keys by the raw child window, a vessel observer touches contentWindow at iframe insertion so the identity map exists before the first offer, the worker prelude carries witness taps so the next export names any deeper stall, and the builder now gates that every script block parses; set the custom relay to mercurywork and retry the search, then click the recaptcha checkbox)", "r115 (WIDGET LANE: the r114 export convicts the last identity break: the anchor realm posted its port offer up to the sorry rehost and the sorry realm got it, but the sdk offer waiter checks e.source === iframe.contentWindow and the identity map had registered the child under the early xpm facade of the window while the message lookup asked for the raw child window, two different keys, so the map missed every time, the offer was dropped, the anchor never got its setup, the worker said its hello and then sat fully silent, and the widget re-anchored every 20s into the fallback; so the native contentWindow getter is now saved before any patch and the identity map keys by that raw window, which makes e.source and contentWindow converge on one proxy; next export read xpm srcmap hit first, then worker zc cmd and zc digest; set the custom relay to mercurywork and retry the search, then click the recaptcha checkbox)"]];
let out = base;
for (let i = 0; i < PATCHES.length; i++) {
  const n = out.split(PATCHES[i][0]).length - 1;
  gate(n === 1, 'anchor ' + i + ' unique (n=' + n + ')');
  out = out.replace(PATCHES[i][0], PATCHES[i][1]);
}
let rev = out;
for (let i = PATCHES.length - 1; i >= 0; i--) {
  const n = rev.split(PATCHES[i][1]).length - 1;
  gate(n === 1, 'new anchor ' + i + ' unique (n=' + n + ')');
  rev = rev.replace(PATCHES[i][1], PATCHES[i][0]);
}
gate(rev === base, 'reverse byte-exact reconstruction');
/* EVERY-BLOCK-PARSES fail-set of out must equal the base fail-set exactly (the r113 orphan-paren lesson) */
function failSet(t) {
  const res = []; let i = 0, idx = 0;
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
const fsBase = failSet(base), fsOut = failSet(out);
gate(fsOut === fsBase, 'EVERY-BLOCK-PARSES fail-set parity: base [' + fsBase + '] out [' + fsOut + ']');
const tk = (s) => out.split(s).length - 1;
gate(tk('__zlNatCW') === 7, 'token __zlNatCW=7 got ' + tk('__zlNatCW'));
gate(tk('window.__zlNatCW.get.call(this)') === 2, 'token natcw call=2 got ' + tk('window.__zlNatCW.get.call(this)'));
gate(tk('.set(raw, __cx119.px)') === 0, 'token set raw cx=0 got ' + tk('.set(raw, __cx119.px)'));
gate(tk('.set(raw, __px119)') === 0, 'token set raw px=0 got ' + tk('.set(raw, __px119)'));
gate(tk('__zlRealToPx') === 6, 'token __zlRealToPx=6 got ' + tk('__zlRealToPx'));
gate(tk('__foprPxCache') === 3, 'token __foprPxCache=3 got ' + tk('__foprPxCache'));
gate(tk('__eo113') === 2, 'token __eo113=2 got ' + tk('__eo113'));
gate(tk('__zcW112') === 2, 'token __zcW112=2 got ' + tk('__zcW112'));
gate(tk('rv-r115') === 1, 'token rv-r115=1 got ' + tk('rv-r115'));
gate(tk('rv-r114') === 0, 'token rv-r114=0 got ' + tk('rv-r114'));
gate(tk('zl-ship98') === 1, 'token zl-ship98=1 got ' + tk('zl-ship98'));
gate(tk('zl-ship97') === 0, 'token zl-ship97=0 got ' + tk('zl-ship97'));
gate(tk('convicts the last identity break') === 1, 'token note r115 prose=1');
const NOTE = PATCHES[5][1];
gate(NOTE.indexOf(String.fromCharCode(10)) === -1, 'note single line');
gate(!/['\\\u0024\u0060]/.test(NOTE), 'note quote hygiene');
gate(!NOTE.includes('</'), 'note no closing tag seq');
const om = md5(out);
console.log('OUTMD5 ' + om);
console.log('OUTBYTES ' + Buffer.byteLength(out));
console.log('OUTCHARS ' + out.length);
if (process.env.PIN_OUT_MD5) {
  gate(om === process.env.PIN_OUT_MD5, 'output md5 pin');
  gate(Buffer.byteLength(out) === Number(process.env.PIN_OUT_BYTES), 'output bytes pin');
}
fs.writeFileSync('/tmp/lb/r115.html', out);
console.log('WROTE /tmp/lb/r115.html');
console.log('ALL GATES PASS (' + g + ')');
