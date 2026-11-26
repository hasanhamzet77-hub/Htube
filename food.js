// IMPERIUM — Mâncare: jurnal de calorii. Adaugi din listă (cu porții), din „recente” cu o atingere, sau manual.
// Valorile din listă sunt medii orientative la 100 g (sau 100 ml). Totul rămâne pe telefon (S.food).
(function(){
const $f=id=>document.getElementById(id);
const e=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const st=()=>{S.food=S.food||{};const F=S.food;F.log=F.log||{};F.rec=F.rec||[];return F};
const r0=x=>Math.round(+x||0);
const fmt=x=>r0(x).toLocaleString("ro-RO");
const MEALS=[["md","Mic dejun","☀️"],["pr","Prânz","🥗"],["gu","Gustare","🍎"],["ci","Cină","🍽️"]];
const mealNow=()=>{const h=new Date().getHours()+new Date().getMinutes()/60;return h<10.5?"md":h<15?"pr":h<17.5?"gu":"ci"};
const fold=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ß/g,"ss");

// ── lista de alimente: [nume, kcal, proteine, carbohidrați, grăsimi la 100 g/ml, porții [[etichetă, grame]], cuvinte de căutare]
const DB=[
 ["Piept de pui (gătit)",165,31,0,3.6,[["porție",200],["jumătate",100]],"chicken hähnchen pui"],
 ["Pulpă de pui dezosată (gătită)",210,26,0,11,[["porție",200]],"chicken thigh hähnchenschenkel"],
 ["Șnițel pané",260,18,14,15,[["1 bucată",180]],"schnitzel paniert"],
 ["Vită friptă / steak",217,26,0,12,[["porție",200],["steak mare",300]],"beef rind steak vita"],
 ["Carne tocată de vită (gătită)",250,26,0,17,[["porție",150]],"hackfleisch tocata"],
 ["Ceafă de porc (gătită)",260,24,0,18,[["porție",200]],"pork nacken porc"],
 ["Cotlet de porc (gătit)",230,30,0,12,[["porție",200]],"pork kotelett"],
 ["Mici",280,16,1,24,[["1 bucată",50],["5 bucăți",250]],"mititei"],
 ["Cârnați / Bratwurst",300,13,2,27,[["1 bucată",100]],"wurst bratwurst carnati"],
 ["Șuncă / Kochschinken",110,19,1,3,[["2 felii",40]],"schinken sunca"],
 ["Somon (gătit)",206,22,0,13,[["porție",180]],"lachs salmon"],
 ["Ton în apă (conservă)",116,26,0,1,[["1 conservă",150]],"thunfisch tuna"],
 ["Ou fiert",155,13,1,11,[["1 ou",55],["2 ouă",110],["3 ouă",165]],"ei egg oua"],
 ["Ochiuri / omletă (cu ulei)",196,13,1,15,[["2 ouă",120],["3 ouă",180]],"spiegelei omelette"],
 ["Orez fiert",130,2.7,28,0.3,[["porție",200],["porție mare",300]],"reis rice"],
 ["Cartofi fierți / copți",87,1.9,20,0.1,[["porție",250]],"kartoffeln potatoes"],
 ["Cartofi prăjiți",312,3.4,41,15,[["porție mică",100],["porție",150]],"pommes fries"],
 ["Piure de cartofi",100,2,15,3.5,[["porție",250]],"kartoffelpüree"],
 ["Paste fierte",158,5.8,31,0.9,[["porție",250]],"nudeln pasta"],
 ["Legume mixte (gătite)",60,3,9,0.5,[["porție",200]],"gemüse vegetables legume"],
 ["Salată verde, roșii, castraveți",20,1,3,0.2,[["bol",150]],"salat salad"],
 ["Salată to-go (Lidl, cu pui/ou + dressing)",100,6,6,6,[["1 bol",350]],"salat to go lidl salata"],
 ["Linte / fasole (fiartă)",116,9,20,0.4,[["porție",200]],"linsen bohnen fasole"],
 ["Avocado",160,2,9,15,[["jumătate",80]],"avocado"],
 ["Pâine albă",265,9,49,3.2,[["1 felie",40],["2 felii",80]],"brot weißbrot paine"],
 ["Pâine integrală",247,13,41,3.4,[["1 felie",45],["2 felii",90]],"vollkornbrot paine"],
 ["Chiflă / Brötchen",270,9,52,2,[["1 bucată",60]],"brötchen semmel chifla"],
 ["Sandviș (șuncă și brânză)",250,12,30,9,[["1 bucată",130]],"belegtes brötchen sandwich"],
 ["Croissant",406,8,45,21,[["1 bucată",60]],"croissant"],
 ["Covrig / Brezel",290,9,57,3,[["1 bucată",85]],"brezel laugenbrezel covrig"],
 ["Franzbrötchen / patiserie",380,7,50,17,[["1 bucată",90]],"franzbrötchen gebäck patiserie"],
 ["Gogoașă / Berliner",350,6,48,15,[["1 bucată",80]],"berliner krapfen gogoasa"],
 ["Döner / shaorma",190,11,18,8,[["1 bucată",400]],"döner kebab shaorma wrap"],
 ["Pizza",270,11,33,10,[["1 felie",110],["întreagă",400]],"pizza"],
 ["Burger fast-food",250,13,25,11,[["1 bucată",220]],"burger"],
 ["Ciorbă / supă",50,3,5,2,[["1 castron",350]],"suppe soup ciorba"],
 ["Shake proteic (pudră)",380,78,8,6,[["1 măsură",30],["2 măsuri",60]],"protein shake whey"],
 ["Baton proteic",350,33,35,10,[["1 bucată",60]],"proteinriegel protein bar"],
 ["Băutură-masă (yfood / Milbona)",100,6.8,9,4.2,[["1 sticlă 500 ml",500]],"yfood milbona tasty food bottle"],
 ["Lapte 1,5%",47,3.4,4.8,1.5,[["1 pahar 250 ml",250]],"milch milk lapte"],
 ["Lapte 3,5%",64,3.3,4.8,3.5,[["1 pahar 250 ml",250]],"milch milk lapte"],
 ["Skyr",63,11,4,0.2,[["1 pahar",150],["1 cutie",450]],"skyr"],
 ["Brânză slabă / Magerquark",67,12,4,0.2,[["1 cutie",250]],"quark magerquark branza"],
 ["Iaurt grecesc 10%",122,4,4,10,[["1 pahar",150]],"griechischer joghurt yogurt iaurt"],
 ["Brânză Gouda / cașcaval",356,25,0,27,[["2 felii",40]],"käse gouda cascaval"],
 ["Mozzarella",254,18,1,19,[["1 bilă",125]],"mozzarella"],
 ["Telemea / feta",264,14,4,21,[["porție",50]],"feta schafskäse telemea"],
 ["Unt",717,0.9,0.1,81,[["1 linguriță",10]],"butter unt"],
 ["Ulei de măsline",884,0,0,100,[["1 lingură",10]],"olivenöl ulei"],
 ["Maioneză",680,1,1,75,[["1 lingură",15]],"mayo maioneza"],
 ["Ketchup",110,1,25,0.2,[["1 lingură",15]],"ketchup"],
 ["Fulgi de ovăz",372,13,59,7,[["porție",50]],"haferflocken oats ovaz"],
 ["Banană",89,1.1,23,0.3,[["1 bucată",120]],"banane banana"],
 ["Măr",52,0.3,14,0.2,[["1 bucată",180]],"apfel apple mar"],
 ["Nuci / migdale",620,18,12,55,[["o mână",30]],"nüsse mandeln nuts nuci"],
 ["Ciocolată",540,6,57,31,[["1 rând",25],["1 tabletă",100]],"schokolade chocolate ciocolata"],
 ["Chipsuri",536,6.6,53,34,[["o mână",30],["1 pungă",150]],"chips"],
 ["Biscuiți / prăjituri",480,6,65,22,[["3 bucăți",30],["1 bucată de prăjitură",100]],"kekse kuchen biscuiti"],
 ["Înghețată",207,3.5,24,11,[["2 cupe",100]],"eis icecream inghetata"],
 ["Cola / suc carbogazos",42,0,10.6,0,[["1 doză 330 ml",330],["0,5 l",500]],"cola fanta sprite"],
 ["Cola Zero / apă",0,0,0,0,[["0,5 l",500]],"zero light wasser apa"],
 ["Suc de portocale",45,0.7,10,0.2,[["1 pahar 250 ml",250]],"orangensaft juice"],
 ["Energizant (Red Bull)",45,0,11,0,[["1 doză 250 ml",250]],"red bull energy"],
 ["Bere",43,0.5,3.6,0,[["0,5 l",500]],"bier beer"],
 ["Cafea neagră",2,0.1,0,0,[["1 cană",200]],"kaffee coffee cafea"],
 ["Cappuccino / cafea cu lapte",38,2,3.5,2,[["1 cană",200]],"cappuccino latte milchkaffee"],
 ["Zahăr",400,0,100,0,[["1 linguriță",5]],"zucker sugar zahar"]
].map(([n,k,p,c,f,u,w],i)=>({id:"d"+i,n,k,p,c,f,u,w:fold(n+" "+w)}));

// ── calcule ──
const day=d=>st().log[d]||[];
const sumOf=L=>L.reduce((a,x)=>({k:a.k+(+x.k||0),p:a.p+(+x.p||0),c:a.c+(+x.c||0),f:a.f+(+x.f||0)}),{k:0,p:0,c:0,f:0});
function goal(){
  const F=st(),c=window.Health&&Health.calc?Health.calc():null;
  return {k:+F.goal||(c?Math.round(c.target/10)*10:2300),p:+F.pgoal||(c?Math.round(c.prot/5)*5:Math.round(((S.body&&S.body.w&&S.body.w.length?S.body.w[S.body.w.length-1].kg:90))*1.8/5)*5),auto:!F.goal&&!!c};
}
const burnt=d=>{try{const x=S.watch&&S.watch.d&&S.watch.d[d];return x&&x.e?+x.e:0}catch(_){return 0}};
const shiftDay=(d,n)=>{const x=new Date(d+"T12:00");x.setDate(x.getDate()+n);return dk(x)};
const dayName=d=>d===dk()?"Azi":d===shiftDay(dk(),-1)?"Ieri":new Date(d+"T12:00").toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"short"});
function ring(k,g,size){
  const p=Math.min(1,g?k/g:0),over=k>g*1.05,R=size/2-6,C=2*Math.PI*R;
  return `<svg class="fd-ring${over?" over":""}" viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px"><circle cx="${size/2}" cy="${size/2}" r="${R}" class="rb"/><circle cx="${size/2}" cy="${size/2}" r="${R}" class="rf" style="stroke-dasharray:${(p*C).toFixed(1)} ${C.toFixed(1)}"/></svg>`;
}

