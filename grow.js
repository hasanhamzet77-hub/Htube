// IMPERIUM — creștere: puncte (XP) și niveluri, obiective lunare, recompense, raport săptămânal,
// respirație ghidată, suplimente, notițe din cărți și sub-paginile din aplicație. Totul rămâne pe telefon.
(function(){
const $g=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,"0");
const mkey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const kOf=t=>dk(new Date(t));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmtN=n=>Math.round(n).toLocaleString("ro-RO");
S.xp=Object.assign({total:0,spent:0,keys:{},log:[]},S.xp||{});
S.goals=(S.goals||[]).filter(g=>g.m!=="water");   // apa a fost scoasă din aplicație
S.rewards=S.rewards||[];S.notes=S.notes||[];
S.supp=Object.assign({list:[],taken:{}},S.supp||{});
S.breath=Object.assign({days:{},pick:"box",min:5},S.breath||{});

// ── niveluri (ranguri romane) ──
const LV=[[0,"Recrut","🛡️"],[150,"Legionar","⚔️"],[400,"Decurion","🗡️"],[800,"Optio","🏹"],[1400,"Centurion","🦅"],[2200,"Tribun","🏛️"],[3300,"Legat","🔱"],[4800,"Consul","👑"],[6800,"Împărat","🌟"]];
function level(x){
  let i=0;while(i+1<LV.length&&x>=LV[i+1][0])i++;
  let name=LV[i][1],from=LV[i][0],to=LV[i+1]?LV[i+1][0]:null;
  if(!to){const extra=Math.floor((x-from)/3000);name+=extra?" "+["","II","III","IV","V","VI","VII","VIII","IX","X"][Math.min(extra,9)]:"";from=from+extra*3000;to=from+3000;i+=extra}
  return {i,name,em:LV[Math.min(i,LV.length-1)][2],from,to,p:(x-from)/(to-from)};
}
const avail=()=>S.xp.total-S.xp.spent;
function dayStreak(){
  const days=new Set(S.xp.log.map(x=>kOf(x.t)));let n=0;const d=new Date();
  if(!days.has(dk(d)))d.setDate(d.getDate()-1);
  while(days.has(dk(d))){n++;d.setDate(d.getDate()-1)}
  return n;
}

// ── efecte: +XP plutitor, confetti, nivel nou ──
let floatN=0;
function floatXP(p,label){
  const el=document.createElement("div");el.className="xpfloat";el.style.setProperty("--o",(floatN++%3)*46+"px");
  el.innerHTML=`<b>+${p} XP</b><small>${esc(label||"")}</small>`;document.body.appendChild(el);
  setTimeout(()=>{el.remove();floatN=Math.max(0,floatN-1)},2300);
}
function confetti(big){
  const c=document.createElement("canvas");c.className="confetti";document.body.appendChild(c);
  const W=c.width=innerWidth*devicePixelRatio,H=c.height=innerHeight*devicePixelRatio,g=c.getContext("2d"),dp=devicePixelRatio;
  const col=["#ffd166","#f4a261","#8fa3ff","#a855f7","#5b5bf7","#10b981","#ff5d8f","#ffffff"];
  const P=Array.from({length:big?220:120},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*(big?.55:.62),vx:(Math.random()-.5)*16*dp,vy:-(8+Math.random()*16)*dp,r:(4+Math.random()*6)*dp,a:Math.random()*6,va:(Math.random()-.5)*.35,c:col[Math.random()*col.length|0],s:Math.random()<.3}));
  const t0=performance.now();
  (function f(t){const k=(t-t0)/1000;g.clearRect(0,0,W,H);
    for(const p of P){p.vy+=.42*dp;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.globalAlpha=Math.max(0,1-k/3.2);g.fillStyle=p.c;
      if(p.s){g.beginPath();g.arc(0,0,p.r*.55,0,7);g.fill()}else g.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);g.restore()}
    if(k<3.2)requestAnimationFrame(f);else c.remove()})(t0);
  if(navigator.vibrate)navigator.vibrate([20,40,20]);
}
function modal(html,cls){
  const m=document.createElement("div");m.className="gmodal "+(cls||"");m.innerHTML=`<div class="gm-card">${html}<button class="btn gm-ok">Mai departe</button></div>`;
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"));
  m.addEventListener("click",e=>{if(e.target===m||e.target.closest(".gm-ok")){m.classList.remove("in");setTimeout(()=>m.remove(),350)}});
}
function levelUp(lv){
  confetti(true);try{bell(.35);setTimeout(()=>bell(.25),500)}catch(e){}
  modal(`<div class="gm-rays"></div><div class="gm-em">${lv.em}</div><small>Nivel nou</small><h3>${esc(lv.name)}</h3><p>Ai urcat în rang. Disciplina de fiecare zi se vede.</p>`,"lvl");
}

// ── puncte ──
function award(key,pts,label){
  if(!pts||S.xp.keys[key])return false;
  const before=level(S.xp.total);
  S.xp.keys[key]=pts;S.xp.total+=pts;S.xp.log.push({t:Date.now(),k:key,p:pts,l:label||""});
  if(S.xp.log.length>600)S.xp.log=S.xp.log.slice(-600);
  save();floatXP(pts,label);
  const after=level(S.xp.total);if(after.i>before.i)setTimeout(()=>levelUp(after),700);
  refresh();checkGoals();
  return true;
}
function revoke(key){const p=S.xp.keys[key];if(!p)return;delete S.xp.keys[key];S.xp.total-=p;S.xp.log=S.xp.log.filter(x=>x.k!==key);save();refresh()}
function refresh(){
  const c=$g("xp-chip");if(c){const lv=level(S.xp.total);c.innerHTML=`<span class="xpe">${lv.em}</span><span><b>${esc(lv.name)}</b><small>${fmtN(avail())} 🪙</small></span><i style="--p:${(lv.p*100).toFixed(1)}%"></i>`}
  if(!$g("v-azi").hidden&&(S.sub||{}).azi==="obiective")renderGoals();
}

