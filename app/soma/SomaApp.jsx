"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const TAU = Math.PI * 2;
const PHI = 1.618033988749895;

const C = {
  void: "#060610", abyss: "#0A0A1A", deep: "#0F0F24", shelf: "#16163A", mist: "#1E1E4A",
  text1: "rgba(220,218,235,0.9)", text2: "rgba(180,178,200,0.6)",
  text3: "rgba(150,148,175,0.35)", text4: "rgba(120,118,145,0.2)",
  bloom: "#4ECDC4", dissolve: "#38A3CC", ignite: "#FFB347", flow: "#9B6DFF",
  pulse: "#E8735A", transcend: "#F0E6D0", voidCh: "#2A3366", sequences: "#7B8CDE",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "good morning";
  if (h >= 12 && h < 17) return "good afternoon";
  return "good evening";
}
function getTimeSuggestion() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return { label: "morning", name: "morning protocol", accent: C.ignite };
  if (h >= 10 && h < 14) return { label: "focus", name: "deep work primer", accent: C.flow };
  if (h >= 14 && h < 17) return { label: "afternoon", name: "power nap", accent: C.sequences };
  if (h >= 17 && h < 21) return { label: "evening", name: "wind-down", accent: C.dissolve };
  return { label: "night", name: "void", accent: C.voidCh };
}
function formatTime() { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase(); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function hexRgb(hex) { return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]; }

const CHANNELS = [
  { key:"dissolve", name:"dissolve", sub:"quiet the noise", accent:C.dissolve, hz:7.83,
    colors:[[30,100,160],[40,140,190],[20,80,140]], binaural:[{l:174,r:181.83},{l:400,r:410}], breathMs:10000 },
  { key:"ignite", name:"ignite", sub:"clean energy", accent:C.ignite, hz:18,
    colors:[[255,160,40],[255,200,80],[200,120,20]], binaural:[{l:295,r:313},{l:500,r:514}], breathMs:7000 },
  { key:"flow", name:"flow", sub:"disappear into work", accent:C.flow, hz:10,
    colors:[[120,80,220],[60,200,180],[200,160,60]], binaural:[{l:315,r:325},{l:200,r:206}], breathMs:9000 },
  { key:"pulse", name:"pulse", sub:"feel everything", accent:C.pulse, hz:7,
    colors:[[220,90,70],[200,130,80],[180,60,100]], binaural:[{l:228,r:235},{l:80,r:84}], breathMs:11000 },
  { key:"transcend", name:"transcend", sub:"see beyond", accent:C.transcend, hz:40,
    colors:[[240,220,180],[200,180,240],[255,250,220]], binaural:[{l:400,r:440},{l:174,r:180}], breathMs:10000 },
  { key:"void", name:"void", sub:"surrender to sleep", accent:C.voidCh, hz:2,
    colors:[[25,30,60],[20,25,50],[30,35,70]], binaural:[{l:300,r:310}], breathMs:14000 },
];

const SEQUENCES = [
  { key:"morning", name:"morning protocol", desc:"neural boot sequence for a clear day", dur:"12 min", durSec:720, accent:C.ignite,
    curve:[0.3,0.4,0.55,0.7,0.85,0.9,0.85,0.8], phases:[
      {durSec:180,hz:10,colors:[[200,140,60],[180,120,40],[220,160,80]]},
      {durSec:240,hz:16,colors:[[255,180,60],[255,200,100],[240,160,40]]},
      {durSec:180,hz:18,colors:[[255,220,120],[255,240,180],[200,180,60]]},
      {durSec:120,hz:16,colors:[[255,200,80],[240,180,60],[220,160,40]]},
    ]},
  { key:"deepwork", name:"deep work primer", desc:"pre-load flow state", dur:"8 min", durSec:480, accent:C.flow,
    curve:[0.5,0.4,0.25,0.15,0.3,0.5,0.55,0.5], phases:[
      {durSec:120,hz:10,colors:[[100,80,200],[80,60,180],[120,100,220]]},
      {durSec:180,hz:6,colors:[[60,180,160],[40,160,140],[80,200,180]]},
      {durSec:120,hz:10,colors:[[140,100,240],[120,80,220],[160,120,255]]},
      {durSec:60,hz:12,colors:[[100,80,200],[80,60,180],[120,100,220]]},
    ]},
  { key:"nap", name:"power nap", desc:"engineered 20-min nap", dur:"22 min", durSec:1320, accent:C.sequences,
    curve:[0.5,0.3,0.15,0.1,0.1,0.1,0.1,0.15,0.3,0.5,0.65], phases:[
      {durSec:240,hz:6,colors:[[80,100,180],[60,80,160],[40,60,140]]},
      {durSec:840,hz:4.5,colors:[[30,40,100],[20,30,80],[25,35,90]]},
      {durSec:120,hz:10,colors:[[80,120,200],[100,140,220],[120,160,240]]},
      {durSec:120,hz:16,colors:[[160,180,240],[180,200,255],[200,220,255]]},
    ]},
  { key:"stress", name:"stress emergency", desc:"5-min nervous system reset", dur:"5 min", durSec:300, accent:C.pulse,
    curve:[0.85,0.65,0.4,0.25,0.15], phases:[
      {durSec:60,hz:20,colors:[[220,100,80],[200,80,60],[180,60,40]]},
      {durSec:120,hz:12,colors:[[180,100,120],[140,80,160],[100,80,200]]},
      {durSec:120,hz:7.83,colors:[[60,140,180],[40,120,160],[80,160,200]]},
    ]},
  { key:"evening", name:"evening wind-down", desc:"bridge from on to off before bed", dur:"15 min", durSec:900, accent:C.dissolve,
    curve:[0.6,0.5,0.4,0.3,0.2,0.15,0.12,0.1,0.08], phases:[
      {durSec:240,hz:10,colors:[[80,140,200],[60,120,180],[100,160,220]]},
      {durSec:300,hz:7,colors:[[40,80,160],[30,60,140],[50,100,180]]},
      {durSec:240,hz:5,colors:[[20,40,100],[15,30,80],[25,50,120]]},
      {durSec:120,hz:4,colors:[[15,20,60],[10,15,50],[20,25,70]]},
    ]},
  { key:"creative", name:"creative unblock", desc:"shift brain to solution state", dur:"18 min", durSec:1080, accent:C.flow,
    curve:[0.5,0.35,0.2,0.15,0.25,0.6,0.55,0.45], phases:[
      {durSec:180,hz:10,colors:[[100,80,200],[80,60,180],[120,100,220]]},
      {durSec:300,hz:6,colors:[[60,180,160],[40,160,140],[80,200,180]]},
      {durSec:360,hz:8,colors:[[180,140,255],[160,120,240],[200,160,255]]},
      {durSec:240,hz:12,colors:[[120,100,220],[100,80,200],[140,120,240]]},
    ]},
  { key:"perform", name:"performance prep", desc:"the zone — before big moments", dur:"10 min", durSec:600, accent:C.ignite,
    curve:[0.5,0.4,0.45,0.55,0.65,0.7,0.65], phases:[
      {durSec:180,hz:10,colors:[[200,160,80],[180,140,60],[220,180,100]]},
      {durSec:240,hz:13,colors:[[240,200,100],[220,180,80],[255,220,120]]},
      {durSec:120,hz:16,colors:[[255,200,60],[240,180,40],[255,220,80]]},
      {durSec:60,hz:14,colors:[[255,180,60],[240,160,40],[255,200,80]]},
    ]},
  { key:"recovery", name:"recovery day", desc:"full neural defragmentation", dur:"30 min", durSec:1800, accent:C.bloom,
    curve:[0.5,0.4,0.25,0.15,0.08,0.06,0.1,0.2,0.35,0.45,0.5], phases:[
      {durSec:300,hz:10,colors:[[60,180,160],[40,160,140],[80,200,180]]},
      {durSec:420,hz:5,colors:[[40,120,140],[30,100,120],[50,140,160]]},
      {durSec:480,hz:3.5,colors:[[20,60,80],[15,50,70],[25,70,90]]},
      {durSec:300,hz:7,colors:[[40,140,160],[50,160,180],[60,180,200]]},
      {durSec:300,hz:13,colors:[[80,200,190],[60,180,170],[100,220,210]]},
    ]},
];

