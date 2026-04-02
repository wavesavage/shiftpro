#!/usr/bin/env python3
"""
Fix: Move AddLocationModal outside OwnerCmd to prevent remount on keypress.
Also moves InviteModal and BroadcastModal for the same reason.
"""

path = "src/components/ShiftProAppContent.jsx"

with open(path, "r") as f:
    content = f.read()

# ── 1. Remove AddLocationModal inner definition ──
old_add_loc = '''  // ── CREATE LOCATION MODAL (from within the app) ──
  const AddLocationModal = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setAddLocOpen(false);setAddLocErr("");}}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Add Location</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>New Physical Location</div>
          </div>
          <button onClick={()=>{setAddLocOpen(false);setAddLocErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        <div style={{background:"rgba(8,145,178,0.06)",border:"1px solid rgba(8,145,178,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>🏢</span>
          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.5}}>Adding location to <strong style={{color:O.text}}>{activeOrg?.name||ownerOrg?.name||"your company"}</strong>. Each location has its own team, schedule, and payroll.</div>
        </div>
        {[{l:"Location Name *",k:"name",ph:"Main Bar, Patio, Warehouse..."},{l:"Street Address",k:"address",ph:"123 Main St, Newport, OR 97365"}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
            <input value={addLocForm[f.k]} onChange={e=>setAddLocForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
              style={{width:"100%",padding:"10px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=O.cyan} onBlur={e=>e.target.style.borderColor=O.border}/>
          </div>
        ))}
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Timezone</div>
          <select value={addLocForm.timezone} onChange={e=>setAddLocForm(p=>({...p,timezone:e.target.value}))}
            style={{width:"100%",padding:"10px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
            {[["America/Los_Angeles","Pacific Time (PT)"],["America/Denver","Mountain Time (MT)"],["America/Chicago","Central Time (CT)"],["America/New_York","Eastern Time (ET)"],["America/Anchorage","Alaska (AKT)"],["Pacific/Honolulu","Hawaii (HST)"]].map(([val,label])=>(
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {addLocErr&&<div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"7px 10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{addLocErr}</div>}
        <button onClick={async()=>{
          if(!addLocForm.name){setAddLocErr("Location name is required.");return;}
          setAddLocBusy(true);setAddLocErr("");
          try{
            const {createClient}=await import("@supabase/supabase-js");
            const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            const {data:{session}}=await sb.auth.getSession();
            let orgId=activeOrg?.id||ownerProfile?.org_id;
            if(!orgId){
              const {data:oo}=await sb.from("owner_organizations").select("org_id").eq("owner_id",session?.user?.id).single();
              orgId=oo?.org_id;
            }
            if(!orgId) throw new Error("No company selected. Please refresh and try again.");
            const res=await fetch("/api/location",{method:"POST",headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},body:JSON.stringify({orgId,name:addLocForm.name,address:addLocForm.address||"",timezone:addLocForm.timezone})});
            const result=await res.json();
            if(!res.ok) throw new Error(result.error||"Failed to create location");
            const newLoc=result.location;
            setLiveLocations(prev=>[...prev,newLoc]);
            selectLocation(newLoc);
            setAddLocOpen(false);
            setAddLocForm({name:"",address:"",timezone:"America/Los_Angeles"});
            toast("✓ Location created: "+newLoc.name, "success");
            setTab("staff");
          }catch(err){
            setAddLocErr(err.message||"Failed to create location.");
            toast(err.message||"Failed to create location", "error");
          }finally{setAddLocBusy(false);}
        }} style={{width:"100%",padding:"13px",background:addLocBusy?"rgba(8,145,178,0.4)":"linear-gradient(135deg,#0891b2,#0e7490)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:addLocBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(8,145,178,0.25)"}}>
          {addLocBusy?"Creating...":"Create Location and Switch"}
        </button>
      </div>
    </div>
  );

  // ── INVITE MODAL ──
  const InviteModal = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setShowInvite(false);setInviteDone("");setInviteErr("");}}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.purple,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Invite Employee</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>Add to your team</div>
          </div>
          <button onClick={()=>{setShowInvite(false);setInviteDone("");setInviteErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        {inviteDone?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>✅</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:6}}>Invite Sent!</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:16}}>{inviteDone}</div>
            <button onClick={()=>{setInviteDone("");setInviteForm({firstName:"",lastName:"",email:"",role:"",dept:"Front End",rate:"15"});}}
              style={{padding:"9px 20px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:7,fontFamily:O.sans,fontSize:13,fontWeight:600,color:O.amber,cursor:"pointer"}}>
              Invite Another
            </button>
          </div>
        ):(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{l:"First Name",k:"firstName",ph:"Jordan"},{l:"Last Name",k:"lastName",ph:"Mills"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
                  <input value={inviteForm[f.k]} onChange={e=>setInviteForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                    style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Email Address</div>
              <input value={inviteForm.email} onChange={e=>setInviteForm(p=>({...p,email:e.target.value}))} type="email" placeholder="jordan@email.com"
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Role</div>
                <input value={inviteForm.role} onChange={e=>setInviteForm(p=>({...p,role:e.target.value}))} placeholder="Lead Cashier"
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Rate ($/hr)</div>
                <input value={inviteForm.rate} onChange={e=>setInviteForm(p=>({...p,rate:e.target.value}))} type="number" placeholder="15.00"
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Department</div>
              <select value={inviteForm.dept} onChange={e=>setInviteForm(p=>({...p,dept:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                {["Front End","Sales Floor","Inventory","Operations","Security","Management","Kitchen","Bar","Service"].map(d=>(
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {inviteErr&&<div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"7px 10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{inviteErr}</div>}
            <button onClick={async()=>{
              if(!inviteForm.firstName||!inviteForm.lastName||!inviteForm.email){setInviteErr("Please fill in name and email.");return;}
              setInviteBusy(true);setInviteErr("");
              try{
                const res=await fetch("/api/invite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:inviteForm.email,firstName:inviteForm.firstName,lastName:inviteForm.lastName,orgId:ownerProfile?.org_id||null,locationId:activeLocation?.id||ownerProfile?.location_id||null,role:inviteForm.role||"Employee",department:inviteForm.dept,hourlyRate:inviteForm.rate})});
                const result=await res.json();
                if(!res.ok) throw new Error(result.error||"Invite failed");
                const {createClient}=await import("@supabase/supabase-js");
                const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                const {data:emps}=await sb.from("users").select("*").eq("org_id",ownerProfile?.org_id).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");
                if(emps) setLiveEmps(emps.map(mapEmp));
                setInviteDone("Invite sent to "+inviteForm.email+"!");
                toast("Invite sent to "+inviteForm.email+" ✓", "success");
              }catch(err){
                setInviteErr(err.message||"Failed. Try again.");
                toast(err.message||"Invite failed", "error");
              }finally{setInviteBusy(false);}
            }} style={{width:"100%",padding:"13px",background:inviteBusy?"rgba(124,58,237,0.4)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:inviteBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.25)"}}>
              {inviteBusy?"Sending...":"Send Invite →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── BROADCAST MODAL ──
  const BroadcastModal = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setBroadcastOpen(false);setBroadcastDone("");}}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Broadcast</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>Message All Employees</div>
          </div>
          <button onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        {broadcastDone?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📣</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:6}}>{broadcastDone}</div>
            <button onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");setBroadcastForm({subject:"",body:""}); }} style={{padding:"9px 20px",background:O.greenD,border:"1px solid rgba(26,158,110,0.2)",borderRadius:7,fontFamily:O.sans,fontSize:13,fontWeight:600,color:O.green,cursor:"pointer"}}>Close</button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Subject</div>
              <input value={broadcastForm.subject} onChange={e=>setBroadcastForm(p=>({...p,subject:e.target.value}))} placeholder="Schedule update, policy change..."
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Message</div>
              <textarea value={broadcastForm.body} onChange={e=>setBroadcastForm(p=>({...p,body:e.target.value}))} placeholder="Type your message..." rows={4}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginBottom:14}}>Will send to <strong>{(liveEmps||[]).filter(e=>e.status==="active").length} active employees</strong></div>
            <button onClick={async()=>{
              if(!broadcastForm.subject||!broadcastForm.body) return;
              setBroadcastBusy(true);
              try{
                const {createClient}=await import("@supabase/supabase-js");
                const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                const {data:{session}}=await sb.auth.getSession();
                const activeEmps=(liveEmps||[]).filter(e=>e.status==="active");
                const msgs=activeEmps.map(emp=>({org_id:ownerProfile?.org_id||null,from_id:session?.user?.id||null,to_id:emp.id,subject:broadcastForm.subject,body:broadcastForm.body,read:false}));
                if(msgs.length>0) await sb.from("messages").insert(msgs);
                setBroadcastDone("Message sent to "+activeEmps.length+" employee"+(activeEmps.length!==1?"s":"")+" ✓");
                toast("Message sent to "+activeEmps.length+" employees ✓", "success");
              }catch(e){ setBroadcastDone("Message sent ✓"); toast("Message sent ✓","success"); }
              finally{setBroadcastBusy(false);}
            }} style={{width:"100%",padding:"13px",background:broadcastBusy?"rgba(217,64,64,0.4)":"linear-gradient(135deg,#d94040,#b91c1c)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:broadcastBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(217,64,64,0.25)"}}>
              {broadcastBusy?"Sending…":"📣 Send to All Employees"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── RENDER ──────────────────────────────────────────'''

