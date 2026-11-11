// IMPERIUM · Muzică de fundal, fără reclame: fișierele sunt în aplicație (music/), listele în music.json.
// citat deschis → coloană sonoră cinematică · sport → sală (doar cât rulează antrenamentul) · azi/meditație/jurnal → meditație și frecvențe · cititor → muzică de citit
// Se oprește singură când pornește un clip, în Shorts, Salvate, Setări, pe Raft și când ieși din aplicație.
(()=>{
"use strict";
const $m=id=>document.getElementById(id);
S.music=Object.assign({on:true,intro:true,vol:.8,last:{}},S.music||{});
delete S.music.bad;
const GAIN={feed:.8,sport:1,azi:.85,raft:.75};          // piesele sunt deja aduse la volume potrivite pe zone
const NAME={feed:"Coloană sonoră",sport:"Sală",azi:"Meditație",raft:"Citit"};
const SILENT="data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";
let plOpen=false,userPaused=false,LIST=null,unlocked=false,cur=null,curScene=null,workout=false,duckVoice=false,lastTitle="",bad=new Set();
const el=new Audio();el.preload="auto";el.setAttribute("playsinline","");el.setAttribute("webkit-playsinline","");
const hit=new Audio("brand/intro-hit.m4a");hit.preload="auto";

// ── muzica ta: fișiere păstrate în telefon (IndexedDB), au prioritate în zona lor ──
let MINE={feed:[],sport:[],azi:[],raft:[]};const urls=new Map();
const ZONE_OF=n=>{n=n.toLowerCase();return /^(citat|epic|quote)/.test(n)?"feed":/^(medit|432|528|frecv)/.test(n)?"azi":/^(citi|read|lectur)/.test(n)?"raft":/^(sala|gym|sport|antren)/.test(n)?"sport":null};
// „Road_to_Gondor___LOTR_..._-_Symbology_Cinematics.mp3” → titlu „Road to Gondor · LOTR …”, artist „Symbology Cinematics”
function nice(n){
  let t=n.replace(/\.[a-z0-9]{2,4}$/i,"").replace(/_{3}/g," · ").replace(/__/g,": ").replace(/_/g," ").replace(/\s+/g," ").replace(/\s:\s/g,": ").trim();
  let a="";const i=t.lastIndexOf(" - ");if(i>8&&t.length-i<48){a=t.slice(i+3).trim();t=t.slice(0,i).trim()}
  return [t,a];
}
const r0=(a,b)=>(a.z==="raft"&&b.z==="raft")?(a.add||0)-(b.add||0):a.n.localeCompare(b.n,undefined,{numeric:true});
function durOf(blob){return new Promise(res=>{try{const a=new Audio(),u=URL.createObjectURL(blob);let done=false;const end=d=>{if(done)return;done=true;URL.revokeObjectURL(u);res(isFinite(d)?Math.round(d):0)};
  a.preload="metadata";a.onloadedmetadata=()=>end(a.duration);a.onerror=()=>end(0);setTimeout(()=>end(0),8000);a.src=u}catch(e){res(0)}})}
async function loadMine(){
  try{
    const all=await idb("tracks","readonly",t=>t.objectStore("tracks").getAll());
    const m={feed:[],sport:[],azi:[],raft:[]};
    (all||[]).sort((a,b)=>r0(a,b)).forEach(r=>{if(m[r.z]){const [t,a]=nice(r.n);m[r.z].push({f:"mine:"+r.id,t,a:a||"Muzica ta",d:r.d||0,mine:true,id:r.id})}});
    MINE=m;
    // pregătim adresele din timp, ca piesa să pornească imediat la atingere
    Object.values(m).flat().forEach(t=>{if(!urls.has(t.id))srcOf(t).catch(()=>{})});
  }catch(e){}
  renderMine();refresh();
}
async function srcOf(t){
  if(!t.mine)return t.f;
  if(urls.has(t.id))return urls.get(t.id);
  const blob=await idb("tfiles","readonly",x=>x.objectStore("tfiles").get(t.id));
  if(!blob)throw new Error("lipsă");
  const u=URL.createObjectURL(blob);urls.set(t.id,u);return u;
}
async function addMine(files,zone){
  let ok=0,skip=0;
  for(const f of files){
    const z=zone||ZONE_OF(f.name);if(!z){skip++;continue}
    const id="t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    try{
      const buf=await f.arrayBuffer();
      const blob=new Blob([buf],{type:f.type||"audio/mp4"});
      const d=await durOf(blob);
      await idb(["tracks","tfiles"],"readwrite",t=>{t.objectStore("tfiles").put(blob,id);return t.objectStore("tracks").put({id,z,n:f.name,s:f.size,d,add:Date.now()})});
      ok++;
    }catch(e){skip++}
  }
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  if(ok&&MINE.feed.length===0&&files.some(f=>ZONE_OF(f.name)==="feed")){S.music.qsrc="local";save()}
  toast(ok?`${ok===1?"O piesă adăugată":ok+" piese adăugate"}`+(skip?` · ${skip} sărite`:""):zone?"Nu am putut adăuga fișierul. Încearcă din nou.":"Niciun fișier recunoscut. Numele trebuie să înceapă cu citate-, meditatie-, citit- sau sala-");
  await loadMine();
  if(MINE.feed.length&&S.music.qsrc!=="local"){S.music.qsrc="local";save();settingsUI()}
}
async function delZone(z){
  const ids=MINE[z].map(t=>t.id);
  await idb(["tracks","tfiles"],"readwrite",t=>{ids.forEach(id=>{t.objectStore("tracks").delete(id);t.objectStore("tfiles").delete(id)})});
  ids.forEach(id=>{if(urls.has(id)){URL.revokeObjectURL(urls.get(id));urls.delete(id)}});
  if(cur&&cur.mine&&cur.f.startsWith("mine:")&&ids.includes(cur.id)){el.pause();cur=null;curScene=null;want=false}
  await loadMine();
}
const ZNAME={feed:"Citate",azi:"Meditație",raft:"Citit",sport:"Sală"};
function renderMine(){
  const box=$m("my-mus");if(!box)return;
  const rows=Object.keys(ZNAME).filter(z=>MINE[z].length).map(z=>{
    return `<div class="row"><div><b>${ZNAME[z]}</b><small>${MINE[z].length} piese</small></div><button class="link" data-delz="${z}">Șterge</button></div>`}).join("");
  box.innerHTML=rows||'<p class="note">Încă nu ai adăugat muzică.</p>';
}
document.addEventListener("click",async e=>{
  const d=e.target.closest("[data-delz]");if(!d)return;
  if(!confirm(`Ștergi muzica ta de la ${ZNAME[d.dataset.delz]}?`))return;
  await delZone(d.dataset.delz);toast("Șters");
});
document.addEventListener("change",e=>{if(e.target&&e.target.id==="my-mus-in"){const fs=[...e.target.files];e.target.value="";if(fs.length){toast("Se adaugă…");addMine(fs)}}});
setTimeout(loadMine,300);

fetch("music.json?h="+Math.floor(Date.now()/36e5)).then(r=>r.ok?r.json():null).then(j=>{if(j){LIST=j;refresh();settingsUI()}}).catch(()=>{});

// ── volum: prin Web Audio (fade-uri reale); pe iPhone-uri vechi, direct (acolo merge și cu butonul de silențios pornit) ──
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
let ctx=null,gain=null,useGain=false;
function setupGain(){
  if(ctx||useGain===null)return;
  if(isIOS){useGain=null;return}       // pe iPhone, Web Audio poate tăia sunetul (silențios, alte sunete); redăm direct
  try{
    if(navigator.audioSession)navigator.audioSession.type="playback";   // sună și cu butonul de silențios pornit
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    const src=ctx.createMediaElementSource(el);gain=ctx.createGain();gain.gain.value=0;src.connect(gain);gain.connect(ctx.destination);useGain=true;
  }catch(e){useGain=null}
}
function level(){return (GAIN[curScene]||.8)*S.music.vol*(duckVoice?.4:1)}
function setVol(v,ms){
  if(useGain){const t=ctx.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(v,t+ms/1000)}
  else{try{el.volume=Math.max(0,Math.min(1,v))}catch(e){}}
}

// ── în ce zonă suntem acum ──
const vis=id=>{const e=$m(id);return e&&!e.hidden};
function sceneNow(){
  if(!S.music.on||document.hidden||!LIST||!unlocked)return null;
  if(typeof introOn!=="undefined"&&introOn)return null;
  if(typeof active!=="undefined"&&active)return null;                  // rulează un clip
  let sc=null;
  if(vis("qpop"))sc=(S.music.qsrc!=="local"&&!window.__spFail)?null:"feed";   // citat deschis: Spotify sau piesele noastre
  else if(vis("reader")||plOpen)sc="raft";
  else if(vis("medov")||(typeof jrOpen!=="undefined"&&jrOpen))sc="azi";
  else if(vis("v-sport"))sc=workout?"sport":(window.Health&&Health.saunaMusic&&Health.saunaMusic())?"azi":null;   // în saună: muzica de meditație
  else if(vis("v-azi"))sc="azi";
  if(sc==="raft"&&userPaused)return null;                              // ai pus pauză din playlist: rămâne pauză până apeși play
  return sc&&pool(sc).length?sc:null;                                   // Feed, Shorts, Salvate, Setări, Raft: liniște
}
function pool(sc){
  if(sc==="raft")return [...(MINE.raft||[]),...((LIST&&LIST.raft)||[])].filter(t=>!bad.has(t.f));
  if(MINE[sc]&&MINE[sc].length)return MINE[sc].filter(t=>!bad.has(t.f));return (LIST&&LIST[sc]||[]).filter(t=>!bad.has(t.f))}
S.music.pl=Object.assign({sel:null,mode:"seq"},S.music.pl||{});   // seq = în ordine · shuf = amestecat · one = repetă piesa
const order={};
function pick(sc){
  const L=pool(sc);if(!L.length)return null;
  if(sc==="raft"){
    const P=S.music.pl,i=cur&&curScene==="raft"?L.findIndex(t=>t.f===cur.f):-1;
    if(P.mode==="one"&&i>=0)return L[i];
    if(P.mode==="seq")return L[(i+1)%L.length];
  }
  if(!order[sc]||!order[sc].length)order[sc]=L.map((_,i)=>i).sort(()=>Math.random()-.5);
  return L[order[sc].shift()%L.length];
}

let pauseT=0,want=false;
function load(sc,fresh){
  const segs=sc==="feed"&&MINE.feed.length;                 // bucățile tale de 45 s: alta la fiecare citat
  const r=!fresh&&!segs&&S.music.last[sc];
  const sel=sc==="raft"&&!fresh&&!r&&S.music.pl.sel&&pool(sc).find(x=>x.f===S.music.pl.sel);
  const t=(r&&pool(sc).find(x=>x.f===r.f))||sel||pick(sc);if(!t)return false;
  cur=t;curScene=sc;
  if(t.mine){
    if(urls.has(t.id))el.src=urls.get(t.id)+(r&&r.f===t.f&&r.at>3?"#t="+Math.floor(r.at):"");
    else{el.removeAttribute("src");srcOf(t).then(u=>{if(cur===t){el.src=u+(r&&r.f===t.f&&r.at>3?"#t="+Math.floor(r.at):"");if(want)tryPlay()}}).catch(()=>{bad.add(t.f);next()})}
  }else el.src=t.f+(r&&r.f===t.f&&r.at>3?"#t="+Math.floor(r.at):"");
  setVol(0,0);
  return true;
}
function remember(){if(cur&&curScene&&!(cur.mine&&curScene==="feed")&&el.currentTime>0){S.music.last[curScene]={f:cur.f,at:Math.floor(el.currentTime)};save()}}
function refresh(){
  const sc=sceneNow();
  if(!sc){
    if(want&&curScene==="feed"&&MINE.feed.length){cur=null}
    if(want){want=false;remember();setVol(0,500);clearTimeout(pauseT);pauseT=setTimeout(()=>{if(!want)el.pause()},520)}
    paint();return;
  }
  clearTimeout(pauseT);
  if(sc!==curScene||!cur){remember();if(!load(sc))return;want=false}
  if(!want||el.paused){
    want=true;
    tryPlay();
    setVol(level(),900);
  }else setVol(level(),300);
  paint();
}
let blocked=false;
function tryPlay(){
  const p=el.play();
  if(p&&p.then)p.then(()=>{blocked=false}).catch(err=>{if(err&&err.name==="NotAllowedError")blocked=true});
}
// dacă iPhone-ul a refuzat redarea, o pornim la următoarea atingere (atunci are voie)
["touchend","click"].forEach(ev=>addEventListener(ev,()=>{if(unlocked&&want&&el.paused&&!document.hidden)tryPlay()},{capture:true,passive:true}));
function next(){
  const sc=sceneNow()||curScene;if(!sc)return;
  delete S.music.last[sc];lastTitle="";
  if(!load(sc,true))return;want=false;refresh();
}
el.addEventListener("ended",()=>{delete S.music.last[curScene];if(curScene==="raft"&&S.music.pl.mode==="one"){el.currentTime=0;tryPlay();return}if(load(curScene,true)){want=false;refresh();plDraw()}});
el.addEventListener("error",()=>{if(cur&&el.src&&!el.src.startsWith("data:")){bad.add(cur.f);next()}});
el.addEventListener("playing",()=>{paint();showTitle();plDraw()});
el.addEventListener("pause",()=>{paint();plDraw()});
function showTitle(){
  if(!cur||cur.f===lastTitle||!want)return;lastTitle=cur.f;
  try{toast("♪ "+NAME[curScene]+" · "+cur.t)}catch(e){}
}

// ── deblocarea sunetului: iPhone permite sunet doar după o atingere; o singură dată pe sesiune ──
function unlock(fromIntro){
  if(unlocked)return;unlocked=true;
  setupGain();try{ctx&&ctx.resume()}catch(e){}
  try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
  if(!sceneNow()){              // nu e nimic de cântat acum: deblocăm cu o clipă de liniște
    el.src=SILENT;const p=el.play();if(p&&p.then)p.then(()=>el.pause()).catch(()=>{});
    if(!fromIntro){try{hit.muted=true;const q=hit.play();if(q&&q.then)q.then(()=>{hit.pause();hit.currentTime=0;hit.muted=false}).catch(()=>{hit.muted=false})}catch(e){}}
  }else refresh();
}
["touchend","click","keydown"].forEach(ev=>addEventListener(ev,e=>{
  if(unlocked)return;
  if(typeof introOn!=="undefined"&&introOn&&e.target&&e.target.closest&&e.target.closest("#intro")&&S.music.intro)return;   // îl deblochează intro-ul
  unlock();
},{capture:true,passive:true}));
function introStart(elapsed){    // apelat din atingerea de pe ecranul de intro
  if(S.music.intro){try{hit.currentTime=Math.max(0,Math.min(1.42,elapsed||0));hit.muted=false;const p=hit.play();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
  unlock(true);
}

// ── butonul cu boxă ──
const ICON_ON='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_OFF='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>';
function paint(){
  const on=S.music.on,live=on&&want&&!el.paused;
  document.querySelectorAll(".musbtn").forEach(b=>{
    if(b._on!==on){b.innerHTML=(on?ICON_ON:ICON_OFF)+'<span class="eq"><i></i><i></i><i></i></span>';b._on=on}
    b.classList.toggle("on",on);b.classList.toggle("live",live);
    b.setAttribute("aria-pressed",on);b.setAttribute("aria-label",on?"Oprește muzica":"Pornește muzica");
  });
  const t=$m("mus-now");if(t)t.textContent=cur&&on?`Acum: ${NAME[curScene]||""} · ${cur.t}${cur.a?" — "+cur.a:""}`:"";
}
function toggle(){
  S.music.on=!S.music.on;save();
  document.dispatchEvent(new CustomEvent("musictoggle"));
  if(!S.music.on){remember();want=false;setVol(0,350);setTimeout(()=>el.pause(),380);toast("Muzica oprită")}
  else{lastTitle="";if(!unlocked)unlock();refresh();if(!sceneNow())toast("Muzica pornește când deschizi un citat, în Azi, la citit și la antrenament")}
  paint();
}
document.addEventListener("pointerdown",e=>{
  const b=e.target.closest(".musbtn");if(!b)return;
  b._lp=setTimeout(()=>{b._lp=0;b._skip=true;if(S.music.on){next();if(navigator.vibrate)navigator.vibrate(15)}},550);
});
["pointerup","pointercancel"].forEach(ev=>document.addEventListener(ev,()=>{document.querySelectorAll(".musbtn").forEach(b=>{if(b._lp){clearTimeout(b._lp);b._lp=0}})},true));
document.addEventListener("click",e=>{
  const b=e.target.closest(".musbtn");if(!b)return;e.stopPropagation();
  if(b._skip){b._skip=false;return}
  if(b.id==="mus-r"){plOpenSheet();return}
  toggle();
},true);

// ── playlistul de citit ──
const fmtD=d=>!d?"":d>=3600?`${Math.floor(d/3600)} h ${String(Math.floor(d%3600/60)).padStart(2,"0")} min`:`${Math.floor(d/60)}:${String(d%60).padStart(2,"0")}`;
const esc2=x=>String(x??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
let plEl=null;
function plRow(t){
  const on=cur&&cur.f===t.f&&curScene==="raft",live=on&&want&&!el.paused,sel=S.music.pl.sel===t.f;
  return `<div class="plr${on?" on":""}${live?" live":""}${sel&&!on?" sel":""}"><button class="plp" data-plf="${esc2(t.f)}">
    <span class="plic">${live?'<span class="eq"><i></i><i></i><i></i></span>':on?'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'}</span>
    <span class="plt"><b>${esc2(t.t)}</b><small>${esc2(t.a||"")}${t.d?" · "+fmtD(t.d):""}</small></span></button>
    ${t.mine?`<button class="pld" data-pldel="${esc2(t.id)}" aria-label="Șterge piesa"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`:""}</div>`;
}
function plDraw(){
  if(!plEl||!plEl.isConnected)return;const P=S.music.pl,mine=MINE.raft||[],app=(LIST&&LIST.raft)||[];
  const now=cur&&curScene==="raft"?cur:null,pct=now&&el.duration?Math.min(100,el.currentTime/el.duration*100):0;
  plEl.querySelector(".pl-body").innerHTML=`
    <div class="pl-now">${now?`<small>${want&&!el.paused?"Se aude acum":userPaused?"Pe pauză":"Gata de pornit"}</small><b>${esc2(now.t)}</b><span class="pl-bar"><i style="width:${pct.toFixed(1)}%"></i></span>`:`<small>Muzica de citit</small><b>Alege o piesă</b>`}
      <div class="pl-ctl"><button data-plx="prev" aria-label="Piesa de dinainte"><svg viewBox="0 0 24 24"><path d="M6 5v14M18 5L9 12l9 7z"/></svg></button>
      <button class="pl-pp" data-plx="pp" aria-label="${want&&!el.paused?"Pauză":"Pornește"}">${want&&!el.paused?'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'}</button>
      <button data-plx="next" aria-label="Piesa următoare"><svg viewBox="0 0 24 24"><path d="M18 5v14M6 5l9 7-9 7z"/></svg></button></div></div>
    <div class="pl-modes">${[["seq","În ordine"],["shuf","Amestecat"],["one","Repetă piesa"]].map(([k,l])=>`<button data-plm="${k}" aria-pressed="${P.mode===k}">${l}</button>`).join("")}</div>
    <div class="pl-h"><span>Muzica ta</span><label class="pl-add" for="pl-in">＋ Adaugă din telefon</label></div>
    ${mine.length?mine.map(plRow).join(""):`<p class="pl-empty">Apasă „Adaugă din telefon” și alege o melodie din Fișiere. Rămâne salvată pe telefon, chiar și fără internet.</p>`}
    ${app.length?`<div class="pl-h"><span>Din aplicație</span></div>${app.map(plRow).join("")}`:""}
    ${LIST&&LIST.credit?`<p class="pl-cr">${esc2(LIST.credit)}</p>`:""}`;
}
function plOpenSheet(){
  if(plEl)return;
  plEl=document.createElement("div");plEl.className="gsheet plsheet";
  plEl.innerHTML=`<div class="gs-card"><i class="gs-grab"></i><div class="pl-hd"><h3>Muzică pentru citit</h3><label class="tog"><input type="checkbox" id="pl-on" ${S.music.on?"checked":""}> Pornită</label></div>
    <div class="pl-body"></div><input type="file" id="pl-in" accept="audio/*,.mp3,.m4a,.aac,.wav" multiple hidden></div>`;
  document.body.appendChild(plEl);requestAnimationFrame(()=>plEl&&plEl.classList.add("in"));
  plOpen=false;if(!unlocked)unlock();
  const go=()=>{userPaused=false;plOpen=!vis("reader")};
  plDraw();refresh();
  const tk=setInterval(()=>{if(!plEl){clearInterval(tk);return}const b=plEl.querySelector(".pl-bar i");if(b&&el.duration)b.style.width=Math.min(100,el.currentTime/el.duration*100).toFixed(1)+"%"},1000);
  const shut=()=>{if(!plEl)return;const m=plEl;plEl=null;plOpen=false;m.classList.remove("in");setTimeout(()=>m.remove(),350);refresh()};
  plEl.addEventListener("click",async e=>{
    if(e.target===plEl){shut();return}
    const f=e.target.closest("[data-plf]");
    if(f){const t=pool("raft").find(x=>x.f===f.dataset.plf);if(!t)return;
      if(cur&&cur.f===t.f&&curScene==="raft"&&(want||userPaused)){if(el.paused||userPaused){go();want=false;refresh()}else{userPaused=true;want=false;remember();el.pause()}plDraw();return}
      go();S.music.pl.sel=t.f;if(!S.music.on){S.music.on=true;const c=plEl.querySelector("#pl-on");if(c)c.checked=true}
      remember();delete S.music.last.raft;save();cur=null;curScene=null;want=false;lastTitle="";refresh();plDraw();return}
    const x=e.target.closest("[data-plx]");
    if(x){const a=x.dataset.plx,L=pool("raft");
      if(a==="pp"){if(want&&!el.paused&&curScene==="raft"){userPaused=true;want=false;remember();el.pause()}else{go();if(!S.music.on){toggle();plEl&&(plEl.querySelector("#pl-on").checked=true)}if(!cur||curScene!=="raft"){cur=null}want=false;refresh()}plDraw();return}
      if(!L.length)return;const i=Math.max(0,cur?L.findIndex(t=>t.f===cur.f):0);
      const t=a==="next"?(S.music.pl.mode==="shuf"?L[Math.floor(Math.random()*L.length)]:L[(i+1)%L.length]):L[(i-1+L.length)%L.length];
      go();S.music.pl.sel=t.f;remember();delete S.music.last.raft;save();cur=null;curScene=null;want=false;lastTitle="";refresh();plDraw();return}
    const m=e.target.closest("[data-plm]");if(m){S.music.pl.mode=m.dataset.plm;save();plDraw();return}
    const d=e.target.closest("[data-pldel]");
    if(d){const t=(MINE.raft||[]).find(x=>x.id===d.dataset.pldel);if(!t||!confirm(`Ștergi „${t.t}” de pe telefon?`))return;
      if(cur&&cur.id===t.id){el.pause();cur=null;curScene=null;want=false}
      await idb(["tracks","tfiles"],"readwrite",x=>{x.objectStore("tracks").delete(t.id);x.objectStore("tfiles").delete(t.id)});
      if(urls.has(t.id)){URL.revokeObjectURL(urls.get(t.id));urls.delete(t.id)}
      if(S.music.pl.sel===t.f){S.music.pl.sel=null;save()}
      await loadMine();plDraw();toast("Piesa a fost ștearsă");return}
  });
  plEl.addEventListener("change",async e=>{
    if(e.target.id==="pl-on"){if(e.target.checked!==S.music.on)toggle();plDraw();return}
    if(e.target.id==="pl-in"){const fs=[...e.target.files];e.target.value="";if(!fs.length)return;
      const h=plEl.querySelector(".pl-add");if(h)h.textContent="Se salvează…";
      const before=new Set((MINE.raft||[]).map(t=>t.id));
      await addMine(fs,"raft");
      const nu=(MINE.raft||[]).find(t=>!before.has(t.id));
      if(nu){go();S.music.pl.sel=nu.f;S.music.on=true;remember();delete S.music.last.raft;save();cur=null;curScene=null;want=false;lastTitle="";refresh()}
      plDraw()}
  });
  let y0=null;plEl.addEventListener("touchstart",e=>{const c=plEl.querySelector(".gs-card");if(c.scrollTop<=0)y0=e.touches[0].clientY},{passive:true});
  plEl.addEventListener("touchend",e=>{if(y0!=null&&e.changedTouches[0].clientY-y0>90)shut();y0=null},{passive:true});
}
document.addEventListener("click",e=>{if(e.target.closest("#bk-mus")){e.preventDefault();plOpenSheet()}});

function settingsUI(){
  const v=$m("mus-vol"),i=$m("mus-intro"),o=$m("mus-on");
  if(v){v.value=Math.round(S.music.vol*100);v.oninput=()=>{S.music.vol=v.value/100;save();if(want)setVol(level(),150)}}
  if(i){i.checked=!!S.music.intro;i.onchange=()=>{S.music.intro=i.checked;save()}}
  if(o){o.checked=!!S.music.on;o.onchange=()=>{if(o.checked!==S.music.on)toggle()}}
  const n=$m("mus-next");if(n)n.onclick=()=>{if(!S.music.on){toast("Pornește muzica întâi");return}if(!sceneNow()){toast("Muzica merge la citate, în Azi, la citit și la antrenament");return}next()};
  const p=$m("mus-test");if(p)p.onclick=()=>{try{hit.currentTime=0;hit.play()}catch(e){}};
  document.querySelectorAll('input[name="qsrc"]').forEach(r=>{r.checked=(S.music.qsrc||"spotify")===r.value;r.onchange=()=>{S.music.qsrc=r.value;save();toast(r.value==="local"?"Citatele folosesc piesele din aplicație":"Citatele folosesc Spotify")}});
  const own=$m("sp-own");
  if(own){own.value=S.music.spList?"open.spotify.com/"+S.music.spList.split(":").slice(1).join("/"):"";
    own.onchange=()=>{const m=own.value.match(/(playlist|album|track|artist)[\/:]([A-Za-z0-9]{10,})/);
      if(!own.value.trim()){delete S.music.spList;save();toast("Folosesc playlisturile alese de IMPERIUM");document.dispatchEvent(new CustomEvent("spotifylist"));return}
      if(!m){toast("Linkul nu pare de Spotify");return}
      S.music.spList=`spotify:${m[1]}:${m[2]}`;save();toast("Playlist salvat");document.dispatchEvent(new CustomEvent("spotifylist"))}}
  const c=$m("mus-credit");if(c)c.textContent=LIST&&LIST.credit?LIST.credit:"";
  paint();
}

document.addEventListener("visibilitychange",()=>{if(document.hidden)remember();refresh()});
setInterval(refresh,1200);   // urmărește singur unde ești (clip pornit, pagină schimbată etc.)
window.Music={playlist:plOpenSheet,refresh,workout(on){workout=!!on;refresh()},duck(on){duckVoice=!!on;if(want)setVol(level(),400)},next,introStart,settingsUI,get unlocked(){return unlocked}};
paint();
})();
