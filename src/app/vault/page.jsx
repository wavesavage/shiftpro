'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ═══════════════════════════════════════════
   CRYPTO — AES-256-GCM + PBKDF2
   ═══════════════════════════════════════════ */
const KDF_ITERATIONS = 600000;

async function deriveKey(pw, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey(
    'raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: KDF_ITERATIONS, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(key, plaintext) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const buf = new Uint8Array(iv.length + ct.byteLength);
  buf.set(iv);
  buf.set(new Uint8Array(ct), iv.length);
  return btoa(String.fromCharCode(...buf));
}

async function decryptData(key, ciphertext) {
  const buf = Uint8Array.from(atob(ciphertext), function(c) { return c.charCodeAt(0); });
  const dec = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: buf.slice(0, 12) },
    key,
    buf.slice(12)
  );
  return new TextDecoder().decode(dec);
}

/* ═══════════════════════════════════════════
   PASSWORD GENERATION
   ═══════════════════════════════════════════ */
const WORDLIST = [
  'ocean','anchor','breeze','coral','drift','ember','frost','grove','harbor','island',
  'jasper','kelp','lunar','marine','north','orbit','pearl','quartz','ridge','storm',
  'tide','unity','vivid','wave','zenith','blaze','cliff','delta','eagle','flame',
  'ghost','haven','ivory','jewel','knot','latch','mist','noble','opal','prism',
  'quest','realm','slate','trail','ultra','vault','whirl','xenon','yield','zephyr',
  'amber','birch','cedar','dawn','echo','fern','glade','heath','inlet','jade',
  'kite','lemon','maple','nest','olive','pine','raven','sage','thorn','umber',
  'vine','wren','apex','bolt','crest','dusk','edge','forge','glyph','haze',
  'iron','jumbo','keen','lodge','moss','nexus','onyx','plume','quill','rift',
  'shard','torch','urge','vigor','warp','axiom','brine','charm','dome','flux',
  'grain','helm','jolt','karma','lyric'
];

function genPassword(len, opts) {
  var chars = '';
  if (opts.lower) chars += 'abcdefghijkmnopqrstuvwxyz';
  if (opts.upper) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (opts.numbers) chars += '23456789';
  if (opts.symbols) chars += '!@#$%&*?+-=';
  if (!chars) chars = 'abcdefghijkmnopqrstuvwxyz';
  var arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, function(x) { return chars[x % chars.length]; }).join('');
}

function genPassphrase(wordCount, sep, capitalize, appendNum) {
  var arr = new Uint32Array(wordCount);
  crypto.getRandomValues(arr);
  var words = Array.from(arr, function(x) { return WORDLIST[x % WORDLIST.length]; });
  if (capitalize) words = words.map(function(w) { return w[0].toUpperCase() + w.slice(1); });
  var result = words.join(sep);
  if (appendNum) {
    var n = new Uint32Array(1);
    crypto.getRandomValues(n);
    result += sep + (n[0] % 900 + 100);
  }
  return result;
}

function getStrength(pw) {
  if (!pw) return { label: 'None', color: '#555', pct: 0, time: '' };
  var s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 14) s++;
  if (pw.length >= 20) s++;
  if (pw.length >= 28) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  var pool = (/[a-z]/.test(pw) ? 26 : 0) + (/[A-Z]/.test(pw) ? 26 : 0) + (/\d/.test(pw) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(pw) ? 32 : 0) || 26;
  var entropy = pw.length * Math.log2(pool);
  var seconds = Math.pow(2, entropy) / 1e12;
  var time = '';
  if (seconds < 1) time = 'instantly';
  else if (seconds < 60) time = Math.round(seconds) + 's';
  else if (seconds < 3600) time = Math.round(seconds / 60) + ' min';
  else if (seconds < 86400) time = Math.round(seconds / 3600) + ' hrs';
  else if (seconds < 31536000) time = Math.round(seconds / 86400) + ' days';
  else if (seconds < 31536000 * 100) time = Math.round(seconds / 31536000) + ' yrs';
  else if (seconds < 31536000 * 1e6) time = Math.round(seconds / 31536000 / 1000) + 'K yrs';
  else time = 'centuries+';
  if (s <= 2) return { label: 'Weak', color: '#ef4444', pct: 20, time: time };
  if (s <= 3) return { label: 'Fair', color: '#f59e0b', pct: 40, time: time };
  if (s <= 4) return { label: 'Good', color: '#2dd4bf', pct: 65, time: time };
  if (s <= 5) return { label: 'Strong', color: '#22c55e', pct: 85, time: time };
  return { label: 'Excellent', color: '#10b981', pct: 100, time: time };
}

/* ═══════════════════════════════════════════
   TOTP (RFC 6238)
   ═══════════════════════════════════════════ */
function base32Decode(s) {
  var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  var bits = '';
  var bytes = [];
  var cleaned = s.toUpperCase().replace(/[^A-Z2-7]/g, '');
  for (var i = 0; i < cleaned.length; i++) {
    bits += alpha.indexOf(cleaned[i]).toString(2).padStart(5, '0');
  }
  for (var j = 0; j + 8 <= bits.length; j += 8) {
    bytes.push(parseInt(bits.slice(j, j + 8), 2));
  }
  return new Uint8Array(bytes);
}

async function generateTOTP(secret) {
  try {
    var keyData = base32Decode(secret);
    var key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    var epoch = Math.floor(Date.now() / 1000);
    var counter = Math.floor(epoch / 30);
    var counterBuf = new ArrayBuffer(8);
    new DataView(counterBuf).setUint32(4, counter);
    var sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBuf));
    var offset = sig[sig.length - 1] & 0x0f;
    var code = ((sig[offset] & 0x7f) << 24 | sig[offset + 1] << 16 | sig[offset + 2] << 8 | sig[offset + 3]) % 1000000;
    return { code: code.toString().padStart(6, '0'), remaining: 30 - (epoch % 30) };
  } catch (e) {
    return { code: '------', remaining: 30 };
  }
}

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */
var ENTRY_TYPES = [
  { id: 'login', label: 'Login', icon: '🔑' },
  { id: 'card', label: 'Credit Card', icon: '💳' },
  { id: 'identity', label: 'Identity', icon: '🪪' },
  { id: 'secure_note', label: 'Secure Note', icon: '📝' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'api_key', label: 'API Key', icon: '🔧' },
];

var CATEGORIES = [
  { id: 'all', label: 'All Vault', icon: '🔐', color: '#e8b84b' },
  { id: 'stc', label: 'Surf Town Coffee', icon: '🏄', color: '#f97316' },
  { id: 'bsc', label: 'Bayscapes / Sea Lion', icon: '🦭', color: '#2dd4bf' },
  { id: 'apg', label: 'Marine Discovery', icon: '🐋', color: '#3b82f6' },
  { id: 'shiftpro', label: 'ShiftPro.ai', icon: '⚡', color: '#a855f7' },
  { id: 'personal', label: 'Personal', icon: '🏠', color: '#ec4899' },
  { id: 'financial', label: 'Financial', icon: '🏦', color: '#22c55e' },
  { id: 'social', label: 'Social Media', icon: '💬', color: '#06b6d4' },
  { id: 'shopping', label: 'Shopping', icon: '🛒', color: '#f43f5e' },
  { id: 'devkeys', label: 'Dev / API Keys', icon: '🔧', color: '#8b5cf6' },
];