// ── sub-pagini (Azi, Raft, Setări) ──
function setSub(key,name,user){
  S.sub=S.sub||{};const nav=document.querySelector(`.subnav[data-subnav="${key}"]`);if(!nav)return;
  const btns=[...nav.querySelectorAll("[data-sub]")];if(!btns.some(b=>b.dataset.sub===name))name=btns[0].dataset.sub;
  const prev=S.sub[key];S.sub[key]=name;save();
  const iPrev=btns.findIndex(b=>b.dataset.sub===prev),iNew=btns.findIndex(b=>b.dataset.sub===name);
  btns.forEach(b=>b.setAttribute("aria-pressed",b.dataset.sub===name));
  document.querySelectorAll(`.subpg[data-of="${key}"]`).forEach(p=>{
    const on=p.dataset.subpg===name;p.hidden=!on;
    if(on&&user){p.classList.remove("sp-l","sp-r");void p.offsetWidth;p.classList.add(iNew>=iPrev?"sp-r":"sp-l")}
  });
  moveInd(nav);
  if(user)window.scrollTo({top:0,behavior:"instant"in window?"instant":"auto"});
  if(key==="azi")renderAziSub(name);
  if(key==="raft"&&name==="notite")renderNotes();
}
function moveInd(nav){
  requestAnimationFrame(()=>{const b=nav.querySelector('[aria-pressed="true"]'),i=nav.querySelector(".snind");if(!b||!i||!b.offsetWidth)return;
    i.style.width=b.offsetWidth+"px";i.style.transform=`translateX(${b.offsetLeft}px)`})}
function initNav(){
  document.querySelectorAll(".subnav[data-subnav]").forEach(nav=>{
    if(nav.dataset.ok)return;nav.dataset.ok=1;
    const i=document.createElement("i");i.className="snind";nav.prepend(i);
    nav.addEventListener("click",e=>{const b=e.target.closest("[data-sub]");if(b)setSub(nav.dataset.subnav,b.dataset.sub,true)});
    if(window.ResizeObserver)new ResizeObserver(()=>moveInd(nav)).observe(nav);
    setSub(nav.dataset.subnav,(S.sub||{})[nav.dataset.subnav],false);
  });
}
function renderAziSub(name){
  name=name||(S.sub||{}).azi||"azi";
  if(name==="azi")renderSupp();
  if(name==="minte")renderBreathCard();
  if(name==="obiective")renderGoals();
  if(name==="raport")renderReport();
}
function renderAzi(){refresh();document.querySelectorAll(".subnav").forEach(moveInd);renderAziSub()}

// ── obiective lunare ──
const GT=[
  {m:"sport",e:"🏋️",n:"Antrenamente",u:"antrenamente",def:12,pts:300},
  {m:"read",e:"📖",n:"Minute de citit",u:"min",def:300,pts:250},
  {m:"med",e:"🧘",n:"Minute de meditație",u:"min",def:150,pts:200},
  {m:"jour",e:"✍️",n:"Zile cu jurnal",u:"zile",def:20,pts:200},
  {m:"fast",e:"⏳",n:"Posturi duse la capăt",u:"posturi",def:8,pts:250},
  {m:"cold",e:"🧊",n:"Zile cu apă rece",u:"zile",def:20,pts:200},
  {m:"sauna",e:"🔥",n:"Ritualuri de saună",u:"saune",def:8,pts:200},
  {m:"breath",e:"🌬️",n:"Sesiuni de respirație",u:"sesiuni",def:15,pts:150},
  {m:"kg",e:"⚖️",n:"Kilograme date jos",u:"kg",def:2,pts:400},
  {m:"manual",e:"🎯",n:"Obiectiv personal",u:"pași",def:10,pts:200}];
