#!/usr/bin/env python3
"""
Fix: Move LocationGateNone and LocationGatePick outside OwnerCmd
so they don't re-mount on every keystroke.
"""
import re

path = "src/components/ShiftProAppContent.jsx"

with open(path, "r") as f:
    content = f.read()

# ── 1. REMOVE the two inner component definitions from inside OwnerCmd ──
# We'll replace them with external-component calls further below.

# Remove LocationGateNone inner definition (it starts with "// ── LOCATION GATE: No locations ──")
old_gate_none = '''  // ── LOCATION GATE: No locations ──
  const LocationGateNone = () => {
    const [form,setForm] = useState({name:"",address:"",timezone:"America/Los_Angeles"});
    const [busy,setBusy] = useState(false);
    const [err,setErr] = useState("");

    return (
      <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#fff9f0,#fff5e8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
        <div style={{background:"#fff",borderRadius:20,padding:"40px",width:"100%",maxWidth:480,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",animation:"fadeUp 0.4s ease"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:48,marginBottom:12}}>📍</div>
            <div style={{fontFamily:O.sans,fontWeight:800,fontSize:26,color:O.text,marginBottom:8}}>Set up your first location</div>
            <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.6,maxWidth:360,margin:"0 auto"}}>Every team, schedule, and payroll is organized by location. Add your first one to get started.</div>
          </div>
          {[{l:"Location Name",k:"name",ph:"Main Bar, Downtown Shop, Warehouse..."},{l:"Street Address",k:"address",ph:"123 Main St, Newport, OR 97365"}].map(f=>(
            <div key={f.k} style={{marginBottom:14}}>
              <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>{f.l}</label>
              <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                style={{width:"100%",padding:"11px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:14,color:O.text,outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=O.amber} onBlur={e=>e.target.style.borderColor=O.border}/>
            </div>
          ))}
          <div style={{marginBottom:20}}>
            <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>Timezone</label>
            <select value={form.timezone} onChange={e=>setForm(p=>({...p,timezone:e.target.value}))}
              style={{width:"100%",padding:"11px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
              {[["America/Los_Angeles","Pacific Time (PT)"],["America/Denver","Mountain Time (MT)"],["America/Chicago","Central Time (CT)"],["America/New_York","Eastern Time (ET)"],["America/Anchorage","Alaska Time (AKT)"],["Pacific/Honolulu","Hawaii Time (HST)"]].map(([val,label])=>(
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          {err&&<div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"8px 12px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{err}</div>}
          <button onClick={async()=>{
            if(!form.name){setErr("Location name is required.");return;}
            setBusy(true);setErr("");
            try{
              const {createClient}=await import("@supabase/supabase-js");
              const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
              const {data:{session}}=await sb.auth.getSession();
              let orgId=activeOrg?.id||ownerProfile?.org_id;
              if(!orgId){
                const {data:oo}=await sb.from("owner_organizations").select("org_id").eq("owner_id",session?.user?.id).single();
                orgId=oo?.org_id;
              }
              if(!orgId) throw new Error("No company found. Please refresh and try again.");
              const res=await fetch("/api/location",{method:"POST",headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},body:JSON.stringify({orgId,name:form.name,address:form.address||"",timezone:form.timezone})});
              const result=await res.json();
              if(!res.ok) throw new Error(result.error||"Failed to create location");
              const newLoc=result.location;
              setLiveLocations([newLoc]);
              toast("Location created! ✓", "success");
              selectLocation(newLoc);
            }catch(e){ setErr(e.message||"Failed. Please try again."); }
            finally{setBusy(false);}
          }} style={{width:"100%",padding:"14px",background:busy?"rgba(224,123,0,0.5)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",cursor:busy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(224,123,0,0.3)"}}>
            {busy?"Creating location...":"Create Location and Continue →"}
          </button>
        </div>
      </div>
    );
  };

  // ── LOCATION GATE: Pick location ──
  const LocationGatePick = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(249,248,246,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px",width:"100%",maxWidth:520,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:10}}>📍</div>
          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text,marginBottom:6}}>Which location are you managing today?</div>
          <div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>Select a location to load your team, schedule, and payroll.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:liveLocations.length===1?"1fr":"1fr 1fr",gap:10,marginBottom:16}}>
          {liveLocations.map((loc,idx)=>(
            <button key={loc.id} onClick={()=>selectLocation(loc)}
              style={{padding:"18px 16px",background:O.bg3,border:"1.5px solid "+O.border,borderRadius:14,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=O.amber;e.currentTarget.style.background=O.amberD;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=O.border;e.currentTarget.style.background=O.bg3;e.currentTarget.style.transform="none";}}>
              <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:14,color:"#fff",marginBottom:10}}>{idx+1}</div>
              <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div>
              <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.address||"No address set"}</div>
            </button>
          ))}
          <button onClick={()=>{setLocationGate("ready");setActiveLocation(null);}}
            style={{padding:"18px 16px",background:"none",border:"1.5px dashed rgba(26,158,110,0.3)",borderRadius:14,cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}
            onMouseEnter={e=>{e.currentTarget.style.background=O.greenD;e.currentTarget.style.borderColor=O.green;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="rgba(26,158,110,0.3)";}}>
            <span style={{fontSize:22,color:O.green}}>🌐</span>
            <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green}}>Manage All</span>
          </button>
        </div>
        <button onClick={()=>{setAddLocOpen(true);setLocationGate("ready");}}
          style={{width:"100%",padding:"10px",background:"none",border:"1.5px dashed rgba(224,123,0,0.3)",borderRadius:10,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.amber,cursor:"pointer"}}>
          + Add New Location
        </button>
      </div>
    </div>
  );

  // ── CREATE LOCATION MODAL (from within the app) ──'''

