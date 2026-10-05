// IMPERIUM · Muzică de fundal: fiecare zonă are lista ei (de pe YouTube), plus sunetul de la deschidere.
// feed → cinematic/focus · sport → sală (doar cât rulează antrenamentul) · azi/meditație/jurnal → frecvențe · cititor → muzică de citit
// Se oprește singură când pornește un clip, în Shorts, Salvate și Setări, și când ieși din aplicație.
(()=>{
"use strict";
const $m=id=>document.getElementById(id);
S.music=Object.assign({on:true,intro:true,vol:.8,bad:[],last:{}},S.music||{});
const BASE={feed:40,sport:62,azi:34,raft:30};          // volum de bază pe zone (din 100)
const NAME={feed:"Cinematic · focus",sport:"Sală",azi:"Meditație",raft:"Citit"};
let LIST=null,mp=null,ready=false,unlocked=false,cur=null,curScene=null,vol=0,fadeT=0,playing=false,workout=false,lastTitleShown="";
const order={};    // ordinea amestecată pe zone

fetch("music.json?h="+Math.floor(Date.now()/36e5)).then(r=>r.ok?r.json():null).then(j=>{if(j){LIST=j;refresh()}}).catch(()=>{});

// ── player YouTube separat, invizibil ──
function make(){
  if(mp||!window.YT||!YT.Player)return;
  const d=document.createElement("div");d.id="mpbox";d.innerHTML='<div id="mp"></div>';document.body.appendChild(d);
  mp=new YT.Player("mp",{width:200,height:200,playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,iv_load_policy:3,rel:0,playsinline:1,modestbranding:1,origin:location.origin},
    events:{onReady:()=>{ready=true;mp.mute();refresh()},
      onStateChange:e=>{
        if(e.data===1){playing=true;paint();if(unlocked&&!mp.isMuted())showTitle()}
        if(e.data===2||e.data===-1)playing=false,paint();
        if(e.data===0){playing=false;next()}
      },
      onError:()=>{if(cur){S.music.bad.push(cur.id);S.music.bad=S.music.bad.slice(-80);save()}next()}}});
}
const prevReady=window.onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady=()=>{try{prevReady&&prevReady()}catch(e){}make()};
if(window.YT&&YT.Player)make();

// ── în ce zonă suntem acum ──
const vis=id=>{const e=$m(id);return e&&!e.hidden};
function sceneNow(){
  if(!S.music.on||document.hidden||!LIST)return null;
  if(typeof introOn!=="undefined"&&introOn&&!unlocked)return null;
  if(typeof active!=="undefined"&&active)return null;                  // rulează un clip
  if(vis("reader"))return "raft";
  if(vis("medov")||(typeof jrOpen!=="undefined"&&jrOpen))return "azi";
  if(vis("v-sport"))return workout?"sport":null;
  if(vis("v-azi"))return "azi";
  if(vis("v-feed"))return "feed";
  return null;                                                          // Shorts, Salvate, Setări, Raft
}
function pool(sc){return (LIST&&LIST[sc]||[]).filter(t=>!S.music.bad.includes(t.id))}
function pick(sc){
  const L=pool(sc);if(!L.length)return null;
  if(!order[sc]||!order[sc].length)order[sc]=L.map((_,i)=>i).sort(()=>Math.random()-.5);
  return L[order[sc].shift()%L.length];
}
function target(){return Math.round((BASE[curScene]||40)*S.music.vol*(duckVoice?.45:1))}
let duckVoice=false;

function fadeTo(v,ms,then){
  clearInterval(fadeT);const from=vol,t0=Date.now();
  fadeT=setInterval(()=>{const k=Math.min(1,(Date.now()-t0)/ms);vol=Math.round(from+(v-from)*k);try{mp.setVolume(vol)}catch(e){}
    if(k>=1){clearInterval(fadeT);then&&then()}},50);
}
function load(sc){
  const resume=S.music.last[sc];
  let t=resume&&pool(sc).some(x=>x.id===resume.id)?{...pool(sc).find(x=>x.id===resume.id),at:resume.at}:pick(sc);
  if(!t)return false;
  cur=t;curScene=sc;
  const start=t.at!=null?t.at:Math.floor((t.d||0)*Math.random()*.25);    // pornim din locuri diferite ale mixului
  vol=0;mp.setVolume(0);
  mp.loadVideoById({videoId:t.id,startSeconds:start});
  if(unlocked)mp.unMute();else mp.mute();
  return true;
}
function remember(){
  if(!cur||!curScene||!mp||!mp.getCurrentTime)return;
  try{S.music.last[curScene]={id:cur.id,at:Math.floor(mp.getCurrentTime()||0)};save()}catch(e){}
}
let fading=false;
function refresh(){
  if(!ready)return;
  const sc=sceneNow();
  if(!sc){
    if(playing&&!fading){remember();fading=true;fadeTo(0,500,()=>{fading=false;try{mp.pauseVideo()}catch(e){}})}
    paint();return;
  }
  fading=false;
  if(sc!==curScene||!cur){remember();if(!load(sc))return;fadeTo(target(),900)}
  else if(!playing){try{if(unlocked)mp.unMute();mp.playVideo()}catch(e){}fadeTo(target(),900)}
  else if(Math.abs(vol-target())>2)fadeTo(target(),400);
  paint();
}
function next(){
  if(!ready)return;const sc=sceneNow()||curScene;if(!sc)return;
  delete S.music.last[sc];
  const t=pick(sc);if(!t)return;cur=t;curScene=sc;
  mp.loadVideoById({videoId:t.id,startSeconds:0});if(unlocked)mp.unMute();
  vol=0;mp.setVolume(0);fadeTo(target(),900);
}
function showTitle(){
  if(!cur||cur.id===lastTitleShown)return;lastTitleShown=cur.id;
  const t=cur.t.replace(/\s*[\[(|].*$/,"").slice(0,48);
  try{toast("♪ "+(NAME[curScene]?NAME[curScene]+" · ":"")+t)}catch(e){}
}

// ── deblocarea sunetului: iPhone permite sunet doar după prima atingere ──
let AC=null;
function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function unlock(){
  if(unlocked)return;unlocked=true;ac();
  // atingerea din timpul intro-ului pornește lovitura cinematică exact când apare emblema
  if(S.music.intro&&typeof introOn!=="undefined"&&introOn&&window.__introT0){
    const el=(performance.now()-window.__introT0)/1000;introHit(Math.max(0,1.45-el));
  }
  if(mp&&ready){try{mp.unMute()}catch(e){}}
  setTimeout(refresh,typeof introOn!=="undefined"&&introOn?1600:0);
}
["touchend","click","keydown"].forEach(ev=>addEventListener(ev,()=>{if(!unlocked)unlock()},{capture:true,passive:true}));

// ── sunetul de la deschidere, sintetizat: crescendo, lovitură grea, metal care sună, acord de alămuri ──
function introHit(delay){
  const c=ac();if(!c)return;
  const t0=c.currentTime+.02,T=t0+delay,out=c.createGain();out.gain.value=.9;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;out.connect(comp);comp.connect(c.destination);
  const noise=(dur)=>{const b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s};
  // crescendo (zgomot filtrat care urcă) până la lovitură
  if(delay>.25){const n=noise(delay),f=c.createBiquadFilter(),g=c.createGain();f.type="bandpass";f.Q.value=1.2;
    f.frequency.setValueAtTime(300,t0);f.frequency.exponentialRampToValueAtTime(4200,T);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.22,T-.02);g.gain.linearRampToValueAtTime(0,T);
    n.connect(f);f.connect(g);g.connect(out);n.start(t0);n.stop(T)}
  // lovitura: sub-bas care coboară
  {const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(78,T);o.frequency.exponentialRampToValueAtTime(30,T+1.4);
    g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(1,T+.012);g.gain.exponentialRampToValueAtTime(.0001,T+2.4);o.connect(g);g.connect(out);o.start(T);o.stop(T+2.5)}
  // impactul (zgomot scurt, întunecat)
  {const n=noise(1.5),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.setValueAtTime(2400,T);f.frequency.exponentialRampToValueAtTime(180,T+1);
    g.gain.setValueAtTime(.55,T);g.gain.exponentialRampToValueAtTime(.0001,T+1.3);n.connect(f);f.connect(g);g.connect(out);n.start(T);n.stop(T+1.5)}
  // metal care sună (ca o sabie / un clopot de bronz)
  [[523.3,.07],[784.9,.05],[1318,.03],[1975,.018]].forEach(([fq,a])=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=fq;
    g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(a,T+.01);g.gain.exponentialRampToValueAtTime(.0001,T+3.6);o.connect(g);g.connect(out);o.start(T);o.stop(T+3.7)});
  // acord grav de alămuri care se deschide (La minor)
  [55,82.4,110,130.8].forEach((fq,i)=>{const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type="sawtooth";o.frequency.value=fq;o.detune.value=(i%2?6:-6);
    f.type="lowpass";f.frequency.setValueAtTime(220,T);f.frequency.linearRampToValueAtTime(900,T+.9);f.frequency.linearRampToValueAtTime(300,T+3);
    g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.075,T+.35);g.gain.linearRampToValueAtTime(0,T+3.2);o.connect(f);f.connect(g);g.connect(out);o.start(T);o.stop(T+3.3)});
}