const GTm=m=>GT.find(x=>x.m===m)||GT[GT.length-1];
const inM=(k,m)=>String(k).startsWith(m);
function metric(g){
  const m=g.month,b=S.body||{};
  switch(g.m){
    case"sport":return Object.keys(S.wlog||{}).filter(k=>inM(k,m)).length;
    case"read":return Math.floor(Object.entries(S.rd||{}).filter(([k])=>inM(k,m)).reduce((a,[,v])=>a+v,0));
    case"med":return Object.entries((S.med||{}).days||{}).filter(([k])=>inM(k,m)).reduce((a,[,v])=>a+v,0);
    case"jour":return Object.entries(S.journal||{}).filter(([k,v])=>inM(k,m)&&typeof jFilled==="function"&&jFilled(v)).length;
    case"fast":return ((b.fast||{}).hist||[]).filter(x=>inM(kOf(x.end),m)&&(x.end-x.start)/36e5>=x.h).length;
    case"cold":return Object.keys((S.cold||{}).log||{}).filter(k=>inM(k,m)).length;
    case"sauna":return Object.entries((S.heat||{}).log||{}).filter(([k])=>inM(k,m)).reduce((a,[,v])=>a+v.length,0);
    case"breath":return Object.entries(S.breath.days).filter(([k])=>inM(k,m)).reduce((a,[,v])=>a+(v.n||0),0);
    case"water":{const w=b.w||[],kg=w.length?w[w.length-1].kg:70,goal=Math.round(kg*35/250);return Object.entries(b.water||{}).filter(([k,v])=>inM(k,m)&&v>=goal).length}
    case"kg":{const w=(b.w||[]).filter(x=>inM(x.d,m));if(w.length<2)return 0;return Math.max(0,Math.round((w[0].kg-w[w.length-1].kg)*10)/10)}
    default:return g.cnt||0;
  }
}
function checkGoals(){
  let hit=null;
  for(const g of S.goals){if(g.done||g.month!==mkey())continue;if(metric(g)>=g.target){g.done=Date.now();hit=g}}
  if(hit){save();award(`goal:${hit.id}`,hit.pts,"Obiectiv: "+hit.n);setTimeout(()=>{confetti(true);
    modal(`<div class="gm-rays gold"></div><div class="gm-em">${hit.e}</div><small>Obiectiv îndeplinit</small><h3>${esc(hit.n)}</h3><p>+${hit.pts} XP · ai acum ${fmtN(avail())} 🪙 de cheltuit pe recompense.</p>`,"goal")},300)}
}
function ringSVG(p,size=58,stroke=6,cls=""){
  const r=(size-stroke)/2,C=2*Math.PI*r;
  return `<svg class="gring ${cls}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" class="trk" stroke-width="${stroke}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" class="arc" stroke-width="${stroke}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-off="${(C*(1-Math.min(1,p))).toFixed(1)}"/></svg>`;
}
function animateRings(root){requestAnimationFrame(()=>requestAnimationFrame(()=>root.querySelectorAll(".gring .arc[data-off]").forEach(a=>a.style.strokeDashoffset=a.dataset.off)))}
function countUp(root){root.querySelectorAll("[data-count]").forEach(el=>{const to=+el.dataset.count,t0=performance.now(),d=900;(function f(t){const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=fmtN(to*e);if(k<1)requestAnimationFrame(f)})(t0)})}
function renderGoals(){
  const R=$g("goals-root");if(!R)return;checkGoals();
  const lv=level(S.xp.total),now=new Date(),m=mkey(),left=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate();
  const mine=S.goals.filter(g=>g.month===m),xpM=S.xp.log.filter(x=>inM(kOf(x.t),m)).reduce((a,x)=>a+x.p,0),st=dayStreak();
  const past=S.goals.filter(g=>g.month!==m);
  R.innerHTML=`
  <div class="ghero">
    <div class="gh-em"><span>${lv.em}</span>${ringSVG(lv.p,96,7,"lv")}</div>
    <div class="gh-t"><small>Rangul tău</small><b>${esc(lv.name)}</b>
      <div class="gh-bar"><i style="width:${(lv.p*100).toFixed(1)}%"></i></div>
      <span>${fmtN(S.xp.total-lv.from)} / ${fmtN(lv.to-lv.from)} XP până la următorul rang</span></div>
  </div>
  <div class="gstats">
    <div><b data-count="${avail()}">0</b><small>🪙 puncte</small></div>
    <div class="${st?"fire":""}"><b data-count="${st}">0</b><small>🔥 zile la rând</small></div>
    <div><b data-count="${xpM}">0</b><small>⚡ XP luna asta</small></div>
  </div>
  <div class="ghd"><h3>Obiectivele lunii</h3><span>${now.toLocaleDateString("ro-RO",{month:"long"})} · ${left?`mai ai ${left} zile`:"ultima zi"}</span></div>
  <div class="glist">${mine.length?mine.map(goalCard).join(""):`<div class="gempty">Pune-ți 2–4 obiective pentru luna asta. Când le atingi primești puncte pe care le schimbi pe recompensele tale.</div>`}
    <button class="gadd" id="g-add"><span>＋</span> Obiectiv nou</button></div>
  <div class="ghd"><h3>Recompense</h3><span>${fmtN(avail())} 🪙 disponibile</span></div>
  <div class="rgrid">${S.rewards.map(rewCard).join("")}<button class="radd" id="r-add"><span>🎁</span>Adaugă o recompensă</button></div>
  ${S.xp.log.length?`<div class="ghd"><h3>Ultimele puncte</h3></div><div class="glog">${S.xp.log.slice(-8).reverse().map(x=>`<div><span>${esc(x.l||"")}</span><small>${new Date(x.t).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})}</small><b>+${x.p}</b></div>`).join("")}</div>`:""}
  ${past.length?`<details class="gpast"><summary>Lunile trecute</summary>${past.slice().reverse().map(g=>`<div class="gpl"><span>${g.e} ${esc(g.n)}</span><small>${g.month}</small><b>${g.done?"✓ +"+g.pts:Math.round(metric(g))+"/"+g.target}</b></div>`).join("")}</details>`:""}`;
  animateRings(R);countUp(R);
  R.querySelectorAll(".gbar i[data-w]").forEach(i=>requestAnimationFrame(()=>requestAnimationFrame(()=>i.style.width=i.dataset.w)));
}
function goalCard(g){
  const v=metric(g),p=Math.min(1,v/g.target),t=GTm(g.m);
  return `<div class="gcard${g.done?" done":""}" data-g="${g.id}">
    <div class="gc-ic">${g.e}</div>
    <div class="gc-b"><b>${esc(g.n)}</b><small>${g.m==="kg"?String(v).replace(".",","):fmtN(v)} / ${g.target} ${esc(t.u)}${g.done?" · ✓ îndeplinit":""}</small>
      <div class="gbar"><i data-w="${(p*100).toFixed(1)}%"></i></div></div>
    <div class="gc-r"><span class="gpts">+${g.pts}</span>${g.m==="manual"&&!g.done?`<div class="gman"><button data-gm="-1" aria-label="Scade">−</button><button data-gm="1" aria-label="Adaugă">＋</button></div>`:""}<button class="gdel" data-gdel aria-label="Șterge">⋯</button></div></div>`;
}
function rewCard(r){
  const a=avail(),p=Math.min(1,a/r.cost),ok=a>=r.cost;
  return `<div class="rcard${ok?" ok":""}" data-r="${r.id}"><button class="gdel" data-rdel aria-label="Șterge">⋯</button><div class="rc-em">${r.e||"🎁"}</div><b>${esc(r.n)}</b><small>${fmtN(r.cost)} 🪙${(r.got||[]).length?` · luată de ${r.got.length}×`:""}</small>
    <div class="gbar"><i style="width:${(p*100).toFixed(1)}%"></i></div><button class="rbtn" data-rget ${ok?"":"disabled"}>${ok?"Revendică":`mai ai ${fmtN(r.cost-a)}`}</button></div>`;
}
function sheet(html,onSubmit){
  const m=document.createElement("div");m.className="gsheet";m.innerHTML=`<form class="gs-card"><i class="gs-grab"></i>${html}</form>`;
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"));
  const close=()=>{m.classList.remove("in");setTimeout(()=>m.remove(),320)};
  m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-close]"))close()});
  m.querySelector("form").addEventListener("submit",e=>{e.preventDefault();if(onSubmit(m.querySelector("form"))!==false)close()});
  return m;
}
function addGoal(){
  let pick=GT[0];
  const m=sheet(`<h3>Obiectiv nou pentru ${new Date().toLocaleDateString("ro-RO",{month:"long"})}</h3>
    <div class="gtpl">${GT.map((t,i)=>`<button type="button" data-t="${i}" class="${i?"":"on"}"><span>${t.e}</span>${t.n}</button>`).join("")}</div>
    <label>Nume<input name="n" value="${esc(pick.n)}" maxlength="50"></label>
    <div class="gs-row"><label>Ținta<input name="target" type="text" inputmode="decimal" step="any" value="${pick.def}"></label><label>Puncte la final<input name="pts" type="number" inputmode="numeric" value="${pick.pts}"></label></div>
    <p class="note" id="gs-hint">Se numără singur din aplicație.</p>
    <div class="hadd-b"><button type="button" class="btn ghost" data-close>Renunță</button><button class="btn">Adaugă</button></div>`,f=>{
      const target=parseFloat(String(f.target.value).replace(",","."));if(!(target>0)){toast("Pune o țintă");return false}
      S.goals.push({id:uid(),month:mkey(),m:pick.m,e:pick.e,n:f.n.value.trim()||pick.n,target,pts:Math.max(10,Math.min(5000,+f.pts.value||pick.pts)),cnt:0});
      save();renderGoals();toast("Obiectiv adăugat 🎯");
    });
  m.querySelector(".gtpl").addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;pick=GT[+b.dataset.t];
    m.querySelectorAll(".gtpl button").forEach(x=>x.classList.toggle("on",x===b));const f=m.querySelector("form");f.n.value=pick.n;f.target.value=pick.def;f.pts.value=pick.pts;
    $g("gs-hint").textContent=pick.m==="manual"?"Îl crești tu cu + de fiecare dată când faci un pas.":"Se numără singur din aplicație."});
}
function addReward(){
  const SUG=[["☕","Cafea specială",100],["🍕","Masa preferată",300],["🎬","Seară de film",400],["🎮","O seară de jocuri",500],["👟","Pantofi noi de sport",1500],["🏖️","Weekend liber",3000]];
  const m=sheet(`<h3>Recompensă nouă</h3><p class="note">Ce îți dai când strângi destule puncte?</p>
    <div class="gtpl">${SUG.map((x,i)=>`<button type="button" data-s="${i}"><span>${x[0]}</span>${x[1]}</button>`).join("")}</div>
    <div class="gs-row"><label style="flex:0 0 72px">Emoji<input name="e" value="🎁" maxlength="4"></label><label>Recompensa<input name="n" placeholder="ex. o cină în oraș" maxlength="50"></label></div>
    <label>Costă (puncte)<input name="cost" type="number" inputmode="numeric" value="500"></label>
    <div class="hadd-b"><button type="button" class="btn ghost" data-close>Renunță</button><button class="btn">Adaugă</button></div>`,f=>{
      const n=f.n.value.trim();if(!n){toast("Scrie recompensa");return false}
      S.rewards.push({id:uid(),e:f.e.value.trim()||"🎁",n,cost:Math.max(10,+f.cost.value||500),got:[]});save();renderGoals();toast("Recompensă adăugată 🎁");
    });
  m.querySelector(".gtpl").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const x=SUG[+b.dataset.s],f=m.querySelector("form");f.e.value=x[0];f.n.value=x[1];f.cost.value=x[2];
    m.querySelectorAll(".gtpl button").forEach(y=>y.classList.toggle("on",y===b))});
}
document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest("#goals-root"))return;
  if(t.closest("#g-add")){addGoal();return}
  if(t.closest("#r-add")){addReward();return}
  const gc=t.closest("[data-g]");
  if(gc){const g=S.goals.find(x=>x.id===gc.dataset.g);if(!g)return;
    const gm=t.closest("[data-gm]");if(gm){g.cnt=Math.max(0,(g.cnt||0)+ +gm.dataset.gm);save();if(+gm.dataset.gm>0&&navigator.vibrate)navigator.vibrate(10);renderGoals();return}
    if(t.closest("[data-gdel]")&&confirm(`Ștergi obiectivul „${g.n}”?`)){S.goals=S.goals.filter(x=>x!==g);save();renderGoals()}return}
  const rc=t.closest("[data-r]");
  if(rc){const r=S.rewards.find(x=>x.id===rc.dataset.r);if(!r)return;
    if(t.closest("[data-rdel]")){if(confirm(`Ștergi recompensa „${r.n}”?`)){S.rewards=S.rewards.filter(x=>x!==r);save();renderGoals()}return}
    if(t.closest("[data-rget]")&&avail()>=r.cost&&confirm(`Revendici „${r.n}” pentru ${fmtN(r.cost)} puncte?`)){
      S.xp.spent+=r.cost;(r.got=r.got||[]).push(Date.now());save();confetti(true);try{bell(.3)}catch(_){}
      modal(`<div class="gm-rays gold"></div><div class="gm-em">${r.e||"🎁"}</div><small>Ți-ai câștigat-o</small><h3>${esc(r.n)}</h3><p>Bucură-te de ea. Ai muncit pentru asta.</p>`,"rew");renderGoals();refresh()}
  }
});

