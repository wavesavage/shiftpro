'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════
   CRYPTO ENGINE — AES-256-GCM + PBKDF2 + SHA-256
   ═══════════════════════════════════════════════════════ */
var SALT_KEY = 'v1_salt';
var DATA_KEY = 'v1_data';
var VERIFY_KEY = 'v1_verify';
var VERIFY_PLAINTEXT = 'SHIFTPRO_VAULT1_VERIFIED';
var KDF_ITERATIONS = 600000;
// SHA-256 hash of the master password — plaintext never stored in code
var PW_HASH = 'c4fb8e717a4b40c1c6ecd802bc5ba021301ea5d838a3e5a659d2eaf34fbacc79';

async function sha256(text) {
  var enc = new TextEncoder();
  var buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

async function deriveKey(password, salt) {
  var enc = new TextEncoder();
  var km = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: KDF_ITERATIONS, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptStr(key, plaintext) {
  var enc = new TextEncoder();
  var iv = crypto.getRandomValues(new Uint8Array(12));
  var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(plaintext));
  var buf = new Uint8Array(iv.length + ct.byteLength);
  buf.set(iv);
  buf.set(new Uint8Array(ct), iv.length);
  return btoa(String.fromCharCode.apply(null, buf));
}

async function decryptStr(key, ciphertext) {
  var buf = Uint8Array.from(atob(ciphertext), function(c) { return c.charCodeAt(0); });
  var iv = buf.slice(0, 12);
  var ct = buf.slice(12);
  var dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
  return new TextDecoder().decode(dec);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════ */
var C = {
  navy: '#0c1220', navyL: '#131b2e', navyM: '#1a2540',
  surface: '#16203a', border: '#1e2d4a',
  gold: '#e8b84b', teal: '#2dd4bf', danger: '#ef4444',
  txt: '#e2e8f0', txt2: '#8896b0', txt3: '#5a6a84',
  green: '#22c55e',
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

var KEY_TYPES = [
  { id: 'secret_key', label: 'Secret Key', icon: '🔐', color: '#ef4444' },
  { id: 'publishable_key', label: 'Publishable Key', icon: '🔓', color: '#22c55e' },
  { id: 'api_key', label: 'API Key', icon: '🔑', color: '#e8b84b' },
  { id: 'token', label: 'Token', icon: '🎟️', color: '#a855f7' },
  { id: 'password', label: 'Password', icon: '🔒', color: '#f97316' },
  { id: 'url', label: 'URL / Endpoint', icon: '🔗', color: '#3b82f6' },
  { id: 'env_var', label: 'Env Variable', icon: '⚙️', color: '#06b6d4' },
  { id: 'webhook', label: 'Webhook', icon: '🪝', color: '#ec4899' },
  { id: 'other', label: 'Other', icon: '📌', color: '#8b5cf6' },
];

var CSS_GLOBAL = [
  "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');",
  '*{box-sizing:border-box;margin:0;padding:0}',
  '::-webkit-scrollbar{width:5px}',
  '::-webkit-scrollbar-track{background:transparent}',
  '::-webkit-scrollbar-thumb{background:' + C.border + ';border-radius:3px}',
  'input:focus,textarea:focus,select:focus{outline:none;border-color:' + C.gold + '!important}',
  '@keyframes fadeUp{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}',
  '@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}',
  '@keyframes slideIn{0%{opacity:0;transform:translateX(-14px)}100%{opacity:1;transform:translateX(0)}}',
  '@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}',
  '@keyframes vaultOpen{0%{transform:scale(1);opacity:1}50%{transform:scale(1.05)}100%{transform:scale(0.93);opacity:0}}',
  '@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,184,75,0.25)}50%{box-shadow:0 0 24px 5px rgba(232,184,75,0.1)}}',
  '@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
  '@keyframes toastIn{0%{opacity:0;transform:translateY(14px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}',
].join('\n');


/* ═══════════════════════════════════════════════════════
   VAULT1 PAGE
   ═══════════════════════════════════════════════════════ */
export default function Vault1Page() {
  var _phase = useState('lock');
  var phase = _phase[0]; var setPhase = _phase[1];
  var _pw = useState('');
  var pw = _pw[0]; var setPw = _pw[1];
  var _shaking = useState(false);
  var shaking = _shaking[0]; var setShaking = _shaking[1];
  var _loading = useState(false);
  var loading = _loading[0]; var setLoading = _loading[1];
  var _unlockAnim = useState(false);
  var unlockAnim = _unlockAnim[0]; var setUnlockAnim = _unlockAnim[1];
  var _cryptoKey = useState(null);
  var cryptoKey = _cryptoKey[0]; var setCryptoKey = _cryptoKey[1];
  var _toasts = useState([]);
  var toasts = _toasts[0]; var setToasts = _toasts[1];

  // Vault data
  var _projects = useState([]);
  var projects = _projects[0]; var setProjects = _projects[1];
  var _activeProject = useState(null);
  var activeProject = _activeProject[0]; var setActiveProject = _activeProject[1];
  var _entries = useState([]);
  var entries = _entries[0]; var setEntries = _entries[1];
  var _search = useState('');
  var search = _search[0]; var setSearch = _search[1];
  var _revealed = useState({});
  var revealed = _revealed[0]; var setRevealed = _revealed[1];
  var _sideOpen = useState(true);
  var sideOpen = _sideOpen[0]; var setSideOpen = _sideOpen[1];

  // Modals / editing
  var _showNewProject = useState(false);
  var showNewProject = _showNewProject[0]; var setShowNewProject = _showNewProject[1];
  var _newProjectName = useState('');
  var newProjectName = _newProjectName[0]; var setNewProjectName = _newProjectName[1];
  var _newProjectIcon = useState('🌐');
  var newProjectIcon = _newProjectIcon[0]; var setNewProjectIcon = _newProjectIcon[1];
  var _newProjectColor = useState('#3b82f6');
  var newProjectColor = _newProjectColor[0]; var setNewProjectColor = _newProjectColor[1];
  var _editingEntry = useState(null);
  var editingEntry = _editingEntry[0]; var setEditingEntry = _editingEntry[1];
  var _editProject = useState(null);
  var editProject = _editProject[0]; var setEditProject = _editProject[1];
  var _confirmDelete = useState(null);
  var confirmDelete = _confirmDelete[0]; var setConfirmDelete = _confirmDelete[1];

  var lockTimerRef = useRef(null);
  var searchRef = useRef(null);

  // ── Toast ──
  var toast = useCallback(function(msg, type) {
    var id = Date.now().toString();
    setToasts(function(prev) { return prev.concat([{ id: id, msg: msg, type: type || 'success' }]); });
    setTimeout(function() { setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); }); }, 2800);
  }, []);

  // ── Persist encrypted data ──
  var saveData = useCallback(async function(key, projectList, entryList) {
    if (!key) return;
    try {
      var data = JSON.stringify({ projects: projectList, entries: entryList });
      var encrypted = await encryptStr(key, data);
      localStorage.setItem(DATA_KEY, encrypted);
    } catch (e) { console.error('Save failed:', e); }
  }, []);

  var loadData = useCallback(async function(key) {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      if (!raw) return { projects: [], entries: [] };
      var decrypted = await decryptStr(key, raw);
      return JSON.parse(decrypted);
    } catch (e) { return { projects: [], entries: [] }; }
  }, []);

  // ── Auto-save on data change ──
  useEffect(function() {
    if (phase !== 'vault' || !cryptoKey) return;
    saveData(cryptoKey, projects, entries);
  }, [projects, entries, cryptoKey, phase, saveData]);

  // ── Auto-lock after 10 min inactivity ──
  useEffect(function() {
    if (phase !== 'vault') return;
    var reset = function() {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(function() { handleLock(); }, 600000);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    reset();
    return function() {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      clearTimeout(lockTimerRef.current);
    };
  }, [phase]);

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
  }, [phase, activeProject]);

  // ── Unlock ──
  async function handleUnlock() {
    if (!pw.trim() || loading) return;
    setLoading(true);
    try {
      var hash = await sha256(pw);
      if (hash !== PW_HASH) {
        setShaking(true);
        setLoading(false);
        setTimeout(function() { setShaking(false); }, 500);
        toast('Invalid password', 'error');
        return;
      }
      // Get or create salt
      var salt = localStorage.getItem(SALT_KEY);
      if (!salt) {
        salt = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        localStorage.setItem(SALT_KEY, salt);
      }
      var key = await deriveKey(pw, salt);
      // Verify or create verification blob
      var verifyBlob = localStorage.getItem(VERIFY_KEY);
      if (verifyBlob) {
        try { await decryptStr(key, verifyBlob); }
        catch (e) { toast('Decryption failed', 'error'); setLoading(false); return; }
      } else {
        var vb = await encryptStr(key, VERIFY_PLAINTEXT);
        localStorage.setItem(VERIFY_KEY, vb);
      }
      // Load existing data
      var data = await loadData(key);
      setCryptoKey(key);
      setProjects(data.projects || []);
      setEntries(data.entries || []);
      if (data.projects && data.projects.length > 0) setActiveProject(data.projects[0].id);
      setUnlockAnim(true);
      setTimeout(function() { setPhase('vault'); setLoading(false); setUnlockAnim(false); }, 650);
    } catch (e) {
      toast('Unlock error: ' + e.message, 'error');
      setLoading(false);
    }
  }

  function handleLock() {
    setPhase('lock'); setPw(''); setCryptoKey(null);
    setProjects([]); setEntries([]); setActiveProject(null);
    setRevealed({}); setEditingEntry(null); setSearch('');
  }

  // ── Copy ──
  async function handleCopy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast(label + ' copied!');
      setTimeout(function() { navigator.clipboard.writeText(''); }, 30000);
    } catch (e) { toast('Copy failed', 'error'); }
  }

  // ── Reveal / hide ──
  function toggleReveal(id) {
    setRevealed(function(prev) {
      var n = Object.assign({}, prev);
      if (n[id]) delete n[id];
      else n[id] = true;
      return n;
    });
  }

  // ── Projects ──
  function handleAddProject() {
    if (!newProjectName.trim()) return;
    var proj = { id: generateId(), name: newProjectName.trim(), icon: newProjectIcon, color: newProjectColor, createdAt: Date.now() };
    setProjects(function(prev) { return prev.concat([proj]); });
    setActiveProject(proj.id);
    setNewProjectName(''); setNewProjectIcon('🌐'); setNewProjectColor('#3b82f6');
    setShowNewProject(false);
    toast('Project created');
  }

  function handleDeleteProject(projId) {
    setProjects(function(prev) { return prev.filter(function(p) { return p.id !== projId; }); });
    setEntries(function(prev) { return prev.filter(function(e) { return e.projectId !== projId; }); });
    if (activeProject === projId) {
      var remaining = projects.filter(function(p) { return p.id !== projId; });
      setActiveProject(remaining.length > 0 ? remaining[0].id : null);
    }
    setConfirmDelete(null);
    toast('Project deleted');
  }

  function handleUpdateProject() {
    if (!editProject) return;
    setProjects(function(prev) {
      return prev.map(function(p) { return p.id === editProject.id ? editProject : p; });
    });
    setEditProject(null);
    toast('Project updated');
  }

  // ── Entries ──
  function handleNewEntry() {
    if (!activeProject) { toast('Create a project first', 'error'); return; }
    setEditingEntry({
      id: generateId(), projectId: activeProject,
      name: '', value: '', keyType: 'api_key', notes: '', isNew: true,
      createdAt: Date.now(), updatedAt: Date.now(),
    });
  }

  function handleSaveEntry() {
    if (!editingEntry || !editingEntry.name.trim()) { toast('Name is required', 'error'); return; }
    var saved = Object.assign({}, editingEntry, { updatedAt: Date.now() });
    delete saved.isNew;
    if (entries.find(function(e) { return e.id === saved.id; })) {
      setEntries(function(prev) { return prev.map(function(e) { return e.id === saved.id ? saved : e; }); });
      toast('Entry updated & encrypted');
    } else {
      setEntries(function(prev) { return prev.concat([saved]); });
      toast('Entry saved & encrypted');
    }
    setEditingEntry(null);
  }

  function handleDeleteEntry(id) {
    setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id; }); });
    setConfirmDelete(null);
    toast('Entry deleted');
  }

  function handleDuplicateEntry(entry) {
    var dup = Object.assign({}, entry, { id: generateId(), name: entry.name + ' (copy)', createdAt: Date.now(), updatedAt: Date.now() });
    setEntries(function(prev) { return prev.concat([dup]); });
    toast('Entry duplicated');
  }

  // ── Filtered entries ──
  var filteredEntries = useMemo(function() {
    var list = activeProject === '__all__'
      ? entries
      : entries.filter(function(e) { return e.projectId === activeProject; });
    if (search) {
      var q = search.toLowerCase();
      list = list.filter(function(e) {
        return e.name.toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q) || e.keyType.toLowerCase().includes(q);
      });
    }
    return list.sort(function(a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }, [entries, activeProject, search]);

  var activeProjectData = projects.find(function(p) { return p.id === activeProject; });

  var projectIcons = ['🌐','💻','🚀','⚡','🛒','📱','🎮','🏢','🔧','🎯','📊','🤖','☁️','🔥','💎','🎨','📡','🏗️','🧪','🦾'];
  var projectColors = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#f97316','#8b5cf6','#2dd4bf'];

  // ═══════════════════════════════════════════
  // RENDER — LOCK SCREEN
  // ═══════════════════════════════════════════
  if (phase === 'lock') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 10%, ' + C.navyL + ' 0%, ' + C.navy + ' 55%, #060a12 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT.body, overflow: 'hidden', position: 'relative',
      }}>
        <style dangerouslySetInnerHTML={{ __html: CSS_GLOBAL }} />

        <div style={{
          background: 'linear-gradient(150deg, ' + C.navyL + ', ' + C.navy + ')',
          border: '1px solid ' + C.border, borderRadius: 24, padding: '44px 40px',
          width: 420, maxWidth: '92vw', textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          animation: unlockAnim ? 'vaultOpen 0.65s ease forwards' : shaking ? 'shake 0.4s ease' : 'fadeUp 0.5s ease',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, ' + C.teal + '20, ' + C.gold + '20)',
            border: '2px solid ' + C.teal + '40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 3s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 38 }}>🛡️</span>
          </div>

          <h1 style={{ fontFamily: FONT.display, fontSize: 26, color: C.txt, margin: '0 0 4px' }}>
            Project <span style={{ color: C.teal }}>Vault</span>
          </h1>
          <p style={{ color: C.txt2, fontSize: 13, margin: '0 0 28px', lineHeight: 1.5 }}>
            Encrypted key storage for all your projects.<br />Enter your master password.
          </p>

          <div style={{ position: 'relative', marginBottom: 18 }}>
            <input type="password" placeholder="Master Password" value={pw}
              onChange={function(e) { setPw(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') handleUnlock(); }}
              style={{
                width: '100%', padding: '14px 44px 14px 16px', fontSize: 15,
                fontFamily: FONT.mono, background: C.navyM,
                border: '1px solid ' + C.border, borderRadius: 11, color: C.txt,
              }} />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.35 }}>🔑</span>
          </div>

          <button onClick={handleUnlock} disabled={loading}
            style={Object.assign({}, btnBase, {
              width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15,
              background: loading ? C.teal + '66' : 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)',
              color: '#fff', borderRadius: 11, boxShadow: '0 4px 18px ' + C.teal + '30',
            })}>
            {loading ? <span style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.5s linear infinite', display: 'inline-block' }} /> : 'Unlock Vault'}
          </button>

          <div style={{ marginTop: 24, padding: '11px 14px', background: C.teal + '08', border: '1px solid ' + C.teal + '18', borderRadius: 10 }}>
            <p style={{ color: C.teal, fontSize: 10, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              🛡️ AES-256-GCM · PBKDF2 600K iterations<br />
              🔐 All data encrypted locally · Auto-lock after 10 min<br />
              📋 Clipboard auto-clears after 30 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER — MAIN VAULT
  // ═══════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, ' + C.navy + ', #060a12)', fontFamily: FONT.body, color: C.txt, display: 'flex' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS_GLOBAL }} />

      {/* ═══ SIDEBAR ═══ */}
      <div style={{
        width: sideOpen ? 250 : 58, minHeight: '100vh', background: C.navyL,
        borderRight: '1px solid ' + C.border, transition: 'width 0.25s ease',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ padding: sideOpen ? '16px 18px 14px' : '16px 12px 14px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={function() { setSideOpen(!sideOpen); }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          {sideOpen && <span style={{ fontFamily: FONT.display, fontSize: 16, color: C.txt, whiteSpace: 'nowrap' }}>Project <span style={{ color: C.teal }}>Vault</span></span>}
        </div>

        <div style={{ padding: '8px 6px', flex: 1, overflowY: 'auto' }}>
          {sideOpen && <div style={{ fontSize: 9, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.5, padding: '6px 12px 6px' }}>Projects</div>}

          {/* All Projects */}
          <div onClick={function() { setActiveProject('__all__'); setEditingEntry(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: sideOpen ? 9 : 0,
              padding: sideOpen ? '9px 12px' : '9px 0',
              justifyContent: sideOpen ? 'flex-start' : 'center',
              borderRadius: 9, cursor: 'pointer', marginBottom: 2,
              background: activeProject === '__all__' ? C.gold + '12' : 'transparent',
              borderLeft: activeProject === '__all__' ? '3px solid ' + C.gold : '3px solid transparent',
            }}>
            <span style={{ fontSize: 15 }}>📂</span>
            {sideOpen && (
              <>
                <span style={{ fontSize: 12, fontWeight: activeProject === '__all__' ? 600 : 400, color: activeProject === '__all__' ? C.txt : C.txt2, flex: 1 }}>All Keys</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.gold, background: C.gold + '15', padding: '1px 7px', borderRadius: 8 }}>{entries.length}</span>
              </>
            )}
          </div>

          {/* Project list */}
          {projects.map(function(proj, idx) {
            var isActive = activeProject === proj.id;
            var count = entries.filter(function(e) { return e.projectId === proj.id; }).length;
            return (
              <div key={proj.id}
                onClick={function() { setActiveProject(proj.id); setEditingEntry(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: sideOpen ? 9 : 0,
                  padding: sideOpen ? '9px 12px' : '9px 0',
                  justifyContent: sideOpen ? 'flex-start' : 'center',
                  borderRadius: 9, cursor: 'pointer', marginBottom: 2,
                  background: isActive ? (proj.color || '#3b82f6') + '12' : 'transparent',
                  borderLeft: isActive ? '3px solid ' + (proj.color || '#3b82f6') : '3px solid transparent',
                  transition: 'all 0.15s',
                  animation: 'slideIn 0.2s ease ' + (idx * 0.03) + 's both',
                }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{proj.icon || '🌐'}</span>
                {sideOpen && (
                  <>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? C.txt : C.txt2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{proj.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? proj.color : C.txt3, background: isActive ? (proj.color || '#3b82f6') + '18' : C.txt3 + '12', padding: '1px 7px', borderRadius: 8 }}>{count}</span>
                    {isActive && (
                      <span style={{ fontSize: 11, cursor: 'pointer', opacity: 0.5, padding: '2px 4px' }}
                        onClick={function(e) { e.stopPropagation(); setEditProject(Object.assign({}, proj)); }}>✏️</span>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Add Project Button */}
          <div onClick={function() { setShowNewProject(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: sideOpen ? 9 : 0,
              padding: sideOpen ? '9px 12px' : '9px 0',
              justifyContent: sideOpen ? 'flex-start' : 'center',
              borderRadius: 9, cursor: 'pointer', marginTop: 8,
              border: '1px dashed ' + C.border, transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 14 }}>➕</span>
            {sideOpen && <span style={{ fontSize: 12, color: C.txt3 }}>New Project</span>}
          </div>
        </div>

        {/* Lock */}
        <div style={{ padding: '10px 6px', borderTop: '1px solid ' + C.border }}>
          <div onClick={handleLock} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', justifyContent: sideOpen ? 'flex-start' : 'center', background: C.danger + '08' }}>
            <span style={{ fontSize: 15 }}>🔒</span>
            {sideOpen && <span style={{ fontSize: 12, color: C.danger, fontWeight: 600 }}>Lock Vault</span>}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ padding: '12px 22px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 14, background: C.navyL + '80', backdropFilter: 'blur(10px)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.35 }}>🔍</span>
            <input ref={searchRef} placeholder="Search keys... (⌘F)" value={search}
              onChange={function(e) { setSearch(e.target.value); }}
              style={{ width: '100%', maxWidth: 380, padding: '9px 12px 9px 36px', fontSize: 13, fontFamily: FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 9, color: C.txt }} />
          </div>
          <div style={{ fontSize: 11, color: C.txt3, fontFamily: FONT.mono }}>
            {entries.length} keys · {projects.length} projects
          </div>
          <button onClick={handleNewEntry}
            style={Object.assign({}, btnBase, { padding: '9px 16px', background: 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)', color: '#fff', boxShadow: '0 2px 10px ' + C.teal + '28' })}>
            + Add Key
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
          {/* No projects state */}
          {projects.length === 0 && !editingEntry && (
            <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'fadeUp 0.4s ease' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, ' + C.teal + '10, ' + C.gold + '10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 44 }}>🏗️</div>
              <h2 style={{ fontFamily: FONT.display, fontSize: 22, margin: '0 0 8px' }}>Create Your First Project</h2>
              <p style={{ color: C.txt2, fontSize: 13, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Organize your API keys, secrets, and credentials by project. Each project holds all the keys for one website or app.
              </p>
              <button onClick={function() { setShowNewProject(true); }}
                style={Object.assign({}, btnBase, { padding: '12px 24px', fontSize: 14, background: 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)', color: '#fff', boxShadow: '0 4px 18px ' + C.teal + '30' })}>
                + Create Project
              </button>
            </div>
          )}

          {/* Project header */}
          {activeProject && activeProject !== '__all__' && activeProjectData && !editingEntry && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, animation: 'fadeUp 0.2s ease' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: (activeProjectData.color || '#3b82f6') + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {activeProjectData.icon || '🌐'}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: FONT.display, fontSize: 22, margin: 0 }}>{activeProjectData.name}</h2>
                <span style={{ fontSize: 11, color: C.txt3 }}>{filteredEntries.length} keys stored</span>
              </div>
              <button onClick={function() { setConfirmDelete({ type: 'project', id: activeProjectData.id, name: activeProjectData.name }); }}
                style={Object.assign({}, btnBase, { padding: '7px 12px', fontSize: 11, background: C.danger + '08', color: C.danger, border: '1px solid ' + C.danger + '20' })}>🗑️</button>
            </div>
          )}

          {activeProject === '__all__' && !editingEntry && (
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: FONT.display, fontSize: 22, margin: '0 0 4px' }}>All Keys</h2>
              <span style={{ fontSize: 11, color: C.txt3 }}>{filteredEntries.length} keys across {projects.length} projects</span>
            </div>
          )}

          {/* Entry editor */}
          {editingEntry && (
            <div style={{ maxWidth: 540, animation: 'fadeUp 0.2s ease' }}>
              <h2 style={{ fontFamily: FONT.display, fontSize: 20, margin: '0 0 20px' }}>
                {editingEntry.isNew ? 'Add New Key' : 'Edit Key'}
              </h2>

              {/* Key type selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 6 }}>📦 Key Type</label>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {KEY_TYPES.map(function(kt) {
                    var isActive = editingEntry.keyType === kt.id;
                    return (
                      <button key={kt.id}
                        onClick={function() { setEditingEntry(function(p) { return Object.assign({}, p, { keyType: kt.id }); }); }}
                        style={Object.assign({}, btnBase, {
                          padding: '6px 12px', fontSize: 11,
                          background: isActive ? kt.color + '18' : C.navyM,
                          color: isActive ? kt.color : C.txt3,
                          border: '1px solid ' + (isActive ? kt.color + '40' : C.border),
                        })}>
                        {kt.icon} {kt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>📌 Key Name</label>
                <input value={editingEntry.name} placeholder="e.g. Supabase Anon Key"
                  onChange={function(e) { setEditingEntry(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }}
                  style={{ width: '100%', padding: '11px 14px', fontSize: 14, fontFamily: FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }} />
              </div>

              {/* Value */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🔑 Key Value</label>
                <textarea value={editingEntry.value} placeholder="Paste your key, secret, or value here..."
                  onChange={function(e) { setEditingEntry(function(p) { return Object.assign({}, p, { value: e.target.value }); }); }}
                  rows={3}
                  style={{ width: '100%', padding: '11px 14px', fontSize: 13, fontFamily: FONT.mono, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt, resize: 'vertical' }} />
              </div>

              {/* Project selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🏷️ Project</label>
                <select value={editingEntry.projectId}
                  onChange={function(e) { setEditingEntry(function(p) { return Object.assign({}, p, { projectId: e.target.value }); }); }}
                  style={{ width: '100%', padding: '11px 14px', fontSize: 13, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }}>
                  {projects.map(function(p) {
                    return <option key={p.id} value={p.id}>{p.icon} {p.name}</option>;
                  })}
                </select>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>📝 Notes (optional)</label>
                <textarea value={editingEntry.notes || ''} placeholder="Where this key is used, environment, etc..."
                  onChange={function(e) { setEditingEntry(function(p) { return Object.assign({}, p, { notes: e.target.value }); }); }}
                  rows={2}
                  style={{ width: '100%', padding: '11px 14px', fontSize: 13, fontFamily: FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSaveEntry}
                  style={Object.assign({}, btnBase, { padding: '11px 22px', background: 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)', color: '#fff', boxShadow: '0 2px 10px ' + C.teal + '28' })}>
                  🔐 Encrypt & Save
                </button>
                <button onClick={function() { setEditingEntry(null); }}
                  style={Object.assign({}, btnBase, { padding: '11px 18px', background: C.txt3 + '12', color: C.txt2 })}>Cancel</button>
              </div>
            </div>
          )}

          {/* Entry list */}
          {!editingEntry && activeProject && filteredEntries.length > 0 && (
            <div style={{ animation: 'fadeUp 0.2s ease' }}>
              {filteredEntries.map(function(entry, i) {
                var kt = KEY_TYPES.find(function(k) { return k.id === entry.keyType; }) || KEY_TYPES[0];
                var proj = projects.find(function(p) { return p.id === entry.projectId; });
                var isRevealed = revealed[entry.id];
                var maskedValue = entry.value ? entry.value.slice(0, 6) + '••••••••••' + entry.value.slice(-4) : '(empty)';
                if (entry.value && entry.value.length <= 12) maskedValue = '••••••••••••';

                return (
                  <div key={entry.id} style={{
                    padding: '16px 18px', background: C.surface, borderRadius: 12,
                    border: '1px solid ' + C.border, marginBottom: 10,
                    animation: 'fadeUp 0.15s ease ' + (i * 0.03) + 's both',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: kt.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {kt.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{entry.name}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: kt.color + '15', color: kt.color }}>{kt.label}</span>
                          {activeProject === '__all__' && proj && (
                            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: (proj.color || '#3b82f6') + '12', color: proj.color || '#3b82f6' }}>{proj.icon} {proj.name}</span>
                          )}
                        </div>
                        <div style={{
                          fontFamily: FONT.mono, fontSize: 12, color: isRevealed ? C.teal : C.txt3,
                          letterSpacing: isRevealed ? 0 : 0.5, wordBreak: 'break-all',
                          padding: '8px 10px', background: C.navyM, borderRadius: 8,
                          border: '1px solid ' + C.border, marginTop: 2,
                          maxHeight: isRevealed ? 200 : 28, overflow: 'hidden',
                          transition: 'max-height 0.3s ease',
                        }}>
                          {isRevealed ? entry.value : maskedValue}
                        </div>
                        {entry.notes && (
                          <div style={{ fontSize: 11, color: C.txt3, marginTop: 6, lineHeight: 1.4 }}>📝 {entry.notes}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                        <span style={{ cursor: 'pointer', fontSize: 13, padding: '5px 7px', borderRadius: 6, background: C.teal + '10', textAlign: 'center' }}
                          onClick={function() { toggleReveal(entry.id); }}
                          title={isRevealed ? 'Hide' : 'Reveal'}>
                          {isRevealed ? '🙈' : '👁️'}
                        </span>
                        <span style={{ cursor: 'pointer', fontSize: 13, padding: '5px 7px', borderRadius: 6, background: C.gold + '10', textAlign: 'center' }}
                          onClick={function() { handleCopy(entry.value, entry.name); }}
                          title="Copy value">📋</span>
                        <span style={{ cursor: 'pointer', fontSize: 13, padding: '5px 7px', borderRadius: 6, background: C.txt3 + '10', textAlign: 'center' }}
                          onClick={function() { setEditingEntry(Object.assign({}, entry)); }}
                          title="Edit">✏️</span>
                        <span style={{ cursor: 'pointer', fontSize: 13, padding: '5px 7px', borderRadius: 6, background: C.txt3 + '10', textAlign: 'center' }}
                          onClick={function() { handleDuplicateEntry(entry); }}
                          title="Duplicate">📑</span>
                        <span style={{ cursor: 'pointer', fontSize: 13, padding: '5px 7px', borderRadius: 6, background: C.danger + '08', textAlign: 'center' }}
                          onClick={function() { setConfirmDelete({ type: 'entry', id: entry.id, name: entry.name }); }}
                          title="Delete">🗑️</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state for project */}
          {!editingEntry && activeProject && activeProject !== '__all__' && filteredEntries.length === 0 && projects.length > 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', animation: 'fadeIn 0.3s ease' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔑</span>
              <p style={{ color: C.txt2, fontSize: 13, marginBottom: 14 }}>No keys in this project yet</p>
              <button onClick={handleNewEntry}
                style={Object.assign({}, btnBase, { padding: '9px 18px', background: C.teal + '12', color: C.teal, border: '1px solid ' + C.teal + '25' })}>+ Add Your First Key</button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ NEW PROJECT MODAL ═══ */}
      {showNewProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={function(e) { if (e.target === e.currentTarget) setShowNewProject(false); }}>
          <div style={{ background: 'linear-gradient(150deg, ' + C.navyL + ', ' + C.navy + ')', border: '1px solid ' + C.border, borderRadius: 18, padding: '28px 30px', width: 420, maxWidth: '92vw', animation: 'fadeUp 0.25s ease' }}>
            <h3 style={{ fontFamily: FONT.display, fontSize: 20, margin: '0 0 18px' }}>New Project</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>📌 Project Name</label>
              <input value={newProjectName} placeholder="e.g. ShiftPro.ai"
                onChange={function(e) { setNewProjectName(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleAddProject(); }}
                autoFocus
                style={{ width: '100%', padding: '11px 14px', fontSize: 14, fontFamily: FONT.body, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🎨 Icon</label>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {projectIcons.map(function(ic) {
                  return <span key={ic} onClick={function() { setNewProjectIcon(ic); }}
                    style={{ fontSize: 20, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', background: newProjectIcon === ic ? C.teal + '20' : 'transparent', border: newProjectIcon === ic ? '1px solid ' + C.teal + '40' : '1px solid transparent' }}>{ic}</span>;
                })}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🎨 Color</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {projectColors.map(function(col) {
                  return <div key={col} onClick={function() { setNewProjectColor(col); }}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: col, cursor: 'pointer', border: newProjectColor === col ? '3px solid white' : '3px solid transparent', transition: 'all 0.15s' }} />;
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAddProject}
                style={Object.assign({}, btnBase, { padding: '10px 22px', background: 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)', color: '#fff' })}>Create Project</button>
              <button onClick={function() { setShowNewProject(false); }}
                style={Object.assign({}, btnBase, { padding: '10px 18px', background: C.txt3 + '12', color: C.txt2 })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT PROJECT MODAL ═══ */}
      {editProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={function(e) { if (e.target === e.currentTarget) setEditProject(null); }}>
          <div style={{ background: 'linear-gradient(150deg, ' + C.navyL + ', ' + C.navy + ')', border: '1px solid ' + C.border, borderRadius: 18, padding: '28px 30px', width: 420, maxWidth: '92vw', animation: 'fadeUp 0.25s ease' }}>
            <h3 style={{ fontFamily: FONT.display, fontSize: 20, margin: '0 0 18px' }}>Edit Project</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>📌 Name</label>
              <input value={editProject.name}
                onChange={function(e) { setEditProject(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }}
                style={{ width: '100%', padding: '11px 14px', fontSize: 14, background: C.navyM, border: '1px solid ' + C.border, borderRadius: 10, color: C.txt }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🎨 Icon</label>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {projectIcons.map(function(ic) {
                  return <span key={ic} onClick={function() { setEditProject(function(p) { return Object.assign({}, p, { icon: ic }); }); }}
                    style={{ fontSize: 20, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', background: editProject.icon === ic ? C.teal + '20' : 'transparent', border: editProject.icon === ic ? '1px solid ' + C.teal + '40' : '1px solid transparent' }}>{ic}</span>;
                })}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.txt3, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 5 }}>🎨 Color</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {projectColors.map(function(col) {
                  return <div key={col} onClick={function() { setEditProject(function(p) { return Object.assign({}, p, { color: col }); }); }}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: col, cursor: 'pointer', border: editProject.color === col ? '3px solid white' : '3px solid transparent' }} />;
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleUpdateProject} style={Object.assign({}, btnBase, { padding: '10px 22px', background: 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)', color: '#fff' })}>Save</button>
              <button onClick={function() { setEditProject(null); }} style={Object.assign({}, btnBase, { padding: '10px 18px', background: C.txt3 + '12', color: C.txt2 })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM DELETE MODAL ═══ */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={function(e) { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div style={{ background: 'linear-gradient(150deg, ' + C.navyL + ', ' + C.navy + ')', border: '1px solid ' + C.danger + '30', borderRadius: 18, padding: '28px 30px', width: 400, maxWidth: '92vw', animation: 'fadeUp 0.25s ease', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontFamily: FONT.display, fontSize: 18, margin: '0 0 8px' }}>Delete {confirmDelete.type === 'project' ? 'Project' : 'Key'}?</h3>
            <p style={{ color: C.txt2, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              {confirmDelete.type === 'project'
                ? 'This will permanently delete "' + confirmDelete.name + '" and all keys inside it.'
                : 'This will permanently delete "' + confirmDelete.name + '".'}
              <br />This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={function() {
                if (confirmDelete.type === 'project') handleDeleteProject(confirmDelete.id);
                else handleDeleteEntry(confirmDelete.id);
              }} style={Object.assign({}, btnBase, { padding: '10px 22px', background: C.danger, color: '#fff' })}>🗑️ Delete</button>
              <button onClick={function() { setConfirmDelete(null); }} style={Object.assign({}, btnBase, { padding: '10px 18px', background: C.txt3 + '12', color: C.txt2 })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOASTS ═══ */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 6, alignItems: 'center' }}>
        {toasts.map(function(t) {
          return <div key={t.id} style={{
            padding: '9px 20px', borderRadius: 11,
            background: t.type === 'error' ? C.danger : 'linear-gradient(135deg, ' + C.teal + ', #1aab9f)',
            color: '#fff', fontWeight: 600, fontSize: 13,
            boxShadow: '0 6px 24px ' + (t.type === 'error' ? C.danger : C.teal) + '40',
            animation: 'toastIn 0.25s ease', whiteSpace: 'nowrap',
          }}>
            {t.type === 'error' ? '✕' : '✓'} {t.msg}
          </div>;
        })}
      </div>
    </div>
  );
}