new_render_marker = '''  // ── RENDER ──────────────────────────────────────────'''

if old_add_loc in content:
    content = content.replace(old_add_loc, new_render_marker)
    print("✓ Removed AddLocationModal, InviteModal, BroadcastModal inner definitions")
else:
    print("✗ Could not find inner modal definitions — they may already be removed")

# ── 2. Update render to pass props to external modals ──
old_modals_render = '''      {/* Modals */}
      {addLocOpen && <AddLocationModal/>}
      {showInvite && <InviteModal/>}
      {broadcastOpen && <BroadcastModal/>}'''

new_modals_render = '''      {/* Modals */}
      {addLocOpen && (
        <AddLocationModal
          activeOrg={activeOrg}
          ownerOrg={ownerOrg}
          ownerProfile={ownerProfile}
          activeLocation={activeLocation}
          addLocForm={addLocForm}
          setAddLocForm={setAddLocForm}
          addLocBusy={addLocBusy}
          setAddLocBusy={setAddLocBusy}
          addLocErr={addLocErr}
          setAddLocErr={setAddLocErr}
          setAddLocOpen={setAddLocOpen}
          setLiveLocations={setLiveLocations}
          selectLocation={selectLocation}
          setTab={setTab}
          toast={toast}
          mapEmp={mapEmp}
        />
      )}
      {showInvite && (
        <InviteModal
          ownerProfile={ownerProfile}
          activeLocation={activeLocation}
          inviteForm={inviteForm}
          setInviteForm={setInviteForm}
          inviteBusy={inviteBusy}
          setInviteBusy={setInviteBusy}
          inviteDone={inviteDone}
          setInviteDone={setInviteDone}
          inviteErr={inviteErr}
          setInviteErr={setInviteErr}
          setShowInvite={setShowInvite}
          setLiveEmps={setLiveEmps}
          mapEmp={mapEmp}
          toast={toast}
        />
      )}
      {broadcastOpen && (
        <BroadcastModal
          ownerProfile={ownerProfile}
          liveEmps={liveEmps}
          broadcastForm={broadcastForm}
          setBroadcastForm={setBroadcastForm}
          broadcastBusy={broadcastBusy}
          setBroadcastBusy={setBroadcastBusy}
          broadcastDone={broadcastDone}
          setBroadcastDone={setBroadcastDone}
          setBroadcastOpen={setBroadcastOpen}
          toast={toast}
        />
      )}'''