// ── raport săptămânal ──
let repOff=0;
function weekDays(off){const d=new Date();d.setHours(12,0,0,0);const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow+off*7);return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return dk(x)})}
function weekStats(days){
  const set=new Set(days),b=S.body||{},inW=k=>set.has(k);
  const wts=(b.w||[]).filter(x=>inW(x.d)),mood=days.map(k=>(S.mood||{})[k]).filter(v=>v!==undefined);
  const kg=wts.length?wts[wts.length-1].kg:((b.w||[]).slice(-1)[0]||{}).kg,goalW=kg?Math.round(kg*35/250):8;
  const xpDay=days.map(k=>S.xp.log.filter(x=>kOf(x.t)===k).reduce((a,x)=>a+x.p,0));
  return {
    sport:days.filter(k=>(S.wlog||{})[k]).length,
    read:Math.round(days.reduce((a,k)=>a+((S.rd||{})[k]||0),0)),
    med:days.reduce((a,k)=>a+(((S.med||{}).days||{})[k]||0),0),
    jour:days.filter(k=>typeof jFilled==="function"&&jFilled((S.journal||{})[k])).length,
    fast:((b.fast||{}).hist||[]).filter(x=>inW(kOf(x.end))).length,
    cold:days.filter(k=>((S.cold||{}).log||{})[k]).length,
    sauna:days.reduce((a,k)=>a+(((S.heat||{}).log||{})[k]||[]).length,0),
    breath:days.reduce((a,k)=>a+((S.breath.days[k]||{}).n||0),0),
    water:days.filter(k=>((b.water||{})[k]||0)>=goalW).length,
    dkg:wts.length>1?Math.round((wts[wts.length-1].kg-wts[0].kg)*10)/10:null,
    mood:mood.length?mood.reduce((a,v)=>a+v,0)/mood.length:null,
    xpDay,xp:xpDay.reduce((a,v)=>a+v,0),active:xpDay.filter(v=>v>0).length};
}
function renderReport(){
  const R=$g("report-root");if(!R)return;
  const days=weekDays(repOff),w=weekStats(days),pw=weekStats(weekDays(repOff-1));
  const d0=new Date(days[0]+"T12:00"),d6=new Date(days[6]+"T12:00"),fmt=d=>d.toLocaleDateString("ro-RO",{day:"numeric",month:"short"});
  const mx=Math.max(1,...w.xpDay),best=w.xpDay.indexOf(Math.max(...w.xpDay));
  const delta=(a,b,inv)=>{if(b==null||a==null||a===b)return "";const up=a>b;return `<i class="${up!==!!inv?"up":"dn"}">${up?"▲":"▼"}</i>`};
  const T=[["🏋️","Antrenamente",w.sport,pw.sport,"/ 7"],["📖","Minute citite",w.read,pw.read,""],["🧘","Minute meditație",w.med,pw.med,""],["✍️","Zile cu jurnal",w.jour,pw.jour,"/ 7"],
    ["⏳","Posturi",w.fast,pw.fast,""],["🔥","Saune",w.sauna,pw.sauna,""],["🧊","Zile cu apă rece",w.cold,pw.cold,""],["🌬️","Respirație",w.breath,pw.breath,"sesiuni"]];
  const score=Math.round(w.active/7*100);
  const msg=w.active>=6?"Săptămână de împărat. Ține ritmul.":w.active>=4?"Bună săptămână. Încă puțin și devine obicei.":w.active>=1?"Ai pornit. Alege un singur lucru și fă-l zilnic.":"O săptămână nouă e o pagină albă. Începe cu ceva mic azi.";
  R.innerHTML=`
  <div class="rp-hd"><button data-rw="-1" aria-label="Săptămâna trecută">‹</button><div><small>${repOff===0?"Săptămâna asta":repOff===-1?"Săptămâna trecută":"Săptămâna"}</small><b>${fmt(d0)} – ${fmt(d6)}</b></div><button data-rw="1" ${repOff>=0?"disabled":""} aria-label="Următoarea">›</button></div>
  <div class="rp-hero">${ringSVG(w.active/7,110,9,"rp")}<div class="rp-sc"><b data-count="${w.active}">0</b><small>din 7 zile active</small></div>
    <div class="rp-xp"><b data-count="${w.xp}">0</b><small>XP câștigat ${delta(w.xp,pw.xp)}</small><p>${msg}</p></div></div>
  <div class="rp-bars">${w.xpDay.map((v,i)=>`<div class="${i===best&&v?"best":""}"><i style="--h:${(v/mx*100).toFixed(1)}%"></i><small>${["L","Ma","Mi","J","V","S","D"][i]}</small></div>`).join("")}</div>
  <div class="rp-grid">${T.map(([e,l,v,p,u])=>`<div><span>${e}</span><b>${fmtN(v)}<small> ${u}</small></b><small>${l} ${delta(v,p)}</small></div>`).join("")}
    <div><span>⚖️</span><b>${w.dkg==null?"–":(w.dkg>0?"+":"")+String(w.dkg).replace(".",",")}<small> kg</small></b><small>Greutate în săptămână</small></div>
    <div><span>${w.mood==null?"🙂":w.mood>.3?"😄":w.mood<-.3?"😔":"🙂"}</span><b>${w.mood==null?"–":w.mood>.3?"Bună":w.mood<-.3?"Grea":"Echilibrată"}</b><small>Starea medie</small></div></div>`;
  animateRings(R);countUp(R);
  requestAnimationFrame(()=>R.querySelectorAll(".rp-bars i").forEach((i,k)=>setTimeout(()=>i.classList.add("in"),k*60)));
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-rw]");if(!b||!b.closest("#report-root"))return;repOff=Math.min(0,repOff+ +b.dataset.rw);renderReport()});

