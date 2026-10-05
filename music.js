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
let LIST=null,unlocked=false,cur=null,curScene=null,workout=false,duckVoice=false,lastTitle="",bad=new Set();
const el=new Audio();el.preload="auto";el.setAttribute("playsinline","");el.setAttribute("webkit-playsinline","");
const hit=new Audio("brand/intro-hit.m4a");hit.preload="auto";

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
  if(vis("qpop"))sc="feed";                                            // citat deschis pe tot ecranul
  else if(vis("reader"))sc="raft";
  else if(vis("medov")||(typeof jrOpen!=="undefined"&&jrOpen))sc="azi";
  else if(vis("v-sport"))sc=workout?"sport":null;
  else if(vis("v-azi"))sc="azi";
  return sc&&pool(sc).length?sc:null;                                   // Feed, Shorts, Salvate, Setări, Raft: liniște
}
function pool(sc){return (LIST&&LIST[sc]||[]).filter(t=>!bad.has(t.f))}
const order={};
function pick(sc){
  const L=pool(sc);if(!L.length)return null;
  if(!order[sc]||!order[sc].length)order[sc]=L.map((_,i)=>i).sort(()=>Math.random()-.5);
  return L[order[sc].shift()%L.length];
}

let pauseT=0,want=false;
function load(sc,fresh){
  const r=!fresh&&S.music.last[sc];
  const t=(r&&pool(sc).find(x=>x.f===r.f))||pick(sc);if(!t)return false;
  cur=t;curScene=sc;
  el.src=t.f+(r&&r.f===t.f&&r.at>3?"#t="+Math.floor(r.at):"");
  setVol(0,0);
  return true;
}
function remember(){if(cur&&curScene&&el.currentTime>0){S.music.last[curScene]={f:cur.f,at:Math.floor(el.currentTime)};save()}}
function refresh(){
  const sc=sceneNow();
  if(!sc){
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
el.addEventListener("ended",()=>{delete S.music.last[curScene];if(load(curScene,true)){want=false;refresh()}});
el.addEventListener("error",()=>{if(cur&&el.src&&!el.src.startsWith("data:")){bad.add(cur.f);next()}});
el.addEventListener("playing",()=>{paint();showTitle()});
el.addEventListener("pause",paint);
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
  toggle();
},true);

function settingsUI(){
  const v=$m("mus-vol"),i=$m("mus-intro"),o=$m("mus-on");
  if(v){v.value=Math.round(S.music.vol*100);v.oninput=()=>{S.music.vol=v.value/100;save();if(want)setVol(level(),150)}}
  if(i){i.checked=!!S.music.intro;i.onchange=()=>{S.music.intro=i.checked;save()}}
  if(o){o.checked=!!S.music.on;o.onchange=()=>{if(o.checked!==S.music.on)toggle()}}
  const n=$m("mus-next");if(n)n.onclick=()=>{if(!S.music.on){toast("Pornește muzica întâi");return}if(!sceneNow()){toast("Muzica merge la citate, în Azi, la citit și la antrenament");return}next()};
  const p=$m("mus-test");if(p)p.onclick=()=>{try{hit.currentTime=0;hit.play()}catch(e){}};
  const c=$m("mus-credit");if(c)c.textContent=LIST&&LIST.credit?LIST.credit:"";
  paint();
}

document.addEventListener("visibilitychange",()=>{if(document.hidden)remember();refresh()});
setInterval(refresh,1200);   // urmărește singur unde ești (clip pornit, pagină schimbată etc.)
window.Music={refresh,workout(on){workout=!!on;refresh()},duck(on){duckVoice=!!on;if(want)setVol(level(),400)},next,introStart,settingsUI,get unlocked(){return unlocked}};
paint();
})();
