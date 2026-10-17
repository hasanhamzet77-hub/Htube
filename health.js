// IMPERIUM — Corp & nutriție: greutate, calculator de calorii, greutate ideală, diete, post intermitent, apă.
// Totul rămâne pe telefon (în S.body). Valorile calculate sunt orientative.
(function(){
const B=()=>{S.body=S.body||{};const b=S.body;b.p=b.p||{};b.w=b.w||[];b.diets=b.diets||[];b.fast=b.fast||{hist:[]};b.fast.hist=b.fast.hist||[];b.water=b.water||{};return b};
const $h=id=>document.getElementById(id);
const r1=x=>Math.round(x*10)/10;
const fmtKg=x=>x==null||isNaN(x)?"–":r1(x).toLocaleString("ro-RO",{minimumFractionDigits:1,maximumFractionDigits:1});
const sgn=x=>(x>0?"+":x<0?"−":"±")+fmtKg(Math.abs(x));
const dshort=d=>new Date(d+"T12:00").toLocaleDateString("ro-RO",{day:"numeric",month:"short"});
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const hm=ms=>{ms=Math.max(0,ms);const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`};
const curW=()=>{const w=B().w;return w.length?w[w.length-1].kg:(+B().p.kg||null)};
let tab="train",tick=0;
const CS=[["kg","Greutate","⚖️"],["cal","Calorii","🔥"],["diet","Dietă","🥗"],["fast","Post","⏳"]];
S.cold=Object.assign({log:{},pick:120},S.cold||{});
if(!S.cold.v2){S.cold.v2=1;if(S.cold.pick===60)S.cold.pick=120}   // baia ta de gheață e de 2 min
S.heat=Object.assign({plan:{r:3,s:15,c:2,p:2,t:90},log:{},cur:null,music:true},S.heat||{});
const XP=(k,p,l)=>window.Grow&&Grow.award(k,p,l);

// ── calculator ──
const ACT=[[1.2,"Sedentar (birou, fără sport)"],[1.375,"Ușor activ (1–3 antrenamente/săpt.)"],[1.55,"Activ (3–5 antrenamente/săpt.)"],[1.725,"Foarte activ (6–7 antrenamente/săpt.)"],[1.9,"Extrem (muncă fizică + sport)"]];
function calc(){
  const p=B().p,kg=curW(),h=+p.h,age=+p.age,male=p.sex!=="f";
  if(!kg||!h||!age)return null;
  const m=h/100,bmi=kg/(m*m);
  const bmr=10*kg+6.25*h-5*age+(male?5:-161);                          // Mifflin–St Jeor
  const act=ACT[+(p.act??2)]||ACT[2],tdee=bmr*act[0];
  const goal=p.goal||"lose";
  const floor=male?1500:1200;
  const target=goal==="lose"?Math.max(floor,tdee-500):goal==="gain"?tdee+300:tdee;
  const inch=h/2.54-60,devine=(male?50:45.5)+2.3*inch;                  // formula Devine
  const lo=18.5*m*m,hi=24.9*m*m,ideal=22*m*m;
  const prot=kg*(goal==="gain"?2:1.8),fat=target*.27/9,carb=Math.max(0,(target-prot*4-fat*9)/4);
  const cat=bmi<18.5?"subponderal":bmi<25?"normal":bmi<30?"supraponderal":"obezitate";
  return {bmi,cat,bmr,tdee,target,devine,lo,hi,ideal,prot,fat,carb,goal,kg};
}

// ── grafic greutate (SVG simplu) ──
function chart(){
  const w=B().w.slice(-90);if(w.length<2)return `<div class="hl-empty">Graficul apare după a doua cântărire.</div>`;
  const W=320,H=120,pad=8,goal=+(activeDiet()||{}).target||null;
  const ys=w.map(x=>x.kg).concat(goal?[goal]:[]),mn=Math.min(...ys)-.5,mx=Math.max(...ys)+.5;
  const t0=new Date(w[0].d+"T12:00")/1,t1=new Date(w[w.length-1].d+"T12:00")/1||t0+1;
  const X=d=>pad+(new Date(d+"T12:00")-t0)/Math.max(1,t1-t0)*(W-2*pad),Y=v=>pad+(mx-v)/(mx-mn)*(H-2*pad);
  // medie mobilă pe 7 zile (tendința reală, fără apa din corp)
  const avg=w.map((x,i)=>{const a=w.filter(y=>{const dd=daysBetween(y.d,x.d);return dd>=0&&dd<7});return a.reduce((s,y)=>s+y.kg,0)/a.length});
  const pts=w.map((x,i)=>`${X(x.d).toFixed(1)},${Y(x.kg).toFixed(1)}`).join(" ");
  const tr=w.map((x,i)=>`${X(x.d).toFixed(1)},${Y(avg[i]).toFixed(1)}`).join(" ");
  return `<svg class="hl-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    ${goal?`<line x1="0" x2="${W}" y1="${Y(goal).toFixed(1)}" y2="${Y(goal).toFixed(1)}" class="hl-goal"/>`:""}
    <polyline points="${pts}" class="hl-raw"/><polyline points="${tr}" class="hl-trend"/>
    ${w.map(x=>`<circle cx="${X(x.d).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="2.2" class="hl-dot"/>`).join("")}
  </svg><div class="hl-axis"><span>${dshort(w[0].d)}</span><span>${goal?`— țintă ${fmtKg(goal)} kg · `:""}linia groasă = media pe 7 zile</span><span>${dshort(w[w.length-1].d)}</span></div>`;
}
const activeDiet=()=>B().diets.find(d=>!d.end);

// ── post ──
const FT=[[16,"16:8"],[18,"18:6"],[20,"20:4"],[23,"OMAD 23:1"],[24,"24 h apă"],[36,"36 h"],[48,"48 h"],[72,"72 h"]];
const PH=[[0,"Digestie","Corpul folosește ce ai mâncat."],[4,"Glicemia scade","Insulina coboară, începe folosirea rezervelor."],[12,"Trecere la grăsimi","Glicogenul din ficat scade; începe cetoza ușoară."],[16,"Cetoză","Ardere crescută de grăsimi."],[24,"Cetoză profundă","Autofagia crește (orientativ)."],[48,"Post prelungit","Electroliți obligatoriu; ascultă-ți corpul."],[72,"Post lung","Doar cu acordul medicului."]];
function phase(h){let p=PH[0];for(const x of PH)if(h>=x[0])p=x;return p}

function calcOut(){
  const c=calc();
  return c?`<div class="hl-cards">
      <div><small>Calorii pe zi</small><b>${Math.round(c.target)}</b><span>kcal · ${c.goal==="lose"?"pentru slăbire":c.goal==="gain"?"pentru masă":"menținere"}</span></div>
      <div><small>Consum zilnic</small><b>${Math.round(c.tdee)}</b><span>kcal (bazal ${Math.round(c.bmr)})</span></div>
      <div><small>IMC</small><b>${r1(c.bmi)}</b><span>${c.cat}</span></div>
      <div><small>Greutate ideală</small><b>${fmtKg(c.ideal)}</b><span>kg · interval sănătos ${Math.round(c.lo)}–${Math.round(c.hi)} kg</span></div>
    </div>
    <div class="hl-macro"><span><b>${Math.round(c.prot)} g</b> proteine</span><span><b>${Math.round(c.carb)} g</b> carbohidrați</span><span><b>${Math.round(c.fat)} g</b> grăsimi</span></div>
    <p class="note">La sportivi musculoși IMC-ul exagerează (mușchiul cântărește mult). Formula Devine dă ${fmtKg(c.devine)} kg. Calculele sunt orientative și nu înlocuiesc sfatul medicului.</p>`
    :`<p class="note">Completează vârsta, înălțimea și greutatea ca să vezi caloriile și greutatea ideală.</p>`;
}

// ── duș rece: cronometru, serie de zile, istoric ──
let cs=S.cold.run||null;   // cronometrul de frig supraviețuiește închiderii aplicației
function coldStreak(){let n=0;const d=new Date();if(!S.cold.log[dk(d)])d.setDate(d.getDate()-1);while(S.cold.log[dk(d)]){n++;d.setDate(d.getDate()-1)}return n}
function coldSec(){
  const L=S.cold.log,today=dk(),st=coldStreak(),n30=Object.keys(L).filter(k=>daysBetween(k,today)<30).length,best=Math.max(0,...Object.values(L).map(x=>x.s||0));
  const R=54,C=2*Math.PI*R,goal=S.cold.pick,el=cs?(Date.now()-cs)/1000:0,pr=Math.min(1,el/goal);
  const dots=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const k=dk(d);return `<i class="${L[k]?"on":""}${k===today?" t":""}" title="${k}"></i>`}).join("");
  return `<div class="sec hl cold">
    <div class="sec-h"><h3>Ice plunge · apă rece</h3><span class="muted">${st?`🔥 ${st} zile la rând`:""}</span></div>
    <div class="hl-fast cold"><svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="${R}" class="trk"/><circle cx="64" cy="64" r="${R}" class="arc${pr>=1?" done":""}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pr)).toFixed(1)}"/></svg>
      <div class="hl-fin"><small>${cs?(pr>=1?"Țintă atinsă ❄️":"Respiră calm"):L[today]?"Făcut azi ✓":"Gata de frig?"}</small><b id="cs-t">${cs?fmtS(el):fmtS(goal)}</b><span>${cs?"din "+fmtS(goal):"ținta"}</span></div></div>
    ${cs?`<div class="hadd-b"><button class="btn" id="cs-stop">Am ieșit ✓</button></div>`:`<div class="hl-chips cen">${[60,120,180,240].map(x=>`<button class="hl-chip${goal===x?" on":""}" data-cs="${x}">${x<60?x+" s":x/60+" min"}</button>`).join("")}</div>
      <div class="hadd-b"><button class="btn ghost" id="cs-gong" aria-label="Ascultă gongul">🔔 Gong</button><button class="btn" id="cs-go">Intru în apă</button></div>
      <p class="note cen">La ${fmtS(goal)} sună gongul: poți ieși.</p>`}
    <div class="hl-macro"><span><b>${st}</b> zile la rând</span><span><b>${n30}</b> în 30 de zile</span><span><b>${best?fmtS(best):"–"}</b> cel mai lung</span></div>
    <div class="csdots">${dots}</div>
    <p class="note">Dimineața, în bazinul cu gheață: intră calm, respiră lent pe nas, primele 30 s sunt cele mai grele. Ieși dacă începi să tremuri necontrolat sau amorțesc degetele. Nu e recomandat dacă ai probleme de inimă.</p>
  </div>`;
}
const fmtS=s=>{s=Math.round(s);return s<60?s+" s":Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};

function render(){
  const box=$h("sp-body");if(!box||box.hidden)return;
  const b=B(),p=b.p,w=b.w,kg=curW(),today=dk();
  const last=w[w.length-1],first=w[0];
  const wk=w.filter(x=>daysBetween(x.d,today)<=7&&daysBetween(x.d,today)>=6)[0]||w.find(x=>daysBetween(x.d,today)<=7);
  const dA=activeDiet(),f=b.fast.cur;
  const sub=CS.find(x=>x[0]===(S.sub||{}).corp)?(S.sub||{}).corp:"kg";
  const SEC={
    kg:()=>`
  <div class="sec hl">
    <div class="sec-h"><h3>Greutate</h3><span class="muted">${w.length?`${w.length} cântăriri`:""}</span></div>
    <div class="hl-big"><b>${fmtKg(kg)}</b><span>kg</span>
      ${last&&first&&w.length>1?`<small>${sgn(last.kg-first.kg)} kg de la ${dshort(first.d)}${wk&&wk!==last?` · ${sgn(last.kg-wk.kg)} în 7 zile`:""}</small>`:""}</div>
    ${chart()}
    <form class="hl-row" id="hl-wf"><input id="hl-wkg" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]*[.,]?[0-9]*" min="30" max="300" placeholder="ex. 95,7" value=""><input id="hl-wd" type="date" value="${today}" max="${today}"><button class="btn" type="submit">Adaugă</button></form>
    ${w.length?`<details class="hl-list"><summary>Istoric</summary>${w.slice().reverse().slice(0,60).map(x=>`<div class="hl-li"><span>${dshort(x.d)}</span><b>${fmtKg(x.kg)} kg</b><button data-hw="${x.d}" aria-label="Șterge">✕</button></div>`).join("")}</details>`:""}
    <p class="note">Cântărește-te dimineața, după baie, înainte de micul dejun. Contează tendința, nu cifra unei zile.</p>
  </div>`,
    cal:()=>`
  <div class="sec hl">
    <div class="sec-h"><h3>Profil & calorii</h3><span class="muted">orientativ</span></div>
    <div class="hl-grid">
      <label>Sex<select id="hl-sex"><option value="m"${p.sex!=="f"?" selected":""}>Bărbat</option><option value="f"${p.sex==="f"?" selected":""}>Femeie</option></select></label>
      <label>Vârsta<input id="hl-age" type="number" inputmode="numeric" min="14" max="100" value="${p.age||""}" placeholder="ani"></label>
      <label>Înălțimea<input id="hl-h" type="number" inputmode="numeric" min="120" max="230" value="${p.h||""}" placeholder="cm"></label>
      <label>Greutatea<input id="hl-kg" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]*[.,]?[0-9]*" value="${w.length?"":(p.kg||"")}" placeholder="${w.length?fmtKg(kg)+" (din cântăriri)":"kg"}" ${w.length?"disabled":""}></label>
      <label class="hl-wide">Activitatea<select id="hl-act">${ACT.map((a,i)=>`<option value="${i}"${+(p.act??2)===i?" selected":""}>${a[1]}</option>`).join("")}</select></label>
      <label class="hl-wide">Obiectivul<select id="hl-goal"><option value="lose"${(p.goal||"lose")==="lose"?" selected":""}>Slăbire (~0,5 kg/săptămână)</option><option value="keep"${p.goal==="keep"?" selected":""}>Menținere</option><option value="gain"${p.goal==="gain"?" selected":""}>Masă musculară</option></select></label>
    </div>
    <div id="hl-calc">${calcOut()}</div>
  </div>`,
    diet:()=>`
  <div class="sec hl">
    <div class="sec-h"><h3>Dietă</h3><span class="muted">${b.diets.filter(d=>d.end).length?b.diets.filter(d=>d.end).length+" încheiate":""}</span></div>
    ${dA?(()=>{const days=daysBetween(dA.start,today)+1,sw=+dA.sw||null,tg=+dA.target||null,ch=sw&&kg?kg-sw:null,prog=sw&&tg&&kg&&sw!==tg?Math.max(0,Math.min(1,(sw-kg)/(sw-tg))):null;
      return `<div class="hl-diet"><div><b>${esc(dA.name||"Dietă")}</b><small>din ${dshort(dA.start)} · ziua ${days}</small></div><div class="hl-dn">${ch!=null?sgn(ch)+" kg":"–"}</div></div>
      ${prog!=null?`<div class="hl-bar"><i style="width:${(prog*100).toFixed(1)}%"></i></div><p class="note">${fmtKg(sw)} → ${fmtKg(kg)} kg · țintă ${fmtKg(tg)} kg (${Math.round(prog*100)}%)</p>`:""}
      ${dA.note?`<p class="note">„${esc(dA.note)}”</p>`:""}
      <div class="hadd-b"><button class="btn ghost" id="hl-dend">Încheie dieta</button></div>`})()
    :`<form id="hl-df" class="hl-grid">
      <label class="hl-wide">Ce dietă începi<input id="hl-dn" placeholder="ex. deficit caloric, keto, fără zahăr" maxlength="60"></label>
      <label>Începe pe<input id="hl-ds" type="date" value="${today}"></label>
      <label>Greutate țintă<input id="hl-dt" type="text" inputmode="decimal" autocomplete="off" pattern="[0-9]*[.,]?[0-9]*" placeholder="kg"></label>
      <label class="hl-wide">Notă (de ce o faci)<input id="hl-dno" maxlength="140" placeholder="opțional"></label>
      <button class="btn hl-wide" type="submit">Încep dieta</button></form>`}
    ${b.diets.filter(d=>d.end).length?`<details class="hl-list"><summary>Diete trecute</summary>${b.diets.filter(d=>d.end).slice().reverse().map(d=>`<div class="hl-li"><span>${esc(d.name||"Dietă")}<small> ${dshort(d.start)} – ${dshort(d.end)} · ${daysBetween(d.start,d.end)+1} zile</small></span><b>${d.sw&&d.ew?sgn(d.ew-d.sw)+" kg":""}</b></div>`).join("")}</details>`:""}
  </div>`,
    fast:()=>`
  <div class="sec hl" id="hl-fast">
    <div class="sec-h"><h3>Post</h3><span class="muted">${b.fast.hist.length?`${b.fast.hist.length} posturi`:""}</span></div>
    ${f?fastLive(f):`<div class="hl-chips">${FT.map(([h,l])=>`<button class="hl-chip${(b.fast.pick||16)===h?" on":""}" data-fh="${h}">${l}</button>`).join("")}</div>
      <div class="hl-row"><label class="hl-lbl">Ultima masă<input id="hl-fs" type="time" value="${new Date().toTimeString().slice(0,5)}"></label><button class="btn" id="hl-fgo">Încep postul</button></div>
      <p class="note">Doar apă, ceai sau cafea neîndulcite.${(b.fast.pick||16)>=24?" Peste 24 h: ia electroliți (sare, magneziu, potasiu) și oprește-te dacă ai amețeli. Dacă iei medicamente sau ai o afecțiune, vorbește întâi cu medicul.":""}</p>`}
    ${fastStats()}
  </div>`,
};
  box.innerHTML=`<div class="hsub">${CS.map(([k,l,e])=>`<button data-hsub="${k}" aria-pressed="${k===sub}"><span>${e}</span>${l}</button>`).join("")}</div><div class="hpg sp-r">${SEC[sub]()}</div>`;
  const nb=box.querySelector('.hsub [aria-pressed="true"]');if(nb)nb.scrollIntoView({inline:"center",block:"nearest"});
}
function fastLive(f){
  const now=Date.now(),el=now-f.start,goal=f.h*36e5,pr=Math.min(1,el/goal),ph=phase(el/36e5),R=54,C=2*Math.PI*R;
  return `<div class="hl-fast"><svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="${R}" class="trk"/><circle cx="64" cy="64" r="${R}" class="arc${pr>=1?" done":""}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pr)).toFixed(1)}"/></svg>
    <div class="hl-fin"><small>${pr>=1?"Țintă atinsă":"Post în curs"}</small><b id="hl-fel">${hm(el)}</b><span>din ${f.h} h · ${pr>=1?"+"+hm(el-goal):"mai ai "+hm(goal-el)}</span></div></div>
    <p class="hl-phase"><b>${ph[1]}</b> · ${ph[2]}</p>
    <p class="note">Început ${new Date(f.start).toLocaleString("ro-RO",{weekday:"short",hour:"2-digit",minute:"2-digit"})} · se termină ${new Date(f.start+goal).toLocaleString("ro-RO",{weekday:"short",hour:"2-digit",minute:"2-digit"})}</p>
    <div class="hadd-b"><button class="btn ghost" id="hl-fx">Anulează</button><button class="btn" id="hl-fend">${pr>=1?"Am terminat postul ✓":"Închei acum"}</button></div>`;
}
function fastStats(){
  const h=B().fast.hist;if(!h.length)return "";
  const hrs=h.map(x=>(x.end-x.start)/36e5),done=h.filter(x=>(x.end-x.start)/36e5>=x.h).length;
  return `<div class="hl-macro"><span><b>${r1(Math.max(...hrs))} h</b> cel mai lung</span><span><b>${r1(hrs.reduce((a,b)=>a+b,0)/hrs.length)} h</b> în medie</span><span><b>${done}/${h.length}</b> duse la capăt</span></div>
  <details class="hl-list"><summary>Istoric posturi</summary>${h.slice().reverse().slice(0,40).map((x,i)=>`<div class="hl-li"><span>${new Date(x.start).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})}<small> țintă ${x.h} h</small></span><b>${r1((x.end-x.start)/36e5)} h ${(x.end-x.start)/36e5>=x.h?"✓":""}</b></div>`).join("")}</details>`;
}

// ── gong: lovitură de gong sintetizată (parțiale neregulate, rezonanță lungă) ──
let gctx=null;
function gongCtx(){try{gctx=gctx||new (window.AudioContext||window.webkitAudioContext)();if(gctx.state!=="running")gctx.resume()}catch(e){}
  try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}return gctx}
function gong(vol=1){
  const c=gongCtx();if(!c)return;const t=c.currentTime+.03,out=c.createGain(),lp=c.createBiquadFilter();
  lp.type="lowpass";lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(900,t+3);
  out.gain.value=.45*vol;lp.connect(out).connect(c.destination);
  const f=98;   // sol grav
  [[1,1,6.5],[1.47,.62,5],[2.09,.5,4.2],[2.56,.38,3.4],[3.39,.28,2.6],[4.14,.2,2],[5.4,.12,1.4],[6.8,.08,1]].forEach(([r,a,d],i)=>{
    const o=c.createOscillator(),g=c.createGain();o.type="sine";
    o.frequency.setValueAtTime(f*r*1.012,t);o.frequency.exponentialRampToValueAtTime(f*r,t+.6);   // „bătaia” de la început
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a*.5,t+.006+i*.002);g.gain.exponentialRampToValueAtTime(.0004,t+d);
    // ușoară pulsație, ca la un gong real
    const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=3.2+i*.7;lg.gain.value=a*.06;lfo.connect(lg).connect(g.gain);lfo.start(t);lfo.stop(t+d);
    o.connect(g).connect(lp);o.start(t);o.stop(t+d+.05)});
  // lovitura (zgomot scurt de baghetă)
  const n=c.createBuffer(1,c.sampleRate*.08,c.sampleRate),dt=n.getChannelData(0);for(let i=0;i<dt.length;i++)dt[i]=(Math.random()*2-1)*Math.pow(1-i/dt.length,3);
  const ns=c.createBufferSource(),ng=c.createGain(),bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=600;bp.Q.value=.8;ng.gain.value=.35;
  ns.buffer=n;ns.connect(bp).connect(ng).connect(lp);ns.start(t);
}
// pe iPhone, sunetele Web Audio tac pe modul silențios și se opresc când ecranul se blochează.
// De aceea gongul vine dintr-un fișier audio pornit chiar când intri în apă: liniște exact cât ținta + gong.
// Așa sună la timp chiar și cu ecranul blocat sau pe silențios (fișierul rulează ca muzica).
let plA=null,plT=0,gA=null;
const plSrc=p=>`brand/plunge-${[60,120,180,240].includes(p)?p:120}.mp3`;
function plAudio(){const src=plSrc(S.cold.pick||120);
  if(!plA){plA=new Audio();plA.preload="auto";plA.setAttribute("playsinline","");
    plA.addEventListener("timeupdate",()=>{if(cs&&!csGong&&plA.currentTime>=plT){csGong=true;if(navigator.vibrate)navigator.vibrate([400,150,400]);if(tab==="heat")renderHeat()}})}
  if(!plA.src.endsWith(src)){plA.src=src;plA.load()}
  plT=[60,120,180,240].includes(S.cold.pick)?S.cold.pick:120;return plA}
function plStart(){
  const a=plAudio();try{a.currentTime=0}catch(e){}
  const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{});
  try{if("mediaSession" in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:"Ice plunge · "+fmtS(S.cold.pick||120),artist:"IMPERIUM"})}}catch(e){}
}
function plStop(){try{plA&&plA.pause()}catch(e){}}
function gongPreview(){if(!gA){gA=new Audio("brand/gong.mp3");gA.preload="auto"}try{gA.currentTime=0}catch(e){}const pr=gA.play();if(pr&&pr.catch)pr.catch(()=>gong())}
let csGong=!!(S.cold.run&&(Date.now()-S.cold.run)/1000>=(S.cold.pick||120));
// ── Saună & apă rece: ritualul pe runde (saună → rece → pauză) + baia de gheață de dimineață ──
const HP={sauna:{n:"Saună",e:"🔥",c:"sauna"},cold:{n:"Apă rece",e:"🧊",c:"cold"},rest:{n:"Pauză",e:"🌿",c:"rest"}};
function heatPhases(p){const L=[];for(let i=0;i<p.r;i++){L.push({k:"sauna",d:p.s*60,i});L.push({k:"cold",d:p.c*60,i});if(i<p.r-1&&p.p>0)L.push({k:"rest",d:p.p*60,i})}return L}
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const durTxt=m=>m>=60?Math.floor(m/60)+" h "+(m%60?m%60+" min":""):m+" min";
function heatStreak(){let n=0;const d=new Date();const has=k=>(S.heat.log[k]||[]).length||S.cold.log[k];if(!has(dk(d)))d.setDate(d.getDate()-1);while(has(dk(d))){n++;d.setDate(d.getDate()-1)}return n}
function heatStats(){
  const today=dk(),L=S.heat.log,mon=today.slice(0,7);
  const ses=Object.entries(L).flatMap(([k,v])=>v.map(x=>({...x,k})));
  const m=ses.filter(x=>x.k.startsWith(mon)),min30=ses.filter(x=>daysBetween(x.k,today)<30).reduce((a,x)=>a+x.sauna,0);
  const pl=Object.keys(S.cold.log).filter(k=>k.startsWith(mon)).length;
  const dots=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const k=dk(d);const a=(L[k]||[]).length,b=!!S.cold.log[k];
    return `<i class="${a?"sa":""}${b?" pl":""}${k===today?" t":""}" title="${k}"></i>`}).join("");
  return `<div class="hl-macro"><span><b>${m.length}</b> saune luna asta</span><span><b>${Math.round(min30)}</b> min saună / 30 zile</span><span><b>${pl}</b> plonjări luna asta</span></div>
    <div class="csdots ht">${dots}</div><p class="note cen">🟧 saună · 🟦 apă rece dimineața · ${heatStreak()?`🔥 ${heatStreak()} zile la rând`:""}</p>`;
}
function heatBar(ph,cur,el){
  const tot=ph.reduce((a,x)=>a+x.d,0)||1;
  return `<div class="htbar">${ph.map((x,i)=>{const w=x.d/tot*100,f=cur==null?0:i<cur?100:i>cur?0:Math.min(100,el/x.d*100);
    return `<span class="${HP[x.k].c}${cur===i?" on":""}" style="flex:${w.toFixed(2)}"><i style="width:${f.toFixed(1)}%"></i></span>`}).join("")}</div>`;
}
function saunaIdle(){
  const p=S.heat.plan,ph=heatPhases(p),tot=Math.round(ph.reduce((a,x)=>a+x.d,0)/60),today=(S.heat.log[dk()]||[]).length;
  const st=(k,l,v,u)=>`<div class="htst"><small>${l}</small><div><button data-hp="${k}" data-d="-1" aria-label="Mai puțin">−</button><b>${v}<em>${u}</em></b><button data-hp="${k}" data-d="1" aria-label="Mai mult">+</button></div></div>`;
  return `<div class="sec hl heat">
    <div class="sec-h"><h3>Ritual saună</h3><span class="muted">${today?`✓ ${today>1?today+" ritualuri":"făcut"} azi`:""}</span></div>
    <div class="hthero"><b>${p.r}×</b><span>${p.s} min saună ${p.t}° → ${p.c} min apă rece${p.p&&p.r>1?` → ${p.p} min pauză`:""}</span><small>Total ~${durTxt(tot)}</small></div>
    ${heatBar(ph,null,0)}
    <div class="htgrid">${st("r","Runde",p.r,"")}${st("s","Saună",p.s,"min")}${st("c","Apă rece",p.c,"min")}${st("p","Pauză",p.p,"min")}${st("t","Temperatură",p.t,"°C")}</div>
    <button class="htmus" id="ht-mus" aria-pressed="${S.heat.music!==false}">🎵 Muzică de meditație în saună<span>${S.heat.music!==false?"pornită":"oprită"}</span></button>
    <div class="hadd-b"><button class="btn ghost" id="ht-log">Notez fără cronometru</button><button class="btn" id="ht-go">Pornește ritualul</button></div>
    ${heatStats()}
    <p class="note">Telefonul rămâne afară: la 90° bateria se strică. Ecranul stă aprins cât rulează ritualul și sună la fiecare schimbare. Bea apă între runde; nu după alcool și nu dacă ai probleme de inimă sau tensiune.</p>
  </div>`;
}
function heatState(){
  const c=S.heat.cur;if(!c)return null;
  const ph=c.ph,now=c.pauseAt||Date.now();let i=c.i,st=c.st;
  return {ph,i,el:(now-st)/1000,cur:ph[i]};
}
function saunaLive(){
  const H=heatState(),{ph,i,el,cur}=H,R=58,C=2*Math.PI*R,left=cur.d-el,pr=Math.min(1,el/cur.d),nx=ph[i+1],c=S.heat.cur;
  return `<div class="sec hl heat htlive ph-${HP[cur.k].c}">
    <div class="sec-h"><h3>${HP[cur.k].e} ${HP[cur.k].n}</h3><span class="muted">runda ${cur.i+1}/${c.plan.r}</span></div>
    <div class="hl-fast htring ${HP[cur.k].c}"><svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="${R}" class="trk"/><circle cx="64" cy="64" r="${R}" class="arc" id="ht-arc" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*pr).toFixed(1)}"/></svg>
      <div class="hl-fin"><small id="ht-lbl">${c.pauseAt?"în pauză":left<=0?"timpul a trecut":"rămas"}</small><b id="ht-left">${mmss(left)}</b><span>${nx?`urmează ${HP[nx.k].e} ${HP[nx.k].n.toLowerCase()} ${Math.round(nx.d/60)} min`:"ultima fază"}</span></div></div>
    <div id="ht-bar">${heatBar(ph,i,el)}</div>
    <div class="spbtns"><button class="spic" id="ht-pause" aria-label="${c.pauseAt?"Continuă":"Pauză"}">${c.pauseAt?'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>'}</button>
      <button class="btn ghost" id="ht-plus">+1 min</button><button class="btn" id="ht-next">${nx?"Gata ›":"Termin ✓"}</button>
      <button class="spic" id="ht-stop" aria-label="Oprește"><svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg></button></div>
    <button class="htmus" id="ht-mus" aria-pressed="${S.heat.music!==false}">🎵 Muzică<span>${S.heat.music!==false?"pornită":"oprită"}</span></button>
    <p class="note cen">${cur.k==="sauna"?"Stai relaxat, respiră pe nas. Ieși mai devreme dacă amețești.":cur.k==="cold"?"Intră calm, expiră lung. Primele 30 de secunde trec.":"Stai jos, bea apă, lasă corpul să se liniștească."}</p>
  </div>`;
}
let htDone=null;
function saunaDone(){const x=htDone;return `<div class="sec hl heat donev"><div class="spbig">🔥🧊</div><b>Ritual încheiat</b>
  <small>${x.rounds} ${x.rounds===1?"rundă":"runde"} · ${Math.round(x.sauna)} min saună · ${mmss(x.cold*60)} apă rece</small>
  <div class="hadd-b"><button class="btn" id="ht-ok">Gata</button></div></div>`}
function renderHeat(){
  const box=$h("sp-heat");if(!box||box.hidden)return;
  const subs=[["sauna","Saună","🔥"],["plunge","Ice plunge","🧊"]];
  const sub=((S.sub||{}).heat)==="plunge"?"plunge":"sauna";
  box.innerHTML=`<div class="hsub">${subs.map(([k,l,e])=>`<button data-htsub="${k}" aria-pressed="${k===sub}"><span>${e}</span>${l}${k==="sauna"&&S.heat.cur?" ●":""}${k==="plunge"&&cs?" ●":""}</button>`).join("")}</div>
    <div class="hpg sp-r">${sub==="plunge"?(plAudio(),coldSec())+`<div class="sec hl">${heatStats()}</div>`:htDone?saunaDone():S.heat.cur?saunaLive():saunaIdle()}</div>`;
}
function heatAdvance(manual){
  const c=S.heat.cur;if(!c)return;const now=Date.now(),cur=c.ph[c.i];
  const el=Math.min((now-c.st)/1000,manual?1e9:cur.d);
  c.act[c.i]=el;
  if(c.i>=c.ph.length-1){heatFinish();return}
  c.i++;c.st=manual?now:c.st+cur.d*1000;save();
  const k=c.ph[c.i].k;
  try{bell(.4);if(k==="cold")setTimeout(()=>bell(.4),450)}catch(e){}
  if(navigator.vibrate)navigator.vibrate(k==="cold"?[80,60,80,60,200]:[120,80,120]);
}
function heatFinish(){
  const c=S.heat.cur;if(!c)return;const k=dk(new Date(c.t0));
  let sa=0,co=0,rounds=0,cmax=0;c.ph.forEach((x,i)=>{const a=c.act[i]||0;if(x.k==="sauna")sa+=a/60;if(x.k==="cold"){co+=a/60;cmax=Math.max(cmax,a);if(a>20)rounds++}});
  const e={t:c.t0,rounds:Math.max(rounds,sa>3?1:0),sauna:Math.round(sa*10)/10,cold:Math.round(co*10)/10,temp:c.plan.t};
  if(e.sauna>=3){(S.heat.log[k]=S.heat.log[k]||[]).push(e);XP(`sa:${k}`,25,"Saună + apă rece");
    if(cmax>0){const prev=S.cold.log[k];S.cold.log[k]={...(prev||{}),s:Math.max(Math.min(cmax,c.plan.c*60+120),(prev||{}).s||0),t:Date.now(),sauna:1}}}
  S.heat.cur=null;save();htDone=e;try{unlockWake()}catch(_){}setTimeout(musR,2500);
  try{bell(.45);setTimeout(()=>bell(.35),500);setTimeout(()=>bell(.3),1000)}catch(_){}
  if(e.sauna>=3&&window.Grow)Grow.confetti(true);
  renderHeat();
}
function heatTick(){
  const c=S.heat.cur;if(!c||c.pauseAt)return;
  let n=0;while(S.heat.cur&&!S.heat.cur.pauseAt&&(Date.now()-S.heat.cur.st)/1000>=S.heat.cur.ph[S.heat.cur.i].d&&n++<40){
    // dacă ai lăsat telefonul și ai ieșit mai devreme, nu trecem singuri la final: ultima fază așteaptă „Termin”
    if(S.heat.cur.i>=S.heat.cur.ph.length-1)break;
    heatAdvance(false);if(n===1&&tab==="heat"&&!$h("v-sport").hidden)renderHeat();
  }
  if(tab!=="heat"||$h("v-sport").hidden||document.hidden||!S.heat.cur)return;
  const H=heatState(),left=H.cur.d-H.el,a=$h("ht-arc"),l=$h("ht-left");
  if(!l){renderHeat();return}
  l.textContent=mmss(left);$h("ht-lbl").textContent=left<=0?"timpul a trecut":"rămas";
  if(a){const C=+a.getAttribute("stroke-dasharray");a.style.strokeDashoffset=(C*Math.min(1,H.el/H.cur.d)).toFixed(1)}
  const b=$h("ht-bar");if(b)b.innerHTML=heatBar(H.ph,H.i,H.el);
  if(left<=0&&left>-1.2&&H.i===H.ph.length-1){try{bell(.4)}catch(e){}if(navigator.vibrate)navigator.vibrate([200,100,200])}
}
function heatClick(t){
  const hs=t.closest("[data-htsub]");if(hs){S.sub=S.sub||{};S.sub.heat=hs.dataset.htsub;save();htDone=null;renderHeat();return}
  const hp=t.closest("[data-hp]");if(hp){const p=S.heat.plan,k=hp.dataset.hp,d=+hp.dataset.d,lim={r:[1,6,1],s:[3,30,1],c:[.5,10,.5],p:[0,15,1],t:[50,110,5]}[k];
    p[k]=Math.max(lim[0],Math.min(lim[1],Math.round((p[k]+d*lim[2])*10)/10));save();renderHeat();return}
  if(t.closest("#ht-mus")){S.heat.music=S.heat.music===false;save();renderHeat();musR();return}
  if(t.closest("#ht-go")){const p={...S.heat.plan};S.heat.cur={t0:Date.now(),st:Date.now(),i:0,ph:heatPhases(p),plan:p,act:{}};save();
    try{lockWake()}catch(e){}try{bell(.35)}catch(e){}htDone=null;renderHeat();startTick();musR();return}
  if(t.closest("#ht-log")){const p=S.heat.plan,k=dk();(S.heat.log[k]=S.heat.log[k]||[]).push({t:Date.now(),rounds:p.r,sauna:p.r*p.s,cold:p.r*p.c,temp:p.t,man:1});
    const prev=S.cold.log[k];S.cold.log[k]={s:Math.max(p.c*60,(prev||{}).s||0),t:Date.now(),sauna:1};
    save();XP(`sa:${k}`,25,"Saună + apă rece");window.Grow&&Grow.confetti();toast(`Notat: ${p.r}× saună + apă rece 🔥🧊`);renderHeat();return}
  const c=S.heat.cur;
  if(c&&t.closest("#ht-pause")){if(c.pauseAt){c.st+=Date.now()-c.pauseAt;c.pauseAt=null;try{lockWake()}catch(e){}}else c.pauseAt=Date.now();save();renderHeat();return}
  if(c&&t.closest("#ht-plus")){c.ph[c.i]={...c.ph[c.i],d:c.ph[c.i].d+60};save();renderHeat();return}
  if(c&&t.closest("#ht-next")){if(c.pauseAt){c.st+=Date.now()-c.pauseAt;c.pauseAt=null}heatAdvance(true);if(S.heat.cur)renderHeat();return}
  if(c&&t.closest("#ht-stop")){const any=Object.keys(c.act).length||(Date.now()-c.st)>18e4;
    if(!confirm(any?"Oprești ritualul? Salvez ce ai făcut până acum.":"Oprești ritualul?"))return;
    if(any){c.act[c.i]=(Date.now()-c.st)/1000;heatFinish()}else{S.heat.cur=null;save();try{unlockWake()}catch(_){}renderHeat();musR()}return}
  if(t.closest("#ht-ok")){htDone=null;renderHeat();return}
  // ice plunge
  const cp=t.closest("[data-cs]");if(cp){S.cold.pick=+cp.dataset.cs;save();renderHeat();plAudio();return}
  if(t.closest("#cs-gong")){gongPreview();return}
  if(t.closest("#cs-go")){csGong=false;plStart();cs=Date.now();S.cold.run=cs;save();try{lockWake()}catch(e){}renderHeat();startTick();return}
  if(t.closest("#cs-stop")){plStop();const el=(Date.now()-cs)/1000,k=dk();cs=null;csGong=false;S.cold.run=null;const prev=S.cold.log[k];S.cold.log[k]={...(prev||{}),s:Math.max(el,(prev||{}).s||0),t:Date.now()};save();try{unlockWake()}catch(_){}
    if(el>=15)XP(`cs:${k}`,15,"Apă rece");if(el>=S.cold.pick&&window.Grow)Grow.confetti();toast(el>=S.cold.pick?"Bravo! Ținta atinsă 🧊":"Notat 🧊");renderHeat();return}
}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&(S.heat.cur&&!S.heat.cur.pauseAt||cs)){try{lockWake()}catch(e){}heatTick();if(tab==="heat")renderHeat()}});

// ── evenimente ──
document.addEventListener("submit",e=>{
  if(e.target.id==="hl-wf"){e.preventDefault();const kg=parseFloat(String($h("hl-wkg").value).replace(",",".")),d=$h("hl-wd").value||dk();
    if(!(kg>30&&kg<300)){toast("Scrie greutatea în kg");return}
    const w=B().w.filter(x=>x.d!==d);w.push({d,kg:r1(kg)});w.sort((a,b)=>a.d<b.d?-1:1);B().w=w;save();toast("Greutate salvată");XP(`w:${d}`,5,"Cântărire");render()}
  if(e.target.id==="hl-df"){e.preventDefault();
    B().diets.push({name:$h("hl-dn").value.trim()||"Dietă",start:$h("hl-ds").value||dk(),target:parseFloat(String($h("hl-dt").value).replace(",","."))||null,note:$h("hl-dno").value.trim(),sw:curW()});
    save();toast("Dieta a început. Succes!");render()}
});
const onProf=e=>{
  const id=e.target.id;if(!/^hl-(sex|age|h|kg|act|goal)$/.test(id))return;
  const p=B().p,v=e.target.value;
  if(id==="hl-sex")p.sex=v;if(id==="hl-age")p.age=+v||"";if(id==="hl-h")p.h=+v||"";if(id==="hl-kg")p.kg=parseFloat(String(v).replace(",","."))||"";
  if(id==="hl-act")p.act=+v;if(id==="hl-goal")p.goal=v;save();
  const o=$h("hl-calc");if(o)o.innerHTML=calcOut();          // doar rezultatele, ca tastatura să rămână deschisă
};
document.addEventListener("input",onProf);document.addEventListener("change",onProf);
document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest("#v-sport"))return;
  const sw=t.closest("[data-stab]");if(sw){setTab(sw.dataset.stab);return}
  if(t.closest("#sp-heat")){heatClick(t);return}
  if(!t.closest("#sp-body"))return;
  const hs=t.closest("[data-hsub]");if(hs){S.sub=S.sub||{};S.sub.corp=hs.dataset.hsub;save();render();window.scrollTo(0,0);if(S.sub.corp==="fast")startTick();return}
  const hw=t.closest("[data-hw]");if(hw){if(confirm("Ștergi cântărirea din "+dshort(hw.dataset.hw)+"?")){B().w=B().w.filter(x=>x.d!==hw.dataset.hw);save();render()}return}
  const fh=t.closest("[data-fh]");if(fh){B().fast.pick=+fh.dataset.fh;save();render();return}
  if(t.closest("#hl-fgo")){const [H,M]=($h("hl-fs").value||"").split(":").map(Number);const s=new Date();if(!isNaN(H)){s.setHours(H,M||0,0,0);if(s>Date.now())s.setDate(s.getDate()-1)}
    B().fast.cur={start:+s,h:B().fast.pick||16};save();render();startTick();toast("Post pornit");return}
  if(t.closest("#hl-fx")){if(confirm("Anulezi postul fără să-l salvezi?")){B().fast.cur=null;save();render()}return}
  if(t.closest("#hl-fend")){const f=B().fast.cur;if(!f)return;B().fast.hist.push({start:f.start,end:Date.now(),h:f.h});B().fast.cur=null;save();
    const okF=(Date.now()-f.start)/36e5>=f.h;if(okF){XP(`f:${f.start}`,f.h>=24?60:30,"Post dus la capăt");window.Grow&&Grow.confetti()}
    toast(okF?"Bravo! Post dus la capăt 💪":"Post salvat");render();return}
  if(t.closest("#hl-dend")){const d=activeDiet();if(!d||!confirm("Închei dieta?"))return;d.end=dk();d.ew=curW();save();toast("Dietă încheiată");render();return}
});
function startTick(){clearInterval(tick);tick=setInterval(()=>{
  if(S.heat.cur){heatTick();}
  if(document.hidden||tab==="train"||$h("v-sport").hidden)return;
  if(tab==="heat"){if(cs){const e2=$h("cs-t");if(e2){const sec=(Date.now()-cs)/1000;if(sec>=S.cold.pick+1&&!csGong){csGong=true;renderHeat();   // rezervă: dacă fișierul n-a pornit, gongul sintetizat
          if(!plA||plA.paused)try{gong()}catch(e){}if(navigator.vibrate)navigator.vibrate([400,150,400])}else e2.textContent=fmtS(sec)}}return}
  const f=B().fast.cur;if(!f)return;
  const el=$h("hl-fel");if(!el)return;
  const ms=Date.now()-f.start;
  // o dată pe minut redesenăm tot (inelul, faza); între timp doar ceasul
  if(Math.floor(ms/6e4)!==startTick.m){startTick.m=Math.floor(ms/6e4);const sc=window.scrollY;render();window.scrollTo(0,sc)}else el.textContent=hm(ms);
},1000)}
function setTab(t){
  tab=t;S.spTab=t;save();
  document.querySelectorAll("#sp-tabs [data-stab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.stab===t));
  $h("sp-train").hidden=t!=="train";$h("sp-body").hidden=t!=="body";$h("sp-heat").hidden=t!=="heat";
  musR();
  if(t==="train"){if(!S.heat.cur&&!cs)clearInterval(tick);window.Sport&&Sport.show()}
  else{window.Sport&&Sport.hide();t==="body"?render():renderHeat();startTick()}
}
function show(){tab=["body","heat"].includes(S.spTab)?S.spTab:"train";setTab(tab)}
window.Health={show,render,renderHeat,saunaMusic:()=>!!S.heat.cur&&S.heat.music!==false&&tab==="heat"};
const musR=()=>{try{window.Music&&Music.refresh()}catch(e){}};
})();