const AFFIRMATIONS = [
  "this moment is enough","you are safe here","nothing needs fixing right now",
  "let your shoulders drop","rest is not the opposite of progress",
  "you don't have to fix everything today","it makes sense that you're tired",
  "uncertainty is the birthplace of possibility","what feels permanent is always passing",
  "stillness is yours to keep","every exhale releases what you don't need",
  "the weight you carry is proof you can hold it","your mind is clearing",
];

class SessionAudio {
  constructor(){this.ctx=null;this.nodes=[];this.master=null;this.comp=null;this.noise=null;this.alive=false;}
  init(){
    try{
      this.ctx=new(window.AudioContext||window.webkitAudioContext)();
      // Compressor prevents clipping when multiple oscillators sum above 1.0
      this.comp=this.ctx.createDynamicsCompressor();
      this.comp.threshold.value=-18;this.comp.knee.value=12;
      this.comp.ratio.value=8;this.comp.attack.value=0.005;this.comp.release.value=0.15;
      // Limiter as final safety net
      const limiter=this.ctx.createDynamicsCompressor();
      limiter.threshold.value=-3;limiter.knee.value=0;
      limiter.ratio.value=20;limiter.attack.value=0.001;limiter.release.value=0.05;
      this.master=this.ctx.createGain();
      this.master.gain.setValueAtTime(0,this.ctx.currentTime);
      this.comp.connect(limiter);limiter.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.alive=true;
    }catch(e){console.log("Audio init failed");}
  }
  setBinaural(pairs,vol){
    this._fadeAndStopNodes();if(!this.ctx||!this.alive)return;
    const now=this.ctx.currentTime;
    // Scale vol down — each pair adds 2 oscillators, so total energy = pairs*2*vol
    // Keep individual oscillator vol low, let compressor handle headroom
    const safeVol=Math.min(vol,0.06);
    pairs.forEach(p=>{
      const lO=this.ctx.createOscillator(),rO=this.ctx.createOscillator();
      const lP=this.ctx.createStereoPanner(),rP=this.ctx.createStereoPanner();
      const lG=this.ctx.createGain(),rG=this.ctx.createGain();
      lO.type="sine";rO.type="sine";lO.frequency.value=p.l;rO.frequency.value=p.r;
      lP.pan.value=-1;rP.pan.value=1;
      // Start gains at 0, ramp up smoothly to prevent initial pop
      lG.gain.setValueAtTime(0,now);rG.gain.setValueAtTime(0,now);
      lG.gain.linearRampToValueAtTime(safeVol,now+0.5);
      rG.gain.linearRampToValueAtTime(safeVol,now+0.5);
      lO.connect(lG);lG.connect(lP);lP.connect(this.comp);
      rO.connect(rG);rG.connect(rP);rP.connect(this.comp);
      lO.start(now);rO.start(now);
      this.nodes.push({lO,rO,lG,rG,vol:safeVol});
    });
    // Pink noise — generate at lower amplitude to prevent clipping
    const bL=this.ctx.sampleRate*3;
    const buf=this.ctx.createBuffer(1,bL,this.ctx.sampleRate);
    const d=buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(let i=0;i<bL;i++){
      const w=Math.random()*2-1;
      b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;
      b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;
      b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;
      // Reduced amplitude from .11 to .06 to prevent peaks
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.06;
      b6=w*.115926;
    }
    const src=this.ctx.createBufferSource();src.buffer=buf;src.loop=true;
    const f=this.ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=400;f.Q.value=0.5;
    const nG=this.ctx.createGain();
    // Ramp noise in smoothly too
    nG.gain.setValueAtTime(0,now);
    nG.gain.linearRampToValueAtTime(safeVol*0.25,now+1.0);
    src.connect(f);f.connect(nG);nG.connect(this.comp);
    src.start(now);
    this.noise={src,gain:nG};
  }
  updateFreq(hz){
    if(!this.ctx||!this.alive||this.nodes.length===0)return;
    const n=this.nodes[0],now=this.ctx.currentTime;
    // Cancel any prior ramp before setting new one
    n.rO.frequency.cancelScheduledValues(now);
    n.rO.frequency.setValueAtTime(n.rO.frequency.value,now);
    n.rO.frequency.linearRampToValueAtTime(n.lO.frequency.value+hz,now+4);
  }
  fadeIn(dur){
    if(!this.master||!this.ctx||!this.alive)return;
    const now=this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0,now);
    // Target 0.3 instead of 0.7 — compressor handles the rest
    this.master.gain.linearRampToValueAtTime(0.3,now+dur);
  }
  fadeOut(dur){
    if(!this.master||!this.ctx||!this.alive)return;
    const now=this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value,now);
    this.master.gain.linearRampToValueAtTime(0,now+dur);
  }
  _fadeAndStopNodes(){
    // Fade out existing nodes before stopping to prevent clicks
    if(!this.ctx)return;
    const now=this.ctx.currentTime;
    const oldNodes=[...this.nodes];
    const oldNoise=this.noise;
    this.nodes=[];this.noise=null;
    // Ramp all gains to 0 over 100ms, then stop
    oldNodes.forEach(n=>{
      try{
        n.lG.gain.cancelScheduledValues(now);n.rG.gain.cancelScheduledValues(now);
        n.lG.gain.setValueAtTime(n.lG.gain.value,now);
        n.rG.gain.setValueAtTime(n.rG.gain.value,now);
        n.lG.gain.linearRampToValueAtTime(0,now+0.1);
        n.rG.gain.linearRampToValueAtTime(0,now+0.1);
        n.lO.stop(now+0.15);n.rO.stop(now+0.15);
      }catch(e){}
    });
    if(oldNoise){
      try{
        oldNoise.gain.gain.cancelScheduledValues(now);
        oldNoise.gain.gain.setValueAtTime(oldNoise.gain.gain.value,now);
        oldNoise.gain.gain.linearRampToValueAtTime(0,now+0.1);
        oldNoise.src.stop(now+0.15);
      }catch(e){}
    }
  }
  destroy(){
    this.alive=false;
    this._fadeAndStopNodes();
    // Give the fade-out 200ms to complete before closing context
    setTimeout(()=>{try{if(this.ctx&&this.ctx.state!=="closed")this.ctx.close();}catch(e){}},250);
  }
}