// ── suplimente ──
function renderSupp(){
  const R=$g("sup-sec");if(!R)return;
  const L=S.supp.list,k=dk(),tk=S.supp.taken[k]||{},n=L.filter(x=>tk[x.id]).length,now=new Date(),hm=pad(now.getHours())+":"+pad(now.getMinutes());
  R.innerHTML=`<div class="sec-h"><h3>Suplimente</h3><span class="muted">${L.length?`${n}/${L.length} azi`:""}</span><button class="link" id="sp-ed">${S.supp.edit?"Gata":L.length?"Editează":""}</button></div>
    ${L.length?`<div class="supl">${L.map(x=>{const on=!!tk[x.id],due=!on&&x.t&&x.t<=hm;return `<button class="supc${on?" on":""}${due?" due":""}" data-sup="${x.id}"><span class="se">${esc(x.e||"💊")}</span><span class="sn"><b>${esc(x.n)}</b><small>${x.t?x.t:"oricând"}${due?" · e ora":""}</small></span><span class="sk">${on?"✓":""}</span>${S.supp.edit?`<i class="sdel" data-supdel="${x.id}">✕</i>`:""}</button>`}).join("")}</div>`:`<p class="note">Vitamine, magneziu, creatină sau medicamentele de zi cu zi: le bifezi aici și primești puncte când le iei pe toate.</p>`}
    ${S.supp.edit||!L.length?`<form class="supadd" id="sup-f"><input name="e" value="💊" maxlength="4" aria-label="Emoji"><input name="n" placeholder="ex. Magneziu" maxlength="30" required><input name="t" type="time" value="08:00"><button class="btn">＋</button></form>`:""}`;
}
document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest("#sup-sec"))return;
  if(t.closest("#sp-ed")){S.supp.edit=!S.supp.edit;save();renderSupp();return}
  const del=t.closest("[data-supdel]");if(del){e.stopPropagation();S.supp.list=S.supp.list.filter(x=>x.id!==del.dataset.supdel);save();renderSupp();return}
  const c=t.closest("[data-sup]");if(c&&!S.supp.edit){const k=dk(),tk=S.supp.taken[k]=S.supp.taken[k]||{};tk[c.dataset.sup]=!tk[c.dataset.sup];if(!tk[c.dataset.sup])delete tk[c.dataset.sup];save();renderSupp();
    if(tk[c.dataset.sup]&&navigator.vibrate)navigator.vibrate(12);
    if(S.supp.list.length&&S.supp.list.every(x=>tk[x.id]))award(`sup:${k}`,10,"Toate suplimentele");}
});
document.addEventListener("submit",e=>{if(e.target.id!=="sup-f")return;e.preventDefault();const f=e.target;
  S.supp.list.push({id:uid(),e:f.e.value.trim()||"💊",n:f.n.value.trim(),t:f.t.value});S.supp.list.sort((a,b)=>(a.t||"99")<(b.t||"99")?-1:1);save();renderSupp()});

