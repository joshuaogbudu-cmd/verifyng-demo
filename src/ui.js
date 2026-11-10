/* ================= VerifyNG UI ================= */
const DEMO = seed();
window.VNG_BASE = window.VNG_BASE || 'https://claude.ai/artifact/EToojv24zfTfvTPguPBtbM';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtD = t => new Date(t).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtDT = t => new Date(t).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ago = t => { const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; };
const n0 = x => Number(x).toLocaleString('en-NG');
const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '0%';
const $ = s => document.querySelector(s);
let base = ''; try { base = localStorage.getItem('vng-base') || ''; } catch (e) {}
const qrBase = () => base || window.VNG_BASE || 'https://verifyng.demo/';
const qrUrl = token => qrBase().replace(/#.*$/, '') + '#u-' + token;
const UI = { device: 'dev-' + b32(cryptoBytes(5)).toLowerCase(), view: 'home', city: 'Lagos', cv: { screen: 'scan', res: null }, last: null, lastApi: null, mfrId: 'org_lgp', mtab: 'overview', rtab: 'overview', role: 'hq', selBatch: null, selCase: null, secret: null, consoleKey: null, recallFor: null, reveal: new Set(), importRes: null, apiResp: null, tamper: false, chain: null, trace: true };
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
function copy(text, ok) { const done = () => toast(ok || 'Copied'); try { navigator.clipboard.writeText(text).then(done, () => fallback()); } catch (e) { fallback(); } function fallback() { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Select the text and copy it manually'); } ta.remove(); } }

/* ---------- graphics ---------- */
// Original emblem (shield in national green-white-green). Not the Coat of Arms of Nigeria — see footer note.
const emblem = (s = 30) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><defs><clipPath id="sh${s}"><path d="M20 2 35 7v12c0 9.5-6.4 16.4-15 19C11.4 35.4 5 28.5 5 19V7z"/></clipPath></defs><g clip-path="url(#sh${s})"><rect x="0" y="0" width="15" height="40" fill="#008751"/><rect x="15" y="0" width="10" height="40" fill="#ffffff"/><rect x="25" y="0" width="15" height="40" fill="#008751"/></g><path d="M20 2 35 7v12c0 9.5-6.4 16.4-15 19C11.4 35.4 5 28.5 5 19V7z" fill="none" stroke="#00613b" stroke-width="2"/><path d="m13.5 20 4.5 4.5 9-9.5" fill="none" stroke="#00613b" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON = {
  check: '<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  warn: '<path d="M12 7.5v6M12 17h.01" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  x: '<path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  clock: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 8v4.5l3 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  ban: '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m6.8 6.8 10.4 10.4" stroke="currentColor" stroke-width="2.4"/>',
  doc: '<path d="M7 4h7l4 4v12H7z M14 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.5 13h6M9.5 16.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  cloud: '<path d="M7.5 18a4.5 4.5 0 1 1 1-8.9A5.5 5.5 0 0 1 19 11a3.5 3.5 0 0 1-.5 7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 21 15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  key: '<circle cx="8" cy="14" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="m11 11 8-8M16 6l2.5 2.5M14 8l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>',
  box: '<path d="M4 8 12 4l8 4v8l-8 4-8-4z M4 8l8 4 8-4M12 12v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" stroke="currentColor" stroke-width="2"/>',
  upload: '<path d="M12 16V5m0 0-4 4m4-4 4 4M5 15v4h14v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  radar: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12 18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  folder: '<path d="M4 7h6l2 2h8v10H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  users: '<circle cx="9" cy="9" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M15.5 6.2a3 3 0 0 1 0 5.6M17 14.6c1.8.5 3 1.9 3.5 4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  chain: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  undo: '<path d="M8 8H4V4M4.5 8.5A8 8 0 1 1 4 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const ic = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const TONE_IC = { ok: 'check', warn: 'warn', bad: 'x', reg: 'doc', exp: 'clock', rec: 'ban', na: 'cloud', info: 'key' };
const TONE_VAR = { ok: 'ok', warn: 'warn', bad: 'bad', reg: 'reg', exp: 'exp', rec: 'rec', na: 'na', info: 'info' };
const statusPill = st => { const t = STATUS[st].tone; return `<span class="pill" style="background:var(--${t}-bg);color:var(--${t})">${STATUS[st].label}</span>`; };
function productArt(p, s = 52) {
  const c = p.color || '#0a7f4f', w = '#ffffff';
  const f = {
    box: `<rect x="10" y="16" width="44" height="34" rx="3" fill="${c}"/><path d="M10 16 20 8h44L54 16z" fill="${c}" opacity=".75"/><path d="M54 16 64 8v34L54 50z" fill="${c}" opacity=".55"/><rect x="15" y="24" width="24" height="5" rx="2" fill="${w}"/><rect x="15" y="33" width="16" height="3" rx="1.5" fill="${w}" opacity=".8"/><rect x="40" y="36" width="10" height="10" rx="1" fill="${w}"/>`,
    bottle: `<rect x="27" y="4" width="10" height="7" rx="2" fill="${c}"/><path d="M25 12h14l3 8v36a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V20z" fill="${c}" opacity=".35"/><rect x="22" y="28" width="20" height="16" fill="${c}"/><rect x="26" y="33" width="12" height="3" rx="1.5" fill="${w}"/>`,
    can: `<ellipse cx="32" cy="12" rx="13" ry="4" fill="${c}" opacity=".6"/><path d="M19 12h26v40c0 2.2-5.8 4-13 4s-13-1.8-13-4z" fill="${c}"/><rect x="24" y="26" width="16" height="4" rx="2" fill="${w}"/><rect x="26" y="34" width="12" height="3" rx="1.5" fill="${w}" opacity=".8"/>`,
    sachet: `<path d="M14 10h36l-2 4 2 4v32l-2 4 2 4H14l2-4-2-4V18l2-4z" fill="${c}"/><rect x="20" y="24" width="24" height="5" rx="2" fill="${w}"/><circle cx="32" cy="40" r="6" fill="${w}" opacity=".85"/>`,
    tin: `<rect x="14" y="10" width="36" height="6" rx="2" fill="${c}" opacity=".6"/><rect x="16" y="16" width="32" height="40" rx="3" fill="${c}"/><rect x="21" y="24" width="22" height="12" rx="3" fill="${w}"/><rect x="25" y="41" width="14" height="3" rx="1.5" fill="${w}" opacity=".8"/>`,
  }[p.form] || '';
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">${f}</svg>`;
}
const QR_CACHE = new Map();
function qrSvg(text) {
  if (QR_CACHE.has(text)) return QR_CACHE.get(text);
  if (typeof qrcode !== 'function') return `<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#fff"/><text x="5" y="6" font-size="2" text-anchor="middle" fill="#000">QR</text></svg>`;
  const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 2} ${r + 2}h1v1h-1z`;
  const svg = `<svg viewBox="0 0 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${n + 4}" height="${n + 4}" fill="#ffffff"/><path d="${d}" fill="#0b0f0d"/></svg>`;
  QR_CACHE.set(text, svg); return svg;
}

/* ---------- Consumer verification page (shared by phone frame and real full-page route) ---------- */
function cvRun(token, extra = {}) {
  const res = verify(extractToken(token), { city: UI.city, deviceId: UI.device, channel: 'web', ...extra });
  UI.cv = { screen: 'result', res, token: extractToken(token) }; UI.last = res;
  UI.lastApi = { verification_id: res.eventId, result: res.status, checked_at: new Date(res.at).toISOString(), risk_score: res.score, factors: res.factors.map(f => f.label) };
  return res;
}
function cvTop() { return `<div class="cv-top">${emblem(24)}<b>Verify<span style="color:var(--g)">NG</span></b><small>Free product check</small></div>`; }
function cvFoot() { return `<div class="cv-foot">VerifyNG is an independent verification service and is not operated or endorsed by NAFDAC. To report a product to NAFDAC, use the official channels at nafdac.gov.ng.<br><b>Demo · synthetic products</b></div>`; }
function renderCV() {
  const cv = UI.cv;
  if (cv.screen === 'scan') return `<div class="cv">${cvTop()}<div class="scanhome">
    <div><h2 style="font-size:22px">Check a product</h2><p class="muted" style="font-size:14px;margin-top:4px">Scan the VerifyNG code on the pack. Your phone camera works; no app needed.</p></div>
    <div class="viewfinder"><span>Point your camera at the code</span></div>
    ${UI.view === 'scan' ? '<p class="muted" style="font-size:13px;text-align:center">Demo: tap any product label beside this phone to scan it.</p>' : ''}
    <label class="btn btn-s" for="qr-file">${ic('upload')} Use a photo of the code</label><input id="qr-file" type="file" accept="image/*" capture="environment" hidden>
    <form class="stack" data-form="manual"><label class="field">Or type the code under the QR<input id="manual-code" placeholder="V1-LGP-…" autocomplete="off" spellcheck="false"></label><button class="btn btn-p">Check code</button></form>
  </div>${cvFoot()}</div>`;
  if (cv.screen === 'report') return `<div class="cv">${cvTop()}<form class="cv-main" data-form="report">
    <h2 style="font-size:22px">Report this product</h2><p class="muted" style="font-size:14px">Your report goes to the manufacturer and to regulatory investigators. We store only the city, never your exact location.</p>
    <label class="field">Where did you buy it?<input id="rp-where" placeholder="e.g. Ochanja market, Onitsha" required></label>
    <label class="field">What did you notice?<textarea id="rp-text" placeholder="Different colour, poor print, seal broken…" required></textarea></label>
    <label class="toggle"><input type="checkbox" id="rp-consent"> An investigator may contact me</label>
    <label class="field" id="rp-phone-wrap">Phone number (optional)<input id="rp-phone" inputmode="tel" placeholder="080…"></label>
    <div class="cv-actions"><button class="btn btn-p">Send report</button><button type="button" class="btn btn-s" data-act="cv-back">Cancel</button></div></form>${cvFoot()}</div>`;
  if (cv.screen === 'thanks') return `<div class="cv">${cvTop()}<div class="cv-main"><div class="verdict t-ok"><div class="ic">${ic('check', 34)}</div><h2>Report received</h2><p>Reference <b class="mono">${esc(cv.ref)}</b>. Keep the product and its packaging; investigators may ask for it.</p></div>
    <div class="notice">You can also report directly to NAFDAC through its official channels listed at nafdac.gov.ng.</div><div class="cv-actions"><button class="btn btn-s" data-act="cv-again">Check another product</button></div></div>${cvFoot()}</div>`;
  const r = cv.res, st = STATUS[r.status], tone = st.tone, p = r.product, b = r.batch, m = r.mfr;
  const title = { verified: 'Verified', suspicious: 'Suspicious', not_recognised: 'Not recognised', reg_invalid: 'Registration invalid', expired: 'Expired', recalled: 'Recalled', unavailable: 'Unable to verify', pin_required: 'Almost done' }[r.status];
  const showDetails = ['verified', 'expired', 'recalled', 'reg_invalid'].includes(r.status);
  const prodCard = p ? `<div class="prod"><div class="img">${productArt(p, 50)}</div><div style="min-width:0"><b>${esc(p.name)}</b><span>${esc(m.name)}</span></div></div>` : '';
  const kv = showDetails ? `<dl class="kv" style="margin:0">
    <div><dt>Batch</dt><dd class="r mono" style="margin:0">${esc(b.code)}</dd></div>
    <div><dt>Manufactured</dt><dd class="r" style="margin:0">${fmtD(b.mfg)}</dd></div>
    <div><dt>Expires</dt><dd class="r" style="margin:0;${b.exp <= r.at ? 'color:var(--exp)' : ''}">${fmtD(b.exp)}</dd></div>
    <div><dt>NAFDAC reg. ref.</dt><dd class="r mono" style="margin:0;${p.reg.status !== 'Valid' && r.status === 'reg_invalid' ? 'color:var(--reg)' : ''}">${esc(p.reg.number)}${r.status === 'reg_invalid' ? ' · ' + esc(p.reg.status) : ''}</dd></div>
    <div><dt>Manufacturer</dt><dd class="r" style="margin:0">${r.status === 'verified' ? '<span style="color:var(--ok)">Confirmed this unit</span>' : 'Unit on record'}</dd></div>
    <div><dt>Unit serial</dt><dd class="r mono" style="margin:0">#${r.unit.serial} of ${n0(b.size)}</dd></div>
    <div><dt>Checked</dt><dd class="r" style="margin:0">${fmtDT(r.at)}</dd></div>
    <div><dt>Verification ID</dt><dd class="r mono" style="margin:0;font-size:11.5px">${esc(r.eventId || '—')}</dd></div></dl>` : '';
  let extra = '';
  if (r.status === 'verified') {
    const others = (r.prior || []).filter(e => e.deviceId !== UI.device), mine = (r.prior || []).filter(e => e.deviceId === UI.device);
    if (others.length) extra = `<div class="notice">First checked on ${fmtD(others[0].at)}${cityBy(others[0].city) ? ' in ' + esc(others[0].city) : ''}. If you just opened a sealed pack, ask the seller why it was checked before.</div>`;
    else if (mine.length) extra = `<div class="notice">You have checked this code ${mine.length + 1} times on this phone. That is fine.</div>`;
    else extra = `<div class="notice">This is the first time anyone has checked this code.</div>`;
    if (p.highRisk) extra += `<div class="notice">Scratch-off PIN confirmed. This PIN can only be redeemed once.</div>`;
  }
  if (r.status === 'suspicious') extra = `<div class="notice warn"><b>Do not rely on this product being genuine.</b><ul>${r.factors.filter(f => f.consumer).map(f => `<li>${esc(f.consumer)}</li>`).join('') || '<li>Unusual activity on this code.</li>'}</ul><p style="margin-top:8px">The code itself is real, but it may have been copied onto fake packs. Keep the product and report it.</p></div>`;
  if (r.status === 'not_recognised') extra = `<div class="notice warn"><b>This code is not in any manufacturer's records.</b><p style="margin-top:6px">The pack may be counterfeit, or the code may be damaged. Check that you scanned the VerifyNG code, then report it if it fails again.</p></div>`;
  if (r.status === 'recalled') extra = `<div class="notice warn"><b>Recall notice ${esc(r.recall.id)}</b><p style="margin-top:6px">${esc(r.recall.reason)}. Stop using it and return it to where you bought it.</p></div>`;
  if (r.status === 'expired') extra = `<div class="notice warn">Expired products can be unsafe or ineffective. Do not use or sell it.</div>`;
  if (r.status === 'reg_invalid') extra = `<div class="notice warn">The manufacturer issued this unit, but the product's regulatory registration is listed as <b>${esc(p.reg.status.toLowerCase())}</b>. It should not be on sale.</div>`;
  if (r.status === 'unavailable') extra = `<div class="notice">We could not confirm this product right now, so we are not showing any result as genuine. Check your connection and try again in a moment.</div>`;
  if (r.status === 'pin_required') extra = `<form class="stack" data-form="pin"><div class="notice">This is a high-risk product. Gently scratch the silver panel on the label to reveal a 6-digit PIN.</div><label class="field pinrow">PIN<input id="pin-in" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="••••••" required autocomplete="one-time-code"></label><button class="btn btn-p">Confirm PIN</button></form>`;
  const actions = r.status === 'unavailable' ? `<button class="btn btn-p" data-act="cv-retry">Try again</button>` :
    r.status === 'pin_required' ? '' :
    `${['suspicious', 'not_recognised', 'recalled', 'expired', 'reg_invalid'].includes(r.status) ? '<button class="btn btn-p" data-act="cv-report">Report this product</button>' : ''}<button class="btn btn-s" data-act="cv-again">Check another product</button>`;
  return `<div class="cv">${cvTop()}<div class="cv-main">
    <div class="verdict t-${tone}" role="status"><div class="ic">${ic(TONE_IC[tone], 34)}</div><h2>${title}</h2><p>${esc(st.line)}</p></div>
    ${r.status === 'suspicious' && p ? `<p class="muted" style="font-size:13px;margin-bottom:-6px">This code claims to be:</p>` : ''}${r.status !== 'not_recognised' && r.status !== 'unavailable' ? prodCard : ''}
    ${extra}${kv}<div class="cv-actions">${actions}</div></div>${cvFoot()}</div>`;
}

/* ---------- shell ---------- */
function navHtml() {
  const v = UI.view, b = (id, l) => `<button data-go="${id}" ${v === id ? 'aria-current="page"' : ''}>${l}</button>`;
  return `<div class="ribbon"><b>Investor demo.</b> All manufacturers, products and scans are synthetic. VerifyNG is not affiliated with or endorsed by NAFDAC.</div>
  <header class="nav"><div class="wrap"><button class="brand" data-go="home">${emblem(30)}<span>Verify<span class="ng">NG</span></span></button>
  <nav class="pillbar" aria-label="Main">${b('home', 'Overview')}${b('scan', 'Consumer check')}${b('maker', 'Manufacturer console')}${b('regulator', 'Regulator console')}</nav>
  <button class="btn btn-p navcta" data-go="scan">${ic('qr')} Try a scan</button></div></header>`;
}
function render() {
  const app = $('#app'), keepScroll = UI.view === UI._lastView; UI._lastView = UI.view; const y = window.scrollY;
  const phoneBody = document.querySelector('.phone .body'), py = phoneBody ? phoneBody.scrollTop : 0;
  if (UI.view === 'full') { app.innerHTML = `<div class="full-cv">${renderCV()}</div>`; return; }
  app.innerHTML = navHtml() + `<main>${{ home: viewHome, scan: viewScan, maker: viewMaker, regulator: viewReg }[UI.view]()}</main>` + footHtml();
  if (keepScroll) { window.scrollTo(0, y); const pb = document.querySelector('.phone .body'); if (pb && UI.keepPhone) pb.scrollTop = py; } UI.keepPhone = false;
}
function footHtml() {
  return `<footer><div class="wrap"><div style="display:flex;gap:10px;align-items:flex-start">${emblem(26)}<div><b style="color:var(--ink)">VerifyNG</b> · Every product. A verifiable identity.<p style="margin-top:6px">Independent authentication infrastructure proposed for adoption by Nigerian regulators, subject to NAFDAC's approval and partnership. It is not an official NAFDAC system. The national Coat of Arms is not used: its use requires government authorisation, so this demo uses an original green-white-green emblem.</p></div></div>
  <p class="mono" style="font-size:12px">Demo build · data resets on reload · ${n0(S.units.size)} synthetic identities</p></div></footer>`;
}

/* ---------- Landing ---------- */
function viewHome() {
  const g = DEMO.find(d => d.key === 'genuine'), prev = UI.cv; UI.cv = { screen: 'result', res: verify(g.token, { city: 'Lagos', deviceId: 'preview', dry: true }) }; UI.cv.res.prior = []; UI.cv.res.eventId = 'evt_preview'; const phone = renderCV(); UI.cv = prev;
  const st = stats();
  return `<div class="wrap"><section class="hero">
    <span class="eyebrow"><span class="flag"><i></i><i></i><i></i></span>Authentication infrastructure for regulated products in Nigeria</span>
    <h1>Every product. <em>A verifiable identity.</em></h1>
    <p class="lede">Manufacturers connect their systems once. Every unit they make gets a signed, unique code. Anyone can check it with a phone camera, no app needed, and regulators see counterfeits as they surface.</p>
    <div class="ctas"><button class="btn btn-p" data-go="scan">${ic('qr')} Scan a demo product</button><button class="btn btn-s" data-go="maker">Open manufacturer console</button></div>
    <div class="stage">
      <div class="float f1"><div class="k">Identities issued</div><div class="v num">${n0(S.units.size)}</div><span class="muted">unique signed codes across 10 batches</span></div>
      <div class="float f2"><div class="k" style="color:var(--warn)">Clone detected</div><div style="font-weight:600;margin-top:4px">AMX-2610 · serial #4</div><span class="muted">One code checked on ${new Set((S.eventsByUnit.get(DEMO[1].unit.id) || []).map(e => e.deviceId)).size} phones in 5 cities</span></div>
      <div class="float f3"><div class="k">Checks run</div><div class="v num">${n0(st.total)}</div><span class="muted">13 checks per scan, rules first</span></div>
      <div class="float f4"><div class="k">API</div><div class="mono" style="margin-top:6px">POST /api/v1/verify</div><span class="muted">Same engine for web, partners and POS</span></div>
      <div class="phone"><div class="screen"><div class="notch"></div><div class="urlbar">🔒<span>${esc(qrBase().replace(/^https?:\/\//, ''))}#u-V1-LGP-…</span></div><div class="body">${phone}</div></div></div>
    </div></section>

  <section class="block"><div class="sec-head"><span class="k">The problem we solve</span><h2>A registration number on a pack proves nothing about that pack.</h2><p>Counterfeiters copy registration numbers and brand artwork. VerifyNG checks the individual unit instead, against the records of the manufacturer that made it.</p></div>
    <div class="truth"><div class="card"><h3>Per-unit identity</h3><p>Each pack carries its own random, signed code. Nothing sequential to guess, and nothing confidential inside it.</p></div>
    <div class="card"><h3>Copies give themselves away</h3><p>A real code copied onto fake packs gets scanned in many places. The rules engine flags duplicate, fast-moving and burst scans, and explains why.</p></div>
    <div class="card"><h3>Never a false "genuine"</h3><p>If authoritative records are unreachable, the answer is "Unable to verify". The system never fills a gap with a green tick.</p></div></div></section>

  <section class="block"><div class="sec-head"><span class="k">How it works</span><h2>From factory line to a shopper's phone</h2></div>
    <div class="grid g4 steps"><div class="card"><h3>Connect</h3><p>Manufacturers link their ERP or production database through the REST API, webhooks or CSV upload.</p></div>
    <div class="card"><h3>Serialize</h3><p>Each batch gets unit identities, signed with the manufacturer's own key (HMAC-SHA256, KMS-held in production).</p></div>
    <div class="card"><h3>Print</h3><p>Unique QR codes go on labels. High-risk lines add a scratch-off PIN or an NFC tag.</p></div>
    <div class="card"><h3>Verify</h3><p>A shopper scans with the phone camera. A light web page returns one of seven clear outcomes.</p></div></div></section>

  <section class="block"><div class="sec-head"><span class="k">Seven honest answers</span><h2>Every scan ends in one clear outcome</h2></div>
    <div class="outcomes">${['verified', 'suspicious', 'not_recognised', 'reg_invalid', 'expired', 'recalled', 'unavailable'].map(k => { const t = STATUS[k].tone; return `<div class="oc"><span class="dot" style="background:var(--${t}-bg);color:var(--${t})">${ic(TONE_IC[t])}</span><div><b>${STATUS[k].label}</b><span>${STATUS[k].line}</span></div></div>`; }).join('')}</div></section>

  <section class="block"><div class="sec-head"><span class="k">Three experiences</span><h2>One engine, three audiences</h2></div>
    <div class="grid g3 exp-cards">
      <div class="card"><span class="tag">Consumers</span><h3>Check without an app</h3><p>A page under 100 KB that works on low-end Android phones and slow networks. Includes a photo-based scanner and a report form.</p><button class="btn btn-s" data-go="scan">Try the consumer check</button></div>
      <div class="card"><span class="tag">Manufacturers</span><h3>Enterprise console</h3><p>Products, batches, QR label sheets, recalls, API keys, webhooks and counterfeit intelligence. Each tenant sees only its own data.</p><button class="btn btn-s" data-go="maker">Open the console</button></div>
      <div class="card"><span class="tag">Regulators</span><h3>Oversight console</h3><p>National heatmap, incident investigations, recall monitoring, compliance and a tamper-evident audit trail, scoped by role and zone.</p><button class="btn btn-s" data-go="regulator">Open the regulator view</button></div></div></section>

  <section class="block"><div class="sec-head"><span class="k">Architecture</span><h2>API-first, multi-tenant, built to be audited</h2><p>This demo runs the real engine in your browser. Production splits it into the services below.</p></div>
    <div class="archwrap"><div class="arch">
      <div class="col"><h4>Channels</h4><div class="box">Consumer PWA<small>phone camera → web page</small></div><div class="box">Manufacturer console</div><div class="box">Regulator console</div><div class="box">Partner &amp; POS apps<small>REST /v1/verify</small></div></div>
      <div class="col"><h4>Edge</h4><div class="box">CDN + WAF<small>DDoS protection, cache</small></div><div class="box">API gateway<small>OAuth 2.0 client credentials, API keys, rate limits, idempotency</small></div></div>
      <div class="col"><h4>Core services</h4><div class="box core">Authentication engine<small>signature → records → recall → risk rules</small></div><div class="box core">Identity &amp; serialization</div><div class="box">Integration hub<small>webhooks, CSV, ERP connectors</small></div><div class="box">Intelligence (Phase 4)<small>anomaly models, advisory only</small></div></div>
      <div class="col"><h4>Data</h4><div class="box">PostgreSQL<small>row-level tenant isolation</small></div><div class="box">Redis<small>scan counters, hot cache</small></div><div class="box">Queue + workers<small>webhooks, imports, analytics</small></div><div class="box">KMS / HSM<small>per-tenant signing keys</small></div><div class="box">Regulatory connector<small>off until officially authorised</small></div></div>
    </div></div></section>

  <section class="block"><div class="sec-head"><span class="k">Business model</span><h2>Free for consumers. Configurable for everyone else.</h2><p>The pricing engine is configuration, not code, so each revenue line below can be switched on per contract.</p></div>
    <div class="pricing"><div class="card"><b>Subscriptions</b><p>Tiered manufacturer plans by volume and seats.</p></div><div class="card"><b>Per-unit serialization</b><p>A fee per identity issued.</p></div><div class="card"><b>Verification API</b><p>Metered calls for partners, distributors and retail POS.</p></div><div class="card"><b>Integration services</b><p>One-off ERP and production-line setup.</p></div><div class="card"><b>Intelligence</b><p>Counterfeit analytics subscriptions.</p></div><div class="card"><b>Government contracts</b><p>National or regional regulator licences.</p></div></div></section>

  <section class="block"><div class="sec-head"><span class="k">Roadmap</span><h2>Built in four phases</h2></div>
    <div class="roadmap"><div class="card now"><span class="ph">PHASE 1 · IN THIS DEMO</span><h3>Core MVP</h3><ul><li>Manufacturer onboarding and API</li><li>CSV import and serialization</li><li>QR generation and consumer check</li><li>Dashboard and history</li></ul></div>
    <div class="card now"><span class="ph">PHASE 2 · IN THIS DEMO</span><h3>Enterprise</h3><ul><li>Webhooks and signed events</li><li>Duplicate detection</li><li>Batch monitoring and analytics</li><li>ERP connectors (next)</li></ul></div>
    <div class="card now"><span class="ph">PHASE 3 · PROTOTYPED</span><h3>Regulatory</h3><ul><li>Regulator console</li><li>Investigations and recalls</li><li>Audit reports</li><li>Registry link, once authorised</li></ul></div>
    <div class="card"><span class="ph">PHASE 4 · PLANNED</span><h3>Intelligence</h3><ul><li>Packaging image analysis</li><li>Geographic risk models</li><li>NFC authentication</li><li>Expansion to other African regulators</li></ul></div></div></section></div>`;
}

/* ---------- Consumer simulator ---------- */
function viewScan() {
  const r = UI.last;
  const cities = CITIES.map(c => c.name).sort();
  return `<div class="wrap"><div class="sim">
  <div style="min-width:0">
    <div class="c-head" style="margin-bottom:14px"><div><h1>Consumer check</h1><p>Each label below is a real signed code. Tap one to scan it with the phone.</p></div></div>
    <div class="labels">${DEMO.map(d => `<button class="label" data-act="scan-demo" data-k="${d.key}"><div class="qr">${qrSvg(qrUrl(d.token))}</div><span class="chip" style="background:var(--${d.tone}-bg);color:var(--${d.tone})">${esc(d.title)}</span><b>${esc(productOf(d.unit.productId).name.split(' · ')[0])}</b><span>${esc(d.note)}</span>${d.pin ? `<span class="mono" style="font-size:11px">Scratch PIN: ${d.pin}</span>` : ''}</button>`).join('')}</div>
    <div class="panel" style="margin-top:14px"><h3>Simulate the real world</h3>
      <div class="ctrls"><label class="field">Shopper's city<select id="sim-city">${cities.map(c => `<option ${c === UI.city ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <div class="field">Clone attack<button class="btn btn-s" data-act="clone" ${UI.cv.token ? '' : 'disabled'}>Scan last code from another phone</button></div></div>
      <label class="toggle" style="margin-top:12px"><input type="checkbox" id="sim-outage" ${S.available ? '' : 'checked'}> Simulate an outage of authoritative records</label>
      <p class="muted" style="font-size:13px;margin-top:10px">Try this: scan the genuine label in Lagos, switch the city to Kano, then press "Scan last code from another phone". The engine flags impossible travel.</p></div>
    <details class="panel"><summary style="cursor:pointer;font-weight:600">Scan with a real phone</summary>
      <p class="muted" style="font-size:13.5px;margin-top:8px">Each QR opens this demo's verification page at <span class="mono">${esc(qrBase())}#u-…</span>. Share the demo link publicly, then point any phone camera at a label. Phones load the same synthetic records, so results match.</p>
      <label class="field" style="margin-top:10px">Demo link used inside QR codes<input id="base-url" value="${esc(qrBase())}" spellcheck="false"></label></details>
  </div>
  <div class="phonecol"><div class="phone"><div class="screen"><div class="notch"></div><div class="urlbar">🔒<span>${esc(qrBase().replace(/^https?:\/\//, ''))}${UI.cv.token ? '#u-' + esc(UI.cv.token) : ''}</span></div><div class="body">${renderCV()}</div></div></div>
    <button class="btn btn-s btn-sm" data-act="cv-again">${ic('undo', 15)} Back to camera</button></div>
  <div class="trace" style="min-width:0"><div class="panel"><h3>Engine trace</h3><p class="muted" style="font-size:12.5px;margin-top:2px">Internal view for this demo. Consumers never see scores or rule names.</p>
    ${r ? `<ol>${r.steps.map(s => `<li><span class="s ${s.ok === true ? 'y' : s.ok === false ? 'n' : 'w'}">${s.ok === true ? '✓' : s.ok === false ? '!' : '…'}</span><div>${esc(s.k)}<small>${esc(s.note || '')}</small></div></li>`).join('')}</ol>
      <div style="margin-top:14px;display:flex;justify-content:space-between"><b>Risk score</b><b class="num">${r.score}/100</b></div><div class="scorebar"><i style="width:${Math.min(100, r.score)}%"></i></div>
      ${r.factors.filter(f => f.w).map(f => `<div class="factor"><span>${esc(f.label)}</span><b class="num">+${f.w}</b></div>`).join('') || '<p class="muted" style="font-size:13px;margin-top:8px">No risk factors fired.</p>'}
      <p class="muted" style="font-size:12.5px;margin-top:10px">Suspicious at 50 or more. Rules decide; AI models only add evidence.</p>
      <h3 style="margin-top:16px;font-size:14px">API response</h3><pre class="code" style="margin-top:8px">${esc(JSON.stringify(UI.lastApi, null, 2))}</pre>`
      : '<p class="muted" style="margin-top:12px">Scan a label to see all 13 checks run.</p>'}</div></div>
  </div></div>`;
}

/* ---------- Manufacturer console ---------- */
const MTABS = [['overview', 'Overview', 'grid'], ['products', 'Products', 'box'], ['batches', 'Batches & QR codes', 'qr'], ['import', 'CSV import', 'upload'], ['api', 'API & integrations', 'plug'], ['intel', 'Counterfeit intelligence', 'radar']];
function dayBars(events, days = 14) {
  const start = new Date(); start.setHours(0, 0, 0, 0); const t0 = start.getTime() - (days - 1) * DAY, rows = [];
  for (let i = 0; i < days; i++) rows.push({ d: t0 + i * DAY, ok: 0, flag: 0, other: 0 });
  events.forEach(e => { const i = Math.floor((e.at - t0) / DAY); if (i < 0 || i >= days) return; if (e.status === 'verified' || e.status === 'pin_required') rows[i].ok++; else if (e.status === 'suspicious' || e.status === 'not_recognised') rows[i].flag++; else rows[i].other++; });
  const max = Math.max(1, ...rows.map(r => r.ok + r.flag + r.other)), step = max > 40 ? 20 : max > 16 ? 10 : 5, top = Math.ceil(max / step) * step;
  return `<div style="display:grid;grid-template-columns:28px 1fr;gap:6px"><div style="display:flex;flex-direction:column;justify-content:space-between;height:170px;font-size:11px;color:var(--muted);text-align:right;padding-top:10px" class="num"><span>${top}</span><span>${top / 2}</span><span>0</span></div>
  <div style="position:relative"><div style="position:absolute;inset:10px 0 0;background:linear-gradient(var(--line) 1px,transparent 1px) 0 0/100% 50%;pointer-events:none"></div><div class="bars">${rows.map(r => `<div class="b" title="${fmtD(r.d)}: ${r.ok} verified, ${r.flag} suspicious or not recognised, ${r.other} expired, recalled or registration issues"><i style="height:${100 * r.ok / top}%;background:var(--g)"></i><i style="height:${100 * r.other / top}%;background:var(--exp)"></i><i style="height:${100 * r.flag / top}%;background:var(--warn)"></i></div>`).join('')}</div>
  <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px"><span>${fmtD(rows[0].d).replace(/ \d{4}$/, '')}</span><span>Today</span></div></div></div>
  <div class="legend"><span><i style="background:var(--g)"></i>Verified</span><span><i style="background:var(--exp)"></i>Expired, recalled, registration</span><span><i style="background:var(--warn)"></i>Suspicious or not recognised</span></div>`;
}
function hbars(rows, color) { const max = Math.max(1, ...rows.map(r => r[1])); return rows.map(([l, v]) => `<div class="hbar"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l)}</span><span class="t"><i style="width:${100 * v / max}%;${color ? 'background:' + color : ''}"></i></span><span class="n">${n0(v)}</span></div>`).join(''); }
const TILE = { SO: [1, 0], KT: [3, 0], JI: [5, 0], YO: [6, 0], BO: [7, 0], KE: [0, 1], ZA: [2, 1], KN: [4, 1], BA: [5, 1], GO: [6, 1], AD: [7, 1], KW: [1, 2], NI: [2, 2], KD: [3, 2], PL: [5, 2], TA: [6, 2], OY: [1, 3], FC: [3, 3], NA: [4, 3], BE: [5, 3], OG: [0, 4], OS: [1, 4], EK: [2, 4], KO: [3, 4], EN: [4, 4], EB: [5, 4], LA: [0, 5], OD: [1, 5], ED: [2, 5], AN: [3, 5], IM: [4, 5], AB: [5, 5], CR: [6, 5], DE: [2, 6], BY: [3, 6], RI: [4, 6], AK: [5, 6] };
function tileMap(events) {
  const by = {}; events.forEach(e => { const c = cityBy(e.city); if (c) by[c.st] = (by[c.st] || 0) + 1; }); const max = Math.max(1, ...Object.values(by));
  const cells = Object.entries(TILE).map(([st, [x, y]]) => { const v = by[st] || 0, a = v ? 0.18 + 0.82 * v / max : 0; const city = CITIES.find(c => c.st === st);
    return `<div class="tile" style="grid-column:${x + 1};grid-row:${y + 1};background:${v ? `color-mix(in srgb,var(--warn) ${Math.round(a * 100)}%,var(--surface))` : 'var(--surface)'};color:${a > .55 ? 'var(--surface)' : 'var(--muted)'}" title="${esc(city.name)} (${st}): ${v} flagged">${st}</div>`; }).join('');
  return `<div class="tilemap">${cells}</div><div class="legend"><span><i style="background:var(--surface);border:1px solid var(--line)"></i>None</span><span><i style="background:color-mix(in srgb,var(--warn) 40%,var(--surface))"></i>Some</span><span><i style="background:var(--warn)"></i>Most</span><span>Schematic state grid, not to scale</span></div>`;
}
function viewMaker() {
  const m = mfrOf(UI.mfrId), mine = o => o.mfrId === m.id;
  const side = `<aside class="side"><div class="who"><label class="field" style="font-size:12px">Organisation (tenant)<select id="tenant">${S.mfrs.map(x => `<option value="${x.id}" ${x.id === m.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label><small style="margin-top:8px">Signed in as ops@${m.code.toLowerCase()}.demo · MFA on</small><small>Plan: ${m.plan} · Sandbox + Live</small></div>
    ${MTABS.map(([k, l, i]) => `<button class="tab" role="tab" aria-selected="${UI.mtab === k}" data-mtab="${k}">${ic(i)} ${l}</button>`).join('')}</aside>`;
  const body = { overview: mOverview, products: mProducts, batches: mBatches, import: mImport, api: mApi, intel: mIntel }[UI.mtab](m, mine);
  return `<div class="wrap"><div class="shell">${side}<div style="min-width:0">${body}</div></div></div>`;
}
function head(t, s, right = '') { return `<div class="c-head"><div><h1>${t}</h1><p>${s}</p></div>${right}</div>`; }
function mOverview(m, mine) {
  const s = stats(mine), units = [...S.units.values()].filter(mine).length;
  const k = (l, v, c) => `<div class="kpi"><div class="k">${l}</div><div class="v" ${c ? `style="color:var(--${c})"` : ''}>${n0(v)}</div></div>`;
  const recent = s.ev.slice(-8).reverse();
  return head(esc(m.name), `Tenant ${m.id} · Last 30 days · Synthetic demo data`, `<button class="btn btn-p" data-mtab="batches">${ic('qr', 16)} New batch</button>`) +
  `<div class="kpis">${k('Registered products', S.products.filter(mine).length)}${k('Identities issued', units)}${k('Verification scans', s.total)}${k('Verified', s.by.verified, 'ok')}${k('Suspicious', s.by.suspicious, 'warn')}${k('Not recognised', s.by.not_recognised, 'bad')}${k('Expired', s.by.expired, 'exp')}${k('Recalled', s.by.recalled, 'rec')}</div>
  <div class="row2"><div class="panel"><h3>Verifications, last 14 days</h3>${dayBars(s.ev)}</div>
  <div class="panel"><h3>Results</h3><div style="margin-top:10px">${hbars(Object.entries(s.by).filter(([k, v]) => v).map(([k, v]) => [STATUS[k].label, v]))}</div>${s.by.reg_invalid ? `<p class="muted" style="font-size:13px;margin-top:10px">${n0(s.by.reg_invalid)} scans hit a product whose registration is not valid. Renew it to restore "Verified".</p>` : ''}</div></div>
  <div class="panel" style="margin-top:14px"><h3>Latest verifications</h3><div class="tbl" style="margin-top:10px;border:0"><table><thead><tr><th>When</th><th>Product</th><th>City</th><th>Result</th><th>Risk</th></tr></thead><tbody>${recent.map(e => `<tr><td class="num">${ago(e.at)}</td><td>${e.productId ? esc(productOf(e.productId).sku) : '<span class="muted">unknown code</span>'}</td><td>${esc(e.city)}</td><td>${statusPill(e.status)}</td><td class="num">${e.score}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function mProducts(m, mine) {
  const ps = S.products.filter(mine);
  return head('Products', 'Product master records synced from your ERP, the API or CSV.') +
  `<form class="panel form" data-form="product"><label class="field">SKU<input id="np-sku" placeholder="CIP-500" required pattern="[A-Z0-9-]{3,20}"></label><label class="field" style="grid-column:span 2">Product name<input id="np-name" placeholder="Ciprofloxacin 500 mg · 10" required></label><label class="field">Category<select id="np-cat"><option>Drugs</option><option>Food</option><option>Beverages</option><option>Cosmetics</option><option>Medical devices</option><option>Chemicals</option></select></label><label class="field">NAFDAC reg. no.<input id="np-reg" placeholder="DEMO-A4-0000" required></label><label class="toggle"><input type="checkbox" id="np-hr"> High risk (add scratch PIN)</label><button class="btn btn-p">Register product</button></form>
  <div class="tbl" style="margin-top:14px"><table><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Registration</th><th>Batches</th><th>Identities</th><th>Protection</th></tr></thead><tbody>${ps.map(p => { const bs = S.batches.filter(b => b.productId === p.id); return `<tr><td class="mono">${esc(p.sku)}</td><td><div style="display:flex;gap:10px;align-items:center">${productArt(p, 32)}${esc(p.name)}</div></td><td>${esc(p.category)}</td><td><span class="mono">${esc(p.reg.number)}</span><br>${p.reg.status === 'Valid' ? '<span class="pill" style="background:var(--ok-bg);color:var(--ok)">Valid</span>' : `<span class="pill" style="background:var(--reg-bg);color:var(--reg)">${esc(p.reg.status)}</span>`}</td><td class="num">${bs.length}</td><td class="num">${n0(bs.reduce((a, b) => a + b.size, 0))}</td><td>${p.highRisk ? 'QR + scratch PIN' : 'QR'}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function batchState(b) { const r = S.recalls.find(x => x.batchId === b.id); return r ? ['Recalled', 'rec'] : b.exp <= Date.now() ? ['Expired', 'exp'] : ['Active', 'ok']; }
function mBatches(m, mine) {
  const ps = S.products.filter(mine), bs = S.batches.filter(mine), sel = bs.find(b => b.id === UI.selBatch);
  const today = new Date().toISOString().slice(0, 10), exp = new Date(Date.now() + 540 * DAY).toISOString().slice(0, 10);
  let sheet = '';
  if (sel) {
    const p = productOf(sel.productId), units = S.unitsByBatch.get(sel.id) || [], show = units.slice(0, 24);
    sheet = `<div class="panel" style="margin-top:14px" id="sheet"><div class="c-head" style="margin:0"><div><h3>Label sheet · ${esc(sel.code)}</h3><p class="muted" style="font-size:13.5px">${esc(p.name)} · showing ${show.length} of ${n0(units.length)} identities</p></div>
    <div class="toolbar"><button class="btn btn-s btn-sm" data-act="copy-tokens">Copy all ${n0(units.length)} QR links (CSV)</button><button class="btn btn-s btn-sm" data-act="close-sheet">Close</button></div></div>
    <div class="sheet">${show.map(u => `<div class="qrlabel ${u.status !== 'Active' ? 'off' : ''}">${qrSvg(qrUrl(tokenFor(u)))}<div class="meta"><span>${esc(sel.code)}</span><span>#${u.serial}</span></div><div class="meta"><span>EXP ${new Date(sel.exp).toISOString().slice(0, 7)}</span><span>${esc(m.code)}</span></div>
      ${p.highRisk ? `<button class="scratch" data-act="reveal" data-u="${u.id}">${UI.reveal.has(u.id) ? 'PIN ' + pinFor(u) : 'Scratch to reveal PIN'}</button>` : ''}
      <div class="toolbar" style="justify-content:space-between"><button class="btn btn-s btn-sm" style="padding:3px 8px;font-size:11px" data-act="test-unit" data-u="${u.id}">Test scan</button><button class="btn btn-sm ${u.status === 'Active' ? 'btn-danger' : 'btn-s'}" style="padding:3px 8px;font-size:11px" data-act="toggle-unit" data-u="${u.id}">${u.status === 'Active' ? 'Deactivate' : 'Reactivate'}</button></div></div>`).join('')}</div>
    <p class="muted" style="font-size:12.5px;margin-top:10px">Codes hold only an opaque unit ID and a signature: no prices, customers or internal data. Deactivate a code if a carton is stolen or damaged; any scan of it is then flagged.</p></div>`;
  }
  return head('Batches & QR codes', 'Create a batch, issue unit identities and print labels.') +
  `<form class="panel form" data-form="batch"><label class="field" style="grid-column:span 2">Product<select id="nb-prod">${ps.map(p => `<option value="${p.id}">${esc(p.sku)} · ${esc(p.name)}</option>`).join('')}</select></label><label class="field">Batch code<input id="nb-code" required placeholder="${esc(ps[0] ? ps[0].sku.split('-')[0] : 'BAT')}-2611"></label><label class="field">Manufactured<input id="nb-mfg" type="date" value="${today}" required></label><label class="field">Expires<input id="nb-exp" type="date" value="${exp}" required></label><label class="field">Units to serialize<input id="nb-qty" type="number" min="1" max="2000" value="120" required></label><button class="btn btn-p">Create and serialize</button></form>
  <div class="tbl" style="margin-top:14px"><table><thead><tr><th>Batch</th><th>Product</th><th>Made</th><th>Expires</th><th>Identities</th><th>Scans</th><th>Flagged</th><th>Status</th><th></th></tr></thead><tbody>${bs.map(b => { const ev = S.events.filter(e => e.batchId === b.id), fl = ev.filter(e => e.status === 'suspicious').length, [st, tone] = batchState(b); return `<tr><td class="mono">${esc(b.code)}</td><td>${esc(productOf(b.productId).sku)}</td><td class="num">${fmtD(b.mfg)}</td><td class="num">${fmtD(b.exp)}</td><td class="num">${n0(b.size)}</td><td class="num">${n0(ev.length)}</td><td class="num" ${fl ? 'style="color:var(--warn);font-weight:600"' : ''}>${fl}</td><td><span class="pill" style="background:var(--${tone}-bg);color:var(--${tone})">${st}</span></td>
    <td><div class="toolbar" style="flex-wrap:nowrap"><button class="btn btn-s btn-sm" data-act="sheet" data-b="${b.id}">Labels</button><button class="btn btn-s btn-sm" data-act="more" data-b="${b.id}">+100</button>${st !== 'Recalled' ? `<button class="btn btn-danger btn-sm" data-act="recall-open" data-b="${b.id}">Recall</button>` : ''}</div></td></tr>
    ${UI.recallFor === b.id ? `<tr><td colspan="9" style="background:var(--rec-bg)"><form class="form" data-form="recall" style="grid-template-columns:1fr auto auto"><label class="field">Recall reason for ${esc(b.code)} (shown to consumers)<input id="rc-reason" required placeholder="e.g. Labelling error on strength"></label><button class="btn btn-danger" style="background:var(--rec);color:var(--surface)">Issue recall</button><button type="button" class="btn btn-s" data-act="recall-cancel">Cancel</button></form></td></tr>` : ''}`; }).join('')}</tbody></table></div>${sheet}`;
}
const SAMPLE_CSV = `sku,name,category,nafdac_reg,high_risk,form
CIP-500,Ciprofloxacin 500 mg Tablets · 10,Drugs,DEMO-A4-2231,no,box
ORS-20,Oral Rehydration Salts · 20 sachets,Drugs,DEMO-A4-2232,no,sachet
INS-10,Insulin Pen 100 IU/ml,Drugs,DEMO-A4-2233,yes,box
bad sku,Missing registration,Drugs,,no,box`;
function mImport(m) {
  const r = UI.importRes;
  return head('CSV import', 'Bulk-load product master data. Rows are validated one by one, so a bad row never blocks good ones.') +
  `<form class="panel stack" data-form="csv"><label class="field">CSV (header row required: sku, name, category, nafdac_reg; optional: high_risk, form)<textarea id="csv-in" style="font-family:var(--f-mono);font-size:12.5px;min-height:150px" spellcheck="false">${esc(SAMPLE_CSV)}</textarea></label>
  <div class="toolbar"><label class="btn btn-s" for="csv-file">${ic('upload', 16)} Load a .csv file</label><input id="csv-file" type="file" accept=".csv,text/csv" hidden><button class="btn btn-p">Validate and import</button></div></form>
  ${r ? `<div class="panel" style="margin-top:14px"><h3>${r.created.length} imported · ${r.errors.length} rejected</h3>${r.errors.map(e => `<div class="factor" style="background:var(--bad-bg)"><span>Row ${e.row}: ${esc(e.message)}</span></div>`).join('')}${r.created.length ? `<p class="muted" style="margin-top:10px">New products are in the Products tab, ready for batches.</p>` : ''}</div>` : ''}
  <div class="panel" style="margin-top:14px"><h3>Other ways to connect</h3><div class="grid g3" style="margin-top:10px"><div><b>REST API</b><p class="muted" style="font-size:13.5px">Push products and batches from your MES or ERP as they are made.</p></div><div><b>Scheduled SFTP drop</b><p class="muted" style="font-size:13.5px">Nightly CSV pickup for plants without API access. Phase 2.</p></div><div><b>ERP connectors</b><p class="muted" style="font-size:13.5px">Packaged connectors for common ERPs. Phase 2.</p></div></div></div>`;
}
const PRESETS = {
  verify: ['POST', '/api/v1/verify', () => ({ token: DEMO[0].token, city: 'Ibadan' })],
  analytics: ['GET', '/api/v1/manufacturers/analytics', () => null],
  history: ['GET', '/api/v1/verification/history?limit=5', () => null],
  product: ['POST', '/api/v1/products', () => ({ sku: 'VIT-C1K', name: 'Vitamin C 1000 mg · 20', category: 'Drugs', nafdac_reg: 'DEMO-A4-3001', high_risk: false })],
  getproduct: ['GET', '/api/v1/products/' + (S.products.find(p => p.mfrId === UI.mfrId) || {}).id, () => null],
  batch: ['POST', '/api/v1/batches', () => ({ product_id: (S.products.find(p => p.mfrId === UI.mfrId) || {}).id, batch_code: 'API-2611', manufactured_on: new Date().toISOString().slice(0, 10), expires_on: new Date(Date.now() + 500 * DAY).toISOString().slice(0, 10) })],
  serialize: ['POST', '/api/v1/products/{product_id}/serialize', () => { const b = S.batches.find(x => x.mfrId === UI.mfrId && !S.recalls.find(r => r.batchId === x.id)); return { batch_id: b.id, quantity: 25, _product: b.productId }; }],
  recall: ['POST', '/api/v1/recalls', () => ({ batch_id: (S.batches.find(x => x.mfrId === UI.mfrId) || {}).id, reason: 'Test recall from API (sandbox)' })],
  webhook: ['POST', '/api/v1/webhooks/register', () => ({ url: 'https://example.com/verifyng-events', events: ['verification.suspicious', 'recall.created'] })],
  status: ['GET', '/api/v1/integrations/status', () => null],
};
function presetFill(k) { const [mth, path, f] = PRESETS[k]; let body = f(); let p = path; if (body && body._product) { p = path.replace('{product_id}', body._product); delete body._product; } return { mth, path: p, body: body ? JSON.stringify(body, null, 2) : '' }; }
function mApi(m, mine) {
  const keys = S.keys.filter(mine), whs = S.webhooks.filter(mine), log = S.whLog.filter(mine).slice(-6).reverse();
  UI.console = UI.console && UI.console.mfr === m.id ? UI.console : { mfr: m.id, preset: 'analytics', ...presetFill('analytics') };
  const c = UI.console, resp = UI.apiResp;
  const curl = `curl -X ${c.mth} https://sandbox.api.verifyng.demo${c.path} \\\n  -H "Authorization: Bearer ${UI.consoleKey && UI.consoleKey.mfr === m.id ? UI.consoleKey.secret.slice(0, 14) + '…' : 'vng_test_…'}" \\\n  -H "Idempotency-Key: $(uuidgen)" \\\n  -H "Content-Type: application/json"${c.body ? ` \\\n  -d '${c.body.replace(/\s*\n\s*/g, ' ')}'` : ''}`;
  return head('API & integrations', 'Machine-to-machine access for your ERP and production systems. Sandbox keys work against synthetic data only.') +
  `<div class="panel"><div class="c-head" style="margin:0 0 10px"><h3>API keys</h3><button class="btn btn-p btn-sm" data-act="new-key">${ic('key', 15)} Create sandbox key</button></div>
  ${UI.secret && UI.secret.mfr === m.id ? `<div class="secret"><span style="flex:1">${esc(UI.secret.secret)}</span><button class="btn btn-s btn-sm" data-act="copy-secret">Copy</button></div><p class="muted" style="font-size:12.5px;margin:6px 0 10px">Shown once. VerifyNG stores only a SHA-256 hash of this key. It is now loaded into the console below.</p>` : ''}
  <div class="tbl"><table><thead><tr><th>Key</th><th>Env</th><th>Scopes</th><th>Created</th><th>Last used</th><th>Status</th><th></th></tr></thead><tbody>${keys.map(k => `<tr><td class="mono">vng_${k.env}_···${esc(k.last4)}</td><td>${k.env}</td><td style="font-size:12px">${k.scopes.join(', ')}</td><td class="num">${fmtD(k.created)}</td><td>${k.lastUsed ? ago(k.lastUsed) : '—'}</td><td>${k.status === 'Active' ? '<span class="pill" style="background:var(--ok-bg);color:var(--ok)">Active</span>' : `<span class="pill" style="background:var(--na-bg);color:var(--na)">${k.status}</span>`}</td><td>${k.status === 'Active' ? `<div class="toolbar" style="flex-wrap:nowrap"><button class="btn btn-s btn-sm" data-act="rotate-key" data-k="${k.id}">Rotate</button><button class="btn btn-danger btn-sm" data-act="revoke-key" data-k="${k.id}">Revoke</button></div>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="panel"><h3>API console</h3><p class="muted" style="font-size:13.5px;margin-top:2px">Requests run through the same gateway checks as production: key hash lookup, tenant scoping, validation, idempotency and a 30/min rate limit.</p>
  <div class="console" style="margin-top:12px"><form class="stack" data-form="api"><label class="field">Example<select id="api-preset">${Object.keys(PRESETS).map(k => `<option value="${k}" ${k === c.preset ? 'selected' : ''}>${PRESETS[k][0]} ${PRESETS[k][1].split('?')[0]}</option>`).join('')}</select></label>
    <div style="display:grid;grid-template-columns:90px 1fr;gap:8px"><label class="field">Method<select id="api-m"><option ${c.mth === 'GET' ? 'selected' : ''}>GET</option><option ${c.mth === 'POST' ? 'selected' : ''}>POST</option></select></label><label class="field">Path<input id="api-path" value="${esc(c.path)}" class="mono" spellcheck="false"></label></div>
    <label class="field">Idempotency-Key<input id="api-idem" class="mono" value="${esc(c.idem || 'idem-' + b32(cryptoBytes(4)).toLowerCase())}" spellcheck="false"></label>
    <label class="field">Body (JSON)<textarea id="api-body" spellcheck="false">${esc(c.body)}</textarea></label>
    <div class="toolbar"><button class="btn btn-p">Send request</button>${UI.consoleKey && UI.consoleKey.mfr === m.id ? '<span class="tag">Using your sandbox key</span>' : '<span class="muted" style="font-size:13px">Create a sandbox key first (verify works without one)</span>'}</div></form>
  <div class="stack" style="min-width:0">${resp ? `<div class="toolbar"><span class="pill" style="background:var(--${resp.status < 300 ? 'ok' : resp.status < 500 ? 'warn' : 'bad'}-bg);color:var(--${resp.status < 300 ? 'ok' : resp.status < 500 ? 'warn' : 'bad'})">${resp.status}</span><span class="mono muted" style="font-size:12px">${esc(resp.headers['x-request-id'])}${resp.headers['idempotent-replayed'] ? ' · idempotent replay' : ''}</span></div><pre class="code" style="max-height:340px;overflow:auto">${esc(JSON.stringify(resp.body, null, 2))}</pre>` : '<div class="notice">The response appears here.</div>'}
  <b style="font-size:13px">cURL equivalent</b><pre class="code">${esc(curl)}</pre></div></div></div>
  <div class="row2"><div class="panel"><h3>Webhook endpoints</h3><form class="form" data-form="webhook" style="grid-template-columns:1fr auto;margin-top:10px"><label class="field">HTTPS endpoint<input id="wh-url" placeholder="https://erp.yourco.com/hooks/verifyng" required pattern="https://.+"></label><button class="btn btn-s">Add</button></form>
    <div class="stack" style="margin-top:12px">${whs.map(w => `<div class="notice"><div class="mono" style="overflow-wrap:anywhere">${esc(w.url)}</div><div class="muted" style="font-size:12.5px">${w.events.join(', ')} · secret ${esc(w.secret.slice(0, 10))}…</div></div>`).join('')}</div></div>
  <div class="panel"><h3>Recent webhook events</h3><p class="muted" style="font-size:12.5px">Signed with HMAC-SHA256 in the <span class="mono">VerifyNG-Signature</span> header. This demo queues deliveries but cannot reach outside URLs.</p>
    <div class="stack" style="margin-top:10px">${log.map(l => `<details class="notice"><summary style="cursor:pointer"><b>${esc(l.type)}</b> <span class="muted">· ${ago(l.at)}</span></summary><pre class="code" style="margin-top:8px;white-space:pre-wrap;overflow-wrap:anywhere">VerifyNG-Signature: ${esc(l.sig)}\n\n${esc(l.body)}</pre></details>`).join('') || '<p class="muted">No events yet.</p>'}</div></div></div>
  <div class="panel"><h3>Endpoint reference · v1</h3><div class="tbl" style="margin-top:10px;border:0"><table><thead><tr><th>Method</th><th>Path</th><th>Purpose</th></tr></thead><tbody>${[['POST', '/api/v1/manufacturers/register', 'Onboard an organisation (KYC review, admin only)'], ['POST', '/api/v1/products', 'Create a product master record'], ['POST', '/api/v1/products/bulk-import', 'CSV body, validated per row'], ['POST', '/api/v1/batches', 'Create a manufacturing batch'], ['POST', '/api/v1/products/{id}/serialize', 'Issue signed unit identities for a batch'], ['GET', '/api/v1/products/{id}', 'Product with batches'], ['POST', '/api/v1/verify', 'Public verification (rate-limited, no key)'], ['GET', '/api/v1/manufacturers/analytics', 'Tenant KPIs'], ['GET', '/api/v1/verification/history', 'Tenant verification events'], ['POST', '/api/v1/recalls', 'Recall a batch; consumers see it at once'], ['POST', '/api/v1/webhooks/register', 'Subscribe an HTTPS endpoint'], ['GET', '/api/v1/integrations/status', 'Connector health']].map(r => `<tr><td class="mono">${r[0]}</td><td class="mono">${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function mIntel(m, mine) {
  const ev = S.events.filter(mine), fl = ev.filter(e => e.status === 'suspicious' || e.status === 'not_recognised'), cases = S.cases.filter(mine);
  const cityCount = {}; ev.forEach(e => cityCount[e.city] = (cityCount[e.city] || 0) + 1);
  const flagCity = {}; fl.forEach(e => flagCity[e.city] = (flagCity[e.city] || 0) + 1);
  return head('Counterfeit intelligence', 'Where your codes are being copied, and the evidence behind every flag.') +
  `<div class="kpis"><div class="kpi"><div class="k">Open alerts</div><div class="v" style="color:var(--warn)">${cases.filter(c => c.status !== 'Closed').length}</div></div><div class="kpi"><div class="k">Suspicious scans</div><div class="v">${fl.filter(e => e.status === 'suspicious').length}</div></div><div class="kpi"><div class="k">Forged-code attempts</div><div class="v">${ev.filter(e => e.forged).length}</div></div><div class="kpi"><div class="k">Flag rate</div><div class="v">${pct(fl.length, ev.length)}</div></div></div>
  <div class="row2"><div class="panel"><h3>Duplicate identity alerts</h3><div class="stack" style="margin-top:10px">${cases.map(c => { const u = S.units.get(c.unitId), es = S.eventsByUnit.get(c.unitId) || [], cities = [...new Set(es.map(e => e.city))]; return `<button class="alert" data-act="mcase" data-c="${c.id}"><span class="sv"></span><div style="min-width:0"><b>${esc(batchOf(u.batchId).code)} · serial #${u.serial} · ${esc(productOf(u.productId).sku)}</b><small>${es.length} scans · ${new Set(es.map(e => e.deviceId)).size} devices · ${cities.slice(0, 5).map(esc).join(', ')}</small><br><small>${esc(c.id)} · ${c.status} · ${c.reports.length} consumer report${c.reports.length === 1 ? '' : 's'}</small></div></button>`; }).join('') || '<p class="muted">No alerts. Try the clone attack on the Consumer check page.</p>'}</div>
    ${UI.mcase ? caseEvidence(S.cases.find(c => c.id === UI.mcase), false) : ''}</div>
  <div class="panel"><h3>Where flags come from</h3><div style="margin-top:10px">${tileMap(fl)}</div><h3 style="margin-top:18px;font-size:15px">Scan distribution by city</h3><div style="margin-top:6px">${hbars(Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 8))}</div></div></div>
  <div class="panel" style="margin-top:14px"><h3>Batch-level counterfeit report</h3><div class="tbl" style="margin-top:10px;border:0"><table><thead><tr><th>Batch</th><th>Scans</th><th>Suspicious</th><th>Units flagged</th><th>Top flagged city</th><th>Risk</th></tr></thead><tbody>${S.batches.filter(mine).map(b => { const be = ev.filter(e => e.batchId === b.id), bs = be.filter(e => e.status === 'suspicious'), uf = new Set(bs.map(e => e.unitId)).size, cc = {}; bs.forEach(e => cc[e.city] = (cc[e.city] || 0) + 1); const top = Object.entries(cc).sort((a, b) => b[1] - a[1])[0]; const lvl = uf >= 1 && bs.length > 10 ? ['High', 'bad'] : uf ? ['Elevated', 'warn'] : ['Normal', 'ok']; return `<tr><td class="mono">${esc(b.code)}</td><td class="num">${be.length}</td><td class="num">${bs.length}</td><td class="num">${uf}</td><td>${top ? esc(top[0]) : '—'}</td><td><span class="pill" style="background:var(--${lvl[1]}-bg);color:var(--${lvl[1]})">${lvl[0]}</span></td></tr>`; }).join('')}</tbody></table></div>
  <p class="muted" style="font-size:12.5px;margin-top:10px">Risk levels come from explainable rules. The Phase 4 anomaly models will add evidence here but cannot mark a product counterfeit on their own.</p></div>`;
}
function caseEvidence(c, editable) {
  if (!c) return '';
  const u = S.units.get(c.unitId), es = (S.eventsByUnit.get(c.unitId) || []).slice(-14), m = mfrOf(c.mfrId);
  return `<div class="panel" style="margin-top:14px;background:var(--g-mist)"><div class="c-head" style="margin:0 0 8px"><div><h3>${esc(c.id)} · ${esc(productOf(u.productId).name)}</h3><p class="muted" style="font-size:13px">${esc(m.name)} · batch ${esc(batchOf(u.batchId).code)} · serial #${u.serial} · zone ${ZONES[c.zone]}</p></div><button class="btn btn-s btn-sm" data-act="${editable ? 'rcase' : 'mcase'}" data-c="">Close</button></div>
  ${editable ? `<form class="form" data-form="case" style="margin-bottom:12px"><label class="field">Status<select id="cs-status" ${UI.role === 'audit' ? 'disabled' : ''}>${['Open', 'Under review', 'Escalated', 'Closed'].map(s => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label class="field">Assignee<select id="cs-who" ${UI.role === 'audit' ? 'disabled' : ''}>${['Unassigned', 'Officer A. Bello (SE)', 'Officer K. Adeyemi (SW)', 'Analyst M. Yusuf (HQ)'].map(s => `<option ${s === c.assignee ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label class="field" style="grid-column:1/-1">Add note<input id="cs-note" placeholder="Field visit, sample collected…" ${UI.role === 'audit' ? 'disabled' : ''}></label>${UI.role === 'audit' ? '<span class="muted" style="font-size:13px">Auditor role is read-only.</span>' : '<button class="btn btn-p">Save update</button>'}</form>` : ''}
  <b style="font-size:13px">Scan evidence (city-level only, latest ${es.length})</b><ul class="timeline" style="margin-top:8px">${es.map(e => `<li class="${e.status === 'suspicious' ? 'f' : ''}"><b>${esc(e.city)}</b> · ${fmtDT(e.at)} · ${statusPill(e.status)}<br><span class="muted" style="font-size:12.5px">device ${esc(e.deviceId.slice(0, 7))}… · score ${e.score}${e.factors.length ? ' · ' + esc(e.factors.join('; ')) : ''}</span></li>`).join('')}</ul>
  ${c.reports.length ? `<b style="font-size:13px">Consumer reports</b>${c.reports.map(id => { const r = S.reports.find(x => x.id === id); return `<div class="notice" style="margin-top:6px"><b>${esc(r.id)}</b> · ${esc(r.city)} · ${fmtD(r.at)}<br>${esc(r.text)}<br><span class="muted" style="font-size:12px">Contact: ${esc(r.contact)}</span></div>`; }).join('')}` : ''}
  ${c.notes.length ? `<b style="font-size:13px;display:block;margin-top:10px">Investigation notes</b>${c.notes.map(n => `<div class="notice" style="margin-top:6px"><span class="muted" style="font-size:12px">${esc(n.by)} · ${fmtDT(n.at)}</span><br>${esc(n.text)}</div>`).join('')}` : ''}</div>`;
}

/* ---------- Regulator console ---------- */
const ROLES = { hq: { l: 'HQ analyst · all zones', z: null }, sw: { l: 'Zonal officer · South West', z: 'SW' }, se: { l: 'Zonal officer · South East', z: 'SE' }, audit: { l: 'Auditor · read-only', z: null } };
const RTABS = [['overview', 'National overview', 'radar'], ['cases', 'Investigations', 'folder'], ['mfrs', 'Manufacturers', 'users'], ['recalls', 'Recalls', 'ban'], ['registry', 'Registry connector', 'plug'], ['audit', 'Audit log', 'chain']];
function viewReg() {
  const role = ROLES[UI.role], inZone = e => { if (!role.z) return true; const c = cityBy(e.city); return c && c.zone === role.z; };
  const side = `<aside class="side"><div class="who"><label class="field" style="font-size:12px">Signed-in role<select id="role">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${k === UI.role ? 'selected' : ''}>${r.l}</option>`).join('')}</select></label><small style="margin-top:8px">Concept console for regulatory oversight · MFA required</small><small>Reads VerifyNG data only, never manufacturers' ERPs</small></div>
    ${RTABS.map(([k, l, i]) => `<button class="tab" role="tab" aria-selected="${UI.rtab === k}" data-rtab="${k}">${ic(i)} ${l}</button>`).join('')}</aside>`;
  const body = { overview: rOverview, cases: rCases, mfrs: rMfrs, recalls: rRecalls, registry: rRegistry, audit: rAudit }[UI.rtab](role, inZone);
  return `<div class="wrap"><div class="shell">${side}<div style="min-width:0">${body}</div></div></div>`;
}
function rOverview(role, inZone) {
  const ev = S.events.filter(inZone), s = { total: ev.length, by: {} }; Object.keys(STATUS).forEach(k => s.by[k] = 0); ev.forEach(e => s.by[e.status]++);
  const fl = ev.filter(e => e.status === 'suspicious' || e.status === 'not_recognised'), k = (l, v, c) => `<div class="kpi"><div class="k">${l}</div><div class="v" ${c ? `style="color:var(--${c})"` : ''}>${v}</div></div>`;
  const zones = Object.keys(ZONES).filter(z => !role.z || z === role.z).map(z => { const ze = ev.filter(e => (cityBy(e.city) || {}).zone === z); return [z, ze.length, ze.filter(e => e.status === 'suspicious').length, ze.filter(e => e.status === 'not_recognised').length, S.cases.filter(c => c.zone === z && c.status !== 'Closed').length]; });
  return head('National overview', `${role.z ? 'Jurisdiction: ' + ZONES[role.z] : 'Jurisdiction: all six zones'} · last 30 days · synthetic data`) +
  `<div class="kpis">${k('Participating manufacturers', S.mfrs.length)}${k('Identities issued', n0(S.units.size))}${k('Verifications', n0(s.total))}${k('Suspicious', n0(s.by.suspicious), 'warn')}${k('Not recognised', n0(s.by.not_recognised), 'bad')}${k('Active recalls', S.recalls.length, 'rec')}</div>
  <div class="row2"><div class="panel"><h3>Counterfeit heatmap</h3><p class="muted" style="font-size:13px">Suspicious and not-recognised scans by state</p><div style="margin-top:12px">${tileMap(fl)}</div></div>
  <div class="panel"><h3>By zone</h3><div class="tbl" style="margin-top:10px;border:0"><table><thead><tr><th>Zone</th><th>Scans</th><th>Susp.</th><th>Unrec.</th><th>Open cases</th></tr></thead><tbody>${zones.map(z => `<tr><td>${ZONES[z[0]]}</td><td class="num">${n0(z[1])}</td><td class="num">${z[2]}</td><td class="num">${z[3]}</td><td class="num">${z[4]}</td></tr>`).join('')}</tbody></table></div>
  <h3 style="margin-top:16px;font-size:15px">Verifications, last 14 days</h3>${dayBars(ev)}</div></div>`;
}
function rCases(role) {
  const cs = S.cases.filter(c => !role.z || c.zone === role.z).slice().reverse(), sel = S.cases.find(c => c.id === UI.selCase);
  return head('Investigations', 'Cases open automatically when the rules engine flags a unit, or when a consumer reports one.', `<button class="btn btn-s" data-act="export-cases">Copy cases as CSV</button>`) +
  `<div class="tbl"><table><thead><tr><th>Case</th><th>Product</th><th>Manufacturer</th><th>Zone</th><th>Opened</th><th>Source</th><th>Reports</th><th>Assignee</th><th>Status</th></tr></thead><tbody>${cs.map(c => { const u = S.units.get(c.unitId); return `<tr class="click" data-act="rcase" data-c="${c.id}"><td class="mono">${esc(c.id)}</td><td>${esc(productOf(u.productId).sku)} #${u.serial}</td><td>${esc(mfrOf(c.mfrId).name)}</td><td>${c.zone}</td><td class="num">${fmtD(c.opened)}</td><td>${esc(c.source)}</td><td class="num">${c.reports.length}</td><td>${esc(c.assignee)}</td><td><span class="pill" style="background:var(--${c.status === 'Closed' ? 'na' : c.status === 'Escalated' ? 'bad' : 'warn'}-bg);color:var(--${c.status === 'Closed' ? 'na' : c.status === 'Escalated' ? 'bad' : 'warn'})">${c.status}</span></td></tr>`; }).join('') || '<tr><td colspan="9" class="muted">No cases in this jurisdiction.</td></tr>'}</tbody></table></div>
  ${sel && (!role.z || sel.zone === role.z) ? caseEvidence(sel, true) : '<p class="muted" style="margin-top:12px">Select a case to see its evidence.</p>'}`;
}
function rMfrs() {
  return head('Manufacturers', 'Participating organisations and their integration health. Compliance scores are illustrative.') +
  `<div class="tbl"><table><thead><tr><th>Organisation</th><th>Base</th><th>KYC</th><th>Products</th><th>Registrations valid</th><th>Identities</th><th>Scans</th><th>Flag rate</th><th>Webhooks</th><th>Compliance</th></tr></thead><tbody>${S.mfrs.map(m => { const ps = S.products.filter(p => p.mfrId === m.id), ok = ps.filter(p => p.reg.status === 'Valid').length, ev = S.events.filter(e => e.mfrId === m.id), fl = ev.filter(e => e.status === 'suspicious').length, score = Math.round(100 * (0.6 * ok / ps.length + 0.25 + 0.15 * (S.webhooks.some(w => w.mfrId === m.id) ? 1 : 0))); return `<tr><td><b>${esc(m.name)}</b><br><span class="mono muted" style="font-size:12px">${m.id}</span></td><td>${esc(m.city)}</td><td>${m.kyc}</td><td class="num">${ps.length}</td><td class="num" ${ok < ps.length ? 'style="color:var(--reg);font-weight:600"' : ''}>${ok}/${ps.length}</td><td class="num">${n0([...S.units.values()].filter(u => u.mfrId === m.id).length)}</td><td class="num">${n0(ev.length)}</td><td class="num">${pct(fl, ev.length)}</td><td>${S.webhooks.filter(w => w.mfrId === m.id).length}</td><td><span class="pill" style="background:var(--${score >= 90 ? 'ok' : 'warn'}-bg);color:var(--${score >= 90 ? 'ok' : 'warn'})">${score}</span></td></tr>`; }).join('')}</tbody></table></div>
  <p class="muted" style="font-size:13px;margin-top:10px">Regulators see VerifyNG records only: products, batches, identities and scan outcomes. They do not get access to any manufacturer's private ERP.</p>`;
}
function rRecalls() {
  return head('Recalls', 'Every recall reaches consumers on their next scan. The table tracks scans that hit recalled stock.') +
  `<div class="tbl"><table><thead><tr><th>Recall</th><th>Batch</th><th>Product</th><th>Manufacturer</th><th>Issued</th><th>Reason</th><th>Scans since</th><th>Cities</th></tr></thead><tbody>${S.recalls.map(r => { const b = batchOf(r.batchId), ev = S.events.filter(e => e.batchId === b.id && e.status === 'recalled'); return `<tr><td class="mono">${r.id}</td><td class="mono">${esc(b.code)}</td><td>${esc(productOf(b.productId).name)}</td><td>${esc(mfrOf(r.mfrId).name)}</td><td class="num">${fmtD(r.at)}</td><td>${esc(r.reason)}</td><td class="num">${ev.length}</td><td>${[...new Set(ev.map(e => e.city))].slice(0, 4).map(esc).join(', ')}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function rRegistry() {
  return head('Registry connector', 'How registration status reaches the engine.') +
  `<div class="grid g3"><div class="card"><span class="tag" style="background:var(--warn-bg);color:var(--warn)">Not connected</span><h3 style="margin-top:10px">Official registration database</h3><p>VerifyNG does not assume access to NAFDAC's databases or APIs. This connector stays off until access is formally authorised, with a signed data-sharing agreement.</p></div>
  <div class="card"><span class="tag">Active in demo</span><h3 style="margin-top:10px">Sandbox mock registry</h3><p>Synthetic registration records, so the demo can show the "Registration invalid" outcome. Every number uses the DEMO- prefix.</p></div>
  <div class="card"><span class="tag" style="background:var(--na-bg);color:var(--na)">Fallback</span><h3 style="margin-top:10px">Manufacturer-declared</h3><p>Registration numbers supplied by manufacturers are shown as a reference, never as proof that a unit is genuine.</p></div></div>
  <div class="panel" style="margin-top:14px"><h3>Connector contract</h3><pre class="code" style="margin-top:10px">GET  {registry}/registrations/{number}
→ 200 { "number": "...", "status": "valid|expired|withdrawn|suspended",
        "holder": "...", "valid_until": "YYYY-MM-DD" }
Auth: mutual TLS + signed requests · cached for 6 h · on timeout the engine
returns "Unable to verify" for regulated checks, never "Verified".</pre><p class="muted" style="font-size:13px;margin-top:10px">The same interface supports other African regulators, so each country plugs in its own registry.</p></div>`;
}
function rAudit(role) {
  const list = S.audit.slice(-40).reverse(), ch = UI.chain;
  return head('Audit log', 'Append-only and hash-chained. Each entry includes the SHA-256 hash of the one before, so any edit breaks the chain.', `<div class="toolbar"><button class="btn btn-p btn-sm" data-act="verify-chain">${ic('chain', 15)} Verify chain</button><button class="btn btn-s btn-sm" data-act="tamper">${UI.tamper ? 'Undo tampering' : 'Simulate tampering'}</button><button class="btn btn-s btn-sm" data-act="export-audit">Copy as CSV</button></div>`) +
  (ch ? `<div class="notice" style="margin-bottom:12px;${ch.ok ? 'border-color:var(--ok);background:var(--ok-bg)' : 'border-color:var(--bad);background:var(--bad-bg)'}"><b>${ch.ok ? `Chain intact: all ${ch.n} entries verified.` : `Chain broken at entry #${ch.at}. That record was altered after it was written.`}</b></div>` : '') +
  `<div class="tbl"><table><thead><tr><th>#</th><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>Detail</th><th>Hash</th></tr></thead><tbody>${list.map(e => `<tr><td class="num">${e.seq}</td><td class="num" style="white-space:nowrap">${fmtDT(e.at)}</td><td class="mono" style="font-size:12px">${esc(e.actor)}</td><td class="mono" style="font-size:12px">${esc(e.action)}</td><td class="mono" style="font-size:12px">${esc(e.target)}</td><td>${esc(e.detail)}</td><td class="mono" style="font-size:11px">${e.hash.slice(0, 12)}…</td></tr>`).join('')}</tbody></table></div>`;
}

/* ---------- events ---------- */
function go(v) { if (v === 'full') return; location.hash = v === 'home' ? 'home' : v; }
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('u-')) { UI.view = 'full'; UI.city = 'Not shared'; const t = h.slice(2); if (UI.cv.token !== t.toUpperCase() || UI.cv.screen === 'scan') cvRun(t); }
  else { UI.view = ['scan', 'maker', 'regulator'].includes(h) ? h : 'home'; if (UI.city === 'Not shared') UI.city = 'Lagos'; }
  render(); if (!UI.keepScroll) window.scrollTo(0, 0);
}
document.addEventListener('click', ev => {
  const g = ev.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
  const mt = ev.target.closest('[data-mtab]'); if (mt) { UI.mtab = mt.dataset.mtab; UI.mcase = null; render(); return; }
  const rt = ev.target.closest('[data-rtab]'); if (rt) { UI.rtab = rt.dataset.rtab; render(); return; }
  const a = ev.target.closest('[data-act]'); if (!a) return; const act = a.dataset.act, m = mfrOf(UI.mfrId), actor = 'ops@' + m.code.toLowerCase() + '.demo';
  if (act === 'scan-demo') { const d = DEMO.find(x => x.key === a.dataset.k); cvRun(d.token); render(); if (innerWidth < 760) { const ph = document.querySelector('.phone'); window.scrollTo({ top: ph.getBoundingClientRect().top + scrollY - 12, behavior: 'smooth' }); } }
  else if (act === 'clone') { const keep = UI.device; UI.device = 'dev-' + b32(cryptoBytes(5)).toLowerCase(); cvRun(UI.cv.token); UI.device = keep; render(); toast('Scanned from a second phone in ' + UI.city); }
  else if (act === 'cv-again') { UI.cv = { screen: 'scan', res: null, token: UI.cv.token }; if (UI.view === 'full') history.replaceState(null, '', '#u-'); render(); }
  else if (act === 'cv-retry') { cvRun(UI.cv.token); render(); }
  else if (act === 'cv-report') { UI.cv.screen = 'report'; render(); }
  else if (act === 'cv-back') { UI.cv.screen = 'result'; render(); }
  else if (act === 'sheet') { UI.selBatch = a.dataset.b; render(); setTimeout(() => { const s = $('#sheet'); s && s.scrollIntoView({ behavior: 'smooth' }); }, 30); }
  else if (act === 'close-sheet') { UI.selBatch = null; render(); }
  else if (act === 'more') { const b = batchOf(a.dataset.b); issueUnits(b, 100); audit(actor, 'batch.serialized', b.id, '100 identities'); toast('Issued 100 more identities for ' + b.code); render(); }
  else if (act === 'recall-open') { UI.recallFor = a.dataset.b; render(); setTimeout(() => { const i = $('#rc-reason'); i && i.focus(); }, 20); }
  else if (act === 'recall-cancel') { UI.recallFor = null; render(); }
  else if (act === 'reveal') { UI.reveal.has(a.dataset.u) ? UI.reveal.delete(a.dataset.u) : UI.reveal.add(a.dataset.u); render(); }
  else if (act === 'toggle-unit') { const u = S.units.get(a.dataset.u); u.status = u.status === 'Active' ? 'Deactivated' : 'Active'; audit(actor, 'identity.' + (u.status === 'Active' ? 'reactivated' : 'deactivated'), u.id, batchOf(u.batchId).code + ' #' + u.serial); render(); }
  else if (act === 'test-unit') { const u = S.units.get(a.dataset.u); cvRun(tokenFor(u)); go('scan'); }
  else if (act === 'copy-tokens') { const b = batchOf(UI.selBatch); copy('serial,unit_id,qr_url\n' + (S.unitsByBatch.get(b.id) || []).map(u => `${u.serial},${u.id},${qrUrl(tokenFor(u))}`).join('\n'), 'Copied ' + b.size + ' rows for the label printer'); }
  else if (act === 'new-key') { const { k, secret } = newApiKey(m.id, actor); UI.secret = { mfr: m.id, secret }; UI.consoleKey = { mfr: m.id, secret }; render(); }
  else if (act === 'copy-secret') copy(UI.secret.secret, 'Key copied');
  else if (act === 'rotate-key' || act === 'revoke-key') { const k = S.keys.find(x => x.id === a.dataset.k); k.status = act === 'rotate-key' ? 'Rotated' : 'Revoked'; audit(actor, 'apikey.' + (act === 'rotate-key' ? 'rotated' : 'revoked'), k.id, '···' + k.last4); if (act === 'rotate-key') { const { secret } = newApiKey(m.id, actor, k.env); UI.secret = { mfr: m.id, secret }; if (k.env === 'test') UI.consoleKey = { mfr: m.id, secret }; } toast(act === 'rotate-key' ? 'Key rotated. The old key stops working now.' : 'Key revoked'); render(); }
  else if (act === 'mcase') { UI.mcase = a.dataset.c || null; render(); }
  else if (act === 'rcase') { UI.selCase = a.dataset.c || null; render(); }
  else if (act === 'verify-chain') { UI.chain = verifyAuditChain(); render(); }
  else if (act === 'tamper') { const e = S.audit[Math.min(9, S.audit.length - 1)]; if (!UI.tamper) { e._orig = e.detail; e.detail = e.detail + ' (edited)'; } else { e.detail = e._orig; } UI.tamper = !UI.tamper; UI.chain = verifyAuditChain(); render(); }
  else if (act === 'export-audit') copy('seq,at,actor,action,target,detail,prev_hash,hash\n' + S.audit.map(e => [e.seq, new Date(e.at).toISOString(), e.actor, e.action, e.target, '"' + e.detail.replace(/"/g, '""') + '"', e.prev, e.hash].join(',')).join('\n'), 'Audit log copied as CSV');
  else if (act === 'export-cases') copy('case,unit,manufacturer,zone,opened,status,assignee,reports\n' + S.cases.map(c => [c.id, c.unitId, mfrOf(c.mfrId).name, c.zone, new Date(c.opened).toISOString(), c.status, c.assignee, c.reports.length].join(',')).join('\n'), 'Cases copied as CSV');
});
document.addEventListener('submit', ev => {
  const f = ev.target.closest('[data-form]'); if (!f) return; ev.preventDefault(); const k = f.dataset.form, m = mfrOf(UI.mfrId), actor = 'ops@' + m.code.toLowerCase() + '.demo', v = id => ($('#' + id) || {}).value;
  if (k === 'manual') { const t = v('manual-code'); if (!t) return; cvRun(t); render(); }
  else if (k === 'pin') { cvRun(UI.cv.token, { pin: v('pin-in') }); render(); }
  else if (k === 'report') { const r = UI.cv.res, consent = $('#rp-consent').checked; const rep = { id: 'RPT-' + (5100 + S.reports.length), unitId: r.unit ? r.unit.id : null, mfrId: r.mfr ? r.mfr.id : null, city: UI.city, text: v('rp-where') + ': ' + v('rp-text'), at: Date.now(), contact: consent && v('rp-phone') ? 'consented · ' + v('rp-phone').replace(/.(?=.{3})/g, '•') : 'withheld (consent not given)' }; S.reports.push(rep);
    if (rep.unitId) { let cs = S.cases.find(c => c.unitId === rep.unitId); if (!cs) cs = openCase({ unitId: rep.unitId, mfrId: rep.mfrId, source: 'Consumer report', at: rep.at, city: UI.city }); cs.reports.push(rep.id); }
    audit('public:consumer', 'report.submitted', rep.id, (r.status || '') + ' · ' + UI.city); UI.cv = { ...UI.cv, screen: 'thanks', ref: rep.id }; render(); }
  else if (k === 'product') { const sku = v('np-sku').toUpperCase(); if (S.products.some(p => p.mfrId === m.id && p.sku === sku)) return toast('That SKU already exists'); createProduct(m.id, { sku, name: v('np-name'), category: v('np-cat'), nafdac_reg: v('np-reg'), high_risk: $('#np-hr').checked, form: 'box', color: '#3a6f55' }, actor); toast('Product registered'); render(); }
  else if (k === 'batch') { const qty = Math.min(2000, Math.max(1, +v('nb-qty'))); const mfg = Date.parse(v('nb-mfg')), exp = Date.parse(v('nb-exp')); if (!(exp > mfg)) return toast('Expiry must be after the manufacturing date'); if (S.batches.some(b => b.mfrId === m.id && b.code === v('nb-code'))) return toast('Batch code already used');
    const b = createBatch(m.id, { product_id: v('nb-prod'), batch_code: v('nb-code').toUpperCase(), mfg, exp }, actor); issueUnits(b, qty); audit(actor, 'batch.serialized', b.id, qty + ' identities'); UI.selBatch = b.id; toast(`Issued ${qty} signed identities for ${b.code}`); render(); setTimeout(() => { const s = $('#sheet'); s && s.scrollIntoView({ behavior: 'smooth' }); }, 30); }
  else if (k === 'recall') { const r = recallBatch(UI.recallFor, v('rc-reason'), actor); UI.recallFor = null; toast(r ? 'Recall ' + r.id + ' is live for consumers now' : 'Already recalled'); render(); }
  else if (k === 'csv') { UI.importRes = importCsv(m.id, v('csv-in'), actor); render(); }
  else if (k === 'webhook') { const r = api('POST', '/api/v1/webhooks/register', { Authorization: 'Bearer ' + ensureKey(m), 'Idempotency-Key': 'ui-' + Date.now() }, { url: v('wh-url') }); toast(r.status === 201 ? 'Endpoint added' : r.body.error.message); render(); }
  else if (k === 'api') { const c = UI.console; c.mth = v('api-m'); c.path = v('api-path'); c.body = v('api-body'); c.idem = v('api-idem'); const key = UI.consoleKey && UI.consoleKey.mfr === m.id ? UI.consoleKey.secret : '';
    UI.apiResp = api(c.mth, c.path, key ? { Authorization: 'Bearer ' + key, 'Idempotency-Key': c.idem } : { 'Idempotency-Key': c.idem }, c.mth === 'POST' ? c.body : null); render(); }
  else if (k === 'case') { const c = S.cases.find(x => x.id === UI.selCase), by = { hq: 'Analyst M. Yusuf (HQ)', sw: 'Officer K. Adeyemi (SW)', se: 'Officer A. Bello (SE)' }[UI.role]; const ch = []; if (v('cs-status') !== c.status) ch.push('status → ' + v('cs-status')); if (v('cs-who') !== c.assignee) ch.push('assignee → ' + v('cs-who')); c.status = v('cs-status'); c.assignee = v('cs-who'); if (v('cs-note')) { c.notes.push({ at: Date.now(), by, text: v('cs-note') }); ch.push('note added'); } if (ch.length) audit(by.toLowerCase().replace(/[^a-z]+/g, '.') + '@regulator', 'case.updated', c.id, ch.join('; ')); toast(ch.length ? 'Case updated' : 'Nothing changed'); render(); }
});
function ensureKey(m) { if (!(UI.consoleKey && UI.consoleKey.mfr === m.id)) { const { secret } = newApiKey(m.id, 'ops@' + m.code.toLowerCase() + '.demo'); UI.consoleKey = { mfr: m.id, secret }; } return UI.consoleKey.secret; }
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'sim-city') { UI.city = t.value; render(); }
  else if (t.id === 'sim-outage') { S.available = !t.checked; audit('admin@verifyng', t.checked ? 'service.degraded' : 'service.restored', 'records-db', 'demo toggle'); toast(t.checked ? 'Outage on: scans return "Unable to verify"' : 'Records reachable again'); render(); }
  else if (t.id === 'tenant') { UI.mfrId = t.value; UI.selBatch = null; UI.mcase = null; UI.recallFor = null; UI.apiResp = null; UI.importRes = null; render(); }
  else if (t.id === 'role') { UI.role = t.value; UI.selCase = null; render(); }
  else if (t.id === 'api-preset') { UI.console = { mfr: UI.mfrId, preset: t.value, ...presetFill(t.value) }; UI.apiResp = null; render(); }
  else if (t.id === 'base-url') { base = t.value.trim(); try { localStorage.setItem('vng-base', base); } catch (e) {} QR_CACHE.clear(); render(); toast('QR codes now point to ' + qrBase()); }
  else if (t.id === 'rp-consent') { }
  else if (t.id === 'csv-file' && t.files[0]) { const r = new FileReader(); r.onload = () => { $('#csv-in').value = r.result; }; r.readAsText(t.files[0]); }
  else if (t.id === 'qr-file' && t.files[0]) decodeQrFile(t.files[0]);
});
function decodeQrFile(file) {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => { const c = document.createElement('canvas'), s = Math.min(1, 1200 / Math.max(img.width, img.height)); c.width = img.width * s; c.height = img.height * s; const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height), code = typeof jsQR === 'function' ? jsQR(d.data, c.width, c.height) : null; URL.revokeObjectURL(url);
    if (!code) return toast('No QR code found. Try a closer, sharper photo.'); cvRun(code.data); render(); };
  img.onerror = () => toast('That file is not an image we can read'); img.src = url;
}
window.addEventListener('hashchange', route);
route();