var DEMO_ENTRIES = [
  { id:'1', type:'login', cat:'stc', fav:true, payload:{ title:'Square POS', username:'stc_admin@bme.com', password:'Kj#9xMp$2nQw!rTz', url:'https://squareup.com', notes:'Main register login', totp_secret:'JBSWY3DPEHPK3PXP' }},
  { id:'2', type:'login', cat:'bsc', fav:false, payload:{ title:'Toast POS', username:'bsc_manager@bme.com', password:'Bv&7cLp@4mXs#wYn', url:'https://pos.toasttab.com', notes:'Bar & kitchen tablets' }},
  { id:'3', type:'login', cat:'apg', fav:true, payload:{ title:'FareHarbor', username:'tours@marinediscovery.com', password:'Qx!5hNr$8kWz@mPj', url:'https://fareharbor.com', notes:'Booking system' }},
  { id:'4', type:'login', cat:'shiftpro', fav:true, payload:{ title:'Vercel Dashboard', username:'wavesavage', password:'Tz#3vKm&9pBx!wLs', url:'https://vercel.com', notes:'Deployment platform' }},
  { id:'5', type:'login', cat:'shiftpro', fav:false, payload:{ title:'Supabase Project', username:'brendan@shiftpro.ai', password:'Mn@6jRw$2cFx!qHt', url:'https://supabase.com', notes:'Production database', totp_secret:'KRMVATZTJFZUC4DIMF' }},
  { id:'6', type:'login', cat:'personal', fav:false, payload:{ title:'Gmail', username:'brendan@gmail.com', password:'Wp!8dYn#5kBz@rMs', url:'https://gmail.com', notes:'' }},
  { id:'7', type:'wifi', cat:'stc', fav:false, payload:{ title:'Surf Town Guest WiFi', ssid:'SurfTown_Guest', password:'catchAwave2024!', security_type:'WPA2', notes:'Posted near register' }},
  { id:'8', type:'login', cat:'bsc', fav:true, payload:{ title:'QuickBooks Online', username:'accounting@bme.com', password:'Gx#4mNp@7rKz!wLs', url:'https://quickbooks.intuit.com', notes:'Bayscapes Coffee House LLC' }},
  { id:'9', type:'api_key', cat:'devkeys', fav:false, payload:{ title:'Resend API', service:'Resend', api_key:'re_demo_xxxxxxxxxxxx', api_secret:'', endpoint:'https://api.resend.com', notes:'Email service - Pro plan' }},
  { id:'10', type:'login', cat:'financial', fav:true, payload:{ title:'Fidelity Investments', username:'brendan_invest', password:'Ht!9cWm#3nBx@pKz', url:'https://fidelity.com', notes:'Brokerage account' }},
  { id:'11', type:'card', cat:'financial', fav:false, payload:{ title:'Business Visa ••4821', cardholder_name:'Brendan', card_number:'•••• •••• •••• 4821', expiry:'12/27', cvv:'•••', billing_zip:'97365', notes:'STC purchases' }},
  { id:'12', type:'identity', cat:'personal', fav:false, payload:{ title:'Business Identity', first_name:'Brendan', company:'Bayscapes Management Enterprises', address_line1:'345 SW Bay Blvd', city:'Newport', state:'OR', zip:'97365', notes:'' }},
  { id:'13', type:'secure_note', cat:'shiftpro', fav:false, payload:{ title:'Server Environment Notes', content:'Production DB: Supabase Pro\nCDN: Vercel Edge\nEmail: Resend Pro ($20/mo)\nDomain: shiftpro.ai via GoDaddy\n\nAlways configure SMTP to Resend for free Supabase tier.', notes:'' }},
  { id:'14', type:'login', cat:'social', fav:false, payload:{ title:'Instagram @marinediscoverytours', username:'marinediscoverytours', password:'Vb#6kWm@8nPx!rTz', url:'https://instagram.com', notes:'Business account' }},
  { id:'15', type:'wifi', cat:'bsc', fav:false, payload:{ title:'Sea Lion Staff WiFi', ssid:'SeaLion_Staff', password:'d0cks1de2024!', security_type:'WPA3', notes:'Staff only' }},
];

var AUDIT_SEED = [
  { id:'a1', action:'unlock', ts: Date.now()-120000, meta:'Master password verified' },
  { id:'a2', action:'entry_viewed', ts: Date.now()-100000, meta:'Square POS', entryId:'1' },
  { id:'a3', action:'password_copied', ts: Date.now()-95000, meta:'Square POS', entryId:'1' },
  { id:'a4', action:'entry_edited', ts: Date.now()-60000, meta:'Updated FareHarbor password', entryId:'3' },
  { id:'a5', action:'entry_created', ts: Date.now()-30000, meta:'Added Resend API key', entryId:'9' },
];

var AUDIT_ICONS = {
  unlock:'🔓', lock:'🔒', entry_created:'✨', entry_viewed:'👁️',
  entry_edited:'✏️', entry_deleted:'🗑️', password_copied:'📋',
  export:'📦', import:'📥', master_password_changed:'🔄'
};

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
var C = {
  navy: '#0c1220', navyL: '#131b2e', navyM: '#1a2540',
  surface: '#16203a', border: '#1e2d4a',
  gold: '#e8b84b', teal: '#2dd4bf', danger: '#ef4444',
  txt: '#e2e8f0', txt2: '#8896b0', txt3: '#5a6a84',
};
var FONT = {
  display: "'DM Serif Display', serif",
  body: "'Instrument Sans', 'DM Sans', 'Segoe UI', system-ui, sans-serif",
  mono: "'DM Mono', 'Fira Code', monospace",
};
var btnBase = {
  fontFamily: FONT.body, fontSize: 13, fontWeight: 600,
  border: 'none', borderRadius: 8, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  transition: 'all 0.2s',
};

var GLOBAL_CSS = [
  "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');",
  '*{box-sizing:border-box;margin:0;padding:0}',
  '::-webkit-scrollbar{width:5px}',
  '::-webkit-scrollbar-track{background:transparent}',
  '::-webkit-scrollbar-thumb{background:' + C.border + ';border-radius:3px}',
  'input:focus,textarea:focus,select:focus{outline:none;border-color:' + C.gold + '!important}',
  '@keyframes fadeUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}',
  '@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}',
  '@keyframes slideIn{0%{opacity:0;transform:translateX(-16px)}100%{opacity:1;transform:translateX(0)}}',
  '@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}',
  '@keyframes vaultOpen{0%{transform:scale(1);opacity:1}50%{transform:scale(1.06)}100%{transform:scale(0.92);opacity:0}}',
  '@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,184,75,0.25)}50%{box-shadow:0 0 28px 6px rgba(232,184,75,0.12)}}',
  '@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
  '@keyframes toastIn{0%{opacity:0;transform:translateY(16px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}',
].join('\n');


/* ═══════════════════════════════════════════
   VAULT PAGE COMPONENT
   ═══════════════════════════════════════════ */