// ── respirație ghidată ──
const BR={
  box:{n:"Pătrat",d:"4-4-4-4 · calm și concentrare",st:[["in",4,"Inspiră"],["hold",4,"Ține"],["out",4,"Expiră"],["hold",4,"Ține"]]},
  r478:{n:"4-7-8",d:"pentru somn și liniștire",st:[["in",4,"Inspiră pe nas"],["hold",7,"Ține"],["out",8,"Expiră pe gură"]]},
  coh:{n:"Coerentă",d:"5,5 s · echilibrează inima",st:[["in",5.5,"Inspiră"],["out",5.5,"Expiră"]]},
  calm:{n:"Anti-stres",d:"4-6 · expirul lung te calmează",st:[["in",4,"Inspiră"],["out",6,"Expiră încet"]]},
  wim:{n:"Wim Hof",d:"3 runde · energie (stând jos!)",wim:1}};
function renderBreathCard(){
  const R=$g("br-sec");if(!R)return;const b=S.breath,k=dk(),tot=Object.values(b.days).reduce((a,v)=>a+(v.min||0),0);
  R.innerHTML=`<div class="sec-h"><h3>Respirație</h3><span class="muted">${(b.days[k]||{}).n?`azi ${b.days[k].n}× · `:""}${tot?`total ${Math.round(tot)} min`:""}</span></div>
    <div class="brpat">${Object.entries(BR).map(([id,p])=>`<button data-br="${id}" class="${b.pick===id?"on":""}"><span class="bro"></span><b>${p.n}</b><small>${p.d}</small></button>`).join("")}</div>
    ${BR[b.pick].wim?`<p class="note">Wim Hof: 30 respirații adânci, apoi ții respirația cât poți după expir, apoi o inspirație ținută 15 s. Doar stând jos sau întins, niciodată în apă sau la volan.</p>`:`<div class="pres">${[3,5,10].map(m=>`<button class="pre" data-brm="${m}" aria-pressed="${b.min===m}">${m}<small>min</small></button>`).join("")}</div>`}
    <button class="btn" id="br-go">Începe ${BR[b.pick].n}</button>`;
}
let BS=null;
function brOpen(){
  const p=BR[S.breath.pick];
  const ov=document.createElement("div");ov.id="brov";ov.innerHTML=`<button class="brx" aria-label="Oprește">✕</button><div class="brorb"><i></i><i></i><i></i><span id="br-c"></span></div><div class="brtx"><b id="br-l">Pregătește-te</b><small id="br-s">${p.n}</small></div><button class="btn brtap" id="br-tap" hidden>Gata, respir</button>`;
  document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add("in"));
  BS={p,ov,t0:Date.now(),end:Date.now()+S.breath.min*6e4,i:-1,round:0,holds:[],stepEnd:Date.now()+3000,ph:"prep",cnt:0};
  ov.querySelector(".brx").onclick=()=>brClose(false);
  ov.querySelector("#br-tap").onclick=()=>{if(BS&&BS.ph==="ret"){BS.holds.push((Date.now()-BS.retT)/1000);wimStep("rec")}};
  BS.int=setInterval(brTick,100);
  try{typeof lockWake==="function"&&lockWake()}catch(e){}
}
function setOrb(ph,s){
  const o=BS.ov.querySelector(".brorb");o.style.transitionDuration=s+"s";o.dataset.ph=ph;
  o.style.transform=ph==="in"?"scale(1)":ph==="out"?"scale(.42)":"";
  if(navigator.vibrate)navigator.vibrate(ph==="in"?18:ph==="out"?[8,40,8]:6);
  tone(ph);
}
let tctx=null;
function tone(ph){if((S.music||{}).on===false)return;try{tctx=tctx||new (window.AudioContext||window.webkitAudioContext)();const o=tctx.createOscillator(),g=tctx.createGain();o.type="sine";o.frequency.value=ph==="in"?396:ph==="out"?264:330;g.gain.setValueAtTime(0,tctx.currentTime);g.gain.linearRampToValueAtTime(.05,tctx.currentTime+.08);g.gain.exponentialRampToValueAtTime(.0001,tctx.currentTime+1.4);o.connect(g).connect(tctx.destination);o.start();o.stop(tctx.currentTime+1.5)}catch(e){}}
function wimStep(ph){
  BS.ph=ph;const L=$g("br-l"),Sx=$g("br-s"),tap=$g("br-tap");tap.hidden=ph!=="ret";
  if(ph==="pump"){BS.cnt=0;BS.round++;Sx.textContent=`Runda ${BS.round} din 3`;wimPump()}
  if(ph==="ret"){BS.retT=Date.now();L.textContent="Expiră și ține";setOrb("out",1.2);Sx.textContent=`Runda ${BS.round} · atinge „Gata” când ai nevoie de aer`}
  if(ph==="rec"){L.textContent="Inspiră adânc și ține";setOrb("in",1.5);BS.stepEnd=Date.now()+16500}
}
function wimPump(){
  if(!BS||BS.ph!=="pump")return;
  BS.cnt++;$g("br-l").textContent=`Respiră adânc · ${BS.cnt}/30`;setOrb("in",1.5);
  setTimeout(()=>{if(BS&&BS.ph==="pump"){setOrb("out",1.3);setTimeout(()=>{if(!BS||BS.ph!=="pump")return;if(BS.cnt>=30)wimStep("ret");else wimPump()},1350)}},1550);
}
function brTick(){
  if(!BS)return;const now=Date.now(),c=$g("br-c");
  if(BS.ph==="prep"){c.textContent=Math.ceil((BS.stepEnd-now)/1000);if(now>=BS.stepEnd){if(BS.p.wim)wimStep("pump");else{BS.ph="run";brNext()}}return}
  if(BS.p.wim){
    if(BS.ph==="ret")c.textContent=Math.floor((now-BS.retT)/1000)+"s";
    else if(BS.ph==="rec"){const l=Math.ceil((BS.stepEnd-now)/1000);c.textContent=Math.max(0,l);if(now>=BS.stepEnd){$g("br-l").textContent="Expiră";setOrb("out",2);if(BS.round>=3)brClose(true);else{BS.ph="wait";setTimeout(()=>BS&&wimStep("pump"),2200)}}}
    else c.textContent="";
    return;
  }
  c.textContent=Math.max(1,Math.ceil((BS.stepEnd-now)/1000));
  const el=(now-BS.t0)/6e4;$g("br-s").textContent=`${BS.p.n} · ${Math.max(0,Math.ceil((BS.end-now)/6e4))} min rămase`;
  if(now>=BS.stepEnd){if(now>=BS.end&&BS.i%BS.p.st.length===BS.p.st.length-1){brClose(true);return}brNext()}
}
function brNext(){const st=BS.p.st;BS.i++;const [ph,s,l]=st[BS.i%st.length];BS.stepEnd=Date.now()+s*1000;$g("br-l").textContent=l;if(ph!=="hold")setOrb(ph,s);else{const o=BS.ov.querySelector(".brorb");o.dataset.ph="hold"}}
function brClose(done){
  if(!BS)return;clearInterval(BS.int);const b=BS,mins=(Date.now()-b.t0)/6e4;BS=null;
  b.ov.classList.remove("in");setTimeout(()=>b.ov.remove(),400);try{typeof unlockWake==="function"&&unlockWake()}catch(e){}
  if(done||mins>=2){const k=dk(),d=S.breath.days[k]=S.breath.days[k]||{n:0,min:0};d.n++;d.min+=mins;save();
    if(d.n<=2)award(`br:${k}:${d.n}`,10,"Respirație");try{bell(.3)}catch(e){}
    if(b.p.wim&&b.holds.length)toast("Retenții: "+b.holds.map(x=>Math.round(x)+" s").join(" · "));else toast("Sesiune încheiată 🌬️");}
  renderBreathCard();
}
document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest("#br-sec"))return;
  const p=t.closest("[data-br]");if(p){S.breath.pick=p.dataset.br;save();renderBreathCard();return}
  const m=t.closest("[data-brm]");if(m){S.breath.min=+m.dataset.brm;save();renderBreathCard();return}
  if(t.closest("#br-go"))brOpen();
});