// ── cardul de pe Azi ──
function card(){
  const el=$f("az-food");if(!el)return;
  const t=dk(),L=day(t),s=sumOf(L),G=goal(),left=G.k-s.k;
  const last=L.slice(-2).map(x=>x.n).join(", ");
  el.innerHTML=`<div class="fdcard"><button class="fd-open" id="fd-open" aria-label="Jurnalul de mâncare">
      <span class="fd-rw">${ring(s.k,G.k,62)}<b>${fmt(s.k)}</b></span>
      <span class="fd-ct"><small>Mâncare azi</small><b>${s.k?left>=0?`mai ai ${fmt(left)} kcal`:`+${fmt(-left)} kcal peste țintă`:`țintă ${fmt(G.k)} kcal`}</b>
        <span class="fd-pb"><i style="width:${Math.min(100,s.p/G.p*100).toFixed(0)}%"></i></span><em>Proteine ${fmt(s.p)} / ${fmt(G.p)} g${last?" · "+e(last):""}</em></span></button>
    <button class="fd-plus" id="fd-quick" aria-label="Adaugă ce ai mâncat"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div>`;
}

// ── pagina jurnalului ──
let page=null,cur=null;
function ensure(){
  if(page)return page;
  page=document.createElement("section");page.id="fdpage";page.hidden=true;
  page.innerHTML=`<header class="fd-bar"><button class="sg-ic" id="fd-back" aria-label="Înapoi"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
     <button class="sg-ic" id="fd-prev" aria-label="Ziua de dinainte"><svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6"/></svg></button>
     <div class="fd-tt"><b id="fd-day"></b><small>Mâncare</small></div>
     <button class="sg-ic" id="fd-next" aria-label="Ziua următoare"><svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg></button>
     <button class="sg-ic" id="fd-set" aria-label="Ținta"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg></button></header>
    <div class="fd-body" id="fd-body"></div>
    <button class="fd-fab" id="fd-add"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Adaugă</button>`;
  document.body.appendChild(page);
  $f("fd-back").onclick=close;
  $f("fd-prev").onclick=()=>{cur=shiftDay(cur,-1);draw()};
  $f("fd-next").onclick=()=>{if(cur<dk()){cur=shiftDay(cur,1);draw()}};
  $f("fd-set").onclick=goalSheet;
  $f("fd-add").onclick=()=>addSheet(cur);
  $f("fd-body").addEventListener("click",ev=>{
    const d=ev.target.closest("[data-fdel]");
    if(d){const F=st(),L=day(cur),i=L.findIndex(x=>x.id===d.dataset.fdel);if(i<0)return;const [x]=L.splice(i,1);
      if(!L.length)delete F.log[cur];save();draw();card();
      toastUndo(`Șters: ${x.n}`,()=>{(F.log[cur]=F.log[cur]||[]).splice(i,0,x);save();draw();card()});return}
    const m=ev.target.closest("[data-fmeal]");if(m){addSheet(cur,m.dataset.fmeal);return}
    const w=ev.target.closest("[data-fday]");if(w){cur=w.dataset.fday;draw()}
  });
  return page;
}
function toastUndo(msg,undo){
  let t=document.querySelector(".fd-undo");if(t)t.remove();
  t=document.createElement("div");t.className="fd-undo";t.innerHTML=`<span>${e(msg)}</span><button>Anulează</button>`;
  document.body.appendChild(t);const kill=()=>{t.classList.add("out");setTimeout(()=>t.remove(),300)};
  t.querySelector("button").onclick=()=>{undo();kill()};setTimeout(kill,4500);
}
function week(){
  const G=goal(),D=[...Array(7)].map((_,i)=>shiftDay(cur,i-6)),V=D.map(d=>sumOf(day(d)).k),mx=Math.max(G.k*1.25,...V,1);
  const done=V.filter(v=>v>0),avg=done.length?done.reduce((a,b)=>a+b,0)/done.length:0;
  return `<div class="fd-week"><div class="fd-wh"><span>Ultimele 7 zile</span><b>${done.length?`media ${fmt(avg)} kcal`:"nimic notat"}</b></div>
    <div class="fd-bars"><i class="fd-gl" style="bottom:${(G.k/mx*100).toFixed(1)}%"></i>${D.map((d,i)=>`<button data-fday="${d}" class="${d===cur?"on":""}${V[i]>G.k*1.05?" over":""}"><span style="height:${(V[i]/mx*100).toFixed(1)}%"></span><small>${new Date(d+"T12:00").toLocaleDateString("ro-RO",{weekday:"narrow"})}</small></button>`).join("")}</div></div>`;
}
function draw(){
  const L=day(cur),s=sumOf(L),G=goal(),left=G.k-s.k,b=burnt(cur);
  $f("fd-day").textContent=dayName(cur);$f("fd-next").disabled=cur>=dk();
  const groups=MEALS.map(([k,l,ic])=>{const M=L.filter(x=>(x.m||"ci")===k),ms=sumOf(M);
    return `<div class="fd-meal"><div class="fd-mh"><span>${ic} ${l}</span><b>${M.length?fmt(ms.k)+" kcal":""}</b><button data-fmeal="${k}" aria-label="Adaugă la ${l}">＋</button></div>
      ${M.map(x=>`<div class="fd-it"><div><b>${e(x.n)}</b><small>${x.g?fmt(x.g)+(x.ml?" ml":" g")+" · ":""}P ${fmt(x.p)} g</small></div><span>${fmt(x.k)}</span><button data-fdel="${x.id}" aria-label="Șterge"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`).join("")}</div>`}).join("");
  $f("fd-body").innerHTML=`<div class="fd-top"><span class="fd-rw lg">${ring(s.k,G.k,132)}<span><b>${fmt(s.k)}</b><small>din ${fmt(G.k)} kcal</small></span></span>
      <div class="fd-left"><b class="${left<0?"bad":""}">${left>=0?fmt(left):"+"+fmt(-left)}</b><small>${left>=0?"kcal rămase":"kcal peste țintă"}</small>${b?`<em>🔥 ${fmt(b)} kcal arse activ (ceas)</em>`:""}</div></div>
    <div class="fd-mac">${[["Proteine",s.p,G.p,"p"],["Carbohidrați",s.c,0,"c"],["Grăsimi",s.f,0,"f"]].map(([l,v,g,c])=>`<div class="m-${c}"><small>${l}</small><b>${fmt(v)} g</b>${g?`<span><i style="width:${Math.min(100,v/g*100).toFixed(0)}%"></i></span><em>din ${fmt(g)} g</em>`:""}</div>`).join("")}</div>
    ${groups}${week()}
    <p class="fd-note">Valorile din listă sunt medii orientative. Pentru un produs anume, cifrele de pe etichetă sunt cele corecte.</p>`;
}
function open(d){ensure();cur=d||dk();page.hidden=false;requestAnimationFrame(()=>page.classList.add("in"));draw()}
function close(){if(!page)return;page.classList.remove("in");setTimeout(()=>{page.hidden=true},300);card()}

