'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════
   CRYPTO ENGINE
   ═══════════════════════════════════════════════════════ */
var KDF_ITERATIONS = 600000;
var VAULT_ID = 'vault_two';
var INITIAL_PW_HASH = 'e1c9bddb2d8d320a82227d7ecc054476c6a958a17782faee756d916eee7ebb56';

async function sha256(text) {
  var enc = new TextEncoder();
  var buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}
async function deriveKey(password, salt) {
  var enc = new TextEncoder();
  var km = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(salt), iterations: KDF_ITERATIONS, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptStr(key, plaintext) {
  var enc = new TextEncoder();
  var iv = crypto.getRandomValues(new Uint8Array(12));
  var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(plaintext));
  var buf = new Uint8Array(iv.length + ct.byteLength);
  buf.set(iv); buf.set(new Uint8Array(ct), iv.length);
  var str = ""; for (var i = 0; i < buf.length; i++) { str += String.fromCharCode(buf[i]); } return btoa(str);
}
async function decryptStr(key, ciphertext) {
  var buf = Uint8Array.from(atob(ciphertext), function(c) { return c.charCodeAt(0); });
  var dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12));
  return new TextDecoder().decode(dec);
}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* ═══ CLOUD ═══ */
async function cloudSave(vaultId, ownerHash, encData) {
  try { var r = await fetch('/api/vault1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vault_id: vaultId, owner: ownerHash, data: encData }) }); return r.ok; } catch(e) { return false; }
}
async function cloudLoad(vaultId) {
  try { var r = await fetch('/api/vault1?vault_id=' + encodeURIComponent(vaultId)); if (!r.ok) return null; var j = await r.json(); return j; } catch(e) { return null; }
}
async function cloudChangePassword(vaultId, oldHash, newHash, encData) {
  try { var r = await fetch('/api/vault1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vault_id: vaultId, old_hash: oldHash, new_hash: newHash, data: encData }) }); return r.ok; } catch(e) { return false; }
}

/* ═══ DESIGN ═══ */
var C = { navy:'#0c1220', navyL:'#131b2e', navyM:'#1a2540', surface:'#16203a', border:'#1e2d4a', gold:'#e8b84b', teal:'#2dd4bf', danger:'#ef4444', txt:'#e2e8f0', txt2:'#8896b0', txt3:'#5a6a84' };
var FONT = { display:"'DM Serif Display',serif", body:"'Instrument Sans','DM Sans','Segoe UI',system-ui,sans-serif", mono:"'DM Mono','Fira Code',monospace" };
var btnBase = { fontFamily:FONT.body, fontSize:13, fontWeight:600, border:'none', borderRadius:8, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, transition:'all 0.2s' };
var KEY_TYPES = [
  { id:'secret_key', label:'Secret Key', icon:'🔐', color:'#ef4444' },
  { id:'publishable_key', label:'Publishable Key', icon:'🔓', color:'#22c55e' },
  { id:'api_key', label:'API Key', icon:'🔑', color:'#e8b84b' },
  { id:'token', label:'Token', icon:'🎟️', color:'#a855f7' },
  { id:'password', label:'Password', icon:'🔒', color:'#f97316' },
  { id:'url', label:'URL / Endpoint', icon:'🔗', color:'#3b82f6' },
  { id:'env_var', label:'Env Variable', icon:'⚙️', color:'#06b6d4' },
  { id:'webhook', label:'Webhook', icon:'🪝', color:'#ec4899' },
  { id:'other', label:'Other', icon:'📌', color:'#8b5cf6' },
];
var CSS = "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:"+C.border+";border-radius:3px}input:focus,textarea:focus,select:focus{outline:none;border-color:"+C.gold+"!important}@keyframes fadeUp{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes slideIn{0%{opacity:0;transform:translateX(-14px)}100%{opacity:1;transform:translateX(0)}}@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}@keyframes vaultOpen{0%{transform:scale(1);opacity:1}50%{transform:scale(1.05)}100%{transform:scale(0.93);opacity:0}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(45,212,191,0.25)}50%{box-shadow:0 0 24px 5px rgba(45,212,191,0.1)}}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes toastIn{0%{opacity:0;transform:translateY(14px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes syncPulse{0%,100%{opacity:0.4}50%{opacity:1}}";
var projectIcons = ['🌐','💻','🚀','⚡','🛒','📱','🎮','🏢','🔧','🎯','📊','🤖','☁️','🔥','💎','🎨','📡','🏗️','🧪','🦾'];
var projectColors = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#f97316','#8b5cf6','#2dd4bf'];

export default function Vault2Page() {
  var _p = useState('lock'); var phase = _p[0]; var setPhase = _p[1];
  var _pw = useState(''); var pw = _pw[0]; var setPw = _pw[1];
  var _shake = useState(false); var shaking = _shake[0]; var setShaking = _shake[1];
  var _load = useState(false); var loading = _load[0]; var setLoading = _load[1];
  var _ua = useState(false); var unlockAnim = _ua[0]; var setUnlockAnim = _ua[1];
  var _ck = useState(null); var cryptoKey = _ck[0]; var setCryptoKey = _ck[1];
  var _oh = useState(''); var ownerHash = _oh[0]; var setOwnerHash = _oh[1];
  var _mp = useState(''); var masterPw = _mp[0]; var setMasterPw = _mp[1];
  var _ts = useState([]); var toasts = _ts[0]; var setToasts = _ts[1];
  var _sy = useState(false); var syncing = _sy[0]; var setSyncing = _sy[1];
  var _ls = useState(null); var lastSync = _ls[0]; var setLastSync = _ls[1];
  var _pr = useState([]); var projects = _pr[0]; var setProjects = _pr[1];
  var _ap = useState(null); var activeProject = _ap[0]; var setActiveProject = _ap[1];
  var _en = useState([]); var entries = _en[0]; var setEntries = _en[1];
  var _se = useState(''); var search = _se[0]; var setSearch = _se[1];
  var _rv = useState({}); var revealed = _rv[0]; var setRevealed = _rv[1];
  var _so = useState(true); var sideOpen = _so[0]; var setSideOpen = _so[1];
  var _ei = useState({}); var expandedImages = _ei[0]; var setExpandedImages = _ei[1];
  var _snp = useState(false); var showNewProject = _snp[0]; var setShowNewProject = _snp[1];
  var _npn = useState(''); var newProjectName = _npn[0]; var setNewProjectName = _npn[1];
  var _npi = useState('🌐'); var newProjectIcon = _npi[0]; var setNewProjectIcon = _npi[1];
  var _npc = useState('#3b82f6'); var newProjectColor = _npc[0]; var setNewProjectColor = _npc[1];
  var _ee = useState(null); var editingEntry = _ee[0]; var setEditingEntry = _ee[1];
  var _ep = useState(null); var editProject = _ep[0]; var setEditProject = _ep[1];
  var _cd = useState(null); var confirmDelete = _cd[0]; var setConfirmDelete = _cd[1];
  var _ip = useState(null); var imagePreview = _ip[0]; var setImagePreview = _ip[1];
  var _vw = useState('entries'); var view = _vw[0]; var setView = _vw[1];
  // Settings / password change
  var _spw1 = useState(''); var settingsCurrent = _spw1[0]; var setSettingsCurrent = _spw1[1];
  var _spw2 = useState(''); var settingsNew = _spw2[0]; var setSettingsNew = _spw2[1];
  var _spw3 = useState(''); var settingsConfirm = _spw3[0]; var setSettingsConfirm = _spw3[1];
  var _sload = useState(false); var settingsLoading = _sload[0]; var setSettingsLoading = _sload[1];

  var lockTimerRef = useRef(null);
  var searchRef = useRef(null);
  var fileInputRef = useRef(null);
  var saveTimeoutRef = useRef(null);

  var toast = useCallback(function(msg, type) {
    var id = Date.now().toString();
    setToasts(function(prev) { return prev.concat([{ id:id, msg:msg, type:type||'success' }]); });
    setTimeout(function() { setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); }); }, 2800);
  }, []);

  var syncToCloud = useCallback(async function(key, hash, projectList, entryList) {
    if (!key || !hash) return;
    setSyncing(true);
    try {
      var data = JSON.stringify({ projects: projectList, entries: entryList });
      var encrypted = await encryptStr(key, data);
      await cloudSave(VAULT_ID, hash, encrypted);
      setLastSync(new Date());
    } catch(e) { console.error('Sync failed:', e); }
    setSyncing(false);
  }, []);

  useEffect(function() {
    if (phase !== 'vault' || !cryptoKey || !ownerHash) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(function() { syncToCloud(cryptoKey, ownerHash, projects, entries); }, 1500);
    return function() { clearTimeout(saveTimeoutRef.current); };
  }, [projects, entries, cryptoKey, ownerHash, phase, syncToCloud]);

  useEffect(function() {
    if (phase !== 'vault') return;
    var reset = function() { clearTimeout(lockTimerRef.current); lockTimerRef.current = setTimeout(function() { handleLock(); }, 600000); };
    window.addEventListener('mousemove', reset); window.addEventListener('keydown', reset); reset();
    return function() { window.removeEventListener('mousemove', reset); window.removeEventListener('keydown', reset); clearTimeout(lockTimerRef.current); };
  }, [phase]);

  useEffect(function() {
    if (phase !== 'vault') return;
    var handler = function(e) {
      if ((e.metaKey||e.ctrlKey)&&e.key==='f') { e.preventDefault(); if(searchRef.current) searchRef.current.focus(); }
      if ((e.metaKey||e.ctrlKey)&&e.key==='n') { e.preventDefault(); handleNewEntry(); }
      if (e.key==='Escape') { if(imagePreview) setImagePreview(null); else handleLock(); }
    };
    window.addEventListener('keydown', handler);
    return function() { window.removeEventListener('keydown', handler); };
  }, [phase, activeProject, imagePreview]);

  async function handleUnlock() {
    if (!pw.trim() || loading) return;
    setLoading(true);
    try {
      var hash = await sha256(pw);
      var cloudResult = await cloudLoad(VAULT_ID);
      var storedHash = null;
      var storedData = null;
      if (cloudResult && cloudResult.ownerHash) {
        storedHash = cloudResult.ownerHash;
        storedData = cloudResult.data;
      }
      var validHash = storedHash || INITIAL_PW_HASH;
      if (hash !== validHash) {
        setShaking(true); setLoading(false);
        setTimeout(function() { setShaking(false); }, 500);
        toast('Invalid password', 'error');
        return;
      }
      var consistentKey = await deriveKey(pw, 'vault1-cloud-' + hash.slice(0, 16));
      var data = { projects: [], entries: [] };
      if (storedData) {
        try { data = JSON.parse(await decryptStr(consistentKey, storedData)); } catch(e) { toast('Could not decrypt cloud data', 'error'); }
      }
      setCryptoKey(consistentKey); setOwnerHash(hash); setMasterPw(pw);
      setProjects(data.projects || []); setEntries(data.entries || []);
      if (data.projects && data.projects.length > 0) setActiveProject(data.projects[0].id);
      setLastSync(new Date());
      if (!storedHash) {
        var enc = await encryptStr(consistentKey, JSON.stringify(data));
        await cloudSave(VAULT_ID, hash, enc);
      }
      setUnlockAnim(true);
      setTimeout(function() { setPhase('vault'); setLoading(false); setUnlockAnim(false); }, 650);
    } catch(e) { toast('Unlock error', 'error'); setLoading(false); }
  }

  function handleLock() {
    setPhase('lock'); setPw(''); setCryptoKey(null); setOwnerHash(''); setMasterPw('');
    setProjects([]); setEntries([]); setActiveProject(null);
    setRevealed({}); setEditingEntry(null); setSearch(''); setExpandedImages({});
    setView('entries'); setSettingsCurrent(''); setSettingsNew(''); setSettingsConfirm('');
  }

  async function handleChangePassword() {
    if (!settingsCurrent || !settingsNew || !settingsConfirm) { toast('Fill in all fields', 'error'); return; }
    if (settingsNew !== settingsConfirm) { toast('New passwords do not match', 'error'); return; }
    if (settingsNew.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    var currentHash = await sha256(settingsCurrent);
    if (currentHash !== ownerHash) { toast('Current password is incorrect', 'error'); return; }
    setSettingsLoading(true);
    try {
      var newHash = await sha256(settingsNew);
      var newKey = await deriveKey(settingsNew, 'vault1-cloud-' + newHash.slice(0, 16));
      var data = JSON.stringify({ projects: projects, entries: entries });
      var encrypted = await encryptStr(newKey, data);
      var ok = await cloudChangePassword(VAULT_ID, currentHash, newHash, encrypted);
      if (!ok) { toast('Password change failed', 'error'); setSettingsLoading(false); return; }
      setCryptoKey(newKey); setOwnerHash(newHash); setMasterPw(settingsNew);
      setSettingsCurrent(''); setSettingsNew(''); setSettingsConfirm('');
      setLastSync(new Date());
      toast('Password changed successfully!');
    } catch(e) { toast('Error changing password', 'error'); }
    setSettingsLoading(false);
  }

  async function handleCopy(text, label) {
    try { await navigator.clipboard.writeText(text); toast(label + ' copied!'); setTimeout(function() { navigator.clipboard.writeText(''); }, 30000); } catch(e) { toast('Copy failed', 'error'); }
  }
  function toggleReveal(id) { setRevealed(function(p) { var n = Object.assign({}, p); if(n[id]) delete n[id]; else n[id] = true; return n; }); }

  function handleImageUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 10*1024*1024) { toast('Max 10MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { toast('Images only', 'error'); return; }
    var reader = new FileReader();
    reader.onload = function(ev) {
      var img = new Image();
      img.onload = function() {
        var maxW = 800; var maxH = 800;
        var w = img.width; var h = img.height;
        if (w > maxW || h > maxH) {
          var ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio); h = Math.round(h * ratio);
        }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var compressed = canvas.toDataURL('image/jpeg', 0.7);
        var compressedSize = Math.round(compressed.length * 0.75);
        setEditingEntry(function(p) { return Object.assign({}, p, { images: (p.images||[]).concat([{ id: generateId(), name: file.name, type: 'image/jpeg', size: compressedSize, data: compressed, addedAt: Date.now() }]) }); });
        toast('Image compressed & attached');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
  function removeImage(imgId) { setEditingEntry(function(p) { return Object.assign({}, p, { images: (p.images||[]).filter(function(i) { return i.id !== imgId; }) }); }); }
  function formatSize(b) { if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB'; }

  function handleAddProject() {
    if (!newProjectName.trim()) return;
    var proj = { id: generateId(), name: newProjectName.trim(), icon: newProjectIcon, color: newProjectColor, createdAt: Date.now() };
    setProjects(function(p) { return p.concat([proj]); }); setActiveProject(proj.id);
    setNewProjectName(''); setNewProjectIcon('🌐'); setNewProjectColor('#3b82f6'); setShowNewProject(false); toast('Project created');
  }
  function handleDeleteProject(id) {
    setProjects(function(p) { return p.filter(function(x) { return x.id !== id; }); });
    setEntries(function(p) { return p.filter(function(x) { return x.projectId !== id; }); });
    if (activeProject === id) { var r = projects.filter(function(x) { return x.id !== id; }); setActiveProject(r.length > 0 ? r[0].id : null); }
    setConfirmDelete(null); toast('Project deleted');
  }
  function handleUpdateProject() { if(!editProject) return; setProjects(function(p) { return p.map(function(x) { return x.id===editProject.id?editProject:x; }); }); setEditProject(null); toast('Project updated'); }
  function handleNewEntry() {
    if (!activeProject || activeProject === '__all__') { if (projects.length === 0) { toast('Create a project first', 'error'); return; } setActiveProject(projects[0].id); }
    setEditingEntry({ id: generateId(), projectId: activeProject === '__all__' ? projects[0].id : activeProject, name: '', value: '', keyType: 'api_key', notes: '', images: [], isNew: true, createdAt: Date.now(), updatedAt: Date.now() });
    setView('entries');
  }
  function handleSaveEntry() {
    if (!editingEntry || !editingEntry.name.trim()) { toast('Name required', 'error'); return; }
    var saved = Object.assign({}, editingEntry, { updatedAt: Date.now() }); delete saved.isNew;
    if (entries.find(function(e) { return e.id === saved.id; })) { setEntries(function(p) { return p.map(function(e) { return e.id === saved.id ? saved : e; }); }); toast('Entry updated & synced'); }
    else { setEntries(function(p) { return p.concat([saved]); }); toast('Entry saved & synced'); }
    setEditingEntry(null);
  }
  function handleDeleteEntry(id) { setEntries(function(p) { return p.filter(function(e) { return e.id !== id; }); }); setConfirmDelete(null); toast('Entry deleted'); }
  function handleDuplicateEntry(entry) { setEntries(function(p) { return p.concat([Object.assign({}, entry, { id: generateId(), name: entry.name + ' (copy)', images: (entry.images||[]).slice(), createdAt: Date.now(), updatedAt: Date.now() })]); }); toast('Duplicated'); }
  async function handleForceSync() { if(!cryptoKey||!ownerHash) return; setSyncing(true); toast('Syncing...'); await syncToCloud(cryptoKey, ownerHash, projects, entries); toast('Synced!'); }

  var filteredEntries = useMemo(function() {
    var list = activeProject === '__all__' ? entries : entries.filter(function(e) { return e.projectId === activeProject; });
    if (search) { var q = search.toLowerCase(); list = list.filter(function(e) { return e.name.toLowerCase().includes(q)||(e.notes||'').toLowerCase().includes(q)||e.keyType.toLowerCase().includes(q); }); }
    return list.sort(function(a,b) { return (b.updatedAt||0)-(a.updatedAt||0); });
  }, [entries, activeProject, search]);
  var activeProjectData = projects.find(function(p) { return p.id === activeProject; });

  // ═══ LOCK SCREEN ═══
  if (phase === 'lock') {
    return (
      <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 20% 10%,'+C.navyL+' 0%,'+C.navy+' 55%,#060a12 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FONT.body }}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ background:'linear-gradient(150deg,'+C.navyL+','+C.navy+')', border:'1px solid '+C.border, borderRadius:24, padding:'44px 40px', width:420, maxWidth:'92vw', textAlign:'center', boxShadow:'0 30px 80px rgba(0,0,0,0.5)', animation: unlockAnim?'vaultOpen 0.65s ease forwards':shaking?'shake 0.4s ease':'fadeUp 0.5s ease' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', margin:'0 auto 20px', background:'linear-gradient(135deg,'+C.teal+'20,'+C.gold+'20)', border:'2px solid '+C.teal+'40', display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse 3s ease-in-out infinite' }}><span style={{ fontSize:38 }}>🛡️</span></div>
          <h1 style={{ fontFamily:FONT.display, fontSize:26, color:C.txt, margin:'0 0 4px' }}>Project <span style={{ color:C.teal }}>Vault</span></h1>
          <p style={{ color:C.txt2, fontSize:13, margin:'0 0 28px', lineHeight:1.5 }}>Encrypted key storage, synced to the cloud.<br/>Access from any device, anywhere.</p>
          <div style={{ position:'relative', marginBottom:18 }}>
            <input type="password" placeholder="Master Password" value={pw} onChange={function(e){setPw(e.target.value)}} onKeyDown={function(e){if(e.key==='Enter')handleUnlock()}}
              style={{ width:'100%', padding:'14px 44px 14px 16px', fontSize:15, fontFamily:FONT.mono, background:C.navyM, border:'1px solid '+C.border, borderRadius:11, color:C.txt }} />
            <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.35 }}>🔑</span>
          </div>
          <button onClick={handleUnlock} disabled={loading}
            style={Object.assign({}, btnBase, { width:'100%', justifyContent:'center', padding:'14px', fontSize:15, background:loading?C.teal+'66':'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff', borderRadius:11, boxShadow:'0 4px 18px '+C.teal+'30' })}>
            {loading ? <span style={{ width:18,height:18,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.5s linear infinite',display:'inline-block' }}/> : 'Unlock Vault'}
          </button>
          <div style={{ marginTop:24, padding:'11px 14px', background:C.teal+'08', border:'1px solid '+C.teal+'18', borderRadius:10 }}>
            <p style={{ color:C.teal, fontSize:10, margin:0, lineHeight:1.6, fontWeight:500 }}>🛡️ AES-256-GCM · PBKDF2 600K iterations<br/>☁️ Cloud synced · Access anywhere<br/>📎 Image attachments · ⚙️ Change password in settings</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══ MAIN VAULT ═══
  function renderNavItem(icon, label, vid, badge) {
    return <div onClick={function(){setView(vid);setEditingEntry(null);}} style={{ display:'flex', alignItems:'center', gap:sideOpen?10:0, padding:sideOpen?'9px 14px':'9px 0', justifyContent:sideOpen?'flex-start':'center', borderRadius:9, cursor:'pointer', marginBottom:1, background:view===vid?C.gold+'12':'transparent', borderLeft:view===vid?'3px solid '+C.gold:'3px solid transparent', transition:'all 0.15s' }}>
      <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>
      {sideOpen && <span style={{ fontSize:12, fontWeight:view===vid?600:400, color:view===vid?C.txt:C.txt2, whiteSpace:'nowrap', flex:1 }}>{label}</span>}
      {sideOpen && badge > 0 && <span style={{ fontSize:10, fontWeight:600, background:C.gold+'18', color:C.gold, padding:'1px 7px', borderRadius:8 }}>{badge}</span>}
    </div>;
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,'+C.navy+',#060a12)', fontFamily:FONT.body, color:C.txt, display:'flex' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* SIDEBAR */}
      <div style={{ width:sideOpen?250:58, minHeight:'100vh', background:C.navyL, borderRight:'1px solid '+C.border, transition:'width 0.25s ease', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
        <div style={{ padding:sideOpen?'16px 18px 14px':'16px 12px 14px', borderBottom:'1px solid '+C.border, display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={function(){setSideOpen(!sideOpen)}}>
          <span style={{ fontSize:20 }}>🛡️</span>
          {sideOpen && <span style={{ fontFamily:FONT.display, fontSize:16, color:C.txt, whiteSpace:'nowrap' }}>Project <span style={{color:C.teal}}>Vault</span></span>}
        </div>
        <div style={{ padding:'8px 6px', flex:1, overflowY:'auto' }}>
          {sideOpen && <div style={{ fontSize:9, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.5, padding:'6px 12px' }}>Views</div>}
          {renderNavItem('🔑','All Entries','entries',entries.length)}
          {renderNavItem('⚙️','Settings','settings',0)}

          {sideOpen && <div style={{ fontSize:9, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.5, padding:'14px 12px 6px' }}>Projects</div>}
          <div onClick={function(){setActiveProject('__all__');setView('entries');setEditingEntry(null)}} style={{ display:'flex', alignItems:'center', gap:sideOpen?9:0, padding:sideOpen?'9px 12px':'9px 0', justifyContent:sideOpen?'flex-start':'center', borderRadius:9, cursor:'pointer', marginBottom:2, background:activeProject==='__all__'&&view==='entries'?C.gold+'12':'transparent', borderLeft:activeProject==='__all__'&&view==='entries'?'3px solid '+C.gold:'3px solid transparent' }}>
            <span style={{ fontSize:15 }}>📂</span>
            {sideOpen && <><span style={{ fontSize:12, fontWeight:activeProject==='__all__'?600:400, color:activeProject==='__all__'?C.txt:C.txt2, flex:1 }}>All Keys</span><span style={{ fontSize:10, fontWeight:600, color:C.gold, background:C.gold+'15', padding:'1px 7px', borderRadius:8 }}>{entries.length}</span></>}
          </div>
          {projects.map(function(proj,idx) {
            var isA = activeProject===proj.id&&view==='entries';
            var cnt = entries.filter(function(e){return e.projectId===proj.id}).length;
            return <div key={proj.id} onClick={function(){setActiveProject(proj.id);setView('entries');setEditingEntry(null)}} style={{ display:'flex', alignItems:'center', gap:sideOpen?9:0, padding:sideOpen?'9px 12px':'9px 0', justifyContent:sideOpen?'flex-start':'center', borderRadius:9, cursor:'pointer', marginBottom:2, background:isA?(proj.color||'#3b82f6')+'12':'transparent', borderLeft:isA?'3px solid '+(proj.color||'#3b82f6'):'3px solid transparent', transition:'all 0.15s', animation:'slideIn 0.2s ease '+(idx*0.03)+'s both' }}>
              <span style={{ fontSize:15, flexShrink:0 }}>{proj.icon||'🌐'}</span>
              {sideOpen && <><span style={{ fontSize:12, fontWeight:isA?600:400, color:isA?C.txt:C.txt2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{proj.name}</span><span style={{ fontSize:10, fontWeight:600, color:isA?proj.color:C.txt3, background:isA?(proj.color||'#3b82f6')+'18':C.txt3+'12', padding:'1px 7px', borderRadius:8 }}>{cnt}</span>{isA&&<span style={{fontSize:11,cursor:'pointer',opacity:0.5,padding:'2px 4px'}} onClick={function(e){e.stopPropagation();setEditProject(Object.assign({},proj))}}>✏️</span>}</>}
            </div>;
          })}
          <div onClick={function(){setShowNewProject(true)}} style={{ display:'flex', alignItems:'center', gap:sideOpen?9:0, padding:sideOpen?'9px 12px':'9px 0', justifyContent:sideOpen?'flex-start':'center', borderRadius:9, cursor:'pointer', marginTop:8, border:'1px dashed '+C.border }}>
            <span style={{ fontSize:14 }}>➕</span>
            {sideOpen && <span style={{ fontSize:12, color:C.txt3 }}>New Project</span>}
          </div>
        </div>
        <div style={{ padding:'10px 6px', borderTop:'1px solid '+C.border }}>
          {sideOpen && <div onClick={handleForceSync} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', marginBottom:4, borderRadius:8, cursor:'pointer', background:C.teal+'06' }}><span style={{ fontSize:12, animation:syncing?'syncPulse 1s ease infinite':'none' }}>{syncing?'🔄':'☁️'}</span><span style={{ fontSize:10, color:C.teal }}>{syncing?'Syncing...':lastSync?'Synced '+lastSync.toLocaleTimeString():'Click to sync'}</span></div>}
          <div onClick={handleLock} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:9, cursor:'pointer', justifyContent:sideOpen?'flex-start':'center', background:C.danger+'08' }}><span style={{ fontSize:15 }}>🔒</span>{sideOpen && <span style={{ fontSize:12, color:C.danger, fontWeight:600 }}>Lock Vault</span>}</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ padding:'12px 22px', borderBottom:'1px solid '+C.border, display:'flex', alignItems:'center', gap:14, background:C.navyL+'80', backdropFilter:'blur(10px)' }}>
          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, opacity:0.35 }}>🔍</span>
            <input ref={searchRef} placeholder="Search keys... (⌘F)" value={search} onChange={function(e){setSearch(e.target.value)}} style={{ width:'100%', maxWidth:380, padding:'9px 12px 9px 36px', fontSize:13, fontFamily:FONT.body, background:C.navyM, border:'1px solid '+C.border, borderRadius:9, color:C.txt }} />
          </div>
          <div style={{ fontSize:11, color:C.txt3, fontFamily:FONT.mono }}>{entries.length} keys · {projects.length} projects</div>
          <button onClick={handleNewEntry} style={Object.assign({}, btnBase, { padding:'9px 16px', background:'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff', boxShadow:'0 2px 10px '+C.teal+'28' })}>+ Add Key</button>
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'24px 28px' }}>

          {/* ═══ SETTINGS VIEW ═══ */}
          {view === 'settings' && (
            <div style={{ maxWidth:480, animation:'fadeUp 0.3s ease' }}>
              <h2 style={{ fontFamily:FONT.display, fontSize:24, margin:'0 0 24px' }}>⚙️ Vault Settings</h2>

              <div style={{ padding:'22px 20px', background:C.surface, borderRadius:14, border:'1px solid '+C.border, marginBottom:16 }}>
                <h3 style={{ fontFamily:FONT.display, fontSize:18, margin:'0 0 16px' }}>🔑 Change Master Password</h3>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>Current Password</label>
                  <input type="password" value={settingsCurrent} onChange={function(e){setSettingsCurrent(e.target.value)}} placeholder="Enter current password"
                    style={{ width:'100%', padding:'11px 14px', fontSize:14, fontFamily:FONT.mono, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>New Password</label>
                  <input type="password" value={settingsNew} onChange={function(e){setSettingsNew(e.target.value)}} placeholder="Enter new password"
                    style={{ width:'100%', padding:'11px 14px', fontSize:14, fontFamily:FONT.mono, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }} />
                </div>
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>Confirm New Password</label>
                  <input type="password" value={settingsConfirm} onChange={function(e){setSettingsConfirm(e.target.value)}} placeholder="Confirm new password"
                    onKeyDown={function(e){if(e.key==='Enter')handleChangePassword()}}
                    style={{ width:'100%', padding:'11px 14px', fontSize:14, fontFamily:FONT.mono, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }} />
                </div>
                {settingsNew && settingsConfirm && settingsNew !== settingsConfirm && (
                  <div style={{ marginBottom:12, padding:'8px 12px', background:C.danger+'10', border:'1px solid '+C.danger+'25', borderRadius:8 }}>
                    <span style={{ fontSize:12, color:C.danger }}>Passwords do not match</span>
                  </div>
                )}
                <button onClick={handleChangePassword} disabled={settingsLoading || !settingsCurrent || !settingsNew || settingsNew !== settingsConfirm}
                  style={Object.assign({}, btnBase, { padding:'11px 22px', background: (settingsLoading||!settingsCurrent||!settingsNew||settingsNew!==settingsConfirm) ? C.teal+'44' : 'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff' })}>
                  {settingsLoading ? '🔄 Changing...' : '🔐 Change Password'}
                </button>
              </div>

              <div style={{ padding:'16px 18px', background:C.surface, borderRadius:12, border:'1px solid '+C.border, marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>☁️ Cloud Sync</div>
                <div style={{ fontSize:12, color:C.txt2 }}>{lastSync ? 'Last synced: ' + lastSync.toLocaleString() : 'Not yet synced this session'}</div>
                <div style={{ fontSize:11, color:C.txt3, marginTop:6 }}>Vault ID: {VAULT_ID}</div>
              </div>

              <div style={{ padding:'16px 18px', background:C.surface, borderRadius:12, border:'1px solid '+C.border, marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>🛡️ Security Info</div>
                <div style={{ fontSize:12, color:C.txt2, lineHeight:1.6 }}>
                  Encryption: AES-256-GCM<br/>
                  Key Derivation: PBKDF2 SHA-256, 600K iterations<br/>
                  Architecture: Zero-knowledge (server never sees plaintext)<br/>
                  Auto-lock: 10 minutes inactivity<br/>
                  Clipboard: Auto-clears after 30 seconds
                </div>
              </div>

              <div style={{ marginTop:28, padding:'18px', background:C.danger+'06', border:'1px solid '+C.danger+'20', borderRadius:12 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.danger, marginBottom:4 }}>⚠️ Important</div>
                <div style={{ fontSize:12, color:C.txt2, lineHeight:1.5 }}>If you change your password and forget it, your data cannot be recovered. There is no password reset — this is by design for zero-knowledge security.</div>
              </div>
            </div>
          )}

          {/* ═══ ENTRIES VIEW ═══ */}
          {view === 'entries' && (<>
            {projects.length === 0 && !editingEntry && (
              <div style={{ textAlign:'center', padding:'60px 20px', animation:'fadeUp 0.4s ease' }}>
                <div style={{ width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg,'+C.teal+'10,'+C.gold+'10)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:44 }}>🏗️</div>
                <h2 style={{ fontFamily:FONT.display, fontSize:22, margin:'0 0 8px' }}>Create Your First Project</h2>
                <p style={{ color:C.txt2, fontSize:13, maxWidth:340, margin:'0 auto 24px', lineHeight:1.5 }}>Organize your API keys, secrets, and credentials by project.</p>
                <button onClick={function(){setShowNewProject(true)}} style={Object.assign({}, btnBase, { padding:'12px 24px', fontSize:14, background:'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff' })}>+ Create Project</button>
              </div>
            )}

            {activeProject && activeProject !== '__all__' && activeProjectData && !editingEntry && (
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22, animation:'fadeUp 0.2s ease' }}>
                <div style={{ width:48, height:48, borderRadius:13, background:(activeProjectData.color||'#3b82f6')+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{activeProjectData.icon||'🌐'}</div>
                <div style={{ flex:1 }}><h2 style={{ fontFamily:FONT.display, fontSize:22, margin:0 }}>{activeProjectData.name}</h2><span style={{ fontSize:11, color:C.txt3 }}>{filteredEntries.length} keys</span></div>
                <button onClick={function(){setConfirmDelete({type:'project',id:activeProjectData.id,name:activeProjectData.name})}} style={Object.assign({}, btnBase, { padding:'7px 12px', fontSize:11, background:C.danger+'08', color:C.danger, border:'1px solid '+C.danger+'20' })}>🗑️</button>
              </div>
            )}

            {activeProject === '__all__' && !editingEntry && (
              <div style={{ marginBottom:22 }}><h2 style={{ fontFamily:FONT.display, fontSize:22, margin:'0 0 4px' }}>All Keys</h2><span style={{ fontSize:11, color:C.txt3 }}>{filteredEntries.length} keys across {projects.length} projects</span></div>
            )}

            {/* ENTRY EDITOR */}
            {editingEntry && (
              <div style={{ maxWidth:580, animation:'fadeUp 0.2s ease' }}>
                <h2 style={{ fontFamily:FONT.display, fontSize:20, margin:'0 0 20px' }}>{editingEntry.isNew?'Add New Key':'Edit Key'}</h2>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:6 }}>📦 Key Type</label>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {KEY_TYPES.map(function(kt) { var a=editingEntry.keyType===kt.id; return <button key={kt.id} onClick={function(){setEditingEntry(function(p){return Object.assign({},p,{keyType:kt.id})})}} style={Object.assign({}, btnBase, { padding:'6px 12px', fontSize:11, background:a?kt.color+'18':C.navyM, color:a?kt.color:C.txt3, border:'1px solid '+(a?kt.color+'40':C.border) })}>{kt.icon} {kt.label}</button>; })}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>📌 Key Name</label>
                  <input value={editingEntry.name} placeholder="e.g. Supabase Anon Key" onChange={function(e){setEditingEntry(function(p){return Object.assign({},p,{name:e.target.value})})}} style={{ width:'100%', padding:'11px 14px', fontSize:14, fontFamily:FONT.body, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>🔑 Key Value</label>
                  <textarea value={editingEntry.value} placeholder="Paste your key here..." onChange={function(e){setEditingEntry(function(p){return Object.assign({},p,{value:e.target.value})})}} rows={3} style={{ width:'100%', padding:'11px 14px', fontSize:13, fontFamily:FONT.mono, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt, resize:'vertical' }} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>🏷️ Project</label>
                  <select value={editingEntry.projectId} onChange={function(e){setEditingEntry(function(p){return Object.assign({},p,{projectId:e.target.value})})}} style={{ width:'100%', padding:'11px 14px', fontSize:13, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }}>
                    {projects.map(function(p) { return <option key={p.id} value={p.id}>{p.icon} {p.name}</option>; })}
                  </select>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>📝 Notes</label>
                  <textarea value={editingEntry.notes||''} placeholder="Optional notes..." onChange={function(e){setEditingEntry(function(p){return Object.assign({},p,{notes:e.target.value})})}} rows={2} style={{ width:'100%', padding:'11px 14px', fontSize:13, fontFamily:FONT.body, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt, resize:'vertical' }} />
                </div>
                {/* Images */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:6 }}>📎 Attachments</label>
                  {editingEntry.images && editingEntry.images.length > 0 && (
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:10 }}>
                      {editingEntry.images.map(function(img) {
                        return <div key={img.id} style={{ position:'relative', borderRadius:10, overflow:'hidden', border:'1px solid '+C.border, background:C.navyM }}>
                          <img src={img.data} alt={img.name} style={{ width:120, height:90, objectFit:'cover', display:'block', cursor:'pointer' }} onClick={function(){setImagePreview(img)}} />
                          <div style={{ padding:'4px 8px', fontSize:10, color:C.txt3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:120 }}>{img.name}</div>
                          <div style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:C.danger, color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:12, fontWeight:700 }} onClick={function(){removeImage(img.id)}}>×</div>
                        </div>;
                      })}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} />
                  <button onClick={function(){if(fileInputRef.current)fileInputRef.current.click()}} style={Object.assign({}, btnBase, { padding:'9px 16px', fontSize:12, background:C.navyM, color:C.txt2, border:'1px dashed '+C.border })}>📎 Attach Image</button>
                  <span style={{ fontSize:10, color:C.txt3, marginLeft:10 }}>Max 5MB each. Encrypted with your data.</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={handleSaveEntry} style={Object.assign({}, btnBase, { padding:'11px 22px', background:'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff', boxShadow:'0 2px 10px '+C.teal+'28' })}>🔐 Encrypt & Save</button>
                  <button onClick={function(){setEditingEntry(null)}} style={Object.assign({}, btnBase, { padding:'11px 18px', background:C.txt3+'12', color:C.txt2 })}>Cancel</button>
                </div>
              </div>
            )}

            {/* ENTRY LIST */}
            {!editingEntry && activeProject && filteredEntries.length > 0 && (
              <div style={{ animation:'fadeUp 0.2s ease' }}>
                {filteredEntries.map(function(entry, i) {
                  var kt = KEY_TYPES.find(function(k){return k.id===entry.keyType})||KEY_TYPES[0];
                  var proj = projects.find(function(p){return p.id===entry.projectId});
                  var isR = revealed[entry.id];
                  var masked = entry.value?(entry.value.slice(0,6)+'••••••••••'+entry.value.slice(-4)):'(empty)';
                  if(entry.value&&entry.value.length<=12) masked='••••••••••••';
                  var hasImg = entry.images&&entry.images.length>0;
                  var imgExp = expandedImages[entry.id];
                  return <div key={entry.id} style={{ padding:'16px 18px', background:C.surface, borderRadius:12, border:'1px solid '+C.border, marginBottom:10, animation:'fadeUp 0.15s ease '+(i*0.03)+'s both' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:kt.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{kt.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                          <span style={{ fontSize:14, fontWeight:600 }}>{entry.name}</span>
                          <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:5, background:kt.color+'15', color:kt.color }}>{kt.label}</span>
                          {hasImg && <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:5, background:C.gold+'12', color:C.gold }}>📎 {entry.images.length}</span>}
                          {activeProject==='__all__'&&proj && <span style={{ fontSize:9, fontWeight:600, padding:'2px 8px', borderRadius:5, background:(proj.color||'#3b82f6')+'12', color:proj.color||'#3b82f6' }}>{proj.icon} {proj.name}</span>}
                        </div>
                        <div style={{ fontFamily:FONT.mono, fontSize:12, color:isR?C.teal:C.txt3, letterSpacing:isR?0:0.5, wordBreak:'break-all', padding:'8px 10px', background:C.navyM, borderRadius:8, border:'1px solid '+C.border, marginTop:2, maxHeight:isR?200:28, overflow:'hidden', transition:'max-height 0.3s ease' }}>{isR?entry.value:masked}</div>
                        {entry.notes && <div style={{ fontSize:11, color:C.txt3, marginTop:6, lineHeight:1.4 }}>📝 {entry.notes}</div>}
                        {hasImg && <div style={{ marginTop:8 }}>
                          <div onClick={function(){setExpandedImages(function(p){var n=Object.assign({},p);if(n[entry.id])delete n[entry.id];else n[entry.id]=true;return n})}} style={{ fontSize:11, color:C.gold, cursor:'pointer', fontWeight:600, marginBottom:6 }}>{imgExp?'▾ Hide':'▸ Show '+entry.images.length+' attachment'+(entry.images.length>1?'s':'')}</div>
                          {imgExp && <div style={{ display:'flex', gap:8, flexWrap:'wrap', animation:'fadeIn 0.2s ease' }}>
                            {entry.images.map(function(img) { return <div key={img.id} style={{ borderRadius:8, overflow:'hidden', border:'1px solid '+C.border, cursor:'pointer' }} onClick={function(){setImagePreview(img)}}><img src={img.data} alt={img.name} style={{ width:100, height:75, objectFit:'cover', display:'block' }} /><div style={{ padding:'3px 6px', fontSize:9, color:C.txt3, background:C.navyM, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:100 }}>{img.name}</div></div>; })}
                          </div>}
                        </div>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                        <span style={{ cursor:'pointer', fontSize:13, padding:'5px 7px', borderRadius:6, background:C.teal+'10', textAlign:'center' }} onClick={function(){toggleReveal(entry.id)}}>{isR?'🙈':'👁️'}</span>
                        <span style={{ cursor:'pointer', fontSize:13, padding:'5px 7px', borderRadius:6, background:C.gold+'10', textAlign:'center' }} onClick={function(){handleCopy(entry.value,entry.name)}}>📋</span>
                        <span style={{ cursor:'pointer', fontSize:13, padding:'5px 7px', borderRadius:6, background:C.txt3+'10', textAlign:'center' }} onClick={function(){setEditingEntry(Object.assign({},entry,{images:(entry.images||[]).slice()}))}}>✏️</span>
                        <span style={{ cursor:'pointer', fontSize:13, padding:'5px 7px', borderRadius:6, background:C.txt3+'10', textAlign:'center' }} onClick={function(){handleDuplicateEntry(entry)}}>📑</span>
                        <span style={{ cursor:'pointer', fontSize:13, padding:'5px 7px', borderRadius:6, background:C.danger+'08', textAlign:'center' }} onClick={function(){setConfirmDelete({type:'entry',id:entry.id,name:entry.name})}}>🗑️</span>
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            )}

            {!editingEntry && activeProject && activeProject !== '__all__' && filteredEntries.length === 0 && projects.length > 0 && (
              <div style={{ textAlign:'center', padding:'50px 20px', animation:'fadeIn 0.3s ease' }}>
                <span style={{ fontSize:40, display:'block', marginBottom:12 }}>🔑</span>
                <p style={{ color:C.txt2, fontSize:13, marginBottom:14 }}>No keys in this project yet</p>
                <button onClick={handleNewEntry} style={Object.assign({}, btnBase, { padding:'9px 18px', background:C.teal+'12', color:C.teal, border:'1px solid '+C.teal+'25' })}>+ Add Your First Key</button>
              </div>
            )}
          </>)}
        </div>
      </div>

      {/* MODALS */}
      {showNewProject && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={function(e){if(e.target===e.currentTarget)setShowNewProject(false)}}>
        <div style={{ background:'linear-gradient(150deg,'+C.navyL+','+C.navy+')', border:'1px solid '+C.border, borderRadius:18, padding:'28px 30px', width:420, maxWidth:'92vw', animation:'fadeUp 0.25s ease' }}>
          <h3 style={{ fontFamily:FONT.display, fontSize:20, margin:'0 0 18px' }}>New Project</h3>
          <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>📌 Name</label><input value={newProjectName} placeholder="e.g. ShiftPro.ai" autoFocus onChange={function(e){setNewProjectName(e.target.value)}} onKeyDown={function(e){if(e.key==='Enter')handleAddProject()}} style={{ width:'100%', padding:'11px 14px', fontSize:14, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }} /></div>
          <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>🎨 Icon</label><div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>{projectIcons.map(function(ic){return <span key={ic} onClick={function(){setNewProjectIcon(ic)}} style={{ fontSize:20, padding:'6px 8px', borderRadius:8, cursor:'pointer', background:newProjectIcon===ic?C.teal+'20':'transparent', border:newProjectIcon===ic?'1px solid '+C.teal+'40':'1px solid transparent' }}>{ic}</span>})}</div></div>
          <div style={{ marginBottom:20 }}><label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>🎨 Color</label><div style={{ display:'flex', gap:6 }}>{projectColors.map(function(col){return <div key={col} onClick={function(){setNewProjectColor(col)}} style={{ width:28, height:28, borderRadius:'50%', background:col, cursor:'pointer', border:newProjectColor===col?'3px solid white':'3px solid transparent' }}/>})}</div></div>
          <div style={{ display:'flex', gap:8 }}><button onClick={handleAddProject} style={Object.assign({}, btnBase, { padding:'10px 22px', background:'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff' })}>Create</button><button onClick={function(){setShowNewProject(false)}} style={Object.assign({}, btnBase, { padding:'10px 18px', background:C.txt3+'12', color:C.txt2 })}>Cancel</button></div>
        </div>
      </div>}

      {editProject && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={function(e){if(e.target===e.currentTarget)setEditProject(null)}}>
        <div style={{ background:'linear-gradient(150deg,'+C.navyL+','+C.navy+')', border:'1px solid '+C.border, borderRadius:18, padding:'28px 30px', width:420, maxWidth:'92vw', animation:'fadeUp 0.25s ease' }}>
          <h3 style={{ fontFamily:FONT.display, fontSize:20, margin:'0 0 18px' }}>Edit Project</h3>
          <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>📌 Name</label><input value={editProject.name} onChange={function(e){setEditProject(function(p){return Object.assign({},p,{name:e.target.value})})}} style={{ width:'100%', padding:'11px 14px', fontSize:14, background:C.navyM, border:'1px solid '+C.border, borderRadius:10, color:C.txt }} /></div>
          <div style={{ marginBottom:14 }}><label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>🎨 Icon</label><div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>{projectIcons.map(function(ic){return <span key={ic} onClick={function(){setEditProject(function(p){return Object.assign({},p,{icon:ic})})}} style={{ fontSize:20, padding:'6px 8px', borderRadius:8, cursor:'pointer', background:editProject.icon===ic?C.teal+'20':'transparent', border:editProject.icon===ic?'1px solid '+C.teal+'40':'1px solid transparent' }}>{ic}</span>})}</div></div>
          <div style={{ marginBottom:20 }}><label style={{ fontSize:10, fontWeight:700, color:C.txt3, textTransform:'uppercase', letterSpacing:1.2, display:'block', marginBottom:5 }}>🎨 Color</label><div style={{ display:'flex', gap:6 }}>{projectColors.map(function(col){return <div key={col} onClick={function(){setEditProject(function(p){return Object.assign({},p,{color:col})})}} style={{ width:28, height:28, borderRadius:'50%', background:col, cursor:'pointer', border:editProject.color===col?'3px solid white':'3px solid transparent' }}/>})}</div></div>
          <div style={{ display:'flex', gap:8 }}><button onClick={handleUpdateProject} style={Object.assign({}, btnBase, { padding:'10px 22px', background:'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff' })}>Save</button><button onClick={function(){setEditProject(null)}} style={Object.assign({}, btnBase, { padding:'10px 18px', background:C.txt3+'12', color:C.txt2 })}>Cancel</button></div>
        </div>
      </div>}

      {confirmDelete && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={function(e){if(e.target===e.currentTarget)setConfirmDelete(null)}}>
        <div style={{ background:'linear-gradient(150deg,'+C.navyL+','+C.navy+')', border:'1px solid '+C.danger+'30', borderRadius:18, padding:'28px 30px', width:400, maxWidth:'92vw', animation:'fadeUp 0.25s ease', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
          <h3 style={{ fontFamily:FONT.display, fontSize:18, margin:'0 0 8px' }}>Delete {confirmDelete.type==='project'?'Project':'Key'}?</h3>
          <p style={{ color:C.txt2, fontSize:13, marginBottom:20, lineHeight:1.5 }}>{confirmDelete.type==='project'?'This deletes "'+confirmDelete.name+'" and all its keys.':'This deletes "'+confirmDelete.name+'".'}<br/>Cannot be undone.</p>
          <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
            <button onClick={function(){if(confirmDelete.type==='project')handleDeleteProject(confirmDelete.id);else handleDeleteEntry(confirmDelete.id)}} style={Object.assign({}, btnBase, { padding:'10px 22px', background:C.danger, color:'#fff' })}>🗑️ Delete</button>
            <button onClick={function(){setConfirmDelete(null)}} style={Object.assign({}, btnBase, { padding:'10px 18px', background:C.txt3+'12', color:C.txt2 })}>Cancel</button>
          </div>
        </div>
      </div>}

      {imagePreview && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, cursor:'pointer', backdropFilter:'blur(8px)' }} onClick={function(){setImagePreview(null)}}>
        <div style={{ position:'relative', maxWidth:'90vw', maxHeight:'90vh', animation:'fadeUp 0.2s ease' }} onClick={function(e){e.stopPropagation()}}>
          <img src={imagePreview.data} alt={imagePreview.name} style={{ maxWidth:'90vw', maxHeight:'85vh', borderRadius:12, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }} />
          <div style={{ textAlign:'center', marginTop:10 }}><span style={{ fontSize:13, color:C.txt2 }}>{imagePreview.name}</span><span style={{ fontSize:11, color:C.txt3, marginLeft:10 }}>{formatSize(imagePreview.size)}</span></div>
          <div style={{ position:'absolute', top:-12, right:-12, width:32, height:32, borderRadius:'50%', background:C.danger, color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, fontWeight:700 }} onClick={function(){setImagePreview(null)}}>×</div>
        </div>
      </div>}

      <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column-reverse', gap:6, alignItems:'center' }}>
        {toasts.map(function(t) { return <div key={t.id} style={{ padding:'9px 20px', borderRadius:11, background:t.type==='error'?C.danger:'linear-gradient(135deg,'+C.teal+',#1aab9f)', color:'#fff', fontWeight:600, fontSize:13, boxShadow:'0 6px 24px '+(t.type==='error'?C.danger:C.teal)+'40', animation:'toastIn 0.25s ease', whiteSpace:'nowrap' }}>{t.type==='error'?'✕':'✓'} {t.msg}</div>; })}
      </div>
    </div>
  );
}