export default function VaultPage() {
  // ── Core State ──
  var _phase = useState('lock');
  var phase = _phase[0]; var setPhase = _phase[1];
  var _masterPw = useState('');
  var masterPw = _masterPw[0]; var setMasterPw = _masterPw[1];
  var _shaking = useState(false);
  var shaking = _shaking[0]; var setShaking = _shaking[1];
  var _loading = useState(false);
  var loading = _loading[0]; var setLoading = _loading[1];
  var _unlockAnim = useState(false);
  var unlockAnim = _unlockAnim[0]; var setUnlockAnim = _unlockAnim[1];
  var _cryptoKey = useState(null);
  var cryptoKey = _cryptoKey[0]; var setCryptoKey = _cryptoKey[1];
  var _entries = useState([]);
  var entries = _entries[0]; var setEntries = _entries[1];
  var _activeCat = useState('all');
  var activeCat = _activeCat[0]; var setActiveCat = _activeCat[1];
  var _search = useState('');
  var search = _search[0]; var setSearch = _search[1];
  var _selected = useState(null);
  var selected = _selected[0]; var setSelected = _selected[1];
  var _revealed = useState({});
  var revealed = _revealed[0]; var setRevealed = _revealed[1];
  var _editing = useState(null);
  var editing = _editing[0]; var setEditing = _editing[1];
  var _view = useState('entries');
  var view = _view[0]; var setView = _view[1];
  var _sideOpen = useState(true);
  var sideOpen = _sideOpen[0]; var setSideOpen = _sideOpen[1];
  var _toasts = useState([]);
  var toasts = _toasts[0]; var setToasts = _toasts[1];
  var _genMode = useState('random');
  var genMode = _genMode[0]; var setGenMode = _genMode[1];
  var _genLen = useState(20);
  var genLen = _genLen[0]; var setGenLen = _genLen[1];
  var _genOpts = useState({ upper:true, lower:true, numbers:true, symbols:true });
  var genOpts = _genOpts[0]; var setGenOpts = _genOpts[1];
  var _genPW = useState(4);
  var genPhraseWords = _genPW[0]; var setGenPhraseWords = _genPW[1];
  var _genPS = useState('-');
  var genPhraseSep = _genPS[0]; var setGenPhraseSep = _genPS[1];
  var _genPC = useState(true);
  var genPhraseCap = _genPC[0]; var setGenPhraseCap = _genPC[1];
  var _genPN = useState(true);
  var genPhraseNum = _genPN[0]; var setGenPhraseNum = _genPN[1];
  var _genResult = useState('');
  var genResult = _genResult[0]; var setGenResult = _genResult[1];
  var _genHistory = useState([]);
  var genHistory = _genHistory[0]; var setGenHistory = _genHistory[1];
  var _totpCodes = useState({});
  var totpCodes = _totpCodes[0]; var setTotpCodes = _totpCodes[1];
  var _totpRem = useState(30);
  var totpRemaining = _totpRem[0]; var setTotpRemaining = _totpRem[1];
  var _auditLog = useState(AUDIT_SEED);
  var auditLog = _auditLog[0]; var setAuditLog = _auditLog[1];
  var _settings = useState({ autoLock:5, clipClear:30, favicons:true, compact:false });
  var settings = _settings[0]; var setSettings = _settings[1];
  var _failedAttempts = useState(0);
  var failedAttempts = _failedAttempts[0]; var setFailedAttempts = _failedAttempts[1];
  var _cooldown = useState(0);
  var cooldown = _cooldown[0]; var setCooldown = _cooldown[1];
  var _decEntries = useState([]);
  var decryptedEntries = _decEntries[0]; var setDecryptedEntries = _decEntries[1];

  var searchRef = useRef(null);
  var lockTimerRef = useRef(null);

  // ── Toast helper ──
  var toast = useCallback(function(msg, type) {
    var id = Date.now().toString();
    setToasts(function(prev) { return prev.concat([{ id: id, msg: msg, type: type || 'success' }]); });
    setTimeout(function() {
      setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); });
    }, 2800);
  }, []);

  // ── Cooldown tick ──
  useEffect(function() {
    if (cooldown <= 0) return;
    var t = setInterval(function() {
      setCooldown(function(p) { return Math.max(0, p - 1); });
    }, 1000);
    return function() { clearInterval(t); };
  }, [cooldown]);

  // ── TOTP refresh ──
  useEffect(function() {
    if (phase !== 'vault') return;
    var refresh = async function() {
      var codes = {};
      var remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTotpRemaining(remaining);
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.payload && e.payload.totp_secret) {
          var r = await generateTOTP(e.payload.totp_secret);
          codes[e.id] = r.code;
        }
      }
      setTotpCodes(codes);
    };
    refresh();
    var t = setInterval(refresh, 1000);
    return function() { clearInterval(t); };
  }, [phase, entries]);

  // ── Auto-lock ──
  useEffect(function() {
    if (phase !== 'vault' || settings.autoLock === 0) return;
    var resetTimer = function() {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(function() { handleLock(); }, settings.autoLock * 60000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return function() {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(lockTimerRef.current);
    };
  }, [phase, settings.autoLock]);

  // ── Keyboard shortcuts ──
  useEffect(function() {
    if (phase !== 'vault') return;
    var handler = function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); if (searchRef.current) searchRef.current.focus(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); handleNewEntry(); }
      if (e.key === 'Escape') handleLock();
    };
    window.addEventListener('keydown', handler);
    return function() { window.removeEventListener('keydown', handler); };
  }, [phase]);

  // ── Gen password on option change ──
  useEffect(function() {
    if (genMode === 'random') setGenResult(genPassword(genLen, genOpts));
    else setGenResult(genPassphrase(genPhraseWords, genPhraseSep, genPhraseCap, genPhraseNum));
  }, [genMode, genLen, genOpts, genPhraseWords, genPhraseSep, genPhraseCap, genPhraseNum]);

  // ── Decrypt entries for display ──
  useEffect(function() {
    if (phase !== 'vault' || !entries.length) return;
    Promise.all(entries.map(async function(e) {
      try {
        var p = cryptoKey ? JSON.parse(await decryptData(cryptoKey, e.encrypted_payload)) : e.payload;
        return Object.assign({}, e, { payload: p });
      } catch (err) {
        return Object.assign({}, e);
      }
    })).then(setDecryptedEntries);
  }, [entries, cryptoKey, phase]);

  // ── Filtered list ──
  var filtered = useMemo(function() {
    return decryptedEntries.filter(function(e) {
      var matchCat = activeCat === 'all' || e.cat === activeCat;
      var q = search.toLowerCase();
      var p = e.payload || {};
      var matchSearch = !q ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.username || '').toLowerCase().includes(q) ||
        (p.url || '').toLowerCase().includes(q) ||
        (p.service || '').toLowerCase().includes(q) ||
        (p.ssid || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [decryptedEntries, activeCat, search]);

  var selectedEntry = decryptedEntries.find(function(e) { return e.id === selected; });

  // ── Security Score ──
  var securityScore = useMemo(function() {
    if (!decryptedEntries.length) return { score: 0, weak: 0, reused: 0, totp: 0, total: 0 };
    var passwords = decryptedEntries.filter(function(e) { return e.payload && e.payload.password; }).map(function(e) { return e.payload.password; });
    var weak = passwords.filter(function(p) { return getStrength(p).pct <= 40; }).length;
    var seen = {};
    var reused = 0;
    passwords.forEach(function(p) { seen[p] = (seen[p] || 0) + 1; });
    Object.values(seen).forEach(function(c) { if (c > 1) reused += c; });
    var withTotp = decryptedEntries.filter(function(e) { return e.payload && e.payload.totp_secret; }).length;
    var loginCount = decryptedEntries.filter(function(e) { return e.type === 'login'; }).length;
    var score = 100;
    if (passwords.length) score -= (weak / passwords.length) * 30;
    if (passwords.length) score -= (reused / passwords.length) * 30;
    if (loginCount) score -= ((loginCount - withTotp) / loginCount) * 20;
    return { score: Math.max(0, Math.round(score)), weak: weak, reused: reused, totp: withTotp, total: decryptedEntries.length };
  }, [decryptedEntries]);

  // ── Handlers ──
  function addAudit(action, meta, entryId) {
    setAuditLog(function(prev) {
      return [{ id: Date.now().toString(), action: action, ts: Date.now(), meta: meta, entryId: entryId }].concat(prev);
    });
  }

  async function handleUnlock() {
    if (cooldown > 0 || !masterPw.trim()) return;
    setLoading(true);
    try {
      var key = await deriveKey(masterPw, 'shiftpro-vault-demo');
      var enc = await Promise.all(DEMO_ENTRIES.map(async function(e) {
        return Object.assign({}, e, { encrypted_payload: await encryptData(key, JSON.stringify(e.payload)) });
      }));
      setEntries(enc);
      setCryptoKey(key);
      setFailedAttempts(0);
      addAudit('unlock', 'Master password verified');
      setUnlockAnim(true);
      setTimeout(function() { setPhase('vault'); setLoading(false); setUnlockAnim(false); }, 700);
    } catch (err) {
      var fa = failedAttempts + 1;
      setFailedAttempts(fa);
      if (fa >= 5) {
        var delays = [30, 60, 300, 900];
        setCooldown(delays[Math.min(fa - 5, 3)]);
      }
      setShaking(true);
      setLoading(false);
      setTimeout(function() { setShaking(false); }, 500);
    }
  }

  function handleLock() {
    setPhase('lock'); setMasterPw(''); setCryptoKey(null); setEntries([]);
    setSelected(null); setEditing(null); setRevealed({});
    setView('entries'); setSearch(''); setDecryptedEntries([]);
  }

  async function handleCopy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast(label + ' copied!');
      if (settings.clipClear > 0) {
        setTimeout(function() { navigator.clipboard.writeText(''); }, settings.clipClear * 1000);
      }
    } catch (err) { toast('Copy failed', 'error'); }
  }

  async function handleReveal(id) {
    if (revealed[id]) {
      setRevealed(function(p) { var n = Object.assign({}, p); delete n[id]; return n; });
      return;
    }
    var entry = entries.find(function(e) { return e.id === id; });
    if (!entry || !cryptoKey) return;
    try {
      var payload = JSON.parse(await decryptData(cryptoKey, entry.encrypted_payload));
      var val = payload.password || payload.cvv || payload.api_key || '';
      setRevealed(function(p) { var n = Object.assign({}, p); n[id] = val; return n; });
      addAudit('entry_viewed', payload.title, id);
      setTimeout(function() {
        setRevealed(function(p) { var n = Object.assign({}, p); delete n[id]; return n; });
      }, 8000);
    } catch (err) { toast('Decryption error', 'error'); }
  }

  function handleNewEntry() {
    setEditing({
      id: Date.now().toString(), type: 'login',
      cat: activeCat === 'all' ? 'personal' : activeCat,
      fav: false,
      payload: { title: '', username: '', password: '', url: '', notes: '' },
      isNew: true,
    });
    setSelected(null);
    setView('entries');
  }

  async function handleSaveEntry() {
    if (!editing || !cryptoKey) return;
    var encPayload = await encryptData(cryptoKey, JSON.stringify(editing.payload));
    var saved = Object.assign({}, editing, { encrypted_payload: encPayload });
    delete saved.isNew;
    if (entries.find(function(e) { return e.id === saved.id; })) {
      setEntries(function(prev) { return prev.map(function(e) { return e.id === saved.id ? saved : e; }); });
      addAudit('entry_edited', editing.payload.title, saved.id);
    } else {
      setEntries(function(prev) { return prev.concat([saved]); });
      addAudit('entry_created', editing.payload.title, saved.id);
    }
    setEditing(null);
    setSelected(saved.id);
    toast('Entry encrypted & saved');
  }

  function handleDeleteEntry(id) {
    var e = decryptedEntries.find(function(x) { return x.id === id; });
    setEntries(function(prev) { return prev.filter(function(x) { return x.id !== id; }); });
    setSelected(null);
    addAudit('entry_deleted', e && e.payload ? e.payload.title : 'Unknown', id);
    toast('Entry deleted');
  }

  function handleRegenerate() {
    var pw;
    if (genMode === 'random') pw = genPassword(genLen, genOpts);
    else pw = genPassphrase(genPhraseWords, genPhraseSep, genPhraseCap, genPhraseNum);
    setGenResult(pw);
    setGenHistory(function(prev) { return [pw].concat(prev).slice(0, 10); });
  }

  function getTypeInfo(t) { return ENTRY_TYPES.find(function(x) { return x.id === t; }) || ENTRY_TYPES[0]; }

  // ═══════════════════════════════════════════
  // RENDER — LOCK SCREEN
  // ═══════════════════════════════════════════
  if (phase === 'lock') {
    var particles = [];
    for (var i = 0; i < 24; i++) {
      var colors = [C.gold, C.teal, '#3b82f6', '#a855f7'];
      particles.push(
        <div key={i} style={{
          position:'absolute', width: 3 + (i % 4) * 2, height: 3 + (i % 4) * 2,
          borderRadius:'50%', background: colors[i % 4],
          opacity: 0.08 + (i % 6) * 0.03,
          left: ((i * 13 + 7) % 100) + '%',
          top: ((i * 19 + 5) % 100) + '%',
          animation: 'fadeIn ' + (3 + (i % 3)) + 's ease-in-out infinite alternate',
          animationDelay: (i * 0.2) + 's',
        }} />
      );
    }

    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 25% 15%, ' + C.navyL + ' 0%, ' + C.navy + ' 55%, #060a12 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT.body, overflow: 'hidden', position: 'relative',
      }}>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        {particles}

        <div style={{
          background: 'linear-gradient(150deg, ' + C.navyL + ', ' + C.navy + ')',
          border: '1px solid ' + C.border,
          borderRadius: 24, padding: '44px 40px', width: 440, maxWidth: '92vw',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          animation: unlockAnim ? 'vaultOpen 0.7s ease forwards' : shaking ? 'shake 0.4s ease' : 'fadeUp 0.5s ease',
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%', margin: '0 auto 22px',
            background: 'linear-gradient(135deg, ' + C.gold + '20, ' + C.teal + '20)',
            border: '2px solid ' + C.gold + '40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 3s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 40 }}>🔐</span>
          </div>

          <h1 style={{ fontFamily: FONT.display, fontSize: 27, color: C.txt, margin: '0 0 5px', letterSpacing: -0.5 }}>
            ShiftPro <span style={{ color: C.gold }}>Vault</span>
          </h1>
          <p style={{ color: C.txt2, fontSize: 13, margin: '0 0 28px', lineHeight: 1.5 }}>
            Your passwords, encrypted & safe.<br/>Enter your master password to unlock.
          </p>

          <div style={{ position: 'relative', marginBottom: 18 }}>
            <input
              type="password" placeholder="Master Password" value={masterPw}
              onChange={function(e) { setMasterPw(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') handleUnlock(); }}
              style={{
                width: '100%', padding: '13px 44px 13px 16px', fontSize: 15,
                fontFamily: FONT.mono, background: C.navyM,
                border: '1px solid ' + C.border, borderRadius: 11, color: C.txt,
              }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.35 }}>🔑</span>
          </div>

          {masterPw && (
            <div style={{ marginBottom: 16, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.border, overflow: 'hidden' }}>
                  <div style={{ width: getStrength(masterPw).pct + '%', height: '100%', background: getStrength(masterPw).color, borderRadius: 2, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: getStrength(masterPw).color }}>{getStrength(masterPw).label}</span>
              </div>
              <div style={{ fontSize: 10, color: C.txt3, textAlign: 'left' }}>Crack time: ~{getStrength(masterPw).time}</div>
            </div>
          )}

          {cooldown > 0 && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: C.danger + '12', border: '1px solid ' + C.danger + '30', borderRadius: 10 }}>
              <p style={{ color: C.danger, fontSize: 12, margin: 0, fontWeight: 600 }}>Too many attempts. Try again in {cooldown}s</p>
            </div>
          )}

          <button
            onClick={handleUnlock}
            disabled={loading || cooldown > 0}
            style={Object.assign({}, btnBase, {
              width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 15,
              background: (loading || cooldown > 0) ? C.gold + '66' : 'linear-gradient(135deg, ' + C.gold + ', #d4a03a)',
              color: C.navy, borderRadius: 11, boxShadow: '0 4px 18px ' + C.gold + '30',
            })}
          >
            {loading
              ? <span style={{ width: 18, height: 18, border: '2px solid ' + C.navy, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.5s linear infinite', display: 'inline-block' }} />
              : 'Unlock Vault'
            }
          </button>

          <div style={{ marginTop: 24, padding: '12px 16px', background: C.teal + '08', border: '1px solid ' + C.teal + '18', borderRadius: 10 }}>
            <p style={{ color: C.teal, fontSize: 10, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              🛡️ AES-256-GCM · PBKDF2 600K iterations · Zero-knowledge<br/>
              ⌨️ Your master password never leaves this device
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER — MAIN VAULT
  // ═══════════════════════════════════════════
  var catInfo = CATEGORIES.find(function(c) { return c.id === activeCat; }) || CATEGORIES[0];

  function renderNavItem(icon, label, viewId, badge) {
    return (
      <div
        onClick={function() { setView(viewId); setSelected(null); setEditing(null); }}
        style={{
          display: 'flex', alignItems: 'center', gap: sideOpen ? 10 : 0,
          padding: sideOpen ? '9px 14px' : '9px 0',
          justifyContent: sideOpen ? 'flex-start' : 'center',
          borderRadius: 9, cursor: 'pointer', marginBottom: 1,
          background: view === viewId ? C.gold + '12' : 'transparent',
          borderLeft: view === viewId ? '3px solid ' + C.gold : '3px solid transparent',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        {sideOpen && <span style={{ fontSize: 12, fontWeight: view === viewId ? 600 : 400, color: view === viewId ? C.txt : C.txt2, whiteSpace: 'nowrap', flex: 1 }}>{label}</span>}
        {sideOpen && badge > 0 && <span style={{ fontSize: 10, fontWeight: 600, background: C.gold + '18', color: C.gold, padding: '1px 7px', borderRadius: 8 }}>{badge}</span>}
      </div>
    );
  }

  // ── Field components for view/edit ──
  function ViewField(props) {
    var label = props.label, icon = props.icon, value = props.value, hidden = props.hidden, mono = props.mono, copyLabel = props.copyLabel, entryId = props.entryId, onReveal = props.onReveal;
    return (
      <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 11, border: '1px solid ' + C.border, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</div>
          <div style={{
            fontSize: 13, color: hidden ? C.txt2 : C.txt,
            fontFamily: mono ? FONT.mono : FONT.body,
            marginTop: 2,
            letterSpacing: hidden && !revealed[entryId] ? 3 : 0,
            wordBreak: 'break-all',
          }}>
            {hidden ? (revealed[entryId] || '••••••••••••') : (value || '—')}
          </div>
        </div>
        {hidden && <span style={{ cursor: 'pointer', fontSize: 13, padding: 5, borderRadius: 6, background: C.teal + '10' }} onClick={onReveal}>{revealed[entryId] ? '🙈' : '👁️'}</span>}
        {(value || revealed[entryId]) && (
          <span style={{ cursor: 'pointer', fontSize: 13, padding: 5, borderRadius: 6, background: C.gold + '10' }}
            onClick={function() { handleCopy(hidden ? revealed[entryId] : value, copyLabel || label); }}>📋</span>
        )}
      </div>
    );
  }

  function EditInput(props) {
    var label = props.label, icon = props.icon, pKey = props.pKey, mono = props.mono, placeholder = props.placeholder || '', type = props.type || 'text';
    var val = editing && editing.payload ? editing.payload[pKey] || '' : '';
    function handleChange(e) {
      setEditing(function(prev) {
        var newPayload = Object.assign({}, prev.payload);
        newPayload[pKey] = e.target.value;
        return Object.assign({}, prev, { payload: newPayload });
      });
    }
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>{icon} {label}</label>
        {type === 'textarea' ? (
          <textarea value={val} onChange={handleChange} placeholder={placeholder} rows={4}
            style={{ width: '100%', padding: '10px 13px', fontSize: 13, fontFamily: mono ? FONT.mono : FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt, resize: 'vertical' }} />
        ) : (
          <input type={type} value={val} onChange={handleChange} placeholder={placeholder}
            style={{ width: '100%', padding: '10px 13px', fontSize: 13, fontFamily: mono ? FONT.mono : FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }} />
        )}
      </div>
    );
  }

  // ── Entry detail renderer ──
  function renderEntryView(entry) {
    var p = entry.payload || {};
    var t = entry.type;
    var revealFn = function() { handleReveal(entry.id); };

    if (t === 'login') {
      return (
        <>
          <ViewField label="Username" icon="👤" value={p.username} copyLabel="Username" />
          <ViewField label="Password" icon="🔑" hidden mono entryId={entry.id} onReveal={revealFn} />
          {p.url && <ViewField label="URL" icon="🔗" value={p.url} copyLabel="URL" />}
          {p.totp_secret && totpCodes[entry.id] && (
            <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 11, border: '1px solid ' + C.border, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>🔢</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2 }}>TOTP Code</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: FONT.mono, color: C.gold, letterSpacing: 6, marginTop: 2 }}>{totpCodes[entry.id]}</div>
              </div>
              <svg width="36" height="36" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke={C.border} strokeWidth="3"/>
                <circle cx="20" cy="20" r="16" fill="none"
                  stroke={totpRemaining > 10 ? C.teal : totpRemaining > 5 ? C.gold : C.danger}
                  strokeWidth="3" strokeDasharray="100.5"
                  strokeDashoffset={100.5 * (1 - totpRemaining / 30)}
                  strokeLinecap="round" transform="rotate(-90 20 20)"
                  style={{ transition: 'stroke-dashoffset 0.3s linear' }}/>
                <text x="20" y="24" textAnchor="middle" fill={C.txt} fontSize="11" fontFamily={FONT.mono}>{totpRemaining}</text>
              </svg>
              <span style={{ cursor: 'pointer', fontSize: 13, padding: 5, borderRadius: 6, background: C.gold + '10' }}
                onClick={function() { handleCopy(totpCodes[entry.id], 'TOTP Code'); }}>📋</span>
            </div>
          )}
        </>
      );
    }
    if (t === 'card') {
      return (
        <>
          <ViewField label="Cardholder" icon="👤" value={p.cardholder_name} />
          <ViewField label="Card Number" icon="💳" value={p.card_number} mono />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><ViewField label="Expiry" icon="📅" value={p.expiry} /></div>
            <div style={{ flex: 1 }}><ViewField label="CVV" icon="🔒" hidden mono entryId={entry.id} onReveal={revealFn} /></div>
          </div>
          <ViewField label="Billing ZIP" icon="📍" value={p.billing_zip} />
        </>
      );
    }
    if (t === 'identity') {
      return (
        <>
          <ViewField label="Name" icon="👤" value={[p.first_name, p.last_name].filter(Boolean).join(' ')} />
          {p.company && <ViewField label="Company" icon="🏢" value={p.company} />}
          {p.email && <ViewField label="Email" icon="📧" value={p.email} />}
          {p.phone && <ViewField label="Phone" icon="📞" value={p.phone} />}
          {p.address_line1 && <ViewField label="Address" icon="📍" value={[p.address_line1, p.city, p.state, p.zip].filter(Boolean).join(', ')} />}
        </>
      );
    }
    if (t === 'secure_note') {
      return (
        <div style={{ padding: '14px 16px', background: C.surface, borderRadius: 11, border: '1px solid ' + C.border, marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>📝 Content</div>
          <pre style={{ fontSize: 13, color: C.txt, fontFamily: FONT.body, whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{p.content}</pre>
        </div>
      );
    }
    if (t === 'wifi') {
      return (
        <>
          <ViewField label="Network (SSID)" icon="📶" value={p.ssid} copyLabel="SSID" />
          <ViewField label="Password" icon="🔑" hidden mono entryId={entry.id} onReveal={revealFn} />
          <ViewField label="Security" icon="🔒" value={p.security_type} />
        </>
      );
    }
    if (t === 'api_key') {
      return (
        <>
          <ViewField label="Service" icon="🌐" value={p.service} />
          <ViewField label="API Key" icon="🔑" hidden mono entryId={entry.id} onReveal={revealFn} />
          {p.endpoint && <ViewField label="Endpoint" icon="🔗" value={p.endpoint} copyLabel="Endpoint" />}
        </>
      );
    }
    return null;
  }

  function renderEntryEdit() {
    if (!editing) return null;
    var t = editing.type;
    return (
      <>
        <EditInput label="Title" icon="📌" pKey="title" placeholder="Entry name" />
        {t === 'login' && (
          <>
            <EditInput label="Username / Email" icon="👤" pKey="username" placeholder="user@example.com" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🔑 Password</label>
              <input value={editing.payload.password || ''} onChange={function(e) {
                setEditing(function(prev) { return Object.assign({}, prev, { payload: Object.assign({}, prev.payload, { password: e.target.value }) }); });
              }} style={{ width: '100%', padding: '10px 13px', fontSize: 13, fontFamily: FONT.mono, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }} />
              <button onClick={function() {
                setEditing(function(prev) { return Object.assign({}, prev, { payload: Object.assign({}, prev.payload, { password: genPassword(genLen, genOpts) }) }); });
              }} style={Object.assign({}, btnBase, { marginTop: 5, padding: '5px 11px', fontSize: 11, background: C.teal + '12', color: C.teal, border: '1px solid ' + C.teal + '22' })}>⚡ Generate</button>
            </div>
            <EditInput label="URL" icon="🔗" pKey="url" placeholder="https://..." />
            <EditInput label="TOTP Secret" icon="🔢" pKey="totp_secret" placeholder="Base32 secret (optional)" mono />
          </>
        )}
        {t === 'card' && (
          <>
            <EditInput label="Cardholder Name" icon="👤" pKey="cardholder_name" />
            <EditInput label="Card Number" icon="💳" pKey="card_number" mono />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><EditInput label="Expiry" icon="📅" pKey="expiry" placeholder="MM/YY" /></div>
              <div style={{ flex: 1 }}><EditInput label="CVV" icon="🔒" pKey="cvv" mono /></div>
            </div>
            <EditInput label="Billing ZIP" icon="📍" pKey="billing_zip" />
          </>
        )}
        {t === 'identity' && (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><EditInput label="First Name" icon="👤" pKey="first_name" /></div>
              <div style={{ flex: 1 }}><EditInput label="Last Name" icon="👤" pKey="last_name" /></div>
            </div>
            <EditInput label="Company" icon="🏢" pKey="company" />
            <EditInput label="Email" icon="📧" pKey="email" />
            <EditInput label="Phone" icon="📞" pKey="phone" />
            <EditInput label="Address" icon="📍" pKey="address_line1" />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><EditInput label="City" icon="🏙️" pKey="city" /></div>
              <div style={{ flex: 1 }}><EditInput label="State" icon="🗺️" pKey="state" /></div>
              <div style={{ flex: 1 }}><EditInput label="ZIP" icon="📮" pKey="zip" /></div>
            </div>
          </>
        )}
        {t === 'secure_note' && <EditInput label="Content" icon="📝" pKey="content" type="textarea" placeholder="Your secure note..." />}
        {t === 'wifi' && (
          <>
            <EditInput label="SSID" icon="📶" pKey="ssid" />
            <EditInput label="Password" icon="🔑" pKey="password" mono />
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🔒 Security</label>
              <select value={editing.payload.security_type || 'WPA2'} onChange={function(e) {
                setEditing(function(prev) { return Object.assign({}, prev, { payload: Object.assign({}, prev.payload, { security_type: e.target.value }) }); });
              }} style={{ width: '100%', padding: '10px 13px', fontSize: 13, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }}>
                <option value="WPA2">WPA2</option>
                <option value="WPA3">WPA3</option>
                <option value="WEP">WEP</option>
                <option value="None">Open</option>
              </select>
            </div>
          </>
        )}
        {t === 'api_key' && (
          <>
            <EditInput label="Service" icon="🌐" pKey="service" />
            <EditInput label="API Key" icon="🔑" pKey="api_key" mono />
            <EditInput label="API Secret" icon="🔐" pKey="api_secret" mono />
            <EditInput label="Endpoint" icon="🔗" pKey="endpoint" placeholder="https://api.example.com" />
          </>
        )}
        <EditInput label="Notes" icon="📝" pKey="notes" type="textarea" placeholder="Optional notes..." />
      </>
    );
  }

  // ═══ MAIN VAULT RENDER ═══
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, ' + C.navy + ', #060a12)', fontFamily: FONT.body, color: C.txt, display: 'flex' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ═══ SIDEBAR ═══ */}
      <div style={{
        width: sideOpen ? 248 : 58, minHeight: '100vh', background: C.navyL,
        borderRight: '1px solid ' + C.border, transition: 'width 0.25s ease',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ padding: sideOpen ? '16px 18px 14px' : '16px 10px 14px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={function() { setSideOpen(!sideOpen); }}>
          <span style={{ fontSize: 22 }}>🔐</span>
          {sideOpen && <span style={{ fontFamily: FONT.display, fontSize: 16, color: C.txt, whiteSpace: 'nowrap' }}>ShiftPro <span style={{ color: C.gold }}>Vault</span></span>}
        </div>

        <div style={{ padding: '8px 6px', flex: 1, overflowY: 'auto' }}>
          {sideOpen && <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.5, padding: '6px 12px 6px' }}>Views</div>}
          {renderNavItem('📊', 'Dashboard', 'dashboard', 0)}
          {renderNavItem('🔑', 'All Entries', 'entries', decryptedEntries.length)}
          {renderNavItem('⚡', 'Generator', 'generator', 0)}
          {renderNavItem('📥', 'Import / Export', 'import', 0)}
          {renderNavItem('📜', 'Audit Log', 'audit', auditLog.length)}
          {renderNavItem('⚙️', 'Settings', 'settings', 0)}

          {sideOpen && <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.5, padding: '14px 12px 6px' }}>Categories</div>}
          {CATEGORIES.map(function(cat, idx) {
            var isActive = activeCat === cat.id && view === 'entries';
            var count = cat.id === 'all' ? decryptedEntries.length : decryptedEntries.filter(function(e) { return e.cat === cat.id; }).length;
            return (
              <div key={cat.id}
                onClick={function() { setActiveCat(cat.id); setView('entries'); setSelected(null); setEditing(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: sideOpen ? 9 : 0,
                  padding: sideOpen ? '8px 12px' : '8px 0',
                  justifyContent: sideOpen ? 'flex-start' : 'center',
                  borderRadius: 9, cursor: 'pointer', marginBottom: 1,
                  background: isActive ? cat.color + '12' : 'transparent',
                  borderLeft: isActive ? '3px solid ' + cat.color : '3px solid transparent',
                  transition: 'all 0.15s',
                  animation: 'slideIn 0.25s ease ' + (idx * 0.03) + 's both',
                }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{cat.icon}</span>
                {sideOpen && (
                  <>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? C.txt : C.txt2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{cat.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? cat.color : C.txt3, background: isActive ? cat.color + '18' : C.txt3 + '12', padding: '1px 7px', borderRadius: 8 }}>{count}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '10px 6px', borderTop: '1px solid ' + C.border }}>
          <div onClick={handleLock} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', justifyContent: sideOpen ? 'flex-start' : 'center', background: C.danger + '08', transition: 'all 0.2s' }}>
            <span style={{ fontSize: 15 }}>🔒</span>
            {sideOpen && <span style={{ fontSize: 12, color: C.danger, fontWeight: 600 }}>Lock Vault</span>}
          </div>
        </div>
      </div>

      {/* ═══ MAIN AREA ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ padding: '12px 22px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 14, background: C.navyL + '80', backdropFilter: 'blur(10px)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.35 }}>🔍</span>
            <input ref={searchRef} placeholder="Search vault... (⌘F)" value={search}
              onChange={function(e) { setSearch(e.target.value); }}
              style={{ width: '100%', maxWidth: 380, padding: '9px 12px 9px 36px', fontSize: 13, fontFamily: FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 9, color: C.txt }} />
          </div>
          <button onClick={handleNewEntry} style={Object.assign({}, btnBase, { padding: '9px 16px', background: 'linear-gradient(135deg, ' + C.gold + ', #d4a03a)', color: C.navy, boxShadow: '0 2px 10px ' + C.gold + '28' })}>+ New Entry</button>
        </div>

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: FONT.display, fontSize: 24, margin: '0 0 24px' }}>Security Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 28 }}>
              <div style={{ padding: '22px 20px', background: C.surface, borderRadius: 14, border: '1px solid ' + C.border, textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 12px' }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" fill="none" stroke={C.border} strokeWidth="6"/>
                    <circle cx="45" cy="45" r="38" fill="none"
                      stroke={securityScore.score >= 80 ? C.teal : securityScore.score >= 60 ? C.gold : C.danger}
                      strokeWidth="6" strokeDasharray={238.76}
                      strokeDashoffset={238.76 * (1 - securityScore.score / 100)}
                      strokeLinecap="round" transform="rotate(-90 45 45)"
                      style={{ transition: 'all 0.8s ease' }}/>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 26, fontWeight: 700, fontFamily: FONT.mono, color: securityScore.score >= 80 ? C.teal : securityScore.score >= 60 ? C.gold : C.danger }}>{securityScore.score}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Security Score</div>
              </div>
              {[
                { label: 'Total Entries', value: securityScore.total, icon: '🔐', color: C.gold },
                { label: 'Weak Passwords', value: securityScore.weak, icon: '⚠️', color: securityScore.weak ? C.danger : C.teal },
                { label: 'Reused', value: securityScore.reused, icon: '🔄', color: securityScore.reused ? C.danger : C.teal },
                { label: 'TOTP Enabled', value: securityScore.totp, icon: '🔢', color: C.teal },
              ].map(function(s, i) {
                return (
                  <div key={i} style={{ padding: '18px 16px', background: C.surface, borderRadius: 14, border: '1px solid ' + C.border }}>
                    <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: FONT.mono, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.txt2, marginTop: 2 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
            {securityScore.weak > 0 && <div style={{ padding: '12px 16px', background: C.danger + '08', border: '1px solid ' + C.danger + '20', borderRadius: 11, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}><span>⚠️</span><span style={{ fontSize: 13 }}><strong>{securityScore.weak}</strong> entries have weak passwords</span></div>}
            {securityScore.reused > 0 && <div style={{ padding: '12px 16px', background: C.danger + '08', border: '1px solid ' + C.danger + '20', borderRadius: 11, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}><span>🔄</span><span style={{ fontSize: 13 }}><strong>{securityScore.reused}</strong> passwords are reused</span></div>}
            {securityScore.weak === 0 && securityScore.reused === 0 && <div style={{ padding: '12px 16px', background: C.teal + '08', border: '1px solid ' + C.teal + '20', borderRadius: 11, display: 'flex', alignItems: 'center', gap: 10 }}><span>✅</span><span style={{ fontSize: 13, color: C.teal }}>No security alerts — nice work!</span></div>}
          </div>
        )}

        {/* ── GENERATOR ── */}
        {view === 'generator' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: FONT.display, fontSize: 24, margin: '0 0 24px' }}>Password Generator</h2>
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.navyM, borderRadius: 10, padding: 3, border: '1px solid ' + C.border }}>
                {[['random', '🎲 Random'], ['passphrase', '📖 Passphrase']].map(function(m) {
                  return <button key={m[0]} onClick={function() { setGenMode(m[0]); }}
                    style={Object.assign({}, btnBase, { flex: 1, justifyContent: 'center', padding: '9px 16px', borderRadius: 8, background: genMode === m[0] ? C.gold + '18' : 'transparent', color: genMode === m[0] ? C.gold : C.txt2, border: genMode === m[0] ? '1px solid ' + C.gold + '30' : '1px solid transparent' })}>{m[1]}</button>;
                })}
              </div>
              <div style={{ padding: '16px 18px', background: C.surface, borderRadius: 12, border: '1px solid ' + C.border, marginBottom: 16 }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.gold, letterSpacing: 0.5, wordBreak: 'break-all', lineHeight: 1.5, marginBottom: 10 }}>{genResult}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
                    <div style={{ width: getStrength(genResult).pct + '%', height: '100%', background: getStrength(genResult).color, borderRadius: 3, transition: 'all 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: getStrength(genResult).color }}>{getStrength(genResult).label}</span>
                  <span style={{ fontSize: 10, color: C.txt3 }}>~{getStrength(genResult).time}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button onClick={handleRegenerate} style={Object.assign({}, btnBase, { flex: 1, justifyContent: 'center', padding: '10px', background: C.teal + '12', color: C.teal, border: '1px solid ' + C.teal + '25' })}>🔄 Regenerate</button>
                <button onClick={function() { handleCopy(genResult, 'Password'); }} style={Object.assign({}, btnBase, { flex: 1, justifyContent: 'center', padding: '10px', background: C.gold + '12', color: C.gold, border: '1px solid ' + C.gold + '25' })}>📋 Copy</button>
              </div>
              {genMode === 'random' ? (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.txt2, marginBottom: 14 }}>
                    Length <input type="range" min={8} max={128} value={genLen} onChange={function(e) { setGenLen(+e.target.value); }} style={{ flex: 1, accentColor: C.teal }} />
                    <span style={{ color: C.teal, fontWeight: 700, fontFamily: FONT.mono, fontSize: 14, minWidth: 30 }}>{genLen}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['upper','A-Z'],['lower','a-z'],['numbers','0-9'],['symbols','!@#']].map(function(pair) {
                      var k = pair[0]; var l = pair[1];
                      return <label key={k} onClick={function() { setGenOpts(function(p) { var n = Object.assign({}, p); n[k] = !p[k]; return n; }); }}
                        style={Object.assign({}, btnBase, { padding: '7px 14px', fontSize: 12, cursor: 'pointer', background: genOpts[k] ? C.teal + '12' : 'transparent', color: genOpts[k] ? C.teal : C.txt3, border: '1px solid ' + (genOpts[k] ? C.teal + '28' : C.border) })}>{l}</label>;
                    })}
                  </div>
                </>
              ) : (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.txt2, marginBottom: 14 }}>
                    Words <input type="range" min={3} max={8} value={genPhraseWords} onChange={function(e) { setGenPhraseWords(+e.target.value); }} style={{ flex: 1, accentColor: C.teal }} />
                    <span style={{ color: C.teal, fontWeight: 700, fontFamily: FONT.mono }}>{genPhraseWords}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: C.txt2 }}>Separator:</span>
                    {['-','_','.','+','~'].map(function(s) {
                      return <button key={s} onClick={function() { setGenPhraseSep(s); }}
                        style={Object.assign({}, btnBase, { padding: '5px 12px', fontSize: 13, fontFamily: FONT.mono, background: genPhraseSep === s ? C.teal + '15' : 'transparent', color: genPhraseSep === s ? C.teal : C.txt3, border: '1px solid ' + (genPhraseSep === s ? C.teal + '28' : C.border) })}>{s}</button>;
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label onClick={function() { setGenPhraseCap(!genPhraseCap); }} style={Object.assign({}, btnBase, { padding: '7px 14px', fontSize: 12, cursor: 'pointer', background: genPhraseCap ? C.teal + '12' : 'transparent', color: genPhraseCap ? C.teal : C.txt3, border: '1px solid ' + (genPhraseCap ? C.teal + '28' : C.border) })}>Capitalize</label>
                    <label onClick={function() { setGenPhraseNum(!genPhraseNum); }} style={Object.assign({}, btnBase, { padding: '7px 14px', fontSize: 12, cursor: 'pointer', background: genPhraseNum ? C.teal + '12' : 'transparent', color: genPhraseNum ? C.teal : C.txt3, border: '1px solid ' + (genPhraseNum ? C.teal + '28' : C.border) })}>+ Number</label>
                  </div>
                </>
              )}
              {genHistory.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Recent ({genHistory.length})</div>
                  {genHistory.map(function(pw, i) {
                    return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, marginBottom: 3, background: i === 0 ? C.gold + '06' : 'transparent' }}>
                      <span style={{ flex: 1, fontSize: 12, fontFamily: FONT.mono, color: C.txt2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pw}</span>
                      <span style={{ cursor: 'pointer', fontSize: 12 }} onClick={function() { handleCopy(pw, 'Password'); }}>📋</span>
                    </div>;
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AUDIT LOG ── */}
        {view === 'audit' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: FONT.display, fontSize: 24, margin: '0 0 24px' }}>Audit Log</h2>
            {auditLog.map(function(a, i) {
              return <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: i % 2 === 0 ? C.surface : 'transparent', borderRadius: 10, marginBottom: 2, animation: 'fadeUp 0.2s ease ' + (i * 0.03) + 's both' }}>
                <span style={{ fontSize: 18 }}>{AUDIT_ICONS[a.action] || '📌'}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{a.action.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); })}</span>
                  {a.meta && <span style={{ fontSize: 12, color: C.txt2, marginLeft: 8 }}>— {a.meta}</span>}
                </div>
                <span style={{ fontSize: 11, color: C.txt3, fontFamily: FONT.mono }}>{new Date(a.ts).toLocaleTimeString()}</span>
              </div>;
            })}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {view === 'settings' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: FONT.display, fontSize: 24, margin: '0 0 24px' }}>Vault Settings</h2>
            <div style={{ maxWidth: 480 }}>
              <div style={{ padding: '16px 18px', background: C.surface, borderRadius: 12, border: '1px solid ' + C.border, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>🔒 Auto-Lock Timeout</div><div style={{ fontSize: 11, color: C.txt2, marginTop: 2 }}>Lock vault after inactivity</div></div>
                  <select value={settings.autoLock} onChange={function(e) { setSettings(function(p) { return Object.assign({}, p, { autoLock: +e.target.value }); }); }} style={{ padding: '7px 12px', fontSize: 13, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 8, color: C.txt }}>
                    <option value={1}>1 min</option><option value={5}>5 min</option><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hour</option><option value={0}>Never</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: C.surface, borderRadius: 12, border: '1px solid ' + C.border, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>📋 Clipboard Auto-Clear</div><div style={{ fontSize: 11, color: C.txt2, marginTop: 2 }}>Clear clipboard after copying</div></div>
                  <select value={settings.clipClear} onChange={function(e) { setSettings(function(p) { return Object.assign({}, p, { clipClear: +e.target.value }); }); }} style={{ padding: '7px 12px', fontSize: 13, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 8, color: C.txt }}>
                    <option value={15}>15 sec</option><option value={30}>30 sec</option><option value={60}>60 sec</option><option value={90}>90 sec</option><option value={0}>Never</option>
                  </select>
                </div>
              </div>
              {[{ key: 'favicons', label: 'Show Favicons', desc: 'Display website icons', icon: '🌐' }, { key: 'compact', label: 'Compact View', desc: 'Denser entry list', icon: '📐' }].map(function(t) {
                return <div key={t.key} style={{ padding: '16px 18px', background: C.surface, borderRadius: 12, border: '1px solid ' + C.border, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t.icon} {t.label}</div><div style={{ fontSize: 11, color: C.txt2, marginTop: 2 }}>{t.desc}</div></div>
                    <div onClick={function() { setSettings(function(p) { var n = Object.assign({}, p); n[t.key] = !p[t.key]; return n; }); }}
                      style={{ width: 44, height: 24, borderRadius: 12, background: settings[t.key] ? C.teal : C.border, cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: settings[t.key] ? 23 : 3, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
                    </div>
                  </div>
                </div>;
              })}
              <div style={{ marginTop: 28, padding: '18px', background: C.danger + '06', border: '1px solid ' + C.danger + '20', borderRadius: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.danger, marginBottom: 4 }}>⚠️ Danger Zone</div>
                <div style={{ fontSize: 12, color: C.txt2, marginBottom: 12 }}>Permanently delete all vault data.</div>
                <button style={Object.assign({}, btnBase, { padding: '9px 18px', background: C.danger + '15', color: C.danger, border: '1px solid ' + C.danger + '30' })}>🗑️ Delete All Vault Data</button>
              </div>
            </div>
          </div>
        )}

        {/* ── IMPORT / EXPORT ── */}
        {view === 'import' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: FONT.display, fontSize: 24, margin: '0 0 24px' }}>Import & Export</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, maxWidth: 640 }}>
              <div style={{ padding: '22px 20px', background: C.surface, borderRadius: 14, border: '1px solid ' + C.border }}>
                <h3 style={{ fontFamily: FONT.display, fontSize: 18, margin: '0 0 12px' }}>📥 Import</h3>
                <p style={{ fontSize: 12, color: C.txt2, lineHeight: 1.5, marginBottom: 14 }}>Import from another manager or browser.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Chrome CSV','1Password CSV','LastPass CSV','Bitwarden JSON','RoboForm CSV','Firefox CSV','Generic CSV'].map(function(s) {
                    return <button key={s} onClick={function() { toast('Import: ' + s + ' — coming in Phase 2'); }}
                      style={Object.assign({}, btnBase, { padding: '8px 14px', fontSize: 12, background: C.teal + '08', color: C.teal, border: '1px solid ' + C.teal + '18', justifyContent: 'flex-start' })}>{s}</button>;
                  })}
                </div>
              </div>
              <div style={{ padding: '22px 20px', background: C.surface, borderRadius: 14, border: '1px solid ' + C.border }}>
                <h3 style={{ fontFamily: FONT.display, fontSize: 18, margin: '0 0 12px' }}>📦 Export</h3>
                <p style={{ fontSize: 12, color: C.txt2, lineHeight: 1.5, marginBottom: 14 }}>Download encrypted backup or CSV.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={function() { toast('Encrypted backup — Phase 2'); }} style={Object.assign({}, btnBase, { padding: '10px 14px', fontSize: 12, background: C.gold + '10', color: C.gold, border: '1px solid ' + C.gold + '25', justifyContent: 'flex-start' })}>🔒 Encrypted Backup (JSON)</button>
                  <button onClick={function() { toast('CSV export — Phase 2'); }} style={Object.assign({}, btnBase, { padding: '10px 14px', fontSize: 12, background: C.danger + '08', color: C.danger, border: '1px solid ' + C.danger + '20', justifyContent: 'flex-start' })}>⚠️ Unencrypted CSV</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ENTRIES VIEW ── */}
        {view === 'entries' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* List */}
            <div style={{ width: 320, borderRight: '1px solid ' + C.border, overflow: 'auto', flexShrink: 0 }}>
              <div style={{ padding: '12px 16px 6px', fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>{catInfo.icon}</span>{catInfo.label}
                <span style={{ marginLeft: 'auto', fontSize: 10, color: catInfo.color, background: catInfo.color + '14', padding: '1px 8px', borderRadius: 8 }}>{filtered.length}</span>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: '36px 18px', textAlign: 'center', animation: 'fadeIn 0.3s' }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>🏝️</span>
                  <p style={{ color: C.txt2, fontSize: 12 }}>No entries found</p>
                  <button onClick={handleNewEntry} style={Object.assign({}, btnBase, { marginTop: 6, padding: '7px 14px', fontSize: 12, background: C.gold + '12', color: C.gold, border: '1px solid ' + C.gold + '25' })}>+ Add Entry</button>
                </div>
              ) : filtered.map(function(entry, i) {
                var isSel = selected === entry.id;
                var cat = CATEGORIES.find(function(c) { return c.id === entry.cat; });
                var eType = getTypeInfo(entry.type);
                var faviconUrl = '';
                if (entry.type === 'login' && entry.payload && entry.payload.url && settings.favicons) {
                  try { faviconUrl = 'https://www.google.com/s2/favicons?domain=' + new URL(entry.payload.url.startsWith('http') ? entry.payload.url : 'https://' + entry.payload.url).hostname + '&sz=32'; } catch(e) {}
                }
                return (
                  <div key={entry.id} onClick={function() { setSelected(entry.id); setEditing(null); }}
                    style={{
                      padding: settings.compact ? '9px 16px' : '12px 16px', cursor: 'pointer',
                      borderLeft: isSel ? '3px solid ' + (cat ? cat.color : C.gold) : '3px solid transparent',
                      background: isSel ? (cat ? cat.color : C.gold) + '08' : 'transparent',
                      borderBottom: '1px solid ' + C.border + '30', transition: 'all 0.12s',
                      animation: 'fadeIn 0.15s ease ' + (i * 0.02) + 's both',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: (cat ? cat.color : C.gold) + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                        {faviconUrl
                          ? <img src={faviconUrl} alt="" style={{ width: 18, height: 18, borderRadius: 3 }} onError={function(e) { e.target.style.display = 'none'; }} />
                          : <span>{eType.icon}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {entry.payload ? entry.payload.title : 'Untitled'}
                          {entry.fav && <span style={{ fontSize: 10 }}>⭐</span>}
                          {entry.payload && entry.payload.totp_secret && <span style={{ fontSize: 9, background: C.teal + '15', color: C.teal, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>2FA</span>}
                        </div>
                        <div style={{ fontSize: 11, color: C.txt3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {entry.payload ? (entry.payload.username || entry.payload.ssid || entry.payload.service || entry.payload.cardholder_name || eType.label) : eType.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail / Edit */}
            <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px' }}>
              {editing ? (
                <div style={{ maxWidth: 500, animation: 'fadeUp 0.25s ease' }}>
                  <h2 style={{ fontFamily: FONT.display, fontSize: 21, margin: '0 0 18px' }}>{editing.isNew ? 'New Entry' : 'Edit Entry'}</h2>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 6 }}>📦 Entry Type</label>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {ENTRY_TYPES.map(function(t) {
                        return <button key={t.id} onClick={function() { setEditing(function(p) { return Object.assign({}, p, { type: t.id }); }); }}
                          style={Object.assign({}, btnBase, { padding: '6px 12px', fontSize: 11, background: editing.type === t.id ? C.gold + '15' : C.navyM, color: editing.type === t.id ? C.gold : C.txt3, border: '1px solid ' + (editing.type === t.id ? C.gold + '35' : C.border) })}>{t.icon} {t.label}</button>;
                      })}
                    </div>
                  </div>
                  {renderEntryEdit()}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 6 }}>🏷️ Category</label>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {CATEGORIES.filter(function(c) { return c.id !== 'all'; }).map(function(cat) {
                        return <button key={cat.id} onClick={function() { setEditing(function(p) { return Object.assign({}, p, { cat: cat.id }); }); }}
                          style={Object.assign({}, btnBase, { padding: '6px 12px', fontSize: 11, background: editing.cat === cat.id ? cat.color + '18' : C.navyM, color: editing.cat === cat.id ? cat.color : C.txt3, border: '1px solid ' + (editing.cat === cat.id ? cat.color + '35' : C.border) })}>{cat.icon} {cat.label}</button>;
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <button onClick={handleSaveEntry} style={Object.assign({}, btnBase, { padding: '10px 22px', background: 'linear-gradient(135deg, ' + C.gold + ', #d4a03a)', color: C.navy, boxShadow: '0 2px 10px ' + C.gold + '28' })}>🔒 Encrypt & Save</button>
                    <button onClick={function() { setEditing(null); }} style={Object.assign({}, btnBase, { padding: '10px 18px', background: C.txt3 + '12', color: C.txt2 })}>Cancel</button>
                  </div>
                </div>
              ) : selectedEntry ? (
                <div style={{ maxWidth: 500, animation: 'fadeUp 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: ((CATEGORIES.find(function(c) { return c.id === selectedEntry.cat; }) || {}).color || C.gold) + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {getTypeInfo(selectedEntry.type).icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontFamily: FONT.display, fontSize: 22, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {selectedEntry.payload ? selectedEntry.payload.title : 'Untitled'}
                        <span style={{ fontSize: 15, cursor: 'pointer', opacity: selectedEntry.fav ? 1 : 0.25 }}
                          onClick={function() { setEntries(function(prev) { return prev.map(function(e) { return e.id === selectedEntry.id ? Object.assign({}, e, { fav: !e.fav }) : e; }); }); }}>⭐</span>
                      </h2>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 6, background: ((CATEGORIES.find(function(c) { return c.id === selectedEntry.cat; }) || {}).color || C.gold) + '12', color: (CATEGORIES.find(function(c) { return c.id === selectedEntry.cat; }) || {}).color || C.gold }}>
                          {(CATEGORIES.find(function(c) { return c.id === selectedEntry.cat; }) || {}).label || 'Unknown'}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 6, background: C.txt3 + '12', color: C.txt3 }}>
                          {getTypeInfo(selectedEntry.type).label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {renderEntryView(selectedEntry)}
                  {selectedEntry.payload && selectedEntry.payload.notes && (
                    <div style={{ padding: '12px 14px', background: C.surface, borderRadius: 11, border: '1px solid ' + C.border, marginBottom: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>📝 Notes</div>
                      <div style={{ fontSize: 12, color: C.txt2, lineHeight: 1.5 }}>{selectedEntry.payload.notes}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                    <button onClick={function() { setEditing(Object.assign({}, selectedEntry)); }} style={Object.assign({}, btnBase, { padding: '8px 16px', background: C.gold + '10', color: C.gold, border: '1px solid ' + C.gold + '22' })}>✏️ Edit</button>
                    <button onClick={function() { handleDeleteEntry(selectedEntry.id); }} style={Object.assign({}, btnBase, { padding: '8px 16px', background: C.danger + '08', color: C.danger, border: '1px solid ' + C.danger + '20' })}>🗑️ Delete</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', animation: 'fadeIn 0.4s' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, ' + C.gold + '0c, ' + C.teal + '0c)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 40 }}>🛡️</div>
                  <h3 style={{ fontFamily: FONT.display, fontSize: 20, margin: '0 0 6px' }}>Select an entry</h3>
                  <p style={{ color: C.txt2, fontSize: 12, maxWidth: 260, lineHeight: 1.5 }}>
                    Choose a credential from the list, or press <span style={{ fontFamily: FONT.mono, background: C.navyM, padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>⌘N</span> to create one.
                  </p>
                  <div style={{ marginTop: 22, padding: '11px 16px', borderRadius: 10, background: C.navy, border: '1px solid ' + C.border, fontSize: 10, color: C.txt3, lineHeight: 1.7 }}>
                    🛡️ AES-256-GCM · PBKDF2 600K · Zero-knowledge<br/>
                    🔑 6 entry types · TOTP · Password history<br/>
                    📦 Import from Chrome, 1Password, LastPass & more
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ TOASTS ═══ */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 6, alignItems: 'center' }}>
        {toasts.map(function(t) {
          return <div key={t.id} style={{
            padding: '9px 20px', borderRadius: 11,
            background: t.type === 'error' ? C.danger : 'linear-gradient(135deg, ' + C.gold + ', #d4a03a)',
            color: t.type === 'error' ? 'white' : C.navy, fontWeight: 600, fontSize: 13,
            boxShadow: '0 6px 24px ' + (t.type === 'error' ? C.danger : C.gold) + '40',
            animation: 'toastIn 0.25s ease', whiteSpace: 'nowrap',
          }}>
            {t.type === 'error' ? '✕' : '✓'} {t.msg}
          </div>;
        })}
      </div>
    </div>
  );
}
