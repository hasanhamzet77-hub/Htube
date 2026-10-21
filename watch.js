// IMPERIUM — Ceas: datele ceasului Huawei ajung aici prin Apple Sănătate și scurtătura „IMPERIUM Ceas”.
// Scurtătura citește pașii, caloriile, pulsul, somnul și greutatea și le copiază ca text; aplicația le lipește și le socotește.
// Totul rămâne pe telefon (în S.watch).
(function(){
const $w=id=>document.getElementById(id);
const SC="IMPERIUM Ceas";
S.watch=Object.assign({d:{},last:0,goal:{p:10000,s:450}},S.watch||{});
const W=()=>S.watch;
const XP=(k,p,l)=>window.Grow&&Grow.award(k,p,l);
const p2=n=>String(n).padStart(2,"0");
const dayOf=ms=>dk(new Date(ms));
const fmtN=n=>Math.round(n).toLocaleString("ro-RO");
const hhmm=ms=>{const d=new Date(ms);return p2(d.getHours())+":"+p2(d.getMinutes())};
const durH=m=>{m=Math.round(m);return `${Math.floor(m/60)} h ${p2(m%60)}`};
const dLbl=k=>{const t=dk(),y=dk(new Date(Date.now()-864e5));return k===t?"azi":k===y?"ieri":new Date(k+"T12:00").toLocaleDateString("ro-RO",{weekday:"short",day:"numeric"})};
let showPaste=false,openGuide=false;

// ── citire robustă: numere cu virgulă sau puncte de mii, unități lipite, date ISO sau timestamp ──
function num(s){
  let t=String(s||"").replace(/[\s  ]/g,"");const m=t.match(/-?[\d.,]+/);if(!m)return NaN;t=m[0];
  if(t.includes(",")&&t.includes("."))t=t.lastIndexOf(",")>t.lastIndexOf(".")?t.replace(/\./g,"").replace(",","."):t.replace(/,/g,"");
  else if(t.includes(","))t=/^\d{1,3}(,\d{3})+$/.test(t)&&!/,\d{1,2}$/.test(t)?t.replace(/,/g,""):t.replace(",",".");
  else if(/^\d{1,3}(\.\d{3})+$/.test(t))t=t.replace(/\./g,"");
  return parseFloat(t);
}
function when(s){
  s=String(s||"").trim();if(!s)return NaN;
  if(/^\d{10,13}$/.test(s))return s.length===13?+s:+s*1000;
  let t=Date.parse(s);if(!isNaN(t))return t;
  t=Date.parse(s.replace(" ","T").replace(/ ?([+-]\d{2}):?(\d{2})$/,"$1:$2"));return t;
}
// tipul de somn, în orice limbă a telefonului
const slType=v=>/treaz|awake|wach|réveil|despierto/i.test(v)?"awake":/pat|bed|bett|lit|cama/i.test(v)?"bed":/profund|deep|tief/i.test(v)?"deep":/rem/i.test(v)?"rem":/esen|core|kern|ușor|usor|light|leicht/i.test(v)?"core":"sleep";
function union(iv){iv=iv.slice().sort((a,b)=>a[0]-b[0]);let tot=0,cs=-1,ce=-1;for(const [s,e] of iv){if(s>ce){if(ce>cs)tot+=ce-cs;cs=s;ce=e}else ce=Math.max(ce,e)}if(ce>cs)tot+=ce-cs;return tot}

function importText(txt){
  const L=String(txt||"").split(/\r?\n|\u2028/).map(x=>x.trim()).filter(Boolean);
  const P={},E={},H={},R={},G={},SL=[];let n=0;
  for(const line of L){
    const a=line.split("|");if(a.length<4)continue;
    const k=a[0].trim().toUpperCase().charAt(0),s=when(a[1]),e=when(a[2]),v=a.slice(3).join("|").trim();
    if(isNaN(s))continue;const day=dayOf(s);n++;
    if(k==="P"||k==="E"){const x=num(v);if(isNaN(x))continue;const o=k==="P"?P:E;o[day]=(o[day]||0)+x}
    else if(k==="H"){const x=num(v);if(x>25&&x<230)(H[day]=H[day]||[]).push(x)}
    else if(k==="R"){const x=num(v);if(x>25&&x<150)R[day]=x}
    else if(k==="G"){const x=num(v);if(x>30&&x<300)G[day]=Math.round(x*10)/10}
    else if(k==="S"&&!isNaN(e)&&e>s&&e-s<16*36e5)SL.push({s,e,t:slType(v)});
  }
  if(!n)return null;
  const D=W().d,dd=k=>D[k]=D[k]||{},touched=new Set();
  for(const [k,v] of Object.entries(P)){dd(k).p=Math.round(v);touched.add(k)}
  for(const [k,v] of Object.entries(E)){dd(k).e=Math.round(v);touched.add(k)}
  for(const [k,a] of Object.entries(H)){dd(k).hr={lo:Math.round(Math.min(...a)),av:Math.round(a.reduce((x,y)=>x+y,0)/a.length),hi:Math.round(Math.max(...a))};touched.add(k)}
  for(const [k,v] of Object.entries(R)){dd(k).rhr=Math.round(v);touched.add(k)}
  for(const [k,v] of Object.entries(G)){dd(k).kg=v;touched.add(k);
    try{const b=S.body=S.body||{};b.w=b.w||[];if(!b.w.some(x=>x.d===k)){b.w.push({d:k,kg:v,src:"ceas"});b.w.sort((x,y)=>x.d<y.d?-1:1)}}catch(_){}}
  // somnul: segmentele apropiate formează o noapte; noaptea ține de ziua în care te-ai trezit
  SL.sort((a,b)=>a.s-b.s);const ses=[];
  for(const x of SL){const c=ses[ses.length-1];if(c&&x.s<=c.e+90*6e4){c.seg.push(x);c.e=Math.max(c.e,x.e)}else ses.push({s:x.s,e:x.e,seg:[x]})}
  const night={};
  for(const c of ses){
    const sl=c.seg.filter(x=>x.t!=="bed"&&x.t!=="awake").map(x=>[x.s,x.e]);
    const asleep=sl.length?union(sl):union(c.seg.filter(x=>x.t==="bed").map(x=>[x.s,x.e]))-union(c.seg.filter(x=>x.t==="awake").map(x=>[x.s,x.e]));
    const m=asleep/6e4;if(m<20)continue;
    const st={};for(const t of ["deep","rem","core","awake"]){const v=union(c.seg.filter(x=>x.t===t).map(x=>[x.s,x.e]))/6e4;if(v>0)st[t]=Math.round(v)}
    const k=dayOf(c.e),o=night[k]=night[k]||{m:0,main:null};o.m+=m;
    if(!o.main||m>o.main.m)o.main={m,b:c.s,w:c.e,st};
  }
  for(const [k,o] of Object.entries(night)){dd(k).sl={m:Math.round(o.m),b:o.main.b,w:o.main.w,st:o.main.st};touched.add(k)}
  const g=W().goal;
  const recent=new Set([dk(),dk(new Date(Date.now()-864e5))]);   // XP doar pentru azi și ieri, fără ploaie de puncte la prima sincronizare
  for(const k of touched){const x=D[k];if(!recent.has(k))continue;
    if(x.p>=g.p)XP(`steps:${k}`,10,"Ținta de pași");
    if(x.sl&&x.sl.m>=g.s)XP(`sleep:${k}`,10,"Somn bun")}
  W().last=Date.now();W().pend=0;save();
  return {n,days:touched.size};
}

async function pasteNow(){
  let txt="";
  try{txt=await navigator.clipboard.readText()}catch(e){showPaste=true;render();toast("Lipește textul în căsuță");return}
  doImport(txt);
}
function doImport(txt){
  const r=importText(txt);
  if(!r){toast("În clipboard nu sunt date de la ceas. Rulează întâi scurtătura.");showPaste=false;render();return}
  showPaste=false;toast(`Date preluate: ${r.days} ${r.days===1?"zi":"zile"} ✓`);render();
  try{window.Grow&&Grow.refresh&&Grow.refresh()}catch(_){}
}
function runShortcut(){
  W().pend=Date.now();save();
  location.href="shortcuts://run-shortcut?name="+encodeURIComponent(SC);
}

// ── desen ──
function ring(pr,col,lbl,val,sub){
  const R=46,C=2*Math.PI*R,f=Math.max(0,Math.min(1,pr||0));
  return `<div class="wring ${f>=1?"full":""}"><svg viewBox="0 0 108 108"><circle cx="54" cy="54" r="${R}" class="trk"/><circle cx="54" cy="54" r="${R}" class="arc" style="stroke:${col}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-f)).toFixed(1)}"/></svg>
    <div><small>${lbl}</small><b>${val}</b><span>${sub}</span></div></div>`;
}
function bars(days,get,goal,fmt,col){
  const vals=days.map(get),mx=Math.max(goal||0,...vals.map(v=>v||0),1);
  return `<div class="wbars">${goal?`<i class="wgoal" style="bottom:${(goal/mx*100).toFixed(1)}%"></i>`:""}${days.map((k,i)=>{const v=vals[i];
    return `<div><em>${v?fmt(v):""}</em><i style="height:${v?Math.max(3,v/mx*100).toFixed(1):0}%;background:${v&&goal&&v>=goal?"var(--live)":col}"></i><small>${["D","L","Ma","Mi","J","V","S"][new Date(k+"T12:00").getDay()]}</small></div>`}).join("")}</div>`;
}
function last7(){const a=[];for(let i=6;i>=0;i--)a.push(dk(new Date(Date.now()-i*864e5)));return a}
function ago(ts){if(!ts)return "niciodată";const m=Math.round((Date.now()-ts)/6e4);return m<1?"chiar acum":m<60?`acum ${m} min`:m<1440?`acum ${Math.round(m/60)} h`:new Date(ts).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})+" "+hhmm(ts)}
function guide(){
  return `<details class="wguide" ${openGuide||!W().last?"open":""}><summary>Cum fac scurtătura „${SC}” (o singură dată)</summary>
  <ol>
    <li>Deschide aplicația <b>Scurtături</b> → <b>+</b> → numește scurtătura exact <b>${SC}</b>.</li>
    <li>Adaugă <b>Găsește mostre de sănătate</b> (Find Health Samples): tip <b>Pași</b>, data de început <b>în ultimele 7 zile</b>, <b>Grupează după: Zi</b>.</li>
    <li>Adaugă <b>Repetă cu fiecare</b>. Înăuntru pune o acțiune <b>Text</b> cu: <code>P|Început|Sfârșit|Valoare</code> — unde Început, Sfârșit și Valoare sunt variabila <b>Element repetat</b> (atinge-o și alege <b>Data de început</b>, <b>Data de sfârșit</b>, <b>Valoare</b>; la date alege formatul <b>ISO 8601</b> cu oră).</li>
    <li>După <b>Sfârșit repetare</b>, adaugă <b>Adaugă la variabilă</b> → nume <b>Ceas</b>.</li>
    <li>Dublează aceste 4 acțiuni (ține apăsat → Dublează) pentru celelalte date și schimbă tipul și litera de la început:
      <br>• <b>Energie activă</b>, ultimele 7 zile, grupat pe zi → litera <b>E</b>
      <br>• <b>Ritm cardiac</b>, ultimele 2 zile, grupat pe oră → litera <b>H</b>
      <br>• <b>Analiza somnului</b>, ultimele 3 zile, fără grupare → litera <b>S</b>
      <br>• <b>Greutate</b>, ultimele 30 de zile (dacă ai cântar) → litera <b>G</b></li>
    <li>La final: <b>Combină textul</b> (variabila Ceas, cu <b>Linie nouă</b>) → <b>Copiază în clipboard</b> → <b>Afișează notificarea</b> „Date copiate”.</li>
    <li>Prima rulare: iPhone te întreabă dacă scurtătura poate citi datele din Sănătate → <b>Permite</b>.</li>
  </ol>
  <p>Automat: în Scurtături → <b>Automatizare</b> → <b>Ora din zi</b> (de ex. 7:30 și 21:00) → <b>Rulează imediat</b> → ${SC}. Apoi în IMPERIUM apeși <b>Lipește</b>.</p></details>`;
}
function render(){
  const box=$w("sp-watch");if(!box||box.hidden)return;
  const D=W().d,g=W().goal,t=dk(),y=dk(new Date(Date.now()-864e5));
  const today=D[t]||{},sk=D[t]&&D[t].sl?t:(D[y]&&D[y].sl?y:null),sl=sk?D[sk].sl:null,hrD=D[t]&&D[t].hr?t:(D[y]&&D[y].hr?y:null),hr=hrD?D[hrD].hr:null;
  const days=last7(),has=Object.keys(D).length>0;
  const pend=W().pend&&Date.now()-W().pend<10*6e4;
  const stTxt=sl&&sl.st&&(sl.st.deep||sl.st.rem||sl.st.core)?`<div class="wst">${[["deep","profund"],["core","ușor"],["rem","REM"],["awake","treaz"]].filter(([k])=>sl.st[k]).map(([k,l])=>`<span class="s-${k}"><i></i>${l} ${durH(sl.st[k])}</span>`).join("")}</div>`:"";
  box.innerHTML=`
  <div class="sec hl watch">
    <div class="sec-h"><h3>⌚ Ceasul tău</h3><span class="muted">sincronizat ${ago(W().last)}</span></div>
    <div class="wsync"><button class="btn" id="w-run">⌚ Preia de la ceas</button><button class="btn ${pend?"":"ghost"}" id="w-paste">📋 Lipește</button></div>
    ${pend?`<p class="wtip">Scurtătura a copiat datele? Apasă <b>Lipește</b>, apoi <b>Lipire</b> în bula de la iPhone.</p>`:""}
    ${showPaste?`<div class="wpaste"><textarea id="w-ta" rows="4" placeholder="Ține apăsat aici → Lipire"></textarea><button class="btn" id="w-imp">Importă</button></div>`:""}
    ${has?`<div class="wrings">
      ${ring((today.p||0)/g.p,"var(--accent)","Pași azi",today.p!=null?fmtN(today.p):"–",`din ${fmtN(g.p)}`)}
      ${ring(sl?sl.m/g.s:0,"#8b7cff",sk===t?"Somn azi-noapte":sk?"Somn (ieri)":"Somn",sl?durH(sl.m):"–",sl?`${hhmm(sl.b)} → ${hhmm(sl.w)}`:`țintă ${durH(g.s)}`)}
    </div>${stTxt}
    <div class="wtiles">
      <div><span>❤️</span><b>${hr?hr.av:"–"}<small> bpm</small></b><small>puls mediu ${hrD&&hrD!==t?"(ieri)":""}</small></div>
      <div><span>💤</span><b>${(D[hrD]||{}).rhr||(hr?hr.lo:"–")}<small> bpm</small></b><small>${(D[hrD]||{}).rhr?"puls de repaus":"puls minim"}</small></div>
      <div><span>⚡</span><b>${hr?hr.hi:"–"}<small> bpm</small></b><small>puls maxim</small></div>
      <div><span>🔥</span><b>${today.e!=null?fmtN(today.e):"–"}<small> kcal</small></b><small>calorii active azi</small></div>
    </div>`:`<p class="wtip">Încă nu am date. Fă scurtătura de mai jos, apoi apasă <b>Preia de la ceas</b>.</p>`}
  </div>
  ${has?`<div class="sec hl"><div class="sec-h"><h3>👟 Pași · 7 zile</h3><span class="muted">medie ${fmtN(avg(days.map(k=>(D[k]||{}).p)))}</span></div>${bars(days,k=>(D[k]||{}).p,g.p,v=>v>=1000?Math.round(v/1000)+"k":v,"var(--accent)")}</div>
  <div class="sec hl"><div class="sec-h"><h3>😴 Somn · 7 nopți</h3><span class="muted">medie ${durH(avg(days.map(k=>((D[k]||{}).sl||{}).m)))}</span></div>${bars(days,k=>((D[k]||{}).sl||{}).m,g.s,v=>(v/60).toFixed(1).replace(".",","),"#8b7cff")}</div>
  <div class="sec hl"><div class="sec-h"><h3>❤️ Puls mediu · 7 zile</h3><span class="muted">bpm</span></div>${bars(days,k=>((D[k]||{}).hr||{}).av,0,v=>v,"#ff6b81")}</div>`:""}
  <div class="sec hl"><div class="sec-h"><h3>🎯 Țintele tale</h3></div>
    <div class="htgrid wgoals">
      <div class="htst"><small>Pași pe zi</small><div><button data-wg="p" data-d="-1">−</button><b>${fmtN(g.p)}</b><button data-wg="p" data-d="1">+</button></div></div>
      <div class="htst"><small>Somn pe noapte</small><div><button data-wg="s" data-d="-1">−</button><b>${durH(g.s)}</b><button data-wg="s" data-d="1">+</button></div></div>
    </div>
    <p class="note">Ziua cu ținta atinsă îți aduce XP și intră în obiectivele lunare („Zile cu ținta de pași”, „Nopți cu somn bun”) și în raportul săptămânal.</p>
  </div>
  <div class="sec hl">${guide()}<p class="note">Datele vin din Apple Sănătate, unde le trimite aplicația Huawei Health. Rămân doar pe telefonul tău.</p></div>`;
}
function avg(a){a=a.filter(v=>v);return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}