new_gate_none = '''  // ── CREATE LOCATION MODAL (from within the app) ──'''

if old_gate_none in content:
    content = content.replace(old_gate_none, new_gate_none)
    print("✓ Removed inner LocationGateNone and LocationGatePick definitions")
else:
    print("✗ Could not find inner gate definitions — check file")

# ── 2. UPDATE render section to use new external components with props ──
old_render_gates = '''      {/* Location gates */}
      {locationGate==="none" && <LocationGateNone/>}
      {locationGate==="pick" && <LocationGatePick/>}'''

new_render_gates = '''      {/* Location gates */}
      {locationGate==="none" && (
        <LocationGateNone
          activeOrg={activeOrg}
          ownerProfile={ownerProfile}
          setLiveLocations={setLiveLocations}
          toast={toast}
          selectLocation={selectLocation}
        />
      )}
      {locationGate==="pick" && (
        <LocationGatePick
          liveLocations={liveLocations}
          selectLocation={selectLocation}
          setLocationGate={setLocationGate}
          setActiveLocation={setActiveLocation}
          setAddLocOpen={setAddLocOpen}
        />
      )}'''

if old_render_gates in content:
    content = content.replace(old_render_gates, new_render_gates)
    print("✓ Updated render section to use external components with props")
else:
    print("✗ Could not find render gates section")