// ── notițe din cărți (apar și în feed, ca citate) ──
const noteQ=n=>({k:"q",id:"nt_"+n.id,t:n.t,who:n.b||"Notițele tale",src:n.n?"p. "+n.n:"",c:"int",note:1});
try{if(typeof quotes!=="undefined")S.notes.forEach(n=>quotes.push(noteQ(n)))}catch(e){}
function saveNote(o){
  const n={id:uid(),t:o.t,b:o.b,bid:o.bid,n:o.n,d:Date.now()};S.notes.push(n);save();
  try{quotes.push(noteQ(n))}catch(e){}
  award(`note:${n.id}`,5,"Notiță salvată");toast("Salvat în notițe ❝");
}
function renderNotes(){
  const R=$g("notes-root");if(!R)return;const N=S.notes.slice().reverse();
  R.innerHTML=N.length?`<p class="note">${N.length} notițe · apar din când în când și în feed, ca citate.</p>${N.map(n=>`<article class="ncard" data-nt="${n.id}"><span class="nq">❝</span><p>${esc(n.t)}</p>
    <div class="nmeta"><b>${esc(n.b||"")}</b>${n.n?` · p. ${n.n}`:""} · ${new Date(n.d).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})}</div>
    <div class="nacts"><button data-na="copy">Copiază</button><button data-na="img">Imagine</button>${n.bid?`<button data-na="open">Deschide cartea</button>`:""}<button data-na="del" class="ndel">Șterge</button></div></article>`).join("")}`
  :`<div class="gempty big"><span>❝</span><b>Notițele tale din cărți</b>Deschide o carte în modul text (Aa), ține apăsat pe un cuvânt și trage ca să selectezi fraza, apoi apasă „Salvează în notițe”.</div>`;
}
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-na]");if(!b||!b.closest("#notes-root"))return;
  const id=b.closest("[data-nt]").dataset.nt,n=S.notes.find(x=>x.id===id);if(!n)return;
  if(b.dataset.na==="copy"){try{await navigator.clipboard.writeText(`„${n.t}” — ${n.b||""}`);toast("Copiat")}catch(_){toast("Nu am putut copia")}}
  if(b.dataset.na==="img"){try{await quoteImage(noteQ(n))}catch(_){toast("Nu am putut crea imaginea")}}
  if(b.dataset.na==="open"){const bk=(typeof BOOKS!=="undefined"?BOOKS:[]).find(x=>x.id===n.bid);if(bk){bk.pos={m:"page",n:n.n||1,f:0};openBook(n.bid)}else toast("Cartea nu mai e pe raft")}
  if(b.dataset.na==="del"&&confirm("Ștergi notița?")){S.notes=S.notes.filter(x=>x!==n);try{const i=quotes.findIndex(q=>q.id==="nt_"+n.id);if(i>=0)quotes.splice(i,1)}catch(_){}save();renderNotes()}
});

initNav();refresh();
window.Grow={award,revoke,confetti,renderAzi,renderNotes,saveNote,level,setSub,renderGoals};
})();