// ── butonul cu boxă (sus, în colț) ──
const ICON_ON='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_OFF='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>';
function paint(){
  const on=S.music.on;
  document.querySelectorAll(".musbtn").forEach(b=>{
    b.innerHTML=(on?ICON_ON:ICON_OFF)+'<span class="eq"><i></i><i></i><i></i></span>';
    b.classList.toggle("on",on);b.classList.toggle("live",on&&playing&&!!sceneNow());
    b.setAttribute("aria-pressed",on);b.setAttribute("aria-label",on?"Oprește muzica":"Pornește muzica");
  });
  const t=$m("mus-now");if(t)t.textContent=cur&&on?`${NAME[curScene]||""} · ${cur.t}`:"";
}
function toggle(){
  S.music.on=!S.music.on;save();
  if(!S.music.on){remember();fadeTo(0,400,()=>{try{mp.pauseVideo()}catch(e){}});toast("Muzica oprită")}
  else{lastTitleShown="";refresh();if(!sceneNow())toast("Muzica pornește în Feed, Azi, la citit și la antrenament")}
  paint();
}
// atingere = pornește/oprește · apăsare lungă = melodia următoare
document.addEventListener("pointerdown",e=>{
  const b=e.target.closest(".musbtn");if(!b)return;
  b._lp=setTimeout(()=>{b._lp=0;b._skip=true;if(S.music.on){lastTitleShown="";next();if(navigator.vibrate)navigator.vibrate(15)}},550);
});
["pointerup","pointercancel","pointerleave"].forEach(ev=>document.addEventListener(ev,e=>{const b=e.target.closest&&e.target.closest(".musbtn");if(b&&b._lp){clearTimeout(b._lp);b._lp=0}},true));
document.addEventListener("click",e=>{
  const b=e.target.closest(".musbtn");if(!b)return;e.stopPropagation();
  if(b._skip){b._skip=false;return}
  toggle();
},true);

