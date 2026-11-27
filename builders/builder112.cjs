// builder112.cjs — LobsterBrowse Lite r112 over r111 (fopr identity + postMessage fwd + source map)
// Gates: base md5/size, anchor uniqueness, splice, reverse byte-exact reconstruction,
// token counts, note hygiene, output md5 byte gate, output size. Writes /tmp/lb/r112.html.
const fs = require('fs');
const crypto = require('crypto');
const PIN_BASE_MD5 = '0f0f4463893fc28c224fe21a4060567c';
const PIN_OUT_MD5 = 'f34906eb8ec855aef83efe3abed46c15';
const PATCHES = [["      if (msd && msd.get) Object.defineProperty(MessageEvent.prototype, 'source', { get: function () { var s = msd.get.call(this); return (s === __xTop || s === window) ? s : __xFacade(s); }, configurable: true, enumerable: true });","      /* r112: report the STABLE fopr proxy (what iframe.contentWindow serves) as MessageEvent.source\n         for wrapped children, so the sdk offer waiter's e.source === iframe.contentWindow identity\n         check passes; the anchor's port offer used to be delivered and then rejected right here. */\n      if (msd && msd.get) Object.defineProperty(MessageEvent.prototype, 'source', { get: function () { var s = msd.get.call(this); try { if (s && s !== __xTop && s !== window) { var __k112 = __xFacade(s), __m112 = window.__zlRealToPx && window.__zlRealToPx.get(__k112); if (__m112) { if ((window.__zlSm112 = (window.__zlSm112 || 0) + 1) <= 12) { try { flog('xpm', 'srcmap hit'); } catch (e112a) {} } return __m112; } } } catch (e112b) {} return (s === __xTop || s === window) ? s : __xFacade(s); }, configurable: true, enumerable: true });"],["  var cwDesc115 = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');\n  var foprSeen115 = {};","  var cwDesc115 = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');\n  var foprSeen115 = {};\n  var __foprPxCache = new WeakMap(); /* r112: stable contentWindow identity per element+state */"],["        var __tgt119 = __ves119 ? window : raw;\n        var __px119;\n        return __px119 = new Proxy(__tgt119, {\n          get: function (t, p, r) {\n            if (__ves119 && (p === 'self' || p === 'window' || p === 'globalThis')) return __px119;","        var __tgt119 = __ves119 ? window : raw;\n        var __px119;\n        /* r112: the enterprise offer waiter checks e.source === iframe.contentWindow, so the proxy\n           must be identity-stable per element+state; and postMessage through it must reach the REAL\n           current child (the r99.116 standin looped page->child posts back into the page: from=self,\n           ports=0, so the anchor never heard the recaptcha-setup request and the offer waiter timed\n           out every 15s, re-anchoring forever). */\n        var __el119 = this, __st119 = (fname || '?') + '|' + (__ves119 ? 'v' : 'b');\n        try {\n          var __cx119 = __foprPxCache.get(this);\n          if (__cx119 && __cx119.k === __st119) {\n            try { if (raw && raw !== window) (window.__zlRealToPx = window.__zlRealToPx || new WeakMap()).set(raw, __cx119.px); } catch (e119b) {}\n            return __cx119.px;\n          }\n        } catch (e119a) {}\n        __px119 = new Proxy(__tgt119, {\n          get: function (t, p, r) {\n            if (p === 'postMessage') return function (m, o, tr) {\n              var __rw112 = null;\n              try { __rw112 = cwDesc115.get.call(__el119); } catch (e112c) {}\n              try { if ((window.__zlPm112 = (window.__zlPm112 || 0) + 1) <= 24) flog('fopr', 'cwpm fwd' + (__rw112 ? '' : ' nowin') + ' tr=' + ((tr && tr.length) || 0) + ' ' + String(fname).slice(0, 60)); } catch (e112d) {}\n              if (__rw112) return arguments.length > 2 ? __rw112.postMessage(m, o, tr) : __rw112.postMessage(m, o);\n              var __fb112 = Reflect.get(t, 'postMessage', t);\n              return arguments.length > 2 ? __fb112.call(t, m, o, tr) : __fb112.call(t, m, o);\n            };\n            if (__ves119 && (p === 'self' || p === 'window' || p === 'globalThis')) return __px119;"],["            return v;\n          }\n        });\n      },\n      configurable: true\n    });\n  }\n  /* r99.127 frres","            return v;\n          }\n        });\n        try { __foprPxCache.set(__el119, { k: __st119, px: __px119 }); } catch (e119c) {}\n        try { if (raw && raw !== window) { (window.__zlRealToPx = window.__zlRealToPx || new WeakMap()).set(raw, __px119); if ((window.__zlRx112 = (window.__zlRx112 || 0) + 1) <= 12) { try { flog('fopr', 'srcmap reg ' + String(fname).slice(0, 60)); } catch (e119d) {} } } } catch (e119e) {}\n        return __px119;\n      },\n      configurable: true\n    });\n  }\n  /* r99.127 frres"],["build rv-r111","build rv-r112"],["var ZL_VERSION = 'zl-ship94';","var ZL_VERSION = 'zl-ship95';"],["r111 (WIDGET LANE: the r110 export proves the enterprise widget stall is the worker attestation: the vessel worker is an opaque-origin blob realm with no native crypto.subtle, the r102 isSecureContext persona cannot create it, the sdk sha512 digest dies silently there and the page retries commands forever while the worker never answers, so the prelude now ships a real digest shim sha256 sha384 sha512 with a wlog witness and the bridge logs it; set the custom relay to mercurywork and retry the search, then click the recaptcha checkbox)","r112 (WIDGET LANE: the r111 export proves the stall sits before the worker: the anchor port offer reached the sorry rehost but the sdk offer waiter demands e.source === iframe.contentWindow, and the vessel standin served a fresh proxy of the page own window there while e.source was the facade proxy of the real blob child, two objects, so the check failed and the 15s timeout re-anchored forever, and the page own recaptcha-setup request looped back into the page and never reached the anchor; so contentWindow is now one cached stable proxy per element and state, postMessage through it forwards to the real current child with the port transfer kept, and MessageEvent.source reports that same proxy, witnessed by fopr cwpm fwd and fopr srcmap reg and xpm srcmap hit; set the custom relay to mercurywork and retry the search, then click the recaptcha checkbox)"]];
let g = 0;
function gate(ok, name) { if (!ok) { console.log('FAIL ' + name); process.exit(1); } g++; console.log('PASS ' + name); }
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
const base = fs.readFileSync('/tmp/lb/r111.html', 'utf8');
gate(md5(base) === PIN_BASE_MD5, 'base md5 ' + md5(base));
gate(Buffer.byteLength(base) === 6011505, 'base bytes 6011505 got ' + Buffer.byteLength(base));
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
const tk = (s) => out.split(s).length - 1;
gate(tk('cwpm fwd') === 2, 'token cwpm fwd=2 got ' + tk('cwpm fwd'));
gate(tk('srcmap reg') === 2, 'token srcmap reg=2 got ' + tk('srcmap reg'));
gate(tk('srcmap hit') === 2, 'token srcmap hit=2 got ' + tk('srcmap hit'));
gate(tk('__foprPxCache') === 3, 'token __foprPxCache=3 got ' + tk('__foprPxCache'));
gate(tk('__zlRealToPx') === 6, 'token __zlRealToPx=6 got ' + tk('__zlRealToPx'));
gate(tk('rv-r112') === 1, 'token rv-r112=1 got ' + tk('rv-r112'));
gate(tk('zl-ship95') === 1, 'token zl-ship95=1 got ' + tk('zl-ship95'));
gate(tk('rv-r111') === 0, 'token rv-r111=0 got ' + tk('rv-r111'));
gate(tk('zl-ship94') === 0, 'token zl-ship94=0 got ' + tk('zl-ship94'));
const note = PATCHES[6][1];
gate(note.indexOf(String.fromCharCode(10)) === -1, 'note single line');
gate(!/['\\\$\u0060]/.test(note), 'note quote hygiene');
const om = md5(out);
gate(om === PIN_OUT_MD5, 'output md5 ' + om);
gate(Buffer.byteLength(out) === 6014492, 'output bytes 6014492 got ' + Buffer.byteLength(out));
gate(out.length === 6009179, 'output chars 6009179 got ' + out.length);
fs.writeFileSync('/tmp/lb/r112.html', out);
console.log('WROTE /tmp/lb/r112.html');
console.log('md5=' + om);
console.log('bytes=' + Buffer.byteLength(out));
console.log('chars=' + out.length);
console.log('ALL GATES PASS (' + g + ')');