// ── adăugarea: caută → alege porția → Adaugă ──
function add(d,item){
  const F=st();(F.log[d]=F.log[d]||[]).push(item);
  const key=fold(item.n);F.rec=[{n:item.n,k:item.k,p:item.p,c:item.c,f:item.f,g:item.g,ml:item.ml,src:item.src,per:item.per},...F.rec.filter(x=>fold(x.n)!==key)].slice(0,30);
  save();card();if(page&&!page.hidden&&cur===d)draw();
  if(d===dk()&&window.Grow)Grow.award(`food:${d}`,5,"Ai notat ce ai mâncat");
  if(navigator.vibrate)navigator.vibrate(10);
}
const scaled=(x,g)=>({k:x.k*g/100,p:x.p*g/100,c:x.c*g/100,f:x.f*g/100});
function addSheet(d,meal){
  d=d||dk();let M=meal||(d===dk()?mealNow():"ci"),view="list",pick=null,q="",online=null;
  const m=document.createElement("div");m.className="gsheet fdsheet";
  m.innerHTML=`<div class="gs-card"><i class="gs-grab"></i><div id="fa-box"></div></div>`;
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"));
  const box=m.querySelector("#fa-box");
  const shut=()=>{m.classList.remove("in");setTimeout(()=>m.remove(),330)};
  const meals=()=>`<div class="fa-meals">${MEALS.map(([k,l])=>`<button data-am="${k}" aria-pressed="${k===M}">${l}</button>`).join("")}</div>`;
  const res=()=>{
    const F=st(),f=fold(q).trim(),R=F.rec.filter(x=>!f||fold(x.n).includes(f)),D=f?DB.filter(x=>f.split(/\s+/).every(w=>x.w.includes(w))).slice(0,20):[];
    let h="";
    if(R.length)h+=`<div class="fa-h">${f?"Din ce ai mai notat":"Recente · o atingere pe ＋ adaugă la fel"}</div>`+R.slice(0,f?6:12).map((x,i)=>`<div class="fa-r"><button class="fa-pick" data-rec="${F.rec.indexOf(x)}"><b>${e(x.n)}</b><small>${x.g?fmt(x.g)+(x.ml?" ml":" g")+" · ":""}${fmt(x.k)} kcal · P ${fmt(x.p)} g</small></button><button class="fa-q" data-recq="${F.rec.indexOf(x)}" aria-label="Adaugă la fel">＋</button></div>`).join("");
    if(D.length)h+=`<div class="fa-h">Din listă</div>`+D.map(x=>`<div class="fa-r"><button class="fa-pick" data-db="${x.id}"><b>${e(x.n)}</b><small>${x.u[0][0]} (${x.u[0][1]} ${/ml|sticlă|pahar|doză|0,5 l|cană/.test(x.u[0][0])?"ml":"g"}) · ${fmt(x.k*x.u[0][1]/100)} kcal</small></button></div>`).join("");
    if(!f&&!R.length)h+=`<div class="fa-h">Des folosite</div>`+["Piept de pui (gătit)","Orez fiert","Ou fiert","Shake proteic (pudră)","Salată to-go (Lidl, cu pui/ou + dressing)","Skyr","Cartofi fierți / copți","Legume mixte (gătite)"].map(n=>DB.find(x=>x.n===n)).map(x=>`<div class="fa-r"><button class="fa-pick" data-db="${x.id}"><b>${e(x.n)}</b><small>${x.u[0][0]} · ${fmt(x.k*x.u[0][1]/100)} kcal</small></button></div>`).join("");
    if(f){
      if(online&&online.q===q)h+=online.err?`<p class="fa-msg">${e(online.err)}</p>`:online.list?(online.list.length?`<div class="fa-h">Produse din magazin (Open Food Facts)</div>`+online.list.map((x,i)=>`<div class="fa-r"><button class="fa-pick" data-on="${i}"><b>${e(x.n)}</b><small>${e(x.b||"")}${x.b?" · ":""}${fmt(x.k)} kcal / 100 ${x.ml?"ml":"g"} · P ${fmt(x.p)} g</small></button></div>`).join(""):`<p class="fa-msg">Nu am găsit produse pentru „${e(q)}”.</p>`):`<p class="fa-msg">Caut…</p>`;
      else h+=`<button class="fa-on" id="fa-online">Caută „${e(q)}” în magazine (Lidl, Aldi, Rewe…)</button>`;
      h+=`<button class="fa-man" id="fa-man">Scriu eu caloriile pentru „${e(q)}”</button>`;
    }
    return h||`<p class="fa-msg">Scrie ce ai mâncat.</p>`;
  };
  const drawList=()=>{
    box.innerHTML=`<div class="fa-hd"><h3>Ce ai mâncat?</h3><small>${dayName(d)}</small></div>${meals()}
      <div class="fa-sr"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg><input id="fa-q" placeholder="ex. pui, orez, skyr, döner…" value="${e(q)}" autocomplete="off" autocorrect="off" enterkeyhint="search"></div>
      <div id="fa-res">${res()}</div>`;
    const inp=box.querySelector("#fa-q");inp.addEventListener("input",()=>{q=inp.value;box.querySelector("#fa-res").innerHTML=res()});
    inp.addEventListener("keydown",ev=>{if(ev.key==="Enter"){ev.preventDefault();inp.blur()}});
    if(!q)setTimeout(()=>inp.focus({preventScroll:true}),250);
  };
  const drawPick=()=>{
    const x=pick,ml=x.ml,u=x.u||[],g=pick.g;const v=scaled(x,g||0);
    box.innerHTML=`<div class="fa-hd"><button class="sg-ic" id="fa-back" aria-label="Înapoi"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><div><h3>${e(x.n)}</h3><small>${fmt(x.k)} kcal la 100 ${ml?"ml":"g"}${x.b?" · "+e(x.b):""}</small></div></div>${meals()}
      ${u.length?`<div class="fa-units">${u.map(([l,gr])=>`<button data-ug="${gr}" aria-pressed="${+g===+gr}">${l}<small>${gr} ${ml?"ml":"g"}</small></button>`).join("")}</div>`:""}
      <label class="fa-gr"><span>Cantitate</span><span class="fa-stp"><button data-st="-1" aria-label="Mai puțin">−</button><input id="fa-g" inputmode="decimal" value="${g||""}" placeholder="0"><em>${ml?"ml":"g"}</em><button data-st="1" aria-label="Mai mult">＋</button></span></label>
      <div class="fa-sum"><div><b id="fa-k">${fmt(v.k)}</b><small>kcal</small></div><div><b id="fa-p">${fmt(v.p)}</b><small>proteine g</small></div><div><b id="fa-c">${fmt(v.c)}</b><small>carbo g</small></div><div><b id="fa-f">${fmt(v.f)}</b><small>grăsimi g</small></div></div>
      <button class="btn fa-go" id="fa-go">Adaugă la ${MEALS.find(z=>z[0]===M)[1].toLowerCase()}</button>`;
    const gi=box.querySelector("#fa-g");
    const upd=()=>{const gg=Math.max(0,parseFloat(String(gi.value).replace(",","."))||0);pick.g=gg;const s=scaled(x,gg);["k","p","c","f"].forEach(k=>box.querySelector("#fa-"+k).textContent=fmt(s[k]));box.querySelectorAll("[data-ug]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.ug===gg))};
    gi.addEventListener("input",upd);
  };
  const drawMan=()=>{
    box.innerHTML=`<div class="fa-hd"><button class="sg-ic" id="fa-back" aria-label="Înapoi"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><div><h3>Notează manual</h3><small>de pe etichetă sau din aplicația magazinului</small></div></div>${meals()}
      <div class="fa-mf"><label>Ce ai mâncat<input id="fm-n" value="${e(q)}" maxlength="70"></label>
      <div class="fa-m2"><label>Calorii<input id="fm-k" inputmode="numeric" placeholder="kcal"></label><label>Proteine (opțional)<input id="fm-p" inputmode="decimal" placeholder="g"></label></div></div>
      <button class="btn fa-go" id="fa-mgo">Adaugă</button>`;
    setTimeout(()=>box.querySelector(q?"#fm-k":"#fm-n").focus({preventScroll:true}),200);
  };
  const go=()=>view==="list"?drawList():view==="pick"?drawPick():drawMan();
  const toPick=(x,g)=>{pick={...x,g:g||(x.u&&x.u[0]?x.u[0][1]:100)};view="pick";go()};
  async function searchOnline(){
    const qq=q;online={q:qq};box.querySelector("#fa-res").innerHTML=res();
    try{
      const u=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(qq)}&search_simple=1&action=process&json=1&page_size=15&sort_by=unique_scans_n&fields=product_name,product_name_de,brands,nutriments,serving_quantity,quantity`;
      const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),12000);
      const r=await fetch(u,{signal:ctrl.signal});clearTimeout(tm);if(!r.ok)throw new Error(r.status);
      const j=await r.json();
      const list=(j.products||[]).map(p=>{const n=p.nutriments||{},k=+n["energy-kcal_100g"]||(+n["energy_100g"]?+n["energy_100g"]/4.184:0);
        const ml=/ml|\bl\b|liter/i.test(p.quantity||"");
        return {n:(p.product_name_de||p.product_name||"").trim(),b:(p.brands||"").split(",")[0].trim(),k,p:+n.proteins_100g||0,c:+n.carbohydrates_100g||0,f:+n.fat_100g||0,ml,
          u:+p.serving_quantity>0?[["1 porție",Math.round(+p.serving_quantity)],["100 "+(ml?"ml":"g"),100]]:[["100 "+(ml?"ml":"g"),100]],src:"off"}}).filter(x=>x.n&&x.k>0).slice(0,10);
      if(online.q===qq){online.list=list}
    }catch(err){if(online.q===qq)online.err=navigator.onLine===false?"Nu ai internet acum.":"Căutarea în magazine nu a mers acum. Încearcă din nou sau scrie caloriile manual."}
    if(view==="list"&&box.querySelector("#fa-res"))box.querySelector("#fa-res").innerHTML=res();
  }
  m.addEventListener("click",ev=>{
    if(ev.target===m){shut();return}
    const am=ev.target.closest("[data-am]");if(am){M=am.dataset.am;box.querySelectorAll("[data-am]").forEach(b=>b.setAttribute("aria-pressed",b===am));const g=box.querySelector("#fa-go");if(g)g.textContent=`Adaugă la ${MEALS.find(z=>z[0]===M)[1].toLowerCase()}`;return}
    const db=ev.target.closest("[data-db]");if(db){toPick(DB.find(x=>x.id===db.dataset.db));return}
    const on=ev.target.closest("[data-on]");if(on){toPick(online.list[+on.dataset.on]);return}
    const rc=ev.target.closest("[data-rec]");if(rc){const x=st().rec[+rc.dataset.rec];if(!x)return;
      if(x.per){toPick(x.per,x.g);return}
      view="man";q=x.n;go();box.querySelector("#fm-k").value=r0(x.k);if(x.p)box.querySelector("#fm-p").value=r0(x.p);return}
    const rq=ev.target.closest("[data-recq]");if(rq){const x=st().rec[+rq.dataset.recq];if(!x)return;
      add(d,{id:"f"+Date.now().toString(36),n:x.n,k:x.k,p:x.p,c:x.c,f:x.f,g:x.g,ml:x.ml,per:x.per,m:M,t:Date.now()});
      rq.textContent="✓";rq.disabled=true;toast(`${x.n} · ${fmt(x.k)} kcal adăugat`);return}
    if(ev.target.closest("#fa-online")){searchOnline();return}
    if(ev.target.closest("#fa-man")){view="man";go();return}
    if(ev.target.closest("#fa-back")){view="list";go();return}
    const ug=ev.target.closest("[data-ug]");if(ug){const gi=box.querySelector("#fa-g");gi.value=ug.dataset.ug;gi.dispatchEvent(new Event("input"));return}
    const sp=ev.target.closest("[data-st]");if(sp){const gi=box.querySelector("#fa-g"),v=parseFloat(String(gi.value).replace(",","."))||0,stp=v>=100?25:10;gi.value=Math.max(0,v+stp*+sp.dataset.st);gi.dispatchEvent(new Event("input"));return}
    if(ev.target.closest("#fa-go")){const x=pick,g=+x.g||0;if(!g){toast("Scrie cantitatea");return}const s=scaled(x,g);
      const per={n:x.n,k:x.k,p:x.p,c:x.c,f:x.f,u:x.u,ml:x.ml,b:x.b};
      add(d,{id:"f"+Date.now().toString(36),n:x.n,...s,g,ml:!!x.ml,per,m:M,t:Date.now()});toast(`${x.n} · ${fmt(s.k)} kcal adăugat`);shut();return}
    if(ev.target.closest("#fa-mgo")){const n=box.querySelector("#fm-n").value.trim(),k=parseFloat(box.querySelector("#fm-k").value.replace(",",".")),p=parseFloat(box.querySelector("#fm-p").value.replace(",","."))||0;
      if(!n){toast("Scrie ce ai mâncat");return}if(!(k>=0)){toast("Scrie caloriile");return}
      add(d,{id:"f"+Date.now().toString(36),n,k,p,c:0,f:0,m:M,t:Date.now()});toast(`${n} · ${fmt(k)} kcal adăugat`);shut();return}
  });
  let y0=null;m.addEventListener("touchstart",ev=>{const c=m.querySelector(".gs-card");if(c.scrollTop<=0&&!ev.target.closest("input"))y0=ev.touches[0].clientY},{passive:true});
  m.addEventListener("touchend",ev=>{if(y0!=null&&ev.changedTouches[0].clientY-y0>90)shut();y0=null},{passive:true});
  go();
}
function goalSheet(){
  const F=st(),c=window.Health&&Health.calc?Health.calc():null,G=goal();
  const m=document.createElement("div");m.className="gsheet fdsheet";
  m.innerHTML=`<div class="gs-card"><i class="gs-grab"></i><h3>Ținta zilnică</h3>
    <p class="note">${c?`Din profilul tău (Sport → Corp → Calorii): <b>${fmt(Math.round(c.target/10)*10)} kcal</b> și <b>${fmt(Math.round(c.prot/5)*5)} g proteine</b> pe zi, ${c.goal==="lose"?"pentru slăbire":c.goal==="gain"?"pentru masă":"pentru menținere"}.`:"Completează profilul în Sport → Corp → Calorii și ținta se calculează singură. Sau scrie-o tu aici."}</p>
    <div class="fa-m2"><label>Calorii pe zi<input id="fg-k" inputmode="numeric" value="${F.goal||""}" placeholder="${G.k}"></label><label>Proteine pe zi (g)<input id="fg-p" inputmode="numeric" value="${F.pgoal||""}" placeholder="${G.p}"></label></div>
    <p class="note">Lasă gol ca să folosești ținta calculată.</p><button class="btn" id="fg-ok">Salvează</button></div>`;
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"));
  const shut=()=>{m.classList.remove("in");setTimeout(()=>m.remove(),330)};
  m.addEventListener("click",ev=>{if(ev.target===m){shut();return}
    if(ev.target.closest("#fg-ok")){const k=parseInt(m.querySelector("#fg-k").value),p=parseInt(m.querySelector("#fg-p").value);
      F.goal=k>=800&&k<=6000?k:null;F.pgoal=p>=20&&p<=400?p:null;save();shut();if(page&&!page.hidden)draw();card();toast("Ținta salvată")}});
}
document.addEventListener("click",ev=>{
  if(ev.target.closest("#fd-quick")){addSheet(dk());return}
  if(ev.target.closest("#fd-open")||ev.target.closest("[data-food-open]")){open()}
});
window.Food={card,open,add:addSheet,today:()=>sumOf(day(dk()))};
})();