if old_modals_render in content:
    content = content.replace(old_modals_render, new_modals_render)
    print("✓ Updated modal render calls to pass props")
else:
    print("✗ Could not find modal render section")

# ── 3. Insert external component definitions before OwnerCmd ──
# Find the OwnerCmd marker (after the location gate components were already inserted)
insert_marker = "// ══════════════════════════════════════════════════\n//  OWNER COMMAND — WARM THEME v2\n// ══════════════════════════════════════════════════"

external_modals = '''// ══════════════════════════════════════════════════
//  MODAL COMPONENTS (outside OwnerCmd to prevent remount)
// ══════════════════════════════════════════════════

function AddLocationModal({
  activeOrg, ownerOrg, ownerProfile, activeLocation,
  addLocForm, setAddLocForm, addLocBusy, setAddLocBusy,
  addLocErr, setAddLocErr, setAddLocOpen, setLiveLocations,
  selectLocation, setTab, toast, mapEmp
}) {
  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setAddLocOpen(false);setAddLocErr("");}}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.cyan,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Add Location</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>New Physical Location</div>
          </div>
          <button onClick={()=>{setAddLocOpen(false);setAddLocErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        <div style={{background:"rgba(8,145,178,0.06)",border:"1px solid rgba(8,145,178,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>🏢</span>
          <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,lineHeight:1.5}}>
            Adding location to <strong style={{color:O.text}}>{activeOrg?.name||ownerOrg?.name||"your company"}</strong>. Each location has its own team, schedule, and payroll.
          </div>
        </div>
        {[
          {l:"Location Name *",k:"name",ph:"Main Bar, Patio, Warehouse..."},
          {l:"Street Address",k:"address",ph:"123 Main St, Newport, OR 97365"}
        ].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
            <input
              value={addLocForm[f.k]}
              onChange={e=>setAddLocForm(p=>({...p,[f.k]:e.target.value}))}
              placeholder={f.ph}
              style={{width:"100%",padding:"10px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=O.cyan}
              onBlur={e=>e.target.style.borderColor=O.border}
            />
          </div>
        ))}
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Timezone</div>
          <select
            value={addLocForm.timezone}
            onChange={e=>setAddLocForm(p=>({...p,timezone:e.target.value}))}
            style={{width:"100%",padding:"10px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
            {[
              ["America/Los_Angeles","Pacific Time (PT)"],
              ["America/Denver","Mountain Time (MT)"],
              ["America/Chicago","Central Time (CT)"],
              ["America/New_York","Eastern Time (ET)"],
              ["America/Anchorage","Alaska (AKT)"],
              ["Pacific/Honolulu","Hawaii (HST)"]
            ].map(([val,label])=>(
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {addLocErr&&(
          <div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"7px 10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{addLocErr}</div>
        )}
        <button
          onClick={async()=>{
            if(!addLocForm.name){setAddLocErr("Location name is required.");return;}
            setAddLocBusy(true);setAddLocErr("");
            try{
              const {createClient}=await import("@supabase/supabase-js");
              const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
              const {data:{session}}=await sb.auth.getSession();
              let orgId=activeOrg?.id||ownerProfile?.org_id;
              if(!orgId){
                const {data:oo}=await sb.from("owner_organizations").select("org_id").eq("owner_id",session?.user?.id).single();
                orgId=oo?.org_id;
              }
              if(!orgId) throw new Error("No company selected. Please refresh and try again.");
              const res=await fetch("/api/location",{
                method:"POST",
                headers:{"Content-Type":"application/json",...(session?.access_token?{"Authorization":"Bearer "+session.access_token}:{})},
                body:JSON.stringify({orgId,name:addLocForm.name,address:addLocForm.address||"",timezone:addLocForm.timezone})
              });
              const result=await res.json();
              if(!res.ok) throw new Error(result.error||"Failed to create location");
              const newLoc=result.location;
              setLiveLocations(prev=>[...prev,newLoc]);
              selectLocation(newLoc);
              setAddLocOpen(false);
              setAddLocForm({name:"",address:"",timezone:"America/Los_Angeles"});
              toast("✓ Location created: "+newLoc.name,"success");
              setTab("staff");
            }catch(err){
              setAddLocErr(err.message||"Failed to create location.");
              toast(err.message||"Failed to create location","error");
            }finally{setAddLocBusy(false);}
          }}
          style={{width:"100%",padding:"13px",background:addLocBusy?"rgba(8,145,178,0.4)":"linear-gradient(135deg,#0891b2,#0e7490)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:addLocBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(8,145,178,0.25)"}}>
          {addLocBusy?"Creating...":"Create Location and Switch"}
        </button>
      </div>
    </div>
  );
}

function InviteModal({
  ownerProfile, activeLocation,
  inviteForm, setInviteForm, inviteBusy, setInviteBusy,
  inviteDone, setInviteDone, inviteErr, setInviteErr,
  setShowInvite, setLiveEmps, mapEmp, toast
}) {
  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setShowInvite(false);setInviteDone("");setInviteErr("");}}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.purple,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Invite Employee</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>Add to your team</div>
          </div>
          <button onClick={()=>{setShowInvite(false);setInviteDone("");setInviteErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        {inviteDone?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>✅</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:6}}>Invite Sent!</div>
            <div style={{fontFamily:O.sans,fontSize:13,color:O.textD,marginBottom:16}}>{inviteDone}</div>
            <button
              onClick={()=>{setInviteDone("");setInviteForm({firstName:"",lastName:"",email:"",role:"",dept:"Front End",rate:"15"});}}
              style={{padding:"9px 20px",background:O.amberD,border:"1px solid "+O.amberB,borderRadius:7,fontFamily:O.sans,fontSize:13,fontWeight:600,color:O.amber,cursor:"pointer"}}>
              Invite Another
            </button>
          </div>
        ):(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{l:"First Name",k:"firstName",ph:"Jordan"},{l:"Last Name",k:"lastName",ph:"Mills"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>{f.l}</div>
                  <input
                    value={inviteForm[f.k]}
                    onChange={e=>setInviteForm(p=>({...p,[f.k]:e.target.value}))}
                    placeholder={f.ph}
                    style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                  />
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Email Address</div>
              <input
                value={inviteForm.email}
                onChange={e=>setInviteForm(p=>({...p,email:e.target.value}))}
                type="email"
                placeholder="jordan@email.com"
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Role</div>
                <input
                  value={inviteForm.role}
                  onChange={e=>setInviteForm(p=>({...p,role:e.target.value}))}
                  placeholder="Lead Cashier"
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                />
              </div>
              <div>
                <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Rate ($/hr)</div>
                <input
                  value={inviteForm.rate}
                  onChange={e=>setInviteForm(p=>({...p,rate:e.target.value}))}
                  type="number"
                  placeholder="15.00"
                  style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
                />
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Department</div>
              <select
                value={inviteForm.dept}
                onChange={e=>setInviteForm(p=>({...p,dept:e.target.value}))}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:12,color:O.text,outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                {["Front End","Sales Floor","Inventory","Operations","Security","Management","Kitchen","Bar","Service"].map(d=>(
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {inviteErr&&(
              <div style={{fontFamily:O.sans,fontSize:12,color:O.red,marginBottom:12,padding:"7px 10px",background:O.redD,border:"1px solid rgba(217,64,64,0.2)",borderRadius:6}}>{inviteErr}</div>
            )}
            <button
              onClick={async()=>{
                if(!inviteForm.firstName||!inviteForm.lastName||!inviteForm.email){setInviteErr("Please fill in name and email.");return;}
                setInviteBusy(true);setInviteErr("");
                try{
                  const res=await fetch("/api/invite",{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({
                      email:inviteForm.email,firstName:inviteForm.firstName,lastName:inviteForm.lastName,
                      orgId:ownerProfile?.org_id||null,locationId:activeLocation?.id||ownerProfile?.location_id||null,
                      role:inviteForm.role||"Employee",department:inviteForm.dept,hourlyRate:inviteForm.rate
                    })
                  });
                  const result=await res.json();
                  if(!res.ok) throw new Error(result.error||"Invite failed");
                  const {createClient}=await import("@supabase/supabase-js");
                  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                  const {data:emps}=await sb.from("users").select("*").eq("org_id",ownerProfile?.org_id).in("status",["active","invited"]).in("app_role",["employee","supervisor"]).order("first_name");
                  if(emps) setLiveEmps(emps.map(mapEmp));
                  setInviteDone("Invite sent to "+inviteForm.email+"!");
                  toast("Invite sent to "+inviteForm.email+" ✓","success");
                }catch(err){
                  setInviteErr(err.message||"Failed. Try again.");
                  toast(err.message||"Invite failed","error");
                }finally{setInviteBusy(false);}
              }}
              style={{width:"100%",padding:"13px",background:inviteBusy?"rgba(124,58,237,0.4)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:inviteBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.25)"}}>
              {inviteBusy?"Sending...":"Send Invite →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BroadcastModal({
  ownerProfile, liveEmps,
  broadcastForm, setBroadcastForm,
  broadcastBusy, setBroadcastBusy,
  broadcastDone, setBroadcastDone,
  setBroadcastOpen, toast
}) {
  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget){setBroadcastOpen(false);setBroadcastDone("");}}}>
      <div style={{background:"#fff",borderRadius:16,padding:"28px",width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:O.mono,fontSize:8,color:O.red,letterSpacing:"2px",marginBottom:4,textTransform:"uppercase"}}>Broadcast</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:18,color:O.text}}>Message All Employees</div>
          </div>
          <button onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:O.textF}}>×</button>
        </div>
        {broadcastDone?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📣</div>
            <div style={{fontFamily:O.sans,fontWeight:700,fontSize:16,color:O.green,marginBottom:6}}>{broadcastDone}</div>
            <button
              onClick={()=>{setBroadcastOpen(false);setBroadcastDone("");setBroadcastForm({subject:"",body:""}); }}
              style={{padding:"9px 20px",background:O.greenD,border:"1px solid rgba(26,158,110,0.2)",borderRadius:7,fontFamily:O.sans,fontSize:13,fontWeight:600,color:O.green,cursor:"pointer"}}>
              Close
            </button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Subject</div>
              <input
                value={broadcastForm.subject}
                onChange={e=>setBroadcastForm(p=>({...p,subject:e.target.value}))}
                placeholder="Schedule update, policy change..."
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:O.mono,fontSize:8,color:O.textF,letterSpacing:"1.5px",marginBottom:5,textTransform:"uppercase"}}>Message</div>
              <textarea
                value={broadcastForm.body}
                onChange={e=>setBroadcastForm(p=>({...p,body:e.target.value}))}
                placeholder="Type your message..."
                rows={4}
                style={{width:"100%",padding:"9px 12px",background:O.bg3,border:"1px solid "+O.border,borderRadius:7,fontFamily:O.sans,fontSize:13,color:O.text,outline:"none",resize:"vertical",boxSizing:"border-box"}}
              />
            </div>
            <div style={{fontFamily:O.sans,fontSize:12,color:O.textD,marginBottom:14}}>
              Will send to <strong>{(liveEmps||[]).filter(e=>e.status==="active").length} active employees</strong>
            </div>
            <button
              onClick={async()=>{
                if(!broadcastForm.subject||!broadcastForm.body) return;
                setBroadcastBusy(true);
                try{
                  const {createClient}=await import("@supabase/supabase-js");
                  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                  const {data:{session}}=await sb.auth.getSession();
                  const activeEmps=(liveEmps||[]).filter(e=>e.status==="active");
                  const msgs=activeEmps.map(emp=>({org_id:ownerProfile?.org_id||null,from_id:session?.user?.id||null,to_id:emp.id,subject:broadcastForm.subject,body:broadcastForm.body,read:false}));
                  if(msgs.length>0) await sb.from("messages").insert(msgs);
                  setBroadcastDone("Message sent to "+activeEmps.length+" employee"+(activeEmps.length!==1?"s":"")+" ✓");
                  toast("Message sent to "+activeEmps.length+" employees ✓","success");
                }catch(e){
                  setBroadcastDone("Message sent ✓");
                  toast("Message sent ✓","success");
                }finally{setBroadcastBusy(false);}
              }}
              style={{width:"100%",padding:"13px",background:broadcastBusy?"rgba(217,64,64,0.4)":"linear-gradient(135deg,#d94040,#b91c1c)",border:"none",borderRadius:9,fontFamily:O.sans,fontWeight:700,fontSize:14,color:"#fff",cursor:broadcastBusy?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(217,64,64,0.25)"}}>
              {broadcastBusy?"Sending…":"📣 Send to All Employees"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  OWNER COMMAND — WARM THEME v2
// ══════════════════════════════════════════════════'''

if insert_marker in content:
    content = content.replace(insert_marker, external_modals)
    print("✓ Inserted external AddLocationModal, InviteModal, BroadcastModal before OwnerCmd")
else:
    print("✗ Could not find OwnerCmd marker — may need to check file structure")

with open(path, "w") as f:
    f.write(content)

print("\n✅ Done! Run: git add . && git commit -m 'fix: all modals outside OwnerCmd, no more remount flash' && git push")
