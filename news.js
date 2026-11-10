// IMPERIUM — Știri: titluri din surse credibile (RSS), adunate automat la ~20 de minute.
// Aici stau doar titlul, sursa, ora și un rezumat scurt; articolul se deschide la sursă.
(function(){
const CK="imp-news",RK="imp-news-read";
const CATS=[["imp","Important"],["all","Toate"],["cry","Crypto"],["eco","Economie"],["lum","Lume"],["de","Germania"],["ro","România"],["auto","Auto"]];
const CNAME={cry:"Crypto",eco:"Economie",lum:"Lume",de:"Germania",ro:"România",auto:"Auto"};
const e=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
let DATA=null,loading=false,box=null,lastTry=0;
let read=new Set();try{read=new Set(JSON.parse(localStorage.getItem(RK)||"[]"))}catch(_){}
try{DATA=JSON.parse(localStorage.getItem(CK)||"null")}catch(_){DATA=null}
const filt=()=>CATS.some(c=>c[0]===S.newsF)?S.newsF:"imp";

// știrile stau pe ramura „news-data” a aceluiași depozit GitHub (se rescrie la fiecare actualizare)
function urls(){
  const gh=/\.github\.io$/.test(location.hostname),owner=gh?location.hostname.split(".")[0]:"hasanhamzet77-hub",repo=gh?(location.pathname.split("/")[1]||"Htube"):"Htube";
  const t=Math.floor(Date.now()/12e4);
  return [`https://raw.githubusercontent.com/${owner}/${repo}/news-data/news.json?t=${t}`,`news.json?t=${t}`];
}
async function load(user){
  if(loading)return;loading=true;lastTry=Date.now();
  const r=document.getElementById("refresh");if(user&&r)r.classList.add("spin");
  let ok=false;
  for(const u of urls()){
    try{const res=await fetch(u,{cache:"no-store"});if(!res.ok)continue;const d=await res.json();
      if(d&&Array.isArray(d.items)&&d.items.length){DATA=d;ok=true;try{localStorage.setItem(CK,JSON.stringify({updated:d.updated,items:d.items.slice(0,260)}))}catch(_){}break}}catch(_){}
  }
  loading=false;if(r)r.classList.remove("spin");
  if(user)toast(ok?"Știri actualizate":"Fără internet. Arăt ce am.");
  if(box&&box.isConnected)draw();
  return ok;
}
const when=iso=>{const d=new Date(iso),m=Math.round((Date.now()-d)/6e4);
  if(m<1)return "acum";if(m<60)return m+" min";if(m<60*6)return Math.floor(m/60)+" h";
  return d.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"})};
const dayOf=iso=>{const d=new Date(iso),t=new Date(),y=new Date(Date.now()-864e5),k=x=>x.toDateString();
  return k(d)===k(t)?"Azi":k(d)===k(y)?"Ieri":d.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long"})};
function list(){
  const f=filt(),all=(DATA&&DATA.items)||[];
  if(f==="imp")return all.filter(x=>x.i>=2).slice(0,60);
  if(f==="all")return all.slice(0,150);
  return all.filter(x=>x.c===f).slice(0,90);
}
function draw(){
  if(!box)return;const f=filt(),L=list();
  const chips=`<div class="nchips" role="toolbar" aria-label="Filtre știri">${CATS.map(([k,l])=>`<button class="nchip" data-nf="${k}" aria-pressed="${k===f}">${l}</button>`).join("")}</div>`;
  if(!DATA){box.innerHTML=chips+`<div class="nskel">${"<i></i>".repeat(6)}</div>`;return}
  const upd=DATA.updated?`<p class="nupd"><span class="dot"></span>actualizat acum ${when(DATA.updated).replace(/^acum$/,"câteva clipe")}${window.Sage&&Sage.hasKey()&&L.length>4?`<button class="nsum" id="n-sum">✦ Rezumat în română</button>`:""}</p>`:"";
  let day="",i=0;
  const rows=L.map(x=>{const dd=dayOf(x.d),hd=dd!==day?`<h4 class="nday">${dd}</h4>`:"";day=dd;
    return hd+`<a class="nrow${read.has(x.id)?" read":""}${x.i>=3?" hot":""}" href="${e(x.u)}" target="_blank" rel="noopener" data-nid="${x.id}" style="--i:${Math.min(i++,10)}">
      <div class="nmeta2"><b class="nsrc c-${x.c}">${e(x.s)}</b><span>${when(x.d)}</span>${f==="imp"||f==="all"?`<span class="ncat">${CNAME[x.c]||""}</span>`:""}</div>
      <h3>${e(x.t)}</h3>${x.x?`<p>${e(x.x)}</p>`:""}</a>`}).join("");
  box.innerHTML=chips+upd+`<div id="n-sumbox"></div>`+(rows?`<div class="nlist">${rows}</div>`:`<div class="empty">${f==="imp"?"Nimic marcat ca important în ultimele ore. Vezi „Toate”.":"Nimic aici în ultimele zile."}</div>`)
    +`<p class="nfoot">Titlurile vin direct de la surse. Apasă pe o știre ca s-o citești acolo.</p>`;
}
function show(el){
  box=el;draw();
  const stale=!DATA||!DATA.updated||Date.now()-new Date(DATA.updated)>12*6e4;
  if(stale&&Date.now()-lastTry>6e4)load(false);
}
// rezumat cu Înțeleptul (doar dacă ai pus cheia AI): primește titlurile, răspunde pe scurt în română
async function summary(){
  const out=document.getElementById("n-sumbox"),L=list().slice(0,40);if(!out||!L.length)return;
  out.innerHTML=`<div class="nsumcard"><div class="dx-load"><i></i><i></i><i></i></div></div>`;
  try{
    const txt=await Sage.complete(
      "Ești un redactor de știri calm și precis. Primești o listă de titluri (cu sursa și ora). Scrie în română un rezumat scurt: 4–7 puncte, fiecare o propoziție clară, cele mai importante primele; grupează titlurile care spun același lucru și menționează sursa în paranteză. Nu inventa nimic peste ce spun titlurile, nu da sfaturi de investiții și nu specula. La final, o singură propoziție: «De urmărit:» cu ce merită urmărit mai departe.",
      L.map(x=>`- [${x.s}, ${new Date(x.d).toLocaleString("ro-RO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}] ${x.t}`).join("\n"),700);
    out.innerHTML=`<div class="nsumcard"><small>✦ Rezumat făcut de AI din titluri · verifică la sursă</small>${Sage.md(txt)}</div>`;
  }catch(err){out.innerHTML=`<div class="nsumcard err">${e(err.message||"Nu am putut face rezumatul.")}</div>`}
}
document.addEventListener("click",ev=>{
  const c=ev.target.closest("[data-nf]");
  if(c){S.newsF=c.dataset.nf;save();draw();const a=box&&box.querySelector(".nchip[aria-pressed=true]");a&&a.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"});return}
  if(ev.target.closest("#n-sum")){summary();return}
  const r=ev.target.closest(".nrow");
  if(r){read.add(r.dataset.nid);r.classList.add("read");try{localStorage.setItem(RK,JSON.stringify([...read].slice(-600)))}catch(_){}}
});
// când revii în aplicație pe pagina de știri, se împrospătează singură
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&box&&box.isConnected&&box.querySelector(".nchips")&&Date.now()-lastTry>5*6e4)load(false)});
window.News={show,load,top:n=>((DATA&&DATA.items)||[]).filter(x=>x.i>=2).slice(0,n||3),hide(){box=null}};
})();