# ── 3. INSERT external component definitions BEFORE OwnerCmd ──
external_components = '''// ══════════════════════════════════════════════════
//  LOCATION GATE COMPONENTS (defined outside OwnerCmd
//  to prevent remount on parent re-render)
// ══════════════════════════════════════════════════

function LocationGateNone({ activeOrg, ownerProfile, setLiveLocations, toast, selectLocation }) {
  const [form, setForm] = useState({ name: "", address: "", timezone: "America/Los_Angeles" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#fff9f0,#fff5e8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px",width:"100%",maxWidth:480,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:12}}>📍</div>
          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:26,color:O.text,marginBottom:8}}>Set up your first location</div>
          <div style={{fontFamily:O.sans,fontSize:14,color:O.textD,lineHeight:1.6,maxWidth:360,margin:"0 auto"}}>Every team, schedule, and payroll is organized by location. Add your first one to get started.</div>
        </div>
        {[
          {l:"Location Name",k:"name",ph:"Main Bar, Downtown Shop, Warehouse..."},
          {l:"Street Address",k:"address",ph:"123 Main St, Newport, OR 97365"}
        ].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>{f.l}</label>
            <input
              value={form[f.k]}
              onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
              placeholder={f.ph}
              style={{width:"100%",padding:"11px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:14,color:O.text,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=O.amber}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>
        ))}
        <div style={{marginBottom:20}}>
          <label style={{fontFamily:O.mono,fontSize:9,color:O.textF,letterSpacing:"1.5px",display:"block",marginBottom:6,textTransform:"uppercase"}}>Timezone</label>
          <select
            value={form.timezone}
            onChange={e=>setForm(p=>({...p,timezone:e.target.value}))}
            style={{width:"100%",padding:"11px 14px",background:O.bg3,border:"1px solid "+O.border,borderRadius:8,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
            {[
              ["America/Los_Angeles","Pacific Time (PT)"],
              ["America/Denver","Mountain Time (MT)"],
              ["America/Chicago","Central Time (CT)"],
              ["America/New_York","Eastern Time (ET)"],
              ["America/Anchorage","Alaska Time (AKT)"],
              ["Pacific/Honolulu","Hawaii Time (HST)"]
            ].map(([val,label])=>(
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {err&&(
          <div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"8px 12px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{err}</div>
        )}
        <button
          onClick={async()=>{
            if(!form.name){setErr("Location name is required.");return;}
            setBusy(true);setErr("");
            try{
              const {createClient}=await import("@supabase/supabase-js");
              const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
              const {data:{session}}=await sb.auth.getSession();
              let orgId=activeOrg?.id||ownerProfile?.org_id;
              if(!orgId){
                const {data:oo}=await sb.from("owner_organizations").select("org_id").eq("owner_id",session?.user?.id).single();
                orgId=oo?.org_id;
              }
              if(!orgId) throw new Error("No company found. Please refresh and try again.");
              const res=await fetch("/api/location",{
                method:"POST",
                headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},
                body:JSON.stringify({orgId,name:form.name,address:form.address||"",timezone:form.timezone})
              });
              const result=await res.json();
              if(!res.ok) throw new Error(result.error||"Failed to create location");
              const newLoc=result.location;
              setLiveLocations([newLoc]);
              toast("Location created! ✓","success");
              selectLocation(newLoc);
            }catch(e){
              setErr(e.message||"Failed. Please try again.");
            }finally{setBusy(false);}
          }}
          style={{width:"100%",padding:"14px",background:busy?"rgba(224,123,0,0.5)":"linear-gradient(135deg,#e07b00,#c96800)",border:"none",borderRadius:10,fontFamily:O.sans,fontWeight:700,fontSize:15,color:"#fff",cursor:busy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(224,123,0,0.3)"}}>
          {busy?"Creating location...":"Create Location and Continue →"}
        </button>
      </div>
    </div>
  );
}

function LocationGatePick({ liveLocations, selectLocation, setLocationGate, setActiveLocation, setAddLocOpen }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(249,248,246,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px",width:"100%",maxWidth:520,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:10}}>📍</div>
          <div style={{fontFamily:O.sans,fontWeight:800,fontSize:22,color:O.text,marginBottom:6}}>Which location are you managing today?</div>
          <div style={{fontFamily:O.sans,fontSize:13,color:O.textD}}>Select a location to load your team, schedule, and payroll.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:liveLocations.length===1?"1fr":"1fr 1fr",gap:10,marginBottom:16}}>
          {liveLocations.map((loc,idx)=>(
            <button key={loc.id} onClick={()=>selectLocation(loc)}
              style={{padding:"18px 16px",background:O.bg3,border:"1.5px solid "+O.border,borderRadius:14,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=O.amber;e.currentTarget.style.background=O.amberD;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=O.border;e.currentTarget.style.background=O.bg3;e.currentTarget.style.transform="none";}}>
              <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#e07b00,#c96800)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:O.mono,fontWeight:700,fontSize:14,color:"#fff",marginBottom:10}}>{idx+1}</div>
              <div style={{fontFamily:O.sans,fontWeight:700,fontSize:14,color:O.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div>
              <div style={{fontFamily:O.mono,fontSize:9,color:O.textF,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.address||"No address set"}</div>
            </button>
          ))}
          <button
            onClick={()=>{setLocationGate("ready");setActiveLocation(null);}}
            style={{padding:"18px 16px",background:"none",border:"1.5px dashed rgba(26,158,110,0.3)",borderRadius:14,cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}
            onMouseEnter={e=>{e.currentTarget.style.background=O.greenD;e.currentTarget.style.borderColor=O.green;}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="rgba(26,158,110,0.3)";}}>
            <span style={{fontSize:22,color:O.green}}>🌐</span>
            <span style={{fontFamily:O.sans,fontWeight:600,fontSize:12,color:O.green}}>Manage All</span>
          </button>
        </div>
        <button
          onClick={()=>{setAddLocOpen(true);setLocationGate("ready");}}
          style={{width:"100%",padding:"10px",background:"none",border:"1.5px dashed rgba(224,123,0,0.3)",borderRadius:10,fontFamily:O.sans,fontWeight:600,fontSize:13,color:O.amber,cursor:"pointer"}}>
          + Add New Location
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  OWNER COMMAND — WARM THEME v2
// ══════════════════════════════════════════════════'''

marker = "// ══════════════════════════════════════════════════\n//  OWNER COMMAND — WARM THEME v2\n// ══════════════════════════════════════════════════"

if marker in content:
    content = content.replace(marker, external_components)
    print("✓ Inserted external LocationGateNone + LocationGatePick before OwnerCmd")
else:
    print("✗ Could not find OwnerCmd marker")

with open(path, "w") as f:
    f.write(content)

print("\n✅ All done! Run: git add . && git commit -m 'fix: move LocationGate components outside OwnerCmd to prevent remount on keypress' && git push")
