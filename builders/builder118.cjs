#!/usr/bin/env node
/* builder118: r117 -> r118. Follow-up lane: composer witness battery plus a gated vessel-substituted submit assist. */
const fs = require('fs');
const crypto = require('crypto');
const vm = require('vm');
const PIN_BASE_MD5 = '05cb1829f58a288fa65935b9d3f5c081';
const PIN_OUT_MD5 = process.env.PIN_OUT_MD5 || null;
function md5(buf) { return crypto.createHash('md5').update(buf).digest('hex'); }
let pass = 0;
function gate(ok, msg) { if (!ok) { console.error('GATE FAIL: ' + msg); process.exit(1); } pass++; console.log('gate ok: ' + msg); }
const base = fs.readFileSync('/tmp/lb/r117.html', 'utf8');
gate(md5(base) === PIN_BASE_MD5, 'base md5 pin ' + PIN_BASE_MD5);
const PATCHES = [
  ["  Document.prototype.writeln = function () { return Document.prototype.write.apply(this, [].slice.call(arguments).concat(['\\n'])); };", "  Document.prototype.writeln = function () { return Document.prototype.write.apply(this, [].slice.call(arguments).concat(['\\n'])); };\n\n  /* r118: the AI follow-up lane. The r117 field export shows the AI Mode page renders but the google Wiz runtime never hydrates the streamed UI: the Send button (an attrbind component) stays disabled, Enter inserts a newline, the chips and the feedback buttons are inert, and the fgq4ud composer box class never lands on any element. This block logs a composer witness battery and adds a gated assist: on an AI thread page the Send button enables on input, and Enter or click submits the text as a fresh AI Mode search (a vessel-substituted lane, thread continuation is not preserved). */\n  (function fuLane() {\n    var FU_T0 = Date.now(), fuTicks = 0, fuWired = 0, fuDumps = 0, fuFocusLogged = 0, fuAttrWrites = 0, fuNavDone = 0, fuSawThread = 0, fuClickWired = 0;\n    function fuLog(c, d) { try { flog(c, d); } catch (e) {} }\n    function fuMs() { try { return Date.now() - FU_T0; } catch (e) { return -1; } }\n    function fuAnc(el) {\n      var parts = [], n = 0;\n      try {\n        for (var x = el; x && x.nodeType === 1 && n < 14; x = x.parentElement, n++) {\n          var s = x.tagName || '?';\n          if (x.id) s += '#' + x.id;\n          if (typeof x.className === 'string' && x.className) s += '.' + x.className.trim().split(/\\s+/).slice(0, 3).join('.');\n          var dc = x.getAttribute ? x.getAttribute('data-container-id') : null;\n          if (dc) s += '[cid=' + dc + ']';\n          if (x.getAttribute && x.getAttribute('data-session-thread-id')) s += '[thread]';\n          parts.push(s);\n        }\n      } catch (e) {}\n      return parts.join(' < ').slice(0, 460);\n    }\n    function fuRect(el) { try { var r = el.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height); } catch (e) { return 'na'; } }\n    function fuFindSend() {\n      try {\n        var btns = document.querySelectorAll('button,[role=button]');\n        for (var i = 0; i < btns.length; i++) { var al = btns[i].getAttribute('aria-label'); if (al && /^(send|submit)$/i.test(al)) return btns[i]; }\n      } catch (e) {}\n      return null;\n    }\n    function fuDump(why) {\n      if (fuDumps >= 8) return;\n      fuDumps++;\n      try {\n        var de = document.documentElement, b = document.body;\n        var snk = 'no-sn';\n        try { snk = window.sn ? Object.keys(window.sn).slice(0, 20).join('|') : 'no-sn'; } catch (e) { snk = 'sn-err'; }\n        fuLog('fu-dump', why + ' scrollH=' + ((de && de.scrollHeight) || 0) + ' clientH=' + ((de && de.clientHeight) || 0) + ' bodyKids=' + ((b && b.children && b.children.length) || 0) + ' fgq4ud=' + document.querySelectorAll('.fgq4ud').length + ' tas=' + document.querySelectorAll('textarea').length + ' sn=' + snk + ' ms=' + fuMs());\n        var tas = document.querySelectorAll('textarea');\n        for (var i = 0; i < tas.length && i < 2; i++) {\n          var t = tas[i], cs = 'na';\n          try { var c1 = getComputedStyle(t); cs = c1.display + '/' + c1.visibility; } catch (e) {}\n          fuLog('fu-ta', i + ' rect=' + fuRect(t) + ' cls=' + String(t.className).slice(0, 60) + ' ph=' + String(t.getAttribute('placeholder') || '').slice(0, 40) + ' jsact=' + String(t.getAttribute('jsaction') || 'none').slice(0, 60) + ' disp=' + cs + ' anc=' + fuAnc(t));\n        }\n        var sb = fuFindSend();\n        if (sb) {\n          var csb = 'na';\n          try { var c2 = getComputedStyle(sb); csb = c2.display + '/' + c2.visibility + '/' + c2.opacity; } catch (e) {}\n          fuLog('fu-send', 'rect=' + fuRect(sb) + ' dis=' + !!sb.disabled + ' adis=' + String(sb.getAttribute('aria-disabled')) + ' cls=' + String(sb.className).slice(0, 60) + ' bind=' + String(sb.getAttribute('data-wiz-attrbind') || 'none').slice(0, 90) + ' jsact=' + String(sb.getAttribute('jsaction') || 'none').slice(0, 60) + ' disp=' + csb + ' anc=' + fuAnc(sb));\n        } else fuLog('fu-send', 'none');\n        try {\n          var bs = [];\n          if (b && b.children) for (var j = 0; j < b.children.length && j < 24; j++) bs.push(b.children[j].tagName + ':' + fuRect(b.children[j]));\n          fuLog('fu-body', bs.join(' ').slice(0, 600) || 'empty');\n        } catch (e) {}\n        try {\n          var deep = [], all = document.querySelectorAll('body *'), ch = (de && de.clientHeight) || 0;\n          for (var k = 0; k < all.length && deep.length < 8; k++) { var r = all[k].getBoundingClientRect(); if (r.bottom > ch + 60) deep.push(all[k].tagName + ':' + Math.round(r.bottom) + ':' + String(all[k].className).slice(0, 24)); }\n          fuLog('fu-deep', deep.join(' ').slice(0, 400) || 'none');\n        } catch (e) {}\n        var wg = [];\n        try { for (var k2 in window) { if (/wiz/i.test(k2) && wg.length < 10) wg.push(k2); } } catch (e) {}\n        fuLog('fu-wizg', wg.join('|') || 'none');\n      } catch (e) { try { fuLog('fu-dump-err', String((e && e.message) || e).slice(0, 80)); } catch (x) {} }\n    }\n    /* attach-liveness probe: any google write to a data-wiz-attrbind element is hydration work */\n    try {\n      var fuObs = new MutationObserver(function (muts) {\n        for (var i = 0; i < muts.length; i++) {\n          var m = muts[i];\n          if (m.type !== 'attributes') continue;\n          var a = m.attributeName || '';\n          if (a !== 'class' && a !== 'disabled' && a !== 'aria-disabled' && a !== 'aria-label') continue;\n          var t = m.target;\n          if (!t || !t.getAttribute || !t.getAttribute('data-wiz-attrbind')) continue;\n          if (fuAttrWrites >= 40) { try { fuObs.disconnect(); } catch (x) {} return; }\n          fuAttrWrites++;\n          fuLog('fu-attrbind-write', a + ' old=' + String(m.oldValue || '').slice(0, 30) + ' new=' + String(t.getAttribute(a) || '').slice(0, 50) + ' tag=' + t.tagName + ' ms=' + fuMs());\n        }\n      });\n      fuObs.observe(document, { attributes: true, attributeOldValue: true, subtree: true, attributeFilter: ['class', 'disabled', 'aria-disabled', 'aria-label'] });\n    } catch (e) {}\n    var fuWiredSet = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;\n    function fuNav(text) {\n      if (fuNavDone) { fuLog('fu-nav', 'blocked second'); return; }\n      fuNavDone = 1;\n      try { window.__zlLastPrompt = text; } catch (e) {}\n      fuLog('fu-nav', 'q=' + String(text).slice(0, 60) + ' len=' + String(text).length);\n      try { location.href = 'https://www.google.com/search?q=' + encodeURIComponent(text) + '&udm=50'; } catch (e) { fuLog('fu-nav-err', String((e && e.message) || e).slice(0, 80)); }\n    }\n    function fuWire(ta) {\n      if (fuWiredSet && fuWiredSet.has(ta)) return;\n      if (fuWiredSet) fuWiredSet.add(ta);\n      fuWired++;\n      fuLog('fu-wire', 'ta' + fuWired + ' rect=' + fuRect(ta) + ' anc=' + fuAnc(ta));\n      try {\n        ta.addEventListener('input', function () {\n          try {\n            var has = !!(ta.value && ta.value.trim());\n            fuLog('fu-input', 'len=' + String(ta.value).length + ' has=' + has);\n            var sb = fuFindSend();\n            if (sb && sb.disabled !== !has) { sb.disabled = !has; fuLog('fu-btn-enable', 'disabled=' + sb.disabled); }\n          } catch (e) {}\n        });\n        ta.addEventListener('keydown', function (ev) {\n          try {\n            if (!ev || ev.key !== 'Enter' || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.isComposing) return;\n            fuLog('fu-enter', 'len=' + String(ta.value).length + ' navDone=' + fuNavDone);\n            try { ev.preventDefault(); } catch (x) {}\n            setTimeout(function () { try { if (ta.isConnected && !fuNavDone && ta.value && ta.value.trim()) fuNav(ta.value); } catch (e) {} }, 80);\n          } catch (e) {}\n        });\n        ta.addEventListener('focus', function () {\n          if (fuFocusLogged) return;\n          fuFocusLogged = 1;\n          fuLog('fu-focus', 'ms=' + fuMs());\n          setTimeout(function () { try { fuDump('focus'); } catch (e) {} }, 40);\n        });\n      } catch (e) { fuLog('fu-wire-err', String((e && e.message) || e).slice(0, 80)); }\n      setTimeout(function () { try { fuDump('wire6s'); } catch (e) {} }, 6000);\n      setTimeout(function () { try { fuDump('wire18s'); } catch (e) {} }, 18000);\n    }\n    function fuClickWire(sb) {\n      try {\n        sb.addEventListener('click', function () {\n          try {\n            var ta = document.querySelector('textarea');\n            if (!ta || !ta.value || !ta.value.trim()) { fuLog('fu-click', 'no text'); return; }\n            fuLog('fu-click', 'len=' + String(ta.value).length + ' navDone=' + fuNavDone);\n            setTimeout(function () { try { if (ta.isConnected && !fuNavDone) fuNav(ta.value); } catch (e) {} }, 80);\n          } catch (e) {}\n        });\n      } catch (e) {}\n    }\n    var fuTimer = setInterval(function () {\n      fuTicks++;\n      try {\n        if (document.querySelector('[data-session-thread-id]')) {\n          fuSawThread = 1;\n          var tas = document.querySelectorAll('textarea');\n          for (var i = 0; i < tas.length; i++) fuWire(tas[i]);\n          if (!fuClickWired) { var sb = fuFindSend(); if (sb) { fuClickWire(sb); fuClickWired = 1; fuLog('fu-click-wire', 'ms=' + fuMs()); } }\n          if (fuWired && fuDumps < 2) fuDump('on-wire');\n        }\n      } catch (e) {}\n      if (fuTicks >= 80) { try { clearInterval(fuTimer); } catch (e) {} }\n    }, 1500);\n    setTimeout(function () { try { if (fuSawThread) fuDump('t120s'); } catch (e) {} }, 120000);\n  })();"],
  ["build rv-r117",
   "build rv-r118"],
  ["var ZL_VERSION = 'zl-ship100';",
   "var ZL_VERSION = 'zl-ship101';"],
  ["r117 (DOC-WRITE LANE: the r116 field export convicts the AI Mode layout break: the whole AI Mode page streams through the document-write lane and every follow-up fragment with data-sn-op and target container 5 (the thread footer with the double-check disclaimer and the copy, feedback and share buttons, plus hidden metadata divs, an xsrf script and a style block) was spliced by the marker-fill pass into the first free TgQPHd placeholder inside the first suggestion chip, because the fill ran before the container host move even though the host existed in the document, so the footer and buttons landed in the middle of the chip list; the r99.50 comment already recorded the real semantics, the marker fill is for streamed bodies with no container in their reply, so the priority was simply inverted and the host move now wins, the fill runs only when no usable host exists, the footer lands as the last child of the container 5 host under the greeting and chips where real Chrome has it, and the chip markers stay empty like the real stream leaves them; the same export proves the cookie lane lives, NID mints on the first google fetch and the search lands after one extra wall round (a 429 sorry refresh, not a cookie failure, watch only if solves reach three); next export read the doc-write-fill lines first, they should be absent or say no placeholder for the tcid 5 fragments, then the outline, the DBd2Wb footer must sit under the chips and not inside li Z1qcYe, and the chat thread must still stream its turns, the fill remains the only path for fragments with no host, so a chat regression would show as turn content landing at the thread root)", "r118 (FOLLOWUP LANE: the r117 export confirms the AI Mode footer repair in the field, the disclaimer and buttons now sit under the thread, but the followup lane is dead: the composer textarea accepts text yet the Send button (a Wiz attrbind component, disabled bound to model state) never enables, Enter inserts a newline, the suggestion chips and the footer feedback buttons are equally inert, the fgq4ud composer box class never lands on any element (its CSS rule arrives but zero elements carry it), the whole AI Mode UI streams as data-sn-op fragments that our shim places correctly but the google Wiz runtime never hydrates in the vessel (window.sn holds only _setImageSrc), while the classic webhp searchbox on the same lane still submits fine; r118 ships the composer witness battery (textarea and send button chains with every attribute, body-level children rects to name the composer position and the extra empty scroll space, attrbind write observer, Wiz global keys) plus a gated assist: on the AI thread page the composer Send button enables on input and Enter or click submits the text as a fresh AI Mode search navigation (a vessel-substituted lane, thread continuation not preserved, honest bound), the assist stays inert on pages without the thread marker; next export read the fu lines first (wire, dump, input, btn-enable, nav), then the attrbind-write lines (any google hydration activity), then the composer dump chain (is the textarea inside or outside CKgc1d, what carries the extra scroll height), then whether the followup navigation landed the new answer page)"]
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
gate(tk('r118: the AI follow-up lane') === 1, 'token r118 comment=1');
gate(tk('vessel-substituted lane, thread continuation is not preserved') === 1, 'token assist comment=1');
gate(tk('fu-attrbind-write') === 1, 'token attrbind observer=1');
gate(tk("fu-wire', 'ta") === 1, 'token wire log=1');
gate(tk("fu-dump', why") === 1, 'token dump log=1');
gate(tk('fu-btn-enable') === 1, 'token btn-enable=1');
gate(tk("fuLog('fu-nav', 'q=") === 1, 'token nav log=1');
gate(tk('https://www.google.com/search?q=') === 2, 'token search url count=2 (base webhp 1 + assist 1)');
gate(tk('data-session-thread-id') === 2, 'token thread marker=2');
gate(tk('encodeURIComponent(text)') === 1, 'token encodeURIComponent=1');
gate(tk('rv-r118') === 1, 'token rv-r118=1');
gate(tk('rv-r117') === 0, 'token rv-r117=0');
gate(tk('zl-ship101') === 1, 'token zl-ship101=1');
gate(tk('zl-ship100') === 0, 'token zl-ship100=0');
gate(tk('the google Wiz runtime never hydrates in the vessel') === 1, 'token note r118 prose=1');
gate(tk('the marker-fill pass into the first free TgQPHd placeholder') === 0, 'token note r117 prose gone=0');
const BLOCK = PATCHES[0][1].slice(PATCHES[0][0].length + 2);
gate(BLOCK.indexOf('"') === -1 && BLOCK.indexOf('`') === -1 && BLOCK.indexOf('</') === -1, 'block hygiene: no dq, backtick, closing tag');
try { new vm.Script(BLOCK); gate(true, 'block parses standalone'); } catch (er) { gate(false, 'block parses standalone: ' + er.message); }
/* decision-table mock: run the exact shipped block in a vm with stubs; the assist must stay inert without the thread marker, wire on the thread page, flip the send button on input, and navigate exactly once on Enter */
function fuMock(blockText, withThread, withSend) {
  var logs = [], timeouts = [], tickFns = [], navHref = null;
  function El(tag, attrs) {
    attrs = attrs || {};
    var ls = {};
    return {
      tagName: String(tag || 'div').toUpperCase(), nodeType: 1, isConnected: true,
      disabled: !!attrs.disabled, value: attrs.value || '', id: attrs.id || '',
      className: attrs.className || '', parentElement: null, children: [],
      getAttribute: function (n) { return Object.prototype.hasOwnProperty.call(attrs, n) ? attrs[n] : null; },
      getBoundingClientRect: function () { return { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }; },
      addEventListener: function (t, f) { (ls[t] = ls[t] || []).push(f); },
      fire: function (t, ev) { (ls[t] || []).forEach(function (f) { f(ev || {}); }); }
    };
  }
  var ta = El('textarea', { placeholder: 'ask a follow-up', jsaction: 'x' });
  var sb = El('button', { 'aria-label': 'Send', 'data-wiz-attrbind': 'disabled=m/c' });
  sb.disabled = true;
  var thread = El('div', { 'data-session-thread-id': 'T1' });
  var sbEls = withSend ? [sb] : [];
  var win = { sn: { _setImageSrc: function () {} } };
  var doc = {
    documentElement: El('html'), body: El('body'),
    querySelector: function (sel) { if (sel === '[data-session-thread-id]') return withThread ? thread : null; if (sel === 'textarea') return ta; return null; },
    querySelectorAll: function (sel) { if (sel === 'textarea') return [ta]; if (sel === 'button,[role=button]') return sbEls; return []; }
  };
  var sandbox = {
    flog: function (c, d) { logs.push(String(c) + ' ' + String(d)); },
    document: doc, window: win, location: {},
    getComputedStyle: function () { return { display: 'block', visibility: 'visible', opacity: '1' }; },
    MutationObserver: function () { this.observe = function () {}; this.disconnect = function () {}; },
    setInterval: function (fn, ms) { tickFns.push(fn); return tickFns.length; },
    clearInterval: function () {},
    setTimeout: function (fn, ms) { timeouts.push(fn); return timeouts.length; },
    encodeURIComponent: encodeURIComponent
  };
  Object.defineProperty(sandbox.location, 'href', { get: function () { return navHref; }, set: function (v) { navHref = String(v); }, configurable: true });
  vm.createContext(sandbox);
  vm.runInContext(blockText, sandbox);
  return {
    logs: logs, ta: ta, sb: sb,
    tick: function () { tickFns.forEach(function (f) { f(); }); },
    flush: function () { var t = timeouts.splice(0); t.forEach(function (f) { f(); }); },
    nav: function () { return navHref; },
    has: function (s) { return logs.some(function (l) { return l.indexOf(s) !== -1; }); }
  };
}
var mA = fuMock(FU_BLOCK(), false, true);
mA.tick(); mA.flush();
gate(mA.logs.length === 0, 'mock A: no thread marker, assist fully inert (logs=' + mA.logs.length + ')');
var mB = fuMock(FU_BLOCK(), true, true);
mB.tick();
gate(mB.has('fu-wire ta1 '), 'mock B: thread page wires the composer');
gate(mB.has('fu-click-wire'), 'mock B: send button click wired');
gate(mB.has('fu-dump on-wire'), 'mock B: on-wire dump emitted');
mB.ta.value = 'wsg';
mB.ta.fire('input');
gate(mB.has('fu-input len=3 has=true'), 'mock C: input logged');
gate(mB.sb.disabled === false && mB.has('fu-btn-enable disabled=false'), 'mock D: send button enables on text');
mB.ta.fire('keydown', { key: 'Enter', preventDefault: function () {} });
gate(mB.has('fu-enter len=3 navDone=0'), 'mock E: Enter captured');
mB.flush();
gate(mB.nav() === 'https://www.google.com/search?q=wsg&udm=50', 'mock F: navigates to a fresh AI Mode search (got ' + mB.nav() + ')');
mB.ta.fire('keydown', { key: 'Enter', preventDefault: function () {} });
mB.flush();
gate(mB.nav() === 'https://www.google.com/search?q=wsg&udm=50' && !mB.has('blocked second'), 'mock G: second Enter does not re-navigate');
gate(!mB.has('fu-dump-err'), 'mock H: dumps never throw');
function FU_BLOCK() { return PATCHES[0][1].slice(PATCHES[0][0].length + 2); }
const NOTE = PATCHES[PATCHES.length - 1][1];
gate(NOTE.indexOf(String.fromCharCode(10)) === -1, 'note single line');
gate(!/['\\$`]/.test(NOTE), 'note quote hygiene');
gate(NOTE.indexOf('</') === -1, 'note no closing-tag leak');
fs.mkdirSync('/tmp/lb', { recursive: true });
fs.writeFileSync('/tmp/lb/r118.html', out);
console.log('OUTMD5 ' + md5(out));
console.log('BYTES ' + Buffer.byteLength(out));
if (PIN_OUT_MD5) gate(md5(out) === PIN_OUT_MD5, 'pinned out md5 ' + PIN_OUT_MD5);
console.log('ALL ' + pass + ' GATES PASS');