class SP {
  constructor(w,h){
    const a=Math.random()*TAU,r=Math.pow(Math.random(),.5)*Math.min(w,h)*.4;
    this.hx=w/2+Math.cos(a)*r;this.hy=h/2+Math.sin(a)*r;
    this.x=this.hx;this.y=this.hy;this.r=1.2+Math.random()*2.5;this.phase=Math.random()*TAU;
    this.ci=Math.floor(Math.random()*3);this.orbitR=12+Math.random()*50;
    this.orbitSpd=(.0002+Math.random()*.0004)*(Math.random()>.5?1:-1);
    this.pulseSpd=.4+Math.random()*1;this.depth=.4+Math.random()*.6;
  }
}
class MiniP {
  constructor(r){const a=Math.random()*TAU,d=Math.random()*r*.85;this.x=Math.cos(a)*d;this.y=Math.sin(a)*d;this.r=1+Math.random()*2;this.phase=Math.random()*TAU;this.speed=.0002+Math.random()*.0003;this.orbitR=5+Math.random()*20;this.baseX=this.x;this.baseY=this.y;this.hue=Math.random();}
}

export default function SomaApp(){
  const[screen,setScreen]=useState("splash");
  const[isPremium]=useState(true);
  const[showSettings,setShowSettings]=useState(false);
  const[showUpgrade,setShowUpgrade]=useState(false);
  const[showSeqDetail,setShowSeqDetail]=useState(null);
  const[selectedPlan,setSelectedPlan]=useState("annual");
  const[prefs,setPrefs]=useState({headphones:true,haptic:true,nature:"rain",voidDim:true});
  const[loadAnim,setLoadAnim]=useState(0);
  const[activeSession,setActiveSession]=useState(null);
  const[sessionComplete,setSessionComplete]=useState(null);
  const bloomCanvasRef=useRef(null);
  const bloomParticles=useRef([]);
  const bloomRaf=useRef(null);
  const miniTime=useRef(0);
  const sessCanvasRef=useRef(null);
  const sessRaf=useRef(null);
  const sessAudio=useRef(null);
  const sessParticles=useRef([]);
  const sessS=useRef({time:0,startedAt:0,fadeIn:0,affirmIdx:0,affirmOp:0,affirmT:0,currentAffirm:"",phaseIdx:-1});

  // Ambient audio state
  const[rainOn,setRainOn]=useState(false);
  const[thunderOn,setThunderOn]=useState(false);
  const[showMixer,setShowMixer]=useState(false);
  const[volumes,setVolumes]=useState({brain:70,rain:50,thunder:40});
  const rainNodes=useRef(null);
  const thunderNodes=useRef(null);
  const thunderInterval=useRef(null);

  useEffect(()=>{
    if(screen==="splash"){const t=setTimeout(()=>{setScreen("home");let s=0;const iv=setInterval(()=>{s++;setLoadAnim(s);if(s>=6)clearInterval(iv);},200);},2200);return()=>clearTimeout(t);}
  },[screen]);

  const initMini=useCallback(()=>{
    const cv=bloomCanvasRef.current;if(!cv)return;
    const sz=Math.min(220, window.innerWidth - 80);
    const dpr=Math.min(window.devicePixelRatio||1, 2);
    cv.width=sz*dpr;cv.height=sz*dpr;cv.style.width=sz+"px";cv.style.height=sz+"px";
    cv.getContext("2d").scale(dpr,dpr);
    bloomParticles.current=Array.from({length:35},()=>new MiniP(sz/2));
    cv._sz=sz;
  },[]);
  const renderMini=useCallback(()=>{
    const cv=bloomCanvasRef.current;if(!cv)return;
    const sz=cv._sz||220;
    const ctx=cv.getContext("2d"),cx=sz/2,cy=sz/2;
    miniTime.current+=16;const t=miniTime.current;
    const breath=Math.sin((t%10000)/10000*Math.PI)*.5+.5;
    ctx.clearRect(0,0,sz,sz);
    const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*.45);
    bg.addColorStop(0,"rgba(78,205,196,"+(0.03+breath*.02)+")");bg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=bg;ctx.beginPath();ctx.arc(cx,cy,sz*.45,0,TAU);ctx.fill();
    bloomParticles.current.forEach(p=>{
      const ox=Math.cos(t*p.speed+p.phase)*p.orbitR*(1+breath*.2);
      const oy=Math.sin(t*p.speed*PHI+p.phase)*p.orbitR*.6*(1+breath*.2);
      const px=cx+p.baseX+ox,py=cy+p.baseY+oy;
      const pulse=Math.sin(t*.001*(.5+p.hue)+p.phase)*.5+.5;
      const alpha=.2+pulse*.35+breath*.1;
      const g=ctx.createRadialGradient(px,py,0,px,py,p.r*4);
      g.addColorStop(0,"rgba(78,205,196,"+alpha+")");
      g.addColorStop(.4,"rgba(78,205,196,"+(alpha*.15)+")");
      g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,p.r*4,0,TAU);ctx.fill();
    });
    bloomRaf.current=requestAnimationFrame(renderMini);
  },[]);
  useEffect(()=>{
    if(screen==="home"&&!activeSession&&!sessionComplete){initMini();bloomRaf.current=requestAnimationFrame(renderMini);}
    return()=>{if(bloomRaf.current)cancelAnimationFrame(bloomRaf.current);};
  },[screen,activeSession,sessionComplete,initMini,renderMini]);

  // ─── AMBIENT AUDIO ENGINE ───
  const getAudioCtx=useCallback(()=>{
    if(sessAudio.current&&sessAudio.current.ctx&&sessAudio.current.alive)return sessAudio.current.ctx;
    return null;
  },[]);
  const getCompressor=useCallback(()=>{
    if(sessAudio.current&&sessAudio.current.comp)return sessAudio.current.comp;
    return null;
  },[]);

  const startRain=useCallback(()=>{
    const ctx=getAudioCtx();const comp=getCompressor();if(!ctx||!comp)return;
    if(rainNodes.current)return;
    const now=ctx.currentTime;
    // Rain = layered filtered noise with slow amplitude modulation
    const bufLen=ctx.sampleRate*4;
    const buf=ctx.createBuffer(2,bufLen,ctx.sampleRate);
    for(let ch=0;ch<2;ch++){
      const d=buf.getChannelData(ch);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for(let i=0;i<bufLen;i++){
        const w=Math.random()*2-1;
        b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;
        b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;
        b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.04+(Math.random()*2-1)*.008;
        b6=w*.115926;
      }
    }
    const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
    // Rain character: bandpass to isolate rain frequencies
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2500;lp.Q.value=0.3;
    const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=200;hp.Q.value=0.3;
    // Slow amplitude modulation for wave-like rain intensity
    const lfo=ctx.createOscillator();const lfoG=ctx.createGain();
    lfo.type="sine";lfo.frequency.value=0.08;lfoG.gain.value=0.015;
    const mainG=ctx.createGain();
    mainG.gain.setValueAtTime(0,now);
    mainG.gain.linearRampToValueAtTime(volumes.rain/100*0.12,now+2);
    src.connect(hp);hp.connect(lp);lp.connect(mainG);
    lfo.connect(lfoG);lfoG.connect(mainG.gain);
    mainG.connect(comp);
    src.start(now);lfo.start(now);
    rainNodes.current={src,lp,hp,lfo,lfoG,gain:mainG};
  },[getAudioCtx,getCompressor,volumes.rain]);

  const stopRain=useCallback(()=>{
    if(!rainNodes.current)return;
    const ctx=getAudioCtx();
    if(ctx){
      const now=ctx.currentTime;
      try{
        rainNodes.current.gain.gain.cancelScheduledValues(now);
        rainNodes.current.gain.gain.setValueAtTime(rainNodes.current.gain.gain.value,now);
        rainNodes.current.gain.gain.linearRampToValueAtTime(0,now+1.5);
        rainNodes.current.src.stop(now+1.7);
        rainNodes.current.lfo.stop(now+1.7);
      }catch(e){}
    }else{
      try{rainNodes.current.src.stop();rainNodes.current.lfo.stop();}catch(e){}
    }
    rainNodes.current=null;
  },[getAudioCtx]);

  const triggerThunderClap=useCallback(()=>{
    const ctx=getAudioCtx();const comp=getCompressor();if(!ctx||!comp)return;
    const now=ctx.currentTime;
    const vol=volumes.thunder/100*0.15;
    // Thunder = low frequency rumble with noise burst
    const osc=ctx.createOscillator();const oscG=ctx.createGain();
    osc.type="sine";
    osc.frequency.setValueAtTime(60+Math.random()*20,now);
    osc.frequency.exponentialRampToValueAtTime(25,now+3);
    oscG.gain.setValueAtTime(0,now);
    oscG.gain.linearRampToValueAtTime(vol,now+0.1+Math.random()*0.3);
    oscG.gain.exponentialRampToValueAtTime(0.001,now+2.5+Math.random()*2);
    // Sub-rumble layer
    const sub=ctx.createOscillator();const subG=ctx.createGain();
    sub.type="sine";sub.frequency.value=30+Math.random()*10;
    subG.gain.setValueAtTime(0,now);
    subG.gain.linearRampToValueAtTime(vol*0.6,now+0.2);
    subG.gain.exponentialRampToValueAtTime(0.001,now+3.5);
    // Crack noise burst
    const crackLen=ctx.sampleRate*0.3;
    const crackBuf=ctx.createBuffer(1,crackLen,ctx.sampleRate);
    const cd=crackBuf.getChannelData(0);
    for(let i=0;i<crackLen;i++){cd[i]=(Math.random()*2-1)*Math.exp(-i/crackLen*8);}
    const crackSrc=ctx.createBufferSource();crackSrc.buffer=crackBuf;
    const crackG=ctx.createGain();
    crackG.gain.setValueAtTime(vol*0.4,now);
    crackG.gain.exponentialRampToValueAtTime(0.001,now+0.5);
    const crackF=ctx.createBiquadFilter();crackF.type="bandpass";crackF.frequency.value=800;crackF.Q.value=0.5;

    osc.connect(oscG);oscG.connect(comp);
    sub.connect(subG);subG.connect(comp);
    crackSrc.connect(crackF);crackF.connect(crackG);crackG.connect(comp);
    osc.start(now);sub.start(now);crackSrc.start(now);
    osc.stop(now+5);sub.stop(now+5);
  },[getAudioCtx,getCompressor,volumes.thunder]);

  const startThunder=useCallback(()=>{
    triggerThunderClap();
    // Schedule random thunder every 8-20 seconds
    const scheduleNext=()=>{
      const delay=8000+Math.random()*12000;
      thunderInterval.current=setTimeout(()=>{
        triggerThunderClap();
        scheduleNext();
      },delay);
    };
    scheduleNext();
  },[triggerThunderClap]);

  const stopThunder=useCallback(()=>{
    if(thunderInterval.current){clearTimeout(thunderInterval.current);thunderInterval.current=null;}
  },[]);

  const updateVolume=useCallback((key,val)=>{
    setVolumes(v=>({...v,[key]:val}));
    if(key==="brain"&&sessAudio.current&&sessAudio.current.master&&sessAudio.current.ctx&&sessAudio.current.alive){
      const now=sessAudio.current.ctx.currentTime;
      sessAudio.current.master.gain.cancelScheduledValues(now);
      sessAudio.current.master.gain.setValueAtTime(sessAudio.current.master.gain.value,now);
      sessAudio.current.master.gain.linearRampToValueAtTime(val/100*0.3,now+0.3);
    }
    if(key==="rain"&&rainNodes.current){
      const ctx=getAudioCtx();if(ctx){
        const now=ctx.currentTime;
        rainNodes.current.gain.gain.cancelScheduledValues(now);
        rainNodes.current.gain.gain.setValueAtTime(rainNodes.current.gain.gain.value,now);
        rainNodes.current.gain.gain.linearRampToValueAtTime(val/100*0.12,now+0.3);
      }
    }
    // Thunder volume applies to next clap — no live adjustment needed
  },[getAudioCtx]);

  // Cleanup ambient on session end
  useEffect(()=>{
    if(!activeSession){
      if(rainNodes.current)stopRain();
      stopThunder();
      setRainOn(false);setThunderOn(false);setShowMixer(false);
    }
  },[activeSession,stopRain,stopThunder]);

  const toggleRain=useCallback(()=>{
    if(rainOn){stopRain();setRainOn(false);}
    else{startRain();setRainOn(true);}
  },[rainOn,startRain,stopRain]);

  const toggleThunder=useCallback(()=>{
    if(thunderOn){stopThunder();setThunderOn(false);}
    else{startThunder();setThunderOn(true);}
  },[thunderOn,startThunder,stopThunder]);

  const launchSession=useCallback((type,key)=>{
    setActiveSession({type,key,startTime:Date.now()});
    sessS.current={time:0,startedAt:Date.now(),fadeIn:0,affirmIdx:0,affirmOp:0,affirmT:0,currentAffirm:AFFIRMATIONS[0],phaseIdx:-1};
  },[]);

  // Session engine
  useEffect(()=>{
    if(!activeSession)return;
    const cv=sessCanvasRef.current;if(!cv)return;
    cv.width=window.innerWidth;cv.height=window.innerHeight;
    // Note: skip DPR scaling on session canvas to maintain 60fps on mobile
    const ch=CHANNELS.find(c=>c.key===activeSession.key);
    const seq=SEQUENCES.find(s=>s.key===activeSession.key);
    const isBloom=activeSession.type==="bloom";
    const isCortex=activeSession.type==="cortex";
    const isSeq=activeSession.type==="sequence";
    sessParticles.current=Array.from({length:150},()=>new SP(cv.width,cv.height));
    const audio=new SessionAudio();audio.init();sessAudio.current=audio;
    if(isBloom)audio.setBinaural([{l:174,r:181.83},{l:396,r:403.83}],.08);
    else if(isCortex&&ch)audio.setBinaural(ch.binaural,.1);
    else if(isSeq&&seq&&seq.phases.length>0)audio.setBinaural([{l:300,r:300+seq.phases[0].hz}],.1);
    audio.fadeIn(2);
    let dead=false;

    const render=()=>{
      if(dead)return;
      const cvs=sessCanvasRef.current;if(!cvs){sessRaf.current=requestAnimationFrame(render);return;}
      const ctx=cvs.getContext("2d"),w=cvs.width,h=cvs.height,s=sessS.current;
      s.time+=16;s.fadeIn=Math.min(1,s.fadeIn+.003);
      const elapsed=s.time/1000;
      let colors,breathMs,accent;
      if(isBloom){colors=[[78,205,196],[60,180,170],[100,220,210]];breathMs=10000+Math.min(elapsed/600,1)*4000;accent=C.bloom;}
      else if(isCortex&&ch){colors=ch.colors;breathMs=ch.breathMs;accent=ch.accent;}
      else if(isSeq&&seq){
        let accum=0,pi=0;
        for(let i=0;i<seq.phases.length;i++){if(elapsed<accum+seq.phases[i].durSec){pi=i;break;}accum+=seq.phases[i].durSec;if(i===seq.phases.length-1)pi=i;}
        const phase=seq.phases[pi];colors=phase.colors;breathMs=8000+(1-phase.hz/20)*6000;accent=seq.accent;
        if(pi!==s.phaseIdx){s.phaseIdx=pi;audio.updateFreq(phase.hz);}
        if(elapsed>=seq.durSec){dead=true;audio.fadeOut(3);setTimeout(()=>{audio.destroy();sessAudio.current=null;setActiveSession(null);setSessionComplete({type:"sequence",key:seq.key,duration:seq.durSec});},3500);return;}
      }else{colors=[[100,100,200]];breathMs=9000;accent=C.bloom;}

      const ac=typeof accent==="string"&&accent.startsWith("#")?hexRgb(accent):[100,100,200];
      const bp=(s.time%breathMs)/breathMs,breathT=Math.sin(bp*Math.PI),isIn=bp<.5;
      ctx.fillStyle="rgba(6,6,16,"+(0.15+(1-breathT)*.08)+")";ctx.fillRect(0,0,w,h);
      const bgG=ctx.createRadialGradient(w/2+Math.cos(s.time*.00008)*50,h/2+Math.sin(s.time*.00006*PHI)*30,0,w/2,h/2,Math.max(w,h)*.5);
      bgG.addColorStop(0,"rgba("+ac[0]+","+ac[1]+","+ac[2]+","+((.02+breathT*.02)*s.fadeIn)+")");
      bgG.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=bgG;ctx.fillRect(0,0,w,h);

      sessParticles.current.forEach((p,i)=>{
        const scale=1+breathT*.25;
        p.x=p.hx+Math.cos(s.time*p.orbitSpd+p.phase)*p.orbitR*scale;
        p.y=p.hy+Math.sin(s.time*p.orbitSpd*PHI+p.phase)*p.orbitR*.6*scale;
        const col=colors[p.ci%colors.length];
        const pulse=Math.sin(s.time*.0008*p.pulseSpd+p.phase)*.5+.5;
        const r=p.r*(1+pulse*.3+breathT*.2)*p.depth;
        const alpha=(.25+pulse*.3+breathT*.15)*s.fadeIn*p.depth;
        const glowR=r*(3+s.fadeIn*2);
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,glowR);
        g.addColorStop(0,"rgba("+col[0]+","+col[1]+","+col[2]+","+alpha+")");
        g.addColorStop(.35,"rgba("+col[0]+","+col[1]+","+col[2]+","+(alpha*.2)+")");
        g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,glowR,0,TAU);ctx.fill();
        ctx.fillStyle="rgba("+Math.min(255,col[0]+50)+","+Math.min(255,col[1]+50)+","+Math.min(255,col[2]+50)+","+(alpha*.7)+")";
        ctx.beginPath();ctx.arc(p.x,p.y,r*.5,0,TAU);ctx.fill();
      });

      // Synapses
      for(let i=0;i<sessParticles.current.length;i++){const pa=sessParticles.current[i];
        for(let j=i+1;j<Math.min(i+5,sessParticles.current.length);j++){const pb=sessParticles.current[j];
          const dx=pa.x-pb.x,dy=pa.y-pb.y,dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<90){const a=(1-dist/90)*.07*s.fadeIn*breathT;const col=colors[pa.ci%colors.length];
            ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);
            ctx.strokeStyle="rgba("+col[0]+","+col[1]+","+col[2]+","+a+")";ctx.lineWidth=.4;ctx.stroke();}
      }}

      // Breath guide
      const bY=h-50,bR=8+breathT*12;
      const bG=ctx.createRadialGradient(w/2,bY,0,w/2,bY,bR*3);
      bG.addColorStop(0,"rgba("+ac[0]+","+ac[1]+","+ac[2]+","+(0.4*s.fadeIn)+")");
      bG.addColorStop(.4,"rgba("+ac[0]+","+ac[1]+","+ac[2]+","+(0.08*s.fadeIn)+")");
      bG.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=bG;ctx.beginPath();ctx.arc(w/2,bY,bR*3,0,TAU);ctx.fill();
      ctx.fillStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+","+(0.5*s.fadeIn)+")";
      ctx.beginPath();ctx.arc(w/2,bY,bR*.3,0,TAU);ctx.fill();
      ctx.font="300 9px -apple-system,sans-serif";ctx.textAlign="center";
      ctx.fillStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+","+(0.25*s.fadeIn)+")";
      ctx.fillText(isIn?"in":"out",w/2,bY+bR*3+14);

      // Affirmations
      s.affirmT+=16;
      if(s.affirmT>14000){s.affirmT=0;s.affirmIdx=(s.affirmIdx+1)%AFFIRMATIONS.length;s.currentAffirm=AFFIRMATIONS[s.affirmIdx];s.affirmOp=0;}
      if(elapsed>8){const cyc=s.affirmT/14000;
        if(!isIn&&cyc<.2)s.affirmOp=Math.min(1,s.affirmOp+.015);
        else if(isIn)s.affirmOp=Math.max(0,s.affirmOp-.01);
        if(cyc>.75)s.affirmOp=Math.max(0,s.affirmOp-.012);
        if(s.affirmOp>.01){ctx.font="300 "+Math.min(18,w*.03)+"px -apple-system,sans-serif";ctx.textAlign="center";
          ctx.fillStyle="rgba(200,200,220,"+(s.affirmOp*.4*s.fadeIn)+")";ctx.fillText(s.currentAffirm,w/2,h*.12);}}

      // Sequence progress
      if(isSeq&&seq){const prog=clamp(elapsed/seq.durSec,0,1);
        ctx.fillStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+",0.15)";ctx.fillRect(0,h-2,w*prog,2);}

      // Exit dot
      ctx.fillStyle="rgba("+ac[0]+","+ac[1]+","+ac[2]+",0.12)";
      ctx.beginPath();ctx.arc(20,28,5,0,TAU);ctx.fill();

      sessRaf.current=requestAnimationFrame(render);
    };
    sessRaf.current=requestAnimationFrame(render);
    const onResize=()=>{const c=sessCanvasRef.current;if(!c)return;c.width=window.innerWidth;c.height=window.innerHeight;sessParticles.current=Array.from({length:150},()=>new SP(c.width,c.height));};
    window.addEventListener("resize",onResize);
    return()=>{dead=true;if(sessRaf.current)cancelAnimationFrame(sessRaf.current);window.removeEventListener("resize",onResize);};
  },[activeSession]);

  const endSession=useCallback(()=>{
    if(!activeSession)return;
    const elapsed=Math.floor((Date.now()-activeSession.startTime)/1000);
    if(sessAudio.current){sessAudio.current.fadeOut(2);setTimeout(()=>{if(sessAudio.current){sessAudio.current.destroy();sessAudio.current=null;}},2500);}
    if(sessRaf.current)cancelAnimationFrame(sessRaf.current);
    setActiveSession(null);
    setSessionComplete({type:activeSession.type,key:activeSession.key,duration:elapsed});
  },[activeSession]);

  const renderCurve=(curve,w,h)=>{if(!curve||curve.length<2)return"";return"M "+curve.map((v,i)=>(i/(curve.length-1))*w+","+(h-v*h)).join(" L ");};
  const suggestion=getTimeSuggestion();

  if(screen==="splash")return(
    <div style={{position:"fixed",inset:0,background:C.void,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:42,fontWeight:200,letterSpacing:10,color:C.text1,opacity:0,animation:"sf 1.2s ease .3s forwards",textTransform:"uppercase"}}>SOMA</div>
      <div style={{width:12,height:12,borderRadius:"50%",marginTop:32,background:C.bloom,opacity:0,animation:"sf .8s ease .8s forwards, sp 3s ease-in-out 1s infinite",boxShadow:"0 0 30px "+C.bloom+"40"}}/>
      <style>{`@keyframes sf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.8)}}@keyframes sg{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}@keyframes su{from{transform:translateY(40px);opacity:.5}to{transform:translateY(0);opacity:1}}@keyframes sd{to{stroke-dashoffset:0}}@keyframes sfl{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );

  if(activeSession){
    const _ch=CHANNELS.find(c=>c.key===activeSession.key);
    const _seq=SEQUENCES.find(s=>s.key===activeSession.key);
    const accentColor=_ch?.accent||_seq?.accent||C.bloom;
    const acRgb=typeof accentColor==="string"&&accentColor.startsWith("#")?hexRgb(accentColor):[100,180,200];
    return(
      <div style={{position:"fixed",inset:0,background:C.void,touchAction:"none"}}>
        <canvas ref={sessCanvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
        <div onClick={endSession} style={{position:"absolute",top:0,left:0,width:50,height:56,cursor:"pointer",zIndex:10}}/>

        {/* ─── AMBIENT CONTROLS ─── */}
        <div style={{position:"absolute",bottom:80,right:20,zIndex:20,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
          {showMixer&&(
            <div style={{background:"rgba(10,10,26,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:24,padding:"20px 18px",border:"1px solid rgba(255,255,255,0.05)",width:200,animation:"su .3s cubic-bezier(.4,0,.2,1)",boxShadow:"0 8px 40px rgba(0,0,0,0.4)"}}>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:11,color:C.text2}}>brainwaves</span>
                  <span style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:9,color:C.text3}}>{volumes.brain}%</span>
                </div>
                <input type="range" min="0" max="100" value={volumes.brain} onChange={e=>updateVolume("brain",Number(e.target.value))} style={{width:"100%",height:4,appearance:"none",WebkitAppearance:"none",background:"rgba(255,255,255,0.08)",borderRadius:2,outline:"none",cursor:"pointer"}}/>
              </div>
              <div style={{marginBottom:16,opacity:rainOn?1:0.35,transition:"opacity .3s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:11,color:C.text2}}>rain</span>
                  <span style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:9,color:C.text3}}>{rainOn?volumes.rain+"%":"off"}</span>
                </div>
                <input type="range" min="0" max="100" value={volumes.rain} onChange={e=>updateVolume("rain",Number(e.target.value))} disabled={!rainOn} style={{width:"100%",height:4,appearance:"none",WebkitAppearance:"none",background:"rgba(255,255,255,0.08)",borderRadius:2,outline:"none",cursor:rainOn?"pointer":"default"}}/>
              </div>
              <div style={{opacity:thunderOn?1:0.35,transition:"opacity .3s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:11,color:C.text2}}>thunder</span>
                  <span style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:9,color:C.text3}}>{thunderOn?volumes.thunder+"%":"off"}</span>
                </div>
                <input type="range" min="0" max="100" value={volumes.thunder} onChange={e=>updateVolume("thunder",Number(e.target.value))} disabled={!thunderOn} style={{width:"100%",height:4,appearance:"none",WebkitAppearance:"none",background:"rgba(255,255,255,0.08)",borderRadius:2,outline:"none",cursor:thunderOn?"pointer":"default"}}/>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div onClick={()=>setShowMixer(v=>!v)} style={{width:36,height:36,borderRadius:"50%",cursor:"pointer",background:showMixer?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,"+(showMixer?"0.12":"0.05")+")",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s ease"}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="8" width="2" height="5" rx="1" fill={"rgba("+acRgb[0]+","+acRgb[1]+","+acRgb[2]+","+(showMixer?"0.8":"0.35")+")"}/>
                <rect x="7" y="4" width="2" height="9" rx="1" fill={"rgba("+acRgb[0]+","+acRgb[1]+","+acRgb[2]+","+(showMixer?"0.8":"0.35")+")"}/>
                <rect x="12" y="6" width="2" height="7" rx="1" fill={"rgba("+acRgb[0]+","+acRgb[1]+","+acRgb[2]+","+(showMixer?"0.8":"0.35")+")"}/>
              </svg>
            </div>
            <div onClick={toggleRain} style={{width:40,height:40,borderRadius:"50%",cursor:"pointer",background:rainOn?"rgba(56,163,204,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(rainOn?"rgba(56,163,204,0.3)":"rgba(255,255,255,0.05)"),display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s ease",boxShadow:rainOn?"0 0 16px rgba(56,163,204,0.15)":"none"}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3C9 3 5 8.5 5 11.5C5 13.7 6.8 15 9 15C11.2 15 13 13.7 13 11.5C13 8.5 9 3 9 3Z" fill={rainOn?"rgba(56,163,204,0.7)":"rgba(150,148,175,0.2)"} stroke={rainOn?"rgba(56,163,204,0.9)":"rgba(150,148,175,0.3)"} strokeWidth="0.8"/>
              </svg>
            </div>
            <div onClick={toggleThunder} style={{width:40,height:40,borderRadius:"50%",cursor:"pointer",background:thunderOn?"rgba(255,179,71,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(thunderOn?"rgba(255,179,71,0.3)":"rgba(255,255,255,0.05)"),display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s ease",boxShadow:thunderOn?"0 0 16px rgba(255,179,71,0.15)":"none"}}>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M10 1L4 10H8L6 17L14 7H9L10 1Z" fill={thunderOn?"rgba(255,179,71,0.7)":"rgba(150,148,175,0.2)"} stroke={thunderOn?"rgba(255,179,71,0.9)":"rgba(150,148,175,0.3)"} strokeWidth="0.8" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <style>{`*{margin:0;padding:0;box-sizing:border-box}
          @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:white;cursor:pointer;border:none;box-shadow:0 0 6px rgba(255,255,255,0.2)}
          input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:white;cursor:pointer;border:none}
        `}</style>
      </div>
    );
  }

  if(sessionComplete){
    const ch=CHANNELS.find(c=>c.key===sessionComplete.key);const seq=SEQUENCES.find(s=>s.key===sessionComplete.key);
    const accent=ch?.accent||seq?.accent||C.bloom;
    const mins=Math.floor(sessionComplete.duration/60),secs=sessionComplete.duration%60;
    const msgs={bloom:"your nervous system thanks you",dissolve:"anxiety has a half-life — you just shortened it",ignite:"your prefrontal cortex is online",flow:"the creative channels are open",pulse:"your body remembers what presence feels like",transcend:"welcome back from the infinite",morning:"your brain is ready — go build something",nap:"you just reclaimed 2 hours of cognitive performance",stress:"the storm has passed",evening:"the day is complete — let it go",deepwork:"flow state primed — disappear into it",creative:"you found it — now go make it real",perform:"this is what you were built for",recovery:"your brain just completed a full recovery cycle",void:"rest well"};
    return(
      <div style={{position:"fixed",inset:0,background:C.void,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundImage:"radial-gradient(ellipse at center, "+accent+"08 0%, transparent 60%)"}}>
        <svg width="48" height="48" viewBox="0 0 48 48" style={{opacity:0,animation:"sf .8s ease .3s forwards"}}><path d="M12 26 C16 30,18 32,20 34 C24 28,30 20,38 14" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" style={{strokeDasharray:60,strokeDashoffset:60,animation:"sd 1.5s ease .5s forwards",filter:"drop-shadow(0 0 8px "+accent+"50)"}}/></svg>
        <div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:18,color:C.text1,letterSpacing:3,marginTop:28,opacity:0,animation:"sf .6s ease .8s forwards"}}>session complete</div>
        <div style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:28,color:accent,marginTop:12,opacity:0,animation:"sf .6s ease 1s forwards"}}>{mins}:{secs<10?"0":""}{secs}</div>
        <div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:13,color:C.text2,marginTop:16,opacity:0,animation:"sf .6s ease 1.3s forwards",textAlign:"center",maxWidth:280}}>{msgs[sessionComplete.key]||"you gave your brain what it needed"}</div>
        <div onClick={()=>setSessionComplete(null)} style={{marginTop:48,fontFamily:"'DM Sans'",fontWeight:300,fontSize:13,color:C.text3,cursor:"pointer",opacity:0,animation:"sf .5s ease 1.8s forwards",padding:"12px 24px"}}>return home</div>
        <style>{`@keyframes sf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sd{to{stroke-dashoffset:0}}*{margin:0;padding:0;box-sizing:border-box}`}</style>
      </div>
    );
  }

  return(
    <div style={{position:"fixed",inset:0,background:C.void,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch"}}>
      <div style={{position:"fixed",top:"15%",left:"50%",transform:"translateX(-50%)",width:400,height:400,borderRadius:"50%",pointerEvents:"none",background:"radial-gradient(circle, "+C.bloom+"06 0%, transparent 70%)",animation:"sfl 20s ease-in-out infinite"}}/>
      <div style={{maxWidth:440,margin:"0 auto",padding:"0 24px",position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingTop:52,paddingBottom:8,opacity:loadAnim>=1?1:0,transition:"opacity .5s ease"}}>
          <div><div style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:13,color:C.text3}}>{formatTime()}</div><div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:13,color:C.text2,marginTop:4,letterSpacing:1}}>{getGreeting()}</div></div>
          <div onClick={()=>setShowSettings(true)} style={{width:40,height:40,borderRadius:"50%",cursor:"pointer",background:"linear-gradient(135deg,"+C.deep+","+C.abyss+")",border:"1px solid rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px "+C.bloom+"15"}}><div style={{width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg,"+C.bloom+"40,"+C.bloom+"20)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit'",fontWeight:300,fontSize:9,color:C.bloom}}>B</div></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:32,paddingBottom:24,opacity:loadAnim>=2?1:0,transform:loadAnim>=2?"scale(1)":"scale(.9)",transition:"all .8s cubic-bezier(.4,0,.2,1)"}}>
          <div onClick={()=>launchSession("bloom","bloom")} style={{width:"min(220px, calc(100vw - 80px))",height:"min(220px, calc(100vw - 80px))",borderRadius:"50%",cursor:"pointer",position:"relative",overflow:"hidden",boxShadow:"0 0 60px "+C.bloom+"12, 0 0 120px "+C.bloom+"06"}}><canvas ref={bloomCanvasRef} style={{position:"absolute",top:0,left:0}}/><div style={{position:"absolute",inset:0,borderRadius:"50%",boxShadow:"inset 0 0 40px 20px "+C.void,pointerEvents:"none"}}/></div>
          <div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:20,color:C.bloom,letterSpacing:4,marginTop:20}}>bloom</div>
          <div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:11,color:C.text3,marginTop:6,animation:"sg 3s ease-in-out infinite"}}>tap to begin</div>
        </div>
        {isPremium&&<div style={{display:"flex",justifyContent:"center",marginBottom:32,opacity:loadAnim>=3?1:0,transition:"opacity .5s ease .1s"}}><div style={{padding:"8px 20px",borderRadius:50,background:suggestion.accent+"0A",border:"1px solid "+suggestion.accent+"15",fontFamily:"'DM Sans'",fontWeight:300,fontSize:11,color:suggestion.accent+"90",cursor:"pointer",letterSpacing:.5}}>{suggestion.label} recommendation → <span style={{color:suggestion.accent}}>{suggestion.name}</span></div></div>}
        <div style={{marginBottom:40,opacity:loadAnim>=4?1:0,transform:loadAnim>=4?"translateY(0)":"translateY(16px)",transition:"all .5s cubic-bezier(.4,0,.2,1)"}}>
          <div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:16,color:C.flow,letterSpacing:3,marginBottom:16}}>cortex</div>
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,scrollSnapType:"x mandatory"}}>
            {CHANNELS.map(ch=><div key={ch.key} onClick={()=>launchSession("cortex",ch.key)} style={{minWidth:112,height:152,borderRadius:24,cursor:"pointer",background:"linear-gradient(135deg,"+ch.accent+"0C 0%,"+ch.accent+"05 100%)",border:"1px solid "+ch.accent+"12",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16,scrollSnapAlign:"start",flexShrink:0,transition:"all .3s ease"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"radial-gradient(circle,"+ch.accent+"50 0%,"+ch.accent+"15 60%,transparent 100%)",animation:"sg "+Math.max(1.5,6/ch.hz*2)+"s ease-in-out infinite",boxShadow:"0 0 16px "+ch.accent+"30",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:6,height:6,borderRadius:"50%",background:ch.accent+"90"}}/></div>
              <div style={{fontFamily:"'Outfit'",fontWeight:300,fontSize:11,color:ch.accent,marginTop:14,letterSpacing:1}}>{ch.name}</div>
              <div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:9,color:C.text3,marginTop:4,textAlign:"center"}}>{ch.sub}</div>
            </div>)}
          </div>
        </div>
        <div style={{marginBottom:40,opacity:loadAnim>=5?1:0,transform:loadAnim>=5?"translateY(0)":"translateY(16px)",transition:"all .6s cubic-bezier(.4,0,.2,1)"}}>
          <div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:16,color:C.sequences,letterSpacing:3,marginBottom:16}}>sequences</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {SEQUENCES.map(seq=><div key={seq.key} onClick={()=>setShowSeqDetail(seq)} style={{background:"linear-gradient(135deg,"+C.abyss+" 0%,"+C.deep+"80 100%)",border:"1px solid rgba(255,255,255,.03)",borderRadius:24,padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"all .3s ease",position:"relative",boxShadow:"0 4px 24px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.02)"}}>
              <div style={{width:48,height:36,flexShrink:0}}><svg width="48" height="36" viewBox="0 0 48 36"><path d={renderCurve(seq.curve,48,36)} fill="none" stroke={seq.accent} strokeWidth="1.5" strokeLinecap="round" strokeOpacity=".5"/></svg></div>
              <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Outfit'",fontWeight:300,fontSize:14,color:C.text1,letterSpacing:.5}}>{seq.name}</div><div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:11,color:C.text2,marginTop:3,lineHeight:1.4}}>{seq.desc}</div></div>
              <div style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:10,color:C.text3,flexShrink:0}}>{seq.dur}</div>
              <div style={{position:"absolute",bottom:0,left:24,right:24,height:1,background:"linear-gradient(90deg,transparent,"+seq.accent+"15,transparent)"}}/>
            </div>)}
          </div>
        </div>
        <div style={{height:40}}/>
      </div>

      {showSettings&&<div style={{position:"fixed",inset:0,zIndex:100}}><div onClick={()=>setShowSettings(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"}}/><div style={{position:"absolute",bottom:0,left:0,right:0,maxHeight:"85vh",background:"linear-gradient(180deg,"+C.deep+" 0%,"+C.abyss+" 100%)",borderRadius:"32px 32px 0 0",padding:28,overflowY:"auto",border:"1px solid rgba(255,255,255,.04)",animation:"su .4s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:C.shelf,margin:"0 auto 24px"}}/>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}><div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,"+C.bloom+"30,"+C.bloom+"10)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit'",fontWeight:300,fontSize:18,color:C.bloom}}>B</div><div><div style={{fontFamily:"'Outfit'",fontWeight:300,fontSize:16,color:C.text1}}>Brendan</div><span style={{padding:"2px 10px",borderRadius:20,background:C.bloom+"15",border:"1px solid "+C.bloom+"20",fontFamily:"'Outfit'",fontSize:9,color:C.bloom,letterSpacing:2}}>SOMA+</span></div></div>
        <div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:14,color:C.text2,letterSpacing:2,marginBottom:16}}>preferences</div>
        {[{l:"headphones mode",k:"headphones"},{l:"haptic feedback",k:"haptic"},{l:"screen dim in void",k:"voidDim"}].map(pf=><div key={pf.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:52,borderBottom:"1px solid rgba(255,255,255,.03)"}}><span style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:14,color:C.text1}}>{pf.l}</span><div onClick={()=>setPrefs(p=>({...p,[pf.k]:!p[pf.k]}))} style={{width:48,height:26,borderRadius:13,cursor:"pointer",background:prefs[pf.k]?C.bloom+"40":"rgba(255,255,255,.06)",position:"relative",transition:"background .3s ease"}}><div style={{width:20,height:20,borderRadius:10,position:"absolute",top:3,left:prefs[pf.k]?25:3,background:prefs[pf.k]?C.bloom:"rgba(255,255,255,.3)",transition:"all .3s cubic-bezier(.4,0,.2,1.4)",boxShadow:prefs[pf.k]?"0 0 8px "+C.bloom+"40":"none"}}/></div></div>)}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:52}}><span style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:14,color:C.text1}}>nature sounds</span><div style={{display:"flex",gap:6}}>{["rain","ocean","wind","silence"].map(ns=><div key={ns} onClick={()=>setPrefs(p=>({...p,nature:ns}))} style={{padding:"5px 12px",borderRadius:20,cursor:"pointer",background:prefs.nature===ns?C.bloom+"15":"transparent",border:"1px solid "+(prefs.nature===ns?C.bloom+"30":"rgba(255,255,255,.05)"),fontFamily:"'DM Sans'",fontWeight:300,fontSize:10,color:prefs.nature===ns?C.bloom:C.text3,transition:"all .3s ease"}}>{ns}</div>)}</div></div>
        {isPremium&&<div style={{marginTop:28}}><div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:14,color:C.text2,letterSpacing:2,marginBottom:16}}>your practice</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{v:"24",l:"sessions",c:C.bloom},{v:"4.2",l:"hours",c:C.sequences},{v:"7",l:"day streak",c:C.ignite},{v:"flow",l:"favorite",c:C.flow}].map(st=><div key={st.l} style={{background:"linear-gradient(135deg,"+C.abyss+","+C.deep+"80)",borderRadius:20,padding:18,textAlign:"center",border:"1px solid rgba(255,255,255,.03)"}}><div style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:22,color:st.c}}>{st.v}</div><div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:10,color:C.text3,marginTop:4}}>{st.l}</div></div>)}</div></div>}
        <div onClick={()=>setShowSettings(false)} style={{marginTop:32,textAlign:"center",fontFamily:"'DM Sans'",fontWeight:300,fontSize:12,color:C.text3,cursor:"pointer",padding:12}}>close</div>
      </div></div>}

      {showSeqDetail&&<div style={{position:"fixed",inset:0,zIndex:100}}><div onClick={()=>setShowSeqDetail(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}/><div style={{position:"absolute",inset:24,top:60,background:"linear-gradient(180deg,"+C.deep+" 0%,"+C.abyss+" 100%)",borderRadius:32,padding:32,overflowY:"auto",border:"1px solid rgba(255,255,255,.04)",animation:"su .4s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column"}}>
        <div style={{fontFamily:"'Outfit'",fontWeight:200,fontSize:22,color:showSeqDetail.accent,letterSpacing:2}}>{showSeqDetail.name}</div>
        <div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:13,color:C.text2,marginTop:8,lineHeight:1.6}}>{showSeqDetail.desc}</div>
        <div style={{fontFamily:"'JetBrains Mono'",fontWeight:300,fontSize:11,color:C.text3,marginTop:8}}>{showSeqDetail.dur}</div>
        <div style={{margin:"28px 0"}}><svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none"><defs><linearGradient id="scg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={showSeqDetail.accent} stopOpacity=".8"/><stop offset="100%" stopColor={showSeqDetail.accent} stopOpacity=".3"/></linearGradient><filter id="sgf"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>{[{l:"energy",y:10},{l:"focus",y:35},{l:"calm",y:60},{l:"dream",y:85},{l:"sleep",y:110}].map(lb=><text key={lb.l} x="0" y={lb.y} fill={C.text3} fontSize="7" fontFamily="DM Sans">{lb.l}</text>)}<path d={renderCurve(showSeqDetail.curve,260,110)} fill="none" stroke="url(#scg)" strokeWidth="2.5" strokeLinecap="round" filter="url(#sgf)" transform="translate(38,5)"/></svg></div>
        <div style={{fontFamily:"'DM Sans'",fontWeight:300,fontSize:12,color:C.text2,lineHeight:1.8}}>bring: headphones, a quiet space</div>
        <div style={{flex:1}}/>
        <div onClick={()=>{setShowSeqDetail(null);launchSession("sequence",showSeqDetail.key);}} style={{padding:"16px 0",borderRadius:50,textAlign:"center",cursor:"pointer",background:showSeqDetail.accent,fontFamily:"'Outfit'",fontWeight:300,fontSize:14,color:C.void,letterSpacing:1,boxShadow:"0 0 30px "+showSeqDetail.accent+"30",marginTop:24}}>begin</div>
        <div onClick={()=>setShowSeqDetail(null)} style={{textAlign:"center",fontFamily:"'DM Sans'",fontWeight:300,fontSize:12,color:C.text3,marginTop:12,cursor:"pointer",padding:8}}>back</div>
      </div></div>}

      <style>{`@keyframes sf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sfl{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}@keyframes sg{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}@keyframes su{from{transform:translateY(40px);opacity:.5}to{transform:translateY(0);opacity:1}}@keyframes sd{to{stroke-dashoffset:0}}@keyframes sp{0%,100%{transform:scale(1)}50%{transform:scale(1.8)}}*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