document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest("#sp-watch"))return;
  if(t.closest("#w-run")){runShortcut();return}
  if(t.closest("#w-paste")){pasteNow();return}
  if(t.closest("#w-imp")){doImport(($w("w-ta")||{}).value);return}
  const gb=t.closest("[data-wg]");if(gb){const g=W().goal,d=+gb.dataset.d;
    if(gb.dataset.wg==="p")g.p=Math.max(2000,Math.min(40000,g.p+d*500));else g.s=Math.max(240,Math.min(660,g.s+d*15));save();render();return}
  if(t.closest(".wguide summary"))openGuide=!t.closest("details").open;
});
// te întorci din Scurtături: îți arătăm butonul de lipire
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&W().pend&&Date.now()-W().pend<10*6e4)render()});
// rezervă: dacă scurtătura deschide aplicația cu datele în adresă (#ceas=...)
function fromHash(){
  const h=location.hash||"";if(!h.startsWith("#ceas="))return;
  let txt="";try{txt=decodeURIComponent(h.slice(6))}catch(_){txt=h.slice(6)}
  history.replaceState(null,"",location.pathname+location.search);
  const r=importText(txt);if(r)setTimeout(()=>toast(`Date de la ceas: ${r.days} zile ✓`),800);
}
fromHash();window.addEventListener("hashchange",fromHash);

window.Watch={render,importText,
  // pentru obiective și raport
  stepsDays:(pred)=>Object.entries(W().d).filter(([k,v])=>pred(k)&&v.p>=W().goal.p).length,
  sleepDays:(pred)=>Object.entries(W().d).filter(([k,v])=>pred(k)&&v.sl&&v.sl.m>=W().goal.s).length,
  day:k=>W().d[k]};
})();