// setări
function settingsUI(){
  const v=$m("mus-vol"),i=$m("mus-intro"),o=$m("mus-on");
  if(v){v.value=Math.round(S.music.vol*100);v.oninput=()=>{S.music.vol=v.value/100;save();if(playing)fadeTo(target(),200)}}
  if(i){i.checked=!!S.music.intro;i.onchange=()=>{S.music.intro=i.checked;save()}}
  if(o){o.checked=!!S.music.on;o.onchange=()=>{if(o.checked!==S.music.on)toggle()}}
  const n=$m("mus-next");if(n)n.onclick=()=>{if(!S.music.on){toast("Pornește muzica întâi");return}const sc=sceneNow();if(!sc){toast("Muzica merge în Feed, Azi, la citit și la antrenament");return}lastTitleShown="";next()};
  const p=$m("mus-test");if(p)p.onclick=()=>{unlocked=true;introHit(0)};
  paint();
}

document.addEventListener("visibilitychange",()=>{if(document.hidden)remember();refresh()});
setInterval(refresh,1200);   // urmărește singur unde ești (clip pornit, pagină schimbată etc.)
window.Music={refresh,workout(on){workout=!!on;refresh()},duck(on){duckVoice=!!on;if(playing)fadeTo(target(),400)},next,introHit,settingsUI,get unlocked(){return unlocked}};
paint();settingsUI();
})();
