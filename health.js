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
function render(){
  const box=$h("sp-body");if(!box||box.hidden)return;
  const b=B(),p=b.p,w=b.w,kg=curW(),today=dk();
  const last=w[w.length-1],first=w[0];
  const wk=w.filter(x=>daysBetween(x.d,today)<=7&&daysBetween(x.d,today)>=6)[0]||w.find(x=>daysBetween(x.d,today)<=7);
  const dA=activeDiet(),f=b.fast.cur;
  const wl=b.water[today]||0,wGoal=kg?Math.round(kg*35/250):8;
  box.innerHTML=`
  <div class="sec hl">
    <div class="sec-h"><h3>Greutate</h3><span class="muted">${w.length?`${w.length} cântăriri`:""}</span></div>
    <div class="hl-big"><b>${fmtKg(kg)}</b><span>kg</span>
      ${last&&first&&w.length>1?`<small>${sgn(last.kg-first.kg)} kg de la ${dshort(first.d)}${wk&&wk!==last?` · ${sgn(last.kg-wk.kg)} în 7 zile`:""}</small>`:""}</div>
    ${chart()}
    <form class="hl-row" id="hl-wf"><input id="hl-wkg" type="number" inputmode="decimal" step="0.1" min="30" max="300" placeholder="Greutatea de azi (kg)" value=""><input id="hl-wd" type="date" value="${today}" max="${today}"><button class="btn" type="submit">Adaugă</button></form>
    ${w.length?`<details class="hl-list"><summary>Istoric</summary>${w.slice().reverse().slice(0,60).map(x=>`<div class="hl-li"><span>${dshort(x.d)}</span><b>${fmtKg(x.kg)} kg</b><button data-hw="${x.d}" aria-label="Șterge">✕</button></div>`).join("")}</details>`:""}
    <p class="note">Cântărește-te dimineața, după baie, înainte de micul dejun. Contează tendința, nu cifra unei zile.</p>
  </div>

  <div class="sec hl">
    <div class="sec-h"><h3>Profil & calorii</h3><span class="muted">orientativ</span></div>
    <div class="hl-grid">
      <label>Sex<select id="hl-sex"><option value="m"${p.sex!=="f"?" selected":""}>Bărbat</option><option value="f"${p.sex==="f"?" selected":""}>Femeie</option></select></label>
      <label>Vârsta<input id="hl-age" type="number" inputmode="numeric" min="14" max="100" value="${p.age||""}" placeholder="ani"></label>
      <label>Înălțimea<input id="hl-h" type="number" inputmode="numeric" min="120" max="230" value="${p.h||""}" placeholder="cm"></label>
      <label>Greutatea<input id="hl-kg" type="number" inputmode="decimal" step="0.1" value="${w.length?"":(p.kg||"")}" placeholder="${w.length?fmtKg(kg)+" (din cântăriri)":"kg"}" ${w.length?"disabled":""}></label>
      <label class="hl-wide">Activitatea<select id="hl-act">${ACT.map((a,i)=>`<option value="${i}"${+(p.act??2)===i?" selected":""}>${a[1]}</option>`).join("")}</select></label>
      <label class="hl-wide">Obiectivul<select id="hl-goal"><option value="lose"${(p.goal||"lose")==="lose"?" selected":""}>Slăbire (~0,5 kg/săptămână)</option><option value="keep"${p.goal==="keep"?" selected":""}>Menținere</option><option value="gain"${p.goal==="gain"?" selected":""}>Masă musculară</option></select></label>
    </div>
    <div id="hl-calc">${calcOut()}</div>
  </div>

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
      <label>Greutate țintă<input id="hl-dt" type="number" inputmode="decimal" step="0.1" placeholder="kg"></label>
      <label class="hl-wide">Notă (de ce o faci)<input id="hl-dno" maxlength="140" placeholder="opțional"></label>
      <button class="btn hl-wide" type="submit">Încep dieta</button></form>`}
    ${b.diets.filter(d=>d.end).length?`<details class="hl-list"><summary>Diete trecute</summary>${b.diets.filter(d=>d.end).slice().reverse().map(d=>`<div class="hl-li"><span>${esc(d.name||"Dietă")}<small> ${dshort(d.start)} – ${dshort(d.end)} · ${daysBetween(d.start,d.end)+1} zile</small></span><b>${d.sw&&d.ew?sgn(d.ew-d.sw)+" kg":""}</b></div>`).join("")}</details>`:""}
  </div>

  <div class="sec hl" id="hl-fast">
    <div class="sec-h"><h3>Post</h3><span class="muted">${b.fast.hist.length?`${b.fast.hist.length} posturi`:""}</span></div>
    ${f?fastLive(f):`<div class="hl-chips">${FT.map(([h,l])=>`<button class="hl-chip${(b.fast.pick||16)===h?" on":""}" data-fh="${h}">${l}</button>`).join("")}</div>
      <div class="hl-row"><label class="hl-lbl">Ultima masă<input id="hl-fs" type="time" value="${new Date().toTimeString().slice(0,5)}"></label><button class="btn" id="hl-fgo">Încep postul</button></div>
      <p class="note">Doar apă, ceai sau cafea neîndulcite.${(b.fast.pick||16)>=24?" Peste 24 h: ia electroliți (sare, magneziu, potasiu) și oprește-te dacă ai amețeli. Dacă iei medicamente sau ai o afecțiune, vorbește întâi cu medicul.":""}</p>`}
    ${fastStats()}
  </div>

  <div class="sec hl">
    <div class="sec-h"><h3>Apă azi</h3><span class="muted">țintă ${wGoal} pahare</span></div>
    <div class="hl-water">${Array.from({length:Math.max(wGoal,wl)},(_,i)=>`<i class="${i<wl?"on":""}"></i>`).join("")}</div>
    <div class="hadd-b"><button class="btn ghost" id="hl-w-">−</button><button class="btn" id="hl-w+">+ 1 pahar (250 ml)</button></div>
    <p class="note">${wl*250} ml din ${wGoal*250} ml (~35 ml pe kilogram).</p>
  </div>`;
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

// ── evenimente ──
document.addEventListener("submit",e=>{
  if(e.target.id==="hl-wf"){e.preventDefault();const kg=parseFloat(String($h("hl-wkg").value).replace(",",".")),d=$h("hl-wd").value||dk();
    if(!(kg>30&&kg<300)){toast("Scrie greutatea în kg");return}
    const w=B().w.filter(x=>x.d!==d);w.push({d,kg:r1(kg)});w.sort((a,b)=>a.d<b.d?-1:1);B().w=w;save();toast("Greutate salvată");render()}
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
  if(!t.closest("#sp-body"))return;
  const hw=t.closest("[data-hw]");if(hw){if(confirm("Ștergi cântărirea din "+dshort(hw.dataset.hw)+"?")){B().w=B().w.filter(x=>x.d!==hw.dataset.hw);save();render()}return}
  const fh=t.closest("[data-fh]");if(fh){B().fast.pick=+fh.dataset.fh;save();render();return}
  if(t.closest("#hl-fgo")){const [H,M]=($h("hl-fs").value||"").split(":").map(Number);const s=new Date();if(!isNaN(H)){s.setHours(H,M||0,0,0);if(s>Date.now())s.setDate(s.getDate()-1)}
    B().fast.cur={start:+s,h:B().fast.pick||16};save();render();startTick();toast("Post pornit");return}
  if(t.closest("#hl-fx")){if(confirm("Anulezi postul fără să-l salvezi?")){B().fast.cur=null;save();render()}return}
  if(t.closest("#hl-fend")){const f=B().fast.cur;if(!f)return;B().fast.hist.push({start:f.start,end:Date.now(),h:f.h});B().fast.cur=null;save();
    toast((Date.now()-f.start)/36e5>=f.h?"Bravo! Post dus la capăt 💪":"Post salvat");render();return}
  if(t.closest("#hl-dend")){const d=activeDiet();if(!d||!confirm("Închei dieta?"))return;d.end=dk();d.ew=curW();save();toast("Dietă încheiată");render();return}
  if(t.closest("#hl-w\\+")||t.id==="hl-w+"){const k=dk();B().water[k]=(B().water[k]||0)+1;save();render();return}
  if(t.closest("#hl-w-")||t.id==="hl-w-"){const k=dk();B().water[k]=Math.max(0,(B().water[k]||0)-1);save();render();return}
});
function startTick(){clearInterval(tick);tick=setInterval(()=>{
  if(document.hidden||tab!=="body"||$h("v-sport").hidden)return;
  const f=B().fast.cur;if(!f)return;
  const el=$h("hl-fel");if(!el)return;
  const ms=Date.now()-f.start;
  // o dată pe minut redesenăm tot (inelul, faza); între timp doar ceasul
  if(Math.floor(ms/6e4)!==startTick.m){startTick.m=Math.floor(ms/6e4);const sc=window.scrollY;render();window.scrollTo(0,sc)}else el.textContent=hm(ms);
},1000)}
function setTab(t){
  tab=t;S.spTab=t;save();
  document.querySelectorAll("#sp-tabs [data-stab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.stab===t));
  $h("sp-train").hidden=t!=="train";$h("sp-body").hidden=t!=="body";
  if(t==="body"){window.Sport&&Sport.hide();render();startTick()}
  else{clearInterval(tick);window.Sport&&Sport.show()}
}
function show(){tab=S.spTab==="body"?"body":"train";setTab(tab)}
window.Health={show,render};
})();
