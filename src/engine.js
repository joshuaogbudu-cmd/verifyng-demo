/* ================= VerifyNG engine (runs entirely in the page) =================
   Crypto: SHA-256 + HMAC-SHA256 (pure JS, synchronous), Crockford base32 tokens.
   Data:   in-memory multi-tenant store, deterministically seeded with SYNTHETIC records
           so a printed demo QR resolves identically on any device. */
const ENC = new TextEncoder();
const SHA_K = (() => { const k = [], h = []; let n = 2; const isP = x => { for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; };
  while (k.length < 64) { if (isP(n)) { if (h.length < 8) h.push((Math.sqrt(n) % 1) * 2 ** 32 | 0); k.push((Math.cbrt(n) % 1) * 2 ** 32 | 0); } n++; } return { k, h }; })();
function sha256(msg) {
  if (typeof msg === 'string') msg = ENC.encode(msg);
  const l = msg.length, padLen = ((l + 9 + 63) >> 6) << 6, buf = new Uint8Array(padLen); buf.set(msg); buf[l] = 0x80;
  const dv = new DataView(buf.buffer); dv.setUint32(padLen - 4, (l * 8) >>> 0); dv.setUint32(padLen - 8, Math.floor(l / 2 ** 29));
  let H = SHA_K.h.slice(); const K = SHA_K.k, w = new Int32Array(64), r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let i = 0; i < padLen; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = dv.getInt32(i + t * 4);
    for (let t = 16; t < 64; t++) { const x = w[t - 15], y = w[t - 2]; w[t] = (w[t - 16] + (r(x, 7) ^ r(x, 18) ^ (x >>> 3)) + w[t - 7] + (r(y, 17) ^ r(y, 19) ^ (y >>> 10))) | 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) | 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H = [a, b, c, d, e, f, g, h].map((v, j) => (H[j] + v) | 0);
  }
  const out = new Uint8Array(32), odv = new DataView(out.buffer); H.forEach((v, j) => odv.setInt32(j * 4, v)); return out;
}
function hmac(key, msg) {
  if (typeof msg === 'string') msg = ENC.encode(msg);
  if (key.length > 64) key = sha256(key);
  const k = new Uint8Array(64); k.set(key);
  const ip = new Uint8Array(64 + msg.length), op = new Uint8Array(96);
  for (let i = 0; i < 64; i++) { ip[i] = k[i] ^ 0x36; op[i] = k[i] ^ 0x5c; }
  ip.set(msg, 64); op.set(sha256(ip), 64); return sha256(op);
}
const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function b32(bytes) { let bits = 0, val = 0, out = ''; for (const x of bytes) { val = ((val << 8) | x) & 0xffff; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } } if (bits) out += B32[(val << (5 - bits)) & 31]; return out; }
function safeEq(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const cryptoBytes = n => { const b = new Uint8Array(n); (globalThis.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => b[i] = Math.random() * 256 | 0); return b; };
const DAY = 864e5, HOUR = 36e5, MIN = 6e4;

/* ---------- Reference data ---------- */
const ZONES = { NW: 'North West', NE: 'North East', NC: 'North Central', SW: 'South West', SE: 'South East', SS: 'South South' };
const CITIES = [
  ['Lagos', 6.52, 3.38, 'LA', 'SW', 30], ['Ibadan', 7.38, 3.95, 'OY', 'SW', 8], ['Abeokuta', 7.15, 3.35, 'OG', 'SW', 3], ['Akure', 7.25, 5.19, 'OD', 'SW', 2], ['Osogbo', 7.77, 4.56, 'OS', 'SW', 2], ['Ado-Ekiti', 7.62, 5.22, 'EK', 'SW', 1],
  ['Abuja', 9.07, 7.49, 'FC', 'NC', 10], ['Ilorin', 8.50, 4.55, 'KW', 'NC', 3], ['Lokoja', 7.80, 6.74, 'KO', 'NC', 1], ['Jos', 9.90, 8.86, 'PL', 'NC', 3], ['Makurdi', 7.73, 8.52, 'BE', 'NC', 2], ['Minna', 9.61, 6.56, 'NI', 'NC', 1], ['Lafia', 8.49, 8.52, 'NA', 'NC', 1],
  ['Kano', 12.00, 8.52, 'KN', 'NW', 12], ['Kaduna', 10.52, 7.44, 'KD', 'NW', 6], ['Sokoto', 13.06, 5.24, 'SO', 'NW', 2], ['Katsina', 12.99, 7.60, 'KT', 'NW', 2], ['Gusau', 12.17, 6.66, 'ZA', 'NW', 1], ['Birnin Kebbi', 12.45, 4.20, 'KE', 'NW', 1], ['Dutse', 11.76, 9.34, 'JI', 'NW', 1],
  ['Maiduguri', 11.85, 13.16, 'BO', 'NE', 3], ['Yola', 9.20, 12.48, 'AD', 'NE', 1], ['Bauchi', 10.31, 9.84, 'BA', 'NE', 2], ['Gombe', 10.29, 11.17, 'GO', 'NE', 1], ['Damaturu', 11.75, 11.96, 'YO', 'NE', 1], ['Jalingo', 8.89, 11.36, 'TA', 'NE', 1],
  ['Enugu', 6.45, 7.51, 'EN', 'SE', 4], ['Onitsha', 6.14, 6.79, 'AN', 'SE', 6], ['Owerri', 5.48, 7.03, 'IM', 'SE', 3], ['Aba', 5.11, 7.37, 'AB', 'SE', 5], ['Abakaliki', 6.32, 8.11, 'EB', 'SE', 1],
  ['Port Harcourt', 4.82, 7.03, 'RI', 'SS', 8], ['Benin City', 6.34, 5.63, 'ED', 'SS', 4], ['Warri', 5.52, 5.75, 'DE', 'SS', 3], ['Uyo', 5.04, 7.91, 'AK', 'SS', 2], ['Calabar', 4.95, 8.32, 'CR', 'SS', 2], ['Yenagoa', 4.92, 6.26, 'BY', 'SS', 1],
].map(([name, lat, lng, st, zone, w]) => ({ name, lat, lng, st, zone, w }));
const cityBy = n => CITIES.find(c => c.name === n);
function km(a, b) { const R = 6371, t = x => x * Math.PI / 180, dLa = t(b.lat - a.lat), dLo = t(b.lng - a.lng); const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }

const STATUS = {
  verified:       { label: 'Verified', tone: 'ok', line: 'The manufacturer confirms this exact product identity.' },
  suspicious:     { label: 'Suspicious', tone: 'warn', line: 'This code shows signs of copying or unusual checks.' },
  not_recognised: { label: 'Not recognised', tone: 'bad', line: 'No manufacturer on VerifyNG issued this code.' },
  reg_invalid:    { label: 'Registration invalid', tone: 'reg', line: 'The regulatory registration on record is invalid, expired or withdrawn.' },
  expired:        { label: 'Expired', tone: 'exp', line: 'The expiry date recorded for this product has passed.' },
  recalled:       { label: 'Recalled', tone: 'rec', line: 'This product batch has been recalled. Do not use it.' },
  unavailable:    { label: 'Unable to verify', tone: 'na', line: 'We could not reach authoritative records. This is not a confirmation.' },
  pin_required:   { label: 'Awaiting PIN', tone: 'info', line: 'The code matched. Scratch the panel and enter the PIN to finish.' },
};

/* ---------- Store ---------- */
const S = { mfrs: [], products: [], batches: [], units: new Map(), unitsByBatch: new Map(), events: [], eventsByUnit: new Map(), recalls: [], reports: [], cases: [],
  keys: [], webhooks: [], whLog: [], audit: [], apiLog: [], idem: new Map(), rate: new Map(), available: true, regConnector: 'sandbox', pricing: null };
let ID_N = 0;
const newId = (p, rnd) => p + '_' + b32(rnd ? Array.from({ length: 6 }, () => rnd() * 256 | 0) : cryptoBytes(6)).toLowerCase() + (rnd ? '' : (++ID_N).toString(36));
const mfrOf = id => S.mfrs.find(m => m.id === id), productOf = id => S.products.find(p => p.id === id), batchOf = id => S.batches.find(b => b.id === id);

/* ---------- Tamper-evident audit log (hash chain) ---------- */
function audit(actor, action, target, detail, at) {
  const prev = S.audit.length ? S.audit[S.audit.length - 1].hash : '0'.repeat(64);
  const e = { seq: S.audit.length + 1, at: at || Date.now(), actor, action, target, detail: detail || '', prev };
  e.hash = hex(sha256(prev + '|' + e.seq + '|' + e.at + '|' + actor + '|' + action + '|' + target + '|' + e.detail));
  S.audit.push(e); return e;
}
function verifyAuditChain() {
  let prev = '0'.repeat(64);
  for (const e of S.audit) { const h = hex(sha256(prev + '|' + e.seq + '|' + e.at + '|' + e.actor + '|' + e.action + '|' + e.target + '|' + e.detail)); if (e.prev !== prev || h !== e.hash) return { ok: false, at: e.seq }; prev = e.hash; }
  return { ok: true, n: S.audit.length };
}

/* ---------- Identity & tokens ---------- */
function tokenFor(u) { const m = mfrOf(u.mfrId); return `V1-${m.code}-${u.id}-${b32(hmac(m.key, `v1|${m.code}|${u.id}`)).slice(0, 12)}`; }
function pinFor(u) { const m = mfrOf(u.mfrId); return String(parseInt(hex(hmac(m.key, 'pin|' + u.id)).slice(0, 8), 16) % 1e6).padStart(6, '0'); }
function issueUnits(batch, qty, rnd, at) {
  const p = productOf(batch.productId), list = S.unitsByBatch.get(batch.id) || []; S.unitsByBatch.set(batch.id, list);
  for (let i = 0; i < qty; i++) {
    const bytes = rnd ? Array.from({ length: 10 }, () => rnd() * 256 | 0) : cryptoBytes(10);
    const u = { id: b32(bytes), mfrId: batch.mfrId, batchId: batch.id, productId: batch.productId, serial: list.length + 1, status: 'Active', issuedAt: at || Date.now(), pinRedeemed: null };
    if (p.highRisk) u.pinHash = hex(sha256(u.id + '|' + pinFor(u)));
    S.units.set(u.id, u); list.push(u);
  }
  batch.size = list.length; return list;
}
const TOKEN_RE = /^V1-([A-Z]{3})-([0-9A-Z]{16})-([0-9A-Z]{12})$/;
function extractToken(text) { const m = String(text || '').toUpperCase().match(/V1-[A-Z]{3}-[0-9A-Z]{16}-[0-9A-Z]{12}/); return m ? m[0] : String(text || '').trim().toUpperCase(); }

/* ---------- Authentication engine ---------- */
function verify(token, ctx = {}) {
  const now = ctx.now || Date.now(), city = ctx.city || 'Not shared', deviceId = ctx.deviceId || 'anon', steps = [], factors = [];
  const step = (k, ok, note) => steps.push({ k, ok, note });
  const res = { status: null, token, at: now, city, steps, factors, score: 0 };
  const finish = (status) => { res.status = status; if (!ctx.dry) record(res, deviceId, ctx.channel || 'web'); return res; };
  if (!S.available || ctx.forceOutage) { step('Authoritative records reachable', false, 'Verification service unavailable — no result is shown as genuine'); return finish('unavailable'); }
  const m = TOKEN_RE.exec(token || '');
  step('1 · Received product identity', !!token, token ? token.slice(0, 12) + '…' : 'empty');
  if (!m) { step('2 · Token format & version', false, 'Not a VerifyNG v1 token'); return finish('not_recognised'); }
  step('2 · Token format & version', true, 'v1');
  const mfr = S.mfrs.find(x => x.code === m[1]);
  if (!mfr) { step('3 · Identify manufacturer', false, 'Unknown issuer code ' + m[1]); return finish('not_recognised'); }
  res.mfr = mfr;
  const expect = b32(hmac(mfr.key, `v1|${mfr.code}|${m[2]}`)).slice(0, 12);
  if (!safeEq(expect, m[3])) { step('2b · Signature (HMAC-SHA256)', false, 'Signature mismatch — forged or altered code'); factors.push({ code: 'SIG', w: 0, label: 'Forged signature', consumer: '' }); return finish('not_recognised'); }
  step('2b · Signature (HMAC-SHA256)', true, 'Valid · key ' + mfr.keyId);
  step('3 · Identify manufacturer', true, mfr.name);
  const u = S.units.get(m[2]);
  if (!u) { step('4 · Registered unit record', false, 'Signed but not in issued records'); return finish('not_recognised'); }
  res.unit = u; const p = productOf(u.productId), b = batchOf(u.batchId); res.product = p; res.batch = b;
  step('4 · Registered unit record', true, 'Serial #' + u.serial);
  const own = u.mfrId === mfr.id; step('5 · Issued by this manufacturer', own, own ? 'Ownership confirmed' : 'Issuer mismatch');
  if (!own) return finish('not_recognised');
  step('6 · Batch information', true, b.code);
  const expired = b.exp <= now; step('7 · Manufacturing & expiry dates', !expired, expired ? 'Expired ' + new Date(b.exp).toLocaleDateString('en-NG') : 'Within shelf life');
  const regBad = p.reg.status !== 'Valid' && (p.reg.since || 0) <= now;
  step('8 · Regulatory registration', !regBad, (regBad ? p.reg.status : 'Valid') + ' · source: ' + (S.regConnector === 'sandbox' ? 'sandbox mock registry' : 'manufacturer-declared'));
  const recall = S.recalls.find(r => r.batchId === b.id && r.at <= now); res.recall = recall;
  step('9 · Recall status', !recall, recall ? 'Recalled: ' + recall.reason : 'No active recall');
  // ---- scan history & rules-based risk ----
  const prior = (S.eventsByUnit.get(u.id) || []).filter(e => e.at <= now && e.status !== 'unavailable');
  res.prior = prior; res.first = prior[0];
  const devices = new Set(prior.map(e => e.deviceId).concat(deviceId)).size;
  const cities = new Set(prior.map(e => e.city).concat(city).filter(c => c !== 'Not shared'));
  step('10 · Previous scan activity', true, prior.length + ' prior check' + (prior.length === 1 ? '' : 's') + ' · ' + devices + ' device' + (devices === 1 ? '' : 's'));
  const add = (code, w, label, consumer) => { factors.push({ code, w, label, consumer }); res.score += w; };
  if (u.status === 'Deactivated') add('DEACT', 100, 'Identity deactivated by manufacturer', 'The manufacturer has deactivated this code.');
  if (prior.some(e => e.status === 'suspicious')) add('PRIOR', 50, 'Unit already flagged suspicious', 'This code was flagged before.');
  if (devices >= 6) add('DEV6', 40, `Checked on ${devices} different devices`, `This code has been checked on ${devices} different phones.`);
  else if (devices >= 3) add('DEV3', 20, `Checked on ${devices} different devices`, `This code has been checked on ${devices} different phones.`);
  if (cities.size >= 3) add('CITY', 25, `Seen in ${cities.size} cities: ${[...cities].slice(0, 4).join(', ')}${cities.size > 4 ? '…' : ''}`, `It has been checked in ${cities.size} different cities.`);
  const here = cityBy(city);
  if (here) { let worst = null; for (const e of prior) { const c = cityBy(e.city); if (!c || e.deviceId === deviceId || now - e.at > 2 * DAY) continue; const d = km(here, c), hrs = Math.max((now - e.at) / HOUR, 0.05); if (d > 150 && d / hrs > 120 && (!worst || d / hrs > worst.v)) worst = { v: d / hrs, d, hrs, c: e.city }; }
    if (worst) { const t = worst.hrs < 1 ? Math.round(worst.hrs * 60) + ' min' : worst.hrs.toFixed(1) + ' h'; add('TRAVEL', 55, `Impossible travel: ${worst.c} → ${city}, ${Math.round(worst.d)} km in ${t}`, `It was checked in ${worst.c} only ${worst.hrs < 1 ? Math.round(worst.hrs * 60) + ' minutes' : Math.round(worst.hrs) + ' hours'} ago, about ${Math.round(worst.d)} km away.`); } }
  const burst = new Set(prior.filter(e => now - e.at < 10 * MIN).map(e => e.deviceId).concat(deviceId)).size;
  if (burst >= 3) add('BURST', 20, `${burst} devices within 10 minutes`, 'Many phones checked it within minutes.');
  if (res.first && now - res.first.at > 120 * DAY) add('AGE', 10, 'First checked over 120 days ago', '');
  // scratch-off PIN (high-risk products)
  if (p.highRisk) {
    if (ctx.pin == null) { step('10b · Scratch-off PIN', null, 'Awaiting concealed PIN'); }
    else {
      const ok = safeEq(hex(sha256(u.id + '|' + String(ctx.pin).trim())), u.pinHash);
      if (!ok) add('PINBAD', 60, 'Incorrect scratch-off PIN', 'The PIN does not match this code.');
      else if (u.pinRedeemed && u.pinRedeemed.device !== deviceId) add('PINREUSE', 60, `PIN already redeemed in ${u.pinRedeemed.city} on ${new Date(u.pinRedeemed.at).toLocaleDateString('en-NG')}`, `This PIN was already used in ${u.pinRedeemed.city} on ${new Date(u.pinRedeemed.at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}.`);
      step('10b · Scratch-off PIN', ok && !factors.some(f => f.code === 'PINREUSE'), ok ? (u.pinRedeemed ? 'Previously redeemed' : 'First redemption') : 'Mismatch');
      res.pinOk = ok;
    }
  }
  const dup = factors.some(f => ['DEV3', 'DEV6', 'CITY', 'TRAVEL', 'BURST', 'PINREUSE'].includes(f.code));
  step('11 · Duplicate / clone detection', !dup, dup ? 'Duplicate pattern detected' : 'No duplicate pattern');
  const susp = res.score >= 50;
  step('12 · Risk classification', !susp, `Score ${res.score}/100 · ${susp ? 'HIGH' : res.score ? 'LOW' : 'NONE'} (rules engine; AI advisory only)`);
  let status = recall ? 'recalled' : susp ? 'suspicious' : regBad ? 'reg_invalid' : expired ? 'expired' : 'verified';
  if (status === 'verified' && p.highRisk && ctx.pin == null) status = 'pin_required';
  if (status === 'verified' && p.highRisk && res.pinOk && !u.pinRedeemed) u.pinRedeemed = { at: now, city, device: deviceId };
  step('13 · Response returned', true, STATUS[status].label);
  return finish(status);
}
function record(res, deviceId, channel) {
  const e = { id: 'evt_' + b32(cryptoBytes(8)).toLowerCase(), at: res.at, unitId: res.unit ? res.unit.id : null, mfrId: res.mfr ? res.mfr.id : null, productId: res.product ? res.product.id : null, batchId: res.batch ? res.batch.id : null,
    city: res.city, deviceId, status: res.status, score: res.score, factors: res.factors.map(f => f.label), channel, forged: res.factors.some(f => f.code === 'SIG') };
  res.eventId = e.id; S.events.push(e);
  if (e.unitId) { const l = S.eventsByUnit.get(e.unitId) || []; l.push(e); S.eventsByUnit.set(e.unitId, l);
    if (e.status === 'suspicious' && !S.cases.find(c => c.unitId === e.unitId)) openCase({ unitId: e.unitId, mfrId: e.mfrId, source: 'Rules engine', at: e.at, city: e.city });
    if (e.status === 'suspicious') emitWebhook(e.mfrId, 'verification.suspicious', { unit_id: e.unitId, event_id: e.id, city: e.city, score: e.score, factors: e.factors }, e.at);
  }
  return e;
}
function openCase({ unitId, mfrId, source, at, city }) {
  const c = cityBy(city) || cityBy(mfrOf(mfrId).city);
  const cs = { id: 'CASE-' + String(1040 + S.cases.length), unitId, mfrId, zone: c.zone, opened: at, status: 'Open', assignee: 'Unassigned', source, notes: [], reports: [] };
  S.cases.push(cs); audit('system:rules-engine', 'case.opened', cs.id, 'unit ' + unitId + ' · ' + source, at); return cs;
}
function emitWebhook(mfrId, type, data, at) {
  S.webhooks.filter(w => w.mfrId === mfrId && w.active && w.events.includes(type)).forEach(w => {
    const t = Math.floor((at || Date.now()) / 1000), body = JSON.stringify({ id: 'whe_' + b32(cryptoBytes(6)).toLowerCase(), type, created: t, data });
    S.whLog.push({ at: at || Date.now(), mfrId, url: w.url, type, body, sig: `t=${t},v1=${hex(hmac(ENC.encode(w.secret), t + '.' + body))}`, status: 'Queued · demo cannot reach external URLs' });
  });
}

/* ---------- Manufacturer operations ---------- */
function createProduct(mfrId, d, actor, at) {
  const p = { id: newId('prd'), mfrId, sku: d.sku, name: d.name, category: d.category || 'Drugs', form: d.form || 'box', reg: { number: d.nafdac_reg, status: 'Valid', source: 'Manufacturer-declared' }, highRisk: !!d.high_risk, color: d.color || '#0a7f4f', createdAt: at || Date.now() };
  S.products.push(p); audit(actor, 'product.created', p.id, p.sku, at); return p;
}
function createBatch(mfrId, d, actor, at) {
  const b = { id: newId('bat'), mfrId, productId: d.product_id, code: d.batch_code, mfg: d.mfg, exp: d.exp, size: 0, createdAt: at || Date.now() };
  S.batches.push(b); audit(actor, 'batch.created', b.id, b.code, at); return b;
}
function recallBatch(batchId, reason, actor, at) {
  const b = batchOf(batchId); if (S.recalls.find(r => r.batchId === batchId)) return null;
  const r = { id: 'RCL-' + (2201 + S.recalls.length), mfrId: b.mfrId, batchId, reason, at: at || Date.now(), by: actor };
  S.recalls.push(r); audit(actor, 'recall.issued', r.id, b.code + ' · ' + reason, r.at); emitWebhook(b.mfrId, 'recall.created', { recall_id: r.id, batch: b.code, reason }, r.at); return r;
}
function newApiKey(mfrId, actor, env = 'test') {
  const secret = `vng_${env}_` + b32(cryptoBytes(20)).toLowerCase();
  const k = { id: newId('key'), mfrId, env, hash: hex(sha256(secret)), last4: secret.slice(-4), created: Date.now(), lastUsed: null, status: 'Active', scopes: ['products:write', 'batches:write', 'verify:read', 'analytics:read'] };
  S.keys.push(k); audit(actor, 'apikey.created', k.id, env + ' ···' + k.last4); return { k, secret };
}

/* ---------- Analytics ---------- */
function stats(filter) {
  const ev = S.events.filter(filter || (() => true)), by = {};
  for (const k of Object.keys(STATUS)) by[k] = 0; ev.forEach(e => by[e.status]++);
  return { total: ev.length, by, ev };
}

/* ---------- Deterministic synthetic seed ---------- */
function seed() {
  const now = Date.now(), rnd = mulberry(20261110), D = n => now + n * DAY;
  const mk = (id, code, name, city, cat, plan) => { const m = { id, code, name, city, state: cityBy(city).st, zone: cityBy(city).zone, category: cat, plan, status: 'Active', kyc: 'Verified (demo)', joined: D(-210 + S.mfrs.length * 40), key: sha256('demo-signing-key|' + code), keyId: code.toLowerCase() + '-2026-01', contact: 'integrations@' + code.toLowerCase() + '.demo' }; S.mfrs.push(m); return m; };
  const m1 = mk('org_lgp', 'LGP', 'Lagoon Pharmaceuticals Ltd', 'Lagos', 'Drugs', 'Enterprise');
  const m2 = mk('org_svf', 'SVF', 'Savannah Foods Plc', 'Kano', 'Food', 'Growth');
  const m3 = mk('org_ndb', 'NDB', 'Delta Springs Beverages', 'Port Harcourt', 'Beverages', 'Growth');
  S.mfrs.forEach(m => audit('admin@verifyng', 'tenant.onboarded', m.id, m.name, m.joined));
  const P = (m, sku, name, cat, form, reg, color, hr) => { const p = createProduct(m.id, { sku, name, category: cat, form, nafdac_reg: reg, high_risk: hr, color }, 'erp-sync@' + m.code.toLowerCase(), m.joined + DAY); p.id = 'prd_' + sku.toLowerCase().replace(/[^a-z0-9]/g, ''); return p; };
  const pcm = P(m1, 'PCM-500', 'Paracetamol 500 mg Tablets · 10×10', 'Drugs', 'box', 'DEMO-A4-0412', '#0a7f4f');
  const amx = P(m1, 'AMX-500', 'Amoxicillin 500 mg Capsules · 21', 'Drugs', 'box', 'DEMO-A4-0977', '#1d5fa8');
  const alu = P(m1, 'ALU-2048', 'Artemether/Lumefantrine 80/480 mg · 6', 'Drugs', 'box', 'DEMO-A4-1260', '#b3261e', true);
  const sem = P(m2, 'SEM-1K', 'Fortified Semolina 1 kg', 'Food', 'sachet', 'DEMO-01-5531', '#c77700');
  const inf = P(m2, 'INF-400', 'Infant Formula Stage 1 · 400 g', 'Food', 'tin', 'DEMO-01-7720', '#6a4fb3', true);
  const wtr = P(m3, 'WTR-75', 'Table Water 75 cl', 'Beverages', 'bottle', 'DEMO-B1-3304', '#1689b5');
  const mlt = P(m3, 'MLT-33', 'Malt Drink 33 cl', 'Beverages', 'can', 'DEMO-B1-4418', '#7a3e12');
  wtr.reg.status = 'Expired'; wtr.reg.since = D(-60);
  const B = (p, code, mfg, exp, n) => { const b = createBatch(p.mfrId, { product_id: p.id, batch_code: code, mfg: D(mfg), exp: D(exp) }, 'erp-sync@' + mfrOf(p.mfrId).code.toLowerCase(), D(mfg)); b.id = 'bat_' + code.toLowerCase().replace(/[^a-z0-9]/g, ''); issueUnits(b, n, rnd, D(mfg)); audit('erp-sync@' + mfrOf(p.mfrId).code.toLowerCase(), 'batch.serialized', b.id, n + ' identities', D(mfg) + HOUR); return b; };
  const bs = [B(pcm, 'PCM-2609', -70, 660, 240), B(pcm, 'PCM-2610', -35, 695, 240), B(amx, 'AMX-2610', -40, 500, 220), B(alu, 'ALU-2608', -95, 450, 200),
    B(sem, 'SEM-2511', -380, -20, 200), B(sem, 'SEM-2610', -30, 330, 220), B(inf, 'INF-2609', -60, 480, 200), B(wtr, 'WTR-2609', -75, 290, 220), B(mlt, 'MLT-2609', -50, 310, 220), B(mlt, 'MLT-2610', -25, 335, 200)];
  const byCode = c => bs.find(b => b.code === c);
  S.mfrs.forEach(m => { const k = { id: 'key_' + m.code.toLowerCase() + '01', mfrId: m.id, env: 'live', hash: hex(sha256('seed' + m.code)), last4: m.code.toLowerCase() + '9', created: m.joined + 2 * DAY, lastUsed: D(-0.1), status: 'Active', scopes: ['products:write', 'batches:write', 'verify:read', 'analytics:read'] }; S.keys.push(k); audit('owner@' + m.code.toLowerCase(), 'apikey.created', k.id, 'live ···' + k.last4, k.created);
    S.webhooks.push({ id: 'wh_' + m.code.toLowerCase(), mfrId: m.id, url: `https://erp.${m.code.toLowerCase()}.demo/hooks/verifyng`, events: ['verification.suspicious', 'recall.created'], secret: 'whsec_' + m.code.toLowerCase() + '_demo', active: true }); });
  // planned scan traffic
  const plan = [], weights = CITIES.reduce((a, c) => a + c.w, 0);
  const pickCity = () => { let x = rnd() * weights; for (const c of CITIES) { x -= c.w; if (x <= 0) return c.name; } return 'Lagos'; };
  const dev = () => 'd' + (rnd() * 1e9 | 0).toString(36);
  const pool = []; bs.forEach(b => (S.unitsByBatch.get(b.id)).slice(20).forEach(u => pool.push(u)));
  for (let i = pool.length - 1; i > 0; i--) { const j = rnd() * (i + 1) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  pool.slice(0, 1500).forEach(u => { const b = batchOf(u.batchId), start = Math.max(b.mfg + 6 * DAY, now - 30 * DAY); if (start > now - HOUR) return; const at = start + rnd() * (now - HOUR - start), d = dev(), c = pickCity(), hr = productOf(u.productId).highRisk && rnd() < 0.9; plan.push({ u, at, city: c, d, pin: hr ? pinFor(u) : undefined });
    if (rnd() < 0.15) plan.push({ u, at: Math.min(now - 10 * MIN, at + rnd() * 3 * DAY), city: c, d, pin: hr ? pinFor(u) : undefined }); });
  const clone = (u, n, cities, startDays, spanDays) => { for (let i = 0; i < n; i++) plan.push({ u, at: D(startDays) + (i / n) * spanDays * DAY + rnd() * HOUR, city: cities[i % cities.length], d: dev() }); };
  const U = (code, i) => S.unitsByBatch.get(byCode(code).id)[i];
  clone(U('AMX-2610', 3), 28, ['Lagos', 'Kano', 'Onitsha', 'Aba', 'Abuja', 'Onitsha', 'Aba'], -9, 6);
  clone(U('ALU-2608', 4), 12, ['Kano', 'Kaduna', 'Jos', 'Kano'], -4, 2);
  clone(U('PCM-2609', 5), 9, ['Onitsha', 'Owerri', 'Aba', 'Enugu'], -13, 4);
  clone(U('SEM-2610', 6), 8, ['Maiduguri', 'Kano', 'Yola'], -6, 3);
  plan.push({ u: U('INF-2609', 5), at: D(-3), city: 'Aba', d: 'dpin1', pin: pinFor(U('INF-2609', 5)) });
  for (let i = 0; i < 30; i++) { const m = S.mfrs[rnd() * 3 | 0]; plan.push({ forged: `V1-${m.code}-${b32(Array.from({ length: 10 }, () => rnd() * 256 | 0))}-${b32(Array.from({ length: 8 }, () => rnd() * 256 | 0)).slice(0, 12)}`, at: D(-rnd() * 28), city: ['Onitsha', 'Aba', 'Kano', 'Lagos', 'Ibadan'][rnd() * 5 | 0], d: dev() }); }
  // recall happens mid-history so the timeline is realistic
  plan.push({ recall: byCode('MLT-2609').id, at: D(-5) });
  plan.sort((a, b) => a.at - b.at).forEach(s => {
    if (s.recall) return recallBatch(s.recall, 'Precautionary: carbonation seal defect found in QA retention samples (DEMO)', 'qa.lead@ndb', s.at);
    verify(s.forged || tokenFor(s.u), { now: s.at, city: s.city, deviceId: s.d, pin: s.pin, channel: 'web' });
  });
  // consumer reports on flagged codes
  const rep = (unit, city, text, at) => { const cs = S.cases.find(c => c.unitId === unit.id); const r = { id: 'RPT-' + (5100 + S.reports.length), unitId: unit.id, mfrId: unit.mfrId, city, text, at, contact: 'withheld (consent not given)' }; S.reports.push(r); if (cs) cs.reports.push(r.id); };
  rep(U('AMX-2610', 3), 'Onitsha', 'Bought at Ochanja market. Capsules a different colour from my last pack.', D(-4));
  rep(U('AMX-2610', 3), 'Aba', 'Seller had a full carton with the same code on every box.', D(-3.2));
  rep(U('ALU-2608', 4), 'Kano', 'Print on the pack looks blurry.', D(-2.4));
  const c1 = S.cases.find(c => c.unitId === U('AMX-2610', 3).id); if (c1) { c1.status = 'Under review'; c1.assignee = 'Officer A. Bello (SE)'; c1.notes.push({ at: D(-2), by: 'Officer A. Bello', text: 'Market survey planned for Onitsha and Aba. Manufacturer confirmed this serial belongs to a carton shipped to a Lagos distributor.' }); audit('officer.bello@regulator', 'case.updated', c1.id, 'Under review', D(-2)); }
  // demo labels (reserved units, untouched by traffic)
  const forgedDemo = (() => { const u = U('PCM-2610', 0); const t = tokenFor(u); return t.slice(0, -4) + (t.endsWith('ZZZZ') ? 'YYYY' : 'ZZZZ'); })();
  return [
    { key: 'genuine', title: 'Genuine product', note: 'First scan of a newly bought pack', tone: 'ok', token: tokenFor(U('PCM-2610', 1)), unit: U('PCM-2610', 1) },
    { key: 'clone', title: 'Cloned label', note: 'Same code checked in 5 cities', tone: 'warn', token: tokenFor(U('AMX-2610', 3)), unit: U('AMX-2610', 3) },
    { key: 'forged', title: 'Forged code', note: 'Looks right, signature fails', tone: 'bad', token: forgedDemo, unit: U('PCM-2610', 0) },
    { key: 'recalled', title: 'Recalled batch', note: 'MLT-2609 recalled 5 days ago', tone: 'rec', token: tokenFor(U('MLT-2609', 2)), unit: U('MLT-2609', 2) },
    { key: 'expired', title: 'Expired stock', note: 'Old semolina still on shelf', tone: 'exp', token: tokenFor(U('SEM-2511', 3)), unit: U('SEM-2511', 3) },
    { key: 'reg', title: 'Registration lapsed', note: 'Registry shows expired status', tone: 'reg', token: tokenFor(U('WTR-2609', 4)), unit: U('WTR-2609', 4) },
    { key: 'pin', title: 'Scratch-off PIN', note: 'High-risk: QR + concealed PIN', tone: 'info', token: tokenFor(U('INF-2609', 7)), unit: U('INF-2609', 7), pin: pinFor(U('INF-2609', 7)) },
    { key: 'pinreuse', title: 'PIN already used', note: 'PIN was redeemed in Aba', tone: 'warn', token: tokenFor(U('INF-2609', 5)), unit: U('INF-2609', 5), pin: pinFor(U('INF-2609', 5)) },
  ];
}

/* ---------- In-page API gateway (same contract as the production REST API) ---------- */
function api(method, path, headers, body) {
  const rid = 'req_' + b32(cryptoBytes(6)).toLowerCase(), t0 = performance.now();
  const out = (code, data) => { const r = { status: code, headers: { 'x-request-id': rid, 'x-api-version': '2026-11-01', 'content-type': 'application/json' }, body: data }; S.apiLog.unshift({ at: Date.now(), method, path, status: code, mfrId: r._m, ms: +(performance.now() - t0).toFixed(1) }); return r; };
  const err = (code, c, msg) => out(code, { error: { code: c, message: msg, request_id: rid } });
  const H = Object.fromEntries(Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  let data = body; if (typeof body === 'string' && body.trim()) { try { data = JSON.parse(body); } catch { return err(400, 'invalid_json', 'Request body is not valid JSON.'); } }
  data = data || {};
  const pub = method === 'POST' && path === '/api/v1/verify';
  let key = null;
  if (!pub) {
    const auth = (H.authorization || '').replace(/^Bearer\s+/i, '');
    if (!auth) return err(401, 'missing_credentials', 'Send your API key as "Authorization: Bearer vng_test_…".');
    key = S.keys.find(k => k.hash === hex(sha256(auth)) && k.status === 'Active');
    if (!key) return err(401, 'invalid_credentials', 'API key is unknown, revoked or rotated.');
    key.lastUsed = Date.now();
  }
  const bucket = (key ? key.id : 'ip') + ':' + Math.floor(Date.now() / MIN), n = (S.rate.get(bucket) || 0) + 1; S.rate.set(bucket, n);
  if (n > 30) return err(429, 'rate_limited', 'Limit is 30 requests per minute in the sandbox. Retry after the window resets.');
  if (method === 'POST' && H['idempotency-key'] && key) { const prev = S.idem.get(key.id + H['idempotency-key']); if (prev) { const r = JSON.parse(JSON.stringify(prev)); r.headers['idempotent-replayed'] = 'true'; return r; } }
  const mid = key && key.mfrId, mine = o => o && o.mfrId === mid, actor = key ? 'api:' + key.id : 'public';
  const save = r => { if (method === 'POST' && H['idempotency-key'] && key) S.idem.set(key.id + H['idempotency-key'], JSON.parse(JSON.stringify(r))); return r; };
  const need = (o, f) => f.filter(x => o[x] == null || o[x] === '');
  let m;
  if (pub) {
    if (!data.token) return err(422, 'validation_error', 'Field "token" is required.');
    const r = verify(extractToken(data.token), { city: data.city, deviceId: data.device_id || 'api-client', channel: 'api' });
    return out(200, { verification_id: r.eventId, result: r.status, label: STATUS[r.status].label, message: STATUS[r.status].line, checked_at: new Date(r.at).toISOString(),
      product: r.unit && !['not_recognised', 'unavailable'].includes(r.status) ? { name: r.product.name, manufacturer: r.mfr.name, batch: r.batch.code, expiry: new Date(r.batch.exp).toISOString().slice(0, 10), registration: r.product.reg.number } : null,
      reasons: r.factors.map(f => f.consumer).filter(Boolean) });
  }
  if (method === 'GET' && path === '/api/v1/integrations/status') return out(200, { organisation: mfrOf(mid).name, environment: key.env, connectors: [{ type: 'rest_api', status: 'connected', last_sync: new Date(key.lastUsed).toISOString() }, { type: 'webhooks', status: S.webhooks.some(w => w.mfrId === mid && w.active) ? 'active' : 'none' }, { type: 'csv_import', status: 'available' }, { type: 'erp_connector', status: 'planned_phase_2' }], regulatory_registry: S.regConnector === 'sandbox' ? 'sandbox_mock (official access requires authorisation)' : 'manufacturer_declared' });
  if (method === 'GET' && path === '/api/v1/manufacturers/analytics') { const s = stats(e => e.mfrId === mid); return out(200, { organisation: mfrOf(mid).name, products: S.products.filter(mine).length, batches: S.batches.filter(mine).length, identities_issued: [...S.units.values()].filter(mine).length, verifications: s.total, by_result: s.by }); }
  if (method === 'GET' && path.startsWith('/api/v1/verification/history')) { const lim = Math.min(+(new URLSearchParams(path.split('?')[1]).get('limit') || 10), 100); return out(200, { data: S.events.filter(e => e.mfrId === mid).slice(-lim).reverse().map(e => ({ id: e.id, at: new Date(e.at).toISOString(), result: e.status, city: e.city, unit_id: e.unitId, risk_score: e.score })) }); }
  if (method === 'GET' && (m = path.match(/^\/api\/v1\/products\/([\w-]+)$/))) { const p = productOf(m[1]); if (!mine(p)) return err(404, 'not_found', 'No product with that id in your organisation.'); return out(200, { ...p, batches: S.batches.filter(b => b.productId === p.id).map(b => ({ id: b.id, code: b.code, units: b.size })) }); }
  if (method === 'POST' && path === '/api/v1/products') { const miss = need(data, ['sku', 'name', 'nafdac_reg']); if (miss.length) return err(422, 'validation_error', 'Missing: ' + miss.join(', ')); if (S.products.some(p => p.mfrId === mid && p.sku === data.sku)) return err(409, 'conflict', 'SKU already exists.'); return save(out(201, createProduct(mid, data, actor))); }
  if (method === 'POST' && path === '/api/v1/batches') { const miss = need(data, ['product_id', 'batch_code', 'manufactured_on', 'expires_on']); if (miss.length) return err(422, 'validation_error', 'Missing: ' + miss.join(', ')); if (!mine(productOf(data.product_id))) return err(404, 'not_found', 'Unknown product_id.'); const b = createBatch(mid, { product_id: data.product_id, batch_code: data.batch_code, mfg: Date.parse(data.manufactured_on), exp: Date.parse(data.expires_on) }, actor); return save(out(201, b)); }
  if (method === 'POST' && (m = path.match(/^\/api\/v1\/products\/([\w-]+)\/serialize$/))) { const p = productOf(m[1]), b = batchOf(data.batch_id); if (!mine(p) || !mine(b) || b.productId !== p.id) return err(404, 'not_found', 'Unknown product or batch.'); const q = +data.quantity; if (!(q >= 1 && q <= 500)) return err(422, 'validation_error', 'quantity must be 1–500 in the sandbox.'); const us = issueUnits(b, q); audit(actor, 'batch.serialized', b.id, q + ' identities'); return save(out(201, { batch_id: b.id, issued: q, identities: us.slice(0, 5).map(u => ({ unit_id: u.id, serial: u.serial, qr_payload: (window.VNG_BASE || '') + '#u-' + tokenFor(u) })), note: us.length > 5 ? `${q - 5} more omitted from preview` : undefined })); }
  if (method === 'POST' && path === '/api/v1/recalls') { const b = batchOf(data.batch_id); if (!mine(b)) return err(404, 'not_found', 'Unknown batch_id.'); if (!data.reason) return err(422, 'validation_error', 'Field "reason" is required.'); const r = recallBatch(b.id, data.reason, actor); if (!r) return err(409, 'conflict', 'Batch already recalled.'); return save(out(201, r)); }
  if (method === 'POST' && path === '/api/v1/webhooks/register') { if (!/^https:\/\//.test(data.url || '')) return err(422, 'validation_error', 'url must be https.'); const w = { id: newId('wh'), mfrId: mid, url: data.url, events: data.events || ['verification.suspicious', 'recall.created'], secret: 'whsec_' + b32(cryptoBytes(12)).toLowerCase(), active: true }; S.webhooks.push(w); audit(actor, 'webhook.registered', w.id, w.url); return save(out(201, w)); }
  if (method === 'POST' && path === '/api/v1/products/bulk-import') { const r = importCsv(mid, data.csv || '', actor); return save(out(r.errors.length && !r.created.length ? 422 : 201, r)); }
  return err(404, 'route_not_found', `${method} ${path} is not an API v1 route.`);
}
function importCsv(mid, csv, actor) {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean), head = (lines.shift() || '').split(',').map(s => s.trim().toLowerCase()), need = ['sku', 'name', 'category', 'nafdac_reg'];
  const res = { created: [], errors: [] }; const miss = need.filter(n => !head.includes(n)); if (miss.length) { res.errors.push({ row: 1, message: 'Header missing: ' + miss.join(', ') }); return res; }
  lines.forEach((ln, i) => { const cells = ln.split(',').map(s => s.trim()), o = Object.fromEntries(head.map((h, j) => [h, cells[j] || ''])); const row = i + 2;
    const bad = need.filter(n => !o[n]); if (bad.length) return res.errors.push({ row, message: 'Empty: ' + bad.join(', ') });
    if (!/^[A-Z0-9-]{3,20}$/.test(o.sku)) return res.errors.push({ row, message: `SKU "${o.sku}" must be 3–20 capitals, digits or dashes` });
    if (S.products.some(p => p.mfrId === mid && p.sku === o.sku)) return res.errors.push({ row, message: `SKU ${o.sku} already exists` });
    res.created.push(createProduct(mid, { sku: o.sku, name: o.name, category: o.category, nafdac_reg: o.nafdac_reg, high_risk: /^(y|yes|true|1)$/i.test(o.high_risk || ''), form: o.form || 'box', color: '#3a6f55' }, actor).id); });
  return res;
}
if (typeof module !== 'undefined') module.exports = { sha256, hmac, hex, b32, verify, seed, S, tokenFor, pinFor, api, stats, verifyAuditChain, importCsv, STATUS };
